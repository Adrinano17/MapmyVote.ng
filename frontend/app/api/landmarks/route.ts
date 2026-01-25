import { NextRequest, NextResponse } from "next/server"

interface RoutePoint {
  lat: number
  lng: number
}

interface Landmark {
  name: string
  latitude: number
  longitude: number
  category: string
  distance?: number
}

/**
 * Calculate distance between two points in meters (Haversine formula)
 */
function calculateDistance(
  point1: { lat: number; lng: number },
  point2: { lat: number; lng: number }
): number {
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
 * Sample points along a route at regular intervals
 */
function sampleRoutePoints(points: RoutePoint[], intervalMeters: number): RoutePoint[] {
  if (points.length < 2) return points

  const sampled: RoutePoint[] = [points[0]]
  let accumulatedDistance = 0

  for (let i = 1; i < points.length; i++) {
    const segmentDistance = calculateDistance(points[i - 1], points[i])
    accumulatedDistance += segmentDistance

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
 * Extract landmarks along a route using Overpass API (OpenStreetMap)
 * This is a free alternative to Google Places API
 */
async function extractLandmarksAlongRoute(
  routePoints: RoutePoint[],
  radius: number = 50
): Promise<Landmark[]> {
  const landmarks: Landmark[] = []
  const seenNames = new Set<string>()

  // Sample points along the route (every 100m)
  const samplePoints = sampleRoutePoints(routePoints, 100)

  // Priority landmark types
  const priorityTypes = [
    { type: "school", category: "school" },
    { type: "place_of_worship", category: "mosque" }, // Will be filtered by name/type
    { type: "place_of_worship", category: "church" },
    { type: "marketplace", category: "market" },
    { type: "bus_station", category: "bus_stop" },
    { type: "hospital", category: "hospital" },
    { type: "bank", category: "bank" },
  ]

  // For now, return empty array - landmarks can be added later via Overpass API
  // or by integrating with a places service
  // This prevents the 404 error while keeping the code structure
  
  return landmarks
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { routePoints, radius } = body

    if (!routePoints || !Array.isArray(routePoints) || routePoints.length < 2) {
      return NextResponse.json(
        { error: "Route points array with at least 2 points is required" },
        { status: 400 }
      )
    }

    const landmarks = await extractLandmarksAlongRoute(routePoints, radius || 50)

    return NextResponse.json({
      landmarks,
      count: landmarks.length,
    })
  } catch (error) {
    console.error("Landmarks API error:", error)
    return NextResponse.json(
      { error: "Failed to get landmarks", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}





