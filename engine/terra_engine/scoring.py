import numpy as np


def season_features(rows):
    by_season = {}
    for row in rows:
        by_season.setdefault(row["season"], []).append(float(row["ndvi_mean"]))
    features = []
    for season, values in sorted(by_season.items()):
        if season.endswith("C") or len(values) < 2:
            continue
        features.append(
            {
                "season": season,
                "peak_ndvi": round(float(np.percentile(values, 90)), 4),
                "mean_ndvi": round(float(np.mean(values)), 4),
                "observations": len(values),
            }
        )
    return features


def score_farm(features):
    if len(features) < 2:
        return None
    peaks = np.array([f["peak_ndvi"] for f in features])
    peak_component = float(np.clip((peaks.mean() - 0.2) / 0.5, 0, 1))
    consistency_component = float(np.clip(1 - peaks.std() / 0.15, 0, 1))
    slope = float(np.polyfit(np.arange(len(peaks)), peaks, 1)[0])
    trend_component = float(np.clip(0.5 + slope / 0.1, 0, 1))
    raw = 0.5 * peak_component + 0.3 * consistency_component + 0.2 * trend_component
    return {
        "terra_score": int(round(300 + raw * 550)),
        "peak_component": round(peak_component, 3),
        "consistency_component": round(consistency_component, 3),
        "trend_component": round(trend_component, 3),
        "seasons_observed": len(features),
    }
