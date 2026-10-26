# Assessment Platform — Coding conventions

## Commands

```bash
# TypeScript (run from repo root)
pnpm install
pnpm lint && pnpm typecheck && pnpm test

# Supabase
supabase start
supabase db reset
supabase test db
supabase gen types typescript --local > packages/api-types/src/index.ts

# Admin portal
pnpm --filter admin dev

# Flutter (Windows path; adjust if flutter is on PATH)
C:\Users\Admin\flutter\bin\flutter.bat pub get
C:\Users\Admin\flutter\bin\flutter.bat test
C:\Users\Admin\flutter\bin\flutter.bat analyze
C:\Users\Admin\flutter\bin\flutter.bat run

# Tools
python tools/excel_to_template.py <input.xlsx> supabase/seed/definition.v1.json
python tools/validate_template.py supabase/seed/definition.v1.json
python tools/json_to_arb.py          # sync packages/i18n catalogs → apps/mobile/lib/l10n/
```

## Rules

1. **No hard-coded user-facing text.** Admin portal strings go in `packages/i18n/catalogs/*.json`; Flutter strings go in `apps/mobile/lib/l10n/app_*.arb` (generated via `python tools/json_to_arb.py`). Never write a literal label, error message, or scale description in TypeScript or Dart code.

2. **Start/end styles, not left/right.** Flutter: use `start`/`end`, `EdgeInsetsDirectional`, `Directionality`-aware widgets everywhere. CSS: `margin-inline-start`, `padding-inline-end`. Never write `left`, `right`, `marginLeft`, `paddingRight`.

3. **Item keys are permanent.** `responses.item_key` links live assessment data to form items. Never rename a key that has appeared in any published form version. Changing the displayed title text is fine; the key stays.

4. **Scoring must agree on all three sides.** `computeTotals()` in Dart (`apps/mobile/lib/domain/scoring.dart`), `computeTotals()` in TypeScript (`packages/core/src/scoring.ts`), and `compute_totals()` in SQL (`supabase/migrations/20260930000003_functions.sql`) must all return **116 / 228** on the Garowe fixture (`packages/core/test/fixtures/`). The SQL value is the official result; Dart is the live mobile preview.

5. **Every new table gets RLS policies and SQL tests.** No exceptions. Status transitions (`status`, `totals`, `published_at`, `submitted_at`) go through the database functions in `0003_functions.sql`; direct updates are blocked by RLS.

6. **Supabase service-role key in edge functions only.** `apps/admin` uses the anon key + user JWT. `apps/mobile` uses `supabase_flutter` with the user session. Never expose the service-role key to the client.

7. **New migrations only.** Never edit a migration file that has been applied in any environment (local, staging, production). Add a new numbered file.

8. **Offline-first in Flutter.** Every write hits Drift SQLite first (`dirty = 1`). The sync engine pushes dirty rows; on conflict the newer `updated_at` wins. Do not call the Supabase API directly from widget code — go through the repository layer.

9. **Do not send assessment data to Sentry.** Scrub `answers`, `notes`, `totals`, and `definition` from breadcrumbs and error payloads. Use opaque IDs and counts, not raw row data.

10. **Check pinned library docs before using a package.** Package APIs change between versions. The versions in `pubspec.yaml` and `packages/core/package.json` are the reference; consult their changelogs if something looks unfamiliar.

## Architecture in one paragraph

The backend is a Supabase project (`supabase/`). The admin portal (`apps/admin/`) is a Next.js TypeScript app that uses `@assessment/core` for form schema, scoring, and validation. The mobile app (`apps/mobile/`) is Flutter / Dart — it parses `FormDefinition` JSON at runtime, stores data in Drift SQLite offline, and syncs via the `sync` edge function. `packages/core` (TypeScript) is used only by the admin portal and edge functions — the Dart equivalents live in `apps/mobile/lib/domain/`. Forms are data: no question text lives in code.
