import csv
import json
from pathlib import Path
from typing import Any

from fastapi import BackgroundTasks, FastAPI, HTTPException, Request
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field

from terra_engine import store
from terra_engine.analysis import analyze_farm, read_history

ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = ROOT / "data"
OVERLAY_PNG = DATA_DIR / "ndvi_overlay.png"
OVERLAY_META = DATA_DIR / "ndvi_overlay.json"
WEB_DIST = ROOT.parent / "web" / "dist"

app = FastAPI(title="TERRA API", version="0.2.0")


class FarmRegistration(BaseModel):
    name: str = Field(min_length=2, max_length=80)
    owner: str = Field(min_length=2, max_length=80)
    district: str = Field(default="Bugesera", max_length=60)
    geometry: dict[str, Any]


@app.get("/api/farms")
def list_farms():
    return {"farms": store.list_farms()}


@app.post("/api/farms", status_code=201)
def register_farm(body: FarmRegistration, tasks: BackgroundTasks):
    coordinates = body.geometry.get("coordinates")
    if body.geometry.get("type") != "Polygon" or not coordinates or len(coordinates[0]) < 4:
        raise HTTPException(422, "geometry must be a closed Polygon with at least 3 points")
    farm = {
        "id": store.new_id(),
        "name": body.name.strip(),
        "owner": body.owner.strip(),
        "district": body.district.strip() or "Bugesera",
        "geometry": body.geometry,
        "registered": store.now_iso(),
        "seasons": [],
        "score": None,
        "status": "analyzing",
    }
    store.upsert_farm(farm)
    tasks.add_task(analyze_farm, farm["id"])
    return farm


def polygon_hectares(geometry: dict[str, Any]) -> float:
    import math

    ring = geometry.get("coordinates", [[]])[0]
    if len(ring) < 3:
        return 0.0
    lat0 = sum(p[1] for p in ring) / len(ring) * math.pi / 180
    m_lat = 110540.0
    m_lon = 111320.0 * math.cos(lat0)
    total = 0.0
    for i in range(len(ring)):
        lon1, lat1 = ring[i][0], ring[i][1]
        lon2, lat2 = ring[(i + 1) % len(ring)][0], ring[(i + 1) % len(ring)][1]
        total += lon1 * m_lon * lat2 * m_lat - lon2 * m_lon * lat1 * m_lat
    return abs(total / 2) / 10000


@app.get("/api/stats")
def stats():
    farms = store.list_farms()
    history = read_history()
    scored = [f for f in farms if f.get("score")]
    scores = [f["score"]["terra_score"] for f in scored]
    districts = sorted({f.get("district", "") for f in farms if f.get("district")})
    seasons = sorted({r["season"] for r in history if not r["season"].endswith("C")})
    latest = max((r["date"] for r in history), default=None)
    overlay = json.loads(OVERLAY_META.read_text(encoding="utf-8")) if OVERLAY_META.exists() else None
    return {
        "farms": len(farms),
        "scored": len(scored),
        "analyzing": sum(1 for f in farms if f.get("status") == "analyzing"),
        "hectares": round(sum(polygon_hectares(f["geometry"]) for f in farms), 2),
        "scenes": len(history),
        "seasons": seasons,
        "districts": districts,
        "average_score": round(sum(scores) / len(scores)) if scores else None,
        "latest_reading": latest,
        "overlay": overlay,
    }


@app.get("/api/timeseries")
def all_timeseries():
    grouped: dict[str, list[dict[str, Any]]] = {}
    for row in read_history():
        grouped.setdefault(row["farm_id"], []).append(row)
    return {"farms": grouped}


@app.get("/api/farms/{farm_id}")
def get_farm(farm_id: str):
    farm = store.get_farm(farm_id)
    if farm is None:
        raise HTTPException(404, "unknown farm")
    return farm


@app.get("/api/farms/{farm_id}/timeseries")
def farm_timeseries(farm_id: str):
    if store.get_farm(farm_id) is None:
        raise HTTPException(404, "unknown farm")
    rows = [r for r in read_history() if r["farm_id"] == farm_id]
    return {"farm_id": farm_id, "readings": rows}


@app.get("/api/overlay/meta")
def overlay_meta():
    if not OVERLAY_META.exists():
        raise HTTPException(404, "overlay not built yet")
    return json.loads(OVERLAY_META.read_text(encoding="utf-8"))


@app.get("/api/overlay/image")
def overlay_image():
    if not OVERLAY_PNG.exists():
        raise HTTPException(404, "overlay not built yet")
    return FileResponse(OVERLAY_PNG, media_type="image/png")


if WEB_DIST.exists():
    app.mount("/assets", StaticFiles(directory=WEB_DIST / "assets"), name="assets")

    @app.get("/{path:path}", include_in_schema=False)
    def spa(request: Request, path: str):
        candidate = (WEB_DIST / path).resolve()
        if path and candidate.is_file() and candidate.is_relative_to(WEB_DIST):
            return FileResponse(candidate)
        return FileResponse(WEB_DIST / "index.html")
