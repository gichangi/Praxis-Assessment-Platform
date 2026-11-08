-- pgTAP test for 0016_form_active_delete.sql
-- Run: supabase test db

begin;
select plan(11);

do $$
declare
  org1 uuid := 'a1000000-0000-0000-0000-000000000001';
  ed   uuid := '00000000-0000-0000-0000-0000000000e1';  -- form editor
  u1   uuid := '00000000-0000-0000-0000-0000000000a1';  -- assessor
  loc  uuid := 'c1000000-0000-0000-0000-000000000001';
begin
  insert into auth.users (id, email, raw_user_meta_data, created_at, updated_at, aud, role, instance_id)
  values (ed, 'e1@test.local', '{}'::jsonb, now(), now(),
          'authenticated', 'authenticated', '00000000-0000-0000-0000-000000000000'),
         (u1, 'a1@test.local', '{}'::jsonb, now(), now(),
          'authenticated', 'authenticated', '00000000-0000-0000-0000-000000000000');
  insert into public.profiles (id, full_name) values (ed, 'Editor'), (u1, 'Assessor')
    on conflict (id) do nothing;
  insert into organisations (id, name) values (org1, 'Org One');
  insert into memberships (user_id, organisation_id, role) values
    (ed, org1, 'form_editor'), (u1, org1, 'assessor');
  insert into locations (id, organisation_id, parent_id, code, name, level)
    values (loc, org1, null, 'r1', '{"en":"R1"}', 0);

  -- F1 has an assessment; F2 has none; both are assigned to everyone, everywhere.
  insert into forms (id, organisation_id, key, title) values
    ('e1000000-0000-0000-0000-000000000001', org1, 'f1', '{"en":"F1"}'),
    ('e1000000-0000-0000-0000-000000000002', org1, 'f2', '{"en":"F2"}');
  insert into form_versions (id, form_id, version, status, definition, published_at) values
    ('d1000000-0000-0000-0000-000000000001', 'e1000000-0000-0000-0000-000000000001', '1.0.0', 'published', '{"scales":[],"sections":[]}', now()),
    ('d1000000-0000-0000-0000-000000000002', 'e1000000-0000-0000-0000-000000000002', '1.0.0', 'published', '{"scales":[],"sections":[]}', now());
  insert into form_assignments (organisation_id, form_id) values
    (org1, 'e1000000-0000-0000-0000-000000000001'),
    (org1, 'e1000000-0000-0000-0000-000000000002');
  insert into assessments (id, organisation_id, form_version_id, location_id, created_by)
    values ('f1000000-0000-0000-0000-000000000001', org1, 'd1000000-0000-0000-0000-000000000001', loc, u1);
end $$;

select is(
  (select active from forms where id = 'e1000000-0000-0000-0000-000000000001'),
  true, 'a form is active by default');

select is(
  (select count(*)::int from assessable_form_locations('00000000-0000-0000-0000-0000000000a1')),
  2, 'an assessor can start both forms');

update forms set active = false where id = 'e1000000-0000-0000-0000-000000000002';
select is(
  (select count(*)::int from assessable_form_locations('00000000-0000-0000-0000-0000000000a1')
    where form_id = 'e1000000-0000-0000-0000-000000000002'),
  0, 'a disabled form can no longer be started');
select is(
  (select count(*)::int from assessable_form_locations('00000000-0000-0000-0000-0000000000a1')),
  1, 'while the active one still can');

update forms set active = true where id = 'e1000000-0000-0000-0000-000000000002';
select is(
  (select count(*)::int from assessable_form_locations('00000000-0000-0000-0000-0000000000a1')),
  2, 'and switching it back on restores it');

-- Deleting
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-0000000000a1"}', true);
select throws_ok(
  $$select delete_form('e1000000-0000-0000-0000-000000000002')$$,
  'P0001', 'You cannot manage this form',
  'an assessor cannot delete a form');

select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-0000000000e1"}', true);
select is(
  form_assessment_count('e1000000-0000-0000-0000-000000000001'),
  1, 'a form editor can see how many assessments use a form');
select throws_ok(
  $$select delete_form('e1000000-0000-0000-0000-000000000001')$$,
  'P0001', 'This form has 1 assessment and cannot be deleted. Disable it instead.',
  'a form with assessments cannot be deleted');

select lives_ok(
  $$select delete_form('e1000000-0000-0000-0000-000000000002')$$,
  'a form editor can delete a form that has none');

reset role;
select is(
  (select count(*)::int from forms where id = 'e1000000-0000-0000-0000-000000000002'),
  0, 'the form is gone');
select is(
  (select count(*)::int from form_versions where form_id = 'e1000000-0000-0000-0000-000000000002')
  + (select count(*)::int from form_assignments where form_id = 'e1000000-0000-0000-0000-000000000002'),
  0, 'along with its versions and assignments');

select * from finish();
rollback;
