/**
 * Script to seed polling unit coordinates from the SQL file
 * Run with: npx tsx frontend/scripts/seed-coordinates.ts
 */

import { createClient } from "@supabase/supabase-js"
import { readFileSync } from "fs"
import { join } from "path"
import { config } from "dotenv"

// Load environment variables from .env.local
config({ path: join(process.cwd(), ".env.local") })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

if (!supabaseUrl || !supabaseKey) {
  console.error("Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

// Polling unit data with coordinates from the seed file
const pollingUnitsWithCoords = [
  // Ward 1: Agodi Gate/Okeere (IBN-01)
  { code: "IBN-01-001", latitude: 7.4010, longitude: 3.9187 },
  { code: "IBN-01-002", latitude: 7.4015, longitude: 3.9190 },
  { code: "IBN-01-003", latitude: 7.4020, longitude: 3.9195 },
  { code: "IBN-01-004", latitude: 7.4008, longitude: 3.9182 },
  
  // Ward 2: Oke Are/Isale Osi (IBN-02)
  { code: "IBN-02-001", latitude: 7.3980, longitude: 3.9150 },
  { code: "IBN-02-002", latitude: 7.3975, longitude: 3.9145 },
  { code: "IBN-02-003", latitude: 7.3985, longitude: 3.9155 },
  { code: "IBN-02-004", latitude: 7.3970, longitude: 3.9140 },
  
  // Ward 3: Bodija (IBN-03)
  { code: "IBN-03-001", latitude: 7.4200, longitude: 3.9100 },
  { code: "IBN-03-002", latitude: 7.4205, longitude: 3.9105 },
  { code: "IBN-03-003", latitude: 7.4210, longitude: 3.9110 },
  { code: "IBN-03-004", latitude: 7.4195, longitude: 3.9095 },
  
  // Ward 4: Samonda/Sango (IBN-04)
  { code: "IBN-04-001", latitude: 7.4440, longitude: 3.8980 },
  { code: "IBN-04-002", latitude: 7.4435, longitude: 3.8975 },
  { code: "IBN-04-003", latitude: 7.4445, longitude: 3.8985 },
  { code: "IBN-04-004", latitude: 7.4430, longitude: 3.8970 },
  
  // Ward 5: Secretariat (IBN-05)
  { code: "IBN-05-001", latitude: 7.3950, longitude: 3.9050 },
  { code: "IBN-05-002", latitude: 7.3955, longitude: 3.9055 },
  { code: "IBN-05-003", latitude: 7.3945, longitude: 3.9045 },
  { code: "IBN-05-004", latitude: 7.3960, longitude: 3.9060 },
  
  // Ward 6: Inalende/Idi-Ape (IBN-06)
  { code: "IBN-06-001", latitude: 7.3900, longitude: 3.9200 },
  { code: "IBN-06-002", latitude: 7.3905, longitude: 3.9205 },
  { code: "IBN-06-003", latitude: 7.3895, longitude: 3.9195 },
  { code: "IBN-06-004", latitude: 7.3910, longitude: 3.9210 },
  
  // Ward 7: Yemetu West (IBN-07)
  { code: "IBN-07-001", latitude: 7.3920, longitude: 3.9080 },
  { code: "IBN-07-002", latitude: 7.3925, longitude: 3.9085 },
  { code: "IBN-07-003", latitude: 7.3915, longitude: 3.9075 },
  { code: "IBN-07-004", latitude: 7.3930, longitude: 3.9090 },
  
  // Ward 8: Yemetu East (IBN-08)
  { code: "IBN-08-001", latitude: 7.3940, longitude: 3.9120 },
  { code: "IBN-08-002", latitude: 7.3945, longitude: 3.9125 },
  { code: "IBN-08-003", latitude: 7.3935, longitude: 3.9115 },
  { code: "IBN-08-004", latitude: 7.3950, longitude: 3.9130 },
  
  // Ward 9: Beere/Oja'ba (IBN-09)
  { code: "IBN-09-001", latitude: 7.3850, longitude: 3.8980 },
  { code: "IBN-09-002", latitude: 7.3855, longitude: 3.8985 },
  { code: "IBN-09-003", latitude: 7.3845, longitude: 3.8975 },
  { code: "IBN-09-004", latitude: 7.3860, longitude: 3.8990 },
  
  // Ward 10: Agugu (IBN-10)
  { code: "IBN-10-001", latitude: 7.3870, longitude: 3.9030 },
  { code: "IBN-10-002", latitude: 7.3875, longitude: 3.9035 },
  { code: "IBN-10-003", latitude: 7.3865, longitude: 3.9025 },
  { code: "IBN-10-004", latitude: 7.3880, longitude: 3.9040 },
  
  // Ward 11: Oke Aremo/Kube (IBN-11)
  { code: "IBN-11-001", latitude: 7.3830, longitude: 3.9000 },
  { code: "IBN-11-002", latitude: 7.3835, longitude: 3.9005 },
  { code: "IBN-11-003", latitude: 7.3825, longitude: 3.8995 },
  { code: "IBN-11-004", latitude: 7.3840, longitude: 3.9010 },
  
  // Ward 12: Total Garden/Gate (IBN-12)
  { code: "IBN-12-001", latitude: 7.3960, longitude: 3.9170 },
  { code: "IBN-12-002", latitude: 7.3965, longitude: 3.9175 },
  { code: "IBN-12-003", latitude: 7.3955, longitude: 3.9165 },
  { code: "IBN-12-004", latitude: 7.3970, longitude: 3.9180 },
]

async function seedCoordinates() {
  console.log("Starting to seed polling unit coordinates...")
  
  let updated = 0
  let notFound = 0
  let errors = 0

  for (const pu of pollingUnitsWithCoords) {
    try {
      // Update the polling unit with coordinates
      const { data, error } = await supabase
        .from("polling_units")
        .update({
          latitude: pu.latitude,
          longitude: pu.longitude,
        })
        .eq("code", pu.code)
        .select()

      if (error) {
        console.error(`Error updating ${pu.code}:`, error.message)
        errors++
      } else if (data && data.length > 0) {
        console.log(`✓ Updated ${pu.code} with coordinates (${pu.latitude}, ${pu.longitude})`)
        updated++
      } else {
        console.warn(`⚠ Polling unit ${pu.code} not found in database`)
        notFound++
      }
    } catch (error: any) {
      console.error(`Error processing ${pu.code}:`, error.message)
      errors++
    }
  }

  console.log("\n=== Seeding Summary ===")
  console.log(`✓ Successfully updated: ${updated}`)
  console.log(`⚠ Not found: ${notFound}`)
  console.log(`✗ Errors: ${errors}`)
  console.log(`Total processed: ${pollingUnitsWithCoords.length}`)
  
  if (updated > 0) {
    console.log("\n✅ Coordinates have been successfully seeded!")
  }
}

seedCoordinates()
  .then(() => {
    console.log("\nSeeding completed.")
    process.exit(0)
  })
  .catch((error) => {
    console.error("Seeding failed:", error)
    process.exit(1)
  })

