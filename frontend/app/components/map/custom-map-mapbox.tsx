"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import mapboxgl from "mapbox-gl"
import "mapbox-gl/dist/mapbox-gl.css"
import type { PollingUnit, Ward } from "@/lib/types"

interface CustomMapMapboxProps {
  pollingUnits: (PollingUnit & { ward?: Ward })[]
  userLocation?: { latitude: number; longitude: number }
  selectedPollingUnit?: PollingUnit & { ward?: Ward }
  routePolyline?: string // Encoded polyline string
  landmarks?: Array<{ name: string; latitude: number; longitude: number; category: string }>
  center?: [number, number]
  zoom?: number
  simpleMode?: boolean
  onMarkerClick?: (pollingUnit: PollingUnit & { ward?: Ward }) => void
}

export function CustomMapMapbox({
  pollingUnits,
  userLocation,
  selectedPollingUnit,
  routePolyline,
  landmarks,
  center = [3.91, 7.4], // [lng, lat] for Mapbox - Ibadan North LGA
  zoom = 13,
  simpleMode = false,
  onMarkerClick,
}: CustomMapMapboxProps) {
  // #region agent log
  useEffect(() => {
    if (typeof window !== 'undefined') {
      fetch('http://127.0.0.1:7242/ingest/a0691e2c-cdd7-47b0-9342-76cf3ac06d2f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'custom-map-mapbox.tsx:30',message:'CustomMapMapbox component mounted',data:{hasPollingUnits:!!pollingUnits?.length,hasUserLocation:!!userLocation,hasRoutePolyline:!!routePolyline,hasMapContainer:!!mapContainer.current},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
    }
    return () => {
      if (typeof window !== 'undefined') {
        fetch('http://127.0.0.1:7242/ingest/a0691e2c-cdd7-47b0-9342-76cf3ac06d2f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'custom-map-mapbox.tsx:35',message:'CustomMapMapbox component unmounting',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
      }
    }
  }, [])
  // #endregion
  
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const markersRef = useRef<mapboxgl.Marker[]>([])
  const observerRef = useRef<MutationObserver | null>(null)
  const [mapReady, setMapReady] = useState(false)
  const [mapInitializing, setMapInitializing] = useState(false)
  
  // #region agent log
  useEffect(() => {
    if (typeof window !== 'undefined') {
      fetch('http://127.0.0.1:7242/ingest/a0691e2c-cdd7-47b0-9342-76cf3ac06d2f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'custom-map-mapbox.tsx:48',message:'MapReady state changed',data:{mapReady,mapInitializing,hasMap:!!map.current,hasMapContainer:!!mapContainer.current},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    }
  }, [mapReady, mapInitializing])
  // #endregion

  const initializeMap = useCallback(() => {
    if (!mapContainer.current || map.current) {
      // #region agent log
      if (typeof window !== 'undefined') {
        fetch('http://127.0.0.1:7242/ingest/a0691e2c-cdd7-47b0-9342-76cf3ac06d2f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'custom-map-mapbox.tsx:52',message:'initializeMap early return',data:{hasMapContainer:!!mapContainer.current,hasMap:!!map.current,containerWidth:mapContainer.current?.offsetWidth,containerHeight:mapContainer.current?.offsetHeight},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
      }
      // #endregion
      return
    }

    setMapInitializing(true)
    // #region agent log
    if (typeof window !== 'undefined') {
      fetch('http://127.0.0.1:7242/ingest/a0691e2c-cdd7-47b0-9342-76cf3ac06d2f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'custom-map-mapbox.tsx:61',message:'Starting map initialization',data:{hasMapContainer:!!mapContainer.current,hasMap:!!map.current,hasToken:!!process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN,containerWidth:mapContainer.current?.offsetWidth,containerHeight:mapContainer.current?.offsetHeight},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
    }
    // #endregion

    const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN

    if (!mapboxToken) {
      console.error("Mapbox access token is missing. Please add NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN to your .env.local file")
      // #region agent log
      if (typeof window !== 'undefined') {
        fetch('http://127.0.0.1:7242/ingest/a0691e2c-cdd7-47b0-9342-76cf3ac06d2f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'custom-map-mapbox.tsx:70',message:'Mapbox token missing - initialization aborted',data:{hasToken:false},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
      }
      // #endregion
      setMapInitializing(false)
      return
    }

    mapboxgl.accessToken = mapboxToken

    // Get theme from document
    const isDark = document.documentElement.classList.contains("dark")
    const mapStyle = isDark 
      ? "mapbox://styles/mapbox/dark-v11" 
      : "mapbox://styles/mapbox/streets-v12"

    // Initialize map
    // #region agent log
    if (typeof window !== 'undefined') {
      fetch('http://127.0.0.1:7242/ingest/a0691e2c-cdd7-47b0-9342-76cf3ac06d2f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'custom-map-mapbox.tsx:89',message:'Creating new Mapbox map instance',data:{mapStyle,center,zoom,containerWidth:mapContainer.current?.offsetWidth,containerHeight:mapContainer.current?.offsetHeight,hasToken:!!mapboxToken},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
    }
    // #endregion
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: mapStyle,
      center: center,
      zoom: zoom,
      attributionControl: true,
    })
    // #region agent log
    if (typeof window !== 'undefined') {
      fetch('http://127.0.0.1:7242/ingest/a0691e2c-cdd7-47b0-9342-76cf3ac06d2f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'custom-map-mapbox.tsx:99',message:'Mapbox map instance created',data:{hasMap:!!map.current,mapId:map.current?.getContainer()?.id},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
    }
    // #endregion

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), "top-right")

    // Add geolocate control
    if (userLocation) {
      const geolocate = new mapboxgl.GeolocateControl({
        positionOptions: {
          enableHighAccuracy: true,
        },
        trackUserLocation: true,
        showUserHeading: true,
      })
      map.current.addControl(geolocate, "top-right")
    }

    map.current.on("load", () => {
      // #region agent log
      if (typeof window !== 'undefined') {
        fetch('http://127.0.0.1:7242/ingest/a0691e2c-cdd7-47b0-9342-76cf3ac06d2f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'custom-map-mapbox.tsx:112',message:'Map load event fired',data:{mapWidth:map.current?.getContainer()?.offsetWidth,mapHeight:map.current?.getContainer()?.offsetHeight,mapStyle:map.current?.getStyle()?.name,isStyleLoaded:map.current?.isStyleLoaded()},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      }
      // #endregion
      setMapReady(true)
      setMapInitializing(false)
      // #region agent log
      if (typeof window !== 'undefined') {
        fetch('http://127.0.0.1:7242/ingest/a0691e2c-cdd7-47b0-9342-76cf3ac06d2f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'custom-map-mapbox.tsx:120',message:'setMapReady(true) called',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      }
      // #endregion
    })
    
    // #region agent log
    map.current.on("styledata", () => {
      if (typeof window !== 'undefined') {
        fetch('http://127.0.0.1:7242/ingest/a0691e2c-cdd7-47b0-9342-76cf3ac06d2f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'custom-map-mapbox.tsx:127',message:'Map style data loaded',data:{isStyleLoaded:map.current?.isStyleLoaded()},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      }
    })
    
    map.current.on("data", (e) => {
      if (typeof window !== 'undefined') {
        fetch('http://127.0.0.1:7242/ingest/a0691e2c-cdd7-47b0-9342-76cf3ac06d2f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'custom-map-mapbox.tsx:133',message:'Map data event',data:{dataType:e.dataType,isSourceLoaded:map.current?.isSourceLoaded('route')},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      }
    })
    // #endregion
    
    map.current.on("error", (e: any) => {
      const errorMessage = e.error?.message || 'Unknown error'
      const errorType = e.error?.type || e.type
      const errorCode = e.error?.status || e.status
      
      // #region agent log
      if (typeof window !== 'undefined') {
        // Extract safe properties to avoid circular reference errors
        const safeErrorData = {
          error: errorMessage,
          errorType,
          errorCode,
          hasError: !!e.error,
          errorName: e.error?.name || e.name,
        }
        fetch('http://127.0.0.1:7242/ingest/a0691e2c-cdd7-47b0-9342-76cf3ac06d2f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'custom-map-mapbox.tsx:160',message:'Map error event',data:safeErrorData,timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      }
      // #endregion
      
      // Ignore route source errors - these are non-critical
      if (errorMessage.includes("There is no source with ID 'route'")) {
        // #region agent log
        if (typeof window !== 'undefined') {
          fetch('http://127.0.0.1:7242/ingest/a0691e2c-cdd7-47b0-9342-76cf3ac06d2f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'custom-map-mapbox.tsx:170',message:'Ignoring route source error (non-critical)',data:{error:errorMessage},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
        }
        // #endregion
        return // Don't treat route errors as fatal
      }
      
      // Only log and handle critical errors
      console.error("Mapbox error:", errorMessage, e)
      setMapInitializing(false)
      // #region agent log
      if (typeof window !== 'undefined') {
        fetch('http://127.0.0.1:7242/ingest/a0691e2c-cdd7-47b0-9342-76cf3ac06d2f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'custom-map-mapbox.tsx:180',message:'Map error - setMapInitializing(false) called',data:{error:errorMessage},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      }
      // #endregion
    })

    // Listen for theme changes
    observerRef.current = new MutationObserver(() => {
      if (map.current) {
        const isDarkNow = document.documentElement.classList.contains("dark")
        const newStyle = isDarkNow 
          ? "mapbox://styles/mapbox/dark-v11" 
          : "mapbox://styles/mapbox/streets-v12"
        map.current.setStyle(newStyle)
      }
    })

    observerRef.current.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    })
  }, [center, zoom, userLocation])

  // Use regular ref and check in useEffect (more reliable than callback ref with dynamic imports)
  // Check container in useEffect as fallback

  // Check container in useEffect - this is the primary initialization method
  // Use ResizeObserver to detect when container gets dimensions
  useEffect(() => {
    // #region agent log
    if (typeof window !== 'undefined') {
      fetch('http://127.0.0.1:7242/ingest/a0691e2c-cdd7-47b0-9342-76cf3ac06d2f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'custom-map-mapbox.tsx:196',message:'useEffect container check triggered',data:{hasMapContainer:!!mapContainer.current,hasMap:!!map.current,mapInitializing,containerWidth:mapContainer.current?.offsetWidth,containerHeight:mapContainer.current?.offsetHeight},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
    }
    // #endregion
    
    // Skip if already initializing or map exists
    if (map.current || mapInitializing) {
      // #region agent log
      if (typeof window !== 'undefined') {
        fetch('http://127.0.0.1:7242/ingest/a0691e2c-cdd7-47b0-9342-76cf3ac06d2f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'custom-map-mapbox.tsx:204',message:'Skipping - map exists or initializing',data:{hasMap:!!map.current,mapInitializing},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
      }
      // #endregion
      return
    }
    
    // Try to initialize immediately if container is ready
    if (mapContainer.current && mapContainer.current.offsetWidth > 0 && mapContainer.current.offsetHeight > 0) {
      // #region agent log
      if (typeof window !== 'undefined') {
        fetch('http://127.0.0.1:7242/ingest/a0691e2c-cdd7-47b0-9342-76cf3ac06d2f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'custom-map-mapbox.tsx:211',message:'Container ready immediately - calling initializeMap',data:{hasMapContainer:!!mapContainer.current,hasMap:!!map.current,mapInitializing,containerWidth:mapContainer.current?.offsetWidth,containerHeight:mapContainer.current?.offsetHeight},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
      }
      // #endregion
      initializeMap()
      return
    }
    
    // Use ResizeObserver to detect when container gets dimensions
    let resizeObserver: ResizeObserver | null = null
    let timeoutId: NodeJS.Timeout | null = null
    
    if (mapContainer.current && typeof window !== 'undefined' && 'ResizeObserver' in window) {
      resizeObserver = new ResizeObserver((entries) => {
        if (map.current || mapInitializing) return
        
        for (const entry of entries) {
          const { width, height } = entry.contentRect
          if (width > 0 && height > 0 && mapContainer.current && !map.current && !mapInitializing) {
            // #region agent log
            if (typeof window !== 'undefined') {
              fetch('http://127.0.0.1:7242/ingest/a0691e2c-cdd7-47b0-9342-76cf3ac06d2f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'custom-map-mapbox.tsx:225',message:'ResizeObserver detected dimensions - calling initializeMap',data:{width,height,hasMapContainer:!!mapContainer.current,hasMap:!!map.current,mapInitializing},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
            }
            // #endregion
            resizeObserver?.disconnect()
            initializeMap()
            return
          }
        }
      })
      resizeObserver.observe(mapContainer.current)
    }
    
    // Fallback: periodic check if ResizeObserver not available or container not set yet
    let retryCount = 0
    const maxRetries = 100
    const checkContainer = () => {
      if (map.current || mapInitializing) return
      
      if (mapContainer.current && mapContainer.current.offsetWidth > 0 && mapContainer.current.offsetHeight > 0) {
        // #region agent log
        if (typeof window !== 'undefined') {
          fetch('http://127.0.0.1:7242/ingest/a0691e2c-cdd7-47b0-9342-76cf3ac06d2f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'custom-map-mapbox.tsx:242',message:'Fallback check - container ready - calling initializeMap',data:{retryCount,hasMapContainer:!!mapContainer.current,hasMap:!!map.current,mapInitializing,containerWidth:mapContainer.current?.offsetWidth,containerHeight:mapContainer.current?.offsetHeight},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
        }
        // #endregion
        if (timeoutId) clearTimeout(timeoutId)
        initializeMap()
      } else {
        retryCount++
        if (retryCount < maxRetries) {
          timeoutId = setTimeout(checkContainer, 100)
        } else {
          // #region agent log
          if (typeof window !== 'undefined') {
            fetch('http://127.0.0.1:7242/ingest/a0691e2c-cdd7-47b0-9342-76cf3ac06d2f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'custom-map-mapbox.tsx:252',message:'Max retries reached',data:{retryCount,hasMapContainer:!!mapContainer.current,hasMap:!!map.current,mapInitializing,containerWidth:mapContainer.current?.offsetWidth,containerHeight:mapContainer.current?.offsetHeight},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
          }
          // #endregion
        }
      }
    }
    
    timeoutId = setTimeout(checkContainer, 100)
    
    return () => {
      if (timeoutId) clearTimeout(timeoutId)
      if (resizeObserver) resizeObserver.disconnect()
    }
  }, [mapInitializing, initializeMap]) // Include initializeMap in dependencies

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // #region agent log
      if (typeof window !== 'undefined') {
        fetch('http://127.0.0.1:7242/ingest/a0691e2c-cdd7-47b0-9342-76cf3ac06d2f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'custom-map-mapbox.tsx:210',message:'Component cleanup - removing map',data:{hasMap:!!map.current,mapReady},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
      }
      // #endregion
      if (observerRef.current) {
        observerRef.current.disconnect()
        observerRef.current = null
      }
      if (map.current) {
        map.current.remove()
        map.current = null
      }
    }
  }, [])

  // Update map center and zoom
  useEffect(() => {
    if (map.current && center) {
      map.current.flyTo({
        center: center,
        zoom: zoom,
        duration: 1000,
      })
    }
  }, [center, zoom])

  // Add/update markers
  useEffect(() => {
    // #region agent log
    if (typeof window !== 'undefined') {
      fetch('http://127.0.0.1:7242/ingest/a0691e2c-cdd7-47b0-9342-76cf3ac06d2f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'custom-map-mapbox.tsx:341',message:'Markers effect triggered',data:{hasMap:!!map.current,mapReady,pollingUnitCount:pollingUnits.length,hasUserLocation:!!userLocation,selectedPollingUnitId:selectedPollingUnit?.id},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    }
    // #endregion
    if (!map.current || !mapReady) return

    // Remove existing markers
    markersRef.current.forEach((marker) => marker.remove())
    markersRef.current = []

    // Add polling unit markers
    pollingUnits.forEach((pu) => {
      if (!pu.latitude || !pu.longitude) return
      
      // #region agent log
      if (typeof window !== 'undefined') {
        fetch('http://127.0.0.1:7242/ingest/a0691e2c-cdd7-47b0-9342-76cf3ac06d2f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'custom-map-mapbox.tsx:352',message:'Adding polling unit marker',data:{pollingUnitId:pu.id,pollingUnitCode:pu.code,lat:pu.latitude,lng:pu.longitude,isSelected:selectedPollingUnit?.id === pu.id},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      }
      // #endregion

      const isSelected = selectedPollingUnit?.id === pu.id

      // Create custom marker element
      const el = document.createElement("div")
      el.className = "custom-marker"
      el.style.width = isSelected ? "48px" : "40px"
      el.style.height = isSelected ? "48px" : "40px"
      el.style.borderRadius = "50%"
      el.style.backgroundColor = isSelected ? "rgb(59, 130, 246)" : "rgb(239, 68, 68)"
      el.style.border = "3px solid white"
      el.style.boxShadow = "0 2px 8px rgba(0,0,0,0.3)"
      el.style.cursor = "pointer"
      el.style.display = "flex"
      el.style.alignItems = "center"
      el.style.justifyContent = "center"
      el.style.zIndex = isSelected ? "1000" : "100"

      // Add icon
      el.innerHTML = `
        <svg width="${isSelected ? "24" : "20"}" height="${isSelected ? "24" : "20"}" viewBox="0 0 24 24" fill="white">
          <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
          <circle cx="12" cy="10" r="3"/>
        </svg>
      `

      el.addEventListener("click", () => {
        if (onMarkerClick) {
          onMarkerClick(pu)
        }
      })

      const marker = new mapboxgl.Marker(el)
        .setLngLat([pu.longitude, pu.latitude])
        .setPopup(
          new mapboxgl.Popup({ offset: 25 }).setHTML(`
            <div class="text-sm">
              <div class="font-semibold">${pu.name}</div>
              <div class="text-xs text-muted-foreground">${pu.code}</div>
              ${pu.ward ? `<div class="text-xs text-muted-foreground">Ward: ${pu.ward.name}</div>` : ""}
            </div>
          `)
        )
        .addTo(map.current!)

      markersRef.current.push(marker)
    })

    // Add user location marker
    if (userLocation) {
      // #region agent log
      if (typeof window !== 'undefined') {
        fetch('http://127.0.0.1:7242/ingest/a0691e2c-cdd7-47b0-9342-76cf3ac06d2f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'custom-map-mapbox.tsx:400',message:'Adding user location marker',data:{lat:userLocation.latitude,lng:userLocation.longitude},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      }
      // #endregion
      const userEl = document.createElement("div")
      userEl.className = "user-marker"
      userEl.style.width = "40px"
      userEl.style.height = "40px"
      userEl.style.borderRadius = "50%"
      userEl.style.backgroundColor = "rgb(59, 130, 246)"
      userEl.style.border = "3px solid white"
      userEl.style.boxShadow = "0 2px 8px rgba(0,0,0,0.3)"
      userEl.style.animation = "pulse 2s infinite"

      userEl.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
          <circle cx="12" cy="12" r="8"/>
        </svg>
      `

      const userMarker = new mapboxgl.Marker(userEl)
        .setLngLat([userLocation.longitude, userLocation.latitude])
        .setPopup(new mapboxgl.Popup().setHTML(`<div class="text-sm font-semibold">Your Location</div>`))
        .addTo(map.current!)

      markersRef.current.push(userMarker)
    }

    // Add landmark markers
    landmarks?.forEach((landmark) => {
      const colors: Record<string, string> = {
        school: "rgb(234, 179, 8)",
        mosque: "rgb(34, 197, 94)",
        church: "rgb(59, 130, 246)",
        market: "rgb(249, 115, 22)",
        bus_stop: "rgb(168, 85, 247)",
        other: "rgb(107, 114, 128)",
      }

      const landmarkEl = document.createElement("div")
      landmarkEl.style.width = "32px"
      landmarkEl.style.height = "32px"
      landmarkEl.style.borderRadius = "50%"
      landmarkEl.style.backgroundColor = colors[landmark.category] || colors.other
      landmarkEl.style.border = "2px solid white"
      landmarkEl.style.boxShadow = "0 2px 6px rgba(0,0,0,0.3)"

      landmarkEl.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0Z"/>
          <circle cx="12" cy="10" r="3"/>
        </svg>
      `

      const landmarkMarker = new mapboxgl.Marker(landmarkEl)
        .setLngLat([landmark.longitude, landmark.latitude])
        .setPopup(
          new mapboxgl.Popup().setHTML(`
            <div class="text-sm">
              <div class="font-semibold">${landmark.name}</div>
              <div class="text-xs text-muted-foreground capitalize">${landmark.category}</div>
            </div>
          `)
        )
        .addTo(map.current!)

      markersRef.current.push(landmarkMarker)
    })
  }, [mapReady, pollingUnits, userLocation, selectedPollingUnit, landmarks, onMarkerClick])

  // Add route polyline
  useEffect(() => {
    // #region agent log
    if (typeof window !== 'undefined') {
      fetch('http://127.0.0.1:7242/ingest/a0691e2c-cdd7-47b0-9342-76cf3ac06d2f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'custom-map-mapbox.tsx:246',message:'Route polyline effect triggered',data:{hasMap:!!map.current,mapReady,hasRoutePolyline:!!routePolyline,routePolylineLength:routePolyline?.length || 0},timestamp:Date.now(),sessionId:'debug-session',runId:'run7',hypothesisId:'L'})}).catch(()=>{});
    }
    // #endregion
    if (!map.current || !mapReady || !routePolyline) return

    // Decode polyline
    const coordinates = decodePolyline(routePolyline)
    // #region agent log
    if (typeof window !== 'undefined') {
      fetch('http://127.0.0.1:7242/ingest/a0691e2c-cdd7-47b0-9342-76cf3ac06d2f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'custom-map-mapbox.tsx:252',message:'Polyline decoded',data:{coordinateCount:coordinates.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run7',hypothesisId:'L'})}).catch(()=>{});
    }
    // #endregion

    // Remove existing route layer if it exists
    // Check if layer exists before removing to avoid errors
    try {
      if (map.current.getLayer("route")) {
        map.current.removeLayer("route")
      }
    } catch (error) {
      // Layer might not exist, ignore
    }
    
    // Check if source exists before removing to avoid errors
    try {
      if (map.current.getSource("route")) {
        map.current.removeSource("route")
      }
    } catch (error) {
      // Source might not exist, ignore - this is expected on first render
    }

    // Add route source and layer
    const routeCoordinates = coordinates.map(([lat, lng]) => [lng, lat]) // Mapbox uses [lng, lat]
    // #region agent log
    if (typeof window !== 'undefined') {
      fetch('http://127.0.0.1:7242/ingest/a0691e2c-cdd7-47b0-9342-76cf3ac06d2f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'custom-map-mapbox.tsx:504',message:'Adding route source and layer',data:{coordinateCount:routeCoordinates.length,firstCoord:routeCoordinates[0],lastCoord:routeCoordinates[routeCoordinates.length-1]},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    }
    // #endregion
    
    map.current.addSource("route", {
      type: "geojson",
      data: {
        type: "Feature",
        properties: {},
        geometry: {
          type: "LineString",
          coordinates: routeCoordinates,
        },
      },
    })

    map.current.addLayer({
      id: "route",
      type: "line",
      source: "route",
      layout: {
        "line-join": "round",
        "line-cap": "round",
      },
      paint: {
        "line-color": "#22c55e",
        "line-width": 4,
        "line-opacity": 0.8,
      },
    })
    
    // #region agent log
    if (typeof window !== 'undefined') {
      fetch('http://127.0.0.1:7242/ingest/a0691e2c-cdd7-47b0-9342-76cf3ac06d2f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'custom-map-mapbox.tsx:530',message:'Route layer added successfully',data:{hasLayer:!!map.current.getLayer('route'),hasSource:!!map.current.getSource('route')},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    }
    // #endregion
  }, [mapReady, routePolyline])

  // Always render container so map can initialize
  // Show loading overlay if map is not ready yet
  // #region agent log
  useEffect(() => {
    if (typeof window !== 'undefined') {
      fetch('http://127.0.0.1:7242/ingest/a0691e2c-cdd7-47b0-9342-76cf3ac06d2f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'custom-map-mapbox.tsx:456',message:'Component render',data:{mapReady,mapInitializing,hasMapContainer:!!mapContainer.current,hasMap:!!map.current},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
    }
  })
  // #endregion
  // Use callback ref to ensure we detect when the element is actually in the DOM
  const setContainerRef = useCallback((element: HTMLDivElement | null) => {
    // If element is null (unmounting), just clear the ref
    if (!element) {
      mapContainer.current = null
      return
    }
    
    mapContainer.current = element
    // #region agent log
    if (typeof window !== 'undefined') {
      fetch('http://127.0.0.1:7242/ingest/a0691e2c-cdd7-47b0-9342-76cf3ac06d2f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'custom-map-mapbox.tsx:489',message:'Container ref callback called',data:{hasElement:!!element,elementWidth:element?.offsetWidth,elementHeight:element?.offsetHeight,hasMap:!!map.current,mapInitializing,mapReady},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
    }
    // #endregion
    
    // If map already exists and is ready, don't re-initialize
    if (map.current && mapReady) {
      // #region agent log
      if (typeof window !== 'undefined') {
        fetch('http://127.0.0.1:7242/ingest/a0691e2c-cdd7-47b0-9342-76cf3ac06d2f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'custom-map-mapbox.tsx:499',message:'Map already exists and ready - skipping initialization',data:{hasMap:!!map.current,mapReady},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
      }
      // #endregion
      return
    }
    
    // Try to initialize if element exists, even if dimensions are 0 initially
    // Mapbox can handle containers that get dimensions later
    if (element && !map.current && !mapInitializing) {
      // #region agent log
      if (typeof window !== 'undefined') {
        fetch('http://127.0.0.1:7242/ingest/a0691e2c-cdd7-47b0-9342-76cf3ac06d2f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'custom-map-mapbox.tsx:516',message:'Container ref set - attempting initialization',data:{elementWidth:element.offsetWidth,elementHeight:element.offsetHeight,hasDimensions:element.offsetWidth > 0 && element.offsetHeight > 0},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
      }
      // #endregion
      
      // If container has dimensions, initialize immediately
      if (element.offsetWidth > 0 && element.offsetHeight > 0) {
        // #region agent log
        if (typeof window !== 'undefined') {
          fetch('http://127.0.0.1:7242/ingest/a0691e2c-cdd7-47b0-9342-76cf3ac06d2f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'custom-map-mapbox.tsx:523',message:'Container has dimensions - calling initializeMap immediately',data:{elementWidth:element.offsetWidth,elementHeight:element.offsetHeight},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
        }
        // #endregion
        setTimeout(() => {
          if (mapContainer.current && !map.current && !mapInitializing) {
            initializeMap()
          }
        }, 50)
      } else {
        // Container exists but has zero dimensions - wait for dimensions using ResizeObserver
        // #region agent log
        if (typeof window !== 'undefined') {
          fetch('http://127.0.0.1:7242/ingest/a0691e2c-cdd7-47b0-9342-76cf3ac06d2f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'custom-map-mapbox.tsx:533',message:'Container has zero dimensions - setting up ResizeObserver',data:{elementWidth:element.offsetWidth,elementHeight:element.offsetHeight},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
        }
        // #endregion
        
        if (typeof window !== 'undefined' && 'ResizeObserver' in window) {
          const resizeObserver = new ResizeObserver((entries) => {
            if (map.current || mapInitializing) {
              resizeObserver.disconnect()
              return
            }
            
            for (const entry of entries) {
              const { width, height } = entry.contentRect
              if (width > 0 && height > 0 && mapContainer.current && !map.current && !mapInitializing) {
                // #region agent log
                if (typeof window !== 'undefined') {
                  fetch('http://127.0.0.1:7242/ingest/a0691e2c-cdd7-47b0-9342-76cf3ac06d2f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'custom-map-mapbox.tsx:545',message:'ResizeObserver detected dimensions - calling initializeMap',data:{width,height},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
                }
                // #endregion
                resizeObserver.disconnect()
                initializeMap()
                return
              }
            }
          })
          resizeObserver.observe(element)
          
          // Also set a timeout fallback in case ResizeObserver doesn't fire
          setTimeout(() => {
            if (mapContainer.current && !map.current && !mapInitializing) {
              // Try anyway - Mapbox might handle it
              // #region agent log
              if (typeof window !== 'undefined') {
                fetch('http://127.0.0.1:7242/ingest/a0691e2c-cdd7-47b0-9342-76cf3ac06d2f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'custom-map-mapbox.tsx:559',message:'Timeout fallback - attempting initialization anyway',data:{elementWidth:mapContainer.current.offsetWidth,elementHeight:mapContainer.current.offsetHeight},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
              }
              // #endregion
              initializeMap()
              resizeObserver.disconnect()
            }
          }, 1000)
        } else {
          // ResizeObserver not available - use polling fallback
          let retries = 0
          const checkDimensions = setInterval(() => {
            retries++
            if (mapContainer.current && mapContainer.current.offsetWidth > 0 && mapContainer.current.offsetHeight > 0 && !map.current && !mapInitializing) {
              clearInterval(checkDimensions)
              initializeMap()
            } else if (retries > 50) {
              // After 5 seconds, try anyway
              clearInterval(checkDimensions)
              if (mapContainer.current && !map.current && !mapInitializing) {
                initializeMap()
              }
            }
          }, 100)
        }
      }
    }
  }, [mapInitializing, initializeMap])
  
  // #region agent log
  useEffect(() => {
    if (typeof window !== 'undefined' && mapReady) {
      fetch('http://127.0.0.1:7242/ingest/a0691e2c-cdd7-47b0-9342-76cf3ac06d2f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'custom-map-mapbox.tsx:644',message:'Map ready - should be visible',data:{mapReady,hasMap:!!map.current,hasMapContainer:!!mapContainer.current,containerVisible:mapContainer.current?.offsetParent !== null,containerWidth:mapContainer.current?.offsetWidth,containerHeight:mapContainer.current?.offsetHeight},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    }
  }, [mapReady])
  // #endregion
  
  return (
    <div className="relative h-full w-full min-h-0" style={{ minHeight: 0 }}>
      <div ref={setContainerRef} className="h-full w-full" />
      {!mapReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/80 backdrop-blur-sm z-50">
          <div className="text-center">
            <div className="mb-2 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
            <p className="text-sm text-muted-foreground">Loading map...</p>
            {/* #region agent log */}
            {typeof window !== 'undefined' && (void fetch('http://127.0.0.1:7242/ingest/a0691e2c-cdd7-47b0-9342-76cf3ac06d2f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'custom-map-mapbox.tsx:610',message:'Rendering loading overlay',data:{mapReady,mapInitializing,hasMapContainer:!!mapContainer.current,hasMap:!!map.current,containerWidth:mapContainer.current?.offsetWidth,containerHeight:mapContainer.current?.offsetHeight,isStyleLoaded:map.current?.isStyleLoaded()},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{}), null)}
            {/* #endregion */}
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * Decode Google Maps polyline string to coordinates
 */
function decodePolyline(encoded: string): [number, number][] {
  const poly: [number, number][] = []
  let index = 0
  const len = encoded.length
  let lat = 0
  let lng = 0

  while (index < len) {
    let b
    let shift = 0
    let result = 0
    do {
      b = encoded.charCodeAt(index++) - 63
      result |= (b & 0x1f) << shift
      shift += 5
    } while (b >= 0x20)
    const dlat = (result & 1) !== 0 ? ~(result >> 1) : result >> 1
    lat += dlat

    shift = 0
    result = 0
    do {
      b = encoded.charCodeAt(index++) - 63
      result |= (b & 0x1f) << shift
      shift += 5
    } while (b >= 0x20)
    const dlng = (result & 1) !== 0 ? ~(result >> 1) : result >> 1
    lng += dlng

    poly.push([lat * 1e-5, lng * 1e-5])
  }

  return poly
}

