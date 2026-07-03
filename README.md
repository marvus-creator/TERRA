# TERRA

**The credit score for farmers, written by satellites.**

Half a billion smallholder farmers cannot get a loan because they have no credit history. Their fields have been writing one from space for years — TERRA reads it. Sentinel-2 satellite imagery becomes per-field crop-health history, and that history becomes a TERRA Score (300–850) a bank or SACCO can lend against.

## The product

A multi-page web application:

- **Home** — what TERRA is and how it works, in plain language
- **Register a Farm** — draw your field's corners on a satellite map, submit, done; the satellites do the rest
- **Portfolio** — every registered farm with owner, status, and score; searchable
- **Farm credit file** — per-farm map, score with plain-language verdict, component breakdown, season history table, two-year crop-health chart
- **Live Map** — command center with an NDVI crop-health overlay rendered from the latest clear satellite scene
- **How It Works** — the full methodology explained for loan committees, including honest limitations

## How scoring works

1. Farm boundaries are registered as polygons (drawn in the app).
2. The engine pulls every usable Sentinel-2 L2A scene over those fields since July 2024 (Earth Search STAC API on AWS Open Data — free, no account).
3. Per scene: per-pixel cloud/shadow masking via the SCL band, official radiometric offset correction, mean NDVI inside the exact field polygon.
4. Readings group into Rwanda's growing seasons (A: Sep–Feb, B: Mar–Jun).
5. Score = 50% productivity (seasonal NDVI peaks) + 30% consistency across seasons + 20% trend, mapped to 300–850.

Registration triggers analysis automatically in the background (~5–15 minutes per farm).

## Architecture

- `engine/terra_engine/` — Python core: STAC search, imagery, field masking, seasons, scoring, farm store, analysis pipeline
- `engine/api/` — FastAPI: farm registration + retrieval, timeseries, NDVI overlay, serves the built web app
- `engine/scripts/` — `init_store.py` (seed demo farms), `build_overlay.py` (NDVI overlay), `build_history.py`, `score_farms.py`
- `web/` — React 19 + TypeScript + Tailwind v4 + React Router; ReactBits components; Leaflet satellite maps; Recharts

## Run locally

```
cd engine
python -m venv .venv
.venv\Scripts\activate
pip install -e .
python scripts\init_store.py
python scripts\build_history.py
python scripts\score_farms.py
python scripts\build_overlay.py

cd ..\web
npm install
npm run build

cd ..\engine
uvicorn api.main:app --port 8100
```

Open http://localhost:8100 — one server hosts the app and the API.

For frontend development with hot reload: `npm run dev` in `web/` (proxies `/api` to port 8100).

## Deploy

```
docker build -t terra .
docker run -p 8100:8100 terra
```

Works on any container host (Render, Railway, Fly.io, Cloud Run). On first boot run `python scripts/init_store.py` inside the container (or register farms through the UI) — farm data lives in `engine/data/`, so mount a volume to persist it.

## API

- `GET /api/farms` — all farms
- `POST /api/farms` — register `{name, owner, district, geometry}`; triggers background satellite analysis
- `GET /api/farms/{id}` — one farm's credit file
- `GET /api/farms/{id}/timeseries` — cloud-masked NDVI readings
- `GET /api/overlay/meta` · `GET /api/overlay/image` — NDVI overlay for the map

## Roadmap

- Calibrate score weights against real repayment outcomes
- Rainfall data fusion (CHIRPS) to separate drought from mismanagement
- Multi-district and multi-country support
- Lender accounts, portfolio analytics, and loan-decision workflow
- KANOPI: on-device crop-disease diagnosis · COLDTRACE: post-harvest marketplace
