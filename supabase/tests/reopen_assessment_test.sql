-- pgTAP test for 0013_reopen_assessment.sql
-- Run: supabase test db

begin;
select plan(8);

do $$
declare
  org1 uuid := 'a1000000-0000-0000-0000-000000000001';
  u1   uuid := '00000000-0000-0000-0000-0000000000a1';  -- owns the assessments
  u2   uuid := '00000000-0000-0000-0000-0000000000a2';  -- someone else
  loc  uuid := 'c1000000-0000-0000-0000-000000000001';
  f1   uuid := 'e1000000-0000-0000-0000-000000000001';
  fv1  uuid := 'd1000000-0000-0000-0000-000000000001';
begin
  insert into auth.users (id, email, raw_user_meta_data, created_at, updated_at, aud, role, instance_id)
  values (u1, 'a1@test.local', '{"full_name":"One"}'::jsonb, now(), now(),
          'authenticated', 'authenticated', '00000000-0000-0000-0000-000000000000'),
         (u2, 'a2@test.local', '{"full_name":"Two"}'::jsonb, now(), now(),
          'authenticated', 'authenticated', '00000000-0000-0000-0000-000000000000');
  insert into public.profiles (id, full_name) values (u1, 'One'), (u2, 'Two') on conflict (id) do nothing;
  insert into organisations (id, name) values (org1, 'Org One');
  insert into locations (id, organisation_id, parent_id, code, name, level)
    values (loc, org1, null, 'r1', '{"en":"R1"}', 0);
  insert into forms (id, organisation_id, key, title) values (f1, org1, 'f1', '{"en":"F"}');
  insert into form_versions (id, form_id, version, status, definition, published_at)
    values (fv1, f1, '1.0.0', 'published', '{"scales":[],"sections":[]}'::jsonb, now());

  insert into assessments (id, organisation_id, form_version_id, location_id, created_by, status, totals, submitted_at) values
    ('f1000000-0000-0000-0000-000000000001', org1, fv1, loc, u1, 'submitted', '{"score":3,"max":6}', now()),
    ('f1000000-0000-0000-0000-000000000002', org1, fv1, loc, u1, 'approved',  '{"score":3,"max":6}', now()),
    ('f1000000-0000-0000-0000-000000000003', org1, fv1, loc, u1, 'draft',     null, null),
    ('f1000000-0000-0000-0000-000000000004', org1, fv1, loc, u1, 'submitted', '{"score":3,"max":6}', now());
end $$;

-- Someone else cannot reopen it.
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-0000000000a2"}', true);
select throws_ok(
  $$select reopen_assessment('f1000000-0000-0000-0000-000000000001')$$,
  'P0001', 'You cannot edit this assessment',
  'another user cannot reopen it');

-- The owner can.
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-0000000000a1"}', true);
select lives_ok(
  $$select reopen_assessment('f1000000-0000-0000-0000-000000000001')$$,
  'the owner can reopen a submitted assessment');

reset role;
select is(
  (select status::text from assessments where id = 'f1000000-0000-0000-0000-000000000001'),
  'draft', 'which goes back to draft');
select ok(
  (select totals is null and submitted_at is null
     from assessments where id = 'f1000000-0000-0000-0000-000000000001'),
  'without stale totals or a submitted time');

set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-0000000000a1"}', true);

select throws_ok(
  $$select reopen_assessment('f1000000-0000-0000-0000-000000000002')$$,
  'P0001', 'Approved assessments cannot be edited',
  'an approved assessment cannot be reopened, even by its owner');

select throws_ok(
  $$select reopen_assessment('f1000000-0000-0000-0000-000000000003')$$,
  'P0001', 'Only submitted assessments can be reopened',
  'a draft has nothing to reopen');

-- Once reopened, the owner can edit it again through the normal rules.
select lives_ok(
  $$select reopen_assessment('f1000000-0000-0000-0000-000000000004')$$,
  'a second submitted assessment reopens too');
select lives_ok(
  $$insert into responses (assessment_id, item_key, value) values ('f1000000-0000-0000-0000-000000000004', 'x', 1)$$,
  'and its answers can then be changed');

reset role;
select * from finish();
rollback;
