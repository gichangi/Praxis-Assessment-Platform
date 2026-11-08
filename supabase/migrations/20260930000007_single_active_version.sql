-- 0007_single_active_version.sql : a form has many versions but exactly one active one.
--
-- 'published' means active. Publishing a version supersedes (archives) the previous one,
-- so people starting a new assessment always get the newest form. Assessments keep the
-- version they were started on (assessments.form_version_id), so older data can still be
-- viewed, edited and submitted against the version it was collected with.

-- ---------- Existing data: keep only the newest published version per form active ----------
update form_versions fv
   set status = 'archived'
 where fv.status = 'published'
   and exists (
     select 1 from form_versions newer
      where newer.form_id = fv.form_id
        and newer.status = 'published'
        and (coalesce(newer.published_at, '-infinity'), newer.id)
          > (coalesce(fv.published_at, '-infinity'), fv.id));

create unique index one_active_per_form on form_versions (form_id) where status = 'published';

-- ---------- Publishing supersedes the previous active version ----------
-- Same contract as before (the publish-form edge function validates first), plus the
-- archive step. Archiving first keeps the unique index satisfied.
create or replace function publish_form_version(p_version_id uuid, p_checksum text, p_note text)
returns form_versions language plpgsql security definer set search_path = public as $$
declare v form_versions; org uuid;
begin
  select * into v from form_versions where id = p_version_id;
  select f.organisation_id into org from forms f where f.id = v.form_id;
  if not has_role(org, '{super_admin,form_editor}') then raise exception 'Not allowed to publish'; end if;
  if v.status <> 'draft' then raise exception 'Only drafts can be published'; end if;

  update form_versions set status = 'archived'
   where form_id = v.form_id and status = 'published';

  update form_versions set status = 'published', checksum = p_checksum, change_note = p_note,
         published_by = auth.uid(), published_at = now()
   where id = p_version_id returning * into v;
  return v;
end $$;

-- ---------- Who may start an assessment on which version ----------
-- Sync (service role): any released version, because a phone that has not synced yet may
-- legitimately upload an assessment it started on the previous active version. Drafts are
-- never released, so they are refused.
create or replace function user_can_assess(p_user uuid, p_form_version_id uuid, p_location uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1
    from form_versions fv
    join assessable_form_locations(p_user) a on a.form_id = fv.form_id
    where fv.id = p_form_version_id
      and fv.status <> 'draft'
      and a.location_id = p_location);
$$;

-- Direct inserts (admin portal) are made online, so they must use the active version.
drop policy assessment_insert on assessments;
create policy assessment_insert on assessments for insert with check (
  created_by = auth.uid() and status = 'draft'
  and has_location_role(location_id, '{assessor,manager,super_admin}')
  and can_assess_here(form_version_id, location_id)
  and exists (select 1 from form_versions fv where fv.id = form_version_id and fv.status = 'published'));

notify pgrst, 'reload schema';
