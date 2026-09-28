# Campus Plastic Credits (Bisleri Partner Initiative)

An operations, verification, and environmental accounting portal for campus plastic collection drop stations, branded for **Bisleri**.

Students drop clean, empty plastic bottles into designated campus bins, scan unique bin QR codes, and log item counts. The entries remain **pending** until an administrator physically weighs the bin contents on a digital scale and runs the batch verification wizard. Verified entries permanently credit points to an **append-only ledger**, automatically unlocking verifiable PDF certificates for NAAC compliance, college records, and student resumes.

---

## Key Features

- **Icon-Based, Touch-Optimized Interface:** Designed mobile-first with high-contrast icons, 44px+ touch targets, and visual card selectors for outdoors, one-handed mobile data usage.
- **Append-Only Points Ledger:** Enforced by Postgres database triggers (`trg_points_ledger_append_only`) preventing any `UPDATE` or `DELETE` operations. Corrections are recorded as signed adjustments.
- **Cut-off Batch Verification:** Admin digital scale weighing moments define the batch snapshot; pending items arriving after the cut-off timestamp automatically roll into subsequent batches.
- **Tamper-Proof Audit Logging:** Every administrative action (batch finalization, QR code rotation, rate calibration, certificate revocation) writes an immutable before/after diff to `audit_log`.
- **Verifiable PDF Generation:** High-resolution A4 bin plates (>=8cm QR) and certificates with verification QR codes rendered via `@react-pdf/renderer`.
- **EPR & Recycler Accounting:** Simple, robust accounting ledger tracking plastic stock balances (kg), authorized recycler sales, and campus logistics costs in integer paise.

---

## Tech Stack

- **Framework:** Next.js (App Router, latest stable), TypeScript (`strict`), Tailwind CSS v4
- **Database & Auth:** Supabase (Postgres, Row-Level Security, Storage, Auth)
- **Document Generation:** `@react-pdf/renderer`, `qrcode` (unambiguous 30-char alphabet)
- **Validation & Dates:** `zod`, `date-fns`, `date-fns-tz`
- **Testing:** Vitest (unit & concurrency), Playwright (multi-device e2e)

---

## Getting Started

### 1. Prerequisites
- Node.js LTS (v20+)
- pnpm (`corepack enable pnpm` or `npm i -g pnpm`)

### 2. Installation
```bash
git clone <repo-url>
cd RecycleBin
pnpm install
```

### 3. Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```
Provide your Supabase hosted project credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-server-only-service-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 4. Database Setup
Execute migrations in `supabase/migrations/` sequentially or via Supabase CLI:
1. `20260928000001_initial_schema.sql` (14 tables, integer paise & grams)
2. `20260928000002_views_and_triggers.sql` (append-only trigger, student & bin views)
3. `20260928000003_rls_policies.sql` (strict row-level security for student isolation)
4. `20260928000004_rpc_functions.sql` (Postgres RPCs: `submit_entry`, `finalize_batch`, `verify_certificate`)
5. `supabase/seed.sql` (Pilot campus, bins, baseline plastic types, tiers)

Detailed manual instructions are in [`docs/setup.md`](file:///c:/MY%20WEB/RecycleBin/docs/setup.md).

### 5. Running Locally
```bash
pnpm dev
```
Open [http://localhost:3000](http://localhost:3000) to view the portal.

---

## Testing & Quality Gates

Run the automated test suites:
```bash
# Typecheck with TypeScript strict
pnpm typecheck

# Lint with ESLint
pnpm lint

# Unit & Concurrent Stress Tests (Vitest)
pnpm test

# End-to-End Browser Tests (Playwright: Desktop 1280x800 & Mobile 390x844)
pnpm exec playwright test
```

---

## Project Structure

```text
├── app/
│   ├── (public)/          # Landing, How It Works, Public Verifier (/verify/:no), Drop Station (/b/:code)
│   ├── (student)/         # Student Dashboard (/home), History, Certificates, Board, Account
│   ├── (admin)/admin/     # Operations Console: Verify Bins, Bins & QR, Entries, Certificates, Reports, Accounting, Settings, Audit
│   └── api/pdf/           # Dynamic PDF streaming route handlers (bin plates & certificates)
├── components/
│   ├── brand/             # Bisleri brand headers and logo placeholders
│   ├── plastic/           # Clean SVG plastic category icons
│   ├── student/           # Bottle progress bar, milestone roadmap
│   └── ui/                # Status badges, filters, modal drawers
├── docs/
│   ├── architecture.md    # Architecture diagram, data dictionary, security guarantees
│   ├── runbook.md         # Operational steps for weighing, QR rotation, adjustments
│   └── setup.md           # Human setup checklist for hosted Supabase & storage
├── lib/
│   ├── domain/            # Pure business logic (points, batch scale factor, tier evaluation)
│   ├── pdf/               # React-PDF templates for bin plates and certificates
│   ├── qr.ts              # 8-char unambiguous alphabet and QR generator
│   └── supabase/          # SSR and client Supabase connectors
├── supabase/
│   ├── migrations/        # SQL schema, RLS, triggers, views, RPCs
│   └── seed.sql           # Pilot campus seed data
└── tests/                 # Vitest and Playwright test suites
```
