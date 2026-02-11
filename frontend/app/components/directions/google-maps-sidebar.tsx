"use client"

import { useState } from "react"
import { MapPin, Navigation, Car, Bike, Bus, ChevronRight, Map, List, Share2, Copy, Menu } from "lucide-react"
import { formatDistance, formatDurationWithRange, formatDuration } from "@/lib/map-utils"
import type { PollingUnit, Ward } from "@/lib/types"

interface GoogleMapsSidebarProps {
  origin?: { latitude: number; longitude: number; address?: string }
  destination?: PollingUnit & { ward?: Ward }
  distance?: number // in meters
  duration?: number // in seconds
  routeSteps?: any[]
  onShowDetails?: () => void
  onShowPreview?: () => void
}

type TravelMode = "walking" | "driving" | "cycling" | "transit"

export function GoogleMapsSidebar({
  origin,
  destination,
  distance,
  duration,
  routeSteps,
  onShowDetails,
  onShowPreview,
}: GoogleMapsSidebarProps) {
  const [selectedMode, setSelectedMode] = useState<TravelMode>("walking")
  const [showDetails, setShowDetails] = useState(false)

  // Extract "via" roads from route steps
  const viaRoads = routeSteps
    ?.map((step) => {
      const instruction = step.html_instructions || step.instruction || ""
      // Extract road names from instructions (simple heuristic)
      const roadMatch = instruction.match(/(?:onto|via|on)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i)
      return roadMatch ? roadMatch[1] : null
    })
    .filter((road, index, self) => road && self.indexOf(road) === index)
    .slice(0, 2) // Take first 2 unique roads

  const travelModes: Array<{ mode: TravelMode; icon: React.ReactNode; label: string; time?: string }> = [
    { mode: "walking", icon: <Navigation className="h-5 w-5" />, label: "Best", time: duration !== undefined ? formatDuration(duration) : undefined },
    { mode: "driving", icon: <Car className="h-5 w-5" />, label: "Car", time: duration !== undefined ? `${Math.round((duration || 0) / 60 * 0.7)} min` : undefined },
    { mode: "cycling", icon: <Bike className="h-5 w-5" />, label: "Motorcycle", time: duration !== undefined ? `${Math.round((duration || 0) / 60 * 0.6)} min` : undefined },
    { mode: "transit", icon: <Bus className="h-5 w-5" />, label: "Bus", time: duration !== undefined ? formatDuration(duration) : undefined },
  ]

  return (
    <div className="flex flex-col h-full bg-background overflow-hidden" style={{ height: '100%', maxHeight: '100%' }}>
      {/* Top Menu Bar */}
      <div className="flex items-center gap-2 px-4 py-2 border-b border-border flex-shrink-0">
        <button className="p-2 hover:bg-muted rounded-lg transition-colors">
          <Menu className="h-5 w-5 text-foreground" />
        </button>
      </div>

      {/* Travel Mode Selection */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border flex-shrink-0">
        {travelModes.map(({ mode, icon, label, time }) => (
          <button
            key={mode}
            onClick={() => setSelectedMode(mode)}
            className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors ${
              selectedMode === mode
                ? "bg-primary text-primary-foreground"
                : "bg-muted hover:bg-muted/80 text-muted-foreground"
            }`}
          >
            {icon}
            <span className="text-xs font-medium">{label}</span>
            {time && <span className="text-[10px] opacity-90">{time}</span>}
          </button>
        ))}
      </div>

      {/* Origin and Destination Inputs */}
      <div className="px-4 py-3 space-y-2 border-b border-border flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            A
          </div>
          <div className="flex-1 min-w-0">
            <input
              type="text"
              value={origin?.address || "Your location"}
              readOnly
              className="w-full bg-transparent border-none outline-none text-sm text-foreground placeholder:text-muted-foreground"
              placeholder="Choose starting point"
            />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            B
          </div>
          <div className="flex-1 min-w-0">
            <input
              type="text"
              value={destination?.name || destination?.address || "Destination"}
              readOnly
              className="w-full bg-transparent border-none outline-none text-sm text-foreground font-medium"
            />
            {destination?.address && (
              <p className="text-xs text-muted-foreground truncate">{destination.address}</p>
            )}
          </div>
        </div>
      </div>

      {/* Route Details Card */}
      {distance !== undefined && duration !== undefined && (
        <div className="px-4 py-4 border-b border-border flex-shrink-0">
          <div className="flex items-start gap-3">
            <div className="mt-1">
              {selectedMode === "walking" && <Navigation className="h-5 w-5 text-primary" />}
              {selectedMode === "driving" && <Car className="h-5 w-5 text-primary" />}
              {selectedMode === "cycling" && <Bike className="h-5 w-5 text-primary" />}
              {selectedMode === "transit" && <Bus className="h-5 w-5 text-primary" />}
            </div>
            <div className="flex-1 min-w-0">
              {viaRoads && viaRoads.length > 0 && (
                <p className="text-sm text-muted-foreground mb-1">
                  via {viaRoads.join(" and ")}
                </p>
              )}
              <div className="flex items-center gap-4 mb-2">
                <span className="text-lg font-semibold text-foreground">
                  {duration !== undefined ? formatDuration(duration) : "Calculating..."}
                </span>
                <span className="text-sm text-muted-foreground">
                  {distance !== undefined ? formatDistance(distance) : "Calculating..."}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setShowDetails(!showDetails)
                    onShowDetails?.()
                  }}
                  className="px-3 py-1.5 text-sm font-medium text-primary hover:bg-primary/10 rounded-md transition-colors"
                >
                  <List className="h-4 w-4 inline mr-1" />
                  Details
                </button>
                <button
                  onClick={onShowPreview}
                  className="px-3 py-1.5 text-sm font-medium text-primary hover:bg-primary/10 rounded-md transition-colors"
                >
                  <Map className="h-4 w-4 inline mr-1" />
                  Preview
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="px-4 py-3 space-y-2 border-b border-border flex-shrink-0">
        <div className="flex items-center gap-2">
          <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:bg-muted rounded-lg transition-colors">
            <Share2 className="h-4 w-4" />
            Send directions
          </button>
          <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:bg-muted rounded-lg transition-colors">
            <Copy className="h-4 w-4" />
            Copy link
          </button>
        </div>
      </div>

      {/* Route Steps (Details View) */}
      {showDetails && routeSteps && routeSteps.length > 0 && (
        <div className="flex-1 overflow-y-auto px-4 py-3 min-h-0">
          <div className="space-y-3">
            {routeSteps.map((step, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="mt-1 flex-shrink-0">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-xs font-semibold text-primary">{index + 1}</span>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className="text-sm text-foreground"
                    dangerouslySetInnerHTML={{
                      __html: step.html_instructions || step.instruction || `Step ${index + 1}`,
                    }}
                  />
                  {step.distance && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDistance(typeof step.distance === 'object' ? (step.distance.value || 0) : step.distance)}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Navigation Tabs (Bottom) */}
      <div className="flex items-center border-t border-border px-2 py-2 flex-shrink-0 mt-auto">
        <button className="flex-1 flex flex-col items-center gap-1 px-2 py-2 text-xs text-muted-foreground hover:text-foreground transition-colors">
          <span>Saved</span>
        </button>
        <button className="flex-1 flex flex-col items-center gap-1 px-2 py-2 text-xs text-muted-foreground hover:text-foreground transition-colors">
          <span>Recents</span>
        </button>
        <button className="flex-1 flex flex-col items-center gap-1 px-2 py-2 text-xs text-primary border-t-2 border-primary pt-1">
          <Navigation className="h-4 w-4" />
          <span className="truncate max-w-[60px]">
            {destination?.name?.substring(0, 10) || "Route"}...
          </span>
          <span className="text-[10px]">{duration !== undefined ? formatDuration(duration) : ""}</span>
        </button>
      </div>
    </div>
  )
}

