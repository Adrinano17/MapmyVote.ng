/**
 * Turn-by-Turn Navigation System
 * Provides Google Maps-style navigation instructions
 */

export interface RouteStep {
  start_location: { lat: number; lng: number }
  end_location: { lat: number; lng: number }
  distance: { value: number; text: string }
  duration: { value: number; text: string }
  html_instructions: string
  maneuver?: {
    type: string
    modifier: string
    instruction: string
    location: [number, number]
  }
  cumulative_distance?: number
}

export interface TurnByTurnInstruction {
  instruction: string
  distance: number
  maneuverType: string
  modifier: string
  isUpcoming: boolean
}

/**
 * Convert Mapbox maneuver type to human-readable instruction
 */
export function getManeuverInstruction(
  maneuverType: string,
  modifier: string,
  distance: number,
  language: "en" | "yo" | "pcm" = "en"
): string {
  const distanceText = distance < 1000 
    ? `${Math.round(distance)}m` 
    : `${(distance / 1000).toFixed(1)}km`

  // English instructions
  if (language === "en") {
    switch (maneuverType) {
      case "turn":
        if (modifier.includes("left")) {
          return `In ${distanceText}, turn left`
        } else if (modifier.includes("right")) {
          return `In ${distanceText}, turn right`
        } else if (modifier.includes("slight left")) {
          return `In ${distanceText}, turn slightly left`
        } else if (modifier.includes("slight right")) {
          return `In ${distanceText}, turn slightly right`
        } else if (modifier.includes("sharp left")) {
          return `In ${distanceText}, turn sharp left`
        } else if (modifier.includes("sharp right")) {
          return `In ${distanceText}, turn sharp right`
        }
        return `In ${distanceText}, turn`
      
      case "continue":
      case "straight":
        return `Continue straight for ${distanceText}`
      
      case "merge":
        if (modifier.includes("left")) {
          return `In ${distanceText}, merge left`
        } else if (modifier.includes("right")) {
          return `In ${distanceText}, merge right`
        }
        return `In ${distanceText}, merge`
      
      case "fork":
        if (modifier.includes("left")) {
          return `In ${distanceText}, keep left at the fork`
        } else if (modifier.includes("right")) {
          return `In ${distanceText}, keep right at the fork`
        }
        return `In ${distanceText}, stay straight at the fork`
      
      case "arrive":
        return "You have arrived at your destination"
      
      case "depart":
        return "Start navigation"
      
      default:
        return `In ${distanceText}, ${maneuverType}`
    }
  }

  // Yoruba instructions
  if (language === "yo") {
    switch (maneuverType) {
      case "turn":
        if (modifier.includes("left")) {
          return `Ní ${distanceText}, yípadà sí òsì`
        } else if (modifier.includes("right")) {
          return `Ní ${distanceText}, yípadà sí ọ̀tún`
        }
        return `Ní ${distanceText}, yípadà`
      
      case "continue":
      case "straight":
        return `Tẹ̀síwájú ní ìtọ́sọ́nà fún ${distanceText}`
      
      case "arrive":
        return "O ti dé ibi ìdìbò rẹ"
      
      case "depart":
        return "Bẹ̀rẹ̀ ìtọ́sọ́nà"
      
      default:
        return `Ní ${distanceText}, ${maneuverType}`
    }
  }

  // Pidgin instructions
  if (language === "pcm") {
    switch (maneuverType) {
      case "turn":
        if (modifier.includes("left")) {
          return `For ${distanceText}, turn left`
        } else if (modifier.includes("right")) {
          return `For ${distanceText}, turn right`
        }
        return `For ${distanceText}, turn`
      
      case "continue":
      case "straight":
        return `Continue go straight for ${distanceText}`
      
      case "arrive":
        return "You don reach your destination"
      
      case "depart":
        return "Start navigation"
      
      default:
        return `For ${distanceText}, ${maneuverType}`
    }
  }

  return `In ${distanceText}, continue`
}

/**
 * Find the current step based on user's position along the route
 */
export function getCurrentStep(
  steps: RouteStep[],
  userLocation: { lat: number; lng: number },
  totalDistance: number
): { currentStepIndex: number; distanceToNextTurn: number } {
  if (!steps || steps.length === 0) {
    return { currentStepIndex: 0, distanceToNextTurn: totalDistance }
  }

  // Calculate distance from user to each step's end location
  let closestStepIndex = 0
  let minDistance = Infinity

  steps.forEach((step, index) => {
    const stepEnd = step.end_location
    const distance = calculateDistance(
      userLocation.lat,
      userLocation.lng,
      stepEnd.lat,
      stepEnd.lng
    )
    
    if (distance < minDistance) {
      minDistance = distance
      closestStepIndex = index
    }
  })

  // Find the next step with a turn (not continue/straight)
  let nextTurnIndex = closestStepIndex + 1
  while (nextTurnIndex < steps.length) {
    const step = steps[nextTurnIndex]
    const maneuverType = step.maneuver?.type || "continue"
    if (maneuverType !== "continue" && maneuverType !== "straight") {
      break
    }
    nextTurnIndex++
  }

  // Calculate distance to next turn
  const distanceToNextTurn = nextTurnIndex < steps.length
    ? steps[nextTurnIndex].cumulative_distance! - (steps[closestStepIndex].cumulative_distance! || 0)
    : totalDistance - (steps[closestStepIndex].cumulative_distance! || 0)

  return {
    currentStepIndex: closestStepIndex,
    distanceToNextTurn: Math.max(0, distanceToNextTurn)
  }
}

/**
 * Get the next instruction for turn-by-turn navigation
 */
export function getNextTurnByTurnInstruction(
  steps: RouteStep[],
  userLocation: { lat: number; lng: number },
  totalDistance: number,
  language: "en" | "yo" | "pcm" = "en"
): TurnByTurnInstruction | null {
  // #region agent log
  if (typeof window !== 'undefined') {
    fetch('http://127.0.0.1:7242/ingest/a0691e2c-cdd7-47b0-9342-76cf3ac06d2f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'turn-by-turn-navigation.ts:getNextTurnByTurnInstruction',message:'getNextTurnByTurnInstruction called',data:{stepsCount:steps?.length || 0,hasSteps:!!steps && steps.length > 0,userLat:userLocation?.lat,userLng:userLocation?.lng,totalDistance,language},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
  }
  // #endregion
  
  if (!steps || steps.length === 0) {
    // #region agent log
    if (typeof window !== 'undefined') {
      fetch('http://127.0.0.1:7242/ingest/a0691e2c-cdd7-47b0-9342-76cf3ac06d2f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'turn-by-turn-navigation.ts:getNextTurnByTurnInstruction',message:'No route steps available',data:{stepsCount:steps?.length || 0},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    }
    // #endregion
    return null
  }

  const { currentStepIndex, distanceToNextTurn } = getCurrentStep(steps, userLocation, totalDistance)
  
  // #region agent log
  if (typeof window !== 'undefined') {
    fetch('http://127.0.0.1:7242/ingest/a0691e2c-cdd7-47b0-9342-76cf3ac06d2f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'turn-by-turn-navigation.ts:getNextTurnByTurnInstruction',message:'Current step calculated',data:{currentStepIndex,distanceToNextTurn,totalSteps:steps.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
  }
  // #endregion
  
  // Get the next step that requires action (not just continue)
  let nextActionStepIndex = currentStepIndex + 1
  while (nextActionStepIndex < steps.length) {
    const step = steps[nextActionStepIndex]
    const maneuverType = step.maneuver?.type || "continue"
    
    // #region agent log
    if (typeof window !== 'undefined' && nextActionStepIndex < currentStepIndex + 5) {
      fetch('http://127.0.0.1:7242/ingest/a0691e2c-cdd7-47b0-9342-76cf3ac06d2f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'turn-by-turn-navigation.ts:getNextTurnByTurnInstruction',message:'Checking step for action',data:{stepIndex:nextActionStepIndex,maneuverType,modifier:step.maneuver?.modifier || ''},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    }
    // #endregion
    
    if (maneuverType !== "continue" && maneuverType !== "straight") {
      const instruction = getManeuverInstruction(
        maneuverType,
        step.maneuver?.modifier || "",
        distanceToNextTurn,
        language
      )
      
      // #region agent log
      if (typeof window !== 'undefined') {
        fetch('http://127.0.0.1:7242/ingest/a0691e2c-cdd7-47b0-9342-76cf3ac06d2f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'turn-by-turn-navigation.ts:getNextTurnByTurnInstruction',message:'Turn instruction generated',data:{instruction,maneuverType,modifier:step.maneuver?.modifier || '',distanceToNextTurn,isUpcoming:distanceToNextTurn > 50},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      }
      // #endregion
      
      return {
        instruction,
        distance: distanceToNextTurn,
        maneuverType,
        modifier: step.maneuver?.modifier || "",
        isUpcoming: distanceToNextTurn > 50 // Show when more than 50m away
      }
    }
    
    nextActionStepIndex++
  }

  // If no turn found, show continue instruction
  if (distanceToNextTurn > 0) {
    return {
      instruction: getManeuverInstruction("continue", "", distanceToNextTurn, language),
      distance: distanceToNextTurn,
      maneuverType: "continue",
      modifier: "",
      isUpcoming: true
    }
  }

  return {
    instruction: getManeuverInstruction("arrive", "", 0, language),
    distance: 0,
    maneuverType: "arrive",
    modifier: "",
    isUpcoming: false
  }
}

/**
 * Calculate distance between two coordinates (Haversine formula)
 */
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3 // Earth radius in meters
  const φ1 = (lat1 * Math.PI) / 180
  const φ2 = (lat2 * Math.PI) / 180
  const Δφ = ((lat2 - lat1) * Math.PI) / 180
  const Δλ = ((lon2 - lon1) * Math.PI) / 180

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return R * c
}

