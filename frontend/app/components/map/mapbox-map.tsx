"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import mapboxgl from "mapbox-gl"
import "mapbox-gl/dist/mapbox-gl.css"
import type { PollingUnit, Ward } from "@/lib/types"
import { calculateDistance, formatDistance, formatDuration, IBADAN_NORTH_CENTER, adjustDurationForNigeria } from "@/lib/map-utils"

interface RouteStep {
  instruction: string
  distance: number
  duration: number
  coordinates: { lat: number; lng: number }
}

interface Landmark {
  name: string
  coordinates: { lat: number; lng: number }
  type: string
}

interface MapboxMapProps {
  selectedPollingUnit?: PollingUnit & { ward?: Ward } | null
  userLocation?: { lat: number; lng: number } | null
  onRouteCalculated?: (route: { distance: number; duration: number; steps: RouteStep[] }) => void
  simpleMode?: boolean
  landmarks?: Landmark[]
}

// Landmark icon mapping
const landmarkIcons: Record<string, string> = {
  school: "📚",
  mosque: "🕌",
  church: "⛪",
  market: "🏪",
  bus_stop: "🚌",
  hospital: "🏥",
  bank: "🏦",
}

export function MapboxMap({
  selectedPollingUnit,
  userLocation,
  onRouteCalculated,
  simpleMode = false,
  landmarks = [],
}: MapboxMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const userMarker = useRef<mapboxgl.Marker | null>(null)
  const destinationMarker = useRef<mapboxgl.Marker | null>(null)
  const landmarkMarkers = useRef<mapboxgl.Marker[]>([])
  const [routeInfo, setRouteInfo] = useState<{ distance: number; duration: number } | null>(null)
  const [isMapLoaded, setIsMapLoaded] = useState(false)

  const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || "pk.eyJ1IjoiYWRyaW5hbm8iLCJhIjoiY21rZmoxdXg2MGNvbTNlb2FvaDl1a3Z2aiJ9.ZpxI0XxvsEw2QtCIxN1E2Q"
  
  if (typeof window !== "undefined") {
    mapboxgl.accessToken = MAPBOX_TOKEN
  }

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [IBADAN_NORTH_CENTER.lng, IBADAN_NORTH_CENTER.lat],
      zoom: IBADAN_NORTH_CENTER.zoom,
    })

    map.current.addControl(new mapboxgl.NavigationControl(), "top-right")

    map.current.on("load", () => {
      setIsMapLoaded(true)
    })

    return () => {
      if (map.current) {
        map.current.remove()
        map.current = null
      }
    }
  }, [])

  // Add landmarks to map
  useEffect(() => {
    if (!map.current || !isMapLoaded) return

    // Clear existing landmark markers
    landmarkMarkers.current.forEach((marker) => marker.remove())
    landmarkMarkers.current = []

    if (simpleMode) return // Don't show landmarks in simple mode

    landmarks.forEach((landmark: Landmark) => {
      const el = document.createElement("div")
      el.className = "landmark-marker"
      el.innerHTML = `<span style="font-size: 20px;">${landmarkIcons[landmark.type] || "📍"}</span>`
      el.style.cursor = "pointer"

      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat([landmark.coordinates.lng, landmark.coordinates.lat])
        .setPopup(
          new mapboxgl.Popup({ offset: 25 }).setHTML(
            `<strong>${landmark.name}</strong><br/><span style="text-transform: capitalize;">${landmark.type.replace("_", " ")}</span>`
          )
        )
        .addTo(map.current!)

      landmarkMarkers.current.push(marker)
    })
  }, [isMapLoaded, simpleMode, landmarks])

  // Update user location marker
  useEffect(() => {
    if (!map.current || !isMapLoaded || !userLocation) return

    if (userMarker.current) {
      userMarker.current.setLngLat([userLocation.lng, userLocation.lat])
    } else {
      const el = document.createElement("div")
      el.className = "user-marker"
      el.innerHTML = `
        <div style="
          width: 24px;
          height: 24px;
          background: #3B82F6;
          border: 3px solid white;
          border-radius: 50%;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          position: relative;
        ">
          <div style="
            width: 8px;
            height: 8px;
            background: white;
            border-radius: 50%;
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
          "></div>
        </div>
      `
      userMarker.current = new mapboxgl.Marker({ element: el })
        .setLngLat([userLocation.lng, userLocation.lat])
        .addTo(map.current)
    }
  }, [userLocation, isMapLoaded])

  // Update destination marker and calculate route
  const fetchRoute = useCallback(async () => {
    if (!map.current || !isMapLoaded || !selectedPollingUnit || !userLocation) return

    // Add/update destination marker
    if (destinationMarker.current) {
      destinationMarker.current.setLngLat([
        selectedPollingUnit.longitude!,
        selectedPollingUnit.latitude!,
      ])
    } else {
      const el = document.createElement("div")
      el.className = "destination-marker"
      el.innerHTML = `
        <div style="
          width: 32px;
          height: 32px;
          background: #10B981;
          border: 3px solid white;
          border-radius: 50%;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
        ">✓</div>
      `
      destinationMarker.current = new mapboxgl.Marker({ element: el })
        .setLngLat([selectedPollingUnit.longitude!, selectedPollingUnit.latitude!])
        .setPopup(
          new mapboxgl.Popup({ offset: 25 }).setHTML(
            `<strong>${selectedPollingUnit.name}</strong><br/>${selectedPollingUnit.address || ""}`
          )
        )
        .addTo(map.current)
    }

    // Fetch walking route from Mapbox Directions API
    try {
      const response = await fetch(
        `https://api.mapbox.com/directions/v5/mapbox/walking/${userLocation.lng},${userLocation.lat};${selectedPollingUnit.longitude},${selectedPollingUnit.latitude}?steps=true&geometries=geojson&access_token=${mapboxgl.accessToken || MAPBOX_TOKEN}`
      )

      const data = await response.json()

      if (data.routes && data.routes.length > 0) {
        const route = data.routes[0]
        const routeGeometry = route.geometry

        // Remove existing route layer
        if (map.current.getSource("route")) {
          map.current.removeLayer("route")
          map.current.removeSource("route")
        }

        // Add route to map
        map.current.addSource("route", {
          type: "geojson",
          data: {
            type: "Feature",
            properties: {},
            geometry: routeGeometry,
          },
        })

        map.current.addLayer({
          id: "route",
          type: "line",
          source: "route",
          layout: {
            "line-join": "round",
            "line-cap": "round",
          },
          paint: {
            "line-color": "#3B82F6",
            "line-width": 5,
            "line-opacity": 0.8,
          },
        })

        // Fit map to show entire route
        const coordinates = routeGeometry.coordinates
        const bounds = coordinates.reduce(
          (bounds: mapboxgl.LngLatBounds, coord: [number, number]) => {
            return bounds.extend(coord)
          },
          new mapboxgl.LngLatBounds(coordinates[0], coordinates[0])
        )

        map.current.fitBounds(bounds, {
          padding: { top: 50, bottom: 150, left: 50, right: 50 },
        })

        // Apply Nigerian correction factor to duration for more accurate local estimates
        const adjustedDuration = adjustDurationForNigeria(route.duration)

        // Update route info
        setRouteInfo({
          distance: route.distance,
          duration: adjustedDuration,
        })

        // Convert route steps
        const steps: RouteStep[] = route.legs[0].steps.map(
          (step: {
            maneuver: { instruction: string; location: [number, number] }
            distance: number
            duration: number
          }) => ({
            instruction: step.maneuver.instruction,
            distance: step.distance,
            duration: adjustDurationForNigeria(step.duration),
            coordinates: {
              lat: step.maneuver.location[1],
              lng: step.maneuver.location[0],
            },
          })
        )

        onRouteCalculated?.({
          distance: route.distance,
          duration: route.duration,
          steps,
        })
      }
    } catch (error) {
      console.error("Error fetching route:", error)
    }
  }, [selectedPollingUnit, userLocation, isMapLoaded, onRouteCalculated, MAPBOX_TOKEN])

  useEffect(() => {
    fetchRoute()
  }, [fetchRoute])

  // Calculate distance to destination
  const distanceToDestination =
    selectedPollingUnit && userLocation
      ? calculateDistance(
          userLocation.lat,
          userLocation.lng,
          selectedPollingUnit.latitude!,
          selectedPollingUnit.longitude!
        )
      : null

  return (
    <div className="relative h-full w-full">
      <div ref={mapContainer} className="h-full w-full" />

      {/* Route Info Overlay */}
      {routeInfo && selectedPollingUnit && (
        <div className="absolute bottom-4 left-4 right-4 bg-background/95 backdrop-blur-sm rounded-lg p-4 shadow-lg border border-border">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-foreground">{selectedPollingUnit.name}</h3>
              <p className="text-sm text-muted-foreground">{selectedPollingUnit.address || ""}</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-primary">{formatDuration(routeInfo.duration)}</p>
              <p className="text-sm text-muted-foreground">{formatDistance(routeInfo.distance)}</p>
            </div>
          </div>

          {distanceToDestination !== null && distanceToDestination < 15 && (
            <div className="mt-3 p-2 bg-green-100 dark:bg-green-900/30 rounded-md">
              <p className="text-sm text-green-800 dark:text-green-200 font-medium text-center">
                You have arrived at your polling unit!
              </p>
            </div>
          )}
        </div>
      )}

      {/* Loading state */}
      {!isMapLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Loading map...</p>
          </div>
        </div>
      )}
    </div>
  )
}

