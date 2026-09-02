import { useCallback, useEffect, useState } from 'react'
import { fetchAllTimeseries, fetchFarm, fetchFarms, fetchStats, fetchTimeseries } from '../api'
import type { Farm, Reading, Stats } from '../types'

interface Cache {
  farms: Farm[] | null
  stats: Stats | null
  series: Record<string, Reading[]> | null
}

const cache: Cache = { farms: null, stats: null, series: null }
const listeners = new Set<() => void>()

function notify() {
  listeners.forEach(l => l())
}

export function cachedFarms() {
  return cache.farms ?? []
}

export function useFarms() {
  const [farms, setFarms] = useState<Farm[] | null>(cache.farms)
  const [error, setError] = useState<string | null>(null)
  const reload = useCallback(() => {
    return fetchFarms()
      .then(f => {
        cache.farms = f
        setError(null)
        notify()
      })
      .catch(e => setError(String(e)))
  }, [])
  useEffect(() => {
    const l = () => setFarms(cache.farms)
    listeners.add(l)
    if (!cache.farms) reload()
    return () => {
      listeners.delete(l)
    }
  }, [reload])
  return { farms, loading: farms === null && !error, error, reload }
}

export function useStats() {
  const [stats, setStats] = useState<Stats | null>(cache.stats)
  useEffect(() => {
    fetchStats()
      .then(s => {
        cache.stats = s
        setStats(s)
      })
      .catch(() => undefined)
  }, [])
  return stats
}

export function useAllSeries() {
  const [series, setSeries] = useState<Record<string, Reading[]> | null>(cache.series)
  useEffect(() => {
    if (cache.series) return
    fetchAllTimeseries()
      .then(s => {
        cache.series = s
        setSeries(s)
      })
      .catch(() => setSeries({}))
  }, [])
  return series
}

export function useFarm(farmId: string | undefined) {
  const [farm, setFarm] = useState<Farm | null>(() => cache.farms?.find(f => f.id === farmId) ?? null)
  const [readings, setReadings] = useState<Reading[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const load = useCallback(() => {
    if (!farmId) return
    fetchFarm(farmId)
      .then(f => {
        setFarm(f)
        if (cache.farms) {
          cache.farms = cache.farms.some(x => x.id === f.id) ? cache.farms.map(x => (x.id === f.id ? f : x)) : [...cache.farms, f]
          notify()
        }
      })
      .catch(e => setError(String(e)))
    fetchTimeseries(farmId)
      .then(setReadings)
      .catch(() => setReadings([]))
  }, [farmId])
  useEffect(load, [load])
  useEffect(() => {
    if (farm?.status !== 'analyzing') return
    const timer = setInterval(load, 15000)
    return () => clearInterval(timer)
  }, [farm?.status, load])
  return { farm, readings, error, reload: load }
}
