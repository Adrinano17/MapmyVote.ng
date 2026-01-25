-- Insert Ibadan North LGA Wards
INSERT INTO wards (name, code) VALUES
  ('Agodi Gate/Okeere', 'IBN-01'),
  ('Oke Are/Isale Osi', 'IBN-02'),
  ('Bodija', 'IBN-03'),
  ('Samonda/Sango', 'IBN-04'),
  ('Secretariat', 'IBN-05'),
  ('Inalende/Idi-Ape', 'IBN-06'),
  ('Yemetu West', 'IBN-07'),
  ('Yemetu East', 'IBN-08'),
  ('Beere/Oja''ba', 'IBN-09'),
  ('Agugu', 'IBN-10'),
  ('Oke Aremo/Kube', 'IBN-11'),
  ('Total Garden/Gate', 'IBN-12')
ON CONFLICT (code) DO NOTHING;

-- Insert sample polling units for each ward
-- Ward 1: Agodi Gate/Okeere
INSERT INTO polling_units (name, code, address, ward_id, latitude, longitude, registered_voters)
SELECT 
  pu.name, pu.code, pu.address, w.id, pu.latitude, pu.longitude, pu.registered_voters
FROM (VALUES
  ('L.A. Primary School I', 'IBN-01-001', 'Agodi Gate, Ibadan', 7.4010, 3.9187, 850),
  ('L.A. Primary School II', 'IBN-01-002', 'Agodi Gate, Ibadan', 7.4015, 3.9190, 720),
  ('St. Mary''s Catholic School', 'IBN-01-003', 'Okeere, Ibadan', 7.4020, 3.9195, 680),
  ('Community Hall Agodi', 'IBN-01-004', 'Agodi, Ibadan', 7.4008, 3.9182, 790)
) AS pu(name, code, address, latitude, longitude, registered_voters)
CROSS JOIN wards w WHERE w.code = 'IBN-01'
ON CONFLICT (code) DO NOTHING;

-- Ward 2: Oke Are/Isale Osi
INSERT INTO polling_units (name, code, address, ward_id, latitude, longitude, registered_voters)
SELECT 
  pu.name, pu.code, pu.address, w.id, pu.latitude, pu.longitude, pu.registered_voters
FROM (VALUES
  ('Baptist School Oke Are', 'IBN-02-001', 'Oke Are, Ibadan', 7.3980, 3.9150, 920),
  ('Central Primary School', 'IBN-02-002', 'Isale Osi, Ibadan', 7.3975, 3.9145, 815),
  ('Methodist School I', 'IBN-02-003', 'Oke Are Road, Ibadan', 7.3985, 3.9155, 750),
  ('Town Hall Isale Osi', 'IBN-02-004', 'Isale Osi, Ibadan', 7.3970, 3.9140, 680)
) AS pu(name, code, address, latitude, longitude, registered_voters)
CROSS JOIN wards w WHERE w.code = 'IBN-02'
ON CONFLICT (code) DO NOTHING;

-- Ward 3: Bodija
INSERT INTO polling_units (name, code, address, ward_id, latitude, longitude, registered_voters)
SELECT 
  pu.name, pu.code, pu.address, w.id, pu.latitude, pu.longitude, pu.registered_voters
FROM (VALUES
  ('Bodija Market Square I', 'IBN-03-001', 'Bodija Market, Ibadan', 7.4200, 3.9100, 1250),
  ('Bodija Market Square II', 'IBN-03-002', 'Bodija Market, Ibadan', 7.4205, 3.9105, 1180),
  ('Estate Primary School', 'IBN-03-003', 'Bodija Estate, Ibadan', 7.4210, 3.9110, 890),
  ('Bodija Community Center', 'IBN-03-004', 'Bodija, Ibadan', 7.4195, 3.9095, 1050)
) AS pu(name, code, address, latitude, longitude, registered_voters)
CROSS JOIN wards w WHERE w.code = 'IBN-03'
ON CONFLICT (code) DO NOTHING;

-- Ward 4: Samonda/Sango
INSERT INTO polling_units (name, code, address, ward_id, latitude, longitude, registered_voters)
SELECT 
  pu.name, pu.code, pu.address, w.id, pu.latitude, pu.longitude, pu.registered_voters
FROM (VALUES
  ('University of Ibadan Gate', 'IBN-04-001', 'UI Road, Samonda', 7.4440, 3.8980, 980),
  ('Sango Primary School', 'IBN-04-002', 'Sango, Ibadan', 7.4435, 3.8975, 850),
  ('Samonda Community Hall', 'IBN-04-003', 'Samonda, Ibadan', 7.4445, 3.8985, 920),
  ('Polytechnic Junction', 'IBN-04-004', 'Sango-UI Road, Ibadan', 7.4430, 3.8970, 780)
) AS pu(name, code, address, latitude, longitude, registered_voters)
CROSS JOIN wards w WHERE w.code = 'IBN-04'
ON CONFLICT (code) DO NOTHING;

-- Ward 5: Secretariat
INSERT INTO polling_units (name, code, address, ward_id, latitude, longitude, registered_voters)
SELECT 
  pu.name, pu.code, pu.address, w.id, pu.latitude, pu.longitude, pu.registered_voters
FROM (VALUES
  ('Government Secretariat I', 'IBN-05-001', 'Secretariat Road, Ibadan', 7.3950, 3.9050, 1100),
  ('Government Secretariat II', 'IBN-05-002', 'Secretariat Road, Ibadan', 7.3955, 3.9055, 1050),
  ('Staff School Secretariat', 'IBN-05-003', 'Secretariat, Ibadan', 7.3945, 3.9045, 890),
  ('Agodi Gardens', 'IBN-05-004', 'Agodi Gardens, Ibadan', 7.3960, 3.9060, 720)
) AS pu(name, code, address, latitude, longitude, registered_voters)
CROSS JOIN wards w WHERE w.code = 'IBN-05'
ON CONFLICT (code) DO NOTHING;

-- Ward 6: Inalende/Idi-Ape
INSERT INTO polling_units (name, code, address, ward_id, latitude, longitude, registered_voters)
SELECT 
  pu.name, pu.code, pu.address, w.id, pu.latitude, pu.longitude, pu.registered_voters
FROM (VALUES
  ('Inalende Primary School', 'IBN-06-001', 'Inalende, Ibadan', 7.3900, 3.9200, 780),
  ('Idi-Ape Junction Hall', 'IBN-06-002', 'Idi-Ape, Ibadan', 7.3905, 3.9205, 850),
  ('Community Primary School', 'IBN-06-003', 'Inalende Road, Ibadan', 7.3895, 3.9195, 690),
  ('Mosque Open Space', 'IBN-06-004', 'Idi-Ape, Ibadan', 7.3910, 3.9210, 720)
) AS pu(name, code, address, latitude, longitude, registered_voters)
CROSS JOIN wards w WHERE w.code = 'IBN-06'
ON CONFLICT (code) DO NOTHING;

-- Ward 7: Yemetu West
INSERT INTO polling_units (name, code, address, ward_id, latitude, longitude, registered_voters)
SELECT 
  pu.name, pu.code, pu.address, w.id, pu.latitude, pu.longitude, pu.registered_voters
FROM (VALUES
  ('Yemetu Primary School I', 'IBN-07-001', 'Yemetu, Ibadan', 7.3920, 3.9080, 920),
  ('Yemetu Health Center', 'IBN-07-002', 'Yemetu, Ibadan', 7.3925, 3.9085, 780),
  ('Adeoyo Hospital Area', 'IBN-07-003', 'Adeoyo, Ibadan', 7.3915, 3.9075, 850),
  ('Methodist Church Yemetu', 'IBN-07-004', 'Yemetu Road, Ibadan', 7.3930, 3.9090, 680)
) AS pu(name, code, address, latitude, longitude, registered_voters)
CROSS JOIN wards w WHERE w.code = 'IBN-07'
ON CONFLICT (code) DO NOTHING;

-- Ward 8: Yemetu East
INSERT INTO polling_units (name, code, address, ward_id, latitude, longitude, registered_voters)
SELECT 
  pu.name, pu.code, pu.address, w.id, pu.latitude, pu.longitude, pu.registered_voters
FROM (VALUES
  ('Yemetu Primary School II', 'IBN-08-001', 'Yemetu East, Ibadan', 7.3940, 3.9120, 870),
  ('Oke-Ado Market', 'IBN-08-002', 'Oke-Ado, Ibadan', 7.3945, 3.9125, 950),
  ('Community Hall Yemetu East', 'IBN-08-003', 'Yemetu East, Ibadan', 7.3935, 3.9115, 720),
  ('Anglican School Yemetu', 'IBN-08-004', 'Yemetu, Ibadan', 7.3950, 3.9130, 810)
) AS pu(name, code, address, latitude, longitude, registered_voters)
CROSS JOIN wards w WHERE w.code = 'IBN-08'
ON CONFLICT (code) DO NOTHING;

-- Ward 9: Beere/Oja'ba
INSERT INTO polling_units (name, code, address, ward_id, latitude, longitude, registered_voters)
SELECT 
  pu.name, pu.code, pu.address, w.id, pu.latitude, pu.longitude, pu.registered_voters
FROM (VALUES
  ('Beere Roundabout', 'IBN-09-001', 'Beere, Ibadan', 7.3850, 3.8980, 1100),
  ('Oja''ba Market', 'IBN-09-002', 'Oja''ba, Ibadan', 7.3855, 3.8985, 1250),
  ('Mapo Hall Open Space', 'IBN-09-003', 'Mapo, Ibadan', 7.3845, 3.8975, 980),
  ('Central Mosque Beere', 'IBN-09-004', 'Beere, Ibadan', 7.3860, 3.8990, 890)
) AS pu(name, code, address, latitude, longitude, registered_voters)
CROSS JOIN wards w WHERE w.code = 'IBN-09'
ON CONFLICT (code) DO NOTHING;

-- Ward 10: Agugu
INSERT INTO polling_units (name, code, address, ward_id, latitude, longitude, registered_voters)
SELECT 
  pu.name, pu.code, pu.address, w.id, pu.latitude, pu.longitude, pu.registered_voters
FROM (VALUES
  ('Agugu Primary School', 'IBN-10-001', 'Agugu, Ibadan', 7.3870, 3.9030, 820),
  ('Agugu Community Center', 'IBN-10-002', 'Agugu, Ibadan', 7.3875, 3.9035, 750),
  ('L.A. School Agugu', 'IBN-10-003', 'Agugu Road, Ibadan', 7.3865, 3.9025, 690),
  ('Town Hall Agugu', 'IBN-10-004', 'Agugu, Ibadan', 7.3880, 3.9040, 780)
) AS pu(name, code, address, latitude, longitude, registered_voters)
CROSS JOIN wards w WHERE w.code = 'IBN-10'
ON CONFLICT (code) DO NOTHING;

-- Ward 11: Oke Aremo/Kube
INSERT INTO polling_units (name, code, address, ward_id, latitude, longitude, registered_voters)
SELECT 
  pu.name, pu.code, pu.address, w.id, pu.latitude, pu.longitude, pu.registered_voters
FROM (VALUES
  ('Oke Aremo Primary School', 'IBN-11-001', 'Oke Aremo, Ibadan', 7.3830, 3.9000, 880),
  ('Kube Community Hall', 'IBN-11-002', 'Kube, Ibadan', 7.3835, 3.9005, 790),
  ('Baptist School Oke Aremo', 'IBN-11-003', 'Oke Aremo Road, Ibadan', 7.3825, 3.8995, 720),
  ('Market Square Kube', 'IBN-11-004', 'Kube, Ibadan', 7.3840, 3.9010, 850)
) AS pu(name, code, address, latitude, longitude, registered_voters)
CROSS JOIN wards w WHERE w.code = 'IBN-11'
ON CONFLICT (code) DO NOTHING;

-- Ward 12: Total Garden/Gate
INSERT INTO polling_units (name, code, address, ward_id, latitude, longitude, registered_voters)
SELECT 
  pu.name, pu.code, pu.address, w.id, pu.latitude, pu.longitude, pu.registered_voters
FROM (VALUES
  ('Total Garden Junction', 'IBN-12-001', 'Total Garden, Ibadan', 7.3960, 3.9170, 950),
  ('Gate Primary School', 'IBN-12-002', 'Gate, Ibadan', 7.3965, 3.9175, 880),
  ('Mokola Roundabout', 'IBN-12-003', 'Mokola, Ibadan', 7.3955, 3.9165, 1020),
  ('UCH Gate Area', 'IBN-12-004', 'UCH Road, Ibadan', 7.3970, 3.9180, 920)
) AS pu(name, code, address, latitude, longitude, registered_voters)
CROSS JOIN wards w WHERE w.code = 'IBN-12'
ON CONFLICT (code) DO NOTHING;
