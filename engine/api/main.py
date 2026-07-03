import csv
import json
from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles

ROOT = Path(__file__).resolve().parents[1]
SCORES_JSON = ROOT / "data" / "farm_scores.json"
HISTORY_CSV = ROOT / "data" / "farm_ndvi_history.csv"
STATIC_DIR = ROOT / "static"

app = FastAPI(title="TERRA API", version="0.1.0")


def load_scores():
    if not SCORES_JSON.exists():
        raise HTTPException(503, "scores not built yet, run scripts/score_farms.py")
    return json.loads(SCORES_JSON.read_text(encoding="utf-8"))


def load_history():
    if not HISTORY_CSV.exists():
        raise HTTPException(503, "history not built yet, run scripts/build_history.py")
    with open(HISTORY_CSV, newline="") as f:
        return list(csv.DictReader(f))


@app.get("/api/farms")
def list_farms():
    return load_scores()


@app.get("/api/farms/{farm_id}/score")
def farm_score(farm_id: str):
    for farm in load_scores()["farms"]:
        if farm["id"] == farm_id:
            return farm
    raise HTTPException(404, "unknown farm")


@app.get("/api/farms/{farm_id}/timeseries")
def farm_timeseries(farm_id: str):
    rows = [r for r in load_history() if r["farm_id"] == farm_id]
    if not rows:
        raise HTTPException(404, "no readings for farm")
    return {"farm_id": farm_id, "readings": rows}


app.mount("/", StaticFiles(directory=STATIC_DIR, html=True), name="static")
