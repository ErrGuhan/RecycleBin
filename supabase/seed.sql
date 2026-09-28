-- supabase/seed.sql
-- Development and Pilot Launch Seed Data

-- 1. Pilot Campus
INSERT INTO campuses (id, name, city, timezone)
VALUES (
    'a0000000-0000-0000-0000-000000000001',
    'St. Xavier''s College - Main Campus',
    'Mumbai',
    'Asia/Kolkata'
) ON CONFLICT (id) DO NOTHING;

-- 2. Initial Pilot Bins (8-char unambiguous alphabet: 23456789ABCDEFGHJKMNPQRSTUVWXYZ)
INSERT INTO bins (id, campus_id, code, name, location_label, latitude, longitude, status)
VALUES
    (
        'b0000000-0000-0000-0000-000000000001',
        'a0000000-0000-0000-0000-000000000001',
        '7K3Q9DX2',
        'Cafeteria Recycling Station A',
        'Central Food Court, Ground Floor',
        18.9431,
        72.8315,
        'active'
    ),
    (
        'b0000000-0000-0000-0000-000000000002',
        'a0000000-0000-0000-0000-000000000001',
        '9MN42BC8',
        'Library Quad Station',
        'East Walkway Entrance',
        18.9435,
        72.8319,
        'active'
    ),
    (
        'b0000000-0000-0000-0000-000000000003',
        'a0000000-0000-0000-0000-000000000001',
        '3P8R5WT4',
        'Science Block Station',
        'Chemistry Lab Corridor, 1st Floor',
        18.9428,
        72.8322,
        'active'
    )
ON CONFLICT (code) DO NOTHING;

-- 3. Plastic Types
INSERT INTO plastic_types (id, key, label, points_per_item, avg_grams, sort, active)
VALUES
    ('c0000000-0000-0000-0000-000000000001', 'pet_small', 'PET bottle up to 750 ml', 5, 15, 1, TRUE),
    ('c0000000-0000-0000-0000-000000000002', 'pet_medium', 'PET bottle 1 to 1.5 L', 8, 25, 2, TRUE),
    ('c0000000-0000-0000-0000-000000000003', 'pet_large', 'PET bottle 2 L and above', 15, 45, 3, TRUE),
    ('c0000000-0000-0000-0000-000000000004', 'rigid_other', 'Other clean rigid plastic (HDPE/PP containers, jugs)', 10, 30, 4, TRUE)
ON CONFLICT (key) DO NOTHING;

-- 4. Certificate Tiers
INSERT INTO tiers (id, key, name, min_points, sort, active)
VALUES
    ('d0000000-0000-0000-0000-000000000001', 'bronze', 'Bronze Tier', 100, 1, TRUE),
    ('d0000000-0000-0000-0000-000000000002', 'silver', 'Silver Tier', 500, 2, TRUE),
    ('d0000000-0000-0000-0000-000000000003', 'gold', 'Gold Tier', 1000, 3, TRUE),
    ('d0000000-0000-0000-0000-000000000004', 'platinum', 'Platinum Tier', 2500, 4, TRUE)
ON CONFLICT (key) DO NOTHING;

-- 5. Operational Settings
INSERT INTO settings (key, value, is_public)
VALUES
    ('program_name', '"Campus Plastic Credits"', TRUE),
    ('max_items_per_entry', '20', TRUE),
    ('max_items_per_student_per_day', '40', TRUE),
    ('min_seconds_between_entries_per_bin', '30', TRUE),
    ('tolerance_pct', '25', FALSE),
    ('geofence_meters', '150', FALSE),
    ('undo_window_minutes', '5', TRUE),
    ('default_timezone', '"Asia/Kolkata"', TRUE)
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
