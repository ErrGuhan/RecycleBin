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
