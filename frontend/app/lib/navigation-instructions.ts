/**
 * Navigation Instructions Generator
 * Creates landmark-based navigation instructions (not street names)
 */

export interface NavigationStep {
  instruction: string
  landmark?: string
  distance: number
  direction?: "forward" | "left" | "right" | "straight"
}

export interface Landmark {
  name: string
  distance: number
  category: string
}

/**
 * Generate landmark-based navigation instructions
 */
export function generateLandmarkInstructions(
  landmarks: Landmark[],
  totalDistance: number,
  language: "en" | "yo" | "pcm"
): NavigationStep[] {
  const steps: NavigationStep[] = []

  // Sort landmarks by distance
  const sortedLandmarks = [...landmarks].sort((a, b) => a.distance - b.distance)

  // If we have landmarks, use them for navigation
  if (sortedLandmarks.length > 0) {
    sortedLandmarks.slice(0, 5).forEach((landmark, index) => {
      const categoryName =
        language === "yo"
          ? getCategoryNameYo(landmark.category)
          : language === "pcm"
          ? getCategoryNamePcm(landmark.category)
          : getCategoryNameEn(landmark.category)

      if (index === 0) {
        // First landmark - "Head toward X"
        steps.push({
          instruction:
            language === "yo"
              ? `Tẹ̀síwájú sí ${landmark.name} (${categoryName})`
              : language === "pcm"
              ? `Head go ${landmark.name} (${categoryName})`
              : `Head toward ${landmark.name} (${categoryName})`,
          landmark: landmark.name,
          distance: landmark.distance,
        })
      } else {
        // Subsequent landmarks - "Continue past X"
        const prevDistance = sortedLandmarks[index - 1].distance
        const segmentDistance = landmark.distance - prevDistance

        steps.push({
          instruction:
            language === "yo"
              ? `Tẹ̀síwájú nígbà tí o bá dé ${landmark.name}, kọ́ja rẹ̀`
              : language === "pcm"
              ? `Continue go when you reach ${landmark.name}, pass am`
              : `Continue past ${landmark.name}`,
          landmark: landmark.name,
          distance: segmentDistance,
        })
      }
    })

    // Final instruction
    const lastLandmark = sortedLandmarks[sortedLandmarks.length - 1]
    const remainingDistance = totalDistance - lastLandmark.distance

    if (remainingDistance > 20) {
      steps.push({
        instruction:
          language === "yo"
            ? `Lẹ́yìn ${lastLandmark.name}, wá ibi ìdìbò rẹ ní agbègbè tókàn`
            : language === "pcm"
            ? `After ${lastLandmark.name}, find your polling unit dey nearby`
            : `After ${lastLandmark.name}, your polling unit is nearby`,
        distance: remainingDistance,
      })
    } else {
      steps.push({
        instruction:
          language === "yo"
            ? `Ibi ìdìbò rẹ wà ní ọ̀tún rẹ̀ lẹ́yìn ${lastLandmark.name}`
            : language === "pcm"
            ? `Your polling unit dey for your right hand after ${lastLandmark.name}`
            : `Your polling unit is on your right after ${lastLandmark.name}`,
        distance: remainingDistance,
      })
    }
  } else {
    // No landmarks - generic instruction
    steps.push({
      instruction:
        language === "yo"
          ? "Tẹ̀síwájú ní ìtọ́sọ́nà tí a fi fún ọ"
          : language === "pcm"
          ? "Follow the direction wey we give you"
          : "Continue following the directions provided",
      distance: totalDistance,
    })
  }

  return steps
}

function getCategoryNameEn(category: string): string {
  const names: Record<string, string> = {
    school: "School",
    mosque: "Mosque",
    church: "Church",
    market: "Market",
    bus_stop: "Bus Stop",
    other: "Landmark",
  }
  return names[category] || "Landmark"
}

function getCategoryNameYo(category: string): string {
  const names: Record<string, string> = {
    school: "Ilé-ìwé",
    mosque: "Màálùùmù",
    church: "Ọ̀jọ́",
    market: "Ọjà",
    bus_stop: "Ibusó",
    other: "Àmì Àgbáyé",
  }
  return names[category] || "Àmì Àgbáyé"
}

function getCategoryNamePcm(category: string): string {
  const names: Record<string, string> = {
    school: "School",
    mosque: "Mosque",
    church: "Church",
    market: "Market",
    bus_stop: "Bus Stop",
    other: "Landmark",
  }
  return names[category] || "Landmark"
}

/**
 * Get next navigation instruction based on current position
 */
export function getNextInstruction(
  landmarks: Landmark[],
  currentDistance: number,
  totalDistance: number,
  language: "en" | "yo" | "pcm"
): string {
  const upcomingLandmarks = landmarks.filter((lm) => lm.distance >= currentDistance)

  if (upcomingLandmarks.length === 0) {
    // No more landmarks - almost there
    const remaining = totalDistance - currentDistance

    if (remaining < 30) {
      return language === "yo"
        ? "O ti fẹ́rẹ̀ẹ́ dé! Wo àwọn àmì àgbáyé tó wà ní ọ̀tún rẹ̀."
        : language === "pcm"
        ? "You don almost reach! Check landmarks wey dey for your right."
        : "You're almost there! Look for landmarks on your right."
    }

    return language === "yo"
      ? `Tẹ̀síwájú fún mẹ́tà ${Math.round(remaining)} ní ìwọ̀n mẹ́tà`
      : language === "pcm"
      ? `Continue go for ${Math.round(remaining)} meters`
      : `Continue for ${Math.round(remaining)} meters`
  }

  const nextLandmark = upcomingLandmarks[0]
  const distanceToLandmark = nextLandmark.distance - currentDistance
  const categoryName =
    language === "yo"
      ? getCategoryNameYo(nextLandmark.category)
      : language === "pcm"
      ? getCategoryNamePcm(nextLandmark.category)
      : getCategoryNameEn(nextLandmark.category)

  if (distanceToLandmark < 50) {
    return language === "yo"
      ? `O ti fẹ́rẹ̀ẹ́ dé ${nextLandmark.name}. Kọ́ja rẹ̀ tẹ̀síwájú.`
      : language === "pcm"
      ? `You don almost reach ${nextLandmark.name}. Pass am continue.`
      : `You're approaching ${nextLandmark.name}. Continue past it.`
  }

  return language === "yo"
    ? `Tẹ̀síwájú sí ${nextLandmark.name} (${categoryName}) - ${Math.round(distanceToLandmark)}m tókàn`
    : language === "pcm"
    ? `Head go ${nextLandmark.name} (${categoryName}) - ${Math.round(distanceToLandmark)}m remain`
    : `Head toward ${nextLandmark.name} (${categoryName}) - ${Math.round(distanceToLandmark)}m ahead`
}















