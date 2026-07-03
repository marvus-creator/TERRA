# TERRA

Satellite-powered credit scoring for smallholder farmers.

Banks cannot lend to farmers who have no credit history. TERRA turns the land itself into a credit file: Sentinel-2 satellite imagery is used to measure crop health (NDVI) over time for a farmer's fields, producing an objective, verifiable signal of productivity that lenders can price risk against.

## Structure

- `engine/` — Python data + scoring engine (satellite ingestion, NDVI time series, credit features)

## Milestone 0 — NDVI time series for one Rwandan district

Pulls Sentinel-2 L2A scenes over Bugesera district (Rwanda) from the AWS Open Data archive via the Earth Search STAC API, computes an NDVI time series for the area of interest, and writes it to CSV.

```
cd engine
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
python scripts/ndvi_timeseries.py
```

Output: `engine/data/ndvi_bugesera.csv`
