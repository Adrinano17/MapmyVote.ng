/**
 * Script to import polling units from Word document data
 * Handles ward detection, duplicate detection, and error reporting
 * Run with: npx tsx frontend/scripts/import-polling-units-from-word-data.ts
 */

import { createClient } from "@supabase/supabase-js"
import { readFileSync, existsSync } from "fs"
import { join } from "path"
import { config } from "dotenv"

// Try multiple .env.local locations
const envPaths = [
  join(process.cwd(), "frontend", ".env.local"),  // From root directory
  join(process.cwd(), ".env.local"),              // From frontend directory
  join(__dirname, "..", ".env.local")             // Relative to script
]
for (const envPath of envPaths) {
  if (existsSync(envPath)) {
    config({ path: envPath })
    break
  }
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ""

// Use service role key for imports (bypasses RLS), fallback to anon key
const supabaseKey = supabaseServiceKey || supabaseAnonKey

// Only require Supabase connection if not in dry-run mode
let supabase: ReturnType<typeof createClient> | null = null
if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey)
  if (supabaseServiceKey) {
    console.log("✓ Using service role key (bypasses RLS for inserts)")
  } else {
    console.log("⚠ Using anon key (may have RLS restrictions)")
  }
}

// Helper function to convert DMS to decimal degrees
function dmsToDecimal(dms: string): number | null {
  // Format: 7°22'47.9"N or 3°53'55.3"E
  const match = dms.match(/(\d+)°(\d+)'([\d.]+)"([NSWE])/)
  if (!match) return null

  const degrees = parseFloat(match[1])
  const minutes = parseFloat(match[2])
  const seconds = parseFloat(match[3])
  const direction = match[4]

  let decimal = degrees + minutes / 60 + seconds / 3600
  if (direction === "S" || direction === "W") {
    decimal = -decimal
  }
  return decimal
}

interface PollingUnit {
  code: string
  name: string
  wardCode: string
  wardNumber: number
  latitude: number | null
  longitude: number | null
  address: string | null
  originalNumber: string
  lineNumber: number
}

interface ParsingResult {
  pollingUnits: PollingUnit[]
  duplicates: Array<{ code: string; occurrences: number; lines: number[] }>
  missingCoordinates: Array<{ code: string; name: string; line: number }>
  errors: Array<{ message: string; line: number; data?: any }>
}

// Parse the text data
function parsePollingUnitData(text: string): ParsingResult {
  const lines = text.split("\n").map((line, idx) => ({ 
    content: line.trim(), 
    number: idx + 1 
  })).filter(line => line.content.length > 0)
  
  const pollingUnits: PollingUnit[] = []
  const errors: Array<{ message: string; line: number; data?: any }> = []
  const missingCoordinates: Array<{ code: string; name: string; line: number }> = []

  let currentWard = ""
  let currentWardCode = ""
  let currentWardNumber = 0
  let pollingUnitCounter = 0 // Track actual polling unit number per ward
  let ward1First011Seen = false // Track if we've seen the first "011" in Ward 1
  let isFirstPollingUnit = true // Track if we're at the very beginning (Ward 1)

  // Roman numeral to number mapping
  const romanToNumber: Record<string, number> = {
    "I": 1, "II": 2, "III": 3, "IV": 4, "V": 5, "VI": 6,
    "VII": 7, "VIII": 8, "IX": 9, "X": 10, "XI": 11, "XII": 12
  }

  for (let i = 0; i < lines.length; i++) {
    const { content: line, number: lineNum } = lines[i]

    // Check for ward headers - "Ward I", "Ward II", "04- WardIV", "10 -Ward X", "11-WARDS XI", etc.
    const wardMatch = line.match(/Ward\s+([IVX]+)/i) || 
                     line.match(/(\d+)\s*-\s*Ward\s*([IVX]+)/i) ||
                     line.match(/(\d+)\s*-\s*Ward\s*([IVX]+)/i) ||
                     line.match(/Ward\s*([IVX]+)/i) ||
                     line.match(/(\d+)\s*-\s*WARDS?\s*([IVX]+)/i)
    
    if (wardMatch) {
      // Handle "10 -Ward X" format - extract the number directly
      const numberMatch = line.match(/(\d+)\s*-\s*Ward/i)
      if (numberMatch) {
        currentWardNumber = parseInt(numberMatch[1])
      } else {
        const wardRoman = wardMatch[wardMatch.length - 1].toUpperCase()
        const wardNumber = romanToNumber[wardRoman]
        if (wardNumber) {
          currentWardNumber = wardNumber
        }
      }
      
      if (currentWardNumber > 0) {
        currentWardCode = `IBN-${String(currentWardNumber).padStart(2, "0")}`
        currentWard = `Ward ${currentWardNumber}`
        pollingUnitCounter = 0 // Reset counter for new ward
        ward1First011Seen = false // Reset for new ward
        console.log(`Found ${currentWard} -> ${currentWardCode} at line ${lineNum}`)
      }
      continue
    }

    // Check for "POLLING UNITS" header (indicates a new ward)
    // Only treat as ward header if it's not part of a polling unit entry (no number before it)
    // And if it's on its own line or after a ward number
    if (line.match(/^POLLING\s+UNITS$/i) || (line.match(/POLLING\s+UNITS/i) && !line.match(/^\d{3}/))) {
      // Check if this POLLING UNITS is part of a ward header (e.g., "09-WARD IX POLLING UNITS")
      // If so, skip it as it's already handled by the ward header detection
      const prevLine = i > 0 ? lines[i - 1].content : ""
      if (prevLine.match(/\d+\s*-\s*(?:WARD|Ward|WARDS)/i)) {
        // This POLLING UNITS is part of the previous ward header, skip it
        continue
      }
      
      // This is a standalone POLLING UNITS header
      // First "POLLING UNITS" after Ward VIII is Ward 9
      // But check if we've already seen Ward 9
      if (currentWardNumber === 0 || currentWardNumber < 9) {
        currentWardNumber = 9 // First "POLLING UNITS" is Ward 9
        currentWardCode = "IBN-09"
        currentWard = "Ward IX"
        pollingUnitCounter = 0
        ward1First011Seen = false
        isFirstPollingUnit = false
        console.log(`Found POLLING UNITS header -> ${currentWardCode} at line ${lineNum}`)
      } else if (currentWardNumber === 10) {
        // After Ward 10, next POLLING UNITS is Ward 11
        currentWardNumber = 11
        currentWardCode = "IBN-11"
        currentWard = "Ward XI"
        pollingUnitCounter = 0
        ward1First011Seen = false
        console.log(`Found POLLING UNITS header -> ${currentWardCode} at line ${lineNum}`)
      } else if (currentWardNumber === 11) {
        // After Ward 11, next POLLING UNITS is Ward 12
        currentWardNumber = 12
        currentWardCode = "IBN-12"
        currentWard = "Ward XII"
        pollingUnitCounter = 0
        ward1First011Seen = false
        isFirstPollingUnit = false
        console.log(`Found POLLING UNITS header -> ${currentWardCode} at line ${lineNum}`)
      }
      continue
    }

    // Check for polling unit number (001, 002, etc.) or standalone number
    const puNumberMatch = line.match(/^(\d{2,3})\s*(.+)/) || line.match(/^(\d{2,3})([A-Z])/)
    
    // If we're at the very beginning and find a polling unit number, assume it's Ward 1
    if (puNumberMatch && isFirstPollingUnit && !currentWardCode) {
      currentWardNumber = 1
      currentWardCode = "IBN-01"
      currentWard = "Ward I"
      pollingUnitCounter = 0
      ward1First011Seen = false
      isFirstPollingUnit = false
      console.log(`Found Ward 1 (implicit) -> ${currentWardCode} at line ${lineNum}`)
    }
    
    if (puNumberMatch && currentWardCode) {
      const originalNumber = puNumberMatch[1]
      let namePart = puNumberMatch[2]?.trim() || ""
      
      // Special handling for Ward 1: "010" entry should be unit 010, "011" should be unit 011
      // The issue is that "010" appears but should be treated as unit 010, not skipped
      let actualUnitNumber = originalNumber
      
      if (currentWardNumber === 1) {
        // For Ward 1, handle the numbering correctly
        if (originalNumber === "010") {
          // "010" should be unit 010
          actualUnitNumber = "010"
          pollingUnitCounter = 10
        } else if (originalNumber === "011") {
          // "011" should be unit 011
          actualUnitNumber = "011"
          pollingUnitCounter = 11
        } else {
          // Normal increment for other numbers
          pollingUnitCounter++
          actualUnitNumber = String(pollingUnitCounter).padStart(3, "0")
        }
      } else {
        // For other wards, just increment normally
        pollingUnitCounter++
        actualUnitNumber = String(pollingUnitCounter).padStart(3, "0")
      }

      // If name is empty, try to get it from next line
      if (!namePart || namePart.length < 3) {
        if (i + 1 < lines.length) {
          const nextLine = lines[i + 1].content
          if (!nextLine.match(/^\d+°/) && !nextLine.match(/^\d+\.\d+/)) {
            namePart = nextLine
          }
        }
      }

      // Look ahead for coordinates (check next 5 lines)
      let latitude: number | null = null
      let longitude: number | null = null

      for (let j = i + 1; j < Math.min(i + 6, lines.length); j++) {
        const nextLine = lines[j].content
        
        // Check for DMS format (7°22'47.9"N 3°53'55.3"E)
        const dmsMatch = nextLine.match(/(\d+°[\d.]+'[\d.]+"[NS])\s+(\d+°[\d.]+'[\d.]+"[EW])/)
        if (dmsMatch) {
          latitude = dmsToDecimal(dmsMatch[1])
          longitude = dmsToDecimal(dmsMatch[2])
          break
        }

        // Check for decimal format (7.379960, 3.898697)
        // Handle malformed coordinates like "7.398.46" by removing extra decimal points
        const decimalMatch = nextLine.match(/(\d+\.?\d*\.?\d+)[,\s]+(\d+\.?\d*\.?\d+)/)
        if (decimalMatch && (!latitude || !longitude)) {
          // Clean up malformed coordinates (e.g., "7.398.46" -> "7.39846")
          let latStr = decimalMatch[1].replace(/\.(?=.*\.)/g, '') // Remove all but last decimal point
          let lngStr = decimalMatch[2].replace(/\.(?=.*\.)/g, '')
          
          const lat = parseFloat(latStr)
          const lng = parseFloat(lngStr)
          
          // Validate coordinates are in reasonable range for Nigeria (Ibadan area)
          if (!isNaN(lat) && !isNaN(lng) && lat >= 6 && lat <= 8 && lng >= 3 && lng <= 5) {
            latitude = lat
            longitude = lng
          }
        }
      }

      const code = `${currentWardCode}-${actualUnitNumber}`
      
      if (!namePart || namePart.length < 2) {
        namePart = `Polling Unit ${actualUnitNumber}`
        errors.push({
          message: `Missing name for ${code}`,
          line: lineNum,
          data: { originalNumber, actualUnitNumber }
        })
      }

      if (!latitude || !longitude) {
        missingCoordinates.push({
          code,
          name: namePart,
          line: lineNum
        })
      }

      pollingUnits.push({
        code,
        name: namePart,
        wardCode: currentWardCode,
        wardNumber: currentWardNumber,
        latitude,
        longitude,
        address: namePart,
        originalNumber,
        lineNumber: lineNum
      })
    } else if (line.match(/^\d{3}/) && !currentWardCode) {
      // Found a polling unit number but no ward context
      errors.push({
        message: `Polling unit number found without ward context: ${line}`,
        line: lineNum
      })
    }
  }

  // Detect duplicates by code
  const codeMap = new Map<string, number[]>()
  pollingUnits.forEach((pu, idx) => {
    if (!codeMap.has(pu.code)) {
      codeMap.set(pu.code, [])
    }
    codeMap.get(pu.code)!.push(pu.lineNumber)
  })

  const duplicates: Array<{ code: string; occurrences: number; lines: number[] }> = []
  codeMap.forEach((lines, code) => {
    if (lines.length > 1) {
      duplicates.push({
        code,
        occurrences: lines.length,
        lines
      })
    }
  })

  return {
    pollingUnits,
    duplicates,
    missingCoordinates,
    errors
  }
}

async function importPollingUnits(dryRun: boolean = false) {
  try {
    // Read the text file - try both possible locations
    let wordData: string
    let filePath: string | null = null
    
    // Try from root directory first (when run from project root)
    if (existsSync("frontend/polling-units-data.txt")) {
      filePath = "frontend/polling-units-data.txt"
    }
    // Try from current directory (when run from frontend directory)
    else if (existsSync("polling-units-data.txt")) {
      filePath = "polling-units-data.txt"
    }
    // Try absolute path from scripts directory
    else {
      const scriptDir = join(__dirname)
      const frontendDir = join(scriptDir, "..")
      const absolutePath = join(frontendDir, "polling-units-data.txt")
      if (existsSync(absolutePath)) {
        filePath = absolutePath
      }
    }
    
    if (!filePath) {
      console.error("Error: Could not find polling-units-data.txt")
      console.error("Tried the following locations:")
      console.error("  - frontend/polling-units-data.txt (from root)")
      console.error("  - polling-units-data.txt (from frontend)")
      console.error("Please save your Word document as 'polling-units-data.txt' in the frontend directory")
      process.exit(1)
    }
    
    try {
      wordData = readFileSync(filePath, "utf-8")
      console.log(`✓ Found data file: ${filePath}`)
    } catch (error) {
      console.error(`Error: Could not read ${filePath}`)
      console.error("Please check the file exists and is readable.")
      process.exit(1)
    }

    if (dryRun) {
      console.log("🔍 DRY RUN MODE - Analysis only, no import will be performed\n")
    }

    console.log("Parsing polling unit data...")
    const result = parsePollingUnitData(wordData)
    
    console.log(`\n=== Parsing Results ===`)
    console.log(`✓ Parsed ${result.pollingUnits.length} polling units`)
    console.log(`⚠ Found ${result.duplicates.length} duplicate codes`)
    console.log(`⚠ Found ${result.missingCoordinates.length} units without coordinates`)
    console.log(`⚠ Found ${result.errors.length} parsing errors`)

    // Report duplicates
    if (result.duplicates.length > 0) {
      console.log(`\n=== DUPLICATE CODES ===`)
      result.duplicates.forEach(dup => {
        console.log(`  ${dup.code}: Found ${dup.occurrences} times at lines ${dup.lines.join(", ")}`)
      })
    }

    // Report missing coordinates
    if (result.missingCoordinates.length > 0) {
      console.log(`\n=== MISSING COORDINATES ===`)
      result.missingCoordinates.forEach(mc => {
        console.log(`  ${mc.code} - ${mc.name} (line ${mc.line})`)
      })
    }

    // Report errors
    if (result.errors.length > 0) {
      console.log(`\n=== PARSING ERRORS ===`)
      result.errors.forEach(err => {
        console.log(`  Line ${err.line}: ${err.message}`)
        if (err.data) {
          console.log(`    Data:`, err.data)
        }
      })
    }

    // Group by ward
    const byWard = new Map<string, PollingUnit[]>()
    result.pollingUnits.forEach(pu => {
      if (!byWard.has(pu.wardCode)) {
        byWard.set(pu.wardCode, [])
      }
      byWard.get(pu.wardCode)!.push(pu)
    })

    console.log(`\n=== POLLING UNITS BY WARD ===`)
    byWard.forEach((units, wardCode) => {
      console.log(`  ${wardCode}: ${units.length} units`)
    })

    // Ask for confirmation
    console.log(`\n=== Ready to Import ===`)
    console.log(`Total polling units: ${result.pollingUnits.length}`)
    console.log(`Wards: ${byWard.size}`)
    
    // Get all wards from database (if connected)
    if (!supabase) {
      console.log(`\n⚠ No Supabase connection - showing parsing results only`)
      console.log(`\nTo import data, please:`)
      console.log(`1. Create .env.local file in the frontend directory`)
      console.log(`2. Add your Supabase credentials:`)
      console.log(`   NEXT_PUBLIC_SUPABASE_URL=your_url`)
      console.log(`   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key`)
      console.log(`3. Run the script again to import`)
      
      if (dryRun) {
        console.log(`\n✅ Analysis complete. Add Supabase credentials and run without --dry-run to import.`)
        return
      } else {
        console.log(`\n❌ Cannot import without Supabase connection.`)
        return
      }
    }

    const { data: wards, error: wardsError } = await supabase
      .from("wards")
      .select("id, code, name")

    if (wardsError) {
      console.error("Error fetching wards:", wardsError)
      return
    }

    const wardMap = new Map(wards?.map(w => [w.code, w]) || [])
    console.log(`\nFound ${wardMap.size} wards in database:`)
    wardMap.forEach((ward, code) => {
      console.log(`  ${code}: ${ward.name}`)
    })

    // Check for missing wards
    const missingWards = new Set<string>()
    byWard.forEach((units, wardCode) => {
      if (!wardMap.has(wardCode)) {
        missingWards.add(wardCode)
      }
    })

    if (missingWards.size > 0) {
      console.log(`\n⚠ WARNING: Missing wards in database:`)
      missingWards.forEach(wc => {
        console.log(`  ${wc} (${byWard.get(wc)?.length || 0} polling units)`)
      })
      console.log(`\nPlease create these wards first before importing.`)
      return
    }

    if (dryRun) {
      console.log(`\n✅ Analysis complete. Run without --dry-run to import.`)
      return
    }

    // Proceed with import
    let created = 0
    let updated = 0
    let importErrors = 0

    console.log(`\n=== Starting Import ===`)
    
    for (const pu of result.pollingUnits) {
      try {
        const ward = wardMap.get(pu.wardCode)
        if (!ward) {
          console.warn(`⚠ Ward ${pu.wardCode} not found for ${pu.code}`)
          importErrors++
          continue
        }

        // Check if polling unit exists
        const { data: existing } = await supabase
          .from("polling_units")
          .select("id")
          .eq("code", pu.code)
          .single()

        const pollingUnitData: any = {
          code: pu.code,
          name: pu.name,
          address: pu.address,
          ward_id: ward.id,
          latitude: pu.latitude,
          longitude: pu.longitude,
          registered_voters: 0, // Default
        }

        if (existing) {
          // Update existing
          const { error } = await supabase
            .from("polling_units")
            .update(pollingUnitData)
            .eq("code", pu.code)

          if (error) {
            console.error(`✗ Error updating ${pu.code}:`, error.message)
            importErrors++
          } else {
            if (created + updated < 10 || (created + updated) % 50 === 0) {
              console.log(`✓ Updated ${pu.code} - ${pu.name}`)
            }
            updated++
          }
        } else {
          // Create new
          const { error } = await supabase
            .from("polling_units")
            .insert(pollingUnitData)

          if (error) {
            console.error(`✗ Error creating ${pu.code}:`, error.message)
            importErrors++
          } else {
            if (created + updated < 10 || (created + updated) % 50 === 0) {
              console.log(`✓ Created ${pu.code} - ${pu.name}`)
            }
            created++
          }
        }
      } catch (error: any) {
        console.error(`✗ Error processing ${pu.code}:`, error.message)
        importErrors++
      }
    }

    console.log(`\n=== Import Summary ===`)
    console.log(`✓ Created: ${created}`)
    console.log(`✓ Updated: ${updated}`)
    console.log(`✗ Errors: ${importErrors}`)
    console.log(`Total processed: ${result.pollingUnits.length}`)

    if (created + updated > 0) {
      console.log(`\n✅ Import completed successfully!`)
    }
  } catch (error: any) {
    console.error("Fatal error:", error.message)
    console.error(error.stack)
    process.exit(1)
  }
}

// Check for dry-run flag (check before requiring Supabase)
const dryRun = process.argv.includes("--dry-run") || process.argv.includes("-d")

// Only require Supabase if not in dry-run mode
if (!dryRun && (!supabaseUrl || !supabaseKey)) {
  console.error("Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local")
  console.error("Or run with --dry-run to analyze data without importing")
  process.exit(1)
}

importPollingUnits(dryRun)
  .then(() => {
    console.log("\nDone.")
    process.exit(0)
  })
  .catch((error) => {
    console.error("Fatal error:", error)
    process.exit(1)
  })

