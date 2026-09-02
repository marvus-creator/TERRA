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

export type FarmStatus = 'scored' | 'analyzing' | 'insufficient_data' | 'failed'

export interface Farm {
  id: string
  name: string
  owner: string
  district: string
  geometry: { type: string; coordinates: number[][][] }
  registered: string
  seasons: SeasonFeature[]
  score: FarmScore | null
  status: FarmStatus
}

export interface Reading {
  farm_id: string
  date: string
  season: string
  ndvi_mean: string
  pixels: string
}

export interface OverlayMeta {
  bounds: [[number, number], [number, number]]
  date: string
  cloud_cover: number
}

export interface Stats {
  farms: number
  scored: number
  analyzing: number
  hectares: number
  scenes: number
  seasons: string[]
  districts: string[]
  average_score: number | null
  latest_reading: string | null
  overlay: OverlayMeta | null
}

export interface FarmRegistration {
  name: string
  owner: string
  district: string
  geometry: { type: 'Polygon'; coordinates: number[][][] }
}
