/**
 * Voice Locale Configuration
 * Provides optimal voice and language settings for each supported language
 */

export interface VoiceConfig {
  language: string
  voiceName?: string
  fallbackVoices?: string[]
  rate?: number
  pitch?: number
}

export const voiceConfigs: Record<"en" | "yo" | "pcm", VoiceConfig> = {
  en: {
    language: "en-US",
    voiceName: "Google US English",
    fallbackVoices: ["Microsoft Zira - English (United States)", "Samantha"],
    rate: 0.95,
    pitch: 1.0,
  },
  yo: {
    language: "yo-NG",
    voiceName: "Google Yoruba",
    fallbackVoices: ["Microsoft Ayo - Yoruba (Nigeria)", "Google Nigerian English"],
    rate: 0.92,
    pitch: 1.0,
  },
  pcm: {
    language: "en-NG",
    voiceName: "Google Nigerian English",
    fallbackVoices: ["Microsoft Blessing - English (Nigeria)", "Samantha"],
    rate: 0.93,
    pitch: 1.0,
  },
}

/**
 * Get the best available voice for a language
 */
export function getBestVoice(language: "en" | "yo" | "pcm"): SpeechSynthesisVoice | null {
  if (typeof window === "undefined" || !window.speechSynthesis) {
    return null
  }

  const config = voiceConfigs[language]
  const voices = window.speechSynthesis.getVoices()

  // Try exact match first
  let voice = voices.find((v) => v.name === config.voiceName && v.lang.startsWith(config.language))

  // Try language match
  if (!voice) {
    voice = voices.find((v) => v.lang.startsWith(config.language))
  }

  // Try fallback voices
  if (!voice && config.fallbackVoices) {
    for (const fallbackName of config.fallbackVoices) {
      voice = voices.find((v) => v.name.includes(fallbackName))
      if (voice) break
    }
  }

  // Try any voice with the language code
  if (!voice) {
    voice = voices.find((v) => v.lang.includes(config.language.split("-")[0]))
  }

  // Last resort: any voice
  return voice || voices[0] || null
}

/**
 * Initialize voices (call after page load)
 */
export function initializeVoices(): void {
  if (typeof window === "undefined" || !window.speechSynthesis) {
    return
  }

  // Some browsers need this to load voices
  if (window.speechSynthesis.getVoices().length === 0) {
    window.speechSynthesis.addEventListener("voiceschanged", () => {
      // Voices loaded
    })
  }
}















