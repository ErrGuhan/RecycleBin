-- 20260928000003_rls_policies.sql
-- Row-Level Security (RLS) Policies on Every Table

-- Helper function to fetch requesting user role
CREATE OR REPLACE FUNCTION current_user_role()
RETURNS user_role AS $$
    SELECT role FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Enable RLS on every table
ALTER TABLE campuses ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE bins ENABLE ROW LEVEL SECURITY;
ALTER TABLE bin_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE plastic_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE verification_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE points_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- 1. Profiles
CREATE POLICY "Users can read own profile"
    ON profiles FOR SELECT
    USING (id = auth.uid() OR current_user_role() IN ('staff', 'admin'));

CREATE POLICY "Users can update own profile onboarding fields"
    ON profiles FOR UPDATE
    USING (id = auth.uid())
    WITH CHECK (id = auth.uid());

CREATE POLICY "Admins full control on profiles"
    ON profiles FOR ALL
    USING (current_user_role() = 'admin');

-- 2. Bins (Students & anon access only through public_bin_lookup RPC)
CREATE POLICY "Staff and admin can view bins"
    ON bins FOR SELECT
    USING (current_user_role() IN ('staff', 'admin'));

CREATE POLICY "Admins full control on bins"
    ON bins FOR ALL
    USING (current_user_role() = 'admin');

CREATE POLICY "Admins full control on bin codes"
    ON bin_codes FOR ALL
    USING (current_user_role() = 'admin');

-- 3. Plastic Types & Tiers (Publicly readable for rewards display)
CREATE POLICY "Anyone can read active plastic types"
    ON plastic_types FOR SELECT
    USING (active = TRUE OR current_user_role() = 'admin');

CREATE POLICY "Admins manage plastic types"
    ON plastic_types FOR ALL
    USING (current_user_role() = 'admin');

CREATE POLICY "Anyone can read active tiers"
    ON tiers FOR SELECT
    USING (active = TRUE OR current_user_role() = 'admin');

CREATE POLICY "Admins manage tiers"
    ON tiers FOR ALL
    USING (current_user_role() = 'admin');

-- 4. Entries
-- Students can read only their own entries. Inserts are permitted ONLY through submit_entry RPC.
CREATE POLICY "Students read own entries"
    ON entries FOR SELECT
    USING (student_id = auth.uid() OR current_user_role() IN ('staff', 'admin'));

CREATE POLICY "Admins full control on entries"
    ON entries FOR ALL
    USING (current_user_role() = 'admin');

-- 5. Verification Batches (Only staff and admin)
CREATE POLICY "Staff and admin read batches"
    ON verification_batches FOR SELECT
    USING (current_user_role() IN ('staff', 'admin'));

CREATE POLICY "Admins manage batches"
    ON verification_batches FOR ALL
    USING (current_user_role() = 'admin');

-- 6. Points Ledger
-- Students can read only their own ledger rows.
CREATE POLICY "Students read own ledger rows"
    ON points_ledger FOR SELECT
    USING (student_id = auth.uid() OR current_user_role() IN ('staff', 'admin'));

-- 7. Certificates
-- Students can read only their own certificates.
CREATE POLICY "Students read own certificates"
    ON certificates FOR SELECT
    USING (student_id = auth.uid() OR current_user_role() IN ('staff', 'admin'));

CREATE POLICY "Admins manage certificates"
    ON certificates FOR ALL
    USING (current_user_role() = 'admin');

-- 8. Settings
CREATE POLICY "Anyone read public settings"
    ON settings FOR SELECT
    USING (is_public = TRUE OR current_user_role() IN ('staff', 'admin'));

CREATE POLICY "Admins manage settings"
    ON settings FOR ALL
    USING (current_user_role() = 'admin');

CREATE POLICY "Admins read settings history"
    ON settings_history FOR SELECT
    USING (current_user_role() = 'admin');

-- 9. Sales and Expenses (Strictly Admin only)
CREATE POLICY "Admins manage sales"
    ON sales FOR ALL
    USING (current_user_role() = 'admin');

CREATE POLICY "Admins manage expenses"
    ON expenses FOR ALL
    USING (current_user_role() = 'admin');

-- 10. Audit Log (Admin read-only)
CREATE POLICY "Admins read audit log"
    ON audit_log FOR SELECT
    USING (current_user_role() = 'admin');
