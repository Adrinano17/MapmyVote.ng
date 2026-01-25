"use client"

import dynamic from "next/dynamic"
import type { PollingUnit, Ward } from "@/lib/types"

interface CustomMapWrapperProps {
  pollingUnits: (PollingUnit & { ward?: Ward })[]
  userLocation?: { latitude: number; longitude: number }
  selectedPollingUnit?: PollingUnit & { ward?: Ward }
  routePolyline?: string
  landmarks?: Array<{ name: string; latitude: number; longitude: number; category: string }>
  center?: [number, number]
  zoom?: number
  simpleMode?: boolean
  onMarkerClick?: (pollingUnit: PollingUnit & { ward?: Ward }) => void
}

// Dynamically import Mapbox map to avoid SSR issues
const CustomMapMapbox = dynamic(
  () => import("./custom-map-mapbox").then((mod) => ({ default: mod.CustomMapMapbox })),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center bg-muted">
        <div className="text-center">
          <div className="mb-2 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
          <p className="text-sm text-muted-foreground">Loading map...</p>
        </div>
      </div>
    ),
  }
)

export function CustomMap(props: CustomMapWrapperProps) {
  return <CustomMapMapbox {...props} />
}


