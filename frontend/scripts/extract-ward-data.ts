/**
 * Script to extract ward and polling unit data from database
 * Run with: npx tsx scripts/extract-ward-data.ts
 */

import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

if (!supabaseUrl || !supabaseKey) {
  console.error("Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

interface Ward {
  id: string
  code: string
  name: string
  description?: string
}

interface PollingUnit {
  id: string
  code: string
  name: string
  ward_id: string
  address?: string
  latitude?: number
  longitude?: number
  registered_voters?: number
}

async function extractData() {
  console.log("Extracting ward and polling unit data...\n")

  // Get all wards
  const { data: wards, error: wardsError } = await supabase
    .from("wards")
    .select("*")
    .order("code")

  if (wardsError) {
    console.error("Error fetching wards:", wardsError)
    return
  }

  // Get all polling units with ward information
  const { data: pollingUnits, error: pollingUnitsError } = await supabase
    .from("polling_units")
    .select("*, ward:wards(*)")
    .order("ward_id, code")

  if (pollingUnitsError) {
    console.error("Error fetching polling units:", pollingUnitsError)
    return
  }

  // Organize data by ward
  const dataByWard: Record<string, { ward: Ward; pollingUnits: PollingUnit[] }> = {}

  wards?.forEach((ward) => {
    dataByWard[ward.code] = {
      ward,
      pollingUnits: [],
    }
  })

  pollingUnits?.forEach((pu) => {
    const wardCode = (pu.ward as any)?.code || "Unknown"
    if (dataByWard[wardCode]) {
      dataByWard[wardCode].pollingUnits.push(pu)
    }
  })

  // Generate output
  let output = "# Ward and Polling Unit Data\n\n"
  output += "Generated on: " + new Date().toISOString() + "\n\n"
  output += `Total Wards: ${wards?.length || 0}\n`
  output += `Total Polling Units: ${pollingUnits?.length || 0}\n\n`
  output += "---\n\n"

  Object.entries(dataByWard)
    .sort(([a], [b]) => a.localeCompare(b))
    .forEach(([wardCode, { ward, pollingUnits }]) => {
      output += `## ${ward.name} (Code: ${ward.code})\n\n`
      if (ward.description) {
        output += `Description: ${ward.description}\n\n`
      }
      output += `Polling Units: ${pollingUnits.length}\n\n`

      pollingUnits.forEach((pu, index) => {
        output += `${index + 1}. **${pu.name}** (Code: ${pu.code})\n`
        if (pu.address) {
          output += `   - Address: ${pu.address}\n`
        }
        if (pu.latitude && pu.longitude) {
          output += `   - Coordinates: ${pu.latitude}, ${pu.longitude}\n`
        }
        if (pu.registered_voters) {
          output += `   - Registered Voters: ${pu.registered_voters.toLocaleString()}\n`
        }
        output += "\n"
      })

      output += "---\n\n"
    })

  // Write to file
  const fs = require("fs")
  const path = require("path")
  const outputPath = path.join(process.cwd(), "WARD_POLLING_UNIT_DATA.md")
  fs.writeFileSync(outputPath, output, "utf-8")

  console.log(`✅ Data extracted successfully!\n`)
  console.log(`📄 Output file: ${outputPath}\n`)
  console.log(`📊 Summary:`)
  console.log(`   - Wards: ${wards?.length || 0}`)
  console.log(`   - Polling Units: ${pollingUnits?.length || 0}`)
}

extractData().catch(console.error)












