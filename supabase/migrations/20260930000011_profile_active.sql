-- 0011_profile_active.sql : deactivate a team member without deleting their history.
--
-- profiles.active is set by super admins through the update-member edge function (service
-- role). The same function bans or unbans the auth user so they cannot sign in. Everything
-- else keeps working off this flag, e.g. the edge functions refuse inactive users at once
-- instead of waiting for their session to expire.

alter table profiles add column active boolean not null default true;

-- Users may still edit their own name and language, but never their own active flag.
revoke update on profiles from authenticated, anon;
grant update (full_name, preferred_language) on profiles to authenticated;

notify pgrst, 'reload schema';
