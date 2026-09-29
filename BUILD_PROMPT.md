# BUILD PROMPT: Campus Plastic Credits Portal (Bisleri-branded)

**How to use**
1. Put `AGENTS.md` (the system prompt) in the repo root.
2. When the client supplies the official Bisleri logo files, put them in `/public/brand/` as `logo.svg`, `logo-white.svg`, `favicon.png`.
3. In Antigravity's Agent Manager, start a new task in **Planning** mode and paste everything below the line.

---

## 0. Your task

Build v1 of the portal specified below, phase by phase.

1. Read `AGENTS.md` first and follow it throughout.
2. Produce an **Implementation Plan**, a **Task List** for Phases 0-1, and an **Open questions** list (section 13). Then stop and wait for my approval.
3. After approval, work through the phases in order (section 11). At the end of each phase, stop and post a **Walkthrough**: what changed, screenshots (phone 390x844 and desktop 1280x800), test results, open questions.
4. If something is missing (brand asset, copy, credential, decision), do not guess. Log it under Open questions and continue with unblocked work.
5. Steps only a human can do (creating the Supabase project, Google OAuth credentials, Vercel project, DNS) go in `docs/setup.md` as a numbered checklist. Ask me for values you need; never invent them.

## 1. Product summary

A mobile-first web app (installable PWA) for a recycling company's campus programme. It is **not** the company's main website. It is an operations and accounting portal for plastic collected in bins on college campuses.

Students log what they drop in a bin. The admin verifies each bin by weighing it. Verified drops become credit points. Points unlock certificates.

- Working name: `PROGRAM_NAME` = "Campus Plastic Credits" (configurable; the client may rename it).
- Launch scope: **one college**. Still keep a `campuses` table and `campus_id` on campus-owned rows so a second college needs no schema change.
- Language: English v1, all strings in `messages/en.json`.

| Role | Who | Can do |
|---|---|---|
| `student` | College students | Scan, log drops, see points, download certificates |
| `staff` | Client's helper (optional) | Verify bins (weigh and finalize batches). Cannot edit settings, tiers, accounting |
| `admin` | The client | Everything, including settings, tiers, reports, accounting |

**Success looks like:** a returning student goes from scan to saved entry in under 20 seconds; an admin verifies a bin in under a minute; every point and certificate is traceable to a weighed batch.

## 2. Core flows

### 2.1 Scan and log (student)
1. Student drops clean plastic in a bin and scans its QR, which opens `/b/{code}`.
2. Not logged in: show bin name and location plus a "Sign in to log your drop" button, then go to `/login?next=/b/{code}`. Google sign-in first, email one-time code as fallback. If the profile is incomplete, go to `/onboarding?next=...`, then return to `/b/{code}`.
3. Logged in with a complete profile: show the entry form with plastic type (default = last used), an item stepper (1-20, large +/- buttons) and one primary button, "Save entry".
4. Success: "12 items saved. Points are added after this bin is weighed and verified." Show the pending total and a link to Home.
5. The session persists (refresh tokens), so later scans land straight on the form.

Edge cases: unknown or inactive code gets a friendly message; daily cap reached explains the cap and reset time; a double tap must not double-submit (client-generated idempotency key); a flaky network keeps the form and retries.

### 2.2 Verify (admin or staff): the weighing is the cut-off
1. Admin opens **Verify** and picks a bin. The list shows pending items, oldest pending entry and days since last verified.
2. Admin weighs the bin's contents and enters `weighed_kg` (one decimal) and optional tare. An optional scale photo can be attached.
3. `create_batch(bin_id, weighed_grams, tare_grams, note)` snapshots pending entries with `created_at <= now()`, locks them, computes `expected_grams = sum(items x avg_grams_snapshot)` and `ratio = net_weighed / expected`.
4. Decision screen shows expected vs weighed as a simple bar:
   - `ratio >= 1 - tolerance` (default 25%): one-tap **Approve all**. If `ratio > 1.5`, show an informational "possible contamination" note (no penalty).
   - `ratio < 1 - tolerance`: review required. Options: **Scale** (points x min(1, ratio)), **Approve all**, or per-entry **Reject / Adjust items** (largest entries first). A note is required.
   - `ratio < 0.5`: "Approve all" is disabled; the admin must scale or review.
5. `finalize_batch` runs in one transaction: sets entry statuses, computes `points_awarded`, appends ledger rows, stores the decision and note, calls `issue_tier_certificates` for affected students, writes the audit log.
6. Finalized batches are immutable. Mistakes are fixed with reversal rows (`reverse_entry`, `adjust_points`).
7. A stuck open batch can be cancelled with `cancel_batch`, which returns its entries to pending.
8. After each finalized batch, show a **calibration hint**: actual grams per item = net weighed / verified items, next to the configured `avg_grams`.

### 2.3 Points and certificates
- `points_awarded = round(items x points_per_item_snapshot x scale_factor)`.
- Lifetime points = sum of the student's ledger. When it reaches a tier's `min_points`, insert one `certificates` row per (student, tier) (unique constraint, so re-runs are idempotent) and generate the PDF.
- PDFs are generated server-side, stored in a private bucket and served by signed URL. Email delivery is out of scope for v1.
- Public `/verify/{certificate_no}` (no login) confirms authenticity and shows only masked details.

## 3. Points system: seed data (all admin-editable)

Design anchor: `grams_per_point = 3` (1 point is about 3 g of clean plastic, so about 333 points per kg).

| key | label | points_per_item | avg_grams |
|---|---|---|---|
| `pet_small` | PET bottle up to 750 ml | 5 | 15 |
| `pet_medium` | PET bottle 1 to 1.5 L | 8 | 25 |
| `pet_large` | PET bottle 2 L and above | 15 | 45 |
| `rigid_other` | Other clean rigid plastic (HDPE/PP containers, jugs) | 10 | 30 |

| Tier | min_points |
|---|---|
| Bronze | 100 |
| Silver | 500 |
| Gold | 1000 |
| Platinum | 2500 |

Limits and thresholds: `max_items_per_entry = 20`, `max_items_per_student_per_day = 40`, `min_seconds_between_entries_per_bin = 30`, `tolerance_pct = 25`, `geofence_meters = 150` (flag only), `undo_window_minutes = 5`.

The `avg_grams` values are starting assumptions to be calibrated during the pilot. The Settings page edits everything above; each change is audit-logged and stored in `settings_history`. Next to each plastic type show "suggested points_per_item = round(avg_grams / grams_per_point)".

## 4. Data model (Postgres, all with RLS)

- `campuses` (id, name, city, timezone)
- `profiles` (id = auth user id, campus_id, role, full_name, roll_no, department, year, phone, is_adult, show_on_leaderboard default false, consent_version, consented_at, status, created_at). Unique (campus_id, roll_no).
- `bins` (id, campus_id, code unique, name, location_label, latitude, longitude, status active|inactive, last_verified_at). `bin_codes` keeps rotation history.
- `plastic_types` (id, key, label, points_per_item, avg_grams, active, sort)
- `entries` (id, student_id, bin_id, plastic_type_id, items, points_per_item_snapshot, avg_grams_snapshot, status pending|verified|rejected|cancelled, batch_id, points_awarded, flags text[], lat, lng, accuracy_m, idempotency_key unique per student, created_at, decided_at, decision_note)
- `verification_batches` (id, bin_id, created_by, cutoff_at, weighed_grams, tare_grams, expected_grams, ratio, entries_count, items_count, decision approve_all|scaled|reviewed, scale_factor, status open|finalized|cancelled, note, scale_photo_path, finalized_at). Partial unique index: one `open` batch per bin.
- `points_ledger` (id, student_id, entry_id, batch_id, points int (can be negative), kind earn|reversal|adjustment, note, created_by, created_at). Append-only.
- `tiers` (id, key, name, min_points, sort, active)
- `certificates` (id, student_id, tier_id, certificate_no unique like `CPC-2026-7K3Q9D`, items_at_issue, points_at_issue, pdf_path, status issued|revoked, issued_at). Unique (student_id, tier_id).
- `settings` and `settings_history`
- `sales` (id, sale_date, buyer, plastic_kind, weight_grams, rate_paise_per_kg, amount_paise, invoice_ref, note)
- `expenses` (id, expense_date, category, amount_paise, note)
- `audit_log` (id, actor_id, action, target_type, target_id, before jsonb, after jsonb, created_at)

Indexes: entries (bin_id, status, created_at), entries (student_id, created_at), points_ledger (student_id), bins (code).
Views: `student_totals`, `bin_pending`, `campus_daily_stats`.

**RPCs** (`SECURITY DEFINER`, explicit `search_path`, role checks inside): `public_bin_lookup(code)` (anon), `submit_entry`, `undo_entry`, `create_batch`, `cancel_batch`, `finalize_batch`, `reverse_entry`, `adjust_points`, `issue_tier_certificates` (internal), `verify_certificate(no)` (anon, masked), `public_stats()` (anon, aggregates only), `student_summary()`, `export_my_data()`, `delete_my_account()`.

**`submit_entry` checks:** active session and active profile; bin active; items within 1..cap; per-student daily cap (cancelled entries excluded) in `DEFAULT_TIMEZONE`; per-bin cooldown; idempotency key; snapshot rates; optional geo flags (`no_gps`, `far_from_bin`).

**RLS matrix**

| Table | student | staff | admin | anon |
|---|---|---|---|---|
| profiles | own row (limited fields) | read all | all | none |
| bins | none (use RPC) | read | all | `public_bin_lookup` only |
| entries | read own; insert via RPC only | read all | all | none |
| verification_batches | none | read; write via RPC | all | none |
| points_ledger | read own | read | read; insert via RPC only | none |
| plastic_types, tiers | read | read | write | read via public view (rewards page) |
| certificates | read own | read | all | `verify_certificate` only |
| settings | read public subset | read | write | read public subset |
| sales, expenses | none | none | all | none |
| audit_log | none | none | read | none |

## 5. QR system (build this with extra care)

- **Code:** 8 characters from `23456789ABCDEFGHJKMNPQRSTUVWXYZ` (no 0/O/1/I/L), generated server-side, unique, non-sequential.
- **URL:** `{APP_URL}/b/{code}`. **The domain on printed QR plates is permanent.** Choose the production domain before printing. If it ever changes, keep the old one redirecting.
- **QR image:** SVG and PNG via `qrcode`, error-correction level `Q`, quiet zone of at least 4 modules, dark on white. Do **not** place the logo inside the QR.
- **Plate PDF** (`/admin/bins/{id}/plate`, plus a bulk sheet for all active bins), A4 and A5: official logo, headline "Scan to log your plastic", QR at least 8 cm wide, bin name and location, short URL and code in large type underneath (fallback if scanning fails), a 3-step strip (Drop, Scan, Enter the count) and a line "Clean, empty plastic only" (final wording from the client).
- **Rotation:** admin can deactivate a bin or rotate its code. An old or inactive code shows: "This QR is no longer active. Scan the newer QR on the bin, or ask the programme team."
- **`/b/[code]`:** server-rendered, fast (target under 1 s TTFB), works in phone-camera in-app browsers, no auth needed to see the teaser.
- **Geo check (optional, flag-only):** request location only at submit time. If denied, still allow and set `no_gps`. If the bin has coordinates and the distance exceeds `geofence_meters`, set `far_from_bin`. Show flags in the review screen. Never block on GPS (indoor accuracy is poor).
- Test: decode the generated QR image in a Vitest/Playwright test and assert it equals the expected URL.

## 6. Screens

**Public:** `/` landing, `/how-it-works`, `/rewards` (rendered from `plastic_types` and `tiers`), `/verify/[no]`, `/privacy`, `/terms`, `/b/[code]`.

**Student:** `/login`, `/onboarding`, `/home` (points, progress to next tier, pending vs verified items, recent activity), `/history`, `/certificates`, `/leaderboard` (opt-in, top 20 by campus, display name only), `/account` (edit profile, download my data, delete my account).

**Admin (`/admin`):** Dashboard, Verify, Bins and QR, Students, Entries (filters and flags), Certificates, Reports, Accounting, Settings, Audit log.

## 7. Reports and accounting (v1-light)

- **CSV exports** (date-range filters): entries, batches, ledger, students, certificates.
- **Campus Sustainability Report (PDF)** for a date range: totals (items, verified kg from weighed batches, participants), month-wise chart, top bins, bin list with locations, batch summary. Footer: "Figures are based on weighed, verified batches." Purpose: evidence for the college's sustainability documentation.
- **Dashboard:** items and verified kg this week/month, pending items, active students, points issued, items per day, per bin, per plastic type, "bins due for verification".
- **Accounting:** record **sales** (buyer, kg, rate per kg, amount) and **expenses** (category, amount). One screen shows verified kg collected (sum of finalized net weighed) vs kg sold (stock balance), revenue, expenses and net for a period. No tax or invoicing features in v1.

## 8. Brand and design system

This section is the single source of truth for tokens, icons, diagrams and motion. Section 14 ("Verification and polish pass") audits the build against it — don't let code drift from what's written here, and don't add a colour, icon or effect that isn't in this section without adding it here first.

### 8.1 Brand colours (starting values)

The brand is **Bisleri**. Use the logo only from `/public/brand/`. Colour values below come from a third-party palette listing (aqua green) and Bisleri's own note that its label moved from blue to aqua green in 2006. **Replace them with the official brand-guide values when the client supplies them.** Tokens make that a one-file change.

### 8.2 Full token set

All colour, type and spacing values live once in `app/globals.css`. No hard-coded hex values or pixel sizes anywhere else.

```css
:root {
  /* Brand — replace with official brand-guide values when supplied */
  --brand-primary: #00B3A1;        /* aqua green: fills, graphics, accents only */
  --brand-primary-strong: #00796B; /* buttons and links with white text (about 5.3:1) */
  --brand-primary-soft: #E0F5F2;   /* tinted backgrounds */
  --ink: #0E2A27;                  /* body text */
  --ink-muted: #4B635F;            /* secondary text (about 6.5:1 on white) */
  --surface: #FFFFFF;
  --surface-alt: #F4FAF9;
  --line: #D5E6E3;
  --warn: #B45309;  --danger: #B42318;  --info: #0B5FA5;

  /* Status — entry lifecycle. Each one always pairs with its own icon (8.5); never colour alone */
  --status-pending: var(--warn);                   /* Clock */
  --status-verified: var(--brand-primary-strong);  /* CheckCircle2 */
  --status-rejected: var(--danger);                /* XCircle */
  --status-cancelled: #6B7280;                     /* Ban */

  /* Plastic type — one set, reused in badges, icons and every chart */
  --type-pet-small: var(--brand-primary-strong);
  --type-pet-medium: #2D6FA6;
  --type-pet-large: #A65A2E;
  --type-rigid-other: #6B4C8A;

  /* Tier — decorative/informational only. Never used for a clickable action */
  --tier-bronze: #A9673A;
  --tier-silver: #8A94A6;
  --tier-gold: #C79A3D;
  --tier-platinum: #7C8CA8;

  /* Type scale — Manrope for UI, Fraunces (serif) only on certificates */
  --font-display: 2.5rem;  --lh-display: 1.1;   --ls-display: -0.01em;  /* marketing hero only */
  --font-h1: 2rem;         --lh-h1: 1.2;        --ls-h1: -0.01em;
  --font-h2: 1.5rem;       --lh-h2: 1.25;       --ls-h2: -0.005em;
  --font-h3: 1.125rem;     --lh-h3: 1.35;
  --font-body: 1rem;       --lh-body: 1.5;
  --font-small: 0.875rem;  --lh-small: 1.4;     --ls-small: 0.01em;
  --font-label: 0.75rem;   --lh-label: 1.3;     --ls-label: 0.02em;     /* tags, chips — sentence case, never all-caps */

  /* Spacing — 4px grid. No arbitrary padding/margin/gap values outside this list */
  --space-1: 4px; --space-2: 8px; --space-3: 12px; --space-4: 16px;
  --space-6: 24px; --space-8: 32px; --space-12: 48px; --space-16: 64px;
}
```

- **Contrast:** `--brand-primary` is about 2.6:1 on white, so never use it for text or as a background for white text. Add a Vitest test that checks contrast for every token pair actually used, including the new status/type/tier tokens on every background they appear on.
- **Two greys that must stay distinct:** `--status-cancelled` and `--tier-platinum` are both muted greys. Never rely on the colour difference alone — a cancelled entry always shows the `Ban` icon, and every tier badge always shows its emblem shape (8.8), so the two are never distinguished by hue alone.
- **Plastic-type and tier colours are starting values,** not a brand requirement. Adjust them freely as long as they pass the contrast test and stay distinct from the status colours (a category badge should never be mistaken for a status chip).

### 8.3 Typography rules

Line length under 70 characters. Sentence case everywhere; never Title Case or ALL CAPS, including on chips and labels — use `--font-label` (small size + weight + a touch of letter-spacing) to give a tag presence instead of capitalising it. Every number that represents a count, weight or points value (item counts, kg, ledger totals, dashboard stats) uses `font-variant-numeric: tabular-nums` so digits don't jitter as they change.

### 8.4 Spacing and alignment

Everything — padding, margins, gaps between an icon and its label, the space between sections — comes from the `--space-*` scale in 8.2. Configure Tailwind's spacing scale to match it and treat any arbitrary value (`p-[13px]`, `gap-[7px]`) as a bug to fix, not a style choice. Icon and label are always vertically centred with `--space-2` (8px) between them; an inline icon is sized to about 1.25× the line-height of the text next to it, rounded to the nearest even pixel. Card and section padding is `--space-4` on mobile and `--space-6` on desktop, consistently — the verification pass (section 14) checks this page by page.

### 8.5 Icons

Use **lucide-react** throughout (MIT-licensed, tree-shakeable, one consistent outline style). Before using an icon, confirm the named export exists in the installed version — don't guess a name. Concept map (use these unless a screen's own text makes something clearer):

| Concept | Icon |
|---|---|
| Scan a bin's QR | `QrCode` (marketing), `ScanQrCode` (bin page) |
| Sign in / sign out | `LogIn` / `LogOut` |
| Student profile / account | `User` |
| Bin location | `MapPin` |
| Add / remove an item (stepper) | `Plus` / `Minus` |
| Status: pending / verified / rejected / cancelled | `Clock` / `CheckCircle2` / `XCircle` / `Ban` |
| Admin: weigh the bin | `Weight` |
| Admin: attach a scale photo | `Camera` |
| History / recent activity | `History` |
| Certificates and tiers | `Award`; `Trophy` for the top tier and the leaderboard |
| Participants / leaderboard | `Users` |
| Reports and dashboard stats | `BarChart3` |
| Date range | `Calendar` |
| Export (CSV/PDF) | `Download` |
| Settings | `Settings` |
| Privacy and security | `ShieldCheck` |
| Audit log | `FileText` |
| Help / FAQ | `HelpCircle` |
| Recycling motif (how it works, empty states) | `Recycle` |

### 8.6 Where diagrams and icons replace text

Rule of thumb: on a **working screen** (not the legal/marketing pages), more than about two sentences of static explanatory copy should become an icon row, a diagram or a chart instead. Concretely:

1. **How it works** (landing + `/how-it-works`): a 3-step icon row — drop (`Recycle`) → scan (`ScanQrCode`) → log the count (`Plus`/`Minus`) — replacing plain prose. Numbered, because it genuinely is a sequence.
2. **Student Home:** a two-icon stat row (`Clock` = pending items, `CheckCircle2` = verified items) sits above the bottle-fill tier visual (8.8) instead of a paragraph describing the split.
3. **Admin Verify, decision screen:** expected-vs-weighed is a two-segment horizontal bar with a `Weight` icon and the numbers beside it, not a written explanation of the ratio.
4. **Admin Verify, whole flow:** a 4-step tracker (Bin → Weigh → Review → Confirm) at the top so the admin always sees where they are.
5. **Admin Dashboard:** icon-labelled stat tiles (`Recycle` items, `Users` active students, `Award` points issued, `Clock` pending) instead of bare numbers; bin and plastic-type breakdowns as small bar/donut charts (Recharts) using the `--type-*` colours, with the exact figures still available in a table.
6. **Certificates:** small inline icons next to each stat (items, date, campus) for scannability; each tier badge keeps its own emblem shape (8.8), never colour alone.
7. **Empty states, everywhere:** one icon plus one short line. Never a paragraph.
8. **FAQ:** stays as text — question-and-answer genuinely is a text format. Add a `HelpCircle` per question for scannability, but don't force a diagram where prose is already the right tool.

### 8.7 Motion and interaction

Every effect below answers a state change or a tap — never decorative, never on a timer, never on scroll. Wrap all of it in `prefers-reduced-motion` and skip it there. The bottle-fill (8.8) is the app's one bold moment; everything else stays quiet.

| Moment | Effect |
|---|---|
| Stepper `+`/`-` pressed | Button scales to 0.96 on press; the count briefly highlights |
| Entry saved | A checkmark draws in (SVG stroke animation) and the pending total ticks up |
| Status changes (e.g. pending → verified) | The chip cross-fades and swaps icon, not just colour |
| A tier is crossed | The bottle-fill gets one pulse/glow — no confetti, no separate effect elsewhere |
| Verify decision screen loads | The expected-vs-weighed bar fills in once, driven by the fetched data |
| A list is loading | Skeleton shimmer, not a spinner |
| Admin table row | Hover highlight; the selected row gets a left accent bar in `--brand-primary-strong` |
| A new certificate is issued | A small pulsing "New" badge until the student views it |
| Any save or action confirmation | A toast slides in and auto-dismisses; it never blocks the screen |
| Keyboard focus | Always a visible ring in `--brand-primary-strong` on every interactive element |

No decorative scroll animations, no hover effect on every card, no effect outside this table without adding it here first.

### 8.8 Screen-specific notes

- **The signature element:** on Student Home, tier progress is a **bottle that fills**. Use an original, simple bottle-outline SVG (not Bisleri's bottle or label). Animate once on load, when points change, and with the one tier-crossing pulse from 8.7; respect reduced motion.
- **Student screens:** single column, primary button anchored near the bottom, stepper buttons at least 56 px, generous spacing from 8.4.
- **Admin:** dense but calm; sticky table headers; filters in a top bar; keyboard friendly. Radius scale: 8 px inputs and buttons, 16 px sheets, full for pills. One soft shadow, only on floating sheets. Use lists and tables for tabular content instead of identical card grids, except where 8.6 calls for a chart.
- **Certificate:** A4 landscape, white, thin brand-green frame, official logo top-left, Fraunces for title and name, a distinct vector emblem shape per tier in its `--tier-*` colour (bronze/silver/gold/platinum are never told apart by colour alone), text from settings with placeholders `{name} {tier} {items} {kg} {campus} {program} {date}`, signatory block `[CLIENT TO CONFIRM]`, certificate number and a QR to `/verify/{no}`. "kg" is labelled as an estimate (verified items x average grams).

## 9. Copy (use as written; items in brackets come from the client)

**Landing**
- Headline: "Drop your bottle. Scan the bin. Earn credit."
- Subhead: "Log the plastic you recycle on campus. Points are added after each bin is weighed and verified, and certificates follow as your contribution grows."
- Buttons: "Scan a bin to start" and "How it works".
- How it works (a real sequence, so numbered): 1. Drop clean, empty plastic into a marked bin. 2. Scan the QR on the bin and sign in once. 3. Enter how many items you dropped. Points arrive after verification.

**Status text**
- Pending: "Waiting for this bin to be weighed."
- Verified: "Points added."
- Rejected: "Not counted. {reason}"
- Cancelled: "You cancelled this entry."

**Messages**
- Inactive bin: "This QR is no longer active. Scan the newer QR on the bin, or ask the programme team."
- Daily cap: "You've logged {n} items today, which is the daily limit. You can log more after midnight."
- Bin page, signed out: "Sign in to log your drop at {bin name}."
- Empty history: "Nothing here yet. Scan a bin after your next drop."

**FAQ**
- *Why are my points pending?* We verify every bin by weighing it, so points are added after that check (daily or weekly).
- *What can I put in the bin?* [CLIENT TO CONFIRM: accepted items and rules, for example clean and empty, caps on or off, labels].
- *I entered the wrong number.* You can cancel an entry within 5 minutes while it is still pending. After that, contact [support contact].
- *How many items can I log?* Up to 20 per entry and 40 per day. Limits keep counts fair.
- *How do certificates work?* When your points reach a tier, we issue a PDF certificate with a unique ID that anyone can verify online.
- *Who can see my data?* Only you and the programme admins. Public certificate checks show your first name and last initial only. See the privacy notice.

**Footer:** [CLIENT TO CONFIRM: company name, address, support email and phone].

## 10. Privacy, consent and compliance

- **Itemized notice** (plain language) listing each data item and its purpose: name, roll number, department and year (identify participants and issue certificates); email (login); phone, optional (support); entries and location flags (verification and fraud checks); certificates.
- **Consent:** onboarding step with an **unticked** checkbox linked to the notice. Store `consent_version` and `consented_at`; re-prompt when the version changes.
- **Age gate:** ask "Are you 18 or older?" and store only `is_adult`. If "No", block sign-up with a message to contact the programme team. `[LEGAL REVIEW]`: India's DPDP Rules require verifiable parental consent for under-18s; the main duties come into force in stages (around May 2027). Design for it now and get legal sign-off before launch.
- **Rights:** Account has "Download my data" (JSON) and "Delete my account". Deletion anonymizes the profile, removes the auth user and keeps ledger and batch rows under an anonymized reference so accounting still reconciles. Certificates then show "Anonymized".
- **Retention:** configurable in Settings, default 3 years after last activity `[LEGAL REVIEW]`.
- **Security:** HTTPS only, security headers and a CSP, rate limits on auth and RPC-backed endpoints, admin actions in `audit_log`, backup notes in the runbook.
- Draft `/privacy` and `/terms` in plain language with `[LEGAL REVIEW]` markers. Do not present them as final legal text.

## 11. Phases and acceptance criteria

**Phase 0: Plan and scaffold**
- Implementation Plan, Task List and Open questions posted for approval.
- Next.js + TypeScript + Tailwind scaffold, tokens, fonts, three layout shells (public, student, admin), lint, format, CI (typecheck + tests), README.
- Done when: the app runs, and a dev-only `/dev/tokens` page shows the palette with contrast pass/fail.

**Phase 1: Database, auth, RLS**
- Migrations for every table, enum, index and trigger; RLS policies; dev-only seed script; `docs/setup.md` for Supabase and Google OAuth.
- Google sign-in, email code fallback, onboarding form, safe `next` handling, optional `ALLOWED_EMAIL_DOMAINS`.
- Done when: RLS tests pass (student A cannot read student B's entries, ledger or certificates; anon can call only `public_bin_lookup`, `verify_certificate`, `public_stats`), and the append-only trigger blocks ledger UPDATE/DELETE.

**Phase 2: Bins, QR and scan-to-log**
- Bins and QR admin (create, deactivate, rotate), QR SVG/PNG, plate PDF (single and bulk), `/b/[code]` flow, `submit_entry`, `undo_entry`, Student Home (pending view).
- Done when: e2e test passes (open bin URL, sign in, save entry, see it pending); caps, cooldown and idempotency are enforced; inactive bin is blocked; a decoded plate QR equals the expected URL.

**Phase 3: Verification and points**
- Verify flow, `create_batch`, `finalize_batch`, `cancel_batch`, ledger, calibration hint, entry review, reversals, audit log.
- Done when: unit and SQL tests cover expected weight, tolerance, scaling, the cut-off rule, snapshots and reversal; e2e covers approve-all, scaled, per-entry reject, and "entry after weighing lands in the next batch".

**Phase 4: Tiers and certificates**
- Tier evaluation, certificate rows, PDF generation, private storage, signed URLs, `/verify/[no]`, revoke and re-issue.
- Done when: crossing 100 points issues Bronze exactly once (idempotent); the verify page shows a masked name; a revoked certificate shows "revoked".

**Phase 5: Admin dashboard, reports, accounting**
- Dashboard, CSV exports, Campus Sustainability Report PDF, sales and expenses with the stock summary, audit log viewer.
- Done when: a reconciliation test proves dashboard totals equal direct SQL sums.

**Phase 6: Public site, content and compliance**
- Landing, how it works, rewards, FAQ, privacy and terms drafts, consent step, age gate, account export and delete, PWA manifest, favicon, metadata and social image.
- Done when: Lighthouse mobile scores are at least 90 (performance, accessibility, best practices, SEO) on `/` and `/b/[code]`.

**Phase 6.5: Design refinement and verification pass** — run `VERIFY_AND_POLISH_PROMPT.md` (see section 14) here, before Phase 7. It audits every screen against this document, applies the icon/diagram/colour/motion system from section 8, and reports what it found and fixed.

**Phase 7: Hardening and release**
- Security checklist (RLS review, headers and CSP, rate limits, `next` validation, service-role usage), error-monitoring hook, a 100-concurrent-submit sanity test, seed removal, Vercel + Supabase deploy guide, pilot checklist (3 bins, 2 weeks, calibration steps).
- Done when: a deploy preview passes the smoke test and `docs/runbook.md` is complete.

## 12. Environment and deployment

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=      # server only
APP_URL=                        # permanent short production domain used in QR codes
PROGRAM_NAME=Campus Plastic Credits
DEFAULT_TIMEZONE=Asia/Kolkata
ALLOWED_EMAIL_DOMAINS=          # optional, comma-separated
```

Use the Supabase CLI with local Docker if available; otherwise a hosted dev project. Deploy the web app on Vercel. Buckets: `certificates` (private) and `scale-photos` (private).

## 13. Open questions (ask me; do not guess)

1. Official Bisleri brand guide and logo files, and written permission to use them.
2. Final programme name, and any Bisleri programme naming to use.
3. Accepted plastic list and drop-off rules (clean, caps on or off, labels).
4. College name, timezone, number of bins, bin locations and coordinates.
5. Do students have college email IDs (restrict sign-up to that domain)? If not, how should identity be checked (for example a student list from the college)?
6. Verification cadence per bin (daily or weekly) and who does the weighing.
7. Certificate signatory name and title, and any college co-branding.
8. Support email and phone, and the grievance contact for the privacy notice.
9. Under-18 policy (needs legal input).
10. Does the college want the leaderboard?

## 14. Verification and polish pass

A separate prompt, `VERIFY_AND_POLISH_PROMPT.md`, audits the build against this document and applies the design system in section 8 everywhere it belongs. Run it as Phase 6.5 (after Phase 6, before Phase 7) on a first build, or at any later point to audit and refresh an existing one. It does not add scope beyond section 8 — if it finds something this document should cover but doesn't, it lists that as an open question here rather than inventing an answer.
