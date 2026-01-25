import { convertToModelMessages, streamText, tool, type UIMessage } from "ai"
import { createOpenAI } from "@ai-sdk/openai"
import { z } from "zod"
import { createClient } from "@/lib/supabase/server"
import { NextRequest } from "next/server"

export const maxDuration = 30

const systemPrompt = (
  language: string,
) => `You are Ìrànlọ́wọ́, a calm, friendly civic navigation assistant helping voters in Ibadan North find their polling units.

Your role is to guide users step-by-step from their current location to their assigned polling unit using simple language, landmarks, and estimated walking time.

Always:
- Confirm the user's ward and polling unit from validated data
- Use the user's preferred language (English, Yoruba, Hausa, or Igbo)
- Ask once if the user prefers voice guidance or text-only navigation
- If the user says "no", "stop", or does not respond, continue silently with text only

Navigation rules:
- Give walking directions only
- Use landmarks instead of street names when possible (schools, mosques, churches, markets)
- Mention distance and estimated walking time
- Reassure the user they are on the right path
- Encourage the user calmly (e.g. "You are doing well, keep going")

Location awareness:
- Compare the user's live location with the polling unit coordinates
- Alert the user if they are moving in the wrong direction
- Confirm arrival when within 15 meters of the polling unit

Tone:
- Clear, polite, and encouraging
- Never rush the user
- Never mention APIs, databases, or technical terms

Your goal is to reduce confusion, build confidence, and help the user arrive successfully at their polling unit.

Language preference: ${language === "yo" ? "Yoruba" : language === "pcm" ? "Nigerian Pidgin" : "English"}
- If the user speaks in Yoruba, respond in Yoruba
- If the user speaks in Pidgin, respond in Pidgin  
- Otherwise, respond in the language preference specified

Important information:
- Voting hours in Nigeria are typically 8:30 AM to 2:30 PM
- Voters need their Permanent Voter Card (PVC) to vote
- Ibadan North LGA has 12 wards with multiple polling units each`

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const {
      messages,
      language = "en",
      context,
    }: {
      messages?: UIMessage[]
      language?: string
      context?: {
        userLocation?: { lat: number; lng: number }
        pollingUnit?: { name: string; address: string; coordinates: { lat: number; lng: number } }
        ward?: { name: string; code: string }
        distance?: number
        duration?: number
      }
    } = body

    // #region agent log
    try {
      await fetch('http://127.0.0.1:7242/ingest/a0691e2c-cdd7-47b0-9342-76cf3ac06d2f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'chat/route.ts:66',message:'Chat API body received',data:{hasMessages:!!messages,messagesType:typeof messages,messagesIsArray:Array.isArray(messages),messagesLength:messages?.length,bodyKeys:Object.keys(body),firstMessage:messages?.[0] ? {id:messages[0].id,role:messages[0].role,hasContent:!!messages[0].content,hasParts:!!messages[0].parts,contentType:typeof messages[0].content,partsType:typeof messages[0].parts,partsIsArray:Array.isArray(messages[0].parts)} : null},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
    } catch {}
    // #endregion

    if (!messages || !Array.isArray(messages)) {
      // #region agent log
      try {
        await fetch('http://127.0.0.1:7242/ingest/a0691e2c-cdd7-47b0-9342-76cf3ac06d2f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'chat/route.ts:72',message:'Chat API invalid messages',data:{messages,body},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
      } catch {}
      // #endregion
      return new Response(
        JSON.stringify({ 
          error: "Invalid request",
          message: "Messages array is required and must be an array"
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      )
    }

    const supabase = await createClient()
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY

    // Use OpenAI directly (all Hugging Face code removed)
    if (!OPENAI_API_KEY) {
      return new Response(
        JSON.stringify({ 
          error: "No AI API configured",
          message: "Please set OPENAI_API_KEY in frontend/.env.local"
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      )
    }

    // Create OpenAI client with API key
    const openai = createOpenAI({
      apiKey: OPENAI_API_KEY,
    })

    // Build context-aware system message
    let contextualPrompt = systemPrompt(language)

    if (context) {
      contextualPrompt += "\n\n--- CURRENT CONTEXT ---"

      if (context.userLocation) {
        contextualPrompt += `\nUser's current location: ${context.userLocation.lat.toFixed(6)}, ${context.userLocation.lng.toFixed(6)}`
      }

      if (context.pollingUnit) {
        contextualPrompt += `\nDestination polling unit: ${context.pollingUnit.name}`
        contextualPrompt += `\nAddress: ${context.pollingUnit.address}`
        contextualPrompt += `\nCoordinates: ${context.pollingUnit.coordinates.lat.toFixed(6)}, ${context.pollingUnit.coordinates.lng.toFixed(6)}`
      }

      if (context.ward) {
        contextualPrompt += `\nWard: ${context.ward.name} (Code: ${context.ward.code})`
      }

      if (context.distance !== undefined) {
        const distanceText =
          context.distance < 1000
            ? `${Math.round(context.distance)} meters`
            : `${(context.distance / 1000).toFixed(1)} kilometers`
        contextualPrompt += `\nDistance to polling unit: ${distanceText}`

        if (context.distance < 15) {
          contextualPrompt +=
            "\nIMPORTANT: The user has arrived at the polling unit! Congratulate them warmly."
        } else if (context.distance < 50) {
          contextualPrompt +=
            "\nThe user is very close to the polling unit. Encourage them - almost there!"
        }
      }

      if (context.duration !== undefined) {
        const minutes = Math.round(context.duration / 60)
        contextualPrompt += `\nEstimated walking time: ${minutes} minutes`
      }
    }

    console.log("Chat request received:", {
      messageCount: messages.length,
      language,
      hasApiKey: !!OPENAI_API_KEY,
      hasContext: !!context,
    })
    // #region agent log
    try {
      await fetch('http://127.0.0.1:7242/ingest/a0691e2c-cdd7-47b0-9342-76cf3ac06d2f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'chat/route.ts:129',message:'Chat API request received',data:{messageCount:messages.length,language,hasApiKey:!!OPENAI_API_KEY,hasContext:!!context},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
    } catch {}
    // #endregion

    // Normalize messages format for convertToModelMessages
    // convertToModelMessages expects messages with 'parts' array, not 'content' string
    const normalizedMessages = messages.map((msg: any) => {
      // If message has content but no parts, convert content to parts array
      if (msg.content && !msg.parts) {
        return {
          ...msg,
          parts: [{ type: "text", text: msg.content }],
          content: undefined, // Remove content to avoid confusion
        }
      }
      // If message has parts but it's not an array, wrap it
      if (msg.parts && !Array.isArray(msg.parts)) {
        return { ...msg, parts: [msg.parts] }
      }
      // If message has text but no content or parts, create parts
      if (msg.text && !msg.content && !msg.parts) {
        return {
          ...msg,
          parts: [{ type: "text", text: msg.text }],
        }
      }
      // Ensure parts exists as array
      if (!msg.parts) {
        return {
          ...msg,
          parts: msg.content ? [{ type: "text", text: msg.content }] : [],
          content: undefined,
        }
      }
      return msg
    })

    // #region agent log
    try {
      await fetch('http://127.0.0.1:7242/ingest/a0691e2c-cdd7-47b0-9342-76cf3ac06d2f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'chat/route.ts:163',message:'Normalized messages before convertToModelMessages',data:{originalLength:messages.length,normalizedLength:normalizedMessages.length,firstNormalized:normalizedMessages[0] ? {id:normalizedMessages[0].id,role:normalizedMessages[0].role,hasContent:!!normalizedMessages[0].content,hasParts:!!normalizedMessages[0].parts,partsIsArray:Array.isArray(normalizedMessages[0].parts)} : null},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
    } catch {}
    // #endregion

    let modelMessages
    try {
      modelMessages = await convertToModelMessages(normalizedMessages)
      // #region agent log
      try {
        await fetch('http://127.0.0.1:7242/ingest/a0691e2c-cdd7-47b0-9342-76cf3ac06d2f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'chat/route.ts:175',message:'convertToModelMessages succeeded',data:{modelMessagesLength:modelMessages.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
      } catch {}
      // #endregion
    } catch (convertError: any) {
      // #region agent log
      try {
        await fetch('http://127.0.0.1:7242/ingest/a0691e2c-cdd7-47b0-9342-76cf3ac06d2f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'chat/route.ts:180',message:'convertToModelMessages failed',data:{error:convertError.message,stack:convertError.stack?.substring(0,300),normalizedMessages:JSON.stringify(normalizedMessages)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
      } catch {}
      // #endregion
      throw convertError
    }

    const result = streamText({
      model: openai("gpt-4o-mini"),
      system: contextualPrompt,
      messages: modelMessages,
      tools: {
        searchPollingUnit: tool({
        description: "Search for a polling unit by name, code, or ward",
        inputSchema: z.object({
          query: z.string().describe("The search query - polling unit name, code, or ward name"),
        }),
        execute: async ({ query }) => {
          const { data: pollingUnits } = await supabase
            .from("polling_units")
            .select("*, ward:wards(*)")
            .or(`name.ilike.%${query}%,code.ilike.%${query}%,address.ilike.%${query}%`)
            .limit(5)

          const { data: wards } = await supabase
            .from("wards")
            .select("*")
            .or(`name.ilike.%${query}%,code.ilike.%${query}%`)
            .limit(3)

          if (pollingUnits && pollingUnits.length > 0) {
            return {
              found: true,
              pollingUnits: pollingUnits.map((pu) => ({
                name: pu.name,
                code: pu.code,
                address: pu.address,
                ward: pu.ward?.name,
                registeredVoters: pu.registered_voters,
                hasCoordinates: !!(pu.latitude && pu.longitude),
                latitude: pu.latitude,
                longitude: pu.longitude,
              })),
              wards: wards?.map((w) => ({ name: w.name, code: w.code })) || [],
            }
          }

          return {
            found: false,
            message: "No polling units found matching the search query",
            suggestions: wards?.map((w) => w.name) || [],
          }
        },
      }),

      getPollingUnitDetails: tool({
        description: "Get detailed information about a specific polling unit",
        inputSchema: z.object({
          code: z.string().describe("The polling unit code"),
        }),
        execute: async ({ code }) => {
          const { data: pollingUnit } = await supabase
            .from("polling_units")
            .select("*, ward:wards(*)")
            .eq("code", code)
            .single()

          if (pollingUnit) {
            return {
              found: true,
              name: pollingUnit.name,
              code: pollingUnit.code,
              address: pollingUnit.address || "Ibadan North LGA",
              ward: pollingUnit.ward?.name,
              registeredVoters: pollingUnit.registered_voters,
              votingHours: "8:30 AM - 2:30 PM",
              hasCoordinates: !!(pollingUnit.latitude && pollingUnit.longitude),
              latitude: pollingUnit.latitude,
              longitude: pollingUnit.longitude,
              directionsUrl:
                pollingUnit.latitude && pollingUnit.longitude
                  ? `/map?lat=${pollingUnit.latitude}&lng=${pollingUnit.longitude}&code=${pollingUnit.code}`
                  : null,
            }
          }

          return { found: false, message: "Polling unit not found" }
        },
      }),

      getWardPollingUnits: tool({
        description: "Get all polling units in a specific ward",
        inputSchema: z.object({
          wardCode: z.string().describe("The ward code"),
        }),
        execute: async ({ wardCode }) => {
          const { data: ward } = await supabase.from("wards").select("*").eq("code", wardCode).single()

          if (!ward) {
            return { found: false, message: "Ward not found" }
          }

          const { data: pollingUnits } = await supabase
            .from("polling_units")
            .select("*")
            .eq("ward_id", ward.id)
            .order("name")

          return {
            found: true,
            wardName: ward.name,
            wardCode: ward.code,
            pollingUnits:
              pollingUnits?.map((pu) => ({
                name: pu.name,
                code: pu.code,
                registeredVoters: pu.registered_voters,
              })) || [],
          }
        },
      }),

      calculateTravelTime: tool({
        description: "Calculate approximate travel time to a polling unit based on distance",
        inputSchema: z.object({
          userLat: z.number().describe("User latitude"),
          userLng: z.number().describe("User longitude"),
          destLat: z.number().describe("Destination latitude"),
          destLng: z.number().describe("Destination longitude"),
          mode: z.enum(["walking", "driving"]).describe("Travel mode"),
        }),
        execute: async ({ userLat, userLng, destLat, destLng, mode }) => {
          // Haversine formula for distance calculation
          const R = 6371 // Earth's radius in km
          const dLat = ((destLat - userLat) * Math.PI) / 180
          const dLng = ((destLng - userLng) * Math.PI) / 180
          const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos((userLat * Math.PI) / 180) *
              Math.cos((destLat * Math.PI) / 180) *
              Math.sin(dLng / 2) *
              Math.sin(dLng / 2)
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
          const distance = R * c

          // Estimate time based on mode
          const speedKmPerHour = mode === "walking" ? 5 : 30
          const timeMinutes = Math.round((distance / speedKmPerHour) * 60)

          return {
            distanceKm: Math.round(distance * 10) / 10,
            estimatedMinutes: timeMinutes,
            mode,
            encouragement:
              timeMinutes <= 5
                ? "You're very close! Just a short walk away."
                : timeMinutes <= 15
                  ? "Not too far! You'll be there soon."
                  : "The journey is worth it - your vote matters!",
          }
        },
      }),
      },
      abortSignal: req.signal,
    })

    // #region agent log
    try {
      await fetch('http://127.0.0.1:7242/ingest/a0691e2c-cdd7-47b0-9342-76cf3ac06d2f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'chat/route.ts:359',message:'Chat API returning stream response',data:{hasResult:!!result},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
    } catch {}
    // #endregion
    return result.toUIMessageStreamResponse()
  } catch (error: any) {
    console.error("OpenAI chat error:", error)
    console.error("Error details:", error.stack || error.message)
    // #region agent log
    try {
      await fetch('http://127.0.0.1:7242/ingest/a0691e2c-cdd7-47b0-9342-76cf3ac06d2f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'chat/route.ts:296',message:'Chat API error',data:{error:error.message,stack:error.stack?.substring(0,200),type:error.constructor.name},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
    } catch {}
    // #endregion
    return new Response(
      JSON.stringify({ 
        error: "Chat failed",
        message: error.message || "Failed to generate response",
        details: error.toString()
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    )
  }
}
