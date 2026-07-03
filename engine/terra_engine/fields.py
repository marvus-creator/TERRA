import json
from pathlib import Path


def load_farms(path):
    data = json.loads(Path(path).read_text(encoding="utf-8"))
    farms = []
    for feature in data["features"]:
        farms.append(
            {
                "id": feature["properties"]["id"],
                "name": feature["properties"]["name"],
                "geometry": feature["geometry"],
            }
        )
    return farms


def farms_bbox(farms, pad=0.002):
    xs, ys = [], []
    for farm in farms:
        for ring in farm["geometry"]["coordinates"]:
            for x, y in ring:
                xs.append(x)
                ys.append(y)
    return (min(xs) - pad, min(ys) - pad, max(xs) + pad, max(ys) + pad)
