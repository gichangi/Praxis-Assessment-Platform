-- pgTAP test for 0008_editors_see_members.sql
-- Run: supabase test db

begin;
select plan(4);

do $$
declare
  org1 uuid := 'a1000000-0000-0000-0000-000000000001';
  u uuid;
begin
  foreach u in array array[
    '00000000-0000-0000-0000-0000000000e1'::uuid,   -- form editor
    '00000000-0000-0000-0000-0000000000a1'::uuid,   -- assessor
    '00000000-0000-0000-0000-0000000000a2'::uuid    -- another assessor
  ] loop
    insert into auth.users (id, email, raw_user_meta_data, created_at, updated_at, aud, role, instance_id)
    values (u, u::text || '@test.local', '{"full_name":"Test"}'::jsonb, now(), now(),
            'authenticated', 'authenticated', '00000000-0000-0000-0000-000000000000');
    insert into public.profiles (id, full_name) values (u, 'Test') on conflict (id) do nothing;
  end loop;

  insert into organisations (id, name) values (org1, 'Org One');
  insert into memberships (user_id, organisation_id, role) values
    ('00000000-0000-0000-0000-0000000000e1', org1, 'form_editor'),
    ('00000000-0000-0000-0000-0000000000a1', org1, 'assessor'),
    ('00000000-0000-0000-0000-0000000000a2', org1, 'assessor');
end $$;

set local role authenticated;

select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-0000000000e1"}', true);
select is((select count(*)::int from memberships), 3,
  'a form editor sees everyone in the organisation');

update memberships set role = 'super_admin' where user_id = '00000000-0000-0000-0000-0000000000a1';
reset role;
select is(
  (select role::text from memberships where user_id = '00000000-0000-0000-0000-0000000000a1'),
  'assessor', 'a form editor still cannot change anyone''s role');
set local role authenticated;

select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-0000000000a1"}', true);
select is((select count(*)::int from memberships), 1,
  'an assessor still sees only their own membership');

select is(
  (select user_id from memberships),
  '00000000-0000-0000-0000-0000000000a1'::uuid,
  'and that membership is theirs');

reset role;
select * from finish();
rollback;
