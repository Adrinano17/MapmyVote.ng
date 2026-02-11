/**
 * Script to update registered voters count from the voters data file
 * Run with: npx tsx frontend/scripts/update-registered-voters.ts
 */

import { createClient } from "@supabase/supabase-js"
import { readFileSync, existsSync } from "fs"
import { join } from "path"
import { config } from "dotenv"

// Try multiple .env.local locations
const envPaths = [
  join(process.cwd(), "frontend", ".env.local"),
  join(process.cwd(), ".env.local"),
  join(__dirname, "..", ".env.local")
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

const supabaseKey = supabaseServiceKey || supabaseAnonKey

if (!supabaseUrl || !supabaseKey) {
  console.error("Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

if (supabaseServiceKey) {
  console.log("✓ Using service role key (bypasses RLS)\n")
}

interface VoterData {
  code: string // Full code like IBN-01-001
  registeredVoters: number
  name: string
}

function parseVotersFile(filePath: string): VoterData[] {
  const content = readFileSync(filePath, "utf-8")
  // Handle both Unix (\n) and Windows (\r\n) line endings
  const lines = content.split(/\r?\n/)
  
  const voters: VoterData[] = []
  let currentWard = 0
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const trimmed = line.trim()
    
    // Check for ward header: "RA (WARD):  (01)" - look for number in parentheses
    if (trimmed.includes("WARD") || line.includes("WARD")) {
      // Try to find number in parentheses - could be (01) or (1)
      const numMatch = line.match(/\((\d{1,2})\)/) || trimmed.match(/\((\d{1,2})\)/)
      if (numMatch) {
        currentWard = parseInt(numMatch[1])
        continue
      }
    }
    
    // Skip if no ward detected yet
    if (currentWard === 0) {
      continue
    }
    
    // Skip header rows and empty lines
    if (!trimmed || 
        trimmed.includes("S/N") || 
        trimmed.includes("POLLING UNITS") ||
        trimmed.includes("INDEPENDENT NATIONAL") ||
        trimmed.includes("IBADAN NORTH") ||
        trimmed.includes("POSTING OF POLL") ||
        trimmed.match(/^\d+$/) || // Just numbers (totals)
        trimmed.length < 5) {
      continue
    }
    
    // Parse tab-separated data: S/N, Name, CODE, Voters, ...
    // Split by tabs (char code 9) or multiple spaces
    let tabParts: string[] = []
    if (line.includes("\t")) {
      tabParts = line.split("\t")
    } else if (line.match(/\s{3,}/)) {
      // Fallback: split by 3+ spaces
      tabParts = line.split(/\s{3,}/)
    } else {
      // Try splitting by 2+ spaces
      tabParts = line.split(/\s{2,}/)
    }
    
    // Filter and clean parts
    const cleanParts = tabParts.map(p => p.trim()).filter(p => p.length > 0)
    
    // Need at least 3 parts (S/N might be missing sometimes)
    if (cleanParts.length >= 3) {
      // Find the 3-digit code
      let codeIndex = -1
      for (let j = 0; j < cleanParts.length; j++) {
        if (cleanParts[j].match(/^\d{3}$/)) {
          codeIndex = j
          break
        }
      }
      
      if (codeIndex >= 0) {
        const codeStr = cleanParts[codeIndex]
        const votersStr = cleanParts[codeIndex + 1] || ""
        
        // Get name - everything before the code (skip S/N if it's just a number)
        const nameParts = []
        for (let k = 0; k < codeIndex; k++) {
          if (!cleanParts[k].match(/^\d+$/)) {
            nameParts.push(cleanParts[k])
          }
        }
        const name = nameParts.join(" ").trim() || cleanParts[0] || ""
        
        // Clean voters count (handle cases like "..675" -> "675")
        let votersCount = votersStr.replace(/[^\d]/g, "")
        
        if (votersCount && !isNaN(parseInt(votersCount)) && parseInt(votersCount) > 0) {
          const registeredVoters = parseInt(votersCount)
          const fullCode = `IBN-${String(currentWard).padStart(2, "0")}-${codeStr}`
          
          voters.push({
            code: fullCode,
            registeredVoters,
            name: name || `Polling Unit ${codeStr}`
          })
        }
      }
    }
  }
  
  return voters
}

async function updateRegisteredVoters() {
  try {
    // Find the voters file
    let filePath: string | null = null
    const possiblePaths = [
      "frontend/polling unit registered voters.txt",
      "polling unit registered voters.txt",
      join(__dirname, "..", "polling unit registered voters.txt")
    ]
    
    for (const path of possiblePaths) {
      if (existsSync(path)) {
        filePath = path
        break
      }
    }
    
    if (!filePath) {
      console.error("Error: Could not find 'polling unit registered voters.txt'")
      console.error("Tried:", possiblePaths.join(", "))
      process.exit(1)
    }
    
    console.log(`✓ Found voters file: ${filePath}\n`)
    console.log("Parsing registered voters data...")
    
    const votersData = parseVotersFile(filePath)
    console.log(`✓ Parsed ${votersData.length} polling units with voter counts\n`)
    
    // Group by ward for summary
    const byWard = new Map<number, number>()
    votersData.forEach(v => {
      const wardNum = parseInt(v.code.split("-")[1])
      byWard.set(wardNum, (byWard.get(wardNum) || 0) + 1)
    })
    
    console.log("=== Voters Data by Ward ===")
    byWard.forEach((count, ward) => {
      console.log(`  Ward ${ward}: ${count} polling units`)
    })
    console.log()
    
    // Update database
    let updated = 0
    let notFound = 0
    let errors = 0
    
    console.log("=== Updating Database ===\n")
    
    for (const voter of votersData) {
      try {
        // Find polling unit by code
        const { data: pollingUnit, error: fetchError } = await supabase
          .from("polling_units")
          .select("id, code, name, registered_voters")
          .eq("code", voter.code)
          .single()
        
        if (fetchError || !pollingUnit) {
          if (updated + notFound + errors < 20) {
            console.log(`⚠ Not found: ${voter.code} - ${voter.name}`)
          }
          notFound++
          continue
        }
        
        // Update registered voters count
        const { error: updateError } = await supabase
          .from("polling_units")
          .update({ registered_voters: voter.registeredVoters })
          .eq("code", voter.code)
        
        if (updateError) {
          console.error(`✗ Error updating ${voter.code}:`, updateError.message)
          errors++
        } else {
          if (updated < 10 || updated % 50 === 0) {
            const oldCount = pollingUnit.registered_voters || 0
            console.log(`✓ Updated ${voter.code}: ${oldCount} → ${voter.registeredVoters} voters`)
          }
          updated++
        }
      } catch (error: any) {
        console.error(`✗ Error processing ${voter.code}:`, error.message)
        errors++
      }
    }
    
    console.log("\n=== Update Summary ===")
    console.log(`✓ Updated: ${updated}`)
    console.log(`⚠ Not found in database: ${notFound}`)
    console.log(`✗ Errors: ${errors}`)
    console.log(`Total processed: ${votersData.length}`)
    
    if (updated > 0) {
      console.log("\n✅ Registered voters data updated successfully!")
    }
    
    if (notFound > 0) {
      console.log(`\n⚠ ${notFound} polling units from the file were not found in the database.`)
      console.log("This might be due to name mismatches or missing polling units.")
    }
    
  } catch (error: any) {
    console.error("Fatal error:", error.message)
    console.error(error.stack)
    process.exit(1)
  }
}

updateRegisteredVoters()
  .then(() => {
    console.log("\nDone.")
    process.exit(0)
  })
  .catch((error) => {
    console.error("Fatal error:", error)
    process.exit(1)
  })
