-- pgTAP test for 0015_reject_assessment.sql
-- Run: supabase test db

begin;
select plan(8);

do $$
declare
  org1 uuid := 'a1000000-0000-0000-0000-000000000001';
  u1   uuid := '00000000-0000-0000-0000-0000000000a1';  -- assessor
  mgr  uuid := '00000000-0000-0000-0000-0000000000b1';  -- reviewer (super admin)
  loc  uuid := 'c1000000-0000-0000-0000-000000000001';
  f1   uuid := 'e1000000-0000-0000-0000-000000000001';
  fv1  uuid := 'd1000000-0000-0000-0000-000000000001';
begin
  insert into auth.users (id, email, raw_user_meta_data, created_at, updated_at, aud, role, instance_id)
  values (u1, 'a1@test.local', '{"full_name":"Assessor"}'::jsonb, now(), now(),
          'authenticated', 'authenticated', '00000000-0000-0000-0000-000000000000'),
         (mgr, 'b1@test.local', '{"full_name":"Reviewer"}'::jsonb, now(), now(),
          'authenticated', 'authenticated', '00000000-0000-0000-0000-000000000000');
  insert into public.profiles (id, full_name) values (u1, 'Assessor'), (mgr, 'Reviewer')
    on conflict (id) do nothing;
  insert into organisations (id, name) values (org1, 'Org One');
  insert into memberships (user_id, organisation_id, role) values (mgr, org1, 'super_admin');
  insert into locations (id, organisation_id, parent_id, code, name, level)
    values (loc, org1, null, 'r1', '{"en":"R1"}', 0);
  insert into forms (id, organisation_id, key, title) values (f1, org1, 'f1', '{"en":"F"}');
  insert into form_versions (id, form_id, version, status, definition, published_at)
    values (fv1, f1, '1.0.0', 'published', '{"scales":[],"sections":[]}'::jsonb, now());

  insert into assessments (id, organisation_id, form_version_id, location_id, created_by, status, totals, submitted_at) values
    ('f1000000-0000-0000-0000-000000000001', org1, fv1, loc, u1, 'submitted', '{"score":3,"max":6}', now()),
    ('f1000000-0000-0000-0000-000000000002', org1, fv1, loc, u1, 'submitted', '{"score":3,"max":6}', now());
end $$;

set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-0000000000b1"}', true);

select throws_ok(
  $$select review_assessment('f1000000-0000-0000-0000-000000000001', 'rejected')$$,
  'P0001', 'A message is required when rejecting an assessment',
  'a rejection must say why');
select throws_ok(
  $$select review_assessment('f1000000-0000-0000-0000-000000000001', 'rejected', '   ')$$,
  'P0001', 'A message is required when rejecting an assessment',
  'and a blank message does not count');
select lives_ok(
  $$select review_assessment('f1000000-0000-0000-0000-000000000001', 'rejected', 'Evidence is missing')$$,
  'a manager can reject with a message');

reset role;
select is(
  (select status::text from assessments where id = 'f1000000-0000-0000-0000-000000000001'),
  'rejected', 'the assessment is rejected');
select is(
  (select reviewed_by from assessments where id = 'f1000000-0000-0000-0000-000000000001'),
  '00000000-0000-0000-0000-0000000000b1'::uuid, 'and records who rejected it');

-- Returning still needs no message.
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-0000000000b1"}', true);
select lives_ok(
  $$select review_assessment('f1000000-0000-0000-0000-000000000002', 'returned')$$,
  'returning without a message is still allowed');

-- The assessor cannot touch a rejected assessment.
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-0000000000a1"}', true);
select throws_ok(
  $$select reopen_assessment('f1000000-0000-0000-0000-000000000001')$$,
  'P0001', 'Only submitted assessments can be reopened',
  'a rejected assessment cannot be reopened');
select throws_ok(
  $$insert into responses (assessment_id, item_key, value) values ('f1000000-0000-0000-0000-000000000001', 'x', 1)$$,
  '42501', null,
  'and its answers cannot be changed');

reset role;
select * from finish();
rollback;
