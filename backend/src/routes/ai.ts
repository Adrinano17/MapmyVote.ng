import express from 'express'
import { supabase } from '../lib/supabase'
import OpenAI from 'openai'

const router = express.Router()

// Initialize OpenAI client (optional - can use simpler text generation)
const openai = process.env.OPENAI_API_KEY 
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null

router.post('/guidance', async (req, res, next) => {
  try {
    const { pollingUnitId, pollingUnitCode, userLocation, language = 'en' } = req.body

    if ((!pollingUnitId && !pollingUnitCode) || !userLocation) {
      return res.status(400).json({ error: 'Polling unit identifier and user location are required' })
    }

    // Get polling unit details
    const query = supabase
      .from('polling_units')
      .select('*, ward:wards(*)')
    
    if (pollingUnitId) {
      query.eq('id', pollingUnitId)
    } else {
      query.eq('code', pollingUnitCode)
    }

    const { data: pollingUnit, error: puError } = await query.single()

    if (puError || !pollingUnit) {
      return res.status(404).json({ error: 'Polling unit not found' })
    }

    const pu = pollingUnit

    // Generate AI guidance
    let guidance: string

    if (openai) {
      // Use OpenAI for natural language generation
      const prompt = generatePrompt(pu, userLocation, language)
      
      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant providing navigation guidance to voters in Nigeria. Use landmarks and local context to give clear, friendly directions.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: 300,
        temperature: 0.7,
      })

      guidance = completion.choices[0]?.message?.content || generateFallbackGuidance(pu, language)
    } else {
      // Fallback to template-based guidance
      guidance = generateFallbackGuidance(pu, language)
    }

    res.json({ guidance })
  } catch (error) {
    next(error)
  }
})

function generatePrompt(pu: any, userLocation: any, language: string): string {
  const langNames: Record<string, string> = {
    en: 'English',
    yo: 'Yoruba',
    pcm: 'Nigerian Pidgin',
  }

  return `Generate friendly navigation guidance in ${langNames[language] || 'English'} for a voter in Ibadan, Nigeria.

Polling Unit: ${pu.name}
Address: ${pu.address || 'Not specified'}
Location: ${pu.latitude}, ${pu.longitude}
Ward: ${pu.ward?.name || 'Unknown'}

User's current location: ${userLocation.lat}, ${userLocation.lng}

Provide clear, conversational directions using landmarks and local context. Be friendly and helpful.`
}

function generateFallbackGuidance(pu: any, language: string): string {
  const templates: Record<string, string> = {
    en: `To reach ${pu.name}, head towards the polling unit located at ${pu.address || 'the specified location'}. 
Follow the main road and look for the polling unit signage. If you need help, ask locals for directions to ${pu.name}.`,
    
    yo: `Lati de ${pu.name}, lọ si ibi idibo ti o wa ni ${pu.address || 'ipo ti a ti sọ'}. 
Tẹle ọna nla ki o wa aami ibi idibo. Ti o ba nilo iranlọwọ, beere awọn eniyan agbegbe fun itọsọna si ${pu.name}.`,
    
    pcm: `To reach ${pu.name}, go to the polling unit wey dey for ${pu.address || 'the place wey we mention'}. 
Follow the main road and look for the polling unit sign. If you need help, ask people around for direction to ${pu.name}.`,
  }

  return templates[language] || templates.en
}

export default router





