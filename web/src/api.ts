import type { Farm, FarmRegistration, OverlayMeta, Reading } from './types'

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init)
  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(body || `request failed (${res.status})`)
  }
  return res.json()
}

export async function fetchFarms(): Promise<Farm[]> {
  const data = await request<{ farms: Farm[] }>('/api/farms')
  return data.farms
}

export function fetchFarm(farmId: string): Promise<Farm> {
  return request<Farm>(`/api/farms/${farmId}`)
}

export async function fetchTimeseries(farmId: string): Promise<Reading[]> {
  const data = await request<{ readings: Reading[] }>(`/api/farms/${farmId}/timeseries`)
  return data.readings
}

export function registerFarm(payload: FarmRegistration): Promise<Farm> {
  return request<Farm>('/api/farms', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
}

export function fetchOverlayMeta(): Promise<OverlayMeta> {
  return request<OverlayMeta>('/api/overlay/meta')
}

export const OVERLAY_IMAGE_URL = '/api/overlay/image'
