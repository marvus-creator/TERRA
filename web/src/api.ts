import type { Farm, Reading } from './types'

export async function fetchFarms(): Promise<Farm[]> {
  const res = await fetch('/api/farms')
  if (!res.ok) throw new Error(`farms request failed (${res.status})`)
  const data = await res.json()
  return data.farms
}

export async function fetchTimeseries(farmId: string): Promise<Reading[]> {
  const res = await fetch(`/api/farms/${farmId}/timeseries`)
  if (!res.ok) throw new Error(`timeseries request failed (${res.status})`)
  const data = await res.json()
  return data.readings
}
