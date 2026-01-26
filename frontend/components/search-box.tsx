"use client"

import type React from "react"

import { Search, Mic, MicOff, Loader2 } from "lucide-react"
import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/hooks/use-language"
import { translations } from "@/lib/types"

// Define SpeechRecognitionEvent type locally (Web Speech API)
interface SpeechRecognitionEvent {
  results: SpeechRecognitionResultList
  resultIndex: number
}

interface SearchBoxProps {
  initialQuery?: string
  size?: "default" | "large"
}

export function SearchBox({ initialQuery = "", size = "default" }: SearchBoxProps) {
  const [query, setQuery] = useState(initialQuery)
  const [isListening, setIsListening] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { language } = useLanguage()
  const t = translations[language]

  const handleSearch = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      if (query.trim()) {
        setIsLoading(true)
        router.push(`/search?q=${encodeURIComponent(query.trim())}`)
      }
    },
    [query, router],
  )

  const toggleVoiceSearch = useCallback(() => {
    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
      alert(t.voiceNotSupported)
      return
    }

    const SpeechRecognition =
      (window as any).webkitSpeechRecognition ||
      (window as any).SpeechRecognition
    const recognition = new SpeechRecognition()

    recognition.lang = language === "yo" ? "yo-NG" : language === "pcm" ? "en-NG" : "en-NG"
    recognition.interimResults = false

    recognition.onstart = () => setIsListening(true)
    recognition.onend = () => setIsListening(false)
    recognition.onerror = () => setIsListening(false)

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[0][0].transcript
      setQuery(transcript)
    }

    if (isListening) {
      recognition.stop()
    } else {
      recognition.start()
    }
  }, [isListening, language, t.voiceNotSupported])

  const isLarge = size === "large"

  return (
    <form onSubmit={handleSearch} className="w-full">
      <div className={`relative flex items-center gap-2 ${isLarge ? "max-w-2xl mx-auto" : ""}`}>
        <div className="relative flex-1">
          <Search
            className={`absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground ${isLarge ? "h-5 w-5" : "h-4 w-4"}`}
          />
          <Input
            type="text"
            placeholder={t.searchPrompt}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className={`${isLarge ? "h-14 pl-12 pr-4 text-lg" : "h-10 pl-10 pr-4"} rounded-full border-2 focus-visible:ring-2 focus-visible:ring-primary`}
          />
        </div>
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={toggleVoiceSearch}
          className={`${isLarge ? "h-14 w-14" : "h-10 w-10"} rounded-full shrink-0 ${isListening ? "bg-destructive text-destructive-foreground" : ""}`}
          aria-label={isListening ? t.stopListening : t.startListening}
        >
          {isListening ? (
            <MicOff className={isLarge ? "h-5 w-5" : "h-4 w-4"} />
          ) : (
            <Mic className={isLarge ? "h-5 w-5" : "h-4 w-4"} />
          )}
        </Button>
        <Button
          type="submit"
          disabled={isLoading || !query.trim()}
          className={`${isLarge ? "h-14 px-8 text-lg" : "h-10 px-6"} rounded-full shrink-0`}
        >
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : t.searchButton}
        </Button>
      </div>
    </form>
  )
}
