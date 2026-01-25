import express from 'express'
import { supabase } from '../lib/supabase'
import { Client, TravelMode } from '@googlemaps/google-maps-services-js'

const router = express.Router()
const googleMapsClient = new Client({})

/**
 * POST /api/polling-unit/validate
 * Validates a polling unit code
 */
router.post('/validate', async (req, res, next) => {
  try {
    const { code } = req.body

    if (!code || typeof code !== 'string') {
      return res.status(400).json({
        valid: false,
        error: 'Polling unit code is required',
      })
    }

    // Normalize the code format (handle different input formats)
    let normalizedCode = code.trim()
    
    // Handle formats like "08-001", "08001", "8-1", etc.
    if (!normalizedCode.includes('-')) {
      // If no dash, assume it's 5 digits: "08001"
      if (/^\d{5}$/.test(normalizedCode)) {
        normalizedCode = `${normalizedCode.substring(0, 2)}-${normalizedCode.substring(2, 5)}`
      } else if (/^\d{1,2}\d{1,3}$/.test(normalizedCode)) {
        // Handle "81" -> "08-001"
        const match = normalizedCode.match(/^(\d{1,2})(\d{1,3})$/)
        if (match) {
          normalizedCode = `${match[1].padStart(2, '0')}-${match[2].padStart(3, '0')}`
        }
      }
    } else {
      // Format with dash: "08-001" or "8-1"
      const parts = normalizedCode.split('-')
      if (parts.length === 2) {
        normalizedCode = `${parts[0].padStart(2, '0')}-${parts[1].padStart(3, '0')}`
      }
    }

    // Try exact match first
    let { data: pollingUnit, error } = await supabase
      .from('polling_units')
      .select('*, ward:wards(*)')
      .eq('code', normalizedCode)
      .single()

    // If not found, try searching by code pattern (last 5 digits)
    if (error || !pollingUnit) {
      // Extract last 5 digits from code if it's longer
      const digits = normalizedCode.replace(/\D/g, '')
      if (digits.length >= 5) {
        const lastFive = digits.slice(-5)
        const searchPattern = `%-${lastFive.slice(-3)}` // Search for codes ending with the polling unit part
        
        const { data: units, error: searchError } = await supabase
          .from('polling_units')
          .select('*, ward:wards(*)')
          .like('code', searchPattern)
          .limit(10)

        if (!searchError && units && units.length > 0) {
          // Find the one that matches the ward code too
          const wardCode = lastFive.substring(0, 2)
          pollingUnit = units.find((pu: any) => {
            const puWardCode = pu.code.split('-')[0]
            return puWardCode === wardCode
          }) || units[0]
          error = null
        }
      }
    }

    if (error || !pollingUnit) {
      return res.json({
        valid: false,
        error: 'Polling unit not found. Please check your code and try again.',
        suggestedFormat: 'Use format: Ward-PollingUnit (e.g., 08-001)',
      })
    }

    res.json({
      valid: true,
      pollingUnit: {
        id: pollingUnit.id,
        code: pollingUnit.code,
        name: pollingUnit.name,
        address: pollingUnit.address,
        latitude: pollingUnit.latitude,
        longitude: pollingUnit.longitude,
        registered_voters: pollingUnit.registered_voters || 0,
        ward: pollingUnit.ward ? {
          id: pollingUnit.ward.id,
          code: pollingUnit.ward.code,
          name: pollingUnit.ward.name,
        } : null,
      },
    })
  } catch (error: any) {
    next(error)
  }
})

/**
 * GET /api/polling-unit/:code
 * Returns polling unit location and metadata
 */
router.get('/:code', async (req, res, next) => {
  try {
    const { code } = req.params

    const { data: pollingUnit, error } = await supabase
      .from('polling_units')
      .select('*, ward:wards(*)')
      .eq('code', code)
      .single()

    if (error || !pollingUnit) {
      return res.status(404).json({ error: 'Polling unit not found' })
    }

    res.json(pollingUnit)
  } catch (error: any) {
    next(error)
  }
})

/**
 * POST /api/navigation
 * Returns walking route, distance, time, and landmarks
 */
router.post('/navigation', async (req, res, next) => {
  try {
    const { pollingUnitCode, userLat, userLng, language = 'en' } = req.body

    // Validate inputs
    if (!pollingUnitCode) {
      return res.status(400).json({ error: 'Polling unit code is required' })
    }

    if (!userLat || !userLng || typeof userLat !== 'number' || typeof userLng !== 'number') {
      return res.status(400).json({ error: 'Valid user location (latitude, longitude) required' })
    }

    if (!process.env.GOOGLE_MAPS_API_KEY) {
      return res.status(500).json({ error: 'Google Maps API key not configured' })
    }

    // Get polling unit from database
    const { data: pollingUnit, error: puError } = await supabase
      .from('polling_units')
      .select('*, ward:wards(*)')
      .eq('code', pollingUnitCode)
      .single()

    if (puError || !pollingUnit) {
      return res.status(404).json({ error: 'Polling unit not found' })
    }

    const pu = pollingUnit
    if (!pu.latitude || !pu.longitude) {
      return res.status(400).json({ error: 'Polling unit location not available' })
    }

    const destination = {
      lat: pu.latitude,
      lng: pu.longitude,
    }

    // Get walking directions from Google Maps
    const directionsResponse = await googleMapsClient.directions({
      params: {
        origin: `${userLat},${userLng}`,
        destination: `${destination.lat},${destination.lng}`,
        mode: TravelMode.walking,
        key: process.env.GOOGLE_MAPS_API_KEY,
      },
    })

    if (directionsResponse.data.status !== 'OK') {
      return res.status(400).json({
        error: 'Could not calculate route',
        status: directionsResponse.data.status,
      })
    }

    const route = directionsResponse.data.routes[0]
    const leg = route.legs[0]

    // Extract navigation steps
    const steps = route.legs[0].steps.map((step: any) => ({
      instruction: step.html_instructions,
      distance: step.distance.text,
      duration: step.duration.text,
      startLocation: {
        lat: step.start_location.lat,
        lng: step.start_location.lng,
      },
      endLocation: {
        lat: step.end_location.lat,
        lng: step.end_location.lng,
      },
    }))

    // Get nearby landmarks using Google Places API
    // Note: placesNearby requires different parameter structure
    let landmarks: any[] = []
    
    try {
      const placesResponse = await googleMapsClient.placesNearby({
        params: {
          location: `${destination.lat},${destination.lng}`,
          radius: 500, // 500 meters
          type: 'school', // Search for schools first
          key: process.env.GOOGLE_MAPS_API_KEY,
        },
      })

      // Process results
      landmarks = (placesResponse.data.results || [])
        .slice(0, 3) // Limit to 3 schools
        .map((place: any) => ({
          name: place.name,
          address: place.vicinity || '',
          latitude: place.geometry.location.lat,
          longitude: place.geometry.location.lng,
          types: place.types || [],
          rating: place.rating,
        }))

      // Also search for other establishment types
      try {
        const morePlaces = await googleMapsClient.placesNearby({
          params: {
            location: `${destination.lat},${destination.lng}`,
            radius: 500,
            type: 'establishment',
            key: process.env.GOOGLE_MAPS_API_KEY,
          },
        })

        const additional = (morePlaces.data.results || [])
          .filter((place: any) => {
            const types = place.types || []
            return (
              types.includes('store') ||
              types.includes('supermarket') ||
              types.includes('bus_station') ||
              types.includes('church')
            )
          })
          .slice(0, 2)
          .map((place: any) => ({
            name: place.name,
            address: place.vicinity || '',
            latitude: place.geometry.location.lat,
            longitude: place.geometry.location.lng,
            types: place.types || [],
            rating: place.rating,
          }))

        landmarks = [...landmarks, ...additional].slice(0, 5)
      } catch (err) {
        // If second search fails, continue with schools only
        console.warn('Secondary places search failed:', err)
      }
    } catch (error) {
      // If Places API fails, continue without landmarks
      console.warn('Places API search failed:', error)
      landmarks = []
    }

    // Generate AI-ready navigation steps (simple, landmark-based)
    const navigationSteps = generateNavigationSteps(steps, landmarks, language)

    res.json({
      pollingUnit: {
        code: pu.code,
        name: pu.name,
        address: pu.address,
        ward: pu.ward?.name,
        location: destination,
      },
      route: {
        distance: leg.distance.text,
        distanceMeters: leg.distance.value,
        duration: leg.duration.text,
        durationSeconds: leg.duration.value,
        polyline: route.overview_polyline.points,
      },
      steps: navigationSteps,
      landmarks,
      rawSteps: steps, // For map rendering
    })
  } catch (error: any) {
    next(error)
  }
})

/**
 * Generate simple, landmark-based navigation instructions
 * Avoids compass directions, uses landmarks instead
 */
function generateNavigationSteps(
  steps: any[],
  landmarks: any[],
  language: string
): string[] {
  const instructions: string[] = []

  // Language-specific templates
  const templates: Record<string, any> = {
    en: {
      start: 'Start from your current location.',
      continue: 'Continue straight ahead.',
      turn: (direction: string) => `Turn ${direction}.`,
      landmark: (name: string) => `You will pass ${name} on your way.`,
      near: (name: string) => `You are near ${name}.`,
      arrive: 'You have arrived at your polling unit.',
    },
    yo: {
      start: 'Bẹrẹ lati ipo re lọwọlọwọ.',
      continue: 'Tẹle siwaju.',
      turn: (direction: string) => `Yipada ${direction}.`,
      landmark: (name: string) => `O yoo kọja ${name} lori ọna re.`,
      near: (name: string) => `O wa nito si ${name}.`,
      arrive: 'O ti de ibi idibo re.',
    },
    pcm: {
      start: 'Start from where you dey now.',
      continue: 'Continue go straight.',
      turn: (direction: string) => `Turn ${direction}.`,
      landmark: (name: string) => `You go pass ${name} for your way.`,
      near: (name: string) => `You dey near ${name}.`,
      arrive: 'You don reach your polling unit.',
    },
  }

  const t = templates[language] || templates.en

  // Add start instruction
  instructions.push(t.start)

  // Process steps and convert to simple language
  steps.forEach((step, index) => {
    const instruction = step.instruction
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .toLowerCase()

    // Check for landmarks mentioned in instruction
    const mentionedLandmark = landmarks.find((lm) =>
      instruction.includes(lm.name.toLowerCase())
    )

    if (mentionedLandmark) {
      instructions.push(t.landmark(mentionedLandmark.name))
    }

    // Simplify turn instructions
    if (instruction.includes('turn left')) {
      instructions.push(t.turn('left'))
    } else if (instruction.includes('turn right')) {
      instructions.push(t.turn('right'))
    } else if (instruction.includes('continue') || instruction.includes('head')) {
      if (index < steps.length - 1) {
        instructions.push(t.continue)
      }
    }
  })

  // Add arrival instruction
  instructions.push(t.arrive)

  return instructions
}

export default router

