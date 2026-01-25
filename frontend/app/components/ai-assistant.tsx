"use client"

import type React from "react"

import { useState, useRef, useEffect, useCallback } from "react"

// Dynamic imports to handle missing packages gracefully
let useChat: any = null
let DefaultChatTransport: any = null

try {
  const aiSdk = require("@ai-sdk/react")
  const ai = require("ai")
  useChat = aiSdk.useChat
  DefaultChatTransport = ai.DefaultChatTransport
} catch (e) {
  console.warn("@ai-sdk/react or ai package not installed. AI assistant will be disabled.")
}
import { Bot, X, Send, Mic, MicOff, Volume2, VolumeX, Minimize2, Maximize2, MapPin, Navigation } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useLanguage } from "@/hooks/use-language"
import { translations } from "@/lib/types"
import { cn } from "@/lib/utils"
// SpeechRecognition types are available globally in browsers that support it

interface AIAssistantProps {
  initialContext?: {
    pollingUnit?: {
      name: string
      code: string
      latitude?: number | null
      longitude?: number | null
    }
    userLocation?: {
      latitude: number
      longitude: number
    }
  }
}

export function AIAssistant({ initialContext }: AIAssistantProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [voiceEnabled, setVoiceEnabled] = useState(true)
  const [input, setInput] = useState("")
  const [userLocation, setUserLocation] = useState(initialContext?.userLocation || null)
  const [isNavigating, setIsNavigating] = useState(false)
  const [navigationProgress, setNavigationProgress] = useState<{ distance: number; time: number } | null>(null)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { language } = useLanguage()
  const t = translations[language]

  // Check if AI packages are available
  const aiAvailable = useChat && DefaultChatTransport

  // #region agent log
  useEffect(() => {
    fetch('http://127.0.0.1:7242/ingest/a0691e2c-cdd7-47b0-9342-76cf3ac06d2f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ai-assistant.tsx:59',message:'AI availability check',data:{aiAvailable,hasUseChat:!!useChat,hasDefaultChatTransport:!!DefaultChatTransport},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
  }, [aiAvailable]);
  // #endregion

  const chatHook = aiAvailable
    ? useChat({
        transport: new DefaultChatTransport({ api: "/api/chat" }),
        body: { language },
        initialMessages: [
          {
            id: "welcome",
            role: "assistant",
            content: language === "yo"
              ? "Ẹ kú àbọ̀! Mo jẹ́ Ìrànlọ́wọ́, olùrànlọ́wọ́ ìdìbò rẹ. Màá ràn ọ́ lọ́wọ́ láti wá ibi ìdìbò rẹ kí n sì tọ́ ọ síbẹ̀. Báwo ni mo ṣe lè ràn ọ́ lọ́wọ́ lónìí?"
              : language === "pcm"
              ? "Hello! Na me be Ìrànlọ́wọ́, your voting helper. I go help you find your polling unit and carry you go there. Wetin you want make I help you with today?"
              : "Hello! I'm Ìrànlọ́wọ́, your voting assistant. I'll help you find your polling unit and guide you there. How can I assist you today?",
            parts: [{ 
              type: "text", 
              text: language === "yo"
                ? "Ẹ kú àbọ̀! Mo jẹ́ Ìrànlọ́wọ́, olùrànlọ́wọ́ ìdìbò rẹ. Màá ràn ọ́ lọ́wọ́ láti wá ibi ìdìbò rẹ kí n sì tọ́ ọ síbẹ̀. Báwo ni mo ṣe lè ràn ọ́ lọ́wọ́ lónìí?"
                : language === "pcm"
                ? "Hello! Na me be Ìrànlọ́wọ́, your voting helper. I go help you find your polling unit and carry you go there. Wetin you want make I help you with today?"
                : "Hello! I'm Ìrànlọ́wọ́, your voting assistant. I'll help you find your polling unit and guide you there. How can I assist you today?"
            }],
          },
        ],
      })
    : { messages: [], sendMessage: () => {}, status: "error" as const }

  const { messages, sendMessage, status } = chatHook

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Helper to extract content from message parts - handles all AI SDK formats
  const extractContentFromMessage = useCallback((message: any): string => {
    if (message.content) return message.content
    if (message.parts && Array.isArray(message.parts)) {
      return message.parts.map((part: any) => {
        // Handle string parts
        if (typeof part === 'string') return part
        // Handle object parts with text property
        if (part?.text) return part.text
        if (part?.content) return part.content
        // Handle AI SDK format: { type: 'text', text: '...' }
        if (part?.type === 'text' && part?.text) return part.text
        // Handle nested content
        if (part?.content?.text) return part.content.text
        // Last resort: try to extract any string value
        if (typeof part === 'object' && part !== null) {
          for (const key of ['text', 'content', 'value', 'message']) {
            if (typeof part[key] === 'string') return part[key]
          }
        }
        return ""
      }).filter(Boolean).join("")
    }
    return ""
  }, [])


  // Track which messages have been spoken to avoid duplicates
  const spokenMessageIdsRef = useRef<Set<string>>(new Set())

  // Use the same extraction function for consistency
  const extractMessageContent = extractContentFromMessage

  // Define speak function BEFORE useEffect that uses it (to avoid "Cannot access before initialization" error)
  const speak = useCallback(async (text: string) => {
    if (!voiceEnabled) return

    // Clean text - remove markdown formatting and URLs
    const cleanText = text
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // Remove markdown links
      .replace(/https?:\/\/[^\s]+/g, "") // Remove URLs
      .replace(/\*\*([^*]+)\*\*/g, "$1") // Remove bold markdown
      .replace(/\*([^*]+)\*/g, "$1") // Remove italic markdown
      .trim()

    if (!cleanText) return

    // Cancel any ongoing browser speech
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel()
    }

    try {
      setIsSpeaking(true)
      // Use OpenAI TTS
      const { speakWithOpenAI } = await import("@/lib/huggingface-voice")
      // Map language to supported TTS languages (en, yo, pcm)
      const ttsLanguage = (language === 'yo' || language === 'pcm') ? language : 'en'
      await speakWithOpenAI(cleanText, ttsLanguage as 'en' | 'yo' | 'pcm')
      setIsSpeaking(false)
    } catch (error) {
      console.error("OpenAI TTS error, falling back to browser TTS:", error)
      // Fallback to browser SpeechSynthesis
      if (typeof window !== "undefined" && window.speechSynthesis) {
        const utterance = new SpeechSynthesisUtterance(cleanText)
        
        if (language === "yo") {
          utterance.lang = "yo-NG"
        } else if (language === "pcm") {
          utterance.lang = "en-NG"
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
        utterance.onerror = () => setIsSpeaking(false)
        window.speechSynthesis.speak(utterance)
      } else {
        setIsSpeaking(false)
      }
    }
  }, [voiceEnabled, language])

  // Speak new assistant messages (only when message is complete, not during streaming)
  useEffect(() => {
    if (voiceEnabled && messages.length > 0 && status !== "streaming") {
      const lastMessage = messages[messages.length - 1]
      if (lastMessage.role === "assistant" && !spokenMessageIdsRef.current.has(lastMessage.id)) {
        const content = extractMessageContent(lastMessage)
        if (content && content.trim()) {
          spokenMessageIdsRef.current.add(lastMessage.id)
          // Cancel any ongoing speech before starting new one
          if (typeof window !== "undefined" && window.speechSynthesis) {
            window.speechSynthesis.cancel()
          }
          speak(content)
        }
      }
    }
  }, [messages, voiceEnabled, status, speak, extractMessageContent])

  // Get user location for navigation
  useEffect(() => {
    if (isNavigating && !userLocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          })
        },
        (error) => {
          console.error("Location error:", error)
        },
      )
    }
  }, [isNavigating, userLocation])

  // Update navigation progress periodically
  useEffect(() => {
    if (!isNavigating || !userLocation || !initialContext?.pollingUnit?.latitude) return

    const interval = setInterval(() => {
      navigator.geolocation.getCurrentPosition((position) => {
        const newLocation = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        }
        setUserLocation(newLocation)

        // Calculate distance
        const R = 6371
        const dLat = ((initialContext.pollingUnit!.latitude! - newLocation.latitude) * Math.PI) / 180
        const dLng = ((initialContext.pollingUnit!.longitude! - newLocation.longitude) * Math.PI) / 180
        const a =
          Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos((newLocation.latitude * Math.PI) / 180) *
            Math.cos((initialContext.pollingUnit!.latitude! * Math.PI) / 180) *
            Math.sin(dLng / 2) *
            Math.sin(dLng / 2)
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
        const distance = R * c

        const timeMinutes = Math.round((distance / 5) * 60) // Walking speed

        setNavigationProgress({ distance: Math.round(distance * 1000), time: timeMinutes })

        // Check if arrived (within 15 meters as per FR-15)
        if (distance < 0.015) {
          setIsNavigating(false)
          const arrivalMessage = t.aiArrival
          speak(arrivalMessage)
        }
      })
    }, 10000) // Update every 10 seconds

    return () => clearInterval(interval)
  }, [isNavigating, userLocation, initialContext])

  const recognitionRef = useRef<any>(null)

  const toggleVoiceInput = () => {
    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
      alert(t.voiceNotSupported)
      return
    }

    const SpeechRecognition =
      (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition

    // Stop existing recognition if running
    if (recognitionRef.current) {
      recognitionRef.current.stop()
      recognitionRef.current = null
      setIsListening(false)
      return
    }

    const recognition = new (SpeechRecognition as any)()
    recognitionRef.current = recognition

    // Enhanced language configuration
    if (language === "yo") {
      recognition.lang = "yo-NG"
    } else if (language === "pcm") {
      recognition.lang = "en-NG" // Nigerian English for Pidgin
    } else {
      recognition.lang = "en-US"
    }

    recognition.continuous = false
    recognition.interimResults = true // Show interim results for better UX
    recognition.maxAlternatives = 1

    recognition.onstart = () => {
      setIsListening(true)
    }

        recognition.onresult = async (event: any) => {
          let finalTranscript = ""
          let interimTranscript = ""

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript
            if (event.results[i].isFinal) {
              finalTranscript += transcript + " "
            } else {
              interimTranscript += transcript
            }
          }

          // Update input with interim results for better feedback
          if (interimTranscript) {
            setInput(interimTranscript)
          }

          // Auto-send when final result is available
          if (finalTranscript.trim()) {
            setInput(finalTranscript.trim())
            sendMessage({ content: finalTranscript.trim() })
            setInput("")
          }
        }

    recognition.onend = () => {
      setIsListening(false)
      recognitionRef.current = null
    }

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error)
      setIsListening(false)
      recognitionRef.current = null
      
      // Provide user-friendly error messages
      if (event.error === "no-speech") {
        // User didn't speak, just reset
        setInput("")
      } else if (event.error === "audio-capture") {
        alert("Microphone not found. Please check your microphone settings.")
      } else if (event.error === "not-allowed") {
        alert("Microphone permission denied. Please allow microphone access.")
      }
    }

    try {
      recognition.start()
    } catch (error) {
      console.error("Failed to start speech recognition:", error)
      setIsListening(false)
      recognitionRef.current = null
    }
  }

  // Load voices when component mounts
  useEffect(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      // Chrome loads voices asynchronously
      const loadVoices = () => {
        const voices = window.speechSynthesis.getVoices()
        // Voices are now loaded
      }
      
      loadVoices()
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = loadVoices
      }
    }
  }, [])

  // Cleanup recognition and speech on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
        recognitionRef.current = null
      }
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel()
      }
      // Clear spoken messages on unmount
      spokenMessageIdsRef.current.clear()
    }
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/a0691e2c-cdd7-47b0-9342-76cf3ac06d2f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ai-assistant.tsx:346',message:'Message submit attempt',data:{input:input.trim(),status,aiAvailable},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
    // #endregion
    if (!input.trim() || status === "in_progress") return
    try {
      sendMessage({ content: input.trim() } as any)
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/a0691e2c-cdd7-47b0-9342-76cf3ac06d2f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ai-assistant.tsx:350',message:'Message sent',data:{input:input.trim()},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
      // #endregion
    } catch (error) {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/a0691e2c-cdd7-47b0-9342-76cf3ac06d2f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ai-assistant.tsx:353',message:'Message send error',data:{error:String(error)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
      // #endregion
    }
    setInput("")
  }

  const startNavigation = () => {
    setIsNavigating(true)
    const startMessage = t.aiNavigationStart
    speak(startMessage)
  }

  const getEncouragementMessage = () => {
    const encouragements = [t.aiEncouragement1, t.aiEncouragement2, t.aiEncouragement3]
    return encouragements[Math.floor(Math.random() * encouragements.length)]
  }

  // Don't show AI assistant if packages aren't available
  if (!aiAvailable) {
    return null
  }

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50"
        size="icon"
      >
        <Bot className="h-6 w-6" />
        <span className="sr-only">Open AI Assistant</span>
      </Button>
    )
  }

  return (
    <Card
      className={cn(
        "fixed z-50 shadow-2xl transition-all duration-300",
        isMinimized ? "bottom-6 right-6 w-80 h-14" : "bottom-6 right-6 w-96 h-[500px] max-h-[80vh]",
      )}
    >
      <CardHeader className="flex flex-row items-center justify-between p-3 border-b">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Bot className="h-4 w-4" />
          </div>
          <CardTitle className="text-sm font-medium">{t.aiAssistantName || "Ìrànlọ́wọ́"}</CardTitle>
          {status === "streaming" && <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse" />}
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setVoiceEnabled(!voiceEnabled)}>
            {voiceEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setIsMinimized(!isMinimized)}>
            {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setIsOpen(false)}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      {!isMinimized && (
        <>
          <CardContent className="flex-1 overflow-y-auto p-3 space-y-3" style={{ height: "calc(100% - 120px)" }}>
            {messages.map((message: any) => (
              <div
                key={message.id}
                className={cn("flex gap-2", message.role === "user" ? "justify-end" : "justify-start")}
              >
                {message.role === "assistant" && (
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <Bot className="h-3 w-3" />
                  </div>
                )}
                <div
                  className={cn(
                    "rounded-lg px-3 py-2 text-sm max-w-[80%]",
                    message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground",
                  )}
                >
                  {extractContentFromMessage(message)}
                </div>
              </div>
            ))}

            {/* Navigation Progress */}
            {isNavigating && navigationProgress && (
              <div className="bg-primary/10 rounded-lg p-3 space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-primary">
                  <Navigation className="h-4 w-4 animate-pulse" />
                  {t.aiNavigationProgress.replace("{minutes}", String(navigationProgress.time))}
                </div>
                <div className="text-xs text-muted-foreground">
                  {navigationProgress.distance}m {t.aiEncouragement1.split("!")[0]}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full bg-transparent"
                  onClick={() => {
                    const encouragement = getEncouragementMessage()
                    speak(encouragement)
                  }}
                >
                  <Volume2 className="h-3 w-3 mr-2" />
                  {t.aiEncouragement1.split("!")[0]}!
                </Button>
              </div>
            )}

            {/* Start Navigation Button */}
            {initialContext?.pollingUnit?.latitude && !isNavigating && (
              <div className="bg-secondary/50 rounded-lg p-3">
                <div className="flex items-center gap-2 text-sm mb-2">
                  <MapPin className="h-4 w-4 text-primary" />
                  <span className="font-medium">{initialContext.pollingUnit.name}</span>
                </div>
                <Button size="sm" className="w-full gap-2" onClick={startNavigation}>
                  <Navigation className="h-4 w-4" />
                  {t.getDirections}
                </Button>
              </div>
            )}

            <div ref={messagesEndRef} />
          </CardContent>

          <div className="p-3 border-t">
            <form onSubmit={handleSubmit} className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="icon"
                className={cn("shrink-0", isListening && "bg-destructive text-destructive-foreground")}
                onClick={toggleVoiceInput}
              >
                {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </Button>
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={isListening ? (t.speakNow || "Speak now...") : (t.aiTypePlaceholder || "Type your message...")}
                disabled={status === "in_progress" || isListening}
                className="flex-1"
              />
              <Button type="submit" size="icon" disabled={!input.trim() || status === "in_progress"} className="shrink-0">
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </>
      )}
    </Card>
  )
}
