/**
 * Mapbox Navigation Utilities
 * Handles opening Mapbox directions and navigation
 */

/**
 * Open Mapbox directions in a new window
 * Uses Mapbox's web navigation URL format
 */
export function openMapboxDirections(
  destination: { lat: number; lng: number },
  origin?: { lat: number; lng: number }
): void {
  const accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || "pk.eyJ1IjoiYWRyaW5hbm8iLCJhIjoiY21rZmoxdXg2MGNvbTNlb2FvaDl1a3Z2aiJ9.ZpxI0XxvsEw2QtCIxN1E2Q"
  
  // Mapbox web navigation URL format
  // Format: https://api.mapbox.com/directions/v5/mapbox/walking/{coordinates}?access_token={token}
  let url: string
  
  if (origin) {
    // With origin: walking directions from origin to destination
    url = `https://api.mapbox.com/directions/v5/mapbox/walking/${origin.lng},${origin.lat};${destination.lng},${destination.lat}?geometries=geojson&steps=true&access_token=${accessToken}`
    
    // For web display, use Mapbox Studio or embed
    // Alternative: Use Mapbox GL JS to show directions inline
    // For now, we'll use a simple map link that centers on destination
    url = `https://api.mapbox.com/styles/v1/mapbox/streets-v12/static/pin-s+3b82f6(${destination.lng},${destination.lat})/${destination.lng},${destination.lat},14,0/800x600?access_token=${accessToken}`
  } else {
    // Just destination: show static map centered on destination
    url = `https://api.mapbox.com/styles/v1/mapbox/streets-v12/static/pin-s+3b82f6(${destination.lng},${destination.lat})/${destination.lng},${destination.lat},14,0/800x600?access_token=${accessToken}`
  }
  
  // For better UX, we'll navigate to the map page with the destination
  // This allows users to see the full interactive map
  const mapUrl = `/map?lat=${destination.lat}&lng=${destination.lng}`
  window.location.href = mapUrl
}

/**
 * Get Mapbox directions URL for embedding or sharing
 */
export function getMapboxDirectionsUrl(
  destination: { lat: number; lng: number },
  origin?: { lat: number; lng: number }
): string {
  const accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || "pk.eyJ1IjoiYWRyaW5hbm8iLCJhIjoiY21rZmoxdXg2MGNvbTNlb2FvaDl1a3Z2aiJ9.ZpxI0XxvsEw2QtCIxN1E2Q"
  
  if (origin) {
    return `https://api.mapbox.com/directions/v5/mapbox/walking/${origin.lng},${origin.lat};${destination.lng},${destination.lat}?geometries=geojson&steps=true&access_token=${accessToken}`
  }
  
  // Return map page URL with destination coordinates
  return `/map?lat=${destination.lat}&lng=${destination.lng}`
}

/**
 * Navigate to map page with polling unit selected
 */
export function navigateToMapWithPollingUnit(
  pollingUnit: { latitude: number; longitude: number; code?: string; name?: string }
): void {
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/a0691e2c-cdd7-47b0-9342-76cf3ac06d2f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'mapbox-navigation.ts:59',message:'navigateToMapWithPollingUnit called',data:{hasLat:!!pollingUnit.latitude,hasLng:!!pollingUnit.longitude,code:pollingUnit.code,name:pollingUnit.name},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
  // #endregion
  
  const params = new URLSearchParams({
    lat: pollingUnit.latitude.toString(),
    lng: pollingUnit.longitude.toString(),
  })
  
  if (pollingUnit.code) {
    params.append("code", pollingUnit.code)
  }
  
  // Route to direction page with polling unit code
  const mapUrl = pollingUnit.code 
    ? `/direction?code=${pollingUnit.code}`
    : `/map?${params.toString()}`
  
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/a0691e2c-cdd7-47b0-9342-76cf3ac06d2f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'mapbox-navigation.ts:72',message:'Redirecting to direction page',data:{url:mapUrl,params:params.toString(),hasCode:!!pollingUnit.code},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
  // #endregion
  
  window.location.href = mapUrl
}




