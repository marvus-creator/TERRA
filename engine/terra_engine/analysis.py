import csv
from datetime import date
from pathlib import Path

from terra_engine import store
from terra_engine.fields import farms_bbox
from terra_engine.imagery import farm_mean_ndvi, read_scene_ndvi
from terra_engine.scoring import score_farm, season_features
from terra_engine.seasons import season_of
from terra_engine.stac import search_scenes

DATA_DIR = Path(__file__).resolve().parents[1] / "data"
HISTORY_CSV = DATA_DIR / "farm_ndvi_history.csv"
HISTORY_FIELDS = ["farm_id", "date", "season", "ndvi_mean", "pixels"]
HISTORY_START = "2024-07-01"


def read_history():
    if not HISTORY_CSV.exists():
        return []
    with open(HISTORY_CSV, newline="") as f:
        return list(csv.DictReader(f))


def write_history(rows):
    rows.sort(key=lambda r: (r["farm_id"], r["date"]))
    DATA_DIR.mkdir(exist_ok=True)
    with open(HISTORY_CSV, "w", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=HISTORY_FIELDS)
        writer.writeheader()
        writer.writerows(rows)


def build_rows(farm):
    bbox = farms_bbox([farm])
    date_range = f"{HISTORY_START}/{date.today().isoformat()}"
    scenes = search_scenes(bbox, date_range, max_cloud=40)
    best = {}
    for item in scenes:
        scene_date = item.datetime.date().isoformat()
        try:
            ndvi, transform, crs = read_scene_ndvi(item, bbox)
        except Exception:
            continue
        mean, pixels = farm_mean_ndvi(ndvi, transform, crs, farm["geometry"])
        if mean is None:
            continue
        if scene_date not in best or pixels > best[scene_date]["pixels"]:
            best[scene_date] = {
                "farm_id": farm["id"],
                "date": scene_date,
                "season": season_of(item.datetime.date()),
                "ndvi_mean": str(round(mean, 4)),
                "pixels": str(pixels),
            }
    return list(best.values())


def analyze_farm(farm_id):
    farm = store.get_farm(farm_id)
    if farm is None:
        return
    try:
        rows = build_rows(farm)
    except Exception:
        farm["status"] = "failed"
        store.upsert_farm(farm)
        return
    features = season_features(
        [{"season": r["season"], "ndvi_mean": float(r["ndvi_mean"])} for r in rows]
    )
    score = score_farm(features)
    farm["seasons"] = features
    farm["score"] = score
    farm["status"] = "scored" if score else "insufficient_data"
    store.upsert_farm(farm)
    others = [r for r in read_history() if r["farm_id"] != farm_id]
    write_history(others + rows)
