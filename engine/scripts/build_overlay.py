import json
from datetime import date
from pathlib import Path

import numpy as np
from PIL import Image
from rasterio.transform import array_bounds
from rasterio.warp import transform_bounds

from terra_engine import store
from terra_engine.fields import farms_bbox
from terra_engine.imagery import read_scene_ndvi
from terra_engine.stac import search_scenes

ROOT = Path(__file__).resolve().parents[1]
OUT_PNG = ROOT / "data" / "ndvi_overlay.png"
OUT_META = ROOT / "data" / "ndvi_overlay.json"

STOPS = [
    (0.00, (127, 29, 29)),
    (0.20, (239, 68, 68)),
    (0.35, (245, 158, 11)),
    (0.50, (163, 230, 53)),
    (0.65, (34, 197, 94)),
    (0.85, (21, 128, 61)),
]


def colorize(ndvi):
    xs = [s[0] for s in STOPS]
    filled = np.nan_to_num(ndvi, nan=0.0)
    channels = []
    for channel in range(3):
        ys = [s[1][channel] for s in STOPS]
        channels.append(np.interp(filled, xs, ys).astype("uint8"))
    alpha = np.where(np.isnan(ndvi), 0, 185).astype("uint8")
    return np.dstack(channels + [alpha])


def main():
    farms = store.list_farms()
    if not farms:
        raise SystemExit("no farms in store, run init_store.py first")
    bbox = farms_bbox(farms, pad=0.012)
    scenes = search_scenes(bbox, f"2026-01-01/{date.today().isoformat()}", max_cloud=15)
    if not scenes:
        raise SystemExit("no clear scenes found")
    item = scenes[-1]
    ndvi, transform, crs = read_scene_ndvi(item, bbox)
    rgba = colorize(ndvi)
    Image.fromarray(rgba, "RGBA").save(OUT_PNG)

    height, width = ndvi.shape
    west, south, east, north = array_bounds(height, width, transform)
    w4326, s4326, e4326, n4326 = transform_bounds(crs, "EPSG:4326", west, south, east, north)
    meta = {
        "bounds": [[s4326, w4326], [n4326, e4326]],
        "date": item.datetime.date().isoformat(),
        "cloud_cover": round(item.properties["eo:cloud_cover"], 1),
    }
    OUT_META.write_text(json.dumps(meta, indent=2), encoding="utf-8")
    print(f"overlay {width}x{height} from {meta['date']} ({meta['cloud_cover']}% cloud) -> {OUT_PNG}")


if __name__ == "__main__":
    main()
