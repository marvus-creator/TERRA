import csv
import sys
from pathlib import Path

import numpy as np
import rasterio
from pystac_client import Client
from rasterio.warp import transform_bounds
from rasterio.windows import from_bounds

STAC_URL = "https://earth-search.aws.element84.com/v1"
COLLECTION = "sentinel-2-l2a"
AOI = (30.05, -2.25, 30.15, -2.15)
DATE_RANGE = "2026-01-01/2026-06-30"
MAX_CLOUD = 20
OUT_CSV = Path(__file__).resolve().parents[1] / "data" / "ndvi_bugesera.csv"


def read_band(href, bounds_wgs84):
    with rasterio.open(href) as src:
        bounds = transform_bounds("EPSG:4326", src.crs, *bounds_wgs84)
        window = from_bounds(*bounds, transform=src.transform)
        return src.read(1, window=window).astype("float32")


def main():
    client = Client.open(STAC_URL)
    search = client.search(
        collections=[COLLECTION],
        bbox=AOI,
        datetime=DATE_RANGE,
        query={"eo:cloud_cover": {"lt": MAX_CLOUD}},
        max_items=12,
    )
    items = sorted(search.items(), key=lambda i: i.datetime)
    if not items:
        sys.exit("no scenes found for AOI and date range")

    rows = []
    for item in items:
        red = read_band(item.assets["red"].href, AOI)
        nir = read_band(item.assets["nir"].href, AOI)
        valid = (red > 0) & (nir > 0)
        if not valid.any():
            continue
        ndvi = (nir[valid] - red[valid]) / (nir[valid] + red[valid])
        row = {
            "date": item.datetime.date().isoformat(),
            "cloud_cover": round(item.properties["eo:cloud_cover"], 1),
            "ndvi_mean": round(float(np.mean(ndvi)), 4),
            "ndvi_p25": round(float(np.percentile(ndvi, 25)), 4),
            "ndvi_p75": round(float(np.percentile(ndvi, 75)), 4),
        }
        rows.append(row)
        print(f"{row['date']}  clouds {row['cloud_cover']:>5}%  ndvi {row['ndvi_mean']:.3f}")

    if not rows:
        sys.exit("scenes found but no valid pixels in AOI")

    OUT_CSV.parent.mkdir(exist_ok=True)
    with open(OUT_CSV, "w", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=list(rows[0].keys()))
        writer.writeheader()
        writer.writerows(rows)
    print(f"saved {len(rows)} scenes -> {OUT_CSV}")


if __name__ == "__main__":
    main()
