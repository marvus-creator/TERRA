import numpy as np
import rasterio
from rasterio.features import geometry_mask
from rasterio.warp import transform_bounds, transform_geom
from rasterio.windows import from_bounds

VALID_SCL = np.array([4, 5, 6, 7])


def _read_asset(href, bbox_wgs84, out_shape=None):
    with rasterio.open(href) as src:
        bounds = transform_bounds("EPSG:4326", src.crs, *bbox_wgs84)
        window = from_bounds(*bounds, transform=src.transform)
        data = src.read(1, window=window, out_shape=out_shape)
        transform = src.window_transform(window)
        crs = src.crs
    return data, transform, crs


def _to_reflectance(dn):
    return dn.astype("float32") * 1e-4 - 0.1


def read_scene_ndvi(item, bbox_wgs84):
    red_dn, transform, crs = _read_asset(item.assets["red"].href, bbox_wgs84)
    shape = red_dn.shape
    nir_dn, _, _ = _read_asset(item.assets["nir"].href, bbox_wgs84, out_shape=shape)
    scl, _, _ = _read_asset(item.assets["scl"].href, bbox_wgs84, out_shape=shape)

    red = _to_reflectance(red_dn)
    nir = _to_reflectance(nir_dn)
    valid = np.isin(scl, VALID_SCL) & (red > 0) & (nir > 0)
    ndvi = np.where(valid, (nir - red) / np.maximum(nir + red, 1e-6), np.nan)
    return ndvi, transform, crs


def farm_mean_ndvi(ndvi, transform, crs, geometry, min_pixels=5):
    geom = transform_geom("EPSG:4326", crs, geometry)
    mask = geometry_mask([geom], out_shape=ndvi.shape, transform=transform, invert=True)
    values = ndvi[mask]
    values = values[~np.isnan(values)]
    if values.size < min_pixels:
        return None, int(values.size)
    return float(np.mean(values)), int(values.size)
