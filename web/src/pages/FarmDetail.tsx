import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { MapContainer, Polygon, TileLayer } from 'react-leaflet'
import { latLngBounds } from 'leaflet'
import CountUp from '../components/reactbits/CountUp'
import AnimatedContent from '../components/reactbits/AnimatedContent'
import StatusChip from '../components/StatusChip'
import NdviChart from '../components/NdviChart'
import { fetchFarm, fetchTimeseries } from '../api'
import type { Farm, Reading } from '../types'

function verdict(score: number) {
  if (score >= 760) return { label: 'Excellent', text: 'Consistently productive field. A prime lending candidate.' }
  if (score >= 700) return { label: 'Good', text: 'Reliable seasonal output. Creditworthy on standard terms.' }
  if (score >= 640) return { label: 'Fair', text: 'Productive but variable. Consider a smaller first loan.' }
  return { label: 'Building history', text: 'Limited or uneven record so far. Re-assess after the next season.' }
}

function Bar({ label, value, explain }: { label: string; value: number; explain: string }) {
  return (
    <div>
      <div className="flex justify-between text-xs text-emerald-100/60">
        <span>{label}</span>
        <span>{Math.round(value * 100)}%</span>
      </div>
      <div className="mt-1 h-2 overflow-hidden rounded-full bg-white/10">
        <div className="h-full rounded-full bg-gradient-to-r from-emerald-600 to-emerald-300" style={{ width: `${value * 100}%` }} />
      </div>
      <div className="mt-1 text-[11px] text-emerald-100/35">{explain}</div>
    </div>
  )
}

export default function FarmDetail() {
  const { farmId } = useParams()
  const [farm, setFarm] = useState<Farm | null>(null)
  const [readings, setReadings] = useState<Reading[]>([])
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(() => {
    if (!farmId) return
    fetchFarm(farmId)
      .then(setFarm)
      .catch(e => setError(String(e)))
    fetchTimeseries(farmId)
      .then(setReadings)
      .catch(() => setReadings([]))
  }, [farmId])

  useEffect(load, [load])

  useEffect(() => {
    if (farm?.status !== 'analyzing') return
    const timer = setInterval(load, 20000)
    return () => clearInterval(timer)
  }, [farm?.status, load])

  if (error) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-20 text-center">
        <p className="text-red-200">{error}</p>
        <Link to="/farms" className="mt-4 inline-block text-sm text-emerald-300">← Back to portfolio</Link>
      </div>
    )
  }
  if (!farm) return <div className="mx-auto max-w-7xl px-6 py-20 text-sm text-emerald-100/40">Loading farm…</div>

  const positions = farm.geometry.coordinates[0].map(([lon, lat]) => [lat, lon] as [number, number])
  const bounds = latLngBounds(positions).pad(1.2)
  const v = farm.score ? verdict(farm.score.terra_score) : null

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <Link to="/farms" className="text-sm text-emerald-300/80 hover:text-emerald-200">← Portfolio</Link>
      <div className="mt-3 flex flex-wrap items-center gap-4">
        <h1 className="text-3xl font-bold">{farm.name}</h1>
        <StatusChip status={farm.status} />
      </div>
      <p className="mt-2 text-sm text-emerald-100/50">
        Owned by {farm.owner} · {farm.district} District · registered {new Date(farm.registered).toLocaleDateString()}
      </p>

      {farm.status === 'analyzing' && (
        <div className="mt-8 rounded-2xl border border-sky-400/30 bg-sky-400/10 p-5 text-sm text-sky-100/90">
          🛰️ Satellites are reading two years of history for this field right now. First results usually arrive
          within 5–15 minutes — this page refreshes itself automatically.
        </div>
      )}

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <div className="h-[380px] overflow-hidden rounded-3xl border border-white/10">
          <MapContainer bounds={bounds} scrollWheelZoom className="h-full w-full">
            <TileLayer
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              attribution="Imagery © Esri, Maxar, Earthstar Geographics"
              maxZoom={18}
            />
            <Polygon positions={positions} pathOptions={{ color: '#4ade80', weight: 3, fillOpacity: 0.25 }} />
          </MapContainer>
        </div>

        <div className="rounded-3xl border border-white/10 bg-[#0b1210]/80 p-8">
          {farm.score ? (
            <>
              <div className="flex items-end gap-3">
                <CountUp to={farm.score.terra_score} duration={1.6} className="text-6xl font-bold text-emerald-300" />
                <div className="pb-2">
                  <div className="text-sm font-semibold text-emerald-200">{v?.label}</div>
                  <div className="text-[11px] uppercase tracking-wider text-emerald-100/40">Terra Score · 300–850</div>
                </div>
              </div>
              <p className="mt-3 text-sm text-emerald-100/60">{v?.text}</p>
              <div className="mt-6 grid gap-4">
                <Bar label="Productivity" value={farm.score.peak_component} explain="How strong the crops get at the peak of each season." />
                <Bar label="Consistency" value={farm.score.consistency_component} explain="How similar the harvest peaks are, season after season." />
                <Bar label="Trend" value={farm.score.trend_component} explain="Whether this field is improving or declining over time." />
              </div>
              <div className="mt-6 text-[11px] text-emerald-100/35">
                Based on {farm.score.seasons_observed} growing seasons of cloud-filtered Sentinel-2 imagery.
              </div>
            </>
          ) : (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <div className="text-5xl">🛰️</div>
              <p className="mt-4 text-sm text-emerald-100/50">
                {farm.status === 'analyzing'
                  ? 'Score in progress — the satellites are working.'
                  : 'Not enough clean satellite seasons yet to issue a reliable score.'}
              </p>
            </div>
          )}
        </div>
      </div>

      {farm.seasons.length > 0 && (
        <AnimatedContent distance={40} duration={0.7}>
          <div className="mt-8 overflow-x-auto rounded-3xl border border-white/10 bg-[#0b1210]/70 p-6">
            <h3 className="text-sm font-semibold text-emerald-100/80">Season history</h3>
            <table className="mt-4 w-full min-w-[480px] text-left text-sm">
              <thead>
                <tr className="text-[11px] uppercase tracking-wider text-emerald-100/40">
                  <th className="pb-3">Season</th>
                  <th className="pb-3">Peak crop health</th>
                  <th className="pb-3">Average</th>
                  <th className="pb-3">Satellite passes</th>
                </tr>
              </thead>
              <tbody>
                {farm.seasons.map(s => (
                  <tr key={s.season} className="border-t border-white/5">
                    <td className="py-3 font-medium">
                      {s.season.slice(0, 4)} · Season {s.season.slice(4)}
                    </td>
                    <td className="py-3 text-emerald-300">{s.peak_ndvi.toFixed(3)}</td>
                    <td className="py-3">{s.mean_ndvi.toFixed(3)}</td>
                    <td className="py-3">{s.observations}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </AnimatedContent>
      )}

      {readings.length > 0 && (
        <AnimatedContent distance={40} duration={0.7}>
          <div className="mt-8 rounded-3xl border border-white/10 bg-[#0b1210]/70 p-6">
            <div className="mb-4 flex items-baseline justify-between">
              <h3 className="text-sm font-semibold text-emerald-100/80">Field health over time</h3>
              <span className="text-[11px] uppercase tracking-wider text-emerald-100/40">
                {readings.length} cloud-masked readings
              </span>
            </div>
            <NdviChart readings={readings} />
            <p className="mt-4 text-[11px] leading-relaxed text-emerald-100/35">
              Each point is one satellite pass. The value (NDVI) measures how much healthy green vegetation covers
              the field — near 0 means bare soil, above 0.6 means dense thriving crops. The rise-and-fall pattern is
              the planting and harvest rhythm of Rwanda's two growing seasons.
            </p>
          </div>
        </AnimatedContent>
      )}
    </div>
  )
}
