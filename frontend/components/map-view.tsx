"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { MapPin, Search, X, Navigation, ChevronDown, Layers, List } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useLanguage } from "@/hooks/use-language"
import { translations, type PollingUnit, type Ward } from "@/lib/types"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

interface MapViewProps {
  pollingUnits: (PollingUnit & { ward?: Ward })[]
  wards: Ward[]
  initialQuery?: string
  initialWard?: string
}

export function MapView({ pollingUnits, wards, initialQuery = "", initialWard = "" }: MapViewProps) {
  const [query, setQuery] = useState(initialQuery)
  const [selectedWard, setSelectedWard] = useState(initialWard)
  const [selectedUnit, setSelectedUnit] = useState<(PollingUnit & { ward?: Ward }) | null>(null)
  const [mapLoaded, setMapLoaded] = useState(false)
  const mapRef = useRef<HTMLDivElement>(null)
  const leafletMapRef = useRef<L.Map | null>(null)
  const markersRef = useRef<L.Marker[]>([])

  const { language } = useLanguage()
  const t = translations[language]

  // Filter polling units based on search and ward
  const filteredUnits = pollingUnits.filter((pu) => {
    const matchesQuery =
      !query ||
      pu.name.toLowerCase().includes(query.toLowerCase()) ||
      pu.code.toLowerCase().includes(query.toLowerCase()) ||
      pu.address?.toLowerCase().includes(query.toLowerCase())

    const matchesWard = !selectedWard || pu.ward?.code === selectedWard

    return matchesQuery && matchesWard
  })

  // Initialize map
  useEffect(() => {
    if (typeof window === "undefined" || !mapRef.current) return

    const initMap = async () => {
      if (leafletMapRef.current) {
        leafletMapRef.current.remove()
      }

      const map = L.map(mapRef.current!, {
        center: [7.4, 3.91],
        zoom: 13,
        zoomControl: false,
      })

      L.control.zoom({ position: "bottomright" }).addTo(map)

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(map)

      leafletMapRef.current = map
      setMapLoaded(true)
    }

    initMap()

    return () => {
      if (leafletMapRef.current) {
        leafletMapRef.current.remove()
        leafletMapRef.current = null
      }
    }
  }, [])

  // Update markers when filtered units change
  useEffect(() => {
    if (!mapLoaded || !leafletMapRef.current) return

    const updateMarkers = async () => {
      markersRef.current.forEach((marker) => marker.remove())
      markersRef.current = []

      const customIcon = L.divIcon({
        className: "custom-marker",
        html: `<div class="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground shadow-lg border-2 border-white">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
            <circle cx="12" cy="10" r="3"></circle>
          </svg>
        </div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
      })

      const selectedIcon = L.divIcon({
        className: "custom-marker-selected",
        html: `<div class="w-10 h-10 bg-destructive rounded-full flex items-center justify-center text-destructive-foreground shadow-lg border-2 border-white animate-pulse">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
            <circle cx="12" cy="10" r="3"></circle>
          </svg>
        </div>`,
        iconSize: [40, 40],
        iconAnchor: [20, 40],
      })

      const bounds: [number, number][] = []
      filteredUnits.forEach((pu) => {
        if (pu.latitude && pu.longitude) {
          const isSelected = selectedUnit?.id === pu.id
          const marker = L.marker([pu.latitude, pu.longitude], {
            icon: isSelected ? selectedIcon : customIcon,
          })
            .addTo(leafletMapRef.current!)
            .on("click", () => setSelectedUnit(pu))

          marker.bindTooltip(pu.name, { direction: "top", offset: [0, -32] })
          markersRef.current.push(marker)
          bounds.push([pu.latitude, pu.longitude])
        }
      })

      if (bounds.length > 0 && leafletMapRef.current) {
        leafletMapRef.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 })
      }
    }

    updateMarkers()
  }, [filteredUnits, mapLoaded, selectedUnit])

  const openDirections = useCallback((pu: PollingUnit) => {
    if (pu.latitude && pu.longitude) {
      const url = `https://www.google.com/maps/dir/?api=1&destination=${pu.latitude},${pu.longitude}`
      window.open(url, "_blank")
    }
  }, [])

  const currentWard = wards.find((w) => w.code === selectedWard)

  return (
    <div className="relative h-full w-full">
      {/* Map Container */}
      <div ref={mapRef} className="absolute inset-0 z-0" />

      {/* Search Overlay */}
      <div className="absolute left-4 right-4 top-4 z-10 md:left-4 md:right-auto md:w-80">
        <Card className="shadow-lg">
          <CardContent className="p-3">
            <div className="flex flex-col gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder={t.searchPrompt}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="pl-9 pr-8"
                />
                {query && (
                  <button
                    onClick={() => setQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full justify-between bg-transparent">
                    <span className="truncate">{currentWard ? currentWard.name : t.allWards}</span>
                    <ChevronDown className="h-4 w-4 shrink-0" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-72 max-h-60 overflow-y-auto">
                  <DropdownMenuItem onClick={() => setSelectedWard("")}>{t.allWards}</DropdownMenuItem>
                  {wards.map((ward) => (
                    <DropdownMenuItem key={ward.id} onClick={() => setSelectedWard(ward.code)}>
                      {ward.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <p className="text-xs text-muted-foreground text-center">
                {filteredUnits.length} {t.pollingUnits.toLowerCase()}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* List View Toggle (Mobile) */}
      <Sheet>
        <SheetTrigger asChild>
          <Button size="icon" className="absolute bottom-20 left-4 z-10 h-12 w-12 rounded-full shadow-lg md:hidden">
            <List className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="bottom" className="h-[70vh]">
          <SheetHeader>
            <SheetTitle>
              {t.pollingUnits} ({filteredUnits.length})
            </SheetTitle>
          </SheetHeader>
          <ScrollArea className="h-full mt-4">
            <div className="space-y-3 pb-4">
              {filteredUnits.map((pu) => (
                <button
                  key={pu.id}
                  onClick={() => {
                    setSelectedUnit(pu)
                    if (leafletMapRef.current && pu.latitude && pu.longitude) {
                      leafletMapRef.current.setView([pu.latitude, pu.longitude], 16)
                    }
                  }}
                  className={`w-full text-left rounded-lg border p-3 transition-colors ${
                    selectedUnit?.id === pu.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                  }`}
                >
                  <p className="font-medium text-foreground truncate">{pu.name}</p>
                  <p className="text-sm text-muted-foreground">{pu.code}</p>
                </button>
              ))}
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>

      {/* Selected Unit Card */}
      {selectedUnit && (
        <div className="absolute bottom-4 left-4 right-4 z-10 md:left-4 md:right-auto md:w-80">
          <Card className="shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <MapPin className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-foreground truncate">{selectedUnit.name}</h3>
                      <p className="text-xs text-muted-foreground">{selectedUnit.code}</p>
                    </div>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{selectedUnit.address}</p>
                  {selectedUnit.ward && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      {t.wards}: {selectedUnit.ward.name}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-muted-foreground">
                    {selectedUnit.registered_voters.toLocaleString()} {t.registeredVoters.toLowerCase()}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedUnit(null)}
                  className="shrink-0 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="mt-3 flex gap-2">
                <Button className="flex-1 gap-2" onClick={() => openDirections(selectedUnit)}>
                  <Navigation className="h-4 w-4" />
                  {t.getDirections}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Map Legend */}
      <div className="absolute bottom-4 right-4 z-10 hidden md:block">
        <Card className="shadow-lg">
          <CardContent className="p-3">
            <div className="flex items-center gap-2 text-sm">
              <Layers className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">{t.viewDetails}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
