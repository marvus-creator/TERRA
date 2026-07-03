import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ImageOverlay, MapContainer, Polygon, TileLayer, Tooltip, useMap } from 'react-leaflet'
import { latLngBounds } from 'leaflet'
import StatusChip from '../components/StatusChip'
import { OVERLAY_IMAGE_URL, fetchFarms, fetchOverlayMeta } from '../api'
import type { Farm, OverlayMeta } from '../types'

function scoreColor(score?: number | null) {
  if (!score) return '#94a3b8'
  if (score >= 760) return '#4ade80'
  if (score >= 700) return '#fbbf24'
  return '#f87171'
}

function FlyTo({ farm }: { farm: Farm | null }) {
  const map = useMap()
  useEffect(() => {
    if (!farm) return
    const positions = farm.geometry.coordinates[0].map(([lon, lat]) => [lat, lon] as [number, number])
    map.flyToBounds(latLngBounds(positions).pad(2), { duration: 0.8 })
  }, [farm, map])
  return null
}

export default function MapPage() {
  const [farms, setFarms] = useState<Farm[]>([])
  const [meta, setMeta] = useState<OverlayMeta | null>(null)
  const [showOverlay, setShowOverlay] = useState(true)
  const [opacity, setOpacity] = useState(0.75)
  const [selected, setSelected] = useState<Farm | null>(null)

  useEffect(() => {
    fetchFarms().then(setFarms).catch(() => setFarms([]))
    fetchOverlayMeta().then(setMeta).catch(() => setMeta(null))
  }, [])

  return (
    <div className="relative h-[calc(100vh-4rem)]">
      <MapContainer center={[-2.1785, 30.0845]} zoom={14} scrollWheelZoom className="h-full w-full">
        <TileLayer
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          attribution="Imagery © Esri, Maxar, Earthstar Geographics"
          maxZoom={18}
        />
        {meta && showOverlay && (
          <ImageOverlay url={OVERLAY_IMAGE_URL} bounds={meta.bounds} opacity={opacity} />
        )}
        {farms.map(farm => {
          const positions = farm.geometry.coordinates[0].map(([lon, lat]) => [lat, lon] as [number, number])
          const color = scoreColor(farm.score?.terra_score)
          return (
            <Polygon
              key={farm.id}
              positions={positions}
              pathOptions={{ color, weight: selected?.id === farm.id ? 4 : 2.5, fillOpacity: 0.1 }}
              eventHandlers={{ click: () => setSelected(farm) }}
            >
              <Tooltip sticky>
                {farm.name}
                {farm.score ? ` · ${farm.score.terra_score}` : ''}
              </Tooltip>
            </Polygon>
          )
        })}
        <FlyTo farm={selected} />
      </MapContainer>

      <div className="absolute right-4 top-4 z-[1000] w-80 max-w-[calc(100vw-2rem)] rounded-3xl border border-white/10 bg-[#050807]/90 p-5 backdrop-blur-md">
        <h2 className="text-sm font-semibold">Live crop health — Bugesera</h2>
        {meta ? (
          <p className="mt-1 text-[11px] text-emerald-100/40">
            Sentinel-2 scene from {meta.date} · {meta.cloud_cover}% cloud
          </p>
        ) : (
          <p className="mt-1 text-[11px] text-amber-200/60">Overlay not available.</p>
        )}

        {meta && (
          <div className="mt-4 grid gap-3">
            <label className="flex items-center justify-between text-xs text-emerald-100/60">
              Show crop health layer
              <input type="checkbox" checked={showOverlay} onChange={e => setShowOverlay(e.target.checked)} className="h-4 w-4 accent-emerald-400" />
            </label>
            <label className="grid gap-1 text-xs text-emerald-100/60">
              Layer opacity
              <input
                type="range"
                min={0.2}
                max={1}
                step={0.05}
                value={opacity}
                onChange={e => setOpacity(Number(e.target.value))}
                className="accent-emerald-400"
              />
            </label>
            <div>
              <div className="h-2.5 rounded-full" style={{ background: 'linear-gradient(90deg,#7f1d1d,#ef4444,#f59e0b,#a3e635,#22c55e,#15803d)' }} />
              <div className="mt-1 flex justify-between text-[10px] text-emerald-100/40">
                <span>bare / stressed</span>
                <span>thriving crops</span>
              </div>
            </div>
          </div>
        )}

        <div className="mt-5 border-t border-white/10 pt-4">
          <div className="text-[11px] uppercase tracking-wider text-emerald-100/40">Farms</div>
          <div className="mt-2 grid max-h-56 gap-2 overflow-y-auto pr-1">
            {farms.map(farm => (
              <button
                key={farm.id}
                onClick={() => setSelected(farm)}
                className={`rounded-xl border px-3 py-2.5 text-left text-xs transition-colors ${
                  selected?.id === farm.id
                    ? 'border-emerald-400/50 bg-emerald-400/10'
                    : 'border-white/10 hover:bg-white/5'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium">{farm.name}</span>
                  <span className="font-bold text-emerald-300">{farm.score?.terra_score ?? '—'}</span>
                </div>
              </button>
            ))}
          </div>
          {selected && (
            <div className="mt-3 flex items-center justify-between gap-2">
              <StatusChip status={selected.status} />
              <Link to={`/farms/${selected.id}`} className="text-xs font-medium text-emerald-300 hover:text-emerald-200">
                Open credit file →
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
