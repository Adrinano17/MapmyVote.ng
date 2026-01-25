-- Create database schema for MapmyVote.ng

-- Wards table
CREATE TABLE IF NOT EXISTS wards (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  code VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Polling Units table
CREATE TABLE IF NOT EXISTS polling_units (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  code VARCHAR(50) UNIQUE NOT NULL,
  address TEXT,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  ward_id INTEGER NOT NULL REFERENCES wards(id) ON DELETE CASCADE,
  registered_voters INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Landmarks table
CREATE TABLE IF NOT EXISTS landmarks (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  category VARCHAR(100), -- e.g., 'school', 'church', 'market', 'hospital'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Junction table for polling units and landmarks (many-to-many)
CREATE TABLE IF NOT EXISTS polling_unit_landmarks (
  id SERIAL PRIMARY KEY,
  polling_unit_id INTEGER NOT NULL REFERENCES polling_units(id) ON DELETE CASCADE,
  landmark_id INTEGER NOT NULL REFERENCES landmarks(id) ON DELETE CASCADE,
  distance_meters INTEGER, -- Distance from polling unit to landmark
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(polling_unit_id, landmark_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_polling_units_ward_id ON polling_units(ward_id);
CREATE INDEX IF NOT EXISTS idx_polling_units_location ON polling_units(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_landmarks_location ON landmarks(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_polling_unit_landmarks_pu_id ON polling_unit_landmarks(polling_unit_id);
CREATE INDEX IF NOT EXISTS idx_polling_unit_landmarks_landmark_id ON polling_unit_landmarks(landmark_id);





