import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CircleMarker, MapContainer, Polygon, TileLayer, useMapEvents } from 'react-leaflet'
import { registerFarm } from '../api'

type Point = [number, number]

function ClickCapture({ onAdd }: { onAdd: (point: Point) => void }) {
  useMapEvents({ click: e => onAdd([e.latlng.lat, e.latlng.lng]) })
  return null
}

function areaHa(points: Point[]) {
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

export default function Register() {
  const navigate = useNavigate()
  const [points, setPoints] = useState<Point[]>([])
  const [name, setName] = useState('')
  const [owner, setOwner] = useState('')
  const [district, setDistrict] = useState('Bugesera')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const area = areaHa(points)
  const ready = points.length >= 3 && name.trim().length >= 2 && owner.trim().length >= 2

  async function submit() {
    if (!ready || submitting) return
    setSubmitting(true)
    setError(null)
    try {
      const ring = points.map(([lat, lon]) => [lon, lat])
      ring.push(ring[0])
      const farm = await registerFarm({
        name: name.trim(),
        owner: owner.trim(),
        district: district.trim() || 'Bugesera',
        geometry: { type: 'Polygon', coordinates: [ring] },
      })
      navigate(`/farms/${farm.id}`)
    } catch (e) {
      setError(String(e))
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <div className="text-[11px] uppercase tracking-[0.25em] text-emerald-400/70">Onboarding</div>
      <h1 className="mt-2 text-3xl font-bold">Register a farm</h1>
      <p className="mt-2 max-w-2xl text-sm text-emerald-100/50">
        Zoom to your field on the satellite map, then tap each corner of it. When the shape looks right,
        fill in the details and submit — the satellites handle everything else.
      </p>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <div className="h-[480px] overflow-hidden rounded-3xl border border-white/10">
          <MapContainer center={[-2.1785, 30.0845]} zoom={15} scrollWheelZoom className="h-full w-full">
            <TileLayer
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              attribution="Imagery © Esri, Maxar, Earthstar Geographics"
              maxZoom={18}
            />
            <ClickCapture onAdd={p => setPoints(prev => [...prev, p])} />
            {points.map((p, i) => (
              <CircleMarker
                key={`${p[0]}-${p[1]}-${i}`}
                center={p}
                radius={5}
                pathOptions={{ color: '#04130b', weight: 1.5, fillColor: '#4ade80', fillOpacity: 1 }}
              />
            ))}
            {points.length >= 3 && (
              <Polygon positions={points} pathOptions={{ color: '#4ade80', weight: 2.5, fillOpacity: 0.25 }} />
            )}
          </MapContainer>
        </div>

        <div className="rounded-3xl border border-white/10 bg-[#0b1210]/80 p-8">
          <h2 className="text-sm font-semibold text-emerald-100/80">Field details</h2>

          <div className="mt-5 grid gap-4">
            <label className="grid gap-1.5 text-xs text-emerald-100/50">
              Farm name
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Kayitesi Maize Field"
                className="rounded-xl border border-white/10 bg-[#080f0c] px-4 py-3 text-sm text-emerald-50 outline-none placeholder:text-emerald-100/25 focus:border-emerald-400/50"
              />
            </label>
            <label className="grid gap-1.5 text-xs text-emerald-100/50">
              Owner / farmer name
              <input
                value={owner}
                onChange={e => setOwner(e.target.value)}
                placeholder="e.g. Vestine Kayitesi"
                className="rounded-xl border border-white/10 bg-[#080f0c] px-4 py-3 text-sm text-emerald-50 outline-none placeholder:text-emerald-100/25 focus:border-emerald-400/50"
              />
            </label>
            <label className="grid gap-1.5 text-xs text-emerald-100/50">
              District
              <input
                value={district}
                onChange={e => setDistrict(e.target.value)}
                className="rounded-xl border border-white/10 bg-[#080f0c] px-4 py-3 text-sm text-emerald-50 outline-none focus:border-emerald-400/50"
              />
            </label>
          </div>

          <div className="mt-6 rounded-2xl border border-white/10 bg-[#080f0c] p-4 text-sm">
            <div className="flex justify-between text-emerald-100/60">
              <span>Corners placed</span>
              <span className={points.length >= 3 ? 'text-emerald-300' : 'text-amber-300'}>
                {points.length} {points.length < 3 && '(need at least 3)'}
              </span>
            </div>
            <div className="mt-2 flex justify-between text-emerald-100/60">
              <span>Estimated area</span>
              <span className="text-emerald-300">{area > 0 ? `${area.toFixed(2)} ha` : '—'}</span>
            </div>
          </div>

          <div className="mt-4 flex gap-2">
            <button
              onClick={() => setPoints(prev => prev.slice(0, -1))}
              disabled={points.length === 0}
              className="flex-1 rounded-xl border border-white/10 px-4 py-2.5 text-sm text-emerald-100/70 transition-colors hover:bg-white/5 disabled:opacity-30"
            >
              Undo corner
            </button>
            <button
              onClick={() => setPoints([])}
              disabled={points.length === 0}
              className="flex-1 rounded-xl border border-white/10 px-4 py-2.5 text-sm text-emerald-100/70 transition-colors hover:bg-white/5 disabled:opacity-30"
            >
              Clear
            </button>
          </div>

          {error && (
            <div className="mt-4 rounded-xl border border-red-400/30 bg-red-400/10 p-3 text-xs text-red-200">{error}</div>
          )}

          <button
            onClick={submit}
            disabled={!ready || submitting}
            className="mt-4 w-full rounded-xl bg-emerald-500 px-4 py-3.5 text-sm font-semibold text-[#04130b] transition-colors hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {submitting ? 'Submitting…' : 'Submit for satellite analysis 🛰️'}
          </button>
          <p className="mt-3 text-[11px] leading-relaxed text-emerald-100/35">
            After submission, TERRA pulls every clear Sentinel-2 pass over this exact shape since July 2024 and
            builds its credit file automatically.
          </p>
        </div>
      </div>
    </div>
  )
}
