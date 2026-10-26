-- 0001_schema.sql : core tables for the assessment platform (Supabase / Postgres 15+)
-- Text shown to users is stored as jsonb {"en": "...", "so": "...", "ar": "..."}.

create extension if not exists pgcrypto;

create type app_role as enum ('super_admin', 'form_editor', 'translator', 'manager', 'assessor', 'viewer');
create type version_status as enum ('draft', 'published', 'archived');
create type assessment_status as enum ('draft', 'submitted', 'returned', 'approved');
create type ticket_status as enum ('open', 'pending', 'closed');

-- ---------- Organisation, people, places ----------
create table organisations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);

create table profiles (
  id uuid primary key references auth.users on delete cascade,
  full_name text not null default '',
  preferred_language text not null default 'en',
  created_at timestamptz not null default now()
);

create table states (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references organisations on delete cascade,
  code text not null,
  name jsonb not null,
  unique (organisation_id, code)
);

create table districts (
  id uuid primary key default gen_random_uuid(),
  state_id uuid not null references states on delete restrict,
  code text not null,
  name jsonb not null,
  active boolean not null default true,
  unique (state_id, code)
);

-- A user's role in an organisation. state_id null = all states.
create table memberships (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles on delete cascade,
  organisation_id uuid not null references organisations on delete cascade,
  role app_role not null,
  state_id uuid references states on delete cascade,
  created_at timestamptz not null default now(),
  unique nulls not distinct (user_id, organisation_id, role, state_id)
);

-- ---------- Forms (the editable questionnaires) ----------
create table forms (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references organisations on delete cascade,
  key text not null,
  title jsonb not null,
  created_at timestamptz not null default now(),
  unique (organisation_id, key)
);

-- definition = the whole form (sections, groups, items, scales, scoring) as one JSON
-- document validated by packages/core. Drafts are edited; published rows are frozen.
create table form_versions (
  id uuid primary key default gen_random_uuid(),
  form_id uuid not null references forms on delete cascade,
  version text not null,
  status version_status not null default 'draft',
  definition jsonb not null,
  checksum text,
  change_note text,
  created_by uuid references profiles,
  published_by uuid references profiles,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (form_id, version)
);
create unique index one_draft_per_form on form_versions (form_id) where status = 'draft';

-- ---------- Assessments ----------
create table assessments (
  id uuid primary key,                      -- generated on the phone so offline records never clash
  organisation_id uuid not null references organisations,
  form_version_id uuid not null references form_versions,
  district_id uuid not null references districts,
  language text not null default 'en',
  status assessment_status not null default 'draft',
  created_by uuid not null references profiles,
  assessors uuid[] not null default '{}',
  assessed_on date not null default current_date,
  totals jsonb,                             -- computed by submit_assessment(); never trusted from the client
  review_note text,
  device_id uuid,
  submitted_at timestamptz,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index on assessments (organisation_id, district_id, assessed_on);
create index on assessments (updated_at);

-- One row per answered item; item_key is the permanent key from the definition.
create table responses (
  assessment_id uuid not null references assessments on delete cascade,
  item_key text not null,
  value numeric,
  not_assessed boolean not null default false,
  note text,
  note_language text,
  updated_by uuid references profiles,
  updated_at timestamptz not null default now(),
  primary key (assessment_id, item_key)
);
create index on responses (updated_at);

create table attachments (
  id uuid primary key,
  assessment_id uuid not null references assessments on delete cascade,
  item_key text,
  kind text not null check (kind in ('voice', 'photo', 'file')),
  storage_path text not null,               -- bucket 'attachments', path {org}/{assessment}/{id}
  mime_type text,
  size_bytes bigint,
  created_by uuid references profiles,
  created_at timestamptz not null default now()
);

-- ---------- Devices, sync, support, help, config ----------
create table devices (
  id uuid primary key,
  user_id uuid not null references profiles on delete cascade,
  platform text,
  app_version text,
  form_version_ids uuid[] not null default '{}',
  pending_changes int not null default 0,
  last_sync_at timestamptz,
  last_error text,
  revoked boolean not null default false,
  created_at timestamptz not null default now()
);

create table sync_events (
  id bigint generated always as identity primary key,
  device_id uuid references devices on delete cascade,
  at timestamptz not null default now(),
  pushed int not null default 0,
  pulled int not null default 0,
  error text
);

create table support_tickets (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references organisations,
  user_id uuid not null references profiles,
  assessment_id uuid references assessments,
  status ticket_status not null default 'open',
  subject text not null,
  diagnostics jsonb,                        -- app version, device, sync log, current screen
  assigned_to uuid references profiles,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table support_messages (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid not null references support_tickets on delete cascade,
  author_id uuid not null references profiles,
  body text not null,
  created_at timestamptz not null default now()
);

create table help_articles (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references organisations on delete cascade,
  slug text not null,
  title jsonb not null,
  body jsonb not null,                      -- markdown per language
  sort int not null default 0,
  published boolean not null default false,
  updated_at timestamptz not null default now(),
  unique (organisation_id, slug)
);

create table app_config (
  organisation_id uuid not null references organisations on delete cascade,
  key text not null,                        -- e.g. min_app_version, sheets_export_id
  value jsonb not null,
  primary key (organisation_id, key)
);

create table audit_log (
  id bigint generated always as identity primary key,
  at timestamptz not null default now(),
  actor uuid,
  action text not null,
  entity text not null,
  entity_id text not null,
  diff jsonb
);
create index on audit_log (entity, entity_id);
