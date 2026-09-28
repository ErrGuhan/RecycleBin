-- ==========================================================================
-- COMBINED MIGRATION & SEED SCRIPT FOR SUPABASE PROJECT zfopmdjmdahqvsgmwful
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/zfopmdjmdahqvsgmwful/sql/new
-- ==========================================================================


-- ==========================================================================
-- FILE: supabase/migrations/20260928000001_initial_schema.sql
-- ==========================================================================

-- 20260928000001_initial_schema.sql
-- Campus Plastic Credits Portal - Schema Definition

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Enums
CREATE TYPE user_role AS ENUM ('student', 'staff', 'admin');
CREATE TYPE user_status AS ENUM ('pending_onboarding', 'active', 'suspended', 'anonymized');
CREATE TYPE bin_status AS ENUM ('active', 'inactive', 'maintenance');
CREATE TYPE entry_status AS ENUM ('pending', 'verified', 'rejected', 'cancelled');
CREATE TYPE batch_decision AS ENUM ('approve_all', 'scaled', 'reviewed');
CREATE TYPE batch_status AS ENUM ('open', 'finalized', 'cancelled');
CREATE TYPE ledger_kind AS ENUM ('earn', 'reversal', 'adjustment');
CREATE TYPE certificate_status AS ENUM ('issued', 'revoked');

-- 1. Campuses
CREATE TABLE campuses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    city TEXT NOT NULL,
    timezone TEXT NOT NULL DEFAULT 'Asia/Kolkata',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Profiles (extends auth.users)
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    campus_id UUID REFERENCES campuses(id) ON DELETE RESTRICT,
    role user_role NOT NULL DEFAULT 'student',
    full_name TEXT NOT NULL,
    roll_no TEXT,
    department TEXT,
    year TEXT,
    phone TEXT,
    is_adult BOOLEAN NOT NULL DEFAULT TRUE,
    show_on_leaderboard BOOLEAN NOT NULL DEFAULT FALSE,
    consent_version TEXT NOT NULL DEFAULT '1.0',
    consented_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    status user_status NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_campus_roll_no UNIQUE (campus_id, roll_no)
);

-- 3. Bins & Bin Codes
CREATE TABLE bins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campus_id UUID NOT NULL REFERENCES campuses(id) ON DELETE RESTRICT,
    code VARCHAR(8) NOT NULL UNIQUE,
    name TEXT NOT NULL,
    location_label TEXT NOT NULL,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    status bin_status NOT NULL DEFAULT 'active',
    last_verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE bin_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bin_id UUID NOT NULL REFERENCES bins(id) ON DELETE CASCADE,
    code VARCHAR(8) NOT NULL UNIQUE,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    deactivated_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Plastic Types
CREATE TABLE plastic_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key VARCHAR(50) NOT NULL UNIQUE,
    label TEXT NOT NULL,
    points_per_item INT NOT NULL CHECK (points_per_item > 0),
    avg_grams INT NOT NULL CHECK (avg_grams > 0),
    active BOOLEAN NOT NULL DEFAULT TRUE,
    sort INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Verification Batches
CREATE TABLE verification_batches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bin_id UUID NOT NULL REFERENCES bins(id) ON DELETE RESTRICT,
    created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
    cutoff_at TIMESTAMPTZ NOT NULL,
    weighed_grams INT NOT NULL CHECK (weighed_grams >= 0),
    tare_grams INT NOT NULL DEFAULT 0 CHECK (tare_grams >= 0),
    expected_grams INT NOT NULL DEFAULT 0,
    ratio NUMERIC(6,4),
    entries_count INT NOT NULL DEFAULT 0,
    items_count INT NOT NULL DEFAULT 0,
    decision batch_decision,
    scale_factor NUMERIC(5,4) DEFAULT 1.0000,
    status batch_status NOT NULL DEFAULT 'open',
    note TEXT,
    scale_photo_path TEXT,
    finalized_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Partial unique index: only ONE open batch allowed per bin at any time
CREATE UNIQUE INDEX idx_one_open_batch_per_bin ON verification_batches(bin_id) WHERE status = 'open';

-- 6. Entries
CREATE TABLE entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
    bin_id UUID NOT NULL REFERENCES bins(id) ON DELETE RESTRICT,
    plastic_type_id UUID NOT NULL REFERENCES plastic_types(id) ON DELETE RESTRICT,
    items INT NOT NULL CHECK (items > 0 AND items <= 20),
    points_per_item_snapshot INT NOT NULL,
    avg_grams_snapshot INT NOT NULL,
    status entry_status NOT NULL DEFAULT 'pending',
    batch_id UUID REFERENCES verification_batches(id) ON DELETE SET NULL,
    points_awarded INT,
    flags TEXT[] DEFAULT '{}',
    lat DOUBLE PRECISION,
    lng DOUBLE PRECISION,
    accuracy_m DOUBLE PRECISION,
    idempotency_key VARCHAR(120) NOT NULL,
    decision_note TEXT,
    decided_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_student_idempotency UNIQUE (student_id, idempotency_key)
);

-- 7. Points Ledger (Append-Only)
CREATE TABLE points_ledger (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
    entry_id UUID REFERENCES entries(id) ON DELETE RESTRICT,
    batch_id UUID REFERENCES verification_batches(id) ON DELETE RESTRICT,
    points INT NOT NULL,
    kind ledger_kind NOT NULL,
    note TEXT,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. Tiers
CREATE TABLE tiers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key VARCHAR(50) NOT NULL UNIQUE,
    name TEXT NOT NULL,
    min_points INT NOT NULL UNIQUE CHECK (min_points >= 0),
    sort INT NOT NULL DEFAULT 0,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. Certificates
CREATE TABLE certificates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
    tier_id UUID NOT NULL REFERENCES tiers(id) ON DELETE RESTRICT,
    certificate_no VARCHAR(32) NOT NULL UNIQUE,
    items_at_issue INT NOT NULL,
    points_at_issue INT NOT NULL,
    pdf_path TEXT,
    status certificate_status NOT NULL DEFAULT 'issued',
    issued_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_student_tier UNIQUE (student_id, tier_id)
);

-- 10. Settings & History
CREATE TABLE settings (
    key VARCHAR(80) PRIMARY KEY,
    value JSONB NOT NULL,
    is_public BOOLEAN NOT NULL DEFAULT FALSE,
    updated_by UUID REFERENCES auth.users(id),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE settings_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key VARCHAR(80) NOT NULL,
    old_value JSONB,
    new_value JSONB NOT NULL,
    changed_by UUID REFERENCES auth.users(id),
    changed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. Accounting: Sales & Expenses (Integer paise and grams)
CREATE TABLE sales (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sale_date DATE NOT NULL,
    buyer TEXT NOT NULL,
    plastic_kind TEXT NOT NULL,
    weight_grams INT NOT NULL CHECK (weight_grams > 0),
    rate_paise_per_kg INT NOT NULL CHECK (rate_paise_per_kg > 0),
    amount_paise BIGINT NOT NULL CHECK (amount_paise > 0),
    invoice_ref TEXT,
    note TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    expense_date DATE NOT NULL,
    category TEXT NOT NULL,
    amount_paise BIGINT NOT NULL CHECK (amount_paise > 0),
    note TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 12. Audit Log
CREATE TABLE audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id UUID REFERENCES auth.users(id),
    action TEXT NOT NULL,
    target_type TEXT NOT NULL,
    target_id UUID,
    before JSONB,
    after JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Performance Indexes
CREATE INDEX idx_entries_bin_status_created ON entries (bin_id, status, created_at);
CREATE INDEX idx_entries_student_created ON entries (student_id, created_at);
CREATE INDEX idx_points_ledger_student ON points_ledger (student_id);
CREATE INDEX idx_bins_code ON bins (code);
CREATE INDEX idx_certificates_cert_no ON certificates (certificate_no);


-- ==========================================================================
-- FILE: supabase/migrations/20260928000002_views_and_triggers.sql
-- ==========================================================================

-- 20260928000002_views_and_triggers.sql
-- Append-Only Protections, Immutable Rules, and Views

-- 1. Trigger Function: Enforce Append-Only on points_ledger
CREATE OR REPLACE FUNCTION enforce_points_ledger_append_only()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'points_ledger is append-only: UPDATE and DELETE operations are strictly prohibited.'
        USING ERRCODE = '23505';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_points_ledger_append_only
BEFORE UPDATE OR DELETE ON points_ledger
FOR EACH ROW
EXECUTE FUNCTION enforce_points_ledger_append_only();

-- 2. Trigger Function: Audit settings changes
CREATE OR REPLACE FUNCTION log_settings_change()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO settings_history (key, old_value, new_value, changed_by)
    VALUES (NEW.key, OLD.value, NEW.value, auth.uid());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_settings_history
AFTER UPDATE ON settings
FOR EACH ROW
EXECUTE FUNCTION log_settings_change();

-- 3. View: student_totals
CREATE OR REPLACE VIEW student_totals AS
SELECT
    p.id AS student_id,
    p.full_name,
    p.roll_no,
    p.campus_id,
    COALESCE(SUM(l.points), 0) AS lifetime_points,
    COUNT(DISTINCT e.id) AS total_drops,
    COALESCE(SUM(CASE WHEN e.status = 'pending' THEN e.items ELSE 0 END), 0) AS pending_items,
    COALESCE(SUM(CASE WHEN e.status = 'verified' THEN e.items ELSE 0 END), 0) AS verified_items,
    COALESCE(SUM(CASE WHEN e.status = 'verified' THEN (e.items * e.avg_grams_snapshot) ELSE 0 END), 0) AS verified_grams
FROM profiles p
LEFT JOIN points_ledger l ON l.student_id = p.id
LEFT JOIN entries e ON e.student_id = p.id
GROUP BY p.id, p.full_name, p.roll_no, p.campus_id;

-- 4. View: bin_pending
CREATE OR REPLACE VIEW bin_pending AS
SELECT
    b.id AS bin_id,
    b.code,
    b.name,
    b.campus_id,
    b.last_verified_at,
    COALESCE(SUM(CASE WHEN e.status = 'pending' THEN e.items ELSE 0 END), 0) AS pending_items,
    COALESCE(SUM(CASE WHEN e.status = 'pending' THEN (e.items * e.avg_grams_snapshot) ELSE 0 END), 0) AS expected_grams,
    MIN(CASE WHEN e.status = 'pending' THEN e.created_at ELSE NULL END) AS oldest_pending_entry,
    CASE
        WHEN b.last_verified_at IS NULL THEN NULL
        ELSE EXTRACT(DAY FROM NOW() - b.last_verified_at)::INT
    END AS days_since_last_verified
FROM bins b
LEFT JOIN entries e ON e.bin_id = b.id
GROUP BY b.id, b.code, b.name, b.campus_id, b.last_verified_at;

-- 5. View: campus_daily_stats
CREATE OR REPLACE VIEW campus_daily_stats AS
SELECT
    b.campus_id,
    DATE(e.created_at AT TIME ZONE COALESCE(c.timezone, 'Asia/Kolkata')) AS collection_date,
    COUNT(DISTINCT e.student_id) AS active_students,
    COUNT(e.id) AS total_entries,
    SUM(e.items) AS total_items,
    SUM(CASE WHEN e.status = 'verified' THEN e.items ELSE 0 END) AS verified_items,
    SUM(CASE WHEN e.status = 'verified' THEN (e.items * e.avg_grams_snapshot) ELSE 0 END) AS verified_grams
FROM entries e
JOIN bins b ON b.id = e.bin_id
JOIN campuses c ON c.id = b.campus_id
GROUP BY b.campus_id, DATE(e.created_at AT TIME ZONE COALESCE(c.timezone, 'Asia/Kolkata')), c.timezone;


-- ==========================================================================
-- FILE: supabase/migrations/20260928000003_rls_policies.sql
-- ==========================================================================

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


-- ==========================================================================
-- FILE: supabase/migrations/20260928000004_rpc_functions.sql
-- ==========================================================================

-- 20260928000004_rpc_functions.sql
-- Business Logic in Postgres Functions (SECURITY DEFINER, explicit search_path)

-- 1. public_bin_lookup(code) (anon safe)
CREATE OR REPLACE FUNCTION public_bin_lookup(p_code TEXT)
RETURNS TABLE (
    code VARCHAR(8),
    name TEXT,
    location_label TEXT,
    status bin_status
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    RETURN QUERY
    SELECT b.code, b.name, b.location_label, b.status
    FROM bins b
    WHERE b.code = UPPER(TRIM(p_code));
END;
$$;

-- 2. submit_entry (student authenticated)
CREATE OR REPLACE FUNCTION submit_entry(
    p_bin_code VARCHAR(8),
    p_plastic_type_id UUID,
    p_items INT,
    p_idempotency_key VARCHAR(120),
    p_lat DOUBLE PRECISION DEFAULT NULL,
    p_lng DOUBLE PRECISION DEFAULT NULL,
    p_accuracy_m DOUBLE PRECISION DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_user_id UUID;
    v_bin bins%ROWTYPE;
    v_plastic plastic_types%ROWTYPE;
    v_entry_id UUID;
    v_flags TEXT[] := '{}';
    v_daily_items_logged INT;
    v_last_entry_time TIMESTAMPTZ;
    v_distance_m DOUBLE PRECISION;
BEGIN
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Authentication required.' USING ERRCODE = '42501';
    END IF;

    -- Verify profile is active
    IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = v_user_id AND status = 'active') THEN
        RAISE EXCEPTION 'User profile is not active or requires onboarding.' USING ERRCODE = '42501';
    END IF;

    -- Validate items range (1..20)
    IF p_items < 1 OR p_items > 20 THEN
        RAISE EXCEPTION 'Items per drop must be between 1 and 20.' USING ERRCODE = '22003';
    END IF;

    -- Lookup bin
    SELECT * INTO v_bin FROM bins WHERE code = UPPER(TRIM(p_bin_code));
    IF NOT FOUND OR v_bin.status != 'active' THEN
        RAISE EXCEPTION 'Bin is inactive or not found.' USING ERRCODE = '22000';
    END IF;

    -- Lookup plastic type
    SELECT * INTO v_plastic FROM plastic_types WHERE id = p_plastic_type_id AND active = TRUE;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Plastic category is inactive or invalid.' USING ERRCODE = '22000';
    END IF;

    -- Check Cooldown per bin (30 seconds)
    SELECT MAX(created_at) INTO v_last_entry_time
    FROM entries
    WHERE student_id = v_user_id AND bin_id = v_bin.id;

    IF v_last_entry_time IS NOT NULL AND v_last_entry_time > NOW() - INTERVAL '30 seconds' THEN
        RAISE EXCEPTION 'Please wait 30 seconds between drops at the same bin.' USING ERRCODE = '22000';
    END IF;

    -- Check Daily Limit (40 items/day in Asia/Kolkata timezone)
    SELECT COALESCE(SUM(items), 0) INTO v_daily_items_logged
    FROM entries
    WHERE student_id = v_user_id
      AND status != 'cancelled'
      AND DATE(created_at AT TIME ZONE 'Asia/Kolkata') = DATE(NOW() AT TIME ZONE 'Asia/Kolkata');

    IF v_daily_items_logged + p_items > 40 THEN
        RAISE EXCEPTION 'Daily limit of 40 items reached. Please log remaining items after midnight.' USING ERRCODE = '22000';
    END IF;

    -- Check Geofence (flag only, never block)
    IF p_lat IS NULL OR p_lng IS NULL THEN
        v_flags := array_append(v_flags, 'no_gps');
    ELSIF v_bin.latitude IS NOT NULL AND v_bin.longitude IS NOT NULL THEN
        -- Approx haversine distance in meters
        v_distance_m := 6371000 * 2 * ASIN(SQRT(
            POWER(SIN(RADIANS(p_lat - v_bin.latitude) / 2), 2) +
            COS(RADIANS(v_bin.latitude)) * COS(RADIANS(p_lat)) *
            POWER(SIN(RADIANS(p_lng - v_bin.longitude) / 2), 2)
        ));
        IF v_distance_m > 150 THEN
            v_flags := array_append(v_flags, 'far_from_bin');
        END IF;
    END IF;

    -- Insert Entry with Snapshotted Rates
    INSERT INTO entries (
        student_id,
        bin_id,
        plastic_type_id,
        items,
        points_per_item_snapshot,
        avg_grams_snapshot,
        status,
        flags,
        lat,
        lng,
        accuracy_m,
        idempotency_key
    ) VALUES (
        v_user_id,
        v_bin.id,
        v_plastic.id,
        p_items,
        v_plastic.points_per_item,
        v_plastic.avg_grams,
        'pending',
        v_flags,
        p_lat,
        p_lng,
        p_accuracy_m,
        p_idempotency_key
    )
    RETURNING id INTO v_entry_id;

    RETURN v_entry_id;
END;
$$;

-- 3. undo_entry (within 5 minutes, while unbatched & pending)
CREATE OR REPLACE FUNCTION undo_entry(p_entry_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_user_id UUID;
    v_entry entries%ROWTYPE;
BEGIN
    v_user_id := auth.uid();
    SELECT * INTO v_entry FROM entries WHERE id = p_entry_id;

    IF NOT FOUND OR v_entry.student_id != v_user_id THEN
        RAISE EXCEPTION 'Entry not found or unauthorized.' USING ERRCODE = '42501';
    END IF;

    IF v_entry.status != 'pending' OR v_entry.batch_id IS NOT NULL THEN
        RAISE EXCEPTION 'Entry cannot be undone once batched or finalized.' USING ERRCODE = '22000';
    END IF;

    IF v_entry.created_at < NOW() - INTERVAL '5 minutes' THEN
        RAISE EXCEPTION 'Undo window (5 minutes) has expired.' USING ERRCODE = '22000';
    END IF;

    UPDATE entries
    SET status = 'cancelled',
        decided_at = NOW(),
        decision_note = 'Cancelled by student within undo window'
    WHERE id = p_entry_id;

    RETURN TRUE;
END;
$$;

-- 4. create_batch (staff or admin weighing moment is cutoff)
CREATE OR REPLACE FUNCTION create_batch(
    p_bin_id UUID,
    p_weighed_grams INT,
    p_tare_grams INT DEFAULT 0,
    p_note TEXT DEFAULT NULL,
    p_scale_photo_path TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_caller_role user_role;
    v_batch_id UUID;
    v_cutoff TIMESTAMPTZ := NOW();
    v_expected_grams INT := 0;
    v_items_count INT := 0;
    v_entries_count INT := 0;
    v_net_weighed INT;
    v_ratio NUMERIC(6,4);
BEGIN
    SELECT role INTO v_caller_role FROM profiles WHERE id = auth.uid();
    IF v_caller_role NOT IN ('staff', 'admin') THEN
        RAISE EXCEPTION 'Staff or Admin role required to create verification batches.' USING ERRCODE = '42501';
    END IF;

    v_net_weighed := GREATEST(0, p_weighed_grams - p_tare_grams);

    -- Calculate expected grams and lock pending entries
    SELECT
        COALESCE(SUM(items * avg_grams_snapshot), 0),
        COALESCE(SUM(items), 0),
        COUNT(id)
    INTO v_expected_grams, v_items_count, v_entries_count
    FROM entries
    WHERE bin_id = p_bin_id
      AND status = 'pending'
      AND batch_id IS NULL
      AND created_at <= v_cutoff
    FOR UPDATE;

    IF v_entries_count = 0 THEN
        RAISE EXCEPTION 'No pending entries available for this bin up to cutoff.' USING ERRCODE = '22000';
    END IF;

    IF v_expected_grams > 0 THEN
        v_ratio := ROUND((v_net_weighed::NUMERIC / v_expected_grams::NUMERIC), 4);
    ELSE
        v_ratio := 1.0;
    END IF;

    -- Create batch
    INSERT INTO verification_batches (
        bin_id,
        created_by,
        cutoff_at,
        weighed_grams,
        tare_grams,
        expected_grams,
        ratio,
        entries_count,
        items_count,
        status,
        note,
        scale_photo_path
    ) VALUES (
        p_bin_id,
        auth.uid(),
        v_cutoff,
        p_weighed_grams,
        p_tare_grams,
        v_expected_grams,
        v_ratio,
        v_entries_count,
        v_items_count,
        'open',
        p_note,
        p_scale_photo_path
    )
    RETURNING id INTO v_batch_id;

    -- Assign batch_id to locked entries
    UPDATE entries
    SET batch_id = v_batch_id
    WHERE bin_id = p_bin_id
      AND status = 'pending'
      AND batch_id IS NULL
      AND created_at <= v_cutoff;

    RETURN v_batch_id;
END;
$$;

-- 5. cancel_batch (returns entries to pending)
CREATE OR REPLACE FUNCTION cancel_batch(p_batch_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_caller_role user_role;
BEGIN
    SELECT role INTO v_caller_role FROM profiles WHERE id = auth.uid();
    IF v_caller_role NOT IN ('staff', 'admin') THEN
        RAISE EXCEPTION 'Unauthorized.' USING ERRCODE = '42501';
    END IF;

    -- Release entries back to pending
    UPDATE entries
    SET batch_id = NULL
    WHERE batch_id = p_batch_id AND status = 'pending';

    UPDATE verification_batches
    SET status = 'cancelled'
    WHERE id = p_batch_id AND status = 'open';

    RETURN TRUE;
END;
$$;

-- 6. finalize_batch (atomic ledger credits, audit, and certificate evaluations)
CREATE OR REPLACE FUNCTION finalize_batch(
    p_batch_id UUID,
    p_decision batch_decision,
    p_scale_factor NUMERIC(5,4) DEFAULT 1.0000,
    p_note TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_caller_role user_role;
    v_batch verification_batches%ROWTYPE;
    v_entry RECORD;
    v_points INT;
    v_student_id UUID;
BEGIN
    SELECT role INTO v_caller_role FROM profiles WHERE id = auth.uid();
    IF v_caller_role NOT IN ('staff', 'admin') THEN
        RAISE EXCEPTION 'Unauthorized.' USING ERRCODE = '42501';
    END IF;

    SELECT * INTO v_batch FROM verification_batches WHERE id = p_batch_id AND status = 'open' FOR UPDATE;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Batch not found or already finalized.' USING ERRCODE = '22000';
    END IF;

    -- Enforce ratio rules: ratio < 0.5 cannot approve_all
    IF v_batch.ratio < 0.5000 AND p_decision = 'approve_all' THEN
        RAISE EXCEPTION 'Approve all is disabled for severely underweight batches (<50%%).' USING ERRCODE = '22000';
    END IF;

    -- Process all batched entries
    FOR v_entry IN
        SELECT id, student_id, items, points_per_item_snapshot
        FROM entries
        WHERE batch_id = p_batch_id AND status = 'pending'
    LOOP
        v_points := ROUND(v_entry.items * v_entry.points_per_item_snapshot * p_scale_factor);

        -- Update entry
        UPDATE entries
        SET status = 'verified',
            points_awarded = v_points,
            decided_at = NOW(),
            decision_note = p_note
        WHERE id = v_entry.id;

        -- Append to points_ledger (strictly INSERT)
        INSERT INTO points_ledger (
            student_id,
            entry_id,
            batch_id,
            points,
            kind,
            note,
            created_by
        ) VALUES (
            v_entry.student_id,
            v_entry.id,
            p_batch_id,
            v_points,
            'earn',
            COALESCE(p_note, 'Batch verified'),
            auth.uid()
        );

        -- Check and issue tier certificates for student
        PERFORM issue_tier_certificates(v_entry.student_id);
    END LOOP;

    -- Finalize batch record
    UPDATE verification_batches
    SET status = 'finalized',
        decision = p_decision,
        scale_factor = p_scale_factor,
        finalized_at = NOW(),
        note = p_note
    WHERE id = p_batch_id;

    -- Update bin last_verified_at
    UPDATE bins
    SET last_verified_at = NOW()
    WHERE id = v_batch.bin_id;

    -- Log to audit_log
    INSERT INTO audit_log (actor_id, action, target_type, target_id, after)
    VALUES (auth.uid(), 'finalize_batch', 'verification_batches', p_batch_id,
            jsonb_build_object('decision', p_decision, 'scale_factor', p_scale_factor, 'note', p_note));

    RETURN TRUE;
END;
$$;

-- 7. issue_tier_certificates (idempotent threshold check)
CREATE OR REPLACE FUNCTION issue_tier_certificates(p_student_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_total_points INT;
    v_tier RECORD;
    v_cert_no TEXT;
    v_items_count INT;
BEGIN
    -- Compute lifetime points
    SELECT COALESCE(SUM(points), 0) INTO v_total_points
    FROM points_ledger
    WHERE student_id = p_student_id;

    -- Compute total verified items
    SELECT COALESCE(SUM(items), 0) INTO v_items_count
    FROM entries
    WHERE student_id = p_student_id AND status = 'verified';

    -- Evaluate each active tier
    FOR v_tier IN
        SELECT id, key, name, min_points
        FROM tiers
        WHERE active = TRUE AND v_total_points >= min_points
        ORDER BY min_points ASC
    LOOP
        -- Unique constraint on (student_id, tier_id) ensures idempotency
        IF NOT EXISTS (SELECT 1 FROM certificates WHERE student_id = p_student_id AND tier_id = v_tier.id) THEN
            -- Generate 8-character unique alphanumeric certificate code like CPC-2026-XXXXXX
            v_cert_no := 'CPC-2026-' || UPPER(SUBSTRING(MD5(gen_random_uuid()::TEXT) FROM 1 FOR 6));

            INSERT INTO certificates (
                student_id,
                tier_id,
                certificate_no,
                items_at_issue,
                points_at_issue,
                status
            ) VALUES (
                p_student_id,
                v_tier.id,
                v_cert_no,
                v_items_count,
                v_total_points,
                'issued'
            );
        END IF;
    END LOOP;
END;
$$;

-- 8. verify_certificate (public masked lookup)
CREATE OR REPLACE FUNCTION verify_certificate(p_certificate_no TEXT)
RETURNS TABLE (
    certificate_no VARCHAR(32),
    recipient_masked TEXT,
    tier_name TEXT,
    campus_name TEXT,
    issued_at TIMESTAMPTZ,
    items_at_issue INT,
    points_at_issue INT,
    status certificate_status
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    RETURN QUERY
    SELECT
        c.certificate_no,
        -- Mask name: First name + Last initial (e.g. "Aditya K.")
        SPLIT_PART(p.full_name, ' ', 1) || ' ' || SUBSTRING(SPLIT_PART(p.full_name, ' ', 2) FROM 1 FOR 1) || '.' AS recipient_masked,
        t.name AS tier_name,
        camp.name AS campus_name,
        c.issued_at,
        c.items_at_issue,
        c.points_at_issue,
        c.status
    FROM certificates c
    JOIN profiles p ON p.id = c.student_id
    JOIN tiers t ON t.id = c.tier_id
    JOIN campuses camp ON camp.id = p.campus_id
    WHERE c.certificate_no = UPPER(TRIM(p_certificate_no));
END;
$$;

-- 9. public_stats (anon aggregated summary)
CREATE OR REPLACE FUNCTION public_stats()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_total_verified_grams BIGINT;
    v_total_items BIGINT;
    v_active_students INT;
    v_total_certs INT;
BEGIN
    SELECT COALESCE(SUM(items * avg_grams_snapshot), 0) INTO v_total_verified_grams
    FROM entries WHERE status = 'verified';

    SELECT COALESCE(SUM(items), 0) INTO v_total_items
    FROM entries WHERE status = 'verified';

    SELECT COUNT(DISTINCT student_id) INTO v_active_students
    FROM entries;

    SELECT COUNT(id) INTO v_total_certs
    FROM certificates WHERE status = 'issued';

    RETURN jsonb_build_object(
        'verified_kg', ROUND((v_total_verified_grams::NUMERIC / 1000.0), 1),
        'verified_items', v_total_items,
        'active_students', v_active_students,
        'certificates_issued', v_total_certs
    );
END;
$$;


-- ==========================================================================
-- FILE: supabase/seed.sql
-- ==========================================================================

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

