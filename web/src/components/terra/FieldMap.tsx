import { useEffect } from 'react'
import { MapContainer, Polygon, TileLayer, Tooltip, useMap } from 'react-leaflet'
import { latLngBounds } from 'leaflet'
import type { Farm } from '../../types'
import { ringPositions } from '../../lib/score'
import { cx } from '../../lib/format'

export const ESRI_URL = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
export const ESRI_ATTR = 'Imagery © Esri, Maxar, Earthstar Geographics'

function FitBounds({ farm, pad }: { farm: Farm; pad: number }) {
  const map = useMap()
  useEffect(() => {
    map.fitBounds(latLngBounds(ringPositions(farm)).pad(pad), { animate: false })
  }, [farm, map, pad])
  return null
}

interface Props {
  farm: Farm
  fill?: string
  className?: string
  interactive?: boolean
  scanning?: boolean
  pad?: number
  label?: string
}

export default function FieldMap({ farm, fill = '#e6c94a', className, interactive = true, scanning = false, pad = 1.1, label }: Props) {
  const positions = ringPositions(farm)
  return (
    <div className={cx('relative overflow-hidden rounded-3xl border border-line', className)}>
      <MapContainer
        bounds={latLngBounds(positions).pad(pad)}
        scrollWheelZoom={interactive}
        dragging={interactive}
        zoomControl={interactive}
        doubleClickZoom={interactive}
        attributionControl={interactive}
        className="h-full w-full"
      >
        <TileLayer url={ESRI_URL} attribution={ESRI_ATTR} maxZoom={18} />
        <Polygon positions={positions} pathOptions={{ color: '#fcf9f2', weight: 2.5, fillColor: fill, fillOpacity: 0.45 }}>
          {label && <Tooltip permanent direction="top">{label}</Tooltip>}
        </Polygon>
        <FitBounds farm={farm} pad={pad} />
      </MapContainer>
      {scanning && (
        <div className="pointer-events-none absolute inset-0 z-[500] overflow-hidden">
          <div className="scan-line" />
          <div className="absolute inset-0 bg-[linear-gradient(transparent_0,transparent_calc(100%-1px),rgba(252,249,242,0.25)_calc(100%-1px))] bg-[length:100%_12px] opacity-40" />
        </div>
      )}
    </div>
  )
}
