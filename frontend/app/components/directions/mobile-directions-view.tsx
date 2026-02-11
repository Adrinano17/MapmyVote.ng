"use client"

import { useState } from "react"
import { Navigation, Car, Bike, Bus, X, Filter, Share2, Map, Plus, ChevronRight, Info } from "lucide-react"
import { formatDistance, formatDuration } from "@/lib/map-utils"
import type { PollingUnit, Ward } from "@/lib/types"
import { useRouter } from "next/navigation"

interface MobileDirectionsViewProps {
  origin?: { latitude: number; longitude: number; address?: string }
  destination?: PollingUnit & { ward?: Ward }
  distance?: number // in meters
  duration?: number // in seconds
  routeSteps?: any[]
  onClose?: () => void
}

type TravelMode = "walking" | "driving" | "cycling" | "transit"

export function MobileDirectionsView({
  origin,
  destination,
  distance,
  duration,
  routeSteps,
  onClose,
}: MobileDirectionsViewProps) {
  const router = useRouter()
  const [selectedMode, setSelectedMode] = useState<TravelMode>("walking")

  // Extract "via" roads from route steps
  const viaRoads = routeSteps
    ?.map((step) => {
      const instruction = step.html_instructions || step.instruction || ""
      const roadMatch = instruction.match(/(?:onto|via|on)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i)
      return roadMatch ? roadMatch[1] : null
    })
    .filter((road, index, self) => road && self.indexOf(road) === index)
    .slice(0, 2)

  const travelModes: Array<{ mode: TravelMode; icon: React.ReactNode; label: string; time?: string }> = [
    { mode: "walking", icon: <Navigation className="h-5 w-5" />, label: "Walk", time: duration !== undefined ? formatDuration(duration) : undefined },
    { mode: "driving", icon: <Car className="h-5 w-5" />, label: "Car", time: duration !== undefined ? `${Math.round((duration || 0) / 60 * 0.7)} min` : undefined },
    { mode: "cycling", icon: <Bike className="h-5 w-5" />, label: "Motorcycle", time: duration !== undefined ? `${Math.round((duration || 0) / 60 * 0.6)} min` : undefined },
    { mode: "transit", icon: <Bus className="h-5 w-5" />, label: "Bus", time: duration !== undefined ? formatDuration(duration) : undefined },
  ]

  // Get maneuver icon based on instruction
  const getManeuverIcon = (instruction: string) => {
    const lower = instruction.toLowerCase()
    if (lower.includes("turn left") || lower.includes("left onto")) {
      return <ChevronRight className="h-5 w-5 rotate-[-90deg]" />
    } else if (lower.includes("turn right") || lower.includes("right onto")) {
      return <ChevronRight className="h-5 w-5 rotate-90" />
    } else if (lower.includes("slight left")) {
      return <ChevronRight className="h-5 w-5 rotate-[-45deg]" />
    } else if (lower.includes("slight right")) {
      return <ChevronRight className="h-5 w-5 rotate-45" />
    } else if (lower.includes("sharp left")) {
      return <ChevronRight className="h-5 w-5 rotate-[-135deg]" />
    } else if (lower.includes("sharp right")) {
      return <ChevronRight className="h-5 w-5 rotate-135" />
    } else if (lower.includes("continue") || lower.includes("straight")) {
      return <ChevronRight className="h-5 w-5 rotate-90" />
    }
    return <Navigation className="h-5 w-5" />
  }

  return (
    <div className="flex flex-col h-full bg-background overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b border-border">
        <div className="flex items-center justify-between px-4 py-3">
          <h1 className="text-2xl font-bold text-foreground">Walk</h1>
          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-muted rounded-full transition-colors">
              <Filter className="h-5 w-5 text-foreground" />
            </button>
            <button className="p-2 hover:bg-muted rounded-full transition-colors">
              <Share2 className="h-5 w-5 text-foreground" />
            </button>
            {onClose && (
              <button onClick={onClose} className="p-2 hover:bg-muted rounded-full transition-colors">
                <X className="h-5 w-5 text-foreground" />
              </button>
            )}
          </div>
        </div>

        {/* Transportation Modes */}
        <div className="flex items-center gap-3 px-4 pb-3 overflow-x-auto">
          {travelModes.map(({ mode, icon, label, time }) => (
            <button
              key={mode}
              onClick={() => setSelectedMode(mode)}
              className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors flex-shrink-0 ${
                selectedMode === mode
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {icon}
              <span className="text-xs font-medium">{label}</span>
              {time && <span className="text-[10px] opacity-90">{time}</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Route Summary */}
      {distance !== undefined && duration !== undefined && (
        <div className="px-4 py-4 border-b border-border bg-muted/30">
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-2xl font-semibold text-foreground">
              {formatDuration(duration)}
            </span>
            <span className="text-sm text-muted-foreground">
              ({formatDistance(distance)})
            </span>
          </div>
          {viaRoads && viaRoads.length > 0 && (
            <p className="text-sm text-muted-foreground">
              via {viaRoads.join(" and ")}
            </p>
          )}
        </div>
      )}

      {/* Warning Message */}
      <div className="px-4 py-3 bg-orange-500/10 border-l-4 border-orange-500">
        <div className="flex items-start gap-2">
          <Info className="h-5 w-5 text-orange-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-foreground">
            Use caution—walking directions may not always reflect real-world conditions.
          </p>
        </div>
      </div>

      {/* Steps Section */}
      <div className="px-4 py-2">
        <h2 className="text-lg font-semibold text-foreground mb-3">Steps</h2>
        
        {/* Starting Point */}
        <div className="flex items-start gap-3 mb-4">
          <div className="mt-1 flex-shrink-0">
            <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
              <span className="text-xs font-bold text-white">A</span>
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground">
              {origin?.address || "Your location"}
            </p>
          </div>
        </div>

        {/* Route Steps */}
        {routeSteps && routeSteps.length > 0 ? (
          <div className="space-y-4">
            {routeSteps.map((step, index) => {
              const instruction = step.html_instructions || step.instruction || ""
              const stepDistance = typeof step.distance === 'object' ? step.distance.value : step.distance
              
              return (
                <div key={index} className="flex items-start gap-3">
                  <div className="mt-1 flex-shrink-0">
                    {getManeuverIcon(instruction)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className="text-sm text-foreground mb-1"
                      dangerouslySetInnerHTML={{
                        __html: instruction,
                      }}
                    />
                    {stepDistance && (
                      <p className="text-xs text-muted-foreground">
                        {formatDistance(stepDistance)}
                      </p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground">Loading route steps...</p>
          </div>
        )}

        {/* Destination */}
        {destination && (
          <div className="flex items-start gap-3 mt-4 pt-4 border-t border-border">
            <div className="mt-1 flex-shrink-0">
              <div className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center">
                <span className="text-xs font-bold text-white">B</span>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground">
                {destination.name || "Destination"}
              </p>
              {destination.address && (
                <p className="text-xs text-muted-foreground mt-1">
                  {destination.address}
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Action Buttons */}
      <div className="sticky bottom-0 bg-background border-t border-border px-4 py-3 mt-auto">
        <div className="flex items-center gap-3">
          <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors">
            <Map className="h-4 w-4" />
            Preview
          </button>
          <button className="flex items-center justify-center gap-2 px-4 py-2.5 bg-teal-500 text-white rounded-lg font-medium hover:bg-teal-600 transition-colors">
            <Plus className="h-4 w-4" />
            Add stops
          </button>
          <button className="flex items-center justify-center gap-2 px-4 py-2.5 bg-teal-500 text-white rounded-lg font-medium hover:bg-teal-600 transition-colors">
            <Share2 className="h-4 w-4" />
            Share
          </button>
        </div>
      </div>
    </div>
  )
}

