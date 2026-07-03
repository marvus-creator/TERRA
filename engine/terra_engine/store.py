import json
from datetime import datetime, timezone
from pathlib import Path
from threading import Lock

DATA_DIR = Path(__file__).resolve().parents[1] / "data"
STORE_PATH = DATA_DIR / "farms.json"
_lock = Lock()


def _read():
    if not STORE_PATH.exists():
        return {"farms": []}
    return json.loads(STORE_PATH.read_text(encoding="utf-8"))


def list_farms():
    return _read()["farms"]


def get_farm(farm_id):
    for farm in list_farms():
        if farm["id"] == farm_id:
            return farm
    return None


def upsert_farm(record):
    with _lock:
        data = _read()
        data["farms"] = [f for f in data["farms"] if f["id"] != record["id"]]
        data["farms"].append(record)
        data["farms"].sort(key=lambda f: f["id"])
        DATA_DIR.mkdir(exist_ok=True)
        STORE_PATH.write_text(json.dumps(data, indent=2), encoding="utf-8")
    return record


def new_id():
    numbers = [0]
    for farm in list_farms():
        try:
            numbers.append(int(farm["id"].rsplit("-", 1)[1]))
        except (IndexError, ValueError):
            continue
    return f"farm-{max(numbers) + 1:03d}"


def now_iso():
    return datetime.now(timezone.utc).isoformat()
