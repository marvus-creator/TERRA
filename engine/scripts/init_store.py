import json
from pathlib import Path

from terra_engine import store
from terra_engine.fields import load_farms

ROOT = Path(__file__).resolve().parents[1]
OWNERS = {
    "farm-001": "Josiane Mukamana",
    "farm-002": "Eric Nkurunziza",
    "farm-003": "Claudine Uwase",
}


def main():
    scores_path = ROOT / "data" / "farm_scores.json"
    by_id = {}
    if scores_path.exists():
        scored = json.loads(scores_path.read_text(encoding="utf-8"))
        by_id = {f["id"]: f for f in scored["farms"]}

    for farm in load_farms(ROOT / "sample_farms.geojson"):
        existing = by_id.get(farm["id"], {})
        score = existing.get("score")
        store.upsert_farm(
            {
                "id": farm["id"],
                "name": farm["name"],
                "owner": OWNERS.get(farm["id"], "Unknown"),
                "district": "Bugesera",
                "geometry": farm["geometry"],
                "registered": store.now_iso(),
                "seasons": existing.get("seasons", []),
                "score": score,
                "status": "scored" if score else "insufficient_data",
            }
        )
    print(f"{len(store.list_farms())} farms in store -> {store.STORE_PATH}")


if __name__ == "__main__":
    main()
