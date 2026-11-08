-- pgTAP test for 0007_single_active_version.sql
-- Covers: one active (published) version per form, publishing supersedes the previous one,
-- assessments stay tagged to their version, who may start an assessment on which version,
-- and that only form editors can publish or create drafts.
-- Run: supabase test db

begin;
select plan(16);

-- ── Fixtures (inserted as the table owner, which bypasses RLS) ────────────────
-- form f1: v1 published (1.0.0), v2 draft (1.1.0); one assessment already started on v1.
do $$
declare
  org1 uuid := 'a1000000-0000-0000-0000-000000000001';
  u_editor uuid := '00000000-0000-0000-0000-0000000000e1';
  u_a1     uuid := '00000000-0000-0000-0000-0000000000a1';
  r1 uuid := 'c1000000-0000-0000-0000-000000000001';
  d1 uuid := 'c1000000-0000-0000-0000-000000000011';
  f1 uuid := 'e1000000-0000-0000-0000-000000000001';
  v1 uuid := 'd1000000-0000-0000-0000-000000000001';
  v2 uuid := 'd1000000-0000-0000-0000-000000000002';
  u uuid;
begin
  foreach u in array array[u_editor, u_a1] loop
    insert into auth.users (id, email, raw_user_meta_data, created_at, updated_at, aud, role, instance_id)
    values (u, u::text || '@test.local', '{"full_name":"Test"}'::jsonb, now(), now(),
            'authenticated', 'authenticated', '00000000-0000-0000-0000-000000000000');
    insert into public.profiles (id, full_name) values (u, 'Test') on conflict (id) do nothing;
  end loop;

  insert into organisations (id, name) values (org1, 'Org One');
  insert into locations (id, organisation_id, parent_id, code, name, level) values
    (r1, org1, null, 'r1', '{"en":"R1"}', 0),
    (d1, org1, r1,   'd1', '{"en":"D1"}', 1);
  insert into memberships (user_id, organisation_id, role) values
    (u_editor, org1, 'form_editor'),
    (u_a1,     org1, 'assessor');

  insert into forms (id, organisation_id, key, title) values (f1, org1, 'f1', '{"en":"Form One"}');
  insert into form_versions (id, form_id, version, status, definition, published_at)
    values (v1, f1, '1.0.0', 'published', '{"sections":[]}', now() - interval '1 day');
  insert into form_versions (id, form_id, version, status, definition)
    values (v2, f1, '1.1.0', 'draft', '{"sections":[]}');

  insert into form_assignments (organisation_id, form_id, location_id, user_id) values (org1, f1, null, null);

  insert into assessments (id, organisation_id, form_version_id, location_id, created_by)
    values ('f1000000-0000-0000-0000-000000000001', org1, v1, d1, u_a1);
end $$;

-- ── The rule itself ───────────────────────────────────────────────────────────
select ok(
  exists (select 1 from pg_indexes where indexname = 'one_active_per_form'),
  'a unique index allows only one published version per form');

select throws_ok(
  $$insert into form_versions (form_id, version, status, definition)
    values ('e1000000-0000-0000-0000-000000000001', '9.9.9', 'published', '{}')$$,
  '23505', null,
  'a second published version of the same form is refused');

-- ── Publishing ────────────────────────────────────────────────────────────────
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-0000000000a1"}', true);
select throws_ok(
  $$select publish_form_version('d1000000-0000-0000-0000-000000000002', 'x', 'n')$$,
  'P0001', 'Not allowed to publish',
  'an assessor cannot publish a form version');

select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-0000000000e1"}', true);
select lives_ok(
  $$select publish_form_version('d1000000-0000-0000-0000-000000000002', 'x', 'n')$$,
  'a form editor can publish a draft');
reset role;

select is(
  (select status::text from form_versions where id = 'd1000000-0000-0000-0000-000000000002'),
  'published', 'the newly published version is active');

select is(
  (select status::text from form_versions where id = 'd1000000-0000-0000-0000-000000000001'),
  'archived', 'the previously active version is superseded automatically');

select is(
  (select count(*)::int from form_versions
    where form_id = 'e1000000-0000-0000-0000-000000000001' and status = 'published'),
  1, 'exactly one version is active');

select is(
  (select form_version_id from assessments where id = 'f1000000-0000-0000-0000-000000000001'),
  'd1000000-0000-0000-0000-000000000001'::uuid,
  'an assessment keeps the version it was started on');

-- ── Sync: which versions a phone may upload new assessments for ───────────────
select ok(
  user_can_assess('00000000-0000-0000-0000-0000000000a1', 'd1000000-0000-0000-0000-000000000001',
                  'c1000000-0000-0000-0000-000000000011'),
  'an assessment started offline on the superseded version is still accepted');

select ok(
  user_can_assess('00000000-0000-0000-0000-0000000000a1', 'd1000000-0000-0000-0000-000000000002',
                  'c1000000-0000-0000-0000-000000000011'),
  'the active version is accepted');

-- ── New drafts ────────────────────────────────────────────────────────────────
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-0000000000e1"}', true);
select lives_ok(
  $$select create_draft_from('d1000000-0000-0000-0000-000000000002', '1.2.0')$$,
  'a form editor can start a new version from the active one');

select throws_ok(
  $$select create_draft_from('d1000000-0000-0000-0000-000000000002', '1.3.0')$$,
  '23505', null,
  'only one draft can exist per form');
reset role;

select ok(
  not user_can_assess('00000000-0000-0000-0000-0000000000a1',
    (select id from form_versions where form_id = 'e1000000-0000-0000-0000-000000000001' and status = 'draft'),
    'c1000000-0000-0000-0000-000000000011'),
  'a draft version is never offered for assessments');

select throws_ok(
  $$update form_versions set status = 'published' where id = 'd1000000-0000-0000-0000-000000000001'$$,
  'P0001', 'Archived versions cannot be reactivated.',
  'a superseded version cannot be reactivated');

-- ── Direct (online) creation must use the active version ──────────────────────
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-0000000000a1"}', true);
select lives_ok(
  $$insert into assessments (id, organisation_id, form_version_id, location_id, created_by)
    values ('f1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000001',
            'd1000000-0000-0000-0000-000000000002', 'c1000000-0000-0000-0000-000000000011',
            '00000000-0000-0000-0000-0000000000a1')$$,
  'a new assessment can be created on the active version');

select throws_ok(
  $$insert into assessments (id, organisation_id, form_version_id, location_id, created_by)
    values ('f1000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000001',
            'd1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000011',
            '00000000-0000-0000-0000-0000000000a1')$$,
  '42501', null,
  'a new assessment cannot be created on a superseded version');
reset role;

select * from finish();
rollback;
