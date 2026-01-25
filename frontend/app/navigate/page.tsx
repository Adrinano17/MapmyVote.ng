"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { NavigationManager } from "@/components/navigation/navigation-manager"
import { CustomMap } from "@/components/map/custom-map-wrapper"
import { NavigationSkeleton } from "@/components/skeletons/navigation-skeleton"
import { useNavigationState } from "@/hooks/use-navigation-state"
import { getStateMachine, type StateContext } from "@/lib/state-machine"
import { SimpleModeToggle } from "@/components/simple-mode-toggle"
import type { PollingUnit, Ward } from "@/lib/types"

function NavigatePageContent() {
  const searchParams = useSearchParams()
  const codeFromUrl = searchParams.get("code")
  
  // Clear polling unit data IMMEDIATELY if no code in URL (before state restoration)
  // This ensures fresh navigation starts don't use cached polling unit data
  // Also reset locationGranted to force questions to be asked (COMPULSORY)
  const machine = getStateMachine()
  if (!codeFromUrl) {
    const machineContext = machine.getContext()
    const currentState = machine.getCurrentState()
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/a0691e2c-cdd7-47b0-9342-76cf3ac06d2f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'navigate/page.tsx:immediate-clear',message:'No code in URL - FORCING fresh navigation start (compulsory questions)',data:{hadPollingUnitCode:!!machineContext.pollingUnitCode,hadPollingUnitData:!!machineContext.pollingUnitData,locationGranted:machineContext.locationGranted,currentState,willResetLocationGranted:true,willResetToWelcome:currentState !== 'welcome'},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    // Force fresh start: clear polling unit data AND reset locationGranted to force questions
    // This ensures questions are ALWAYS asked when coming from navigate/start navigation without code
    machine.updateContext({
      pollingUnitCode: undefined,
      pollingUnitData: undefined,
      pollingUnitValidated: false,
      isNavigating: false,
      hasArrived: false,
      locationGranted: false, // COMPULSORY: Force questions to be asked
    })
    // Reset to welcome state to force question flow (COMPULSORY)
    if (currentState !== "welcome") {
      machine.transitionTo("welcome")
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/a0691e2c-cdd7-47b0-9342-76cf3ac06d2f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'navigate/page.tsx:immediate-clear',message:'Reset to welcome state to force questions',data:{fromState:currentState,toState:'welcome'},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
    }
    // CRITICAL: Save cleared state to localStorage IMMEDIATELY so restoration sees it
    const clearedState = machine.getCurrentState()
    const clearedContext = machine.getContext()
    if (typeof window !== 'undefined') {
      localStorage.setItem("navigation_state", clearedState)
      localStorage.setItem("navigation_context", JSON.stringify(clearedContext))
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/a0691e2c-cdd7-47b0-9342-76cf3ac06d2f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'navigate/page.tsx:immediate-clear',message:'Saved cleared state to localStorage',data:{clearedState,locationGranted:clearedContext.locationGranted,hasPollingUnitCode:!!clearedContext.pollingUnitCode},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
    }
  }
  
  const { state, context, transitionTo, updateContext, submitPollingUnitCode } = useNavigationState()
  // Use state machine directly as ultimate source of truth to fix state sync issues
  // React state updates are async, so we check the state machine directly
  const machineState = machine.getCurrentState()
  const actualState = machineState || context.currentState || state
  
  // Force re-render when state machine changes (to ensure effects run with latest state)
  const [, forceUpdate] = useState(0)
  useEffect(() => {
    const interval = setInterval(() => {
      const currentMachineState = machine.getCurrentState()
      if (currentMachineState !== machineState) {
        forceUpdate(prev => prev + 1)
      }
    }, 100) // Check every 100ms
    return () => clearInterval(interval)
  }, [machineState])
  
  // #region agent log
  useEffect(() => {
    if (typeof window !== 'undefined') {
      fetch('http://127.0.0.1:7242/ingest/a0691e2c-cdd7-47b0-9342-76cf3ac06d2f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'navigate/page.tsx:36',message:'Component mount/unmount',data:{mounted:true},timestamp:Date.now(),sessionId:'debug-session',runId:'run17',hypothesisId:'W'})}).catch(()=>{});
    }
    return () => {
      if (typeof window !== 'undefined') {
        fetch('http://127.0.0.1:7242/ingest/a0691e2c-cdd7-47b0-9342-76cf3ac06d2f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'navigate/page.tsx:40',message:'Component unmounting',data:{mounted:false},timestamp:Date.now(),sessionId:'debug-session',runId:'run17',hypothesisId:'W'})}).catch(()=>{});
      }
    }
  }, [])
  // #endregion
  
  // Clear polling unit data when starting fresh navigation (no code in URL)
  // This is a backup to ensure clearing happens even if immediate clear didn't catch it
  useEffect(() => {
    if (!codeFromUrl) {
      // User came from home page - clear any previous polling unit selection
      const machineContext = machine.getContext()
      if (machineContext.pollingUnitCode || machineContext.pollingUnitData) {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/a0691e2c-cdd7-47b0-9342-76cf3ac06d2f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'navigate/page.tsx:clear-polling-unit',message:'Backup: Clearing polling unit data for fresh navigation',data:{hadPollingUnitCode:!!machineContext.pollingUnitCode,hadPollingUnitData:!!machineContext.pollingUnitData,currentState:actualState},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
        // #endregion
        // Clear polling unit data but preserve user preferences
        updateContext({
          pollingUnitCode: undefined,
          pollingUnitData: undefined,
          pollingUnitValidated: false,
          isNavigating: false,
          hasArrived: false,
        })
        // Reset state to welcome if we're in navigation state
        if (actualState === "navigation") {
          transitionTo("welcome")
        }
      }
    }
  }, [codeFromUrl, machine, actualState, updateContext, transitionTo])
  
  // Initialize state from state machine context to survive unmounts
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(() => {
    return context.userLocation || null
  })
  
  // #region agent log
  useEffect(() => {
    if (typeof window !== 'undefined') {
      fetch('http://127.0.0.1:7242/ingest/a0691e2c-cdd7-47b0-9342-76cf3ac06d2f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'navigate/page.tsx:50',message:'userLocation state changed',data:{hasUserLocation:!!userLocation,lat:userLocation?.latitude,lng:userLocation?.longitude},timestamp:Date.now(),sessionId:'debug-session',runId:'run17',hypothesisId:'W'})}).catch(()=>{});
    }
  }, [userLocation])
  // #endregion
  
  // Persist userLocation to state machine context
  useEffect(() => {
    if (userLocation) {
      updateContext({ userLocation })
    }
  }, [userLocation, updateContext])

  const [pollingUnitData, setPollingUnitData] = useState<(PollingUnit & { ward?: Ward }) | null>(() => {
    // Only initialize from context if there's a code in URL (coming from map with "Get Directions")
    // If no code, start with null (fresh navigation start)
    return (codeFromUrl && context.pollingUnitData) ? context.pollingUnitData : null
  })
  
  // #region agent log
  useEffect(() => {
    if (typeof window !== 'undefined') {
      fetch('http://127.0.0.1:7242/ingest/a0691e2c-cdd7-47b0-9342-76cf3ac06d2f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'navigate/page.tsx:60',message:'pollingUnitData state changed',data:{hasPollingUnitData:!!pollingUnitData,code:pollingUnitData?.code,lat:pollingUnitData?.latitude,lng:pollingUnitData?.longitude},timestamp:Date.now(),sessionId:'debug-session',runId:'run17',hypothesisId:'W'})}).catch(()=>{});
    }
  }, [pollingUnitData])
  // #endregion
  
  // Persist pollingUnitData to state machine context
  useEffect(() => {
    if (pollingUnitData) {
      updateContext({ pollingUnitData })
    }
  }, [pollingUnitData, updateContext])
  
  // Restore state from context when component remounts
  // But DON'T restore polling unit data if there's no code in URL (fresh navigation start)
  useEffect(() => {
    if (!userLocation && context.userLocation) {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/a0691e2c-cdd7-47b0-9342-76cf3ac06d2f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'navigate/page.tsx:85',message:'Restoring userLocation from context',data:{hasContextLocation:!!context.userLocation,lat:context.userLocation?.latitude,lng:context.userLocation?.longitude},timestamp:Date.now(),sessionId:'debug-session',runId:'run17',hypothesisId:'W'})}).catch(()=>{});
      // #endregion
      setUserLocation(context.userLocation)
    }
    // Only restore polling unit data if there's a code in URL (coming from map with "Get Directions")
    // If no code in URL, don't restore polling unit data (fresh navigation start)
    if (!pollingUnitData && context.pollingUnitData && codeFromUrl) {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/a0691e2c-cdd7-47b0-9342-76cf3ac06d2f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'navigate/page.tsx:90',message:'Restoring pollingUnitData from context (code in URL)',data:{hasContextData:!!context.pollingUnitData,code:context.pollingUnitData?.code,codeFromUrl},timestamp:Date.now(),sessionId:'debug-session',runId:'run17',hypothesisId:'W'})}).catch(()=>{});
      // #endregion
      setPollingUnitData(context.pollingUnitData)
    } else if (!codeFromUrl && context.pollingUnitData) {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/a0691e2c-cdd7-47b0-9342-76cf3ac06d2f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'navigate/page.tsx:95',message:'Skipping polling unit data restoration (no code in URL)',data:{hasContextData:!!context.pollingUnitData,code:context.pollingUnitData?.code,codeFromUrl},timestamp:Date.now(),sessionId:'debug-session',runId:'run17',hypothesisId:'W'})}).catch(()=>{});
      // #endregion
      // Don't restore polling unit data - this is a fresh navigation start
    }
    // Clear local state if context was cleared (for fresh navigation)
    if (pollingUnitData && !context.pollingUnitData) {
      setPollingUnitData(null)
    }
  }, [context.userLocation, context.pollingUnitData, userLocation, pollingUnitData, codeFromUrl])
  
  // #region agent log
  useEffect(() => {
    if (typeof window !== 'undefined') {
      fetch('http://127.0.0.1:7242/ingest/a0691e2c-cdd7-47b0-9342-76cf3ac06d2f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'navigate/page.tsx:68',message:'codeFromUrl changed',data:{codeFromUrl,hasCode:!!codeFromUrl},timestamp:Date.now(),sessionId:'debug-session',runId:'run17',hypothesisId:'W'})}).catch(()=>{});
    }
  }, [codeFromUrl])
  // #endregion
  const [routePolyline, setRoutePolyline] = useState<string | null>(null)
  const [landmarks, setLandmarks] = useState<Array<{ name: string; latitude: number; longitude: number; category: string; distance: number }>>([])
  const [distance, setDistance] = useState<number | undefined>()
  const [time, setTime] = useState<number | undefined>()
  const [simpleMode, setSimpleMode] = useState(false)
  const [gpsUnavailable, setGpsUnavailable] = useState(false)
  const [routingFailed, setRoutingFailed] = useState(false)
  const [routeSteps, setRouteSteps] = useState<any[]>([])

  // Get user location when in navigation state (NFR-03: Handle GPS unavailability)
  // Also get location if we have polling unit and location was granted (even if not in navigation state yet)
  useEffect(() => {
    // Fetch location if:
    // 1. We're in navigation state, OR
    // 2. Location was granted and we have polling unit data
    // AND we don't already have user location
    // Fetch location if we're in navigation state and have polling unit data
    // OR if location was granted and we have polling unit data
    // The key is: if we're in navigation state, we should fetch location regardless of context.locationGranted
    // because the state machine transition to navigation implies location was granted
    const shouldGetLocation = Boolean(((actualState === "navigation" && pollingUnitData) || (context.locationGranted && pollingUnitData)) && !userLocation && navigator.geolocation && pollingUnitData)
    // #region agent log
    if (typeof window !== 'undefined') {
      fetch('http://127.0.0.1:7242/ingest/a0691e2c-cdd7-47b0-9342-76cf3ac06d2f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'navigate/page.tsx:41',message:'User location fetch check',data:{shouldGetLocation,actualState,state,isNavigation:actualState==='navigation',locationGranted:context.locationGranted,hasPollingUnitData:!!pollingUnitData,hasUserLocation:!!userLocation,hasGeolocation:!!navigator.geolocation},timestamp:Date.now(),sessionId:'debug-session',runId:'run10',hypothesisId:'P'})}).catch(()=>{});
    }
    // #endregion
    if (shouldGetLocation) {
      // #region agent log
      if (typeof window !== 'undefined') {
        fetch('http://127.0.0.1:7242/ingest/a0691e2c-cdd7-47b0-9342-76cf3ac06d2f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'navigate/page.tsx:48',message:'Fetching user location',data:{actualState,state},timestamp:Date.now(),sessionId:'debug-session',runId:'run10',hypothesisId:'P'})}).catch(()=>{});
      }
      // #endregion
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          }
          // #region agent log
          if (typeof window !== 'undefined') {
            fetch('http://127.0.0.1:7242/ingest/a0691e2c-cdd7-47b0-9342-76cf3ac06d2f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'navigate/page.tsx:95',message:'About to setUserLocation',data:{lat:location.latitude,lng:location.longitude,currentUserLocation:!!userLocation},timestamp:Date.now(),sessionId:'debug-session',runId:'run17',hypothesisId:'W'})}).catch(()=>{});
          }
          // #endregion
          setUserLocation(location)
          // #region agent log
          if (typeof window !== 'undefined') {
            fetch('http://127.0.0.1:7242/ingest/a0691e2c-cdd7-47b0-9342-76cf3ac06d2f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'navigate/page.tsx:100',message:'User location received',data:{lat:location.latitude,lng:location.longitude},timestamp:Date.now(),sessionId:'debug-session',runId:'run7',hypothesisId:'M'})}).catch(()=>{});
          }
          // #endregion
          setGpsUnavailable(false)
        },
        (error) => {
          console.error("Location error:", error)
          // #region agent log
          if (typeof window !== 'undefined') {
            fetch('http://127.0.0.1:7242/ingest/a0691e2c-cdd7-47b0-9342-76cf3ac06d2f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'navigate/page.tsx:54',message:'User location error',data:{error:error.message,code:error.code},timestamp:Date.now(),sessionId:'debug-session',runId:'run7',hypothesisId:'M'})}).catch(()=>{});
          }
          // #endregion
          setGpsUnavailable(true)
          // Continue with text-only navigation (FR-04 fallback)
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
      }, 5000) // Every 5 seconds for more responsive updates

      return () => clearInterval(interval)
    }
  }, [actualState, userLocation, context.locationGranted, pollingUnitData, state, context])

  // Auto-configure defaults when code is provided (skip language/voice steps)
  useEffect(() => {
    if (codeFromUrl) {
      // Check if user has already answered questions (location granted, language selected, voice enabled)
      // Use state machine directly as source of truth (it persists in localStorage)
      // Also check localStorage as fallback in case state machine hasn't loaded yet
      const machineContext = machine.getContext()
      let savedContext: StateContext | null = null
      try {
        const savedContextStr = typeof window !== 'undefined' ? localStorage.getItem("navigation_context") : null
        if (savedContextStr) {
          savedContext = JSON.parse(savedContextStr)
        }
      } catch (e) {
        // Ignore parse errors
      }
      
      const contextToCheck = savedContext || machineContext || context
      const hasAnsweredQuestions = contextToCheck.locationGranted && contextToCheck.languageSelected && contextToCheck.voiceEnabled !== undefined
      
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/a0691e2c-cdd7-47b0-9342-76cf3ac06d2f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'navigate/page.tsx:195',message:'Checking if questions already answered',data:{codeFromUrl,hasAnsweredQuestions,locationGranted:contextToCheck.locationGranted,languageSelected:contextToCheck.languageSelected,voiceEnabled:contextToCheck.voiceEnabled,currentState:actualState,usedSavedContext:!!savedContext},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      
      if (hasAnsweredQuestions && actualState !== "navigation") {
        // User has already answered questions - skip directly to navigation
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/a0691e2c-cdd7-47b0-9342-76cf3ac06d2f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'navigate/page.tsx:200',message:'Questions already answered, skipping to navigation',data:{codeFromUrl,currentState:actualState},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
        // #endregion
        updateContext({ pollingUnitCode: codeFromUrl })
        setTimeout(() => {
          transitionTo("navigation")
        }, 100)
        return
      }
      
      // User hasn't answered questions yet - show question flow
      if (actualState === "welcome" || actualState === "language_selection" || actualState === "voice_consent") {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/a0691e2c-cdd7-47b0-9342-76cf3ac06d2f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'navigate/page.tsx:65',message:'Auto-configuring defaults for code in URL',data:{code:codeFromUrl,currentState:state},timestamp:Date.now(),sessionId:'debug-session',runId:'run5',hypothesisId:'J'})}).catch(()=>{});
        // #endregion
        // Set defaults and skip to location permission
        // Update context with polling unit code FIRST so state machine allows the transition
        updateContext({ languageSelected: "en", voiceEnabled: true, pollingUnitCode: codeFromUrl })
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/a0691e2c-cdd7-47b0-9342-76cf3ac06d2f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'navigate/page.tsx:72',message:'Attempting transition to location_permission',data:{fromState:state,code:codeFromUrl},timestamp:Date.now(),sessionId:'debug-session',runId:'run6',hypothesisId:'J'})}).catch(()=>{});
        // #endregion
        // Transition directly to location_permission (state machine now allows this when code is provided)
        if (actualState === "welcome") {
          // Give context update time to propagate to state machine
          setTimeout(() => {
            const machine = getStateMachine()
            const machineContext = machine.getContext()
            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/a0691e2c-cdd7-47b0-9342-76cf3ac06d2f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'navigate/page.tsx:78',message:'Before transition - checking state machine context',data:{machineState:machine.getCurrentState(),hasPollingUnitCode:!!machineContext.pollingUnitCode,pollingUnitCode:machineContext.pollingUnitCode},timestamp:Date.now(),sessionId:'debug-session',runId:'run6',hypothesisId:'J'})}).catch(()=>{});
            // #endregion
            const result = transitionTo("location_permission")
            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/a0691e2c-cdd7-47b0-9342-76cf3ac06d2f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'navigate/page.tsx:85',message:'Transition result from welcome to location_permission',data:{result,newState:state},timestamp:Date.now(),sessionId:'debug-session',runId:'run6',hypothesisId:'J'})}).catch(()=>{});
            // #endregion
          }, 100)
        } else if (actualState === "language_selection") {
          transitionTo("voice_consent")
          setTimeout(() => {
            const result = transitionTo("location_permission")
            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/a0691e2c-cdd7-47b0-9342-76cf3ac06d2f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'navigate/page.tsx:87',message:'Transition result from language_selection',data:{result},timestamp:Date.now(),sessionId:'debug-session',runId:'run5',hypothesisId:'J'})}).catch(()=>{});
            // #endregion
          }, 50)
        } else if (actualState === "voice_consent") {
          const result = transitionTo("location_permission")
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/a0691e2c-cdd7-47b0-9342-76cf3ac06d2f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'navigate/page.tsx:92',message:'Transition result from voice_consent',data:{result},timestamp:Date.now(),sessionId:'debug-session',runId:'run5',hypothesisId:'J'})}).catch(()=>{});
          // #endregion
        }
      }
    }
  }, [codeFromUrl, actualState, updateContext, transitionTo, context.locationGranted, context.languageSelected, context.voiceEnabled])

  // Auto-transition to navigation when both location and polling unit are ready
  useEffect(() => {
    const shouldTransition = context.locationGranted && context.pollingUnitCode && pollingUnitData && actualState !== "navigation"
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/a0691e2c-cdd7-47b0-9342-76cf3ac06d2f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'navigate/page.tsx:90',message:'Checking auto-transition conditions',data:{shouldTransition,currentState:state,locationGranted:context.locationGranted,hasPollingUnitCode:!!context.pollingUnitCode,hasPollingUnitData:!!pollingUnitData},timestamp:Date.now(),sessionId:'debug-session',runId:'run5',hypothesisId:'K'})}).catch(()=>{});
    // #endregion
    if (shouldTransition) {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/a0691e2c-cdd7-47b0-9342-76cf3ac06d2f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'navigate/page.tsx:95',message:'Auto-transitioning to navigation - both conditions met',data:{currentState:state,locationGranted:context.locationGranted,hasPollingUnitCode:!!context.pollingUnitCode,hasPollingUnitData:!!pollingUnitData},timestamp:Date.now(),sessionId:'debug-session',runId:'run5',hypothesisId:'K'})}).catch(()=>{});
      // #endregion
      // Try to transition - this should work from location_permission or polling_unit_input
      setTimeout(() => {
        const transitionResult = transitionTo("navigation")
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/a0691e2c-cdd7-47b0-9342-76cf3ac06d2f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'navigate/page.tsx:100',message:'Auto-transition result',data:{transitionResult,newState:state},timestamp:Date.now(),sessionId:'debug-session',runId:'run5',hypothesisId:'K'})}).catch(()=>{});
        // #endregion
      }, 100)
    }
  }, [context.locationGranted, context.pollingUnitCode, pollingUnitData, actualState, transitionTo])

  // If code is provided in URL, fetch polling unit and submit to state machine
  useEffect(() => {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/a0691e2c-cdd7-47b0-9342-76cf3ac06d2f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'navigate/page.tsx:74',message:'URL code effect triggered',data:{codeFromUrl,hasPollingUnitData:!!pollingUnitData,currentState:state,contextPollingUnitCode:context.pollingUnitCode},timestamp:Date.now(),sessionId:'debug-session',runId:'run4',hypothesisId:'C'})}).catch(()=>{});
    // #endregion
    if (codeFromUrl && !pollingUnitData && !context.pollingUnitCode) {
      fetch(`/api/polling-unit/${codeFromUrl}`)
        .then((res) => {
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/a0691e2c-cdd7-47b0-9342-76cf3ac06d2f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'navigate/page.tsx:69',message:'API response received',data:{code:codeFromUrl,status:res.status,ok:res.ok,contentType:res.headers.get('content-type')},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'C'})}).catch(()=>{});
          // #endregion
          if (!res.ok) {
            throw new Error(`API returned ${res.status}: ${res.statusText}`)
          }
          return res.json()
        })
        .then((data) => {
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/a0691e2c-cdd7-47b0-9342-76cf3ac06d2f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'navigate/page.tsx:68',message:'Polling unit fetched from API',data:{code:codeFromUrl,hasData:!!data,hasError:!!data?.error,error:data?.error,hasLat:!!data?.latitude,hasLng:!!data?.longitude,lat:data?.latitude,lng:data?.longitude,codeInData:data?.code,name:data?.name,allKeys:Object.keys(data||{})},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'C'})}).catch(()=>{});
          // #endregion
          if (data?.error) {
            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/a0691e2c-cdd7-47b0-9342-76cf3ac06d2f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'navigate/page.tsx:72',message:'API returned error',data:{code:codeFromUrl,error:data.error},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'C'})}).catch(()=>{});
            // #endregion
            console.error("API error:", data.error)
            return
          }
          if (data) {
            // Only proceed if polling unit has coordinates (required for map display)
            if (data.latitude && data.longitude) {
              // #region agent log
              fetch('http://127.0.0.1:7242/ingest/a0691e2c-cdd7-47b0-9342-76cf3ac06d2f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'navigate/page.tsx:210',message:'About to setPollingUnitData',data:{code:codeFromUrl,lat:data.latitude,lng:data.longitude,currentPollingUnitData:!!pollingUnitData},timestamp:Date.now(),sessionId:'debug-session',runId:'run17',hypothesisId:'W'})}).catch(()=>{});
              // #endregion
              setPollingUnitData(data)
              // Update context with polling unit code (don't submit yet - wait for location permission)
              // The state machine will transition to navigation after location permission if code exists
              updateContext({ pollingUnitCode: codeFromUrl, pollingUnitValidated: true })
              // #region agent log
              fetch('http://127.0.0.1:7242/ingest/a0691e2c-cdd7-47b0-9342-76cf3ac06d2f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'navigate/page.tsx:73',message:'Polling unit code set in context with coordinates',data:{code:codeFromUrl,state:state,lat:data.latitude,lng:data.longitude,codeInData:data.code,name:data.name},timestamp:Date.now(),sessionId:'debug-session',runId:'run3',hypothesisId:'D'})}).catch(()=>{});
              // #endregion
              // If location was already granted but we're not in navigation state, transition to navigation
              // This handles the case where location permission was granted before polling unit was loaded
              if (context.locationGranted && state !== "navigation") {
                // #region agent log
                fetch('http://127.0.0.1:7242/ingest/a0691e2c-cdd7-47b0-9342-76cf3ac06d2f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'navigate/page.tsx:103',message:'Attempting to transition to navigation after polling unit loaded',data:{currentState:state,locationGranted:context.locationGranted,hasPollingUnitCode:!!codeFromUrl},timestamp:Date.now(),sessionId:'debug-session',runId:'run4',hypothesisId:'I'})}).catch(()=>{});
                // #endregion
                // Use the hook's transitionTo which properly syncs React state
                setTimeout(() => {
                  const transitionResult = transitionTo("navigation")
                  // #region agent log
                  fetch('http://127.0.0.1:7242/ingest/a0691e2c-cdd7-47b0-9342-76cf3ac06d2f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'navigate/page.tsx:110',message:'Transition to navigation result',data:{transitionResult,currentState:state},timestamp:Date.now(),sessionId:'debug-session',runId:'run4',hypothesisId:'I'})}).catch(()=>{});
                  // #endregion
                }, 100)
              }
            } else {
              // #region agent log
              fetch('http://127.0.0.1:7242/ingest/a0691e2c-cdd7-47b0-9342-76cf3ac06d2f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'navigate/page.tsx:78',message:'Polling unit fetched but missing coordinates',data:{code:codeFromUrl,codeInData:data.code,name:data.name,hasLat:!!data.latitude,hasLng:!!data.longitude,allKeys:Object.keys(data)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
              // #endregion
              console.error("Polling unit found but missing coordinates:", data.code, "Data keys:", Object.keys(data))
              // Show error to user - coordinates are required for navigation
              alert("This polling unit does not have location coordinates. Please contact support or try a different polling unit.")
            }
          }
        })
        .catch((error) => {
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/a0691e2c-cdd7-47b0-9342-76cf3ac06d2f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'navigate/page.tsx:78',message:'Polling unit fetch error',data:{code:codeFromUrl,error:error.message},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
          // #endregion
          console.error(error)
        })
    }
  }, [codeFromUrl, pollingUnitData, context.pollingUnitCode, state, updateContext])

  // Fetch polling unit data when validated (for normal flow)
  useEffect(() => {
    if (actualState === "navigation" && context.pollingUnitCode && !pollingUnitData && !codeFromUrl) {
      fetch(`/api/polling-unit/${context.pollingUnitCode}`)
        .then((res) => res.json())
        .then((data) => {
          if (data && data.latitude && data.longitude) {
            setPollingUnitData(data)
          }
        })
        .catch(console.error)
    }
  }, [state, context.pollingUnitCode, pollingUnitData, codeFromUrl])

  // Get route and landmarks when both locations are available
  useEffect(() => {
    // #region agent log
    if (typeof window !== 'undefined') {
      const machine = getStateMachine()
      const machineState = machine.getCurrentState()
      fetch('http://127.0.0.1:7242/ingest/a0691e2c-cdd7-47b0-9342-76cf3ac06d2f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'navigate/page.tsx:246',message:'Route fetch effect triggered',data:{actualState,state,machineState,contextState:context.currentState,hasUserLocation:!!userLocation,hasPollingUnitData:!!pollingUnitData,hasCoords:!!(pollingUnitData?.latitude && pollingUnitData?.longitude),willFetchRoute:actualState==='navigation' && !!userLocation && !!pollingUnitData},timestamp:Date.now(),sessionId:'debug-session',runId:'run9',hypothesisId:'O'})}).catch(()=>{});
    }
    // #endregion
    // #region agent log
    if (typeof window !== 'undefined') {
      fetch('http://127.0.0.1:7242/ingest/a0691e2c-cdd7-47b0-9342-76cf3ac06d2f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'navigate/page.tsx:351',message:'Route fetch condition check',data:{actualState,isNavigation:actualState==='navigation',hasUserLocation:!!userLocation,hasPollingUnitData:!!pollingUnitData,hasLat:!!pollingUnitData?.latitude,hasLng:!!pollingUnitData?.longitude,lat:pollingUnitData?.latitude,lng:pollingUnitData?.longitude,allConditionsMet:actualState==='navigation' && !!userLocation && !!pollingUnitData && !!pollingUnitData?.latitude && !!pollingUnitData?.longitude},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    }
    // #endregion
    
    if (
      actualState === "navigation" &&
      userLocation &&
      pollingUnitData &&
      pollingUnitData.latitude &&
      pollingUnitData.longitude
    ) {
      // Get directions (NFR-04: Provide fallback if routing fails)
      // #region agent log
      if (typeof window !== 'undefined') {
        fetch('http://127.0.0.1:7242/ingest/a0691e2c-cdd7-47b0-9342-76cf3ac06d2f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'navigate/page.tsx:365',message:'Starting route calculation (walking)',data:{originLat:userLocation.latitude,originLng:userLocation.longitude,destLat:pollingUnitData.latitude,destLng:pollingUnitData.longitude,profile:'walking'},timestamp:Date.now(),sessionId:'debug-session',runId:'run19',hypothesisId:'B'})}).catch(()=>{});
      }
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
          // #region agent log
          if (typeof window !== 'undefined') {
            fetch('http://127.0.0.1:7242/ingest/a0691e2c-cdd7-47b0-9342-76cf3ac06d2f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'navigate/page.tsx:285',message:'Directions API response status',data:{status:res.status,ok:res.ok,contentType:res.headers.get('content-type'),url:res.url},timestamp:Date.now(),sessionId:'debug-session',runId:'run11',hypothesisId:'Q'})}).catch(()=>{});
          }
          // #endregion
          if (!res.ok) {
            setRoutingFailed(true)
            // #region agent log
            if (typeof window !== 'undefined') {
              const responseText = await res.clone().text().catch(() => 'Unable to read response')
              fetch('http://127.0.0.1:7242/ingest/a0691e2c-cdd7-47b0-9342-76cf3ac06d2f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'navigate/page.tsx:290',message:'Directions API failed',data:{status:res.status,statusText:res.statusText,url:res.url,responseText:responseText.substring(0,200)},timestamp:Date.now(),sessionId:'debug-session',runId:'run18',hypothesisId:'X'})}).catch(()=>{});
            }
            // #endregion
            throw new Error(`Directions API returned ${res.status}: ${res.statusText}`)
          }
          return res.json()
        })
        .then((data) => {
          // #region agent log
          if (typeof window !== 'undefined') {
            fetch('http://127.0.0.1:7242/ingest/a0691e2c-cdd7-47b0-9342-76cf3ac06d2f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'navigate/page.tsx:295',message:'Directions API response received',data:{hasRoutes:!!data.routes,routeCount:data.routes?.length || 0,hasPolyline:!!data.routes?.[0]?.overview_polyline?.points,hasError:!!data.error,error:data.error},timestamp:Date.now(),sessionId:'debug-session',runId:'run11',hypothesisId:'Q'})}).catch(()=>{});
          }
          // #endregion
          if (data.routes && data.routes[0]) {
            setRoutingFailed(false)
            const route = data.routes[0]
            const leg = route.legs[0]
            
            // #region agent log
            if (typeof window !== 'undefined') {
              fetch('http://127.0.0.1:7242/ingest/a0691e2c-cdd7-47b0-9342-76cf3ac06d2f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'navigate/page.tsx:403',message:'Route data received',data:{hasLeg:!!leg,hasSteps:!!leg.steps,stepsCount:leg.steps?.length || 0,firstStepHasManeuver:!!leg.steps?.[0]?.maneuver,firstStepManeuverType:leg.steps?.[0]?.maneuver?.type},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
            }
            // #endregion
            
            setDistance(leg.distance.value)
            setTime(Math.round(leg.duration.value / 60)) // Convert to minutes
            // #region agent log
            if (typeof window !== 'undefined') {
              fetch('http://127.0.0.1:7242/ingest/a0691e2c-cdd7-47b0-9342-76cf3ac06d2f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'navigate/page.tsx:400',message:'Distance and time set',data:{distance:leg.distance.value,distanceText:leg.distance.text,timeMinutes:Math.round(leg.duration.value / 60),timeSeconds:leg.duration.value,durationText:leg.duration.text},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
            }
            // #endregion
            if (route.overview_polyline?.points) {
              setRoutePolyline(route.overview_polyline.points)
              // #region agent log
              fetch('http://127.0.0.1:7242/ingest/a0691e2c-cdd7-47b0-9342-76cf3ac06d2f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'navigate/page.tsx:130',message:'Route polyline set',data:{polylineLength:route.overview_polyline.points.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
              // #endregion
            }

            // Store route steps for turn-by-turn navigation
            if (leg.steps) {
              // #region agent log
              if (typeof window !== 'undefined') {
                fetch('http://127.0.0.1:7242/ingest/a0691e2c-cdd7-47b0-9342-76cf3ac06d2f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'navigate/page.tsx:route-fetch',message:'Storing route steps for turn-by-turn navigation',data:{stepsCount:leg.steps.length,firstStepManeuver:leg.steps[0]?.maneuver?.type,firstStepModifier:leg.steps[0]?.maneuver?.modifier},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
              }
              // #endregion
              setRouteSteps(leg.steps)
            } else {
              // #region agent log
              if (typeof window !== 'undefined') {
                fetch('http://127.0.0.1:7242/ingest/a0691e2c-cdd7-47b0-9342-76cf3ac06d2f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'navigate/page.tsx:route-fetch',message:'No route steps in response',data:{hasLeg:!!leg,hasSteps:!!leg.steps},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
              }
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
                // #region agent log
                if (typeof window !== 'undefined') {
                  fetch('http://127.0.0.1:7242/ingest/a0691e2c-cdd7-47b0-9342-76cf3ac06d2f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'navigate/page.tsx:340',message:'Landmark fetch error',data:{error:error.message},timestamp:Date.now(),sessionId:'debug-session',runId:'run11',hypothesisId:'Q'})}).catch(()=>{});
                }
                // #endregion
                setRoutingFailed(true)
              })
                 } else {
                   setRoutingFailed(true)
                   // #region agent log
                   if (typeof window !== 'undefined') {
                     fetch('http://127.0.0.1:7242/ingest/a0691e2c-cdd7-47b0-9342-76cf3ac06d2f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'navigate/page.tsx:345',message:'No routes in response',data:{hasData:!!data,dataKeys:Object.keys(data||{})},timestamp:Date.now(),sessionId:'debug-session',runId:'run11',hypothesisId:'Q'})}).catch(()=>{});
                   }
                   // #endregion
                 }
               })
               .catch((error) => {
                 console.error("Directions fetch error:", error)
                 // #region agent log
                 if (typeof window !== 'undefined') {
                   fetch('http://127.0.0.1:7242/ingest/a0691e2c-cdd7-47b0-9342-76cf3ac06d2f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'navigate/page.tsx:350',message:'Directions fetch error',data:{error:error.message,stack:error.stack},timestamp:Date.now(),sessionId:'debug-session',runId:'run11',hypothesisId:'Q'})}).catch(()=>{});
                 }
                 // #endregion
                 setRoutingFailed(true)
               })
    }
  }, [actualState, userLocation, pollingUnitData])

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
  if (typeof window !== 'undefined') {
    // Also check state machine directly to see if there's a sync issue
    const machine = getStateMachine()
    const machineState = machine.getCurrentState()
    const machineContext = machine.getContext()
    fetch('http://127.0.0.1:7242/ingest/a0691e2c-cdd7-47b0-9342-76cf3ac06d2f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'navigate/page.tsx:221',message:'NavigatePageContent render',data:{state,actualState,contextState:context.currentState,machineState,machineContextState:machineContext.currentState,hasUserLocation:!!userLocation,hasPollingUnitData:!!pollingUnitData,hasRoutePolyline:!!routePolyline,locationGranted:context.locationGranted},timestamp:Date.now(),sessionId:'debug-session',runId:'run8',hypothesisId:'N'})}).catch(()=>{});
  }
  // #endregion
  // #region agent log
  if (typeof window !== 'undefined') {
    fetch('http://127.0.0.1:7242/ingest/a0691e2c-cdd7-47b0-9342-76cf3ac06d2f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'navigate/page.tsx:256',message:'Checking navigation state conditions',data:{state,actualState,isNavigation:actualState==='navigation',hasUserLocation:!!userLocation,hasPollingUnitData:!!pollingUnitData,hasCoords:!!(pollingUnitData?.latitude && pollingUnitData?.longitude),pollingUnitCode:context.pollingUnitCode,willShowMap:actualState==='navigation' && !!userLocation && !!pollingUnitData},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'F'})}).catch(()=>{});
  }
  // #endregion
  // /navigate page only handles questions - no navigation state display
  // After questions are answered, user is redirected to /map
  // Then from /map, user selects polling unit and clicks "Get Directions" → goes to /direction?code=XXX
  // For all states, show NavigationManager full screen (no map)
  return (
    <div className="flex h-[calc(100vh-4rem)] items-center justify-center bg-muted">
      <div className="w-full max-w-md px-4">
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
        />
      </div>
    </div>
  )
}

export default function NavigatePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <Suspense fallback={<NavigationSkeleton />}>
          <NavigatePageContent />
        </Suspense>
      </main>
      <Footer />
    </div>
  )
}
