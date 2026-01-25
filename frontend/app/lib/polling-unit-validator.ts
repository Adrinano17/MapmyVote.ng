/**
 * Polling Unit Code Validation
 * Format: WW-PPP (2 digits for ward + 3 digits for polling unit)
 * Supports both 5-digit (WWPPP) and 8-digit (SSSSWWPPP) formats
 * Example: 08-001 or 08001 (5-digit) or 30020801 (8-digit)
 */

export interface ValidationResult {
  isValid: boolean
  error?: string
  wardCode?: string
  puCode?: string
  fullCode?: string
}

/**
 * Validate polling unit code format
 * Accepts 8-digit codes (extracts last 5 digits) or 5-digit codes
 */
export function validatePollingUnitCode(code: string): ValidationResult {
  if (!code || code.trim().length === 0) {
    return {
      isValid: false,
      error: "Polling unit code is required",
    }
  }

  // Remove any dashes and spaces
  const cleanCode = code.trim().replace(/[-\s]/g, "")

  // Check if it's 8 digits (full code) or 5 digits (ward + polling unit)
  if (/^\d{8}$/.test(cleanCode)) {
    // 8-digit format: extract last 5 digits (ward code + polling unit code)
    const wardCode = cleanCode.substring(6, 8) // Last 2 digits before last 3
    const puCode = cleanCode.substring(5, 8) // Last 3 digits
    return {
      isValid: true,
      wardCode,
      puCode,
      fullCode: `${wardCode}-${puCode}`,
    }
  } else if (/^\d{5}$/.test(cleanCode)) {
    // 5-digit format: first 2 are ward, last 3 are polling unit
    const wardCode = cleanCode.substring(0, 2)
    const puCode = cleanCode.substring(2, 5)
    return {
      isValid: true,
      wardCode,
      puCode,
      fullCode: `${wardCode}-${puCode}`,
    }
  } else {
    return {
      isValid: false,
      error: "Polling unit code must be 5 digits (e.g., 08001) or 8 digits (e.g., 30020801)",
    }
  }
}

/**
 * Find polling unit by code (searches in database)
 */
export async function findPollingUnitByCode(
  wardCode: string,
  puCode: string,
  supabase: any
): Promise<{ pollingUnit: any; ward: any } | null> {
  try {
    // First find the ward
    const { data: ward } = await supabase.from("wards").select("*").eq("code", wardCode).single()

    if (!ward) {
      return null
    }

    // Then find the polling unit in that ward
    const fullCode = `${wardCode}-${puCode}`
    const { data: pollingUnit } = await supabase
      .from("polling_units")
      .select("*, ward:wards(*)")
      .eq("code", fullCode)
      .eq("ward_id", ward.id)
      .single()

    if (!pollingUnit) {
      return null
    }

    return {
      pollingUnit,
      ward: pollingUnit.ward || ward,
    }
  } catch (error) {
    console.error("Error finding polling unit:", error)
    return null
  }
}

/**
 * Validate if polling unit exists (for navigation state)
 */
export async function validatePollingUnitExists(
  code: string,
  supabase: any
): Promise<{ exists: boolean; pollingUnit?: any; ward?: any; error?: string }> {
  const validation = validatePollingUnitCode(code)

  if (!validation.isValid) {
    return {
      exists: false,
      error: validation.error,
    }
  }

  const result = await findPollingUnitByCode(validation.wardCode!, validation.puCode!, supabase)

  if (!result) {
    return {
      exists: false,
      error: `Polling unit ${validation.fullCode} not found`,
    }
  }

  return {
    exists: true,
    pollingUnit: result.pollingUnit,
    ward: result.ward,
  }
}
