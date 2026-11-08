-- 0010_member_emails.sql : sign-in emails for the team list, for super admins only.
-- Bulk version of member_email(), so the team table needs one call instead of one per row.

create or replace function member_emails()
returns table (user_id uuid, email text)
language sql stable security definer set search_path = public, auth as $$
  select u.id, u.email::text
  from auth.users u
  where exists (
    select 1 from memberships m
     where m.user_id = u.id and has_role(m.organisation_id, '{super_admin}'));
$$;

revoke execute on function member_emails() from public, anon;
grant execute on function member_emails() to authenticated;

notify pgrst, 'reload schema';
