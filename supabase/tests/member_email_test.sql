-- pgTAP test for 0009_member_email.sql
-- Run: supabase test db

begin;
select plan(6);

do $$
declare
  org1 uuid := 'a1000000-0000-0000-0000-000000000001';
  org2 uuid := 'a2000000-0000-0000-0000-000000000001';
  u uuid;
begin
  foreach u in array array[
    '00000000-0000-0000-0000-0000000000a1'::uuid,   -- super admin, org1
    '00000000-0000-0000-0000-0000000000a2'::uuid,   -- assessor, org1
    '00000000-0000-0000-0000-0000000000b1'::uuid,   -- super admin, org2
    '00000000-0000-0000-0000-0000000000c1'::uuid    -- target, assessor in org1
  ] loop
    insert into auth.users (id, email, raw_user_meta_data, created_at, updated_at, aud, role, instance_id)
    values (u, 'user-' || right(u::text, 2) || '@test.local', '{"full_name":"Test"}'::jsonb, now(), now(),
            'authenticated', 'authenticated', '00000000-0000-0000-0000-000000000000');
    insert into public.profiles (id, full_name) values (u, 'Test') on conflict (id) do nothing;
  end loop;

  insert into organisations (id, name) values (org1, 'Org One'), (org2, 'Org Two');
  insert into memberships (user_id, organisation_id, role) values
    ('00000000-0000-0000-0000-0000000000a1', org1, 'super_admin'),
    ('00000000-0000-0000-0000-0000000000a2', org1, 'assessor'),
    ('00000000-0000-0000-0000-0000000000b1', org2, 'super_admin'),
    ('00000000-0000-0000-0000-0000000000c1', org1, 'assessor');
end $$;

set local role authenticated;

select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-0000000000a1"}', true);
select is(member_email('00000000-0000-0000-0000-0000000000c1'), 'user-c1@test.local',
  'a super admin can see the email of someone in their organisation');

select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-0000000000a2"}', true);
select is(member_email('00000000-0000-0000-0000-0000000000c1'), null,
  'an assessor cannot');

select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-0000000000b1"}', true);
select is(member_email('00000000-0000-0000-0000-0000000000c1'), null,
  'a super admin of another organisation cannot');

select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-0000000000a1"}', true);
select is((select count(*)::int from member_emails()), 3,
  'a super admin gets the emails of everyone in their organisation');

select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-0000000000a2"}', true);
select is((select count(*)::int from member_emails()), 0,
  'an assessor gets no emails');

reset role;
select ok(
  not has_function_privilege('anon', 'public.member_email(uuid)', 'execute'),
  'signed-out visitors cannot call it');

select * from finish();
rollback;
