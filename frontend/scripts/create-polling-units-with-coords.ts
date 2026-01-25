/**
 * Script to create polling units with coordinates programmatically
 * Run with: npx tsx frontend/scripts/create-polling-units-with-coords.ts
 */

import { createClient } from "@supabase/supabase-js"
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

// Polling unit data with all fields including coordinates
const pollingUnitsData = [
  // Ward 1: Agodi Gate/Okeere (IBN-01)
  { code: "IBN-01-001", name: "L.A. Primary School I", address: "Agodi Gate, Ibadan", wardCode: "IBN-01", latitude: 7.4010, longitude: 3.9187, registeredVoters: 850 },
  { code: "IBN-01-002", name: "L.A. Primary School II", address: "Agodi Gate, Ibadan", wardCode: "IBN-01", latitude: 7.4015, longitude: 3.9190, registeredVoters: 720 },
  { code: "IBN-01-003", name: "St. Mary's Catholic School", address: "Okeere, Ibadan", wardCode: "IBN-01", latitude: 7.4020, longitude: 3.9195, registeredVoters: 680 },
  { code: "IBN-01-004", name: "Community Hall Agodi", address: "Agodi, Ibadan", wardCode: "IBN-01", latitude: 7.4008, longitude: 3.9182, registeredVoters: 790 },
  
  // Ward 2: Oke Are/Isale Osi (IBN-02)
  { code: "IBN-02-001", name: "Baptist School Oke Are", address: "Oke Are, Ibadan", wardCode: "IBN-02", latitude: 7.3980, longitude: 3.9150, registeredVoters: 920 },
  { code: "IBN-02-002", name: "Central Primary School", address: "Isale Osi, Ibadan", wardCode: "IBN-02", latitude: 7.3975, longitude: 3.9145, registeredVoters: 815 },
  { code: "IBN-02-003", name: "Methodist School I", address: "Oke Are Road, Ibadan", wardCode: "IBN-02", latitude: 7.3985, longitude: 3.9155, registeredVoters: 750 },
  { code: "IBN-02-004", name: "Town Hall Isale Osi", address: "Isale Osi, Ibadan", wardCode: "IBN-02", latitude: 7.3970, longitude: 3.9140, registeredVoters: 680 },
  
  // Ward 3: Bodija (IBN-03)
  { code: "IBN-03-001", name: "Bodija Market Square I", address: "Bodija Market, Ibadan", wardCode: "IBN-03", latitude: 7.4200, longitude: 3.9100, registeredVoters: 1250 },
  { code: "IBN-03-002", name: "Bodija Market Square II", address: "Bodija Market, Ibadan", wardCode: "IBN-03", latitude: 7.4205, longitude: 3.9105, registeredVoters: 1180 },
  { code: "IBN-03-003", name: "Estate Primary School", address: "Bodija Estate, Ibadan", wardCode: "IBN-03", latitude: 7.4210, longitude: 3.9110, registeredVoters: 890 },
  { code: "IBN-03-004", name: "Bodija Community Center", address: "Bodija, Ibadan", wardCode: "IBN-03", latitude: 7.4195, longitude: 3.9095, registeredVoters: 1050 },
  
  // Ward 4: Samonda/Sango (IBN-04)
  { code: "IBN-04-001", name: "University of Ibadan Gate", address: "UI Road, Samonda", wardCode: "IBN-04", latitude: 7.4440, longitude: 3.8980, registeredVoters: 980 },
  { code: "IBN-04-002", name: "Sango Primary School", address: "Sango, Ibadan", wardCode: "IBN-04", latitude: 7.4435, longitude: 3.8975, registeredVoters: 850 },
  { code: "IBN-04-003", name: "Samonda Community Hall", address: "Samonda, Ibadan", wardCode: "IBN-04", latitude: 7.4445, longitude: 3.8985, registeredVoters: 920 },
  { code: "IBN-04-004", name: "Polytechnic Junction", address: "Sango-UI Road, Ibadan", wardCode: "IBN-04", latitude: 7.4430, longitude: 3.8970, registeredVoters: 780 },
  
  // Ward 5: Secretariat (IBN-05)
  { code: "IBN-05-001", name: "Government Secretariat I", address: "Secretariat Road, Ibadan", wardCode: "IBN-05", latitude: 7.3950, longitude: 3.9050, registeredVoters: 1100 },
  { code: "IBN-05-002", name: "Government Secretariat II", address: "Secretariat Road, Ibadan", wardCode: "IBN-05", latitude: 7.3955, longitude: 3.9055, registeredVoters: 1050 },
  { code: "IBN-05-003", name: "Staff School Secretariat", address: "Secretariat, Ibadan", wardCode: "IBN-05", latitude: 7.3945, longitude: 3.9045, registeredVoters: 890 },
  { code: "IBN-05-004", name: "Agodi Gardens", address: "Agodi Gardens, Ibadan", wardCode: "IBN-05", latitude: 7.3960, longitude: 3.9060, registeredVoters: 720 },
  
  // Ward 6: Inalende/Idi-Ape (IBN-06)
  { code: "IBN-06-001", name: "Inalende Primary School", address: "Inalende, Ibadan", wardCode: "IBN-06", latitude: 7.3900, longitude: 3.9200, registeredVoters: 780 },
  { code: "IBN-06-002", name: "Idi-Ape Junction Hall", address: "Idi-Ape, Ibadan", wardCode: "IBN-06", latitude: 7.3905, longitude: 3.9205, registeredVoters: 850 },
  { code: "IBN-06-003", name: "Community Primary School", address: "Inalende Road, Ibadan", wardCode: "IBN-06", latitude: 7.3895, longitude: 3.9195, registeredVoters: 690 },
  { code: "IBN-06-004", name: "Mosque Open Space", address: "Idi-Ape, Ibadan", wardCode: "IBN-06", latitude: 7.3910, longitude: 3.9210, registeredVoters: 720 },
  
  // Ward 7: Yemetu West (IBN-07)
  { code: "IBN-07-001", name: "Yemetu Primary School I", address: "Yemetu, Ibadan", wardCode: "IBN-07", latitude: 7.3920, longitude: 3.9080, registeredVoters: 920 },
  { code: "IBN-07-002", name: "Yemetu Health Center", address: "Yemetu, Ibadan", wardCode: "IBN-07", latitude: 7.3925, longitude: 3.9085, registeredVoters: 780 },
  { code: "IBN-07-003", name: "Adeoyo Hospital Area", address: "Adeoyo, Ibadan", wardCode: "IBN-07", latitude: 7.3915, longitude: 3.9075, registeredVoters: 850 },
  { code: "IBN-07-004", name: "Methodist Church Yemetu", address: "Yemetu Road, Ibadan", wardCode: "IBN-07", latitude: 7.3930, longitude: 3.9090, registeredVoters: 680 },
  
  // Ward 8: Yemetu East (IBN-08)
  { code: "IBN-08-001", name: "Yemetu Primary School II", address: "Yemetu East, Ibadan", wardCode: "IBN-08", latitude: 7.3940, longitude: 3.9120, registeredVoters: 870 },
  { code: "IBN-08-002", name: "Oke-Ado Market", address: "Oke-Ado, Ibadan", wardCode: "IBN-08", latitude: 7.3945, longitude: 3.9125, registeredVoters: 950 },
  { code: "IBN-08-003", name: "Community Hall Yemetu East", address: "Yemetu East, Ibadan", wardCode: "IBN-08", latitude: 7.3935, longitude: 3.9115, registeredVoters: 720 },
  { code: "IBN-08-004", name: "Anglican School Yemetu", address: "Yemetu, Ibadan", wardCode: "IBN-08", latitude: 7.3950, longitude: 3.9130, registeredVoters: 810 },
  
  // Ward 9: Beere/Oja'ba (IBN-09)
  { code: "IBN-09-001", name: "Beere Roundabout", address: "Beere, Ibadan", wardCode: "IBN-09", latitude: 7.3850, longitude: 3.8980, registeredVoters: 1100 },
  { code: "IBN-09-002", name: "Oja'ba Market", address: "Oja'ba, Ibadan", wardCode: "IBN-09", latitude: 7.3855, longitude: 3.8985, registeredVoters: 1250 },
  { code: "IBN-09-003", name: "Mapo Hall Open Space", address: "Mapo, Ibadan", wardCode: "IBN-09", latitude: 7.3845, longitude: 3.8975, registeredVoters: 980 },
  { code: "IBN-09-004", name: "Central Mosque Beere", address: "Beere, Ibadan", wardCode: "IBN-09", latitude: 7.3860, longitude: 3.8990, registeredVoters: 890 },
  
  // Ward 10: Agugu (IBN-10)
  { code: "IBN-10-001", name: "Agugu Primary School", address: "Agugu, Ibadan", wardCode: "IBN-10", latitude: 7.3870, longitude: 3.9030, registeredVoters: 820 },
  { code: "IBN-10-002", name: "Agugu Community Center", address: "Agugu, Ibadan", wardCode: "IBN-10", latitude: 7.3875, longitude: 3.9035, registeredVoters: 750 },
  { code: "IBN-10-003", name: "L.A. School Agugu", address: "Agugu Road, Ibadan", wardCode: "IBN-10", latitude: 7.3865, longitude: 3.9025, registeredVoters: 690 },
  { code: "IBN-10-004", name: "Town Hall Agugu", address: "Agugu, Ibadan", wardCode: "IBN-10", latitude: 7.3880, longitude: 3.9040, registeredVoters: 780 },
  
  // Ward 11: Oke Aremo/Kube (IBN-11)
  { code: "IBN-11-001", name: "Oke Aremo Primary School", address: "Oke Aremo, Ibadan", wardCode: "IBN-11", latitude: 7.3830, longitude: 3.9000, registeredVoters: 880 },
  { code: "IBN-11-002", name: "Kube Community Hall", address: "Kube, Ibadan", wardCode: "IBN-11", latitude: 7.3835, longitude: 3.9005, registeredVoters: 790 },
  { code: "IBN-11-003", name: "Baptist School Oke Aremo", address: "Oke Aremo Road, Ibadan", wardCode: "IBN-11", latitude: 7.3825, longitude: 3.8995, registeredVoters: 720 },
  { code: "IBN-11-004", name: "Market Square Kube", address: "Kube, Ibadan", wardCode: "IBN-11", latitude: 7.3840, longitude: 3.9010, registeredVoters: 850 },
  
  // Ward 12: Total Garden/Gate (IBN-12)
  { code: "IBN-12-001", name: "Total Garden Junction", address: "Total Garden, Ibadan", wardCode: "IBN-12", latitude: 7.3960, longitude: 3.9170, registeredVoters: 950 },
  { code: "IBN-12-002", name: "Gate Primary School", address: "Gate, Ibadan", wardCode: "IBN-12", latitude: 7.3965, longitude: 3.9175, registeredVoters: 880 },
  { code: "IBN-12-003", name: "Mokola Roundabout", address: "Mokola, Ibadan", wardCode: "IBN-12", latitude: 7.3955, longitude: 3.9165, registeredVoters: 1020 },
  { code: "IBN-12-004", name: "UCH Gate Area", address: "UCH Road, Ibadan", wardCode: "IBN-12", latitude: 7.3970, longitude: 3.9180, registeredVoters: 920 },
]

async function createPollingUnits() {
  console.log("Starting to create/update polling units with coordinates...")
  
  // First, get all wards to map ward codes to IDs
  const { data: wards, error: wardsError } = await supabase
    .from("wards")
    .select("id, code")
  
  if (wardsError) {
    console.error("Error fetching wards:", wardsError)
    return
  }
  
  const wardMap = new Map(wards?.map(w => [w.code, w.id]) || [])
  console.log(`Found ${wardMap.size} wards`)
  
  let created = 0
  let updated = 0
  let errors = 0
  
  for (const pu of pollingUnitsData) {
    try {
      const wardId = wardMap.get(pu.wardCode)
      if (!wardId) {
        console.warn(`⚠ Ward ${pu.wardCode} not found, skipping ${pu.code}`)
        errors++
        continue
      }
      
      // Try to find existing polling unit
      const { data: existing } = await supabase
        .from("polling_units")
        .select("id")
        .eq("code", pu.code)
        .single()
      
      if (existing) {
        // Update existing
        const { error } = await supabase
          .from("polling_units")
          .update({
            name: pu.name,
            address: pu.address,
            latitude: pu.latitude,
            longitude: pu.longitude,
            registered_voters: pu.registeredVoters,
            ward_id: wardId,
          })
          .eq("code", pu.code)
        
        if (error) {
          console.error(`✗ Error updating ${pu.code}:`, error.message)
          errors++
        } else {
          console.log(`✓ Updated ${pu.code} - ${pu.name}`)
          updated++
        }
      } else {
        // Create new
        const { error } = await supabase
          .from("polling_units")
          .insert({
            code: pu.code,
            name: pu.name,
            address: pu.address,
            latitude: pu.latitude,
            longitude: pu.longitude,
            registered_voters: pu.registeredVoters,
            ward_id: wardId,
          })
        
        if (error) {
          console.error(`✗ Error creating ${pu.code}:`, error.message)
          errors++
        } else {
          console.log(`✓ Created ${pu.code} - ${pu.name}`)
          created++
        }
      }
    } catch (error: any) {
      console.error(`✗ Error processing ${pu.code}:`, error.message)
      errors++
    }
  }
  
  console.log("\n=== Summary ===")
  console.log(`✓ Created: ${created}`)
  console.log(`✓ Updated: ${updated}`)
  console.log(`✗ Errors: ${errors}`)
  console.log(`Total processed: ${pollingUnitsData.length}`)
  
  if (created + updated > 0) {
    console.log("\n✅ Polling units with coordinates have been successfully created/updated!")
  }
}

createPollingUnits()
  .then(() => {
    console.log("\nDone.")
    process.exit(0)
  })
  .catch((error) => {
    console.error("Fatal error:", error)
    process.exit(1)
  })







