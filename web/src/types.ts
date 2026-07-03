export interface SeasonFeature {
  season: string
  peak_ndvi: number
  mean_ndvi: number
  observations: number
}

export interface FarmScore {
  terra_score: number
  peak_component: number
  consistency_component: number
  trend_component: number
  seasons_observed: number
}

export interface Farm {
  id: string
  name: string
  geometry: { type: string; coordinates: number[][][] }
  seasons: SeasonFeature[]
  score: FarmScore | null
}

export interface Reading {
  farm_id: string
  date: string
  season: string
  ndvi_mean: string
  pixels: string
}
