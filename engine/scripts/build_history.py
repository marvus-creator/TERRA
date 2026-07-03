import csv
from pathlib import Path

from terra_engine.fields import farms_bbox, load_farms
from terra_engine.imagery import farm_mean_ndvi, read_scene_ndvi
from terra_engine.seasons import season_of
from terra_engine.stac import search_scenes

ROOT = Path(__file__).resolve().parents[1]
FARMS_PATH = ROOT / "sample_farms.geojson"
OUT_CSV = ROOT / "data" / "farm_ndvi_history.csv"
DATE_RANGE = "2024-07-01/2026-06-30"


def main():
    farms = load_farms(FARMS_PATH)
    bbox = farms_bbox(farms)
    scenes = search_scenes(bbox, DATE_RANGE, max_cloud=40)
    print(f"{len(scenes)} candidate scenes")

    best = {}
    for index, item in enumerate(scenes, 1):
        date = item.datetime.date()
        try:
            ndvi, transform, crs = read_scene_ndvi(item, bbox)
        except Exception as exc:
            print(f"[{index}/{len(scenes)}] {date} skipped: {exc}")
            continue
        kept = 0
        for farm in farms:
            mean, pixels = farm_mean_ndvi(ndvi, transform, crs, farm["geometry"])
            if mean is None:
                continue
            key = (farm["id"], date.isoformat())
            if key not in best or pixels > best[key]["pixels"]:
                best[key] = {
                    "farm_id": farm["id"],
                    "date": date.isoformat(),
                    "season": season_of(date),
                    "ndvi_mean": round(mean, 4),
                    "pixels": pixels,
                }
                kept += 1
        print(f"[{index}/{len(scenes)}] {date} ok ({kept} farm readings)")

    rows = sorted(best.values(), key=lambda r: (r["farm_id"], r["date"]))
    OUT_CSV.parent.mkdir(exist_ok=True)
    with open(OUT_CSV, "w", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=["farm_id", "date", "season", "ndvi_mean", "pixels"])
        writer.writeheader()
        writer.writerows(rows)
    print(f"saved {len(rows)} readings -> {OUT_CSV}")


if __name__ == "__main__":
    main()
