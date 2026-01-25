//when ever a user moves from get direction it should take the person to a protected page where user location is requested then the direction and map comes up also the turn by turn navigation and the voice help. i want navigate and start navigation links on the home page should compulsorily as users to answer questions then after answers it takes them to the map to pick wards and poling unit, then when they choose get directions it takes them to a protected page where they get directions and the voice navigation and turn  by turn help. what it is doing know is if  i go through the mp view and get directions and i go back to start navigation it picks the direction i choose before which shouldnt be so. i want it to start again. so how can i solve this   
"use client"

import { useEffect, useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useNavigationState } from "@/hooks/use-navigation-state"
import { useVoiceGuidance } from "@/hooks/use-voice-guidance"
import { useLanguage } from "@/hooks/use-language"
import { Navigation, MapPin, AlertCircle, CheckCircle, ArrowRight, Mic } from "lucide-react"
import { getNextInstruction, generateLandmarkInstructions } from "@/lib/navigation-instructions"
import { getNextTurnByTurnInstruction, type RouteStep } from "@/lib/turn-by-turn-navigation"
import type { Language } from "@/lib/types"

interface NavigationStateProps {
  userLocation?: { latitude: number; longitude: number }
  pollingUnitLocation?: { latitude: number; longitude: number }
  distance?: number
  time?: number
  landmarks?: Array<{ name: string; distance: number; category?: string }>
  simpleMode?: boolean
  gpsUnavailable?: boolean
  routingFailed?: boolean
  pollingUnitData?: any
  routeSteps?: RouteStep[]
}

export function StateNavigation({
  userLocation,
  pollingUnitLocation,
  distance,
  time,
  landmarks,
  simpleMode = false,
  gpsUnavailable = false,
  routingFailed = false,
  pollingUnitData,
  routeSteps = [],
}: NavigationStateProps) {
  const { state, context, confirmArrival, requestHelp } = useNavigationState()
  const { language } = useLanguage()
  const { speak, config } = useVoiceGuidance()
  
  // #region agent log
  useEffect(() => {
    if (typeof window !== 'undefined') {
      fetch('http://127.0.0.1:7242/ingest/a0691e2c-cdd7-47b0-9342-76cf3ac06d2f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'state-navigation.tsx:component',message:'StateNavigation component render',data:{hasRouteSteps:routeSteps && routeSteps.length > 0,routeStepsCount:routeSteps?.length || 0,hasUserLocation:!!userLocation,hasDistance:distance !== undefined,distance,currentInstruction,voiceEnabled:config.enabled,language},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    }
  }, [routeSteps, userLocation, distance, config.enabled, language])
  // #endregion
  const [currentStep, setCurrentStep] = useState(0)
  const [hasSpoken, setHasSpoken] = useState(false)
  const [currentInstruction, setCurrentInstruction] = useState<string>("")
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const navigationStepsRef = useRef<any[]>([])
  const previousDistanceRef = useRef<number | undefined>(undefined)
  const wrongDirectionWarningRef = useRef(false)
  const lastSpokenInstructionRef = useRef<string>("") // Track last spoken instruction to avoid repeats

  // Enable voice guidance when navigation starts and announce start
  useEffect(() => {
    if (state === "navigation" && !hasSpoken) {
      // Ensure voice is enabled for navigation
      if (!config.enabled) {
        // Voice guidance should be enabled from voice consent, but enable it if not
        // This ensures voice navigation works even if user skipped voice consent
        // #region agent log
        if (typeof window !== 'undefined') {
          fetch('http://127.0.0.1:7242/ingest/a0691e2c-cdd7-47b0-9342-76cf3ac06d2f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'state-navigation.tsx:enable-voice',message:'Enabling voice guidance for navigation',data:{wasEnabled:config.enabled},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
        }
        // #endregion
      }
      
      const message =
        language === "yo"
          ? "A ti bẹ̀rẹ̀ ìtọ́sọ́nà. Tẹ̀síwájú ní ìgbésẹ̀ kan lẹ́yìn ìgbésẹ̀ kan."
          : language === "pcm"
          ? "We don start navigation. Continue step by step."
          : "Navigation started. Follow the directions step by step."

      // Always speak the start message (force if voice not enabled)
      speak(message, { force: true })
      setHasSpoken(true)
    }
  }, [state, hasSpoken, config.enabled, speak, language])

  // Generate navigation instructions when landmarks are available
  useEffect(() => {
    if (landmarks && landmarks.length > 0 && distance !== undefined) {
      // Convert language to supported format (en, yo, pcm)
      const navLanguage = language === "yo" || language === "pcm" ? language : "en"
      const steps = generateLandmarkInstructions(
        landmarks.map((lm) => ({
          name: lm.name,
          distance: lm.distance,
          category: lm.category || "other",
        })),
        distance,
        navLanguage
      )
      navigationStepsRef.current = steps

      // Get current instruction based on distance
      const instruction = getNextInstruction(
        landmarks.map((lm) => ({
          name: lm.name,
          distance: lm.distance,
          category: lm.category || "other",
        })),
        0, // We'll update this based on actual position
        distance,
        navLanguage
      )
      setCurrentInstruction(instruction)
    }
  }, [landmarks, distance, language])

  // Update instruction based on turn-by-turn navigation or landmarks
  useEffect(() => {
    // Detect if user is moving in wrong direction
    if (distance !== undefined && previousDistanceRef.current !== undefined) {
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

          setCurrentInstruction(correctionMessage)
          if (config.enabled) {
            speak(correctionMessage)
          }
        }
      } else if (distance < previousDistanceRef.current - 10) {
        // User is moving in correct direction (distance decreased by more than 10 meters)
        wrongDirectionWarningRef.current = false
      }
    }

    // Update previous distance
    if (distance !== undefined) {
      previousDistanceRef.current = distance
    }

    // Only show normal instruction if not showing wrong direction warning
    if (!wrongDirectionWarningRef.current) {
      // #region agent log
      if (typeof window !== 'undefined') {
        fetch('http://127.0.0.1:7242/ingest/a0691e2c-cdd7-47b0-9342-76cf3ac06d2f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'state-navigation.tsx:useEffect',message:'Updating navigation instruction',data:{routeStepsCount:routeSteps?.length || 0,hasRouteSteps:routeSteps && routeSteps.length > 0,hasUserLocation:!!userLocation,hasDistance:distance !== undefined,distance,hasLandmarks:!!landmarks,landmarksCount:landmarks?.length || 0,language},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      }
      // #endregion
      
      // Prefer turn-by-turn navigation if route steps are available
      if (routeSteps && routeSteps.length > 0 && userLocation && distance !== undefined) {
        // #region agent log
        if (typeof window !== 'undefined') {
          fetch('http://127.0.0.1:7242/ingest/a0691e2c-cdd7-47b0-9342-76cf3ac06d2f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'state-navigation.tsx:useEffect',message:'Using turn-by-turn navigation',data:{routeStepsCount:routeSteps.length,userLat:userLocation.latitude,userLng:userLocation.longitude,distance},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
        }
        // #endregion
        
        const turnByTurnInstruction = getNextTurnByTurnInstruction(
          routeSteps,
          { lat: userLocation.latitude, lng: userLocation.longitude },
          distance,
          (language === 'yo' || language === 'pcm') ? language : 'en'
        )

        // #region agent log
        if (typeof window !== 'undefined') {
          fetch('http://127.0.0.1:7242/ingest/a0691e2c-cdd7-47b0-9342-76cf3ac06d2f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'state-navigation.tsx:useEffect',message:'Turn-by-turn instruction result',data:{hasInstruction:!!turnByTurnInstruction,instruction:turnByTurnInstruction?.instruction,maneuverType:turnByTurnInstruction?.maneuverType,distance:turnByTurnInstruction?.distance,isUpcoming:turnByTurnInstruction?.isUpcoming},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
        }
        // #endregion

        if (turnByTurnInstruction) {
          setCurrentInstruction(turnByTurnInstruction.instruction)
          
          // #region agent log
          if (typeof window !== 'undefined') {
            fetch('http://127.0.0.1:7242/ingest/a0691e2c-cdd7-47b0-9342-76cf3ac06d2f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'state-navigation.tsx:useEffect',message:'Instruction set and checking voice',data:{instruction:turnByTurnInstruction.instruction,voiceEnabled:config.enabled,shouldSpeak:!turnByTurnInstruction.isUpcoming && turnByTurnInstruction.maneuverType !== 'continue' || (turnByTurnInstruction.distance <= 50 && turnByTurnInstruction.maneuverType !== 'continue')},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
          }
          // #endregion
          
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
              // #region agent log
              if (typeof window !== 'undefined') {
                fetch('http://127.0.0.1:7242/ingest/a0691e2c-cdd7-47b0-9342-76cf3ac06d2f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'state-navigation.tsx:useEffect',message:'Speaking turn-by-turn instruction',data:{instruction:turnByTurnInstruction.instruction,maneuverType:turnByTurnInstruction.maneuverType,distance:turnByTurnInstruction.distance,isUpcoming:turnByTurnInstruction.isUpcoming,voiceEnabled:config.enabled},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
              }
              // #endregion
              // Always speak turn-by-turn instructions (force if voice not enabled)
              speak(turnByTurnInstruction.instruction, { force: true })
              lastSpokenInstructionRef.current = turnByTurnInstruction.instruction
            }
          } else if (turnByTurnInstruction.maneuverType === "continue" && turnByTurnInstruction.distance <= 200 && lastSpokenInstructionRef.current !== turnByTurnInstruction.instruction) {
            // Speak "continue straight" when within 200m to keep user informed (but not too frequently)
            // #region agent log
            if (typeof window !== 'undefined') {
              fetch('http://127.0.0.1:7242/ingest/a0691e2c-cdd7-47b0-9342-76cf3ac06d2f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'state-navigation.tsx:useEffect',message:'Speaking continue instruction',data:{instruction:turnByTurnInstruction.instruction,distance:turnByTurnInstruction.distance},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
            }
            // #endregion
            speak(turnByTurnInstruction.instruction, { force: true })
            lastSpokenInstructionRef.current = turnByTurnInstruction.instruction
          }
        }
      } else if (landmarks && distance !== undefined && distance > 0) {
        // Fall back to landmark-based navigation
        // Convert language to supported format (en, yo, pcm)
        const navLanguage = language === "yo" || language === "pcm" ? language : "en"
        const instruction = getNextInstruction(
          landmarks.map((lm) => ({
            name: lm.name,
            distance: lm.distance,
            category: lm.category || "other",
          })),
          0, // Current position relative to start
          distance,
          navLanguage
        )
        setCurrentInstruction(instruction)

        // Speak instruction if voice is enabled
        if (config.enabled && instruction) {
          speak(instruction)
        }
      }
    }
  }, [routeSteps, userLocation, distance, landmarks, language, config.enabled, speak])

  // Check if arrived (within 15 meters as per FR-15)
  useEffect(() => {
    if (distance !== undefined && distance < 15) {
      confirmArrival()
    }
  }, [distance, confirmArrival])

  // Provide periodic encouragement
  useEffect(() => {
    if (state === "navigation" && config.enabled) {
      intervalRef.current = setInterval(() => {
        const encouragements =
          language === "yo"
            ? [
                "O ń ṣe dáadáa! Tẹ̀síwájú.",
                "Ìbò rẹ ṣe pàtàkì. Máa lọ!",
                "O ti fẹ́rẹ̀ẹ́ dé! Tẹ̀síwájú.",
              ]
            : language === "pcm"
            ? [
                "You dey do well! Continue.",
                "Your vote important. Continue dey go!",
                "You don almost reach! Continue.",
              ]
            : [
                "You're doing great! Keep going.",
                "Your vote matters. Keep moving!",
                "Almost there! Continue.",
              ]

        const message = encouragements[Math.floor(Math.random() * encouragements.length)]
        speak(message)
      }, 60000) // Every minute

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current)
        }
      }
    }
  }, [state, config.enabled, speak, language])

  if (state !== "navigation") return null

  const handleArrived = () => {
    confirmArrival()
  }

  const handleNeedHelp = () => {
    requestHelp()
  }

  // Generate fallback instructions when GPS unavailable or routing fails (NFR-03, NFR-04)
  const getFallbackInstructions = () => {
    if (!pollingUnitData) return ""
    
    const unitName = pollingUnitData.name || ""
    const address = pollingUnitData.address || ""
    
    if (gpsUnavailable) {
      return language === "yo"
        ? `A kò lè wá ibi tí o wà. Lọ sí ${unitName} ní ${address}. Beere awọn eniyan agbegbe fun itọsọna.`
        : language === "pcm"
        ? `We no fit find your location. Go to ${unitName} for ${address}. Ask people around for direction.`
        : `We can't find your location. Head to ${unitName} at ${address}. Ask locals for directions.`
    }
    
    if (routingFailed) {
      return language === "yo"
        ? `A kò lè ṣe àgbékalẹ̀ ọ̀nà. Lọ sí ${unitName} ní ${address}. Tẹle ọna nla ki o wa aami ibi idibo.`
        : language === "pcm"
        ? `We no fit calculate route. Go to ${unitName} for ${address}. Follow the main road and look for the polling unit sign.`
        : `We couldn't calculate a route. Head to ${unitName} at ${address}. Follow the main road and look for the polling unit signage.`
    }
    
    return ""
  }

  const getCategoryName = (category: string, lang: Language): string => {
    const names: Record<string, Record<Language, string>> = {
      school: { en: "School", yo: "Ilé-ìwé", pcm: "School", ha: "Makaranta", ig: "Ụlọ Akwụkwọ" },
      mosque: { en: "Mosque", yo: "Màálùùmù", pcm: "Mosque", ha: "Masallaci", ig: "Ụlọ Nsọ Alakụba" },
      church: { en: "Church", yo: "Ọ̀jọ́", pcm: "Church", ha: "Coci", ig: "Ụlọ Nsọ" },
      market: { en: "Market", yo: "Ọjà", pcm: "Market", ha: "Kasuwa", ig: "Ahịa" },
      bus_stop: { en: "Bus Stop", yo: "Ibusó", pcm: "Bus Stop", ha: "Tashar Bas", ig: "Ebe Nkwụsị Bọs" },
      other: { en: "Landmark", yo: "Àmì Àgbáyé", pcm: "Landmark", ha: "Alama", ig: "Ihe Ncheta" },
    }
    return names[category]?.[lang] || category
  }

  return (
    <Card className={simpleMode ? "mx-auto max-w-md border-primary/20 bg-gradient-to-br from-primary/5 to-background" : "mx-auto max-w-md border-primary/20 bg-gradient-to-br from-primary/5 to-background"}>
      <CardContent className={simpleMode ? "p-8" : "p-6"}>
        {!simpleMode && (
          <div className="mb-4 flex items-center justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Navigation className="h-8 w-8 animate-pulse text-primary" />
            </div>
          </div>
        )}

        <h2 className={`mb-2 text-center font-bold text-foreground ${simpleMode ? "text-3xl" : "text-xl"}`}>
          {language === "yo"
            ? "Ń Ṣe Ìtọ́sọ́nà"
            : language === "pcm"
            ? "Dey Navigate"
            : "Navigating"}
        </h2>

        {distance !== undefined && time !== undefined && (
          <div className={`mb-4 space-y-2 rounded-lg bg-muted ${simpleMode ? "p-6" : "p-4"}`}>
            <div className="flex items-center justify-between">
              <span className={simpleMode ? "text-lg text-muted-foreground" : "text-sm text-muted-foreground"}>
                {language === "yo" ? "Ijinlẹ̀:" : language === "pcm" ? "Distance:" : language === "ha" ? "Nisa:" : language === "ig" ? "Ebe Dị Anyị:" : "Distance:"}
              </span>
              <span className={simpleMode ? "text-2xl font-bold text-foreground" : "font-semibold text-foreground"}>
                {distance < 1000 ? `${Math.round(distance)}m` : `${(distance / 1000).toFixed(1)}km`}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className={simpleMode ? "text-lg text-muted-foreground" : "text-sm text-muted-foreground"}>
                {language === "yo" ? "Àkókò:" : language === "pcm" ? "Time:" : language === "ha" ? "Lokaci:" : language === "ig" ? "Oge:" : "Time:"}
              </span>
              <span className={simpleMode ? "text-2xl font-bold text-foreground" : "font-semibold text-foreground"}>
                {time} {language === "yo" ? "ìṣẹ́jú" : language === "pcm" ? "minutes" : language === "ha" ? "minti" : language === "ig" ? "nkeji" : "min"}
              </span>
            </div>
          </div>
        )}

        {/* Fallback Instructions (NFR-03, NFR-04) */}
        {(gpsUnavailable || routingFailed) && (
          <div className={`mb-4 rounded-lg border border-orange-500/20 bg-orange-500/5 ${simpleMode ? "p-6" : "p-4"}`}>
            <div className="flex items-start gap-3">
              {!simpleMode && <AlertCircle className="mt-0.5 h-4 w-4 text-orange-600" />}
              <div className="flex-1">
                <p className={`${simpleMode ? "text-lg" : "text-sm"} font-semibold text-foreground mb-1`}>
                  {language === "yo"
                    ? "Ìtọ́sọ́nà Àdàkọ:"
                    : language === "pcm"
                    ? "Fallback Direction:"
                    : language === "ha"
                    ? "Jagoranci Na Baya:"
                    : language === "ig"
                    ? "Ntụziaka Nlaghachi:"
                    : "Fallback Instructions:"}
                </p>
                <p className={simpleMode ? "text-xl font-semibold text-foreground" : "text-sm text-muted-foreground"}>
                  {getFallbackInstructions()}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Current Navigation Instruction */}
        {currentInstruction && !gpsUnavailable && !routingFailed && (
          <div className={`mb-4 rounded-lg border border-primary/20 bg-primary/5 ${simpleMode ? "p-6" : "p-4"}`}>
            <div className="flex items-start gap-3">
              {!simpleMode && <ArrowRight className="mt-0.5 h-4 w-4 text-primary" />}
              <div className="flex-1">
                {!simpleMode && (
                  <p className="text-sm font-semibold text-foreground">
                    {language === "yo"
                      ? "Ìtọ́sọ́nà Lọ́wọ́lọ́wọ́:"
                      : language === "pcm"
                      ? "Current Direction:"
                      : language === "ha"
                      ? "Jagoranci Na Yanzu:"
                      : language === "ig"
                      ? "Ntụziaka Ugbu A:"
                      : "Current Direction:"}
                  </p>
                )}
                <p className={simpleMode ? "mt-1 text-xl font-semibold text-foreground" : "mt-1 text-sm text-muted-foreground"}>
                  {currentInstruction}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Landmarks - Only show in non-simple mode (FR-26: Simple Mode uses landmark-only directions, but we show them in instructions) */}
        {!simpleMode && landmarks && landmarks.length > 0 && (
          <div className="mb-4 rounded-lg bg-muted p-4">
            <p className="mb-2 text-xs font-semibold text-muted-foreground">
              {language === "yo"
                ? "Àwọn Àmì Àgbáyé Nítòsí:"
                : language === "pcm"
                ? "Landmarks Nearby:"
                : language === "ha"
                ? "Alamomin Kusa:"
                : language === "ig"
                ? "Ihe Ncheta Dị Nso:"
                : "Upcoming Landmarks:"}
            </p>
            <ul className="space-y-2 text-xs text-foreground">
              {landmarks.slice(0, 3).map((landmark, idx) => (
                <li key={idx} className="flex items-center gap-2">
                  <MapPin className="h-3 w-3 text-primary" />
                  <span className="flex-1">
                    {landmark.name}
                    {landmark.category && (
                      <span className="ml-2 text-muted-foreground">
                        ({getCategoryName(landmark.category, language)})
                      </span>
                    )}
                  </span>
                  <span className="text-muted-foreground">{landmark.distance}m</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {distance !== undefined && distance < 15 && (
          <div className={`mb-4 flex items-center gap-2 rounded-lg border border-green-500/50 bg-green-500/10 ${simpleMode ? "p-4" : "p-3"} ${simpleMode ? "text-lg" : "text-sm"} text-green-700 dark:text-green-400`}>
            {!simpleMode && <CheckCircle className="h-4 w-4" />}
            <span className={simpleMode ? "text-xl font-semibold" : ""}>
              {language === "yo"
                ? "O ti fẹ́rẹ̀ẹ́ dé!"
                : language === "pcm"
                ? "You don almost reach!"
                : language === "ha"
                ? "Kuna kusa da zuwa!"
                : language === "ig"
                ? "Ị nọ nso!"
                : "You're almost there!"}
            </span>
          </div>
        )}

        <div className={`flex flex-col ${simpleMode ? "gap-4" : "gap-3"}`}>
          <Button 
            onClick={handleArrived} 
            className={`w-full ${simpleMode ? "h-14 text-lg" : ""}`} 
            disabled={distance === undefined || distance > 15}
          >
            {language === "yo"
              ? "Mo Ti Dé"
              : language === "pcm"
              ? "I Don Reach"
              : language === "ha"
              ? "Na Iso"
              : language === "ig"
              ? "Abịala M"
              : "I've Arrived"}
          </Button>

          {!simpleMode && (
            <Button onClick={handleNeedHelp} variant="outline" className="w-full gap-2">
              <AlertCircle className="h-4 w-4" />
              {language === "yo"
                ? "Mo Dáa Lọ́nà"
                : language === "pcm"
                ? "I Don Lost"
                : language === "ha"
                ? "Na Bata"
                : language === "ig"
                ? "Enwere M Nsogbu"
                : "I'm Confused"}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}


