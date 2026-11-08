-- 0009_member_email.sql : let a super admin see a team member's sign-in email.
--
-- Emails live in auth.users, which the admin portal (anon key + user JWT) cannot read, and
-- profiles deliberately has no email column so colleagues can't browse each other's addresses.
-- This returns the email only to a super admin of an organisation the person belongs to.

create or replace function member_email(p_user uuid)
returns text language sql stable security definer set search_path = public, auth as $$
  select u.email::text
  from auth.users u
  where u.id = p_user
    and exists (
      select 1 from memberships m
       where m.user_id = p_user and has_role(m.organisation_id, '{super_admin}'));
$$;

revoke execute on function member_email(uuid) from public, anon;
grant execute on function member_email(uuid) to authenticated;

notify pgrst, 'reload schema';
