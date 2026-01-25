-- Create wards table first (parent reference)
CREATE TABLE IF NOT EXISTS wards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create polling_units table
CREATE TABLE IF NOT EXISTS polling_units (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  address TEXT,
  ward_id UUID NOT NULL REFERENCES wards(id) ON DELETE CASCADE,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  registered_voters INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster searches
CREATE INDEX IF NOT EXISTS idx_polling_units_name ON polling_units USING gin(to_tsvector('english', name));
CREATE INDEX IF NOT EXISTS idx_polling_units_code ON polling_units(code);
CREATE INDEX IF NOT EXISTS idx_polling_units_ward ON polling_units(ward_id);
CREATE INDEX IF NOT EXISTS idx_wards_name ON wards USING gin(to_tsvector('english', name));

-- Enable RLS but allow public read access (polling unit data is public information)
ALTER TABLE wards ENABLE ROW LEVEL SECURITY;
ALTER TABLE polling_units ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read polling units and wards (public electoral data)
CREATE POLICY "Allow public read access to wards" ON wards FOR SELECT USING (true);
CREATE POLICY "Allow public read access to polling_units" ON polling_units FOR SELECT USING (true);
