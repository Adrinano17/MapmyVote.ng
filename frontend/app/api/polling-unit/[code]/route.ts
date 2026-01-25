import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> | { code: string } }
) {
  try {
    // Handle both sync and async params (Next.js 15+ uses Promise)
    const resolvedParams = params instanceof Promise ? await params : params
    const code = resolvedParams.code
    const supabase = await createClient()

    // Try exact match first (codes are stored as "IBN-04-004" format)
    let { data: pollingUnit, error } = await supabase
      .from("polling_units")
      .select("*, ward:wards(*)")
      .eq("code", code)
      .single()
    
    console.log("API Route - Exact match attempt:", { code, found: !!pollingUnit, error: error?.message, errorCode: error?.code, errorDetails: error?.details })

    // If not found, try to normalize the code format
    // Database stores codes as "IBN-04-004", so exact match should work
    // But if code comes as "04-004", try adding "IBN-" prefix
    if (error || !pollingUnit) {
      const parts = code.split("-")
      
      // If code has 2 parts like "04-004", try adding "IBN-" prefix
      if (parts.length === 2) {
        const withPrefix = `IBN-${code}`
        console.log("API Route - Trying with IBN prefix:", withPrefix)
        const { data: normalizedUnit, error: normalizedError } = await supabase
          .from("polling_units")
          .select("*, ward:wards(*)")
          .eq("code", withPrefix)
          .single()

        if (!normalizedError && normalizedUnit) {
          pollingUnit = normalizedUnit
          error = null
          console.log("API Route - Found with IBN prefix")
        }
      }
      // If code has 3 parts but first part is not "IBN", try replacing it
      else if (parts.length === 3 && parts[0] !== "IBN") {
        const withIBN = `IBN-${parts.slice(1).join("-")}`
        console.log("API Route - Trying with IBN replacement:", withIBN)
        const { data: normalizedUnit, error: normalizedError } = await supabase
          .from("polling_units")
          .select("*, ward:wards(*)")
          .eq("code", withIBN)
          .single()

        if (!normalizedError && normalizedUnit) {
          pollingUnit = normalizedUnit
          error = null
          console.log("API Route - Found with IBN replacement")
        }
      }
    }

    if (error || !pollingUnit) {
      console.log("API Route - Polling unit not found:", { code, error: error?.message })
      return NextResponse.json(
        { error: "Polling unit not found" },
        { status: 404 }
      )
    }

    // Convert DECIMAL to number if needed (Supabase returns DECIMAL as string sometimes)
    const response = {
      ...pollingUnit,
      latitude: pollingUnit.latitude != null ? Number(pollingUnit.latitude) : null,
      longitude: pollingUnit.longitude != null ? Number(pollingUnit.longitude) : null,
    }
    
    console.log("API Route - Returning polling unit:", { 
      code: response.code, 
      name: response.name,
      hasLat: !!response.latitude,
      hasLng: !!response.longitude,
      lat: response.latitude,
      lng: response.longitude,
      rawLat: pollingUnit.latitude,
      rawLng: pollingUnit.longitude,
      allKeys: Object.keys(pollingUnit)
    })
    return NextResponse.json(response)
  } catch (error: any) {
    console.error("Error fetching polling unit:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

