/**
 * Script to run the seed SQL file to create polling units with coordinates
 * Run with: npx tsx frontend/scripts/run-seed-sql.ts
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

async function runSeedSQL() {
  console.log("Reading seed SQL file...")
  
  const sqlPath = join(process.cwd(), "scripts", "002_seed_ibadan_north_data.sql")
  const sql = readFileSync(sqlPath, "utf-8")
  
  // Split SQL into individual statements
  const statements = sql
    .split(";")
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith("--"))
  
  console.log(`Found ${statements.length} SQL statements to execute`)
  
  // Note: Supabase client doesn't support raw SQL execution directly
  // We need to use the REST API or execute via Supabase SQL Editor
  console.log("\n⚠️  Supabase client doesn't support raw SQL execution.")
  console.log("Please run the SQL file directly in Supabase SQL Editor:")
  console.log("\n1. Go to your Supabase project dashboard")
  console.log("2. Navigate to SQL Editor")
  console.log("3. Copy and paste the contents of: frontend/scripts/002_seed_ibadan_north_data.sql")
  console.log("4. Click 'Run' to execute")
  console.log("\nAlternatively, you can use the Supabase REST API with service_role key.")
  
  // Let's try to execute via RPC if available, or provide instructions
  console.log("\nOr, I can help you create the polling units programmatically...")
  
  // Check if we can use the service role key for direct SQL execution
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (serviceRoleKey) {
    console.log("\nUsing service role key to execute SQL...")
    const adminClient = createClient(supabaseUrl, serviceRoleKey)
    // Note: Even with service role, we can't execute raw SQL via the JS client
    // We'd need to use the REST API directly
  }
}

runSeedSQL()
  .then(() => {
    console.log("\nDone.")
    process.exit(0)
  })
  .catch((error) => {
    console.error("Error:", error)
    process.exit(1)
  })







