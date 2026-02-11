/**
 * OpenAI Voice Integration
 * Handles Text-to-Speech using OpenAI API
 */

export async function synthesizeSpeech(text: string, language: "en" | "yo" | "pcm"): Promise<AudioBuffer | null> {
  try {
    // Create AbortController for timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 15000) // 15 second timeout
    
    try {
      const response = await fetch("/api/tts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text, language }),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Unknown error" }))
        throw new Error(errorData.error || "TTS API request failed")
      }

      const data = await response.json()

      if (!data.audio) {
        throw new Error("No audio data in response")
      }

      // Decode base64 audio
      const audioData = Uint8Array.from(atob(data.audio), (c) => c.charCodeAt(0))
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const audioBuffer = await audioContext.decodeAudioData(audioData.buffer)

      return audioBuffer
    } catch (error: any) {
      clearTimeout(timeoutId)
      if (error.name === 'AbortError') {
        console.error("TTS API request timed out")
        throw new Error("TTS request timed out")
      }
      throw error
    }
  } catch (error) {
    console.error("Speech synthesis error:", error)
    return null
  }
}

export async function playAudioBuffer(audioBuffer: AudioBuffer): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const source = audioContext.createBufferSource()
      source.buffer = audioBuffer
      source.connect(audioContext.destination)

      source.onended = () => resolve()
      try {
        source.start()
      } catch (error) {
        reject(error)
        return
      }

      // Auto-stop after 30 seconds max
      setTimeout(() => {
        try {
          source.stop()
        } catch (e) {
          // Already stopped
        }
        resolve()
      }, 30000)
    } catch (error) {
      reject(error)
    }
  })
}

export async function speakWithOpenAI(text: string, language: "en" | "yo" | "pcm"): Promise<void> {
  const audioBuffer = await synthesizeSpeech(text, language)
  if (audioBuffer) {
    await playAudioBuffer(audioBuffer)
  }
}

