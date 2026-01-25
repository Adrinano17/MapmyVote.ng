"use client"

import { useEffect, useRef } from "react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

interface PollingUnitMapProps {
  latitude: number
  longitude: number
  name: string
}

export function PollingUnitMap({ latitude, longitude, name }: PollingUnitMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (typeof window === "undefined" || !mapRef.current) return

    let map: L.Map | null = null

    const initMap = async () => {
      map = L.map(mapRef.current!, {
        center: [latitude, longitude],
        zoom: 16,
        zoomControl: true,
      })

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(map)

      // Custom marker icon
      const customIcon = L.divIcon({
        className: "custom-marker",
        html: `<div class="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-primary-foreground shadow-lg border-2 border-white">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
            <circle cx="12" cy="10" r="3"></circle>
          </svg>
        </div>`,
        iconSize: [40, 40],
        iconAnchor: [20, 40],
      })

      L.marker([latitude, longitude], { icon: customIcon }).addTo(map).bindPopup(`<strong>${name}</strong>`).openPopup()
    }

    initMap()

    return () => {
      if (map) {
        map.remove()
      }
    }
  }, [latitude, longitude, name])

  return <div ref={mapRef} className="h-80 w-full md:h-96" />
}
