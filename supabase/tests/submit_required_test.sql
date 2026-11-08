-- pgTAP test for 0012_submit_requires_required.sql
-- Run: supabase test db

begin;
select plan(8);

do $$
declare
  org1 uuid := 'a1000000-0000-0000-0000-000000000001';
  u    uuid := '00000000-0000-0000-0000-0000000000a1';
  loc  uuid := 'c1000000-0000-0000-0000-000000000001';
  f1   uuid := 'e1000000-0000-0000-0000-000000000001';
  fv1  uuid := 'd1000000-0000-0000-0000-000000000001';
  def  jsonb;
begin
  insert into auth.users (id, email, raw_user_meta_data, created_at, updated_at, aud, role, instance_id)
  values (u, 'a1@test.local', '{"full_name":"Test"}'::jsonb, now(), now(),
          'authenticated', 'authenticated', '00000000-0000-0000-0000-000000000000');
  insert into public.profiles (id, full_name) values (u, 'Test') on conflict (id) do nothing;
  insert into organisations (id, name) values (org1, 'Org One');
  insert into locations (id, organisation_id, parent_id, code, name, level)
    values (loc, org1, null, 'r1', '{"en":"R1"}', 0);
  insert into forms (id, organisation_id, key, title) values (f1, org1, 'f1', '{"en":"F"}');

  -- r_scale and r_text are required; o_scale is optional; r_hidden is required but only
  -- shown when r_scale >= 2; shot is a required photo, which can never block.
  def := $j${
    "scales":[{"key":"s","levels":[{"value":0,"label":{"en":"0"}},{"value":2,"label":{"en":"2"}}]}],
    "sections":[{"key":"sec","items":[
      {"key":"r_scale","type":"scale","scale":"s","required":true},
      {"key":"o_scale","type":"scale","scale":"s","required":false},
      {"key":"r_text","type":"text","required":true},
      {"key":"r_hidden","type":"scale","scale":"s","required":true,
       "visible_if":{"item":"r_scale","op":"gte","value":2}},
      {"key":"shot","type":"photo","required":true}
    ]}]}$j$::jsonb;
  insert into form_versions (id, form_id, version, status, definition, published_at)
    values (fv1, f1, '1.0.0', 'published', def, now());

  insert into assessments (id, organisation_id, form_version_id, location_id, created_by) values
    ('f1000000-0000-0000-0000-000000000001', org1, fv1, loc, u),   -- A: nothing answered
    ('f1000000-0000-0000-0000-000000000002', org1, fv1, loc, u),   -- B: required answered, optional blank
    ('f1000000-0000-0000-0000-000000000003', org1, fv1, loc, u),   -- C: unlocks the hidden item
    ('f1000000-0000-0000-0000-000000000004', org1, fv1, loc, u);   -- D: blank text

  insert into responses (assessment_id, item_key, value, not_assessed, note) values
    ('f1000000-0000-0000-0000-000000000002', 'r_scale', 0, false, null),
    ('f1000000-0000-0000-0000-000000000002', 'r_text',  null, false, 'Looks fine'),
    ('f1000000-0000-0000-0000-000000000003', 'r_scale', 2, false, null),
    ('f1000000-0000-0000-0000-000000000003', 'r_text',  null, false, 'Looks fine'),
    ('f1000000-0000-0000-0000-000000000004', 'r_scale', 0, false, null),
    ('f1000000-0000-0000-0000-000000000004', 'r_text',  null, false, '   ');
end $$;

select is(
  required_missing('f1000000-0000-0000-0000-000000000001'),
  array['r_scale', 'r_text'],
  'only required, visible, answerable items are listed (not optional, hidden or photo items)');

set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-0000000000a1"}', true);

select throws_ok(
  $$select submit_assessment('f1000000-0000-0000-0000-000000000001')$$,
  'P0001', 'Answer or mark "not assessed" for: r_scale, r_text',
  'an empty assessment cannot be submitted');

select lives_ok(
  $$select submit_assessment('f1000000-0000-0000-0000-000000000002')$$,
  'it can be submitted once the required items are answered, even with an optional one blank');

reset role;
select is(
  (select status::text from assessments where id = 'f1000000-0000-0000-0000-000000000002'),
  'submitted', 'and its status becomes submitted');

select is(
  (select (totals->>'score')::numeric from assessments where id = 'f1000000-0000-0000-0000-000000000002'),
  0::numeric, 'with totals computed from what was answered');

set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-0000000000a1"}', true);

select throws_ok(
  $$select submit_assessment('f1000000-0000-0000-0000-000000000003')$$,
  'P0001', 'Answer or mark "not assessed" for: r_hidden',
  'answering r_scale >= 2 makes the hidden required item count');

select throws_ok(
  $$select submit_assessment('f1000000-0000-0000-0000-000000000004')$$,
  'P0001', 'Answer or mark "not assessed" for: r_text',
  'blank text does not count as an answer');

reset role;
insert into responses (assessment_id, item_key, value, not_assessed)
  values ('f1000000-0000-0000-0000-000000000003', 'r_hidden', null, true);
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-0000000000a1"}', true);
select lives_ok(
  $$select submit_assessment('f1000000-0000-0000-0000-000000000003')$$,
  'marking a required item "not assessed" counts as answering it');

reset role;
select * from finish();
rollback;
