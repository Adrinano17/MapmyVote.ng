"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useNavigationState } from "@/hooks/use-navigation-state"
import { useVoiceGuidance } from "@/hooks/use-voice-guidance"
import { useLanguage } from "@/hooks/use-language"
import { CheckCircle, MapPin, Users, Calendar } from "lucide-react"
import Link from "next/link"

interface StateArrivalProps {
  simpleMode?: boolean
}

export function StateArrival({ simpleMode = false }: StateArrivalProps) {
  const { state, context, reset } = useNavigationState()
  const { language } = useLanguage()
  const { speak, config } = useVoiceGuidance()
  const [hasSpoken, setHasSpoken] = useState(false)

  useEffect(() => {
    if (state === "arrival" && !hasSpoken && config.enabled) {
      const message =
        language === "yo"
          ? "O ti dé ibi ìdìbò rẹ! O ṣeun fún lílo ẹ̀tọ́ rẹ láti dìbò. Rii dájú pé káàdì oníbò rẹ wà ní ọwọ́."
          : language === "pcm"
          ? "You don reach your polling unit! Thank you say you come vote. Make sure say your voter card dey ready."
          : "You've arrived at your polling unit! Thank you for exercising your right to vote. Make sure to have your voter's card ready."

      speak(message)
      setHasSpoken(true)
    }
  }, [state, hasSpoken, config.enabled, speak, language])

  if (state !== "arrival") return null

  return (
    <Card className="mx-auto max-w-md border-green-500/20 bg-green-500/5">
      <CardContent className={simpleMode ? "p-8" : "p-6"}>
        {!simpleMode && (
          <div className="mb-4 flex items-center justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </div>
        )}

        <h2 className={`mb-2 text-center font-bold text-foreground ${simpleMode ? "text-3xl" : "text-xl"}`}>
          {language === "yo"
            ? "O Ti Dé!"
            : language === "pcm"
            ? "You Don Reach!"
            : "You've Arrived!"}
        </h2>

        <p className={`mb-6 text-center text-muted-foreground ${simpleMode ? "text-lg" : "text-sm"}`}>
          {language === "yo"
            ? "O ti dé ibi ìdìbò rẹ. O ṣeun fún lílo ẹ̀tọ́ rẹ láti dìbò."
            : language === "pcm"
            ? "You don reach your polling unit. Thank you say you come vote."
            : "You've arrived at your polling unit. Thank you for exercising your right to vote."}
        </p>

        <div className={`mb-6 space-y-3 rounded-lg bg-muted ${simpleMode ? "p-6" : "p-4"}`}>
          <div className="flex items-center gap-3">
            {!simpleMode && (
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                <MapPin className="h-5 w-5" />
              </div>
            )}
            <div>
              <p className={simpleMode ? "text-lg text-muted-foreground" : "text-xs text-muted-foreground"}>
                {language === "yo" ? "Ibi Ìdìbò:" : language === "pcm" ? "Polling Unit:" : "Polling Unit:"}
              </p>
              <p className={simpleMode ? "text-2xl font-bold text-foreground" : "font-semibold text-foreground"}>{context.pollingUnitCode}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {!simpleMode && (
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Users className="h-5 w-5" />
              </div>
            )}
            <div>
              <p className={simpleMode ? "text-lg text-muted-foreground" : "text-xs text-muted-foreground"}>
                {language === "yo"
                  ? "Káàdì Oníbò:"
                  : language === "pcm"
                  ? "Voter Card:"
                  : "Voter Card:"}
              </p>
              <p className={simpleMode ? "text-2xl font-bold text-foreground" : "font-semibold text-foreground"}>
                {language === "yo"
                  ? "Jọ̀wọ́ mú wá"
                  : language === "pcm"
                  ? "Abeg bring am"
                  : "Please bring it"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {!simpleMode && (
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Calendar className="h-5 w-5" />
              </div>
            )}
            <div>
              <p className={simpleMode ? "text-lg text-muted-foreground" : "text-xs text-muted-foreground"}>
                {language === "yo"
                  ? "Àkókò Ìdìbò:"
                  : language === "pcm"
                  ? "Voting Time:"
                  : "Voting Hours:"}
              </p>
              <p className={simpleMode ? "text-2xl font-bold text-foreground" : "font-semibold text-foreground"}>8:30 AM - 2:30 PM</p>
            </div>
          </div>
        </div>

        {!simpleMode && (
          <div className={`mb-4 rounded-lg border border-primary/20 bg-primary/5 ${simpleMode ? "p-4" : "p-3"} ${simpleMode ? "text-base" : "text-xs"} text-foreground`}>
            <p className={`mb-2 font-semibold ${simpleMode ? "text-lg" : ""}`}>
              {language === "yo"
                ? "Kí Ní O Nílò:"
                : language === "pcm"
                ? "Wetin You Need:"
                : "What You Need:"}
            </p>
            <ul className={`list-inside list-disc space-y-1 text-muted-foreground ${simpleMode ? "text-base" : ""}`}>
            <li>
              {language === "yo"
                ? "Káàdì Oníbò (PVC)"
                : language === "pcm"
                ? "Voter Card (PVC)"
                : "Permanent Voter Card (PVC)"}
            </li>
            <li>
              {language === "yo"
                ? "Ìdánimọ̀ tó péye"
                : language === "pcm"
                ? "Correct identification"
                : "Valid identification"}
            </li>
          </ul>
        </div>
        )}

        <div className={`flex flex-col ${simpleMode ? "gap-4" : "gap-3"}`}>
          <Link href="/" className="w-full">
            <Button onClick={reset} className={`w-full ${simpleMode ? "h-14 text-lg" : ""}`}>
              {language === "yo"
                ? "Padà Sí Ìbẹ̀rẹ̀"
                : language === "pcm"
                ? "Go Back to Start"
                : "Back to Home"}
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}








