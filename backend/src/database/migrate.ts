import { readFileSync } from 'fs'
import { join } from 'path'
import { pool } from './connection'

async function migrate() {
  try {
    console.log('Running database migrations...')
    
    // Use process.cwd() to get the project root, then navigate to schema file
    const schemaPath = join(process.cwd(), 'backend', 'src', 'database', 'schema.sql')
    const schema = readFileSync(schemaPath, 'utf-8')
    await pool.query(schema)
    
    console.log('Migrations completed successfully!')
    await pool.end()
    process.exit(0)
  } catch (error) {
    console.error('Migration failed:', error)
    await pool.end()
    process.exit(1)
  }
}

migrate()

