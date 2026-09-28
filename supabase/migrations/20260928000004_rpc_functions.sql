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
