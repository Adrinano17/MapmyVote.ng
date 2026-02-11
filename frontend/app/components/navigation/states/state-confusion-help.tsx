"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useNavigationState } from "@/hooks/use-navigation-state"
import { useVoiceGuidance } from "@/hooks/use-voice-guidance"
import { useLanguage } from "@/hooks/use-language"
import { MapPin, Navigation, ArrowLeft, ExternalLink } from "lucide-react"

interface ConfusionHelpProps {
  nearestLandmark?: { name: string; distance: number }
  userLocation?: { latitude: number; longitude: number }
}

export function StateConfusionHelp({ nearestLandmark, userLocation }: ConfusionHelpProps) {
  const { state, context, resumeNavigation, transitionTo } = useNavigationState()
  const { language } = useLanguage()
  const { speak, config } = useVoiceGuidance()
  const router = useRouter()
  const [hasSpoken, setHasSpoken] = useState(false)

  useEffect(() => {
    if (state === "confusion_help" && !hasSpoken && config.enabled) {
      let message =
        language === "yo"
          ? "Kò sí nǹkankan. A yoo ràn ọ́ lọ́wọ́ láti rí ọ̀nà rẹ."
          : language === "pcm"
          ? "No worry. We go help you find your way."
          : "Don't worry. We'll help you find your way."

      if (nearestLandmark) {
        message +=
          language === "yo"
            ? ` O wa nito si ${nearestLandmark.name}.`
            : language === "pcm"
            ? ` You dey near ${nearestLandmark.name}.`
            : ` You are near ${nearestLandmark.name}.`
      }

      speak(message)
      setHasSpoken(true)
    }
  }, [state, hasSpoken, config.enabled, speak, language, nearestLandmark])

  if (state !== "confusion_help") return null

  const handleResume = () => {
    resumeNavigation()
  }

  const handleRestart = () => {
    transitionTo("polling_unit_input")
  }

  const handleGoToDirections = () => {
    const pollingUnitCode = context.pollingUnitCode
    if (pollingUnitCode) {
      router.push(`/direction?code=${pollingUnitCode}`)
    }
  }

  return (
    <Card className="mx-auto max-w-md border-orange-500/20 bg-orange-500/5">
      <CardContent className="p-6">
        <div className="mb-4 flex items-center justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-orange-500/10">
            <MapPin className="h-8 w-8 text-orange-600" />
          </div>
        </div>

        <h2 className="mb-2 text-center text-xl font-bold text-foreground">
          {language === "yo"
            ? "Ìrànlọ́wọ́"
            : language === "pcm"
            ? "Help"
            : "Need Help?"}
        </h2>

        <p className="mb-6 text-center text-sm text-muted-foreground">
          {language === "yo"
            ? "Kò sí nǹkankan. A yoo ràn ọ́ lọ́wọ́ láti rí ọ̀nà rẹ."
            : language === "pcm"
            ? "No worry. We go help you find your way."
            : "Don't worry. We'll help you find your way."}
        </p>

        {nearestLandmark && (
          <div className="mb-4 rounded-lg bg-muted p-4">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">
                  {language === "yo"
                    ? "Àmì Àgbáyé Tó Sún Mọ́:"
                    : language === "pcm"
                    ? "Nearest Landmark:"
                    : "Nearest Landmark:"}
                </p>
                <p className="font-semibold text-foreground">
                  {nearestLandmark.name} ({nearestLandmark.distance}m)
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="mb-4 rounded-lg bg-muted p-4 text-xs text-muted-foreground">
          <p className="mb-2 font-semibold text-foreground">
            {language === "yo"
              ? "Àwọn Ìgbésẹ̀:"
              : language === "pcm"
              ? "Steps:"
              : "Steps:"}
          </p>
          <ol className="list-inside list-decimal space-y-1">
            <li>
              {language === "yo"
                ? "Wo àwọn àmì àgbáyé tó wà nítòsí"
                : language === "pcm"
                ? "Check landmarks wey dey nearby"
                : "Look for nearby landmarks"}
            </li>
            <li>
              {language === "yo"
                ? "Tẹ̀síwájú ní ìgbésẹ̀ kan lẹ́yìn ìgbésẹ̀ kan"
                : language === "pcm"
                ? "Continue step by step"
                : "Follow directions step by step"}
            </li>
            <li>
              {language === "yo"
                ? "Béèrè ìrànlọ́wọ́ nígbà tí o bá nilo"
                : language === "pcm"
                ? "Ask for help when you need am"
                : "Ask for help when needed"}
            </li>
          </ol>
        </div>

        <div className="flex flex-col gap-3">
          <Button onClick={handleResume} className="w-full gap-2">
            <Navigation className="h-4 w-4" />
            {language === "yo"
              ? "Tẹ̀síwájú Ìtọ́sọ́nà"
              : language === "pcm"
              ? "Continue Navigation"
              : "Continue Navigation"}
          </Button>

          {context.pollingUnitCode && (
            <Button 
              onClick={handleGoToDirections} 
              variant="default" 
              className="w-full gap-2 bg-primary"
            >
              <ExternalLink className="h-4 w-4" />
              {language === "yo"
                ? "Wo Maapu"
                : language === "pcm"
                ? "See Map"
                : "View Map & Directions"}
            </Button>
          )}

          <Button onClick={handleRestart} variant="outline" className="w-full gap-2">
            <ArrowLeft className="h-4 w-4" />
            {language === "yo"
              ? "Bẹ̀rẹ̀ Lẹ́ẹ̀kan Sí"
              : language === "pcm"
              ? "Start Again"
              : "Start Over"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
















