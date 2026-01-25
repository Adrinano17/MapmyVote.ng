"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { NavigationManager } from "@/components/navigation/navigation-manager"
import { CustomMap } from "@/components/map/custom-map-wrapper"
import { NavigationSkeleton } from "@/components/skeletons/navigation-skeleton"
import { SimpleModeToggle } from "@/components/simple-mode-toggle"
import type { PollingUnit, Ward } from "@/lib/types"

function DirectionPageContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const codeFromUrl = searchParams.get("code")
  
  // #region agent log
  useEffect(() => {
    fetch('http://127.0.0.1:7242/ingest/a0691e2c-cdd7-47b0-9342-76cf3ac06d2f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'direction/page.tsx:component-mount',message:'DirectionPageContent component mounted',data:{codeFromUrl,hasCode:!!codeFromUrl},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
  }, [])
  // #endregion
  
  // Protected page - requires code
  useEffect(() => {
    if (!codeFromUrl) {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/a0691e2c-cdd7-47b0-9342-76cf3ac06d2f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'direction/page.tsx:protected-check',message:'No code in URL - redirecting to map',data:{codeFromUrl},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      router.push('/map')
      return
    }
  }, [codeFromUrl, router])

  const [pollingUnitData, setPollingUnitData] = useState<(PollingUnit & { ward?: Ward }) | null>(null)
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null)
  const [routePolyline, setRoutePolyline] = useState<string | null>(null)
  const [routeSteps, setRouteSteps] = useState<any[]>([])
  const [distance, setDistance] = useState<number | undefined>(undefined)
  const [time, setTime] = useState<number | undefined>(undefined)
  const [landmarks, setLandmarks] = useState<Array<{ name: string; latitude: number; longitude: number; category?: string; distance: number }>>([])
  const [simpleMode, setSimpleMode] = useState(false)
  const [gpsUnavailable, setGpsUnavailable] = useState(false)
  const [routingFailed, setRoutingFailed] = useState(false)

  // Fetch polling unit data
  useEffect(() => {
    if (codeFromUrl) {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/a0691e2c-cdd7-47b0-9342-76cf3ac06d2f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'direction/page.tsx:fetch-polling-unit',message:'Fetching polling unit data',data:{codeFromUrl},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      fetch(`/api/polling-unit/${codeFromUrl}`)
        .then(async (res) => {
          if (!res.ok) {
            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/a0691e2c-cdd7-47b0-9342-76cf3ac06d2f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'direction/page.tsx:polling-unit-error',message:'Polling unit API error',data:{status:res.status,statusText:res.statusText,codeFromUrl},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
            // #endregion
            throw new Error(`Polling unit API returned ${res.status}: ${res.statusText}`)
          }
          return res.json()
        })
        .then((data) => {
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/a0691e2c-cdd7-47b0-9342-76cf3ac06d2f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'direction/page.tsx:polling-unit-received',message:'Polling unit data received',data:{hasData:!!data,hasPollingUnit:!!data.pollingUnit,hasCode:!!data.code,code:data.code || data.pollingUnit?.code,lat:data.latitude || data.pollingUnit?.latitude,lng:data.longitude || data.pollingUnit?.longitude,dataKeys:Object.keys(data||{})},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
          // #endregion
          // API returns polling unit directly, not wrapped in pollingUnit property
          const pollingUnit = data.pollingUnit || data
          if (pollingUnit && pollingUnit.code) {
            setPollingUnitData(pollingUnit)
          } else {
            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/a0691e2c-cdd7-47b0-9342-76cf3ac06d2f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'direction/page.tsx:polling-unit-invalid',message:'Polling unit data invalid',data:{hasData:!!data,hasPollingUnit:!!pollingUnit,hasCode:!!pollingUnit?.code,data},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
            // #endregion
          }
        })
        .catch((error) => {
          console.error("Failed to fetch polling unit:", error)
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/a0691e2c-cdd7-47b0-9342-76cf3ac06d2f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'direction/page.tsx:polling-unit-error',message:'Failed to fetch polling unit',data:{error:error.message,codeFromUrl},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
          // #endregion
        })
    }
  }, [codeFromUrl])

  // Get user location
  useEffect(() => {
    if (pollingUnitData && navigator.geolocation) {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/a0691e2c-cdd7-47b0-9342-76cf3ac06d2f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'direction/page.tsx:get-location',message:'Requesting user location',data:{hasPollingUnitData:!!pollingUnitData,hasGeolocation:!!navigator.geolocation},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/a0691e2c-cdd7-47b0-9342-76cf3ac06d2f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'direction/page.tsx:location-received',message:'User location received',data:{lat:position.coords.latitude,lng:position.coords.longitude},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
          // #endregion
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          })
          setGpsUnavailable(false)
        },
        (error) => {
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/a0691e2c-cdd7-47b0-9342-76cf3ac06d2f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'direction/page.tsx:location-error',message:'User location error',data:{error:error.message,code:error.code},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
          // #endregion
          setGpsUnavailable(true)
        },
        { timeout: 15000, enableHighAccuracy: true }
      )

      // Update location periodically for real-time routing
      const interval = setInterval(() => {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setUserLocation({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            })
          },
          () => {}
        )
      }, 5000)

      return () => clearInterval(interval)
    }
  }, [pollingUnitData])

  // Fetch route
  useEffect(() => {
    if (
      userLocation &&
      pollingUnitData &&
      pollingUnitData.latitude &&
      pollingUnitData.longitude
    ) {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/a0691e2c-cdd7-47b0-9342-76cf3ac06d2f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'direction/page.tsx:fetch-route',message:'Fetching route',data:{hasUserLocation:!!userLocation,hasPollingUnitData:!!pollingUnitData,userLat:userLocation.latitude,userLng:userLocation.longitude,pollingUnitLat:pollingUnitData.latitude,pollingUnitLng:pollingUnitData.longitude},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      fetch("/api/directions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          origin: { lat: userLocation.latitude, lng: userLocation.longitude },
          destination: { lat: pollingUnitData.latitude, lng: pollingUnitData.longitude },
        }),
      })
        .then(async (res) => {
          if (!res.ok) {
            setRoutingFailed(true)
            throw new Error(`Directions API returned ${res.status}: ${res.statusText}`)
          }
          return res.json()
        })
        .then((data) => {
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/a0691e2c-cdd7-47b0-9342-76cf3ac06d2f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'direction/page.tsx:route-received',message:'Route data received',data:{hasRoutes:!!data.routes,routeCount:data.routes?.length || 0,hasPolyline:!!data.routes?.[0]?.overview_polyline?.points},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
          // #endregion
          if (data.routes && data.routes[0]) {
            setRoutingFailed(false)
            const route = data.routes[0]
            const leg = route.legs[0]
            
            setDistance(leg.distance.value)
            setTime(Math.round(leg.duration.value / 60))
            
            if (route.overview_polyline?.points) {
              setRoutePolyline(route.overview_polyline.points)
              // #region agent log
              fetch('http://127.0.0.1:7242/ingest/a0691e2c-cdd7-47b0-9342-76cf3ac06d2f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'direction/page.tsx:polyline-set',message:'Route polyline set',data:{polylineLength:route.overview_polyline.points.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
              // #endregion
            }

            // Store route steps for turn-by-turn navigation
            if (leg.steps) {
              setRouteSteps(leg.steps)
              // #region agent log
              fetch('http://127.0.0.1:7242/ingest/a0691e2c-cdd7-47b0-9342-76cf3ac06d2f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'direction/page.tsx:route-steps-set',message:'Route steps set',data:{stepsCount:leg.steps.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
              // #endregion
            }

            // Extract route points for landmark search
            const routePoints: Array<{ lat: number; lng: number }> = []
            if (route.legs[0]?.steps) {
              route.legs[0].steps.forEach((step: any) => {
                routePoints.push({
                  lat: step.start_location.lat,
                  lng: step.start_location.lng,
                })
              })
            }
            routePoints.push({
              lat: leg.end_location.lat,
              lng: leg.end_location.lng,
            })

            // Get landmarks along route
            fetch("/api/landmarks", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ routePoints, radius: 50 }),
            })
              .then((res) => res.json())
              .then((landmarkData) => {
                if (landmarkData.landmarks) {
                  setLandmarks(
                    landmarkData.landmarks.map((lm: any) => ({
                      name: lm.name,
                      latitude: lm.latitude,
                      longitude: lm.longitude,
                      category: lm.category,
                      distance: lm.distance || 0,
                    }))
                  )
                }
              })
              .catch((error) => {
                console.error("Landmark fetch error:", error)
              })
          } else {
            setRoutingFailed(true)
          }
        })
        .catch((error) => {
          console.error("Directions fetch error:", error)
          setRoutingFailed(true)
        })
    }
  }, [userLocation, pollingUnitData])

  // Calculate distance to polling unit
  useEffect(() => {
    if (userLocation && pollingUnitData?.latitude && pollingUnitData.longitude) {
      const R = 6371e3 // Earth radius in meters
      const φ1 = (userLocation.latitude * Math.PI) / 180
      const φ2 = ((pollingUnitData.latitude || 0) * Math.PI) / 180
      const Δφ = (((pollingUnitData.latitude || 0) - userLocation.latitude) * Math.PI) / 180
      const Δλ = (((pollingUnitData.longitude || 0) - userLocation.longitude) * Math.PI) / 180

      const a =
        Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

      const distanceMeters = R * c
      setDistance(distanceMeters)
    }
  }, [userLocation, pollingUnitData])

  // Mapbox uses [lng, lat] format
  const mapCenter: [number, number] | undefined =
    userLocation && pollingUnitData?.latitude && pollingUnitData.longitude
      ? [
          (userLocation.longitude + (pollingUnitData.longitude || 0)) / 2,
          (userLocation.latitude + (pollingUnitData.latitude || 0)) / 2,
        ]
      : userLocation
      ? [userLocation.longitude, userLocation.latitude]
      : pollingUnitData?.latitude && pollingUnitData.longitude
      ? [pollingUnitData.longitude, pollingUnitData.latitude]
      : [3.91, 7.4] // [lng, lat] for Ibadan North LGA

  const nearestLandmark =
    landmarks.length > 0
      ? landmarks.reduce((prev, curr) => (curr.distance < prev.distance ? curr : prev))
      : undefined

  // #region agent log
  useEffect(() => {
    fetch('http://127.0.0.1:7242/ingest/a0691e2c-cdd7-47b0-9342-76cf3ac06d2f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'direction/page.tsx:render',message:'DirectionPageContent render',data:{hasCode:!!codeFromUrl,hasPollingUnitData:!!pollingUnitData,hasUserLocation:!!userLocation,hasRoutePolyline:!!routePolyline,hasRouteSteps:routeSteps.length > 0,routeStepsCount:routeSteps.length,hasDistance:distance !== undefined,hasTime:time !== undefined},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
  }, [codeFromUrl, pollingUnitData, userLocation, routePolyline, routeSteps, distance, time])
  // #endregion

  // Show split layout (directions on left, map on right)
  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-4rem)] w-full overflow-hidden">
      {/* Left Sidebar - Navigation Directions */}
      <div className="hidden md:flex w-80 lg:w-96 flex-col border-r border-border bg-background overflow-y-auto">
        <div className="p-4">
          {/* Simple Mode Toggle */}
          <div className="mb-4">
            <SimpleModeToggle simpleMode={simpleMode} onToggle={setSimpleMode} />
          </div>
          {/* Navigation Manager */}
          <NavigationManager
            userLocation={userLocation || undefined}
            pollingUnitLocation={
              pollingUnitData?.latitude && pollingUnitData.longitude
                ? { latitude: pollingUnitData.latitude, longitude: pollingUnitData.longitude }
                : undefined
            }
            distance={distance}
            time={time}
            landmarks={landmarks.map((lm) => ({ name: lm.name, distance: lm.distance, category: lm.category || "other" }))}
            nearestLandmark={nearestLandmark}
            simpleMode={simpleMode}
            onSimpleModeToggle={setSimpleMode}
            gpsUnavailable={gpsUnavailable}
            routingFailed={routingFailed}
            pollingUnitData={pollingUnitData}
            routeSteps={routeSteps}
          />
        </div>
      </div>

      {/* Right Side - Map */}
      <div className="relative flex-1 h-full w-full min-h-0">
        {/* Simple Mode Toggle - Mobile */}
        <div className="absolute top-4 left-4 z-50 md:hidden">
          <SimpleModeToggle simpleMode={simpleMode} onToggle={setSimpleMode} />
        </div>
        {/* Map - Full screen for navigation */}
        {(() => {
          const hasPollingUnit = !!(pollingUnitData && pollingUnitData.latitude && pollingUnitData.longitude)
          return hasPollingUnit;
        })() ? (
          <CustomMap
            pollingUnits={pollingUnitData ? [pollingUnitData] : []}
            userLocation={userLocation || undefined}
            selectedPollingUnit={pollingUnitData || undefined}
            routePolyline={routePolyline || undefined}
            landmarks={landmarks.map(l => ({ ...l, category: l.category || 'landmark' }))}
            center={mapCenter}
            zoom={15}
            simpleMode={simpleMode}
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-muted">
            <div className="text-center">
              <p className="text-muted-foreground">
                {!userLocation && !pollingUnitData
                  ? "Loading map and locations..."
                  : !userLocation
                  ? "Getting your location..."
                  : !pollingUnitData
                  ? "Loading polling unit..."
                  : "Loading map..."}
              </p>
            </div>
          </div>
        )}

        {/* Navigation Manager - Mobile Overlay */}
        <div className="absolute inset-x-0 bottom-4 z-50 md:hidden px-4">
          <NavigationManager
            userLocation={userLocation || undefined}
            pollingUnitLocation={
              pollingUnitData?.latitude && pollingUnitData.longitude
                ? { latitude: pollingUnitData.latitude, longitude: pollingUnitData.longitude }
                : undefined
            }
            distance={distance}
            time={time}
            landmarks={landmarks.map((lm) => ({ name: lm.name, distance: lm.distance, category: lm.category || "other" }))}
            nearestLandmark={nearestLandmark}
            simpleMode={simpleMode}
            onSimpleModeToggle={setSimpleMode}
            gpsUnavailable={gpsUnavailable}
            routingFailed={routingFailed}
            pollingUnitData={pollingUnitData}
            routeSteps={routeSteps}
          />
        </div>
      </div>
    </div>
  )
}

export default function DirectionPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <Suspense fallback={<NavigationSkeleton />}>
          <DirectionPageContent />
        </Suspense>
      </main>
      <Footer />
    </div>
  )
}

