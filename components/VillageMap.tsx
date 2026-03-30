'use client'

import 'leaflet/dist/leaflet.css'
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet'

type MapPoint = {
  id: number
  title: string
  description: string | null
  lat: number
  lng: number
  type: string | null
}

type Props = {
  points: MapPoint[]
}

const villagePosition: [number, number] = [42.809503, 75.088762]

export default function VillageMap({ points }: Props) {
  return (
    <div style={{ width: '100%', height: '560px', borderRadius: 20, overflow: 'hidden' }}>
      <MapContainer
        center={villagePosition}
        zoom={15}
        scrollWheelZoom={true}
        style={{ width: '100%', height: '100%' }}
      >
        <TileLayer
          url={`https://api.maptiler.com/maps/satellite/{z}/{x}/{y}.jpg?key=${process.env.NEXT_PUBLIC_MAPTILER_KEY}`}
          tileSize={512}
          zoomOffset={-1}
          minZoom={1}
          attribution='&copy; <a href="https://www.maptiler.com/copyright/" target="_blank">MapTiler</a> &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap contributors</a>'
        />

        {points.map((point) => (
          <CircleMarker
            key={point.id}
            center={[point.lat, point.lng]}
            radius={8}
          >
            <Popup>
              <div>
                <strong>{point.title}</strong>
                {point.type && <div>Тип: {point.type}</div>}
                {point.description && <div>{point.description}</div>}
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  )
}