-- 0008_editors_see_members.sql : form editors can see who is in their organisation.
--
-- Assigning a form means picking people (with their role and location), but memberships
-- were readable only by super admins and the person themselves, so a form editor saw a
-- list of one. Reading is enough: changing memberships stays with super admins
-- (membership_admin is unchanged).

drop policy membership_read on memberships;
create policy membership_read on memberships for select using (
  user_id = auth.uid() or has_role(organisation_id, '{super_admin,form_editor}'));

notify pgrst, 'reload schema';
