import { NextRequest, NextResponse } from "next/server"
import { adjustDurationForNigeria } from "@/lib/map-utils"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { origin, destination } = body

    console.log("Directions API request:", {
      origin: { lat: origin?.lat, lng: origin?.lng },
      destination: { lat: destination?.lat, lng: destination?.lng },
      profile: "walking"
    })

    if (!origin || !destination) {
      return NextResponse.json(
        { error: "Origin and destination are required" },
        { status: 400 }
      )
    }

    const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN
    
    if (!mapboxToken) {
      console.error("Mapbox token missing")
      return NextResponse.json(
        { error: "Mapbox access token not configured" },
        { status: 500 }
      )
    }

    // Mapbox Directions API - Using walking profile for pedestrian navigation
    // Format: /directions/v5/{profile}/{coordinates}
    // coordinates format: {longitude},{latitude};{longitude},{latitude}
    // Profile options: driving, walking, cycling
    // Add steps=true to get detailed turn-by-turn instructions
    const url = `https://api.mapbox.com/directions/v5/mapbox/walking/${origin.lng},${origin.lat};${destination.lng},${destination.lat}?geometries=polyline&steps=true&access_token=${mapboxToken}`
    
    console.log("Calling Mapbox Directions API (walking profile):", url.replace(mapboxToken, "TOKEN_HIDDEN"))
    
    const response = await fetch(url)
    const data = await response.json()

    console.log("Mapbox Directions API response:", {
      code: data.code,
      hasRoutes: !!data.routes,
      routeCount: data.routes?.length || 0,
      hasGeometry: !!data.routes?.[0]?.geometry,
      hasLegs: !!data.routes?.[0]?.legs,
      hasSteps: !!data.routes?.[0]?.legs?.[0]?.steps,
      stepsCount: data.routes?.[0]?.legs?.[0]?.steps?.length || 0,
      firstStepManeuver: data.routes?.[0]?.legs?.[0]?.steps?.[0]?.maneuver?.type,
    })

    if (data.code !== "Ok") {
      console.error("Mapbox Directions API error:", data)
      return NextResponse.json(
        { error: data.message || "Directions API error", code: data.code },
        { status: 400 }
      )
    }

    if (!data.routes || data.routes.length === 0) {
      console.error("No routes returned from Mapbox")
      return NextResponse.json(
        { error: "No routes found" },
        { status: 404 }
      )
    }

    // Transform Mapbox response to match expected Google Maps format
    const route = data.routes[0]
    const leg = route.legs[0]
    
    // Apply Nigerian correction factor to duration for more accurate local estimates
    // Accounts for: crowd density, narrow streets, markets, unpaved roads
    const adjustedDuration = adjustDurationForNigeria(leg.duration)
    
    // Mapbox returns geometry as encoded polyline string when geometries=polyline
    // This is compatible with Google's polyline encoding (same algorithm)
    const polylineString = route.geometry
    
    console.log("Transformed response:", {
      hasPolyline: !!polylineString,
      polylineLength: polylineString?.length || 0,
      distance: leg.distance,
      duration: leg.duration,
      adjustedDuration: adjustedDuration,
    })
    
    return NextResponse.json({
      routes: [{
        legs: [{
          distance: { value: leg.distance, text: `${(leg.distance / 1000).toFixed(1)} km` },
          duration: { value: adjustedDuration, text: `${Math.round(adjustedDuration / 60)} min` },
          end_location: { lat: destination.lat, lng: destination.lng },
          start_location: { lat: origin.lat, lng: origin.lng },
          steps: (leg.steps || []).map((step: any, index: number) => {
            const stepLocation = step.maneuver?.location || (index === 0 ? [origin.lng, origin.lat] : [destination.lng, destination.lat])
            const maneuver = step.maneuver || {}
            
            // Extract maneuver type and modifier for turn-by-turn navigation
            const maneuverType = maneuver.type || 'straight'
            const modifier = maneuver.modifier || ''
            const instruction = maneuver.instruction || ''
            
            // Calculate cumulative distance from start
            const cumulativeDistance = leg.steps?.slice(0, index + 1).reduce((sum: number, s: any) => sum + (s.distance || 0), 0) || 0
            
            return {
              start_location: { lat: stepLocation[1], lng: stepLocation[0] },
              end_location: { 
                lat: step.maneuver?.location?.[1] || stepLocation[1], 
                lng: step.maneuver?.location?.[0] || stepLocation[0] 
              },
              distance: { value: step.distance, text: `${(step.distance / 1000).toFixed(1)} km` },
              duration: { value: adjustDurationForNigeria(step.duration), text: `${Math.round(adjustDurationForNigeria(step.duration) / 60)} min` },
              html_instructions: instruction,
              maneuver: {
                type: maneuverType,
                modifier: modifier,
                instruction: instruction,
                location: stepLocation
              },
              // Add cumulative distance for tracking user position along route
              cumulative_distance: cumulativeDistance
            }
          }) || []
        }],
        overview_polyline: {
          points: polylineString
        }
      }]
    })
  } catch (error) {
    console.error("Directions API error:", error)
    return NextResponse.json(
      { error: "Failed to get directions", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}

