"use client"

import { useState, useCallback } from "react"
import { Volume2, VolumeX } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/hooks/use-language"
import { translations, type PollingUnit, type Ward } from "@/lib/types"

interface VoiceAnnouncementProps {
  pollingUnit: PollingUnit & { ward?: Ward | null }
}

export function VoiceAnnouncement({ pollingUnit }: VoiceAnnouncementProps) {
  const [isSpeaking, setIsSpeaking] = useState(false)
  const { language } = useLanguage()
  const t = translations[language]

  const getAnnouncement = useCallback(() => {
    const wardName = pollingUnit.ward?.name || "Unknown Ward"

    switch (language) {
      case "yo":
        return `Orúkọ ibi ìdìbò rẹ ni ${pollingUnit.name}. Koodu rẹ̀ ni ${pollingUnit.code}. Ó wà ní wọ́dù ${wardName}. Àwọn ènìyàn tí wọ́n forúkọ sílẹ̀ jẹ́ ${pollingUnit.registered_voters || 0}. Àdírẹ́sì rẹ̀ ni ${pollingUnit.address || "Ibadan North"}. ${t.directions}`
      case "pcm":
        return `Your polling unit name na ${pollingUnit.name}. The code na ${pollingUnit.code}. E dey for ${wardName} ward. ${pollingUnit.registered_voters || 0} people don register for there. The address na ${pollingUnit.address || "Ibadan North"}. ${t.directions}`
      default:
        return `Your polling unit is ${pollingUnit.name}. The code is ${pollingUnit.code}. It is located in ${wardName} ward. There are ${pollingUnit.registered_voters || 0} registered voters. The address is ${pollingUnit.address || "Ibadan North"}. ${t.directions}`
    }
  }, [pollingUnit, language, t.directions])

  const speak = useCallback(() => {
    if (!("speechSynthesis" in window)) {
      alert(t.voiceNotSupported)
      return
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel()
      setIsSpeaking(false)
      return
    }

    const text = getAnnouncement()
    const utterance = new SpeechSynthesisUtterance(text)
    
    // Enhanced language configuration
    if (language === "yo") {
      utterance.lang = "yo-NG"
    } else if (language === "pcm") {
      utterance.lang = "en-NG"
      // Try to get Nigerian English voice
      const voices = window.speechSynthesis.getVoices()
      const nigerianVoice = voices.find(voice => 
        voice.lang.startsWith("en") && (
          voice.name.toLowerCase().includes("nigeria") ||
          voice.name.toLowerCase().includes("africa")
        )
      )
      if (nigerianVoice) utterance.voice = nigerianVoice
    } else {
      utterance.lang = "en-US"
    }
    
    utterance.rate = 0.95
    utterance.pitch = 1.0
    utterance.volume = 1.0

    utterance.onstart = () => setIsSpeaking(true)
    utterance.onend = () => setIsSpeaking(false)
    utterance.onerror = (error) => {
      console.error("Speech synthesis error:", error)
      setIsSpeaking(false)
    }

    window.speechSynthesis.speak(utterance)
  }, [isSpeaking, getAnnouncement, language, t.voiceNotSupported])

  const listenText = language === "yo" ? "Gbọ́" : language === "pcm" ? "Listen" : "Listen"
  const stopText = language === "yo" ? "Dúró" : language === "pcm" ? "Stop" : "Stop"

  return (
    <Button variant="outline" className="gap-2 bg-transparent" onClick={speak}>
      {isSpeaking ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
      {isSpeaking ? stopText : listenText}
    </Button>
  )
}
