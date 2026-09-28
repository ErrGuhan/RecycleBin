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
