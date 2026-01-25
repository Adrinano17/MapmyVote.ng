"use client"

import { useEffect, useState } from "react"
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import type { PollingUnit, Ward } from "@/lib/types"

// Fix for default marker icons in Next.js
if (typeof window !== "undefined") {
  delete (L.Icon.Default.prototype as any)._getIconUrl
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
    iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  })
}

interface CustomMapProps {
  pollingUnits: (PollingUnit & { ward?: Ward })[]
  userLocation?: { latitude: number; longitude: number }
  selectedPollingUnit?: PollingUnit & { ward?: Ward }
  routePolyline?: string // Encoded polyline string
  landmarks?: Array<{ name: string; latitude: number; longitude: number; category: string }>
  center?: [number, number]
  zoom?: number
  onMarkerClick?: (pollingUnit: PollingUnit & { ward?: Ward }) => void
}

// Component to handle map updates
function MapUpdater({
  center,
  zoom,
}: {
  center?: [number, number]
  zoom?: number
}) {
  const map = useMap()

  useEffect(() => {
    if (center && map) {
      map.setView(center, zoom || map.getZoom())
    }
  }, [center, zoom, map])

  return null
}

export function CustomMapLeaflet({
  pollingUnits,
  userLocation,
  selectedPollingUnit,
  routePolyline,
  landmarks,
  center = [7.4, 3.91],
  zoom = 13,
  onMarkerClick,
}: CustomMapProps) {
  const [mapReady, setMapReady] = useState(false)

  // Create custom icons
  const pollingUnitIcon = L.divIcon({
    className: "custom-polling-unit-marker",
    html: `<div class="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center text-white shadow-lg border-2 border-white">
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
        <circle cx="12" cy="10" r="3"></circle>
      </svg>
    </div>`,
    iconSize: [40, 40],
    iconAnchor: [20, 40],
  })

  const userLocationIcon = L.divIcon({
    className: "custom-user-marker",
    html: `<div class="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white shadow-lg border-2 border-white animate-pulse">
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <circle cx="12" cy="12" r="8"></circle>
      </svg>
    </div>`,
    iconSize: [40, 40],
    iconAnchor: [20, 40],
  })

  const selectedIcon = L.divIcon({
    className: "custom-selected-marker",
    html: `<div class="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-primary-foreground shadow-xl border-4 border-white ring-2 ring-primary">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
        <circle cx="12" cy="10" r="3"></circle>
      </svg>
    </div>`,
    iconSize: [48, 48],
    iconAnchor: [24, 48],
  })

  const landmarkIcon = (category: string) => {
    const colors: Record<string, string> = {
      school: "bg-yellow-500",
      mosque: "bg-green-500",
      church: "bg-blue-500",
      market: "bg-orange-500",
      bus_stop: "bg-purple-500",
      other: "bg-gray-500",
    }

    return L.divIcon({
      className: "custom-landmark-marker",
      html: `<div class="w-8 h-8 ${colors[category] || colors.other} rounded-full flex items-center justify-center text-white shadow-md border-2 border-white">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0Z"></path>
          <circle cx="12" cy="10" r="3"></circle>
        </svg>
      </div>`,
      iconSize: [32, 32],
      iconAnchor: [16, 32],
    })
  }

  // Decode polyline if provided
  const routeCoordinates = routePolyline
    ? decodePolyline(routePolyline)
    : undefined

  useEffect(() => {
    setMapReady(true)
  }, [])

  if (typeof window === "undefined" || !mapReady) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-muted">
        <div className="text-center">
          <div className="mb-2 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
          <p className="text-sm text-muted-foreground">Loading map...</p>
        </div>
      </div>
    )
  }

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      style={{ height: "100%", width: "100%", zIndex: 0 }}
      zoomControl={true}
      scrollWheelZoom={true}
      className="custom-map-container"
    >
      {/* Use Google Maps tiles as backend (Option A architecture) */}
      <TileLayer
        url={`https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}`}
        attribution='&copy; <a href="https://www.google.com/maps">Google Maps</a>'
        maxZoom={19}
      />

      <MapUpdater center={center} zoom={zoom} />

      {/* User location marker */}
      {userLocation && (
        <Marker
          position={[userLocation.latitude, userLocation.longitude]}
          icon={userLocationIcon}
        >
          <Popup>
            <div className="text-sm font-semibold">Your Location</div>
          </Popup>
        </Marker>
      )}

      {/* Polling unit markers */}
      {pollingUnits.map((pu) => {
        if (!pu.latitude || !pu.longitude) return null

        const isSelected = selectedPollingUnit?.id === pu.id

        return (
          <Marker
            key={pu.id}
            position={[pu.latitude, pu.longitude]}
            icon={isSelected ? selectedIcon : pollingUnitIcon}
            eventHandlers={{
              click: () => {
                if (onMarkerClick) {
                  onMarkerClick(pu)
                }
              },
            }}
          >
            <Popup>
              <div className="text-sm">
                <div className="font-semibold">{pu.name}</div>
                <div className="text-xs text-muted-foreground">{pu.code}</div>
                {pu.ward && (
                  <div className="text-xs text-muted-foreground">Ward: {pu.ward.name}</div>
                )}
              </div>
            </Popup>
          </Marker>
        )
      })}

      {/* Landmark markers */}
      {landmarks?.map((landmark, idx) => (
        <Marker
          key={`landmark-${idx}`}
          position={[landmark.latitude, landmark.longitude]}
          icon={landmarkIcon(landmark.category)}
        >
          <Popup>
            <div className="text-sm">
              <div className="font-semibold">{landmark.name}</div>
              <div className="text-xs text-muted-foreground capitalize">{landmark.category}</div>
            </div>
          </Popup>
        </Marker>
      ))}

      {/* Route polyline */}
      {routeCoordinates && routeCoordinates.length > 0 && (
        <Polyline
          positions={routeCoordinates}
          color="#3b82f6"
          weight={4}
          opacity={0.7}
          dashArray="10, 10"
        />
      )}
    </MapContainer>
  )
}

/**
 * Decode Google Maps polyline string to coordinates
 */
function decodePolyline(encoded: string): [number, number][] {
  const poly: [number, number][] = []
  let index = 0
  const len = encoded.length
  let lat = 0
  let lng = 0

  while (index < len) {
    let b
    let shift = 0
    let result = 0
    do {
      b = encoded.charCodeAt(index++) - 63
      result |= (b & 0x1f) << shift
      shift += 5
    } while (b >= 0x20)
    const dlat = (result & 1) !== 0 ? ~(result >> 1) : result >> 1
    lat += dlat

    shift = 0
    result = 0
    do {
      b = encoded.charCodeAt(index++) - 63
      result |= (b & 0x1f) << shift
      shift += 5
    } while (b >= 0x20)
    const dlng = (result & 1) !== 0 ? ~(result >> 1) : result >> 1
    lng += dlng

    poly.push([lat * 1e-5, lng * 1e-5])
  }

  return poly
}
















