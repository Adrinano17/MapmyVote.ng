"use client"

import type React from "react"

import { Search, Mic, MicOff, Loader2 } from "lucide-react"
import { useState, useCallback, useRef, useEffect } from "react"
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
  const recognitionRef = useRef<any>(null)

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

  // Initialize recognition instance once
  useEffect(() => {
    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
      return
    }

    const SpeechRecognition =
      (window as unknown as { webkitSpeechRecognition: typeof window.SpeechRecognition }).webkitSpeechRecognition ||
      window.SpeechRecognition
    recognitionRef.current = new SpeechRecognition()

    recognitionRef.current.lang = language === "yo" ? "yo-NG" : language === "pcm" ? "en-NG" : "en-NG"
    recognitionRef.current.interimResults = false

    recognitionRef.current.onstart = () => {
      setIsListening(true)
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/a0691e2c-cdd7-47b0-9342-76cf3ac06d2f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'search-box.tsx:54',message:'Voice recognition started',data:{hasRecognition:!!recognitionRef.current,lang:recognitionRef.current.lang},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
      // #endregion
    }
    recognitionRef.current.onend = () => {
      setIsListening(false)
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/a0691e2c-cdd7-47b0-9342-76cf3ac06d2f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'search-box.tsx:64',message:'Voice recognition ended',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
      // #endregion
    }
    recognitionRef.current.onerror = (event: any) => {
      setIsListening(false)
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/a0691e2c-cdd7-47b0-9342-76cf3ac06d2f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'search-box.tsx:70',message:'Voice recognition error',data:{error:event.error,message:event.message},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
      // #endregion
    }

    recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/a0691e2c-cdd7-47b0-9342-76cf3ac06d2f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'search-box.tsx:77',message:'Voice recognition result event',data:{resultCount:event.results.length,resultIndex:event.resultIndex},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
      // #endregion
      if (event.results && event.results.length > 0 && event.results[0] && event.results[0].length > 0) {
        const transcript = event.results[0][0].transcript
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/a0691e2c-cdd7-47b0-9342-76cf3ac06d2f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'search-box.tsx:82',message:'Voice recognition transcript',data:{transcript,confidence:event.results[0][0].confidence},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
        // #endregion
        setQuery(transcript)
      } else {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/a0691e2c-cdd7-47b0-9342-76cf3ac06d2f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'search-box.tsx:88',message:'Voice recognition result empty',data:{resultsLength:event.results?.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
        // #endregion
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
        recognitionRef.current = null
      }
    }
  }, [language])

  const toggleVoiceSearch = useCallback(() => {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/a0691e2c-cdd7-47b0-9342-76cf3ac06d2f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'search-box.tsx:97',message:'Voice search toggle clicked',data:{isListening,hasRecognition:!!recognitionRef.current,hasWebkit:"webkitSpeechRecognition" in window,hasSpeech:"SpeechRecognition" in window},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
    // #endregion
    
    if (!recognitionRef.current) {
      if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
        alert(t.voiceNotSupported)
        return
      }
      // Reinitialize if somehow lost - need to set up event handlers too
      const SpeechRecognition =
        (window as unknown as { webkitSpeechRecognition: typeof window.SpeechRecognition }).webkitSpeechRecognition ||
        window.SpeechRecognition
      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.lang = language === "yo" ? "yo-NG" : language === "pcm" ? "en-NG" : "en-NG"
      recognitionRef.current.interimResults = false
      
      // Set up event handlers
      recognitionRef.current.onstart = () => {
        setIsListening(true)
        fetch('http://127.0.0.1:7242/ingest/a0691e2c-cdd7-47b0-9342-76cf3ac06d2f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'search-box.tsx:110',message:'Voice recognition started (reinit)',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
      }
      recognitionRef.current.onend = () => {
        setIsListening(false)
        fetch('http://127.0.0.1:7242/ingest/a0691e2c-cdd7-47b0-9342-76cf3ac06d2f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'search-box.tsx:114',message:'Voice recognition ended (reinit)',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
      }
      recognitionRef.current.onerror = (event: any) => {
        setIsListening(false)
        fetch('http://127.0.0.1:7242/ingest/a0691e2c-cdd7-47b0-9342-76cf3ac06d2f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'search-box.tsx:118',message:'Voice recognition error (reinit)',data:{error:event.error},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
      }
      recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
        if (event.results && event.results.length > 0 && event.results[0] && event.results[0].length > 0) {
          const transcript = event.results[0][0].transcript
          fetch('http://127.0.0.1:7242/ingest/a0691e2c-cdd7-47b0-9342-76cf3ac06d2f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'search-box.tsx:123',message:'Voice recognition transcript (reinit)',data:{transcript},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
          setQuery(transcript)
        }
      }
    }

    if (isListening) {
      recognitionRef.current.stop()
    } else {
      try {
        recognitionRef.current.start()
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/a0691e2c-cdd7-47b0-9342-76cf3ac06d2f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'search-box.tsx:133',message:'Voice recognition start called',data:{hasRecognition:!!recognitionRef.current},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
        // #endregion
      } catch (error) {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/a0691e2c-cdd7-47b0-9342-76cf3ac06d2f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'search-box.tsx:137',message:'Voice recognition start error',data:{error:String(error)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
        // #endregion
      }
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
