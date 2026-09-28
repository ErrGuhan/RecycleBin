# Campus Plastic Credits: Operations Runbook

This runbook outlines operational procedures for campus administrators, station supervisors, and sustainability staff managing the **Campus Plastic Credits Portal**.

---

## 1. Daily / Weekly Weighing Cycle (Batch Verification)

### Step 1: Physical Inspection & Weighing
1. Approach the bin station (e.g. `Cafeteria Station A`, code `7K3Q9DX2`).
2. Remove the collection bag containing clean, empty plastic items.
3. Place the bag on the calibrated industrial digital scale.
4. Record the **Gross Weight** (e.g. 4,150 grams) and subtract tare bag weight (e.g. 150 grams) to get **Net Plastic Weight** (4,000 grams).

### Step 2: Digital Verification Wizard (`/admin/verify`)
1. Log in to the Admin Console at `/admin`.
2. Navigate to **Verify Bins** (`/admin/verify`).
3. Select the bin from the active dropdown. The system automatically creates a batch snapshot locking all pending submissions up to the cut-off timestamp.
4. Review the **Declared Items Summary**:
   - Total items dropped by students (e.g., 142 items).
   - Expected calculated weight based on snapshotted baselines (e.g., 3,920 grams).
5. Enter the **Actual Net Weight** from your physical scale (e.g., 4,000 grams).
6. Inspect the **Discrepancy Ratio Gauge**:
   - `Actual / Expected = 4,000 / 3,920 = 1.02` (Within ±15% tolerance).
   - If **Within Tolerance**, click **"Verify & Finalize Batch"**. Points are permanently credited to students in the append-only ledger via Postgres RPC `finalize_batch`.
   - If **Outside Tolerance** (e.g., ratio 0.65 or 1.40):
     - Check the physical bag for non-plastic contaminants or liquids.
     - Enter an **Admin Justification Note** explaining the variance (e.g., "Heavy rigid containers with residual moisture").
     - Confirm with administrative override.

---

## 2. Generating & Printing Physical QR Plates

1. Navigate to **Campus Bins** (`/admin/bins`).
2. Locate the target bin card.
3. Click the **"Download Plate (PDF)"** icon.
4. The system serves an official, high-resolution A4/A5 PDF formatted with:
   - Official Bisleri branding header.
   - High-contrast QR code (minimum 8 cm x 8 cm, Error Correction Level Q, Quiet Zone 4).
   - Prominent 8-character fallback code.
   - 3-step student instructions and clean-plastic warning.
5. Print on outdoor UV-resistant weatherproof matte sticker stock or mount behind clear acrylic.

---

## 3. Rotating Bin QR Codes

To prevent unauthorized off-campus photo scanning:
1. Navigate to **Campus Bins** (`/admin/bins`).
2. Click **Rotate Code** on the bin card.
3. The system generates a new, unambiguous 8-character code from the alphabet (`23456789ABCDEFGHJKMNPQRSTUVWXYZ`).
4. Old URLs immediately return an archived status.
5. Print and mount the replacement plate immediately.

---

## 4. Ledger Corrections & Adjustments

The points ledger is **append-only** (`trg_points_ledger_append_only` strictly forbids SQL `UPDATE` or `DELETE`).
- If an admin accidentally over-credits or under-credits points, do NOT attempt database updates.
- Issue an **Adjustment Transaction** with a negative or positive delta and a mandatory audit reason:
  ```sql
  INSERT INTO points_ledger (student_id, delta_points, balance_after, reason, notes)
  VALUES ('<student_uuid>', -20, <new_balance>, 'admin_adjustment', 'Correction for contaminated drop');
  ```
- All adjustments write an immutable record to `audit_log`.

---

## 5. Revoking a Certificate

If an audit reveals invalid claims:
1. Navigate to **Certificates** (`/admin/certificates`).
2. Search by Certificate ID or Student Name.
3. Click the **Revoke** icon.
4. Enter the required **Revocation Reason** for the permanent audit trail.
5. Public verification URLs (`/verify/[id]`) will immediately display a red "Revoked" warning badge with the official justification.

---

## 6. Pilot Rate Calibration

At the end of each pilot month:
1. Review the ratio of actual weighed kg to declared item count in **Sustainability Reports** (`/admin/reports`).
2. If real-world student bottles weigh slightly more or less than baseline, adjust the grams-per-item in **System Settings** (`/admin/settings`).
3. Changes apply only to subsequent drops; all previous ledger entries remain immutable.
