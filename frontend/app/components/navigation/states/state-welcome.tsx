"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useNavigationState } from "@/hooks/use-navigation-state"
import { useVoiceGuidance } from "@/hooks/use-voice-guidance"
import { useLanguage } from "@/hooks/use-language"
import { translations } from "@/lib/types"
import { MapPin, Navigation } from "lucide-react"

export function StateWelcome() {
  const { state, context, transitionTo } = useNavigationState()
  const { speak, config } = useVoiceGuidance()
  const { language } = useLanguage()
  const t = translations[language]
  const [hasSpoken, setHasSpoken] = useState(false)
  const [timeoutReached, setTimeoutReached] = useState(false)

  // Auto-speak welcome message
  useEffect(() => {
    if (state === "welcome" && !hasSpoken && config.enabled) {
      const welcomeMessage = language === "yo"
        ? "Ẹ kú àbọ̀ sí MapMyVote.ng. A yoo ràn ọ́ lọ́wọ́ láti wá ibi ìdìbò rẹ. Jọ̀wọ́ gba àyè láti wá ibi tí o wà."
        : language === "pcm"
        ? "Welcome to MapMyVote.ng. We go help you find your polling unit. Abeg allow us to know where you dey."
        : "Welcome to MapMyVote.ng. We'll help you find your polling unit easily. Please allow us to access your location."

      speak(welcomeMessage)
      setHasSpoken(true)

      // Set timeout for 8 seconds
      const timeout = setTimeout(() => {
        setTimeoutReached(true)
      }, 8000)

      return () => clearTimeout(timeout)
    }
  }, [state, hasSpoken, config.enabled, speak, language])

  if (state !== "welcome") return null

  const handleAllowLocation = () => {
    // Transition to language selection first
    transitionTo("language_selection")
  }

  const handleDenyLocation = () => {
    // User can still continue, just transition to language selection
    transitionTo("language_selection")
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
            ? "Ẹ Kú Àbọ̀"
            : language === "pcm"
            ? "Welcome"
            : "Welcome"}
        </h2>

        <p className="mb-6 text-center text-sm text-muted-foreground">
          {language === "yo"
            ? "Ẹ kú àbọ̀ sí MapMyVote.ng. A yoo ràn ọ́ lọ́wọ́ láti wá ibi ìdìbò rẹ lọ́nà rọrùn."
            : language === "pcm"
            ? "Welcome to MapMyVote.ng. We go help you find your polling unit easy easy."
            : "Welcome to MapMyVote.ng. We'll help you find your polling unit easily."}
        </p>

        <p className="mb-6 text-center text-xs text-muted-foreground">
          {language === "yo"
            ? "Fún ìtọ́sọ́nà tó péye, a nilo láti mọ ibi tí o wà."
            : language === "pcm"
            ? "For correct direction, we need to know where you dey."
            : "For accurate directions, we need to know your current location."}
        </p>

        <div className="flex flex-col gap-3">
          <Button onClick={handleAllowLocation} className="w-full gap-2">
            <Navigation className="h-4 w-4" />
            {language === "yo"
              ? "Gba Àyè Láti Wá Ibi Mi"
              : language === "pcm"
              ? "Allow to Find My Location"
              : "Allow Location Access"}
          </Button>

          <Button onClick={handleDenyLocation} variant="outline" className="w-full">
            {language === "yo"
              ? "Kò Sí"
              : language === "pcm"
              ? "No"
              : "Not Now"}
          </Button>
        </div>

        {timeoutReached && !config.enabled && (
          <p className="mt-4 text-center text-xs text-muted-foreground">
            {language === "yo"
              ? "O lè tẹ̀síwájú pẹ̀lú ìtọ́sọ́nà tẹ́ẹ̀sì."
              : language === "pcm"
              ? "You fit continue with text direction."
              : "You can continue with text directions."}
          </p>
        )}
      </CardContent>
    </Card>
  )
}








