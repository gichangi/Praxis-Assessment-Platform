-- pgTAP test for 0014_review_recorded.sql
-- Run: supabase test db

begin;
select plan(7);

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

select lives_ok(
  $$select review_assessment('f1000000-0000-0000-0000-000000000001', 'approved', 'Well done')$$,
  'a manager can approve');
select lives_ok(
  $$select review_assessment('f1000000-0000-0000-0000-000000000002', 'returned', 'Add evidence')$$,
  'a manager can return');

reset role;
select is(
  (select reviewed_by from assessments where id = 'f1000000-0000-0000-0000-000000000001'),
  '00000000-0000-0000-0000-0000000000b1'::uuid, 'the approval records who approved it');
select ok(
  (select reviewed_at is not null from assessments where id = 'f1000000-0000-0000-0000-000000000001'),
  'and when');
select is(
  (select reviewed_by from assessments where id = 'f1000000-0000-0000-0000-000000000002'),
  '00000000-0000-0000-0000-0000000000b1'::uuid, 'a return records who returned it');
select is(
  (select review_note from assessments where id = 'f1000000-0000-0000-0000-000000000002'),
  'Add evidence', 'with their message');

-- The assessor edits their returned assessment and tries to put someone else's name on the decision.
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-0000000000a1"}', true);
update assessments set reviewed_by = '00000000-0000-0000-0000-0000000000a1', reviewed_at = '2000-01-01'
 where id = 'f1000000-0000-0000-0000-000000000002';

reset role;
select is(
  (select reviewed_by from assessments where id = 'f1000000-0000-0000-0000-000000000002'),
  '00000000-0000-0000-0000-0000000000b1'::uuid, 'the assessor cannot change who reviewed it');

select * from finish();
rollback;
