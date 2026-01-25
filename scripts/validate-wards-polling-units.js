/**
 * AI-Powered Ward and Polling Unit Name Validator
 * 
 * Run with: node scripts/validate-wards-polling-units.js
 * 
 * Make sure to set these environment variables:
 * - OPENAI_API_KEY
 * - NEXT_PUBLIC_SUPABASE_URL
 * - NEXT_PUBLIC_SUPABASE_ANON_KEY
 */

const { createClient } = require('@supabase/supabase-js')
const OpenAI = require('openai')
const fs = require('fs').promises

const OPENAI_API_KEY = process.env.OPENAI_API_KEY || "sx1PiDccCev9t_gjHOSNx8PUGVEotCybQceXv82LzzSJO9KWcTc414c9G_abCAa5W4sosbXTSyT3BlbkFJQDZrafFglVaaHs0RU144O2oZz6mlO7UwezgWCpej13q_19fShWSQeH4yaaulAHPlOpZohA0JkA"
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error("❌ Missing Supabase credentials. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY")
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
const openai = new OpenAI({ apiKey: OPENAI_API_KEY })

async function validateWardNames() {
  console.log("🔍 Fetching wards from database...")
  
  const { data: wards, error } = await supabase
    .from("wards")
    .select("*")
    .order("code")

  if (error) {
    console.error("❌ Error fetching wards:", error)
    return []
  }

  console.log(`✅ Found ${wards?.length || 0} wards\n`)

  const results = []

  for (const ward of wards || []) {
    console.log(`\n📋 Validating Ward: ${ward.code} - ${ward.name}`)
    
    // Get polling units for this ward
    const { data: pollingUnits } = await supabase
      .from("polling_units")
      .select("code, name")
      .eq("ward_id", ward.id)
      .order("code")

    const prompt = `You are a Nigerian electoral geography expert. I need you to validate and suggest correct names for wards and polling units in Ibadan North Local Government Area, Oyo State, Nigeria.

Current Ward Information:
- Code: ${ward.code}
- Name: ${ward.name}

Polling Units in this ward:
${pollingUnits?.map((pu) => `- ${pu.code}: ${pu.name}`).join("\n") || "None found"}

Please provide:
1. The correct/official name for this ward (if different from current)
2. The area/neighborhood where this ward is located
3. For each polling unit, suggest the correct/official name if different

Format your response as JSON:
{
  "wardName": "Correct ward name",
  "area": "Area/neighborhood name",
  "pollingUnits": [
    {"code": "PU_CODE", "name": "Correct polling unit name"}
  ]
}

Only suggest changes if you are confident the current name is incorrect or misspelled. If the name is correct, use the same name.`

    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are a Nigerian electoral geography expert specializing in Ibadan North LGA. Provide accurate, official names for wards and polling units. Respond only with valid JSON."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.3
      })

      const response = JSON.parse(completion.choices[0]?.message?.content || "{}")
      
      results.push({
        code: ward.code,
        currentName: ward.name,
        suggestedName: response.wardName || ward.name,
        area: response.area || "",
        pollingUnits: (pollingUnits || []).map((pu) => {
          const suggested = response.pollingUnits?.find((spu) => spu.code === pu.code)
          return {
            code: pu.code,
            currentName: pu.name,
            suggestedName: suggested?.name || pu.name
          }
        })
      })

      console.log(`   ✅ Suggested: ${response.wardName || ward.name}`)
      if (response.area) {
        console.log(`   📍 Area: ${response.area}`)
      }
    } catch (error) {
      console.error(`   ❌ Error validating ward ${ward.code}:`, error.message)
      results.push({
        code: ward.code,
        currentName: ward.name,
        pollingUnits: (pollingUnits || []).map((pu) => ({
          code: pu.code,
          currentName: pu.name
        }))
      })
    }

    // Rate limiting - wait 1 second between requests
    await new Promise(resolve => setTimeout(resolve, 1000))
  }

  return results
}

async function main() {
  console.log("🚀 Starting Ward and Polling Unit Name Validation\n")
  console.log("=".repeat(60))
  
  const results = await validateWardNames()

  // Write results to file
  const outputPath = "validated-wards-polling-units.json"
  
  await fs.writeFile(
    outputPath,
    JSON.stringify(results, null, 2),
    "utf-8"
  )

  console.log("\n" + "=".repeat(60))
  console.log(`\n✅ Validation complete! Results saved to: ${outputPath}`)
  console.log(`\n📊 Summary:`)
  console.log(`   - Total Wards: ${results.length}`)
  console.log(`   - Wards with suggested changes: ${results.filter(r => r.suggestedName && r.suggestedName !== r.currentName).length}`)
  console.log(`   - Total Polling Units: ${results.reduce((sum, r) => sum + r.pollingUnits.length, 0)}`)
  
  // Create a readable report
  const reportPath = "validated-wards-polling-units-report.txt"
  let report = "IBADAN NORTH LGA - VALIDATED WARD AND POLLING UNIT NAMES\n"
  report += "=".repeat(80) + "\n\n"
  
  for (const ward of results) {
    report += `WARD: ${ward.code}\n`
    report += `  Current Name: ${ward.currentName}\n`
    if (ward.suggestedName && ward.suggestedName !== ward.currentName) {
      report += `  ✅ Suggested Name: ${ward.suggestedName}\n`
    }
    if (ward.area) {
      report += `  📍 Area: ${ward.area}\n`
    }
    report += `  Polling Units (${ward.pollingUnits.length}):\n`
    
    for (const pu of ward.pollingUnits) {
      report += `    - ${pu.code}: ${pu.currentName}`
      if (pu.suggestedName && pu.suggestedName !== pu.currentName) {
        report += ` → ✅ ${pu.suggestedName}`
      }
      report += "\n"
    }
    report += "\n"
  }
  
  await fs.writeFile(reportPath, report, "utf-8")
  console.log(`   - Human-readable report: ${reportPath}\n`)
  console.log("📝 Please review the files and manually verify the suggested names before updating the database.\n")
}

main().catch(console.error)

