"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { MapPin, Search, X, ChevronDown, Layers, Navigation } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useLanguage } from "@/hooks/use-language"
import { translations, type PollingUnit, type Ward } from "@/lib/types"
import mapboxgl from "mapbox-gl"
import "mapbox-gl/dist/mapbox-gl.css"

interface MapViewProps {
  pollingUnits: (PollingUnit & { ward?: Ward })[]
  wards: Ward[]
  initialQuery?: string
  initialWard?: string
  initialLat?: number
  initialLng?: number
  initialCode?: string
}

export function MapView({
  pollingUnits,
  wards,
  initialQuery = "",
  initialWard = "",
  initialLat,
  initialLng,
  initialCode,
}: MapViewProps) {
  
  const [query, setQuery] = useState(initialQuery)
  const [selectedWard, setSelectedWard] = useState(initialWard)
  const [pollingUnitInput, setPollingUnitInput] = useState("")
  const [selectedUnit, setSelectedUnit] = useState<(PollingUnit & { ward?: Ward }) | null>(null)
  const [mapLoaded, setMapLoaded] = useState(false)
  const mapRef = useRef<HTMLDivElement>(null)
  const mapboxMapRef = useRef<mapboxgl.Map | null>(null)
  const markersRef = useRef<mapboxgl.Marker[]>([])

  const { language } = useLanguage()
  const t = translations[language]

  // Set selected ward from initialWard prop on mount
  useEffect(() => {
    if (initialWard && initialWard !== selectedWard) {
      setSelectedWard(initialWard)
    }
  }, [initialWard, selectedWard])

  // Handle initial coordinates and code from URL params
  useEffect(() => {
    // Wait for both map instance AND map to be loaded before flying to coordinates
    if (initialLat && initialLng && mapboxMapRef.current && mapLoaded) {
      // Find polling unit by code if provided
      if (initialCode) {
        const unit = pollingUnits.find((pu) => pu.code === initialCode)
        if (unit) {
          setSelectedUnit(unit)
          mapboxMapRef.current.flyTo({
            center: [initialLng, initialLat],
            zoom: 16,
          })
        } else {
          // If code not found, just center on coordinates
          mapboxMapRef.current.flyTo({
            center: [initialLng, initialLat],
            zoom: 16,
          })
        }
      } else {
        // Just center on coordinates if no code
        mapboxMapRef.current.flyTo({
          center: [initialLng, initialLat],
          zoom: 16,
        })
      }
    }
  }, [initialLat, initialLng, initialCode, pollingUnits, mapLoaded])

  // Filter polling units based on search and ward
  const filteredUnits = pollingUnits.filter((pu) => {
    // If ward is selected, filter by ward first
    const matchesWard = !selectedWard || pu.ward?.code === selectedWard
    
    if (!matchesWard) return false

    // Then filter by query if provided
    const matchesQuery =
      !pollingUnitInput ||
      pu.name.toLowerCase().includes(pollingUnitInput.toLowerCase()) ||
      pu.code.toLowerCase().includes(pollingUnitInput.toLowerCase()) ||
      pu.address?.toLowerCase().includes(pollingUnitInput.toLowerCase())

    return matchesQuery
  })

  // Initialize Mapbox map
  useEffect(() => {
    if (typeof window === "undefined" || !mapRef.current) {
      return
    }

    const MAPBOX_TOKEN = "pk.eyJ1IjoiYWRyaW5hbm8iLCJhIjoiY21rZmoxdXg2MGNvbTNlb2FvaDl1a3Z2aiJ9.ZpxI0XxvsEw2QtCIxN1E2Q"

    const initMap = async () => {
      try {
        if (mapboxMapRef.current) {
          mapboxMapRef.current.remove()
        }

        mapboxgl.accessToken = MAPBOX_TOKEN

        const map = new mapboxgl.Map({
          container: mapRef.current!,
          style: "mapbox://styles/mapbox/streets-v12",
          center: [3.91, 7.4], // [lng, lat] for Mapbox - Ibadan North LGA
          zoom: 13,
        })


      map.on("load", () => {
        const containerEl = mapRef.current
        setMapLoaded(true)
        // Force resize after load to ensure canvas matches container
        if (containerEl && containerEl.offsetHeight > 0) {
          setTimeout(() => {
            map.resize()
          }, 100)
        }
      })

        map.on("error", (e) => {
          console.error("Mapbox error:", e)
        })

        map.on("style.load", () => {
          // Force map resize to match container dimensions
          const containerEl = mapRef.current
          if (containerEl && containerEl.offsetHeight > 0) {
            map.resize()
          }
        })

        mapboxMapRef.current = map
      } catch (error: any) {
        console.error("Map initialization error:", error)
      }
    }

    initMap()

    return () => {
      if (mapboxMapRef.current) {
        mapboxMapRef.current.remove()
        mapboxMapRef.current = null
      }
    }
  }, [])

  // Update markers when filtered units change
  useEffect(() => {
    if (!mapLoaded || !mapboxMapRef.current) return

    const updateMarkers = async () => {
      markersRef.current.forEach((marker) => marker.remove())
      markersRef.current = []

      const bounds = new mapboxgl.LngLatBounds()

      filteredUnits.forEach((pu) => {
        if (pu.latitude && pu.longitude) {
          const isSelected = selectedUnit?.id === pu.id

          // Create custom marker element
          const el = document.createElement("div")
          el.className = "custom-marker"
          el.style.width = isSelected ? "48px" : "32px"
          el.style.height = isSelected ? "48px" : "32px"
          el.style.borderRadius = "50%"
          el.style.backgroundColor = isSelected ? "rgb(239, 68, 68)" : "rgb(59, 130, 246)"
          el.style.border = "3px solid white"
          el.style.boxShadow = "0 2px 8px rgba(0,0,0,0.3)"
          el.style.cursor = "pointer"
          el.style.display = "flex"
          el.style.alignItems = "center"
          el.style.justifyContent = "center"
          if (isSelected) {
            el.style.animation = "pulse 2s infinite"
          }

          // Add icon
          el.innerHTML = `
            <svg width="${isSelected ? "24" : "16"}" height="${isSelected ? "24" : "16"}" viewBox="0 0 24 24" fill="white">
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
          `

          el.addEventListener("click", () => setSelectedUnit(pu))

          const marker = new mapboxgl.Marker(el)
            .setLngLat([pu.longitude, pu.latitude])
            .setPopup(
              new mapboxgl.Popup({ offset: 25 }).setHTML(`
                <div class="text-sm">
                  <div class="font-semibold">${pu.name}</div>
                  <div class="text-xs text-muted-foreground">${pu.code}</div>
                  ${pu.ward ? `<div class="text-xs text-muted-foreground">Ward: ${pu.ward.name}</div>` : ""}
                </div>
              `)
            )
            .addTo(mapboxMapRef.current!)

          markersRef.current.push(marker)
          bounds.extend([pu.longitude, pu.latitude])
        }
      })

      if (bounds.isEmpty() === false && mapboxMapRef.current) {
        mapboxMapRef.current.fitBounds(bounds, { padding: 50, maxZoom: 15 })
      }
    }

    updateMarkers()
  }, [filteredUnits, mapLoaded, selectedUnit])

  const currentWard = wards.find((w) => w.code === selectedWard)

  return (
    <div className="flex h-full w-full overflow-hidden">
      {/* Left Sidebar - Controls */}
      <div className="hidden md:flex w-80 lg:w-96 flex-col border-r border-border bg-background">
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-4">
            {/* Search */}
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

            {/* Ward Dropdown */}
            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">{t.wards}</label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full justify-between">
                    <span className="truncate">{currentWard ? currentWard.name : t.allWards}</span>
                    <ChevronDown className="h-4 w-4 shrink-0" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-[var(--radix-dropdown-menu-trigger-width)] max-h-60 overflow-y-auto">
                  <DropdownMenuItem onClick={() => {
                    setSelectedWard("")
                    setPollingUnitInput("")
                    setSelectedUnit(null)
                  }}>{t.allWards}</DropdownMenuItem>
                  {wards.map((ward) => (
                    <DropdownMenuItem key={ward.id} onClick={() => {
                      setSelectedWard(ward.code)
                      setPollingUnitInput("")
                      setSelectedUnit(null)
                    }}>
                      {ward.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Polling Unit Input */}
            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">
                {language === "yo" 
                  ? "Ẹka Idibo" 
                  : language === "pcm" 
                  ? "Polling Unit"
                  : "Polling Unit"}
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder={language === "yo" ? "Tẹ́ orukọ ẹka idibo..." : language === "pcm" ? "Enter polling unit name..." : "Enter polling unit name or code..."}
                  value={pollingUnitInput}
                  onChange={(e) => {
                    setPollingUnitInput(e.target.value)
                    // Auto-select if exact match found
                    const match = filteredUnits.find(
                      (pu) =>
                        pu.name.toLowerCase() === e.target.value.toLowerCase() ||
                        pu.code.toLowerCase() === e.target.value.toLowerCase()
                    )
                    if (match) {
                      setSelectedUnit(match)
                      if (mapboxMapRef.current && match.latitude && match.longitude) {
                        mapboxMapRef.current.flyTo({
                          center: [match.longitude, match.latitude],
                          zoom: 16,
                        })
                      }
                    }
                  }}
                  className="pl-9 pr-8"
                />
                {pollingUnitInput && (
                  <button
                    onClick={() => {
                      setPollingUnitInput("")
                      setSelectedUnit(null)
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              {/* Show matching suggestions */}
              {pollingUnitInput && filteredUnits.length > 0 && filteredUnits.length <= 10 && (
                <div className="mt-2 space-y-1 max-h-60 overflow-y-auto">
                  {filteredUnits.slice(0, 10).map((pu) => (
                    <button
                      key={pu.id}
                      onClick={() => {
                        setPollingUnitInput(pu.name)
                        setSelectedUnit(pu)
                        if (mapboxMapRef.current && pu.latitude && pu.longitude) {
                          mapboxMapRef.current.flyTo({
                            center: [pu.longitude, pu.latitude],
                            zoom: 16,
                          })
                        }
                      }}
                      className="w-full text-left px-3 py-2 text-sm rounded-md border border-border hover:bg-primary/5 hover:border-primary transition-colors"
                    >
                      <div className="font-medium text-foreground">{pu.name}</div>
                      <div className="text-xs text-muted-foreground">{pu.code}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Selected Unit Details */}
            {selectedUnit && (
              <Card>
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
                      {selectedUnit.registered_voters && (
                        <p className="mt-1 text-xs text-muted-foreground">
                          {(selectedUnit.registered_voters || 0).toLocaleString()} {language === "yo" ? "àwọn oníbò" : language === "pcm" ? "registered voters" : "registered voters"}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => setSelectedUnit(null)}
                      className="shrink-0 text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <Button className="flex-1 gap-2" onClick={() => {
                      if (selectedUnit?.code) {
                        // Route to direction page with polling unit code
                        const params = new URLSearchParams({ code: selectedUnit.code })
                        window.location.href = `/direction?${params.toString()}`
                      }
                    }}>
                      <Navigation className="h-4 w-4" />
                      {t.getDirections}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Polling Units List */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="text-sm font-medium text-foreground">
                  {t.pollingUnits} ({filteredUnits.length})
                </label>
              </div>
              <ScrollArea className="h-[300px] rounded-md border border-border">
                <div className="space-y-2 p-2">
                  {filteredUnits.map((pu) => (
                    <button
                      key={pu.id}
                      onClick={() => {
                        setSelectedUnit(pu)
                        setPollingUnitInput(pu.name)
                        if (mapboxMapRef.current && pu.latitude && pu.longitude) {
                          mapboxMapRef.current.flyTo({
                            center: [pu.longitude, pu.latitude],
                            zoom: 16,
                          })
                        }
                      }}
                      className={`w-full text-left rounded-lg border p-3 transition-colors ${
                        selectedUnit?.id === pu.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                      }`}
                    >
                      <p className="font-medium text-foreground truncate">{pu.name}</p>
                      <p className="text-sm text-muted-foreground">{pu.code}</p>
                      {pu.ward && (
                        <p className="text-xs text-muted-foreground mt-1">{pu.ward.name}</p>
                      )}
                    </button>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Map Only */}
      <div className="relative flex-1 h-full w-full">
        <div ref={mapRef} className="absolute inset-0 h-full w-full" />
        
        {/* Mobile Controls Overlay */}
        <div className="absolute inset-x-0 top-0 z-50 md:hidden bg-background/95 backdrop-blur-sm border-b border-border p-4 space-y-3 max-h-[60vh] overflow-y-auto">
          {/* Search */}
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

          {/* Ward Dropdown */}
          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">{t.wards}</label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full justify-between">
                  <span className="truncate">{currentWard ? currentWard.name : t.allWards}</span>
                  <ChevronDown className="h-4 w-4 shrink-0" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-[var(--radix-dropdown-menu-trigger-width)] max-h-60 overflow-y-auto">
                <DropdownMenuItem onClick={() => {
                  setSelectedWard("")
                  setPollingUnitInput("")
                  setSelectedUnit(null)
                }}>{t.allWards}</DropdownMenuItem>
                {wards.map((ward) => (
                  <DropdownMenuItem key={ward.id} onClick={() => {
                    setSelectedWard(ward.code)
                    setPollingUnitInput("")
                    setSelectedUnit(null)
                  }}>
                    {ward.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Polling Unit Input */}
          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">
              {language === "yo" 
                ? "Ẹka Idibo" 
                : language === "pcm" 
                ? "Polling Unit"
                : "Polling Unit"}
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder={language === "yo" ? "Tẹ́ orukọ ẹka idibo..." : language === "pcm" ? "Enter polling unit name..." : "Enter polling unit name or code..."}
                value={pollingUnitInput}
                onChange={(e) => {
                  setPollingUnitInput(e.target.value)
                  const match = filteredUnits.find(
                    (pu) =>
                      pu.name.toLowerCase() === e.target.value.toLowerCase() ||
                      pu.code.toLowerCase() === e.target.value.toLowerCase()
                  )
                  if (match) {
                    setSelectedUnit(match)
                    if (mapboxMapRef.current && match.latitude && match.longitude) {
                      mapboxMapRef.current.flyTo({
                        center: [match.longitude, match.latitude],
                        zoom: 16,
                      })
                    }
                  }
                }}
                className="pl-9 pr-8"
              />
              {pollingUnitInput && (
                <button
                  onClick={() => {
                    setPollingUnitInput("")
                    setSelectedUnit(null)
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {/* Selected Unit Details - Mobile */}
          {selectedUnit && (
            <Card>
              <CardContent className="p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <MapPin className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-semibold text-foreground truncate text-sm">{selectedUnit.name}</h3>
                        <p className="text-xs text-muted-foreground">{selectedUnit.code}</p>
                      </div>
                    </div>
                    <div className="mt-2">
                      <Button size="sm" className="w-full gap-2" onClick={() => {
                        if (selectedUnit?.code) {
                          const params = new URLSearchParams({ code: selectedUnit.code })
                          window.location.href = `/navigate?${params.toString()}`
                        }
                      }}>
                        <Navigation className="h-4 w-4" />
                        {t.getDirections}
                      </Button>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedUnit(null)}
                    className="shrink-0 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
