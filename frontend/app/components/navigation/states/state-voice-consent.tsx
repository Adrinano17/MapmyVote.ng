"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useNavigationState } from "@/hooks/use-navigation-state"
import { useVoiceGuidance } from "@/hooks/use-voice-guidance"
import { useLanguage } from "@/hooks/use-language"
import { Volume2, VolumeX, Mic } from "lucide-react"

export function StateVoiceConsent() {
  const { state, setVoicePreference } = useNavigationState()
  const { language } = useLanguage()
  const { speak, config, enable, disable } = useVoiceGuidance()
  const [hasSpoken, setHasSpoken] = useState(false)
  const [timeoutReached, setTimeoutReached] = useState(false)

  useEffect(() => {
    if (state === "voice_consent" && !hasSpoken && config.enabled) {
      const message =
        language === "yo"
          ? "Ṣé o fẹ́ gbọ́ ìtọ́sọ́nà pẹ̀lú ohùn? Tẹ 'Bẹ́ẹ̀ni' tàbí 'Rárá'."
          : language === "pcm"
          ? "You want hear direction with voice? Tap 'Yes' or 'No'."
          : "Would you like voice guidance? Tap 'Yes' or 'No'."

      speak(message)
      setHasSpoken(true)

      const timeout = setTimeout(() => {
        setTimeoutReached(true)
        // Default to text-only if no response
        if (state === "voice_consent") {
          disable()
          setVoicePreference(false)
        }
      }, 8000)

      return () => clearTimeout(timeout)
    }
  }, [state, hasSpoken, config.enabled, speak, language, disable, setVoicePreference])

  if (state !== "voice_consent") return null

  const handleYes = () => {
    enable()
    setVoicePreference(true)
  }

  const handleNo = () => {
    disable()
    setVoicePreference(false)
  }

  return (
    <Card className="mx-auto max-w-md border-primary/20 bg-gradient-to-br from-primary/5 to-background">
      <CardContent className="p-6">
        <div className="mb-4 flex items-center justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Mic className="h-8 w-8 text-primary" />
          </div>
        </div>

        <h2 className="mb-2 text-center text-xl font-bold text-foreground">
          {language === "yo"
            ? "Ìtọ́sọ́nà Pẹ̀lú Ohùn"
            : language === "pcm"
            ? "Voice Direction"
            : "Voice Guidance"}
        </h2>

        <p className="mb-6 text-center text-sm text-muted-foreground">
          {language === "yo"
            ? "Ṣé o fẹ́ gbọ́ ìtọ́sọ́nà pẹ̀lú ohùn tàbí kí a sọ fún ọ ní tẹ́ẹ̀sì nìkan?"
            : language === "pcm"
            ? "You want hear direction with voice or we tell you with text only?"
            : "Would you like voice guidance or text-only directions?"}
        </p>

        <div className="mb-6 flex flex-col gap-3">
          <Button onClick={handleYes} className="w-full gap-2">
            <Volume2 className="h-4 w-4" />
            {language === "yo"
              ? "Bẹ́ẹ̀ni, Fẹ́ Ohùn"
              : language === "pcm"
              ? "Yes, I Want Voice"
              : "Yes, I Want Voice"}
          </Button>

          <Button onClick={handleNo} variant="outline" className="w-full gap-2">
            <VolumeX className="h-4 w-4" />
            {language === "yo"
              ? "Rárá, Tẹ́ẹ̀sì Nìkan"
              : language === "pcm"
              ? "No, Text Only"
              : "No, Text Only"}
          </Button>
        </div>

        <div className="rounded-lg bg-muted p-4 text-xs text-muted-foreground">
          <p>
            {language === "yo"
              ? "O lè yípadà èyí nígbàkankan nínú àwọn ètò."
              : language === "pcm"
              ? "You fit change this anytime for settings."
              : "You can change this anytime in settings."}
          </p>
        </div>

        {timeoutReached && (
          <p className="mt-4 text-center text-xs text-muted-foreground">
            {language === "yo"
              ? "A ti yan tẹ́ẹ̀sì nìkan gẹ́gẹ́ bí àkọ́kọ́."
              : language === "pcm"
              ? "We don choose text only as default."
              : "Defaulting to text-only mode."}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
















