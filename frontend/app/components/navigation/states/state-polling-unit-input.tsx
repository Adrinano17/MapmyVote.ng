"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useNavigationState } from "@/hooks/use-navigation-state"
import { useVoiceGuidance } from "@/hooks/use-voice-guidance"
import { useLanguage } from "@/hooks/use-language"
import { validatePollingUnitCode } from "@/lib/polling-unit-validator"
import { Hash, AlertCircle, Mic } from "lucide-react"

interface StatePollingUnitInputProps {
  simpleMode?: boolean
}

export function StatePollingUnitInput({ simpleMode = false }: StatePollingUnitInputProps) {
  const { state, submitPollingUnitCode } = useNavigationState()
  const { language } = useLanguage()
  const { speak, config, startListening, stopListening, isListening, checkForDisableCommand } =
    useVoiceGuidance()
  const [input, setInput] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [hasSpoken, setHasSpoken] = useState(false)

  useEffect(() => {
    if (state === "polling_unit_input" && !hasSpoken && config.enabled) {
      const message =
        language === "yo"
          ? "Tẹ koodu ibi ìdìbò rẹ. O lè tẹ awọn nọ́mbà mẹ́jọ tàbí mẹ́rindínlógún. Àpẹrẹ: 08-001 tàbí 30020801."
          : language === "pcm"
          ? "Type your polling unit code. You fit type five or eight numbers. Example: 08-001 or 30020801."
          : language === "ha"
          ? "Shigar da lambar wurin zabe naka. Kana iya shigar da lambobi biyar ko takwas. Misali: 08-001 ko 30020801."
          : language === "ig"
          ? "Tinye koodu ebe ịtụ vootu gị. Ị nwere ike itinye nọmba ise ma ọ bụ asatọ. Ihe Nlereanya: 08-001 ma ọ bụ 30020801."
          : "Enter your polling unit code. You can enter 5 or 8 digits. Example: 08-001 or 30020801."

      speak(message)
      setHasSpoken(true)
    }
  }, [state, hasSpoken, config.enabled, speak, language])

  if (state !== "polling_unit_input") return null

  const handleVoiceInput = () => {
    if (isListening) {
      stopListening()
    } else {
      const recognition = startListening()
      if (recognition) {
        recognition.onresult = (event: any) => {
          let finalTranscript = ""
          for (let i = event.resultIndex; i < event.results.length; i++) {
            if (event.results[i].isFinal) {
              finalTranscript += event.results[i][0].transcript
            }
          }

          if (finalTranscript) {
            const cleaned = finalTranscript.trim().replace(/\s+/g, "")
            setInput(cleaned)
            checkForDisableCommand(finalTranscript)
          }
        }
      }
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!input.trim()) {
      setError(
        language === "yo"
          ? "Koodu ibi ìdìbò jẹ́ dandan"
          : language === "pcm"
          ? "Polling unit code dey important"
          : "Polling unit code is required"
      )
      return
    }

    const validation = validatePollingUnitCode(input)
    if (!validation.isValid) {
      setError(validation.error || "Invalid code format")
      return
    }

    if (validation.fullCode) {
      submitPollingUnitCode(validation.fullCode)
    }
  }

  return (
    <Card className="mx-auto max-w-md border-primary/20 bg-gradient-to-br from-primary/5 to-background">
      <CardHeader className={simpleMode ? "p-8" : ""}>
        {!simpleMode && (
          <div className="mb-4 flex items-center justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Hash className="h-8 w-8 text-primary" />
            </div>
          </div>
        )}
        <CardTitle className={`text-center ${simpleMode ? "text-3xl" : "text-xl"}`}>
          {language === "yo"
            ? "Tẹ Koodu Ibi Ìdìbò"
            : language === "pcm"
            ? "Enter Polling Unit Code"
            : "Enter Polling Unit Code"}
        </CardTitle>
      </CardHeader>
      <CardContent className={simpleMode ? "p-8" : ""}>
        <p className={`mb-4 text-center text-muted-foreground ${simpleMode ? "text-lg" : "text-sm"}`}>
          {language === "yo"
            ? "Tẹ koodu ibi ìdìbò rẹ (awọn nọ́mbà mẹ́rindínlógún tàbí mẹ́jọ)"
            : language === "pcm"
            ? "Type your polling unit code (eight or five numbers)"
            : language === "ha"
            ? "Shigar da lambar wurin zabe naka (lambobi takwas ko biyar)"
            : language === "ig"
            ? "Tinye koodu ebe ịtụ vootu gị (nọmba asatọ ma ọ bụ ise)"
            : "Enter your polling unit code (8 or 5 digits)"}
        </p>

        {!simpleMode && (
          <div className={`mb-4 rounded-lg bg-muted ${simpleMode ? "p-4" : "p-3"} ${simpleMode ? "text-base" : "text-xs"}`}>
            <p className={`mb-2 font-semibold ${simpleMode ? "text-lg" : ""}`}>
              {language === "yo"
                ? "Àpẹrẹ:"
                : language === "pcm"
                ? "Example:"
                : language === "ha"
                ? "Misali:"
                : language === "ig"
                ? "Ihe Nlereanya:"
                : "Example:"}
            </p>
            <p className={`text-muted-foreground ${simpleMode ? "text-base" : ""}`}>
            {language === "yo"
              ? "Ti koodu rẹ bá jẹ́ 30-02-08-001, tẹ 08-001 tàbí 30020801"
              : language === "pcm"
              ? "If your code na 30-02-08-001, type 08-001 or 30020801"
              : language === "ha"
              ? "Idan lambar ku ta kasance 30-02-08-001, shigar da 08-001 ko 30020801"
              : language === "ig"
              ? "Ọ bụrụ na koodu gị bụ 30-02-08-001, tinye 08-001 ma ọ bụ 30020801"
              : "If your code is 30-02-08-001, enter 08-001 or 30020801"}
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className={`space-y-4 ${simpleMode ? "space-y-6" : ""}`}>
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => {
                setInput(e.target.value)
                setError(null)
              }}
              placeholder={language === "yo" ? "08-001 ma ọ bụ 30020801" : "08-001 or 30020801"}
              className={`flex-1 ${simpleMode ? "h-14 text-lg" : ""}`}
              maxLength={15}
            />
            {!simpleMode && (
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleVoiceInput}
                className={isListening ? "bg-destructive text-destructive-foreground" : ""}
              >
                <Mic className="h-4 w-4" />
              </Button>
            )}
          </div>

          {error && (
            <div className={`flex items-center gap-2 rounded-lg border border-destructive/50 bg-destructive/10 ${simpleMode ? "p-4" : "p-3"} ${simpleMode ? "text-lg" : "text-sm"} text-destructive`}>
              {!simpleMode && <AlertCircle className="h-4 w-4" />}
              <span className={simpleMode ? "text-xl font-semibold" : ""}>{error}</span>
            </div>
          )}

          <Button type="submit" className={`w-full ${simpleMode ? "h-14 text-lg" : ""}`} disabled={!input.trim()}>
            {language === "yo"
              ? "Tẹ̀síwájú"
              : language === "pcm"
              ? "Continue"
              : "Continue"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}








