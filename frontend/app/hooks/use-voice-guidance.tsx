"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { speakWithOpenAI } from "@/lib/huggingface-voice"

export interface VoiceGuidanceConfig {
  enabled: boolean
  language: "en" | "yo" | "pcm"
  timeout: number // milliseconds before auto-disabling
  autoDisableOnSilence: boolean
}

const DEFAULT_TIMEOUT = 8000 // 8 seconds

export function useVoiceGuidance(initialConfig?: Partial<VoiceGuidanceConfig>) {
  const [config, setConfig] = useState<VoiceGuidanceConfig>({
    enabled: initialConfig?.enabled ?? false,
    language: initialConfig?.language ?? "en",
    timeout: initialConfig?.timeout ?? DEFAULT_TIMEOUT,
    autoDisableOnSilence: initialConfig?.autoDisableOnSilence ?? true,
  })

  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const speechSynthesisRef = useRef<SpeechSynthesis | null>(null)
  const recognitionRef = useRef<any>(null)

  // Load preference from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("voice_guidance_preference")
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        setConfig((prev) => ({ ...prev, ...parsed }))
      } catch (error) {
        console.error("Failed to load voice preference:", error)
      }
    }
  }, [])

  // Save preference to localStorage
  useEffect(() => {
    localStorage.setItem("voice_guidance_preference", JSON.stringify(config))
  }, [config])

  // Initialize speech synthesis
  useEffect(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      speechSynthesisRef.current = window.speechSynthesis
    }
  }, [])

  // Auto-disable on timeout
  useEffect(() => {
    if (config.enabled && config.autoDisableOnSilence) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      timeoutRef.current = setTimeout(() => {
        if (config.enabled) {
          console.log("Voice guidance auto-disabled due to timeout")
          setConfig((prev) => ({ ...prev, enabled: false }))
        }
      }, config.timeout)

      return () => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current)
        }
      }
    }
  }, [config.enabled, config.timeout, config.autoDisableOnSilence])

  const speak = useCallback(
    async (text: string, options?: { force?: boolean }) => {
      // If force is true, speak even if voice is disabled (for navigation)
      if (!config.enabled && !options?.force) {
        // #region agent log
        if (typeof window !== 'undefined') {
          fetch('http://127.0.0.1:7242/ingest/a0691e2c-cdd7-47b0-9342-76cf3ac06d2f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'use-voice-guidance.tsx:speak',message:'Voice disabled, skipping speak',data:{text:text.substring(0,50),enabled:config.enabled,force:options?.force},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
        }
        // #endregion
        return
      }
      
      // #region agent log
      if (typeof window !== 'undefined') {
        fetch('http://127.0.0.1:7242/ingest/a0691e2c-cdd7-47b0-9342-76cf3ac06d2f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'use-voice-guidance.tsx:speak',message:'Speaking text',data:{text:text.substring(0,50),enabled:config.enabled,force:options?.force,language:config.language},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      }
      // #endregion

      // Clean text - remove markdown and URLs
      const cleanText = text
        .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // Remove markdown links
        .replace(/https?:\/\/[^\s]+/g, "") // Remove URLs
        .replace(/\*\*([^*]+)\*\*/g, "$1") // Remove bold markdown
        .replace(/\*([^*]+)\*/g, "$1") // Remove italic markdown
        .trim()

      if (!cleanText) return

      // Cancel any ongoing browser speech
      if (speechSynthesisRef.current) {
        speechSynthesisRef.current.cancel()
      }

      try {
        setIsSpeaking(true)
        // Use OpenAI TTS
        const { speakWithOpenAI } = await import("@/lib/huggingface-voice")
        await speakWithOpenAI(cleanText, config.language)
        setIsSpeaking(false)
      } catch (error) {
        console.error("OpenAI TTS error, falling back to browser TTS:", error)
        // Fallback to browser SpeechSynthesis
        if (speechSynthesisRef.current) {
          const utterance = new SpeechSynthesisUtterance(cleanText)
          
          if (config.language === "yo") {
            utterance.lang = "yo-NG"
            utterance.rate = 0.92
          } else if (config.language === "pcm") {
            utterance.lang = "en-NG"
            utterance.rate = 0.93
            const voices = speechSynthesisRef.current.getVoices()
            const nigerianVoice = voices.find(
              (voice) =>
                voice.lang.startsWith("en") &&
                (voice.name.toLowerCase().includes("nigeria") ||
                  voice.name.toLowerCase().includes("africa"))
            )
            if (nigerianVoice) utterance.voice = nigerianVoice
          } else {
            utterance.lang = "en-US"
            utterance.rate = 0.95
          }
          
          utterance.pitch = 1.0
          utterance.volume = 1.0
          utterance.onstart = () => setIsSpeaking(true)
          utterance.onend = () => setIsSpeaking(false)
          utterance.onerror = () => setIsSpeaking(false)
          speechSynthesisRef.current.speak(utterance)
        } else {
          setIsSpeaking(false)
        }
      }
    },
    [config.enabled, config.language]
  )

  const stopSpeaking = useCallback(() => {
    if (speechSynthesisRef.current) {
      speechSynthesisRef.current.cancel()
      setIsSpeaking(false)
    }
  }, [])

  const startListening = useCallback(() => {
    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
      console.warn("Speech recognition not available")
      return null
    }

    const SpeechRecognition =
      (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition

    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }

    const recognition = new SpeechRecognition()
    recognitionRef.current = recognition

    // Set language
    if (config.language === "yo") {
      recognition.lang = "yo-NG"
    } else if (config.language === "pcm") {
      recognition.lang = "en-NG"
    } else {
      recognition.lang = "en-US"
    }

    recognition.continuous = false
    recognition.interimResults = true
    recognition.maxAlternatives = 1

    recognition.onstart = () => setIsListening(true)
    recognition.onend = () => {
      setIsListening(false)
      recognitionRef.current = null
    }
    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error)
      setIsListening(false)
      recognitionRef.current = null
    }

    try {
      recognition.start()
      return recognition
    } catch (error) {
      console.error("Failed to start speech recognition:", error)
      setIsListening(false)
      recognitionRef.current = null
      return null
    }
  }, [config.language])

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
      recognitionRef.current = null
      setIsListening(false)
    }
  }, [])

  const enable = useCallback(() => {
    setConfig((prev) => ({ ...prev, enabled: true }))
    // Reset timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
  }, [])

  const disable = useCallback(() => {
    setConfig((prev) => ({ ...prev, enabled: false }))
    stopSpeaking()
    stopListening()
  }, [stopSpeaking, stopListening])

  const toggle = useCallback(() => {
    if (config.enabled) {
      disable()
    } else {
      enable()
    }
  }, [config.enabled, enable, disable])

  const updateLanguage = useCallback((language: "en" | "yo" | "pcm") => {
    setConfig((prev) => ({ ...prev, language }))
  }, [])

  // Check for "No", "Stop", "Don't use voice" commands
  const checkForDisableCommand = useCallback(
    (text: string): boolean => {
      const lowerText = text.toLowerCase().trim()
      const disableCommands = [
        "no",
        "stop",
        "don't use voice",
        "dont use voice",
        "disable voice",
        "turn off voice",
        "no voice",
        "text only",
        "silent",
      ]

      const shouldDisable = disableCommands.some((cmd) => lowerText.includes(cmd))

      if (shouldDisable && config.enabled) {
        console.log("Voice disabled by user command")
        disable()
        return true
      }

      return false
    },
    [config.enabled, disable]
  )

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      stopSpeaking()
      stopListening()
    }
  }, [stopSpeaking, stopListening])

  return {
    config,
    isSpeaking,
    isListening,
    enable,
    disable,
    toggle,
    speak,
    stopSpeaking,
    startListening,
    stopListening,
    updateLanguage,
    checkForDisableCommand,
    setConfig,
  }
}


