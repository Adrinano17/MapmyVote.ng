"use client"

import { useEffect, useState, useRef } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useNavigationState } from "@/hooks/use-navigation-state"
import { useVoiceGuidance } from "@/hooks/use-voice-guidance"
import { useLanguage } from "@/hooks/use-language"
import { translations } from "@/lib/types"
import { MapPin, AlertCircle, RefreshCw } from "lucide-react"
import { getStateMachine } from "@/lib/state-machine"

export function StateLocationPermission() {
  const searchParams = useSearchParams()
  const codeFromUrl = searchParams.get("code")
  const { state, context, grantLocationPermission, denyLocationPermission, transitionTo } =
    useNavigationState()
  const isRequestingRef = useRef(false)
  const { speak, config } = useVoiceGuidance()
  const { language } = useLanguage()
  const t = translations[language]
  const [permissionStatus, setPermissionStatus] = useState<"pending" | "granted" | "denied">(
    "pending"
  )
  const [hasSpoken, setHasSpoken] = useState(false)
  const [forceUpdate, setForceUpdate] = useState(0)
  const isRequestingLocationRef = useRef(false)
  const hasTransitionedRef = useRef(false)
  
  // Use state machine directly as source of truth to avoid React state lag
  const machine = getStateMachine()
  const actualState = machine.getCurrentState()
  
  // Force re-render when state machine changes
  useEffect(() => {
    const interval = setInterval(() => {
      const currentMachine = getStateMachine()
      const currentMachineState = currentMachine.getCurrentState()
      if (currentMachineState !== actualState) {
        setForceUpdate(prev => prev + 1)
        // If we've transitioned to navigation, mark as transitioned
        if (currentMachineState === 'navigation') {
          hasTransitionedRef.current = true
        }
      }
    }, 100)
    return () => clearInterval(interval)
  }, [actualState])

  useEffect(() => {
    if (actualState === "location_permission" && !hasSpoken && config.enabled) {
      const message =
        language === "yo"
          ? "Láti gba ìtọ́sọ́nà, jọ̀wọ́ gba àyè láti wá ibi tí o wà nínú àwọn ètò browser rẹ. Tẹ 'Gba àyè' nígbà tí a bá béèrè."
          : language === "pcm"
          ? "To get direction, abeg allow us to find your location for your browser settings. Tap 'Allow' when we ask."
          : "To get directions, please allow location access in your browser settings. Tap 'Allow' when prompted."

      speak(message)
      setHasSpoken(true)
    }
  }, [state, hasSpoken, config.enabled, speak, language])

  // Check permission status on mount
  useEffect(() => {
    if (actualState === "location_permission" && permissionStatus === "pending") {
      // Check if permission is already granted
      if (navigator.permissions && navigator.permissions.query) {
        navigator.permissions.query({ name: 'geolocation' }).then((result) => {
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/a0691e2c-cdd7-47b0-9342-76cf3ac06d2f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'state-location-permission.tsx:38',message:'Permission API check',data:{state:result.state,hasGeolocation:!!navigator.geolocation},timestamp:Date.now(),sessionId:'debug-session',runId:'run13',hypothesisId:'S'})}).catch(()=>{});
          // #endregion
          if (result.state === 'granted') {
            // Permission already granted, get location immediately
            requestLocation()
          }
        }).catch(() => {
          // Permission API not supported, continue with manual request
        })
      }
    }
  }, [state, permissionStatus])

  const requestLocation = () => {
    // Prevent duplicate requests
    if (isRequestingLocationRef.current || hasTransitionedRef.current) {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/a0691e2c-cdd7-47b0-9342-76cf3ac06d2f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'state-location-permission.tsx:60',message:'Skipping duplicate location request',data:{isRequesting:isRequestingLocationRef.current,hasTransitioned:hasTransitionedRef.current,actualState},timestamp:Date.now(),sessionId:'debug-session',runId:'run16',hypothesisId:'V'})}).catch(()=>{});
      // #endregion
      return
    }

    // Check if already in navigation state
    const machineBeforeRequest = getStateMachine()
    const currentMachineState = machineBeforeRequest.getCurrentState()
    if (currentMachineState === 'navigation') {
      hasTransitionedRef.current = true
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/a0691e2c-cdd7-47b0-9342-76cf3ac06d2f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'state-location-permission.tsx:69',message:'Already in navigation, skipping request',data:{currentMachineState},timestamp:Date.now(),sessionId:'debug-session',runId:'run16',hypothesisId:'V'})}).catch(()=>{});
      // #endregion
      return
    }

    if (!navigator.geolocation) {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/a0691e2c-cdd7-47b0-9342-76cf3ac06d2f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'state-location-permission.tsx:75',message:'Geolocation not available',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run16',hypothesisId:'V'})}).catch(()=>{});
      // #endregion
      setPermissionStatus("denied")
      return
    }

    isRequestingLocationRef.current = true
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/a0691e2c-cdd7-47b0-9342-76cf3ac06d2f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'state-location-permission.tsx:81',message:'Requesting location permission',data:{hasGeolocation:!!navigator.geolocation,state,permissionStatus,actualState},timestamp:Date.now(),sessionId:'debug-session',runId:'run16',hypothesisId:'V'})}).catch(()=>{});
    // #endregion

    navigator.geolocation.getCurrentPosition(
      (position) => {
        // Reset request flag
        isRequestingLocationRef.current = false
        
        // Check if we've already transitioned (prevent duplicate transitions)
        if (hasTransitionedRef.current) {
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/a0691e2c-cdd7-47b0-9342-76cf3ac06d2f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'state-location-permission.tsx:95',message:'Location received but already transitioned, skipping',data:{lat:position.coords.latitude,lng:position.coords.longitude},timestamp:Date.now(),sessionId:'debug-session',runId:'run16',hypothesisId:'V'})}).catch(()=>{});
          // #endregion
          return
        }
        
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/a0691e2c-cdd7-47b0-9342-76cf3ac06d2f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'state-location-permission.tsx:101',message:'Location permission granted',data:{lat:position.coords.latitude,lng:position.coords.longitude},timestamp:Date.now(),sessionId:'debug-session',runId:'run16',hypothesisId:'V'})}).catch(()=>{});
        // #endregion
        setPermissionStatus("granted")
        // Check if we're already in navigation state (prevent duplicate transitions)
        const machineBeforeTransition = getStateMachine()
        const currentMachineState = machineBeforeTransition.getCurrentState()
        if (currentMachineState === 'navigation') {
          // Already in navigation, skip transition
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/a0691e2c-cdd7-47b0-9342-76cf3ac06d2f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'state-location-permission.tsx:98',message:'Already in navigation state, skipping transition',data:{currentMachineState,pollingUnitCode:context.pollingUnitCode},timestamp:Date.now(),sessionId:'debug-session',runId:'run15',hypothesisId:'U'})}).catch(()=>{});
          // #endregion
          return
        }
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/a0691e2c-cdd7-47b0-9342-76cf3ac06d2f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'state-location-permission.tsx:103',message:'Location permission granted',data:{pollingUnitCode:context.pollingUnitCode,currentState:state,hasPollingUnitCode:!!context.pollingUnitCode,codeFromUrl,hasCodeFromUrl:!!codeFromUrl},timestamp:Date.now(),sessionId:'debug-session',runId:'run15',hypothesisId:'U'})}).catch(()=>{});
        // #endregion
        
        // Grant location permission - this updates context but doesn't transition state
        grantLocationPermission()
        hasTransitionedRef.current = true
        
        // Check if code is in URL (from "Get Directions" on map page)
        // If codeFromUrl exists, user came from map with "Get Directions" - transition to navigation and stay on /navigate
        // If no codeFromUrl, user came from /navigate or "Start Navigation" - redirect to /map
        if (codeFromUrl) {
          // User has code in URL - transition to navigation and stay on /navigate
          // First, ensure polling unit code is set in context
          const machineAfterGrant = getStateMachine()
          const newMachineContext = machineAfterGrant.getContext()
          if (newMachineContext.pollingUnitCode !== codeFromUrl) {
            // Update context with polling unit code from URL
            machineAfterGrant.updateContext({ pollingUnitCode: codeFromUrl })
          }
          // Transition to navigation
          const transitionResult = transitionTo("navigation")
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/a0691e2c-cdd7-47b0-9342-76cf3ac06d2f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'state-location-permission.tsx:158',message:'Polling unit code in URL, transitioning to navigation',data:{pollingUnitCode:codeFromUrl,transitionResult},timestamp:Date.now(),sessionId:'debug-session',runId:'run15',hypothesisId:'U'})}).catch(()=>{});
          // #endregion
          // Stay on /navigate - the state machine will transition to navigation
          // and the map + directions will show up
        } else {
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/a0691e2c-cdd7-47b0-9342-76cf3ac06d2f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'state-location-permission.tsx:163',message:'No code in URL, redirecting to map page',data:{codeFromUrl,hasCodeFromUrl:!!codeFromUrl,locationGranted:context.locationGranted,currentState:state},timestamp:Date.now(),sessionId:'debug-session',runId:'run15',hypothesisId:'U'})}).catch(()=>{});
          // #endregion
          // No code in URL - redirect to map page to pick ward/polling unit
          // This happens when user comes from /navigate or "Start Navigation" without a code
          // ALWAYS redirect to /map after questions are answered (compulsory flow)
          setTimeout(() => {
            window.location.href = '/map'
          }, 100)
        }
      },
      (error) => {
        // Reset request flag
        isRequestingLocationRef.current = false
        
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/a0691e2c-cdd7-47b0-9342-76cf3ac06d2f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'state-location-permission.tsx:130',message:'Location permission denied',data:{error:error.message,code:error.code,errorName:error.name},timestamp:Date.now(),sessionId:'debug-session',runId:'run16',hypothesisId:'V'})}).catch(()=>{});
        // #endregion
        setPermissionStatus("denied")
      },
      { timeout: 15000, enableHighAccuracy: true }
    )
  }

  if (actualState !== "location_permission") return null

  const handleRetry = () => {
    setPermissionStatus("pending")
    requestLocation()
  }

  const handleRequestPermission = () => {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/a0691e2c-cdd7-47b0-9342-76cf3ac06d2f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'state-location-permission.tsx:95',message:'User clicked Allow button',data:{state,permissionStatus},timestamp:Date.now(),sessionId:'debug-session',runId:'run13',hypothesisId:'S'})}).catch(()=>{});
    // #endregion
    requestLocation()
  }

  const handleContinueWithoutLocation = () => {
    denyLocationPermission()
  }

  if (permissionStatus === "granted") {
    return (
      <Card className="mx-auto max-w-md border-green-500/20 bg-green-500/5">
        <CardContent className="p-6">
          <div className="mb-4 flex items-center justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10">
              <MapPin className="h-8 w-8 text-green-600" />
            </div>
          </div>
          <p className="text-center text-sm text-foreground">
            {language === "yo"
              ? "Àyè ti gba! A ń lọ sí ìpínlẹ̀ tókàn."
              : language === "pcm"
              ? "Permission don grant! We dey move to next step."
              : "Permission granted! Moving to next step."}
          </p>
        </CardContent>
      </Card>
    )
  }

  if (permissionStatus === "denied") {
    return (
      <Card className="mx-auto max-w-md border-orange-500/20 bg-orange-500/5">
        <CardContent className="p-6">
          <div className="mb-4 flex items-center justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-orange-500/10">
              <AlertCircle className="h-8 w-8 text-orange-600" />
            </div>
          </div>

          <h2 className="mb-2 text-center text-xl font-bold text-foreground">
            {language === "yo"
              ? "Àyè Kò Gba"
              : language === "pcm"
              ? "Permission No Grant"
              : "Location Access Denied"}
          </h2>

          <p className="mb-4 text-center text-sm text-muted-foreground">
            {language === "yo"
              ? "A kò lè wá ibi tí o wà láìsí àyè. O lè tẹ̀síwájú pẹ̀lú ìtọ́sọ́nà tẹ́ẹ̀sì."
              : language === "pcm"
              ? "We no fit find your location without permission. You fit continue with text direction."
              : "We can't find your location without permission. You can continue with text directions."}
          </p>

          <div className="flex flex-col gap-3">
            <Button onClick={handleRetry} variant="outline" className="w-full gap-2">
              <RefreshCw className="h-4 w-4" />
              {language === "yo"
                ? "Gbiyànjú Lẹ́ẹ̀kan Sí"
                : language === "pcm"
                ? "Try Again"
                : "Try Again"}
            </Button>

            <Button onClick={handleContinueWithoutLocation} className="w-full">
              {language === "yo"
                ? "Tẹ̀síwájú Pẹ̀lú Tẹ́ẹ̀sì"
                : language === "pcm"
                ? "Continue with Text"
                : "Continue with Text"}
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="mx-auto max-w-md border-primary/20 bg-gradient-to-br from-primary/5 to-background">
      <CardContent className="p-6">
        <div className="mb-4 flex items-center justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <MapPin className="h-8 w-8 text-primary" />
          </div>
        </div>

        <h2 className="mb-2 text-center text-xl font-bold text-foreground">
          {language === "yo"
            ? "Àyè Láti Wá Ibi"
            : language === "pcm"
            ? "Location Permission"
            : "Location Permission"}
        </h2>

        <p className="mb-6 text-center text-sm text-muted-foreground">
          {language === "yo"
            ? "Jọ̀wọ́ gba àyè láti wá ibi tí o wà nínú àwọn ètò browser rẹ. Tẹ 'Gba àyè' nígbà tí a bá béèrè."
            : language === "pcm"
            ? "Abeg allow us to find your location for your browser settings. Tap 'Allow' when we ask."
            : "Please allow location access in your browser settings. Tap 'Allow' when prompted."}
        </p>

        <div className="rounded-lg bg-muted p-4 text-xs text-muted-foreground">
          <p className="mb-2 font-semibold">
            {language === "yo" ? "Báwo Ni Ó Ṣe Nṣẹ́:" : language === "pcm" ? "How E Dey Work:" : "How it works:"}
          </p>
          <ol className="list-inside list-decimal space-y-1">
            <li>
              {language === "yo"
                ? "Browser rẹ yoo béèrè àyè"
                : language === "pcm"
                ? "Your browser go ask for permission"
                : "Your browser will ask for permission"}
            </li>
            <li>
              {language === "yo"
                ? "Tẹ 'Gba àyè' láti gba ìtọ́sọ́nà tó péye"
                : language === "pcm"
                ? "Tap 'Allow' to get correct direction"
                : "Tap 'Allow' to get accurate directions"}
            </li>
            <li>
              {language === "yo"
                ? "Ibi rẹ kò ní jẹ́ pátàkì fún àwọn ènìyàn mìíràn"
                : language === "pcm"
                ? "Your location no go be important for other people"
                : "Your location is only used for navigation"}
            </li>
          </ol>
        </div>

        <div className="mt-6 flex flex-col gap-3">
          <Button onClick={handleRequestPermission} className="w-full gap-2">
            <MapPin className="h-4 w-4" />
            {language === "yo"
              ? "Gba Àyè Láti Wá Ibi Mi"
              : language === "pcm"
              ? "Allow to Find My Location"
              : "Allow Location Access"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}








