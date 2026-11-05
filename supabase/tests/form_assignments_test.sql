-- pgTAP test for 0006_form_assignments.sql
-- Covers: RLS on form_assignments, cross-organisation integrity, subtree expansion,
-- membership scope capping, role filtering, function privileges and the
-- assessment_insert policy.
-- Run: supabase test db

begin;
select plan(21);

-- ── Fixtures (inserted as the table owner, which bypasses RLS) ────────────────
-- users : 1 editor (form_editor)   2 a1 (assessor, whole org)
--         3 a2 (assessor, scoped to d1)   4 viewer   5 outsider (other org)
-- places: r1 -> d1, d2 ; r2 -> d3 (org1)   ; o2 (org2)
do $$
declare
  org1 uuid := 'a1000000-0000-0000-0000-000000000001';
  org2 uuid := 'a2000000-0000-0000-0000-000000000001';
  u_editor uuid := '00000000-0000-0000-0000-0000000000e1';
  u_a1     uuid := '00000000-0000-0000-0000-0000000000a1';
  u_a2     uuid := '00000000-0000-0000-0000-0000000000a2';
  u_viewer uuid := '00000000-0000-0000-0000-0000000000b1';
  u_out    uuid := '00000000-0000-0000-0000-0000000000c1';
  r1 uuid := 'c1000000-0000-0000-0000-000000000001';
  d1 uuid := 'c1000000-0000-0000-0000-000000000011';
  d2 uuid := 'c1000000-0000-0000-0000-000000000012';
  r2 uuid := 'c1000000-0000-0000-0000-000000000002';
  d3 uuid := 'c1000000-0000-0000-0000-000000000021';
  o2 uuid := 'c2000000-0000-0000-0000-000000000001';
  f1 uuid := 'e1000000-0000-0000-0000-000000000001';
  fv1 uuid := 'd1000000-0000-0000-0000-000000000001';
  u uuid;
begin
  foreach u in array array[u_editor, u_a1, u_a2, u_viewer, u_out] loop
    insert into auth.users (id, email, raw_user_meta_data, created_at, updated_at, aud, role, instance_id)
    values (u, u::text || '@test.local', '{"full_name":"Test"}'::jsonb, now(), now(),
            'authenticated', 'authenticated', '00000000-0000-0000-0000-000000000000');
    insert into public.profiles (id, full_name) values (u, 'Test') on conflict (id) do nothing;
  end loop;

  insert into organisations (id, name) values (org1, 'Org One'), (org2, 'Org Two');

  insert into locations (id, organisation_id, parent_id, code, name, level) values
    (r1, org1, null, 'r1', '{"en":"R1"}', 0),
    (d1, org1, r1,   'd1', '{"en":"D1"}', 1),
    (d2, org1, r1,   'd2', '{"en":"D2"}', 1),
    (r2, org1, null, 'r2', '{"en":"R2"}', 0),
    (d3, org1, r2,   'd3', '{"en":"D3"}', 1),
    (o2, org2, null, 'o2', '{"en":"O2"}', 0);

  insert into memberships (user_id, organisation_id, role, location_id) values
    (u_editor, org1, 'form_editor', null),
    (u_a1,     org1, 'assessor',    null),
    (u_a2,     org1, 'assessor',    d1),
    (u_viewer, org1, 'viewer',      null),
    (u_out,    org2, 'assessor',    null);

  insert into forms (id, organisation_id, key, title) values (f1, org1, 'f1', '{"en":"Form One"}');
  insert into form_versions (id, form_id, version, status, definition, published_at)
    values (fv1, f1, '1.0.0', 'published', '{"sections":[]}', now());

  -- A1: the form at region r1 (so r1, d1, d2), for every assessor.
  insert into form_assignments (organisation_id, form_id, location_id, user_id)
    values (org1, f1, r1, null);
end $$;

-- ── Structure and integrity ───────────────────────────────────────────────────
select ok(
  (select relrowsecurity from pg_class where oid = 'public.form_assignments'::regclass),
  'RLS is enabled on form_assignments');

select throws_ok(
  $$insert into form_assignments (organisation_id, form_id, user_id)
    values ('a1000000-0000-0000-0000-000000000001', 'e1000000-0000-0000-0000-000000000001',
            '00000000-0000-0000-0000-0000000000c1')$$,
  'P0001', 'User is not a member of this organisation',
  'cannot assign to a user from another organisation');

select throws_ok(
  $$insert into form_assignments (organisation_id, form_id, location_id)
    values ('a1000000-0000-0000-0000-000000000001', 'e1000000-0000-0000-0000-000000000001',
            'c2000000-0000-0000-0000-000000000001')$$,
  'P0001', 'Location does not belong to this organisation',
  'cannot assign to a location from another organisation');

select throws_ok(
  $$insert into form_assignments (organisation_id, form_id, location_id, user_id)
    values ('a1000000-0000-0000-0000-000000000001', 'e1000000-0000-0000-0000-000000000001',
            'c1000000-0000-0000-0000-000000000001', null)$$,
  '23505', null,
  'the same assignment cannot be added twice (nulls count as equal)');

-- ── Expansion ─────────────────────────────────────────────────────────────────
select is(
  (select count(*)::int from assessable_form_locations('00000000-0000-0000-0000-0000000000a1')),
  3, 'an assessor covered everywhere gets the region and both districts');

select is(
  (select array_agg(location_id) from assessable_form_locations('00000000-0000-0000-0000-0000000000a2')),
  array['c1000000-0000-0000-0000-000000000011'::uuid],
  'membership scope caps what an assignment grants (a2 is scoped to d1)');

select is(
  (select count(*)::int from assessable_form_locations('00000000-0000-0000-0000-0000000000b1')),
  0, 'a viewer cannot assess even when the form is assigned to everyone');

select ok(
  user_can_assess('00000000-0000-0000-0000-0000000000a1', 'd1000000-0000-0000-0000-000000000001',
                  'c1000000-0000-0000-0000-000000000011'),
  'assessor can assess an assigned district');

select ok(
  not user_can_assess('00000000-0000-0000-0000-0000000000a1', 'd1000000-0000-0000-0000-000000000001',
                      'c1000000-0000-0000-0000-000000000021'),
  'assessor cannot assess a district outside the assignment');

-- A user-specific "everywhere" assignment must still respect a2's membership scope.
insert into form_assignments (organisation_id, form_id, location_id, user_id)
  values ('a1000000-0000-0000-0000-000000000001', 'e1000000-0000-0000-0000-000000000001',
          null, '00000000-0000-0000-0000-0000000000a2');

select is(
  (select count(*)::int from assessable_form_locations('00000000-0000-0000-0000-0000000000a2')),
  1, 'a user-level assignment everywhere is still capped by membership scope');

update locations set active = false where id = 'c1000000-0000-0000-0000-000000000012';
select is(
  (select count(*)::int from assessable_form_locations('00000000-0000-0000-0000-0000000000a1')),
  2, 'inactive locations are not offered');
update locations set active = true where id = 'c1000000-0000-0000-0000-000000000012';

-- ── Function privileges ───────────────────────────────────────────────────────
select ok(
  not has_function_privilege('authenticated', 'public.user_can_assess(uuid,uuid,uuid)', 'execute'),
  'signed-in users cannot probe other people''s access');
select ok(
  has_function_privilege('authenticated', 'public.can_assess_here(uuid,uuid)', 'execute'),
  'signed-in users can ask about their own access');
select ok(
  has_function_privilege('service_role', 'public.user_can_assess(uuid,uuid,uuid)', 'execute'),
  'the service role (edge functions) can call user_can_assess');

-- ── As assessor a1 ────────────────────────────────────────────────────────────
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-0000000000a1"}', true);

select lives_ok(
  $$insert into assessments (id, organisation_id, form_version_id, location_id, created_by)
    values ('f1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001',
            'd1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000011',
            '00000000-0000-0000-0000-0000000000a1')$$,
  'assessor can start an assessment of an assigned form at an assigned location');

select throws_ok(
  $$insert into assessments (id, organisation_id, form_version_id, location_id, created_by)
    values ('f1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000001',
            'd1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000021',
            '00000000-0000-0000-0000-0000000000a1')$$,
  '42501', null,
  'assessor cannot start an assessment outside the assigned locations');

select is(
  (select count(*)::int from form_assignments), 1,
  'an assessor sees only assignments for everyone or for themselves');

select throws_ok(
  $$insert into form_assignments (organisation_id, form_id, location_id)
    values ('a1000000-0000-0000-0000-000000000001', 'e1000000-0000-0000-0000-000000000001',
            'c1000000-0000-0000-0000-000000000002')$$,
  '42501', null,
  'an assessor cannot create assignments');

-- ── As assessor a2 ────────────────────────────────────────────────────────────
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-0000000000a2"}', true);
select is(
  (select count(*)::int from form_assignments), 2,
  'a user sees assignments for everyone plus their own');

-- ── As form editor ────────────────────────────────────────────────────────────
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-0000000000e1"}', true);
select lives_ok(
  $$insert into form_assignments (organisation_id, form_id, location_id)
    values ('a1000000-0000-0000-0000-000000000001', 'e1000000-0000-0000-0000-000000000001',
            'c1000000-0000-0000-0000-000000000002')$$,
  'a form editor can assign a form to a location');

select is(
  (select count(*)::int from form_assignments), 3,
  'a form editor sees every assignment in the organisation');

reset role;
select * from finish();
rollback;
