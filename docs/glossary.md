# Glossary

| Term | Definition |
|---|---|
| **Assessment** | A completed or in-progress scoring of one district against a published form version. Created on the phone; synced to the server. Phone-generated UUID so offline drafts never clash. |
| **District** | The geographic unit being assessed. Belongs to a state. Codes are unique within a state. |
| **Form** | The template that defines what questions are asked. One form can have many versions. |
| **Form version** | A specific snapshot of a form definition (sections, items, scales, scoring). Drafts are editable; published versions are frozen by a database trigger. Phones keep every version they have active drafts against. |
| **FormDefinition** | The JSON document inside `form_versions.definition`. Validated by `packages/core`; parsed by the Flutter app at runtime. No question text lives in code. |
| **Garowe fixture** | The canonical parity test: 37 items at value 3, one at value 5, one not assessed → **116 / 228**. Must hold in TypeScript (`computeTotals`), Dart (`computeTotals`), and SQL (`compute_totals`). |
| **Group** | A sub-grouping within a section (e.g. "Council formation & stability"). Used for the radar chart. |
| **Item** | One question in a form. Has a permanent `key`, a `type`, and optionally a `scale`. Keys are immutable once a version is published. |
| **Item key** | Lower snake_case identifier for an item (e.g. `systems_procurement`). Stored in `responses.item_key`; never renamed after first publish. |
| **Maturity scale** | The primary 0–6 scale used for governance items. 0 = Not yet started, 6 = Fully functioning. |
| **Membership** | A user's role in an organisation. `state_id = null` means the role covers all states in the organisation. |
| **Not assessed** | An item the assessor explicitly marks as not applicable. Excluded from the score and max, so it does not lower the percentage. |
| **Organisation** | Top-level tenant. All data is scoped to an organisation; RLS enforces isolation. |
| **Profile** | The public user record (name, preferred language). Auto-created by the `handle_new_user` trigger when a user signs up. |
| **RLS** | Row-Level Security. Database policies that enforce who sees what. A bug in the mobile app or admin portal cannot leak another state's data. |
| **Response** | One answered item: `(assessment_id, item_key, value, not_assessed, note)`. Primary key ensures one row per item per assessment. |
| **Section** | A top-level grouping of items in a form. The "governance" and "logistics" sections in the district assessment. |
| **State** | A regional unit above the district (e.g. Jubbaland, Puntland). |
| **Sync** | The bidirectional data exchange between the Flutter app and the `sync` edge function. Push first, then pull. Idempotent; newer `updated_at` wins on conflict. |
| **Totals** | The computed score object: `{score, max, pct, sections: {…}}`. Calculated by `compute_totals()` (SQL) on submit; never trusted from the client. The Flutter app computes a local preview using `computeTotals()` (Dart). |
| **Version status** | `draft` → `published` → `archived`. Only drafts are editable. Archived versions cannot be reactivated. |
