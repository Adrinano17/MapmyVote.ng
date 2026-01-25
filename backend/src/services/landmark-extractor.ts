/**
 * Landmark Extraction Service
 * Extracts landmarks along a route using Google Places API
 * Prioritizes: schools, mosques, churches, markets, bus stops
 */

import { Client } from '@googlemaps/google-maps-services-js'

const client = new Client({})

export interface Landmark {
  name: string
  address?: string
  latitude: number
  longitude: number
  types: string[]
  distance?: number // Distance from route in meters
  category: 'school' | 'mosque' | 'church' | 'market' | 'bus_stop' | 'other'
}

export interface RoutePoint {
  lat: number
  lng: number
}

/**
 * Extract landmarks along a route
 * @param routePoints Array of points along the route
 * @param radius Search radius in meters (default: 50)
 * @returns Array of landmarks ordered by encounter along route
 */
export async function extractLandmarksAlongRoute(
  routePoints: RoutePoint[],
  radius: number = 50
): Promise<Landmark[]> {
  if (!process.env.GOOGLE_MAPS_API_KEY) {
    console.warn('Google Maps API key not configured')
    return []
  }

  const landmarks: Landmark[] = []
  const seenNames = new Set<string>()

  // Priority order for landmark types
  const priorityTypes = [
    { type: 'school', category: 'school' as const },
    { type: 'mosque', category: 'mosque' as const },
    { type: 'church', category: 'church' as const },
    { type: 'supermarket', category: 'market' as const },
    { type: 'bus_station', category: 'bus_stop' as const },
    { type: 'establishment', category: 'other' as const },
  ]

  // Sample points along the route (every 100 meters or so)
  const samplePoints = sampleRoutePoints(routePoints, 100)

  for (const point of samplePoints) {
    for (const { type, category } of priorityTypes) {
      try {
        const response = await client.placesNearby({
          params: {
            location: `${point.lat},${point.lng}`,
            radius,
            type: type as any,
            key: process.env.GOOGLE_MAPS_API_KEY || '',
          },
        })

        if (response.data.results) {
          for (const place of response.data.results) {
            const name = place.name || 'Unknown'
            
            // Skip if we've already seen this landmark
            if (seenNames.has(name)) continue
            seenNames.add(name)

            const landmark: Landmark = {
              name,
              address: place.vicinity || place.formatted_address,
              latitude: place.geometry.location.lat,
              longitude: place.geometry.location.lng,
              types: place.types || [],
              category,
              distance: calculateDistance(point, {
                lat: place.geometry.location.lat,
                lng: place.geometry.location.lng,
              }),
            }

            landmarks.push(landmark)
          }
        }

        // Limit to avoid too many API calls
        if (landmarks.length >= 10) break
      } catch (error) {
        console.warn(`Failed to fetch ${type} landmarks:`, error)
        // Continue with next type
      }
    }

    if (landmarks.length >= 10) break
  }

  // Sort by distance along route and remove duplicates
  return deduplicateLandmarks(landmarks)
}

/**
 * Sample points along a route at regular intervals
 */
function sampleRoutePoints(points: RoutePoint[], intervalMeters: number): RoutePoint[] {
  if (points.length <= 1) return points

  const sampled: RoutePoint[] = [points[0]]
  let accumulatedDistance = 0

  for (let i = 1; i < points.length; i++) {
    const distance = calculateDistance(points[i - 1], points[i])
    accumulatedDistance += distance

    if (accumulatedDistance >= intervalMeters) {
      sampled.push(points[i])
      accumulatedDistance = 0
    }
  }

  // Always include the last point
  if (sampled[sampled.length - 1] !== points[points.length - 1]) {
    sampled.push(points[points.length - 1])
  }

  return sampled
}

/**
 * Calculate distance between two points in meters (Haversine formula)
 */
function calculateDistance(point1: RoutePoint, point2: RoutePoint): number {
  const R = 6371e3 // Earth radius in meters
  const φ1 = (point1.lat * Math.PI) / 180
  const φ2 = (point2.lat * Math.PI) / 180
  const Δφ = ((point2.lat - point1.lat) * Math.PI) / 180
  const Δλ = ((point2.lng - point1.lng) * Math.PI) / 180

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return R * c
}

/**
 * Remove duplicate landmarks (same name within 50 meters)
 */
function deduplicateLandmarks(landmarks: Landmark[]): Landmark[] {
  const unique: Landmark[] = []
  const seen = new Set<string>()

  for (const landmark of landmarks) {
    const key = `${landmark.name.toLowerCase()}-${Math.round(landmark.latitude * 1000)}-${Math.round(landmark.longitude * 1000)}`
    
    if (!seen.has(key)) {
      seen.add(key)
      unique.push(landmark)
    }
  }

  return unique
}

/**
 * Get landmarks near a specific point (for arrival confirmation)
 */
export async function getLandmarksNearPoint(
  point: RoutePoint,
  radius: number = 100
): Promise<Landmark[]> {
  if (!process.env.GOOGLE_MAPS_API_KEY) {
    return []
  }

  const landmarks: Landmark[] = []

  try {
    const response = await client.placesNearby({
      params: {
        location: `${point.lat},${point.lng}`,
        radius,
        key: process.env.GOOGLE_MAPS_API_KEY || '',
      },
    })

    if (response.data.results) {
      for (const place of response.data.results) {
        const types = place.types || []
        let category: Landmark['category'] = 'other'

        if (types.includes('school')) category = 'school'
        else if (types.includes('mosque')) category = 'mosque'
        else if (types.includes('church')) category = 'church'
        else if (types.includes('supermarket') || types.includes('market')) category = 'market'
        else if (types.includes('bus_station') || types.includes('transit_station'))
          category = 'bus_stop'

        landmarks.push({
          name: place.name || 'Unknown',
          address: place.vicinity || place.formatted_address,
          latitude: place.geometry.location.lat,
          longitude: place.geometry.location.lng,
          types,
          category,
        })
      }
    }
  } catch (error) {
    console.error('Failed to fetch landmarks:', error)
  }

  return landmarks.slice(0, 5) // Limit to 5
}

