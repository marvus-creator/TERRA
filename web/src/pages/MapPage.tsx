import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ImageOverlay, MapContainer, Polygon, TileLayer, Tooltip, useMap } from 'react-leaflet'
import { latLngBounds } from 'leaflet'
import { ArrowRight, Layers, Locate } from 'lucide-react'
import { OVERLAY_IMAGE_URL, fetchOverlayMeta } from '../api'
import { ESRI_ATTR, ESRI_URL } from '../components/terra/FieldMap'
import { BandBadge, Skeleton, StatusBadge } from '../components/ui'
import { useFarms } from '../hooks/useData'
import { bandFor, farmHectares, ringPositions } from '../lib/score'
import { cx, fmtDate, fmtHa } from '../lib/format'
import type { Farm, OverlayMeta } from '../types'

function FlyTo({ farm }: { farm: Farm | null }) {
  const map = useMap()
  useEffect(() => {
    if (!farm) return
    map.flyToBounds(latLngBounds(ringPositions(farm)).pad(2), { duration: 0.9 })
  }, [farm, map])
  return null
}

function FitAll({ farms }: { farms: Farm[] }) {
  const map = useMap()
  const [done, setDone] = useState(false)
  useEffect(() => {
    if (done || !farms.length) return
    map.fitBounds(latLngBounds(farms.flatMap(ringPositions)).pad(0.4), { animate: false })
    setDone(true)
  }, [farms, map, done])
  return null
}

export default function MapPage() {
  const { farms, loading } = useFarms()
  const [meta, setMeta] = useState<OverlayMeta | null>(null)
  const [showOverlay, setShowOverlay] = useState(true)
  const [opacity, setOpacity] = useState(0.7)
  const [selected, setSelected] = useState<Farm | null>(null)
  const [hover, setHover] = useState<string | null>(null)

  useEffect(() => {
    fetchOverlayMeta().then(setMeta).catch(() => setMeta(null))
  }, [])

  const list = useMemo(() => (farms ?? []).slice().sort((a, b) => (b.score?.terra_score ?? -1) - (a.score?.terra_score ?? -1)), [farms])

  return (
    <div className="relative h-full">
      <MapContainer center={[-2.1785, 30.0845]} zoom={14} scrollWheelZoom className="h-full w-full" zoomControl={false}>
        <TileLayer url={ESRI_URL} attribution={ESRI_ATTR} maxZoom={18} />
        {meta && showOverlay && <ImageOverlay url={OVERLAY_IMAGE_URL} bounds={meta.bounds} opacity={opacity} />}
        {list.map(farm => {
          const band = bandFor(farm.score?.terra_score)
          const lit = hover === farm.id || selected?.id === farm.id
          return (
            <Polygon
              key={farm.id}
              positions={ringPositions(farm)}
              pathOptions={{ color: lit ? '#c4622d' : '#fcf9f2', weight: lit ? 4 : 2.5, fillColor: band?.color ?? '#c98b3a', fillOpacity: lit ? 0.5 : 0.25 }}
              eventHandlers={{ click: () => setSelected(farm), mouseover: () => setHover(farm.id), mouseout: () => setHover(null) }}
            >
              <Tooltip sticky>
                {farm.name}
                {farm.score ? ` · ${farm.score.terra_score}` : ''}
              </Tooltip>
            </Polygon>
          )
        })}
        <FlyTo farm={selected} />
        <FitAll farms={list} />
      </MapContainer>

      <div className="absolute left-4 top-4 z-[1000] flex w-[340px] max-w-[calc(100vw-2rem)] flex-col gap-3" data-tour="overlay-panel">
        <div className="paper rounded-3xl p-5">
          <div className="flex items-center gap-2">
            <Layers size={16} className="text-olive" />
            <h2 className="font-display text-xl text-olive">Live crop health</h2>
          </div>
          {meta ? (
            <p className="mt-1 text-xs text-muted">
              Sentinel-2 scene of {fmtDate(meta.date)} · {meta.cloud_cover}% cloud · Bugesera
            </p>
          ) : (
            <p className="mt-1 text-xs text-terracotta">Overlay not built yet — run build_overlay.py.</p>
          )}
          {meta && (
            <div className="mt-4 grid gap-3">
              <label className="flex items-center justify-between text-sm text-olive">
                Show NDVI layer
                <input type="checkbox" checked={showOverlay} onChange={e => setShowOverlay(e.target.checked)} className="h-4 w-4" />
              </label>
              <label className="grid gap-1 text-xs text-muted">
                <span className="flex justify-between">
                  Layer opacity <span className="font-mono">{Math.round(opacity * 100)}%</span>
                </span>
                <input type="range" min={0.1} max={1} step={0.05} value={opacity} onChange={e => setOpacity(Number(e.target.value))} disabled={!showOverlay} />
              </label>
              <div>
                <div className="h-3 rounded-full ndvi-ramp" />
                <div className="mt-1 flex justify-between text-[10px] text-muted">
                  <span>bare soil</span>
                  <span>sparse</span>
                  <span>thriving crops</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="paper flex max-h-[calc(100vh-24rem)] flex-col rounded-3xl p-4">
          <div className="flex items-center justify-between px-1">
            <span className="overline">Farms · {list.length}</span>
            <span className="text-[11px] text-muted">hover to highlight</span>
          </div>
          <div className="scrollbar-thin mt-2 grid gap-2 overflow-y-auto pr-1">
            {loading && [0, 1, 2].map(i => <Skeleton key={i} className="h-14 w-full" />)}
            {list.map(farm => {
              const band = bandFor(farm.score?.terra_score)
              const lit = hover === farm.id
              const active = selected?.id === farm.id
              return (
                <button
                  key={farm.id}
                  onClick={() => setSelected(farm)}
                  onMouseEnter={() => setHover(farm.id)}
                  onMouseLeave={() => setHover(null)}
                  className={cx('focus-ring rounded-2xl border px-3 py-2.5 text-left transition-all', active ? 'border-olive bg-olive text-cream' : lit ? 'border-terracotta bg-terracotta-soft' : 'border-line bg-cream/60 hover:bg-sand')}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-sm font-medium">{farm.name}</span>
                    <span className="font-display text-lg" style={{ color: active ? '#f7f1e5' : band?.color ?? '#6f6a57' }}>
                      {farm.score?.terra_score ?? '—'}
                    </span>
                  </div>
                  <div className={cx('mt-0.5 flex items-center justify-between text-[11px]', active ? 'text-cream/70' : 'text-muted')}>
                    <span>
                      {farm.owner} · {fmtHa(farmHectares(farm))}
                    </span>
                    {!active && <BandBadge score={farm.score?.terra_score} />}
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {selected && (
        <div className="paper absolute bottom-6 left-1/2 z-[1000] flex w-[min(560px,calc(100vw-2rem))] -translate-x-1/2 items-center gap-4 rounded-3xl p-4">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-sand text-olive">
            <Locate size={18} />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="font-display truncate text-lg text-olive">{selected.name}</span>
              <StatusBadge status={selected.status} />
            </div>
            <div className="text-xs text-muted">
              {selected.owner} · {selected.district} · {fmtHa(farmHectares(selected))} · {selected.seasons.length} seasons on file
            </div>
          </div>
          <Link to={`/farms/${selected.id}`} className="focus-ring inline-flex h-9 shrink-0 items-center gap-1 rounded-full bg-terracotta px-4 text-xs font-semibold text-cream hover:bg-terracotta-2">
            Credit file <ArrowRight size={14} />
          </Link>
        </div>
      )}
    </div>
  )
}
