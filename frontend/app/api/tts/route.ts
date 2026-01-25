import { NextRequest, NextResponse } from "next/server"

export const maxDuration = 30

export async function POST(req: NextRequest) {
  try {
    const { text, language = "en" } = await req.json()

    if (!text) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 })
    }

    const OPENAI_API_KEY = process.env.OPENAI_API_KEY

    if (!OPENAI_API_KEY) {
      return NextResponse.json({ error: "OpenAI API key not configured" }, { status: 500 })
    }

    // Select appropriate voice based on language
    // OpenAI TTS voices: alloy, echo, fable, onyx, nova, shimmer
    let voice = "nova" // Default - good for general use
    if (language === "yo") {
      voice = "nova" // Try different voices if needed
    } else if (language === "pcm") {
      voice = "echo" // Different voice for variety
    }

    // Use OpenAI TTS API
    const response = await fetch("https://api.openai.com/v1/audio/speech", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "tts-1", // or "tts-1-hd" for higher quality
        input: text,
        voice: voice,
      }),
    })

    if (!response.ok) {
      const error = await response.text().catch(() => "Unknown error")
      console.error("OpenAI TTS error:", error)
      return NextResponse.json({ error: "TTS generation failed" }, { status: response.status })
    }

    // Get audio blob
    const audioBlob = await response.blob()

    // Return audio as base64
    const arrayBuffer = await audioBlob.arrayBuffer()
    const base64 = Buffer.from(arrayBuffer).toString("base64")

    return NextResponse.json({
      audio: base64,
      mimeType: audioBlob.type || "audio/mp3",
    })
  } catch (error: any) {
    console.error("TTS API error:", error)
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 })
  }
}
