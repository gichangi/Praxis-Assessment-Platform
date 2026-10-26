# Assessment Platform

Offline-first district governance scoring platform — Supabase backend, Next.js admin portal, Flutter mobile app.

## Prerequisites

| Tool | Version | Install |
|------|---------|---------|
| Node.js | ≥ 20 | [nodejs.org](https://nodejs.org) |
| pnpm | ≥ 9 | `npm i -g pnpm` |
| Supabase CLI | ≥ 2 | `pnpm add -g supabase` |
| Docker Desktop | any | [docker.com](https://www.docker.com/products/docker-desktop) |
| Flutter | ≥ 3.8 | [flutter.dev](https://docs.flutter.dev/get-started/install) |
| Python | ≥ 3.10 | [python.org](https://www.python.org/downloads/) |

> **Windows note:** Flutter commands below use the full path. If `flutter` is on your PATH, drop the prefix.

---

## 1 — Clone and install

```bash
git clone <repo-url>
cd "Assessment Scorecard - Mobile conversion/Code"
pnpm install
```

---

## 2 — Backend (Supabase local)

Docker Desktop must be running.

```bash
# Start the local Supabase stack (Postgres, Auth, Storage, Edge Functions, Studio)
supabase start

# Apply all migrations and load seed data
supabase db reset

# Run pgTAP database tests
supabase test db

# Regenerate TypeScript types after schema changes
supabase gen types typescript --local > packages/api-types/src/index.ts
```

Local service URLs after `supabase start`:

| Service | URL |
|---------|-----|
| API / REST | http://localhost:54321 |
| Studio | http://localhost:54323 |
| Inbucket (email) | http://localhost:54324 |
| DB direct | postgresql://postgres:postgres@localhost:54322/postgres |

The **anon key** and **service-role key** are printed by `supabase start` and also available in Studio → Settings → API.

---

## 3 — Admin portal (Next.js)

```bash
# From repo root
pnpm --filter admin dev
# or
pnpm dev:admin
```

Opens at **http://localhost:3000**.

Create a local `.env.local` in `apps/admin/` on first run:

```env
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key from supabase start>
SUPABASE_SERVICE_ROLE_KEY=<service-role key from supabase start>
```

Sign in with any email — Supabase local sends magic-link emails to **Inbucket** (http://localhost:54324).

---

## 4 — Mobile app (Flutter)

```bash
# Install dependencies
C:\Users\Admin\flutter\bin\flutter.bat pub get

# Run on a connected device or emulator
C:\Users\Admin\flutter\bin\flutter.bat run

# Run unit tests
C:\Users\Admin\flutter\bin\flutter.bat test

# Static analysis
C:\Users\Admin\flutter\bin\flutter.bat analyze
```

The app points to the local Supabase stack by default (`http://10.0.2.2:54321` for Android emulator → host `127.0.0.1`). For a physical device on the same Wi-Fi, edit `_supabaseUrl` in `apps/mobile/lib/main.dart` to your machine's LAN IP.

### Regenerate Drift database code

Run this after editing `apps/mobile/lib/data/database/tables.dart` or any DAO:

```bash
C:\Users\Admin\flutter\bin\flutter.bat pub run build_runner build --delete-conflicting-outputs
```

### Sync i18n catalogs → Flutter ARB

After editing `packages/i18n/catalogs/*.json`:

```bash
python tools/json_to_arb.py
```

---

## 5 — Supabase Edge Functions (local)

Edge functions are served automatically by `supabase start`. To test one in isolation:

```bash
supabase functions serve sync --env-file supabase/.env.local
```

Create `supabase/.env.local` with:

```env
SUPABASE_SERVICE_ROLE_KEY=<service-role key>
GOOGLE_SERVICE_ACCOUNT_JSON=<JSON string for sheets-sync>
```

---

## 6 — Useful scripts

```bash
# Lint + typecheck + test (TypeScript workspace)
pnpm lint && pnpm typecheck && pnpm test

# Format all TS/JSON files
pnpm format

# Convert an Excel scorecard to a form definition JSON
python tools/excel_to_template.py <input.xlsx> supabase/seed/definition.v1.json

# Validate a form definition
python tools/validate_template.py supabase/seed/definition.v1.json
```

---

## 7 — Architecture overview

```
repo/
├── apps/
│   ├── admin/      Next.js 14 App Router — form builder, assessments, dashboards
│   └── mobile/     Flutter — offline assessment, sync, export
├── packages/
│   ├── core/       TypeScript — Zod schema, scoring, validation (admin + edge fns only)
│   ├── i18n/       Source translation catalogs (en / so / ar)
│   └── api-types/  Generated Supabase TypeScript types
├── supabase/
│   ├── migrations/ 0001 schema · 0002 RLS · 0003 functions · 0004 handle_new_user
│   ├── functions/  sync · export · sheets-sync · publish-form · invite-user · support-report
│   └── seed.sql
└── tools/          excel_to_template.py · validate_template.py · json_to_arb.py
```

**Scoring parity rule:** `computeTotals()` in Dart, `computeTotals()` in TypeScript, and `compute_totals()` in SQL must all return **116 / 228** on the Garowe fixture. Run `flutter test` and `pnpm test` to verify both sides.

---

## 8 — Common dev workflows

**Add a new form item** — edit the form in Admin → Forms → Builder, then publish. No code change needed.

**Add a UI string** — add the key to `packages/i18n/catalogs/en.json` (and `so.json`, `ar.json`), run `python tools/json_to_arb.py`, then use `tr('your_key')` in Dart or the admin portal's i18n helper.

**Change the database schema** — add a new numbered migration file in `supabase/migrations/`. Never edit an existing migration.

**Update Supabase TypeScript types** — run `supabase gen types typescript --local > packages/api-types/src/index.ts` after applying migrations.
