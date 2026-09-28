# Human Setup Checklist: Campus Plastic Credits Portal

This document outlines the exact, numbered steps that a human administrator must perform in external cloud dashboards (Supabase, Google Cloud Console, Vercel) to deploy the production portal.

---

## 1. Supabase Project Setup

1. **Create Supabase Project:**
   - Log in to [Supabase Console](https://supabase.com/dashboard).
   - Create a new project:
     - Name: `campus-plastic-credits`
     - Database Password: *(Generate and securely save)*
     - Region: Choose closest to campus (e.g., `ap-south-1` Mumbai).
2. **Apply Migrations:**
   - In Supabase SQL Editor (or using Supabase CLI `supabase db push`), run in sequential order:
     1. `supabase/migrations/20260928000001_initial_schema.sql`
     2. `supabase/migrations/20260928000002_views_and_triggers.sql`
     3. `supabase/migrations/20260928000003_rls_policies.sql`
     4. `supabase/migrations/20260928000004_rpc_functions.sql`
     5. `supabase/seed.sql`
3. **Create Private Storage Buckets:**
   - In **Storage**, create two **Private** buckets:
     - `certificates`: For generated student PDF certificates.
     - `scale-photos`: For admin verification scale scale audit uploads.
4. **Copy API Keys:**
   - Go to **Project Settings > API**:
     - `Project URL` -> `NEXT_PUBLIC_SUPABASE_URL`
     - `anon public key` -> `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - `service_role secret key` -> `SUPABASE_SERVICE_ROLE_KEY` *(Server-only; never commit!)*

---

## 2. Google OAuth 2.0 Credentials (for Student Sign-In)

1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Create or select your Google Cloud project (e.g., `campus-plastic-credits-auth`).
3. Configure the **OAuth Consent Screen**:
   - User Type: External
   - App Name: `Campus Plastic Credits`
   - Support email: `sustainability@campusplasticcredits.org`
   - Scopes: `email`, `profile`, `openid`
4. Create **OAuth Client ID**:
   - Application Type: Web application
   - Authorized Javascript origins:
     - `http://localhost:3000` (development)
     - `https://your-production-domain.com`
   - Authorized redirect URIs:
     - `https://<YOUR_SUPABASE_PROJECT_REF>.supabase.co/auth/v1/callback`
5. Enable Google in Supabase:
   - In **Supabase Console > Authentication > Providers > Google**:
     - Enable Google.
     - Paste Client ID and Client Secret.

---

## 3. Environment Variables (.env.local)

Populate `.env.local` with your provisioned values:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
APP_URL=https://your-production-domain.com
PROGRAM_NAME=Campus Plastic Credits
DEFAULT_TIMEZONE=Asia/Kolkata
ALLOWED_EMAIL_DOMAINS=                  # Optional, comma-separated (e.g., stxaviers.edu)
```

---

## 4. Vercel Deployment

1. Import git repository into [Vercel](https://vercel.com).
2. Framework Preset: Next.js.
3. Configure Environment Variables in Vercel project settings:
   - Add all keys from `.env.local`.
4. Deploy!
