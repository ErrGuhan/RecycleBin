-- 20260928000005_profile_fields_and_plastic_types.sql
-- Add detailed student profile fields (first_name, last_name, semester)
-- and expand plastic recyclable categories beyond bottles (cups, meal boxes, film pouches, cutlery).

-- 1. Profiles additions
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS first_name TEXT,
ADD COLUMN IF NOT EXISTS last_name TEXT,
ADD COLUMN IF NOT EXISTS semester TEXT;

-- Policy to allow inserting own profile if not exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can insert own profile'
    ) THEN
        CREATE POLICY "Users can insert own profile"
            ON profiles FOR INSERT
            WITH CHECK (id = auth.uid());
    END IF;
END $$;

-- 2. New Plastic Categories beyond bottles
INSERT INTO plastic_types (id, key, label, points_per_item, avg_grams, sort, active)
VALUES
    ('c0000000-0000-0000-0000-000000000005', 'plastic_cup', 'Clean Plastic Cups & Tumblers', 5, 12, 4, TRUE),
    ('c0000000-0000-0000-0000-000000000006', 'food_container', 'Food Containers & Meal Trays', 10, 28, 5, TRUE),
    ('c0000000-0000-0000-0000-000000000007', 'soft_film', 'Clean Pouches & Wrappers', 4, 8, 6, TRUE),
    ('c0000000-0000-0000-0000-000000000008', 'cutlery_rigid', 'Cutlery, Straws & Caps', 3, 6, 7, TRUE)
ON CONFLICT (key) DO UPDATE SET
    label = EXCLUDED.label,
    points_per_item = EXCLUDED.points_per_item,
    avg_grams = EXCLUDED.avg_grams,
    sort = EXCLUDED.sort,
    active = EXCLUDED.active;
