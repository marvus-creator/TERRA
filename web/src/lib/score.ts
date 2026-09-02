import type { Farm, FarmStatus, Reading, SeasonFeature } from '../types'

export interface Band {
  key: 'building' | 'fair' | 'good' | 'excellent'
  label: string
  min: number
  max: number
  color: string
  soft: string
  verdict: string
}

export const BANDS: Band[] = [
  { key: 'building', label: 'Building history', min: 300, max: 639, color: '#c98b3a', soft: '#f3e3c8', verdict: 'Limited or uneven record so far. Re-assess after the next season.' },
  { key: 'fair', label: 'Fair', min: 640, max: 699, color: '#cbb034', soft: '#f6efc9', verdict: 'Productive but variable. Consider a smaller first loan.' },
  { key: 'good', label: 'Good', min: 700, max: 759, color: '#5f9f3a', soft: '#e1eecf', verdict: 'Reliable seasonal output. Creditworthy on standard terms.' },
  { key: 'excellent', label: 'Excellent', min: 760, max: 850, color: '#1c5c30', soft: '#d3e6d6', verdict: 'Consistently productive field. A prime lending candidate.' },
]

export function bandFor(score: number | null | undefined): Band | null {
  if (score == null) return null
  return BANDS.find(b => score >= b.min && score <= b.max) ?? BANDS[0]
}

const RAMP: [number, string][] = [
  [0, '#7a4a1f'],
  [0.22, '#c98b3a'],
  [0.45, '#e6c94a'],
  [0.65, '#9cbf3a'],
  [0.84, '#3f8f3a'],
  [1, '#1c5c30'],
]

function hex(c: string) {
  return [1, 3, 5].map(i => parseInt(c.slice(i, i + 2), 16))
}

export function ndviColor(v: number) {
  const t = Math.max(0, Math.min(1, v))
  for (let i = 1; i < RAMP.length; i++) {
    if (t <= RAMP[i][0]) {
      const [t0, c0] = RAMP[i - 1]
      const [t1, c1] = RAMP[i]
      const k = (t - t0) / (t1 - t0)
      const a = hex(c0)
      const b = hex(c1)
      const rgb = a.map((x, j) => Math.round(x + (b[j] - x) * k))
      return `rgb(${rgb.join(',')})`
    }
  }
  return RAMP[RAMP.length - 1][1]
}

export function ringPositions(farm: Farm): [number, number][] {
  return farm.geometry.coordinates[0].map(([lon, lat]) => [lat, lon] as [number, number])
}

export function hectaresOf(points: [number, number][]) {
  if (points.length < 3) return 0
  const lat0 = (points.reduce((sum, p) => sum + p[0], 0) / points.length) * (Math.PI / 180)
  const mPerLat = 110540
  const mPerLon = 111320 * Math.cos(lat0)
  let sum = 0
  for (let i = 0; i < points.length; i++) {
    const [lat1, lon1] = points[i]
    const [lat2, lon2] = points[(i + 1) % points.length]
    sum += lon1 * mPerLon * (lat2 * mPerLat) - lon2 * mPerLon * (lat1 * mPerLat)
  }
  return Math.abs(sum / 2) / 10000
}

export function farmHectares(farm: Farm) {
  return hectaresOf(ringPositions(farm))
}

export function centroidOf(points: [number, number][]): [number, number] {
  const n = points.length || 1
  return [points.reduce((s, p) => s + p[0], 0) / n, points.reduce((s, p) => s + p[1], 0) / n]
}

const clip = (v: number) => Math.max(0, Math.min(1, v))

export interface Story {
  peaks: number[]
  seasons: string[]
  meanPeak: number
  peakComponent: number
  std: number
  consistencyComponent: number
  slope: number
  trendComponent: number
  raw: number
  score: number
}

export function storyFrom(seasons: SeasonFeature[]): Story | null {
  if (seasons.length < 2) return null
  const peaks = seasons.map(s => s.peak_ndvi)
  const n = peaks.length
  const meanPeak = peaks.reduce((a, b) => a + b, 0) / n
  const std = Math.sqrt(peaks.reduce((a, b) => a + (b - meanPeak) ** 2, 0) / n)
  const xs = peaks.map((_, i) => i)
  const xm = xs.reduce((a, b) => a + b, 0) / n
  const slope = xs.reduce((a, x, i) => a + (x - xm) * (peaks[i] - meanPeak), 0) / xs.reduce((a, x) => a + (x - xm) ** 2, 0)
  const peakComponent = clip((meanPeak - 0.2) / 0.5)
  const consistencyComponent = clip(1 - std / 0.15)
  const trendComponent = clip(0.5 + slope / 0.1)
  const raw = 0.5 * peakComponent + 0.3 * consistencyComponent + 0.2 * trendComponent
  return {
    peaks,
    seasons: seasons.map(s => s.season),
    meanPeak,
    peakComponent,
    std,
    consistencyComponent,
    slope,
    trendComponent,
    raw,
    score: Math.round(300 + raw * 550),
  }
}

export function seasonLabel(season: string) {
  return `${season.slice(0, 4)} · Season ${season.slice(4)}`
}

export function seasonShort(season: string) {
  return `${season.slice(4)}${season.slice(2, 4)}`
}

export function seasonRange(season: string): [Date, Date] {
  const year = Number(season.slice(0, 4))
  const letter = season.slice(4)
  if (letter === 'A') return [new Date(Date.UTC(year - 1, 8, 1)), new Date(Date.UTC(year, 1, 28))]
  if (letter === 'B') return [new Date(Date.UTC(year, 2, 1)), new Date(Date.UTC(year, 5, 30))]
  return [new Date(Date.UTC(year, 6, 1)), new Date(Date.UTC(year, 7, 31))]
}

export function seasonsOf(readings: Reading[]) {
  return Array.from(new Set(readings.map(r => r.season))).filter(s => !s.endsWith('C')).sort()
}

export function trendOf(farm: Farm) {
  return farm.score ? farm.score.trend_component - 0.5 : null
}

export function trendWord(t: number | null) {
  if (t == null) return '—'
  if (t > 0.08) return 'Improving'
  if (t < -0.08) return 'Declining'
  return 'Stable'
}

export const STATUS_LABEL: Record<FarmStatus, string> = {
  scored: 'Scored',
  analyzing: 'Analysing from orbit',
  insufficient_data: 'Needs more seasons',
  failed: 'Analysis failed',
}

export function sparkValues(readings: Reading[]) {
  return readings.map(r => Number(r.ndvi_mean))
}
