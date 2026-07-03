import csv
import json
from pathlib import Path

from terra_engine.fields import load_farms
from terra_engine.scoring import score_farm, season_features

ROOT = Path(__file__).resolve().parents[1]
HISTORY_CSV = ROOT / "data" / "farm_ndvi_history.csv"
FARMS_PATH = ROOT / "sample_farms.geojson"
OUT_JSON = ROOT / "data" / "farm_scores.json"


def main():
    with open(HISTORY_CSV, newline="") as f:
        rows = list(csv.DictReader(f))

    result = {"farms": []}
    for farm in load_farms(FARMS_PATH):
        farm_rows = [r for r in rows if r["farm_id"] == farm["id"]]
        features = season_features(farm_rows)
        score = score_farm(features)
        result["farms"].append(
            {
                "id": farm["id"],
                "name": farm["name"],
                "geometry": farm["geometry"],
                "seasons": features,
                "score": score,
            }
        )
        label = score["terra_score"] if score else "insufficient data"
        print(f"{farm['id']}  {farm['name']}: TERRA score {label}")

    OUT_JSON.write_text(json.dumps(result, indent=2), encoding="utf-8")
    print(f"saved -> {OUT_JSON}")


if __name__ == "__main__":
    main()
