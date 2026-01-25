"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useNavigationState } from "@/hooks/use-navigation-state"
import { useVoiceGuidance } from "@/hooks/use-voice-guidance"
import { useLanguage } from "@/hooks/use-language"
import { Globe } from "lucide-react"

export function StateLanguageSelection() {
  const { state, selectLanguage } = useNavigationState()
  const { language, setLanguage } = useLanguage()
  const { speak, config } = useVoiceGuidance()
  const [hasSpoken, setHasSpoken] = useState(false)
  const [timeoutReached, setTimeoutReached] = useState(false)

  useEffect(() => {
    if (state === "language_selection" && !hasSpoken && config.enabled) {
      const message =
        language === "yo"
          ? "Yan èdè tí o fẹ́. A lè sọ̀rọ̀ ní Gẹ̀ẹ́sì, Yorùbá, Pidgin, Hausa, tàbí Igbo."
          : language === "pcm"
          ? "Choose language wey you want. We fit talk English, Yoruba, Pidgin, Hausa, or Igbo."
          : language === "ha"
          ? "Zaɓi harshen da kake so. Za mu iya magana da Turanci, Yoruba, Pidgin, Hausa, ko Igbo."
          : language === "ig"
          ? "Họrọ asụsụ ịchọrọ. Anyị nwere ike ikwu Bekee, Yoruba, Pidgin, Hausa, ma ọ bụ Igbo."
          : "Please choose your preferred language. We can speak English, Yoruba, Pidgin, Hausa, or Igbo."

      speak(message)
      setHasSpoken(true)

      const timeout = setTimeout(() => {
        setTimeoutReached(true)
        // Default to English if no response
        if (state === "language_selection") {
          selectLanguage("en")
        }
      }, 8000)

      return () => clearTimeout(timeout)
    }
  }, [state, hasSpoken, config.enabled, speak, language, selectLanguage])

  if (state !== "language_selection") return null

  const handleLanguageSelect = (lang: "en" | "yo" | "pcm" | "ha" | "ig") => {
    setLanguage(lang)
    selectLanguage(lang)
  }

  return (
    <Card className="mx-auto max-w-md border-primary/20 bg-gradient-to-br from-primary/5 to-background">
      <CardContent className="p-6">
        <div className="mb-4 flex items-center justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Globe className="h-8 w-8 text-primary" />
          </div>
        </div>

        <h2 className="mb-2 text-center text-xl font-bold text-foreground">
          {language === "yo"
            ? "Yan Èdè"
            : language === "pcm"
            ? "Choose Language"
            : language === "ha"
            ? "Zaɓi Harshe"
            : language === "ig"
            ? "Họrọ Asụsụ"
            : "Choose Language"}
        </h2>

        <p className="mb-6 text-center text-sm text-muted-foreground">
          {language === "yo"
            ? "Yan èdè tí o fẹ́ fún ìtọ́sọ́nà"
            : language === "pcm"
            ? "Choose language wey you want for direction"
            : language === "ha"
            ? "Zaɓi harshen da kake so don jagoranci"
            : language === "ig"
            ? "Họrọ asụsụ ịchọrọ maka nduzi"
            : "Select your preferred language for guidance"}
        </p>

        <div className="flex flex-col gap-3">
          <Button
            onClick={() => handleLanguageSelect("en")}
            variant={language === "en" ? "default" : "outline"}
            className="w-full justify-start gap-3"
          >
            <span className="text-lg">🇬🇧</span>
            <div className="flex flex-col items-start">
              <span className="font-semibold">English</span>
              <span className="text-xs text-muted-foreground">English</span>
            </div>
          </Button>

          <Button
            onClick={() => handleLanguageSelect("yo")}
            variant={language === "yo" ? "default" : "outline"}
            className="w-full justify-start gap-3"
          >
            <span className="text-lg">🇳🇬</span>
            <div className="flex flex-col items-start">
              <span className="font-semibold">Yorùbá</span>
              <span className="text-xs text-muted-foreground">Yoruba</span>
            </div>
          </Button>

          <Button
            onClick={() => handleLanguageSelect("pcm")}
            variant={language === "pcm" ? "default" : "outline"}
            className="w-full justify-start gap-3"
          >
            <span className="text-lg">🇳🇬</span>
            <div className="flex flex-col items-start">
              <span className="font-semibold">Naija Pidgin</span>
              <span className="text-xs text-muted-foreground">Nigerian Pidgin</span>
            </div>
          </Button>

          <Button
            onClick={() => handleLanguageSelect("ha")}
            variant={language === "ha" ? "default" : "outline"}
            className="w-full justify-start gap-3"
          >
            <span className="text-lg">🇳🇬</span>
            <div className="flex flex-col items-start">
              <span className="font-semibold">Hausa</span>
              <span className="text-xs text-muted-foreground">Hausa</span>
            </div>
          </Button>

          <Button
            onClick={() => handleLanguageSelect("ig")}
            variant={language === "ig" ? "default" : "outline"}
            className="w-full justify-start gap-3"
          >
            <span className="text-lg">🇳🇬</span>
            <div className="flex flex-col items-start">
              <span className="font-semibold">Igbo</span>
              <span className="text-xs text-muted-foreground">Igbo</span>
            </div>
          </Button>
        </div>

        {timeoutReached && (
          <p className="mt-4 text-center text-xs text-muted-foreground">
            {language === "yo"
              ? "A ti yan Gẹ̀ẹ́sì gẹ́gẹ́ bí èdè àkọ́kọ́."
              : language === "pcm"
              ? "We don choose English as default language."
              : language === "ha"
              ? "An zaɓi Turanci azaman harshen tsoho."
              : language === "ig"
              ? "A họrọla Bekee dị ka asụsụ nke mbụ."
              : "Defaulting to English."}
          </p>
        )}
      </CardContent>
    </Card>
  )
}








