-- pgTAP test for 0011_profile_active.sql
-- Run: supabase test db

begin;
select plan(4);

insert into auth.users (id, email, raw_user_meta_data, created_at, updated_at, aud, role, instance_id)
values ('00000000-0000-0000-0000-0000000000a1', 'a1@test.local', '{"full_name":"Test"}'::jsonb, now(), now(),
        'authenticated', 'authenticated', '00000000-0000-0000-0000-000000000000');
insert into public.profiles (id, full_name) values ('00000000-0000-0000-0000-0000000000a1', 'Test')
  on conflict (id) do nothing;

select is(
  (select active from profiles where id = '00000000-0000-0000-0000-0000000000a1'),
  true, 'new profiles are active');

set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-0000000000a1"}', true);

select lives_ok(
  $$update profiles set full_name = 'New name' where id = '00000000-0000-0000-0000-0000000000a1'$$,
  'a user can still edit their own name');

select throws_ok(
  $$update profiles set active = false where id = '00000000-0000-0000-0000-0000000000a1'$$,
  '42501', null,
  'a user cannot change their own active flag');

reset role;
select is(
  (select active from profiles where id = '00000000-0000-0000-0000-0000000000a1'),
  true, 'and it is still active');

select * from finish();
rollback;
