/**
 * Map utility functions for distance calculation and formatting
 * Optimized for Nigerian context (Ibadan North LGA)
 */

export interface Coordinates {
  lat: number
  lng: number
}

/**
 * Speed constants optimized for Nigerian urban context
 * Based on real-world conditions in Ibadan (narrow streets, market congestion, etc.)
 */
export const SPEEDS = {
  /** Walking speed: 4 km/h (adjusted for Nigerian urban conditions) */
  WALKING_KMH: 4,
  /** Driving speed for short trips (< 2km): 20 km/h (accounting for traffic/roadblocks) */
  DRIVING_SHORT_KMH: 20,
  /** Driving speed for longer trips: 30 km/h (conservative for election day conditions) */
  DRIVING_LONG_KMH: 30,
} as const

/**
 * Correction factor to apply to Mapbox duration for Nigerian reality
 * Accounts for: crowd density, narrow streets, markets, unpaved roads
 */
export const NIGERIAN_CORRECTION_FACTOR = 1.15

/**
 * Calculate distance between two coordinates using Haversine formula
 * Returns distance in meters (straight-line / "as the crow flies")
 */
export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371e3 // Earth radius in meters
  const φ1 = (lat1 * Math.PI) / 180
  const φ2 = (lat2 * Math.PI) / 180
  const Δφ = ((lat2 - lat1) * Math.PI) / 180
  const Δλ = ((lng2 - lng1) * Math.PI) / 180

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return R * c
}

/**
 * Estimate travel time based on distance and mode
 * Uses Nigerian-optimized speeds and special handling for short distances
 */
export function estimateTravelTime(
  distanceMeters: number,
  mode: "walking" | "driving"
): number {
  const distanceKm = distanceMeters / 1000

  // Special handling for very short distances (< 500m)
  // Real walking behavior: ~1 minute per 60 meters
  if (distanceMeters < 500 && mode === "walking") {
    return Math.ceil(distanceMeters / 60) // minutes
  }

  // Determine speed based on mode and distance
  const speedKmPerHour =
    mode === "walking"
      ? SPEEDS.WALKING_KMH
      : distanceKm < 2
        ? SPEEDS.DRIVING_SHORT_KMH
        : SPEEDS.DRIVING_LONG_KMH

  // Calculate time in minutes
  const timeMinutes = Math.round((distanceKm / speedKmPerHour) * 60)
  return Math.max(1, timeMinutes) // At least 1 minute
}

/**
 * Apply Nigerian correction factor to Mapbox duration
 * This adjusts Western-centric walking times to Nigerian urban reality
 */
export function adjustDurationForNigeria(seconds: number): number {
  return Math.round(seconds * NIGERIAN_CORRECTION_FACTOR)
}

/**
 * Format distance in a human-readable way
 */
export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)}m`
  }
  return `${(meters / 1000).toFixed(1)}km`
}

/**
 * Format distance with clear labeling for straight-line distances
 * Use this when displaying Haversine (not route) distances
 */
export function formatStraightLineDistance(meters: number): string {
  const distance = formatDistance(meters)
  return `~${distance} (straight-line)`
}

/**
 * Format duration in a human-readable way
 */
export function formatDuration(seconds: number): string {
  const minutes = Math.round(seconds / 60)
  if (minutes < 60) {
    return `${minutes} min`
  }
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  if (remainingMinutes === 0) {
    return `${hours} hr`
  }
  return `${hours} hr ${remainingMinutes} min`
}

/**
 * Format duration with uncertainty range (builds trust)
 * Shows "about X-Y minutes" instead of exact time
 */
export function formatDurationWithRange(seconds: number): string {
  const minutes = Math.round(seconds / 60)
  
  // Calculate range (±15% or minimum ±2 minutes)
  const range = Math.max(2, Math.round(minutes * 0.15))
  const minMinutes = Math.max(1, minutes - range)
  const maxMinutes = minutes + range

  if (minutes < 60) {
    if (minMinutes === maxMinutes) {
      return `about ${minutes} minutes`
    }
    return `about ${minMinutes}–${maxMinutes} minutes`
  }
  
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  if (remainingMinutes === 0) {
    return `about ${hours} hour${hours > 1 ? "s" : ""}`
  }
  return `about ${hours} hr ${remainingMinutes} min`
}

/**
 * Calculate travel time and distance with best-practice logic
 * Returns both route-based (if available) and fallback estimates
 */
export interface TravelEstimate {
  /** Distance in meters (route distance if available, otherwise straight-line) */
  distanceMeters: number
  /** Time in minutes */
  timeMinutes: number
  /** Whether this is a route-based estimate (true) or fallback (false) */
  isRouteBased: boolean
  /** Whether distance is straight-line (true) or route-based (false) */
  isStraightLine: boolean
  /** Formatted distance string */
  distanceText: string
  /** Formatted time string with uncertainty */
  timeText: string
}

export function calculateTravelEstimate(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
  mode: "walking" | "driving",
  mapboxDuration?: number, // Mapbox duration in seconds (if available)
  mapboxDistance?: number // Mapbox distance in meters (if available)
): TravelEstimate {
  // Use Mapbox route data if available (most accurate)
  if (mapboxDistance !== undefined && mapboxDuration !== undefined) {
    const adjustedDuration = adjustDurationForNigeria(mapboxDuration)
    return {
      distanceMeters: mapboxDistance,
      timeMinutes: Math.round(adjustedDuration / 60),
      isRouteBased: true,
      isStraightLine: false,
      distanceText: formatDistance(mapboxDistance),
      timeText: formatDurationWithRange(adjustedDuration),
    }
  }

  // Fallback: Use Haversine distance with estimated time
  const straightLineDistance = calculateDistance(lat1, lng1, lat2, lng2)
  const estimatedTime = estimateTravelTime(straightLineDistance, mode)

  return {
    distanceMeters: straightLineDistance,
    timeMinutes: estimatedTime,
    isRouteBased: false,
    isStraightLine: true,
    distanceText: formatStraightLineDistance(straightLineDistance),
    timeText: `about ${estimatedTime}–${estimatedTime + 2} minutes`,
  }
}

/**
 * Ibadan North LGA center coordinates
 */
export const IBADAN_NORTH_CENTER = {
  lat: 7.4,
  lng: 3.91,
  zoom: 13,
}












