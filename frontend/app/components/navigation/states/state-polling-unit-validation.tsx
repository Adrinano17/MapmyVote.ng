"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useNavigationState } from "@/hooks/use-navigation-state"
import { useVoiceGuidance } from "@/hooks/use-voice-guidance"
import { useLanguage } from "@/hooks/use-language"
import { validatePollingUnitExists } from "@/lib/polling-unit-validator"
import { CheckCircle, XCircle, Loader2, AlertCircle } from "lucide-react"

export function StatePollingUnitValidation() {
  const { state, context, validatePollingUnit, transitionTo } = useNavigationState()
  const { language } = useLanguage()
  const { speak, config } = useVoiceGuidance()
  const [status, setStatus] = useState<"validating" | "valid" | "invalid">("validating")
  const [pollingUnitData, setPollingUnitData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [hasSpoken, setHasSpoken] = useState(false)

  useEffect(() => {
    if (state === "polling_unit_validation" && context.pollingUnitCode) {
      validateCode()
    }
  }, [state, context.pollingUnitCode])

  useEffect(() => {
    if (status === "valid" && !hasSpoken && config.enabled && pollingUnitData) {
      const message =
        language === "yo"
          ? `Ibi ìdìbò rẹ ni ${pollingUnitData.name}. Ó wà ní wọ́dù ${pollingUnitData.ward?.name || "Unknown"}.`
          : language === "pcm"
          ? `Your polling unit na ${pollingUnitData.name}. E dey for ${pollingUnitData.ward?.name || "Unknown"} ward.`
          : `Your polling unit is ${pollingUnitData.name}. It is located in ${pollingUnitData.ward?.name || "Unknown"} ward.`

      speak(message)
      setHasSpoken(true)
    }
  }, [status, hasSpoken, config.enabled, pollingUnitData, speak, language])

  const validateCode = async () => {
    if (!context.pollingUnitCode) {
      setStatus("invalid")
      setError("No code provided")
      return
    }

    setStatus("validating")
    setError(null)

    // Extract ward code and polling unit code from the format "08-001"
    const parts = context.pollingUnitCode.split("-")
    if (parts.length !== 2) {
      setStatus("invalid")
      setError("Invalid code format")
      validatePollingUnit(false)
      return
    }

    const result = await validatePollingUnitExists(parts[0], parts[1])

    if (result.exists && result.data) {
      setStatus("valid")
      setPollingUnitData(result.data)
      validatePollingUnit(true)
    } else {
      setStatus("invalid")
      setError(
        result.error ||
          (language === "yo"
            ? "Ibi ìdìbò kò sí. Jọ̀wọ́ ṣe àyẹwo koodu rẹ."
            : language === "pcm"
            ? "Polling unit no dey. Abeg check your code."
            : "Polling unit not found. Please check your code.")
      )
      validatePollingUnit(false)
    }
  }

  if (state !== "polling_unit_validation") return null

  const handleRetry = () => {
    transitionTo("polling_unit_input")
  }

  if (status === "validating") {
    return (
      <Card className="mx-auto max-w-md border-primary/20 bg-gradient-to-br from-primary/5 to-background">
        <CardContent className="p-6">
          <div className="mb-4 flex items-center justify-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </div>
          <p className="text-center text-sm text-muted-foreground">
            {language === "yo"
              ? "Ń ṣe àyẹwo koodu rẹ..."
              : language === "pcm"
              ? "Dey check your code..."
              : "Validating your code..."}
          </p>
        </CardContent>
      </Card>
    )
  }

  if (status === "valid" && pollingUnitData) {
    return (
      <Card className="mx-auto max-w-md border-green-500/20 bg-green-500/5">
        <CardContent className="p-6">
          <div className="mb-4 flex items-center justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </div>

          <h2 className="mb-2 text-center text-xl font-bold text-foreground">
            {language === "yo"
              ? "Koodu Ti Jẹ́ Tọ́!"
              : language === "pcm"
              ? "Code Correct!"
              : "Code Valid!"}
          </h2>

          <div className="mb-4 space-y-2 rounded-lg bg-muted p-4">
            <div>
              <p className="text-xs text-muted-foreground">
                {language === "yo" ? "Ibi Ìdìbò:" : language === "pcm" ? "Polling Unit:" : "Polling Unit:"}
              </p>
              <p className="font-semibold text-foreground">{pollingUnitData.name}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">
                {language === "yo" ? "Koodu:" : language === "pcm" ? "Code:" : "Code:"}
              </p>
              <p className="font-semibold text-foreground">{pollingUnitData.code}</p>
            </div>
            {pollingUnitData.ward && (
              <div>
                <p className="text-xs text-muted-foreground">
                  {language === "yo" ? "Wọ́dù:" : language === "pcm" ? "Ward:" : "Ward:"}
                </p>
                <p className="font-semibold text-foreground">{pollingUnitData.ward.name}</p>
              </div>
            )}
            <div>
              <p className="text-xs text-muted-foreground">
                {language === "yo" ? "Agbègbè Ìjọba Ìbílẹ̀:" : language === "pcm" ? "Local Government:" : "Local Government:"}
              </p>
              <p className="font-semibold text-foreground">
                {language === "yo" ? "Ibadan North LGA" : language === "pcm" ? "Ibadan North LGA" : "Ibadan North LGA"}
              </p>
            </div>
            {pollingUnitData.address && (
              <div>
                <p className="text-xs text-muted-foreground">
                  {language === "yo" ? "Àdírẹ́sì:" : language === "pcm" ? "Address:" : "Address:"}
                </p>
                <p className="text-sm text-foreground">{pollingUnitData.address}</p>
              </div>
            )}
          </div>

          <Button
            onClick={() => transitionTo("navigation")}
            className="w-full"
            disabled={!pollingUnitData.latitude || !pollingUnitData.longitude}
          >
            {language === "yo"
              ? "Bẹ̀rẹ̀ Ìtọ́sọ́nà"
              : language === "pcm"
              ? "Start Navigation"
              : "Start Navigation"}
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="mx-auto max-w-md border-destructive/20 bg-destructive/5">
      <CardContent className="p-6">
        <div className="mb-4 flex items-center justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
            <XCircle className="h-8 w-8 text-destructive" />
          </div>
        </div>

        <h2 className="mb-2 text-center text-xl font-bold text-foreground">
          {language === "yo"
            ? "Koodu Kò Tọ́"
            : language === "pcm"
            ? "Code No Correct"
            : "Invalid Code"}
        </h2>

        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
            <AlertCircle className="h-4 w-4" />
            <span>{error}</span>
          </div>
        )}

        <div className="mb-4 rounded-lg bg-muted p-3 text-xs text-muted-foreground">
          <p className="mb-2 font-semibold">
            {language === "yo"
              ? "Àwọn ìpìlẹ̀:"
              : language === "pcm"
              ? "Tips:"
              : "Tips:"}
          </p>
          <ul className="list-inside list-disc space-y-1">
            <li>
              {language === "yo"
                ? "Jọ̀wọ́ ṣe àyẹwo koodu rẹ"
                : language === "pcm"
                ? "Abeg check your code well"
                : "Please double-check your code"}
            </li>
            <li>
              {language === "yo"
                ? "Lo fọ́mátì: Ward-PollingUnit (àpẹrẹ: 08-001)"
                : language === "pcm"
                ? "Use format: Ward-PollingUnit (example: 08-001)"
                : "Use format: Ward-PollingUnit (example: 08-001)"}
            </li>
            <li>
              {language === "yo"
                ? "O nilo awọn nọ́mbà mẹ́jọ tókàn"
                : language === "pcm"
                ? "You need the last five numbers"
                : "You only need the last five digits"}
            </li>
          </ul>
        </div>

        <Button onClick={handleRetry} variant="outline" className="w-full">
          {language === "yo"
            ? "Gbiyànjú Lẹ́ẹ̀kan Sí"
            : language === "pcm"
            ? "Try Again"
            : "Try Again"}
        </Button>
      </CardContent>
    </Card>
  )
}








