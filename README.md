# TERRA

Satellite-powered credit scoring for smallholder farmers.

Banks cannot lend to farmers who have no credit history. TERRA turns the land itself into a credit file: Sentinel-2 satellite imagery is used to measure crop health (NDVI) per field over multiple growing seasons, producing an objective, verifiable signal of productivity that lenders can price risk against.

## How it works

1. Farm boundaries are registered as GeoJSON polygons.
2. The engine pulls every usable Sentinel-2 L2A scene over those fields from the AWS Open Data archive (Earth Search STAC API, no account required).
3. Per scene, clouds and shadows are masked per-pixel using the SCL band, the post-2022 radiometric offset is corrected, and mean NDVI is computed inside each farm polygon.
4. Readings are grouped into Rwandan growing seasons (A: Sep–Feb, B: Mar–Jun).
5. Per-farm features — seasonal peak productivity, consistency across seasons, multi-season trend — are combined into a TERRA Score on a 300–850 scale.

## Structure

- `engine/terra_engine/` — core library (STAC search, imagery, field masking, seasons, scoring)
- `engine/scripts/` — pipelines (`build_history.py`, `score_farms.py`, `ndvi_timeseries.py`)
- `engine/api/` — FastAPI service
- `engine/static/` — lender dashboard
- `engine/sample_farms.geojson` — demo farm polygons in Bugesera District, Rwanda

## Run it

```
cd engine
python -m venv .venv
.venv\Scripts\activate
pip install -e .
python scripts\build_history.py
python scripts\score_farms.py
uvicorn api.main:app --reload
```

Then open http://127.0.0.1:8000

## API

- `GET /api/farms` — all farms with geometry, seasonal features, and TERRA scores
- `GET /api/farms/{id}/score` — score breakdown for one farm
- `GET /api/farms/{id}/timeseries` — cloud-masked NDVI readings for one farm
