import { pool } from './connection'

// Sample data for Ibadan North LGA
const wards = [
  { name: 'Ward 1', code: 'IB_NORTH_001' },
  { name: 'Ward 2', code: 'IB_NORTH_002' },
  { name: 'Ward 3', code: 'IB_NORTH_003' },
  { name: 'Ward 4', code: 'IB_NORTH_004' },
  { name: 'Ward 5', code: 'IB_NORTH_005' },
]

// Sample polling units (coordinates are approximate for Ibadan North)
const pollingUnits = [
  // Ward 1
  { name: 'Polling Unit 001', code: 'PU_001', ward: 1, lat: 7.3775, lng: 3.9470, address: 'Agodi Gate Area' },
  { name: 'Polling Unit 002', code: 'PU_002', ward: 1, lat: 7.3800, lng: 3.9500, address: 'Bodija Market Area' },
  
  // Ward 2
  { name: 'Polling Unit 003', code: 'PU_003', ward: 2, lat: 7.3750, lng: 3.9450, address: 'University of Ibadan Area' },
  { name: 'Polling Unit 004', code: 'PU_004', ward: 2, lat: 7.3700, lng: 3.9400, address: 'Sango Area' },
  
  // Ward 3
  { name: 'Polling Unit 005', code: 'PU_005', ward: 3, lat: 7.3850, lng: 3.9550, address: 'Mokola Area' },
  { name: 'Polling Unit 006', code: 'PU_006', ward: 3, lat: 7.3900, lng: 3.9600, address: 'Agbowo Area' },
  
  // Ward 4
  { name: 'Polling Unit 007', code: 'PU_007', ward: 4, lat: 7.3650, lng: 3.9350, address: 'Iwo Road Area' },
  { name: 'Polling Unit 008', code: 'PU_008', ward: 4, lat: 7.3600, lng: 3.9300, address: 'Challenge Area' },
  
  // Ward 5
  { name: 'Polling Unit 009', code: 'PU_009', ward: 5, lat: 7.3950, lng: 3.9650, address: 'Ojoo Area' },
  { name: 'Polling Unit 010', code: 'PU_010', ward: 5, lat: 7.4000, lng: 3.9700, address: 'UI Area' },
]

// Sample landmarks
const landmarks = [
  { name: 'Agodi Gardens', lat: 7.3780, lng: 3.9480, category: 'park' },
  { name: 'Bodija Market', lat: 7.3810, lng: 3.9510, category: 'market' },
  { name: 'University of Ibadan Main Gate', lat: 7.3760, lng: 3.9460, category: 'institution' },
  { name: 'Mokola Roundabout', lat: 7.3860, lng: 3.9560, category: 'landmark' },
  { name: 'Iwo Road Motor Park', lat: 7.3660, lng: 3.9360, category: 'transport' },
]

async function seed() {
  try {
    console.log('Seeding database...')

    // Clear existing data
    await pool.query('DELETE FROM polling_unit_landmarks')
    await pool.query('DELETE FROM landmarks')
    await pool.query('DELETE FROM polling_units')
    await pool.query('DELETE FROM wards')

    // Insert wards
    console.log('Inserting wards...')
    for (const ward of wards) {
      await pool.query(
        'INSERT INTO wards (name, code) VALUES ($1, $2) RETURNING id',
        [ward.name, ward.code]
      )
    }

    // Get ward IDs
    const wardResults = await pool.query('SELECT id, code FROM wards ORDER BY id')
    const wardMap = new Map(wardResults.rows.map(w => [w.code, w.id]))

    // Insert polling units
    console.log('Inserting polling units...')
    for (const pu of pollingUnits) {
      const wardId = wardMap.get(wards[pu.ward - 1].code)
      await pool.query(
        'INSERT INTO polling_units (name, code, address, latitude, longitude, ward_id) VALUES ($1, $2, $3, $4, $5, $6)',
        [pu.name, pu.code, pu.address, pu.lat, pu.lng, wardId]
      )
    }

    // Insert landmarks
    console.log('Inserting landmarks...')
    const landmarkIds: number[] = []
    for (const landmark of landmarks) {
      const result = await pool.query(
        'INSERT INTO landmarks (name, latitude, longitude, category) VALUES ($1, $2, $3, $4) RETURNING id',
        [landmark.name, landmark.lat, landmark.lng, landmark.category]
      )
      landmarkIds.push(result.rows[0].id)
    }

    // Link landmarks to nearby polling units (simple distance-based)
    console.log('Linking landmarks to polling units...')
    const puResults = await pool.query('SELECT id, latitude, longitude FROM polling_units')
    
    for (const pu of puResults.rows) {
      for (let i = 0; i < landmarks.length; i++) {
        const landmark = landmarks[i]
        // Calculate approximate distance (simplified)
        const distance = Math.sqrt(
          Math.pow(pu.latitude - landmark.lat, 2) + 
          Math.pow(pu.longitude - landmark.lng, 2)
        ) * 111000 // Rough conversion to meters
        
        // Link if within 2km
        if (distance < 2000) {
          await pool.query(
            'INSERT INTO polling_unit_landmarks (polling_unit_id, landmark_id, distance_meters) VALUES ($1, $2, $3)',
            [pu.id, landmarkIds[i], Math.round(distance)]
          )
        }
      }
    }

    console.log('Seeding completed successfully!')
    await pool.end()
    process.exit(0)
  } catch (error) {
    console.error('Seeding failed:', error)
    await pool.end()
    process.exit(1)
  }
}

seed()

