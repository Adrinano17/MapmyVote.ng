"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport } from "ai"
import { Bot, X, Send, Mic, MicOff, Volume2, VolumeX, Minimize2, Maximize2, MapPin, Navigation } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useLanguage } from "@/hooks/use-language"
import { translations } from "@/lib/types"
import { cn } from "@/lib/utils"

// Define SpeechRecognitionEvent type locally (Web Speech API)
interface SpeechRecognitionEvent {
  results: SpeechRecognitionResultList
  resultIndex: number
}

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

  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({ api: "/api/chat" }),
    body: { language },
    initialMessages: [
      {
        id: "welcome",
        role: "assistant",
        content: t.aiGreeting,
        parts: [{ type: "text", text: t.aiGreeting }],
      },
    ],
  })

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Speak new assistant messages
  useEffect(() => {
    if (voiceEnabled && messages.length > 0) {
      const lastMessage = messages[messages.length - 1]
      if (lastMessage.role === "assistant" && lastMessage.content) {
        speak(lastMessage.content)
      }
    }
  }, [messages, voiceEnabled])

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

        // Check if arrived (within 50 meters)
        if (distance < 0.05) {
          setIsNavigating(false)
          const arrivalMessage = t.aiArrival
          sendMessage({ text: arrivalMessage })
          speak(arrivalMessage)
        }
      })
    }, 10000) // Update every 10 seconds

    return () => clearInterval(interval)
  }, [isNavigating, userLocation, initialContext])

  const speak = (text: string) => {
    if (!voiceEnabled || typeof window === "undefined" || !window.speechSynthesis) return

    // Cancel any ongoing speech
    window.speechSynthesis.cancel()

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = language === "yo" ? "yo-NG" : language === "pcm" ? "en-NG" : "en-NG"
    utterance.rate = 0.9
    utterance.onstart = () => setIsSpeaking(true)
    utterance.onend = () => setIsSpeaking(false)
    utterance.onerror = () => setIsSpeaking(false)

    window.speechSynthesis.speak(utterance)
  }

  const toggleVoiceInput = () => {
    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
      alert(t.voiceNotSupported)
      return
    }

    const SpeechRecognition =
      (window as unknown as { webkitSpeechRecognition: typeof window.SpeechRecognition }).webkitSpeechRecognition ||
      window.SpeechRecognition
    const recognition = new SpeechRecognition()

    recognition.lang = language === "yo" ? "yo-NG" : language === "pcm" ? "en-NG" : "en-NG"
    recognition.interimResults = false

    recognition.onstart = () => setIsListening(true)
    recognition.onend = () => setIsListening(false)
    recognition.onerror = () => setIsListening(false)

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[0][0].transcript
      setInput(transcript)
      // Auto-send voice input
      if (transcript.trim()) {
        sendMessage({ text: transcript })
        setInput("")
      }
    }

    if (isListening) {
      recognition.stop()
    } else {
      recognition.start()
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || status !== "ready") return
    sendMessage({ text: input })
    setInput("")
  }

  const startNavigation = () => {
    setIsNavigating(true)
    const startMessage = t.aiNavigationStart
    sendMessage({ text: startMessage })
  }

  const getEncouragementMessage = () => {
    const encouragements = [t.aiEncouragement1, t.aiEncouragement2, t.aiEncouragement3]
    return encouragements[Math.floor(Math.random() * encouragements.length)]
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
          <CardTitle className="text-sm font-medium">{t.aiAssistantName}</CardTitle>
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
            {messages.map((message) => (
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
                  {message.content}
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
                placeholder={isListening ? t.speakNow : t.aiTypePlaceholder}
                disabled={status !== "ready" || isListening}
                className="flex-1"
              />
              <Button type="submit" size="icon" disabled={!input.trim() || status !== "ready"} className="shrink-0">
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </>
      )}
    </Card>
  )
}
