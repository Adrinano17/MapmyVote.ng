"use client"

import { useEffect, useState, Suspense, useRef } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Navigation, ChevronRight } from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { CustomMap } from "@/components/map/custom-map-wrapper"
import { NavigationSkeleton } from "@/components/skeletons/navigation-skeleton"
import { SimpleModeToggle } from "@/components/simple-mode-toggle"
import { getStateMachine } from "@/lib/state-machine"
import type { PollingUnit, Ward } from "@/lib/types"
import { calculateDistance, estimateTravelTime, formatStraightLineDistance, formatDistance } from "@/lib/map-utils"
import { GoogleMapsSidebar } from "@/components/directions/google-maps-sidebar"
import { MobileDirectionsView } from "@/components/directions/mobile-directions-view"
import { useVoiceGuidance } from "@/hooks/use-voice-guidance"
import { useLanguage } from "@/hooks/use-language"
import { getNextTurnByTurnInstruction } from "@/lib/turn-by-turn-navigation"

function DirectionPageContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const codeFromUrl = searchParams.get("code")
  
  // #region agent log
  useEffect(() => {
    fetch('http://127.0.0.1:7242/ingest/a0691e2c-cdd7-47b0-9342-76cf3ac06d2f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'direction/page.tsx:component-mount',message:'DirectionPageContent component mounted',data:{codeFromUrl,hasCode:!!codeFromUrl},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'A'})}).catch(()=>{});
  }, [])
  
  // Clear navigation state when leaving direction page
  useEffect(() => {
    return () => {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/a0691e2c-cdd7-47b0-9342-76cf3ac06d2f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'direction/page.tsx:component-unmount',message:'DirectionPageContent unmounting - clearing navigation state',data:{codeFromUrl},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'J'})}).catch(()=>{});
      // #endregion
      const machine = getStateMachine()
      const currentState = machine.getCurrentState()
      // Only clear if we're in navigation state (not welcome/questions)
      if (currentState === 'navigation' || currentState === 'arrival') {
        machine.updateContext({
          pollingUnitCode: undefined,
          pollingUnitData: undefined,
          pollingUnitValidated: false,
          isNavigating: false,
          hasArrived: false,
          locationGranted: false,
        })
        machine.transitionTo('welcome')
        // Save cleared state immediately
        if (typeof window !== 'undefined') {
          localStorage.setItem("navigation_state", 'welcome')
          localStorage.setItem("navigation_context", JSON.stringify(machine.getContext()))
        }
      }
    }
  }, [codeFromUrl])
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
  const [hasRouteData, setHasRouteData] = useState(false)
  const [landmarks, setLandmarks] = useState<Array<{ name: string; latitude: number; longitude: number; category?: string; distance: number }>>([])
  const [simpleMode, setSimpleMode] = useState(false)
  const [gpsUnavailable, setGpsUnavailable] = useState(false)
  const [routingFailed, setRoutingFailed] = useState(false)
  
  // Voice navigation hooks
  const { speak, config } = useVoiceGuidance()
  const { language } = useLanguage()
  const previousDistanceRef = useRef<number | undefined>(undefined)
  const lastSpokenInstructionRef = useRef<string>("")
  const wrongDirectionWarningRef = useRef(false)
  const routeFetchedRef = useRef(false) // Track if route has been fetched
  const initialUserLocationRef = useRef<{ latitude: number; longitude: number } | null>(null)

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

      // Update location periodically for real-time tracking (but don't refetch route)
      // Only update if user has moved significantly (more than 10 meters)
      const interval = setInterval(() => {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const newLocation = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            }
            
            // Only update if user has moved significantly (more than 10 meters)
            if (userLocation) {
              const distanceMoved = calculateDistance(
                userLocation.latitude,
                userLocation.longitude,
                newLocation.latitude,
                newLocation.longitude
              )
              
              // Only update location if moved more than 10 meters
              if (distanceMoved > 10) {
                setUserLocation(newLocation)
              }
            } else {
              setUserLocation(newLocation)
            }
          },
          () => {}
        )
      }, 5000)

      return () => clearInterval(interval)
    }
  }, [pollingUnitData])

  // Fetch route - ONLY ONCE when we first have both locations
  useEffect(() => {
    if (
      userLocation &&
      pollingUnitData &&
      pollingUnitData.latitude &&
      pollingUnitData.longitude &&
      !routeFetchedRef.current // Only fetch once
    ) {
      // Store initial location
      initialUserLocationRef.current = userLocation
      routeFetchedRef.current = true
      
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/a0691e2c-cdd7-47b0-9342-76cf3ac06d2f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'direction/page.tsx:fetch-route',message:'Fetching route (first time)',data:{hasUserLocation:!!userLocation,hasPollingUnitData:!!pollingUnitData,userLat:userLocation.latitude,userLng:userLocation.longitude,pollingUnitLat:pollingUnitData.latitude,pollingUnitLng:pollingUnitData.longitude},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      // Reset route data flag when starting new route calculation
      setHasRouteData(false)
      setRoutingFailed(false)
      
      // Use initial location for route calculation (not the changing one)
      const originLocation = initialUserLocationRef.current
      
      fetch("/api/directions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          origin: { lat: originLocation.latitude, lng: originLocation.longitude },
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
            
            setHasRouteData(true)
            // Set distance and time from route - these should remain stable
            // Only set once when route is first received (prevent recalculation)
            setDistance((prevDistance) => prevDistance === undefined ? leg.distance.value : prevDistance)
            setTime((prevTime) => prevTime === undefined ? Math.round(leg.duration.value / 60) : prevTime)
            
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
            setHasRouteData(false)
            setRoutingFailed(true)
          }
        })
        .catch((error) => {
          console.error("Directions fetch error:", error)
          setHasRouteData(false)
          setRoutingFailed(true)
          routeFetchedRef.current = false // Allow retry on error
        })
    }
  }, [userLocation, pollingUnitData]) // Keep dependencies but use ref to prevent re-fetching

  // Calculate straight-line distance as fallback ONLY if route calculation failed
  useEffect(() => {
    // Only use fallback if we don't have route data and routing failed
    if (routingFailed && !hasRouteData && userLocation && pollingUnitData?.latitude && pollingUnitData.longitude) {
      // Use improved utility functions with Nigerian-optimized speeds
      const distanceMeters = calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        pollingUnitData.latitude || 0,
        pollingUnitData.longitude || 0
      )
      setDistance(distanceMeters)
      
      // Estimate time using Nigerian-optimized walking speed (4 km/h)
      // This handles short distances (< 500m) specially
      const estimatedMinutes = estimateTravelTime(distanceMeters, "walking")
      setTime(estimatedMinutes)
    }
  }, [routingFailed, hasRouteData, userLocation, pollingUnitData])

  // Voice navigation - provide turn-by-turn directions as user moves
  useEffect(() => {
    if (!userLocation || !pollingUnitData || !routeSteps.length || distance === undefined) {
      return
    }

    // Detect if user is moving in wrong direction
    if (previousDistanceRef.current !== undefined) {
      if (distance > previousDistanceRef.current + 20) {
        // User is moving away (distance increased by more than 20 meters)
        if (!wrongDirectionWarningRef.current) {
          wrongDirectionWarningRef.current = true
          const correctionMessage =
            language === "yo"
              ? "O ń lọ sí ìhà tó kò tọ́. Padà sí ẹ̀yìn rẹ."
              : language === "pcm"
              ? "You dey go wrong direction. Turn back."
              : "You're going in the wrong direction. Please turn around."

          if (config.enabled) {
            speak(correctionMessage, { force: true })
          }
        }
      } else if (distance < previousDistanceRef.current - 10) {
        // User is moving in correct direction (distance decreased by more than 10 meters)
        wrongDirectionWarningRef.current = false
      }
    }

    // Update previous distance
    previousDistanceRef.current = distance

    // Only provide turn-by-turn instructions if not showing wrong direction warning
    if (!wrongDirectionWarningRef.current && routeSteps.length > 0) {
      const turnByTurnInstruction = getNextTurnByTurnInstruction(
        routeSteps,
        { lat: userLocation.latitude, lng: userLocation.longitude },
        distance,
        (language === 'yo' || language === 'pcm') ? language : 'en'
      )

      if (turnByTurnInstruction) {
        // Speak instruction for turn-by-turn navigation
        // Speak when:
        // 1. Approaching a turn (within 100m for turns, 50m for sharp turns)
        // 2. Any turn instruction (not continue/straight)
        // 3. Important maneuvers (merge, fork, arrive)
        const shouldSpeak = 
          turnByTurnInstruction.maneuverType !== "continue" && 
          turnByTurnInstruction.maneuverType !== "straight" &&
          (
            turnByTurnInstruction.distance <= 100 || // Within 100m of turn
            !turnByTurnInstruction.isUpcoming || // Current turn
            turnByTurnInstruction.maneuverType === "arrive" || // Arrival
            turnByTurnInstruction.maneuverType === "merge" || // Merge
            turnByTurnInstruction.maneuverType === "fork" // Fork
          )
        
        if (shouldSpeak) {
          // Only speak if instruction is different from last spoken (avoid repeats)
          if (lastSpokenInstructionRef.current !== turnByTurnInstruction.instruction) {
            // Build instruction with remaining distance and time if available
            let instructionToSpeak = turnByTurnInstruction.instruction
            if (distance !== undefined && time !== undefined) {
              const distanceText = distance < 1000 
                ? `${Math.round(distance)} meters`
                : `${(distance / 1000).toFixed(1)} kilometers`
              const timeText = `${time} ${time === 1 ? 'minute' : 'minutes'}`
              
              if (language === "yo") {
                instructionToSpeak = `${turnByTurnInstruction.instruction} Ijinlẹ̀ tó kù jẹ́ ${distanceText}, àkókò tó kù jẹ́ ${timeText}.`
              } else if (language === "pcm") {
                instructionToSpeak = `${turnByTurnInstruction.instruction} Distance wey remain na ${distanceText}, time wey remain na ${timeText}.`
              } else {
                instructionToSpeak = `${turnByTurnInstruction.instruction} Remaining distance is ${distanceText}, remaining time is ${timeText}.`
              }
            }
            // Always speak turn-by-turn instructions (force if voice not enabled)
            speak(instructionToSpeak, { force: true })
            lastSpokenInstructionRef.current = turnByTurnInstruction.instruction
          }
        }
      }
    }
  }, [userLocation, distance, routeSteps, pollingUnitData, language, speak, config.enabled, time])

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
    if (typeof window !== 'undefined') {
      const isMobile = window.innerWidth < 768
      fetch('http://127.0.0.1:7242/ingest/a0691e2c-cdd7-47b0-9342-76cf3ac06d2f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'direction/page.tsx:render',message:'DirectionPageContent render',data:{hasCode:!!codeFromUrl,hasPollingUnitData:!!pollingUnitData,hasUserLocation:!!userLocation,hasRoutePolyline:!!routePolyline,hasRouteSteps:routeSteps.length > 0,routeStepsCount:routeSteps.length,hasDistance:distance !== undefined,hasTime:time !== undefined,isMobile,windowWidth:window.innerWidth,windowHeight:window.innerHeight},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    }
  }, [codeFromUrl, pollingUnitData, userLocation, routePolyline, routeSteps, distance, time])
  
  // Trigger map resize on mobile when needed
  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      // Small delay to ensure DOM has updated
      const timeout = setTimeout(() => {
        // Trigger window resize event to force map to recalculate dimensions
        window.dispatchEvent(new Event('resize'))
      }, 100)
      return () => clearTimeout(timeout)
    }
  }, [])
  
  // Force map resize on mobile after initial mount (like map-view does)
  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 768 && pollingUnitData) {
      // Multiple resize triggers to ensure map initializes properly on mobile
      const timeouts = [100, 300, 500, 1000].map(delay => 
        setTimeout(() => {
          window.dispatchEvent(new Event('resize'))
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/a0691e2c-cdd7-47b0-9342-76cf3ac06d2f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'direction/page.tsx:mobile-map-init',message:'Mobile map initialization resize trigger',data:{delay,windowWidth:window.innerWidth,windowHeight:window.innerHeight,hasPollingUnit:!!pollingUnitData},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
          // #endregion
        }, delay)
      )
      return () => timeouts.forEach(clearTimeout)
    }
  }, [pollingUnitData])
  // #endregion

  // Show mobile view (full screen directions) or desktop view (split layout)
  const [showMobileDirections, setShowMobileDirections] = useState(false)

  // Show split layout (directions on left, map on right) on desktop
  // Show full screen directions on mobile
  return (
    <>
      {/* Mobile: Full Screen Directions View */}
      {showMobileDirections ? (
        <div className="md:hidden h-full w-full overflow-hidden">
          <MobileDirectionsView
            origin={userLocation ? { latitude: userLocation.latitude, longitude: userLocation.longitude } : undefined}
            destination={pollingUnitData || undefined}
            distance={distance}
            duration={time !== undefined ? time * 60 : undefined}
            routeSteps={routeSteps}
            onClose={() => setShowMobileDirections(false)}
          />
        </div>
      ) : (
        <div 
          className="flex flex-col md:flex-row w-full h-full overflow-hidden"
          style={{ 
            height: '100%', 
            minHeight: 0,
            maxHeight: '100%',
            position: 'relative'
          }}
          ref={(el) => {
            if (typeof window !== 'undefined' && el) {
              const isMobile = window.innerWidth < 768
              // #region agent log
              fetch('http://127.0.0.1:7242/ingest/a0691e2c-cdd7-47b0-9342-76cf3ac06d2f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'direction/page.tsx:container-ref',message:'Main container ref callback',data:{isMobile,containerWidth:el.offsetWidth,containerHeight:el.offsetHeight,clientHeight:el.clientHeight,scrollHeight:el.scrollHeight,computedHeight:window.getComputedStyle(el).height,parentHeight:el.parentElement?.offsetHeight,windowHeight:window.innerHeight,hasPollingUnit:!!pollingUnitData},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'F'})}).catch(()=>{});
              // #endregion
            }
          }}
        >
          {/* Left Sidebar - Google Maps Style (Desktop only) */}
          <div className="hidden md:flex w-64 lg:w-72 xl:w-80 flex-col border-r border-border bg-background overflow-hidden shadow-sm" style={{ height: '100%', maxHeight: '100%' }}>
            {pollingUnitData ? (
              <GoogleMapsSidebar
                origin={userLocation ? { latitude: userLocation.latitude, longitude: userLocation.longitude } : undefined}
                destination={pollingUnitData || undefined}
                distance={distance}
                duration={time !== undefined ? time * 60 : undefined} // Convert minutes to seconds
                routeSteps={routeSteps}
                onShowDetails={() => {
                  // Toggle details view
                }}
                onShowPreview={() => {
                  // Show route preview on map
                }}
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground">Loading polling unit...</p>
              </div>
            )}
          </div>

          {/* Right Side - Map */}
          <div 
            className="relative flex-1 w-full flex flex-col" 
            style={{ 
              minHeight: 0, 
              height: '100%',
              width: '100%',
              position: 'relative',
              overflow: 'hidden'
            }}
            ref={(el) => {
              if (typeof window !== 'undefined' && el) {
                const isMobile = window.innerWidth < 768
                // #region agent log
                fetch('http://127.0.0.1:7242/ingest/a0691e2c-cdd7-47b0-9342-76cf3ac06d2f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'direction/page.tsx:map-wrapper-ref',message:'Map wrapper container ref',data:{isMobile,offsetWidth:el.offsetWidth,offsetHeight:el.offsetHeight,clientWidth:el.clientWidth,clientHeight:el.clientHeight,scrollWidth:el.scrollWidth,scrollHeight:el.scrollHeight,computedHeight:window.getComputedStyle(el).height,computedWidth:window.getComputedStyle(el).width,computedDisplay:window.getComputedStyle(el).display,computedFlex:window.getComputedStyle(el).flex,parentHeight:el.parentElement?.offsetHeight,windowInnerHeight:window.innerHeight,windowInnerWidth:window.innerWidth},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'G'})}).catch(()=>{});
                // #endregion
              }
            }}
          >
        {/* Search Bar - Top of Map (Desktop only) */}
        <div className="absolute top-4 left-4 right-4 z-50 hidden md:block">
          <div className="bg-background/95 backdrop-blur-sm rounded-lg shadow-lg border border-border px-4 py-2 flex items-center gap-3 max-w-2xl">
            <input
              type="text"
              placeholder="Search along the route..."
              className="flex-1 bg-transparent border-none outline-none text-sm text-foreground placeholder:text-muted-foreground"
            />
            <div className="hidden lg:flex items-center gap-2">
              <button className="px-3 py-1 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded transition-colors">
                Restaurants
              </button>
              <button className="px-3 py-1 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded transition-colors">
                Coffee
              </button>
              <button className="px-3 py-1 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded transition-colors">
                Groceries
              </button>
            </div>
          </div>
        </div>

        {/* Map Container - Use absolute positioning like map page */}
        <div 
          className="absolute inset-0 z-0"
          style={{
            height: '100%',
            width: '100%'
          }}
          ref={(el) => {
            if (typeof window !== 'undefined' && el) {
              const isMobile = window.innerWidth < 768
              // #region agent log
              fetch('http://127.0.0.1:7242/ingest/a0691e2c-cdd7-47b0-9342-76cf3ac06d2f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'direction/page.tsx:map-container-ref',message:'Map container div ref',data:{isMobile,offsetWidth:el.offsetWidth,offsetHeight:el.offsetHeight,clientWidth:el.clientWidth,clientHeight:el.clientHeight,computedHeight:window.getComputedStyle(el).height,computedWidth:window.getComputedStyle(el).width,computedPosition:window.getComputedStyle(el).position,computedZIndex:window.getComputedStyle(el).zIndex,computedDisplay:window.getComputedStyle(el).display,computedVisibility:window.getComputedStyle(el).visibility,computedOpacity:window.getComputedStyle(el).opacity},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
              // #endregion
            }
          }}
        >
          {/* Map - Full screen for navigation */}
          {(() => {
            const hasPollingUnit = !!(pollingUnitData && pollingUnitData.latitude && pollingUnitData.longitude)
            // #region agent log
            if (typeof window !== 'undefined') {
              const isMobile = window.innerWidth < 768
              fetch('http://127.0.0.1:7242/ingest/a0691e2c-cdd7-47b0-9342-76cf3ac06d2f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'direction/page.tsx:map-render-check',message:'Checking if map should render',data:{isMobile,hasPollingUnit,hasPollingUnitData:!!pollingUnitData,hasLatLng:!!(pollingUnitData?.latitude && pollingUnitData?.longitude),pollingUnitLat:pollingUnitData?.latitude,pollingUnitLng:pollingUnitData?.longitude},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
            }
            // #endregion
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
            <div className="flex h-full w-full items-center justify-center bg-muted" style={{ height: '100%', width: '100%' }}>
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
        </div>

        {/* Simple Mode Toggle - Mobile */}
        <div className="absolute top-4 left-4 z-50 md:hidden">
          <SimpleModeToggle simpleMode={simpleMode} onToggle={setSimpleMode} />
        </div>

        {/* Mobile: Toggle to show directions */}
        <div className="absolute bottom-4 left-4 right-4 z-50 md:hidden">
          <button
            onClick={() => setShowMobileDirections(true)}
            className="w-full bg-background/95 backdrop-blur-sm border border-border rounded-lg px-4 py-3 flex items-center justify-between shadow-lg hover:bg-background transition-colors"
          >
            <div className="flex items-center gap-3">
              <Navigation className="h-5 w-5 text-primary" />
              <div className="text-left">
                <p className="text-sm font-semibold text-foreground">
                  {time !== undefined ? `${time} min` : "Calculating..."}
                </p>
                <p className="text-xs text-muted-foreground">
                  {distance !== undefined ? formatDistance(distance) : "Loading route..."}
                </p>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>
      </div>
    </div>
    )}
    </>
  )
}

export default function DirectionPage() {
  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <Header />
      <main className="flex-1 relative min-h-0 overflow-hidden" style={{ height: 'calc(100vh - 4rem)' }}>
        <Suspense fallback={<NavigationSkeleton />}>
          <DirectionPageContent />
        </Suspense>
      </main>
      <Footer />
    </div>
  )
}

