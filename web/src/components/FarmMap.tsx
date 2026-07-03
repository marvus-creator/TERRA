import { MapContainer, TileLayer, Polygon, Tooltip } from 'react-leaflet'
import type { Farm } from '../types'

function scoreColor(score?: number | null) {
  if (!score) return '#94a3b8'
  if (score >= 760) return '#4ade80'
  if (score >= 700) return '#fbbf24'
  return '#f87171'
}

interface FarmMapProps {
  farms: Farm[]
  selectedId: string | null
  onSelect: (id: string) => void
}

export default function FarmMap({ farms, selectedId, onSelect }: FarmMapProps) {
  return (
    <MapContainer center={[-2.1785, 30.0845]} zoom={14} scrollWheelZoom className="h-full w-full">
      <TileLayer
        url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
        attribution="Imagery © Esri, Maxar, Earthstar Geographics"
        maxZoom={18}
      />
      {farms.map(farm => {
        const positions = farm.geometry.coordinates[0].map(
          ([lon, lat]) => [lat, lon] as [number, number],
        )
        const color = scoreColor(farm.score?.terra_score)
        const selected = farm.id === selectedId
        return (
          <Polygon
            key={farm.id}
            positions={positions}
            pathOptions={{
              color,
              weight: selected ? 4 : 2,
              fillColor: color,
              fillOpacity: selected ? 0.45 : 0.18,
            }}
            eventHandlers={{ click: () => onSelect(farm.id) }}
          >
            <Tooltip sticky>
              {farm.name}
              {farm.score ? ` · ${farm.score.terra_score}` : ''}
            </Tooltip>
          </Polygon>
        )
      })}
    </MapContainer>
  )
}
