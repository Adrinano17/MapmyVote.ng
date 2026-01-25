import { NextRequest, NextResponse } from "next/server"

export const maxDuration = 30

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const audioFile = formData.get("audio") as File

    if (!audioFile) {
      return NextResponse.json({ error: "Audio file is required" }, { status: 400 })
    }

    const OPENAI_API_KEY = process.env.OPENAI_API_KEY

    if (!OPENAI_API_KEY) {
      return NextResponse.json({ error: "OpenAI API key not configured" }, { status: 500 })
    }

    // Convert file to FormData for OpenAI Whisper API
    const formDataForOpenAI = new FormData()
    formDataForOpenAI.append("file", audioFile)
    formDataForOpenAI.append("model", "whisper-1")
    formDataForOpenAI.append("language", "en") // Can be "en", "yo", etc. but Whisper auto-detects

    // Use OpenAI Whisper API for speech recognition
    const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: formDataForOpenAI,
    })

    if (!response.ok) {
      const error = await response.text()
      console.error("OpenAI Whisper error:", error)
      return NextResponse.json({ error: "Speech recognition failed" }, { status: response.status })
    }

    const result = await response.json()

    // OpenAI Whisper returns { text: "transcription" }
    return NextResponse.json({
      text: result.text || "",
    })
  } catch (error: any) {
    console.error("ASR API error:", error)
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 })
  }
}
