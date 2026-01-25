"use client"

import { useEffect, useState } from "react"
import { useNavigationState } from "@/hooks/use-navigation-state"
import { getStateMachine } from "@/lib/state-machine"
import { StateWelcome } from "./states/state-welcome"
import { StateLocationPermission } from "./states/state-location-permission"
import { StateLanguageSelection } from "./states/state-language-selection"
import { StateVoiceConsent } from "./states/state-voice-consent"
import { StatePollingUnitInput } from "./states/state-polling-unit-input"
import { StatePollingUnitValidation } from "./states/state-polling-unit-validation"
import { StateNavigation } from "./states/state-navigation"
import { StateArrival } from "./states/state-arrival"
import { StateConfusionHelp } from "./states/state-confusion-help"

interface NavigationManagerProps {
  userLocation?: { latitude: number; longitude: number }
  pollingUnitLocation?: { latitude: number; longitude: number }
  distance?: number
  time?: number
  landmarks?: Array<{ name: string; distance: number; category?: string }>
  nearestLandmark?: { name: string; distance: number }
  simpleMode?: boolean
  onSimpleModeToggle?: (enabled: boolean) => void
  gpsUnavailable?: boolean
  routingFailed?: boolean
  pollingUnitData?: any
  routeSteps?: any[]
}

export function NavigationManager({
  userLocation,
  pollingUnitLocation,
  distance,
  time,
  landmarks,
  nearestLandmark,
  simpleMode = false,
  onSimpleModeToggle,
  gpsUnavailable = false,
  routingFailed = false,
  pollingUnitData,
  routeSteps,
}: NavigationManagerProps) {
  const { state, context } = useNavigationState()
  const [forceUpdate, setForceUpdate] = useState(0)
  
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
      }
    }, 100)
    return () => clearInterval(interval)
  }, [actualState, forceUpdate])

  // Use state machine state as primary source
  const currentState = actualState

  // Render the appropriate state component
  switch (currentState) {
    case "welcome":
      return <StateWelcome />
    case "location_permission":
      return <StateLocationPermission />
    case "language_selection":
      return <StateLanguageSelection />
    case "voice_consent":
      return <StateVoiceConsent />
    case "polling_unit_input":
      return <StatePollingUnitInput simpleMode={simpleMode} />
    case "polling_unit_validation":
      return <StatePollingUnitValidation />
    case "navigation":
      // #region agent log
      if (typeof window !== 'undefined') {
        fetch('http://127.0.0.1:7242/ingest/a0691e2c-cdd7-47b0-9342-76cf3ac06d2f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'navigation-manager.tsx:navigation',message:'Rendering StateNavigation with routeSteps',data:{hasRouteSteps:!!routeSteps,routeStepsCount:routeSteps?.length || 0,hasUserLocation:!!userLocation,hasDistance:distance !== undefined},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      }
      // #endregion
      return (
        <StateNavigation
          userLocation={userLocation}
          pollingUnitLocation={pollingUnitLocation}
          distance={distance}
          time={time}
          landmarks={landmarks}
          simpleMode={simpleMode}
          gpsUnavailable={gpsUnavailable}
          routingFailed={routingFailed}
          pollingUnitData={pollingUnitData}
          routeSteps={routeSteps}
        />
      )
    case "arrival":
      return <StateArrival simpleMode={simpleMode} />
    case "confusion_help":
      return <StateConfusionHelp nearestLandmark={nearestLandmark} userLocation={userLocation} />
    default:
      return <StateWelcome />
  }
}


