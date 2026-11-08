-- 0016: a form can be disabled, and deleted while nothing has been assessed with it.
--
-- Disabled: nobody can start a NEW assessment on the form (portal, phone, or the insert policy,
-- which all go through assessable_form_locations). Assessments already started keep working, and
-- the form, its versions and its assignments are kept so it can be switched back on.
--
-- Deleted: only a form with no assessments at all (soft-deleted ones count, they still reference
-- a version). Removing it also removes its versions and assignments.

alter table forms add column active boolean not null default true;

create or replace function assessable_form_locations(p_user uuid)
returns table (form_id uuid, location_id uuid)
language sql stable security definer set search_path = public as $$
  select distinct fa.form_id, l.id
  from form_assignments fa
  join forms f on f.id = fa.form_id and f.active
  join locations l on l.organisation_id = fa.organisation_id and l.active
  where (fa.user_id is null or fa.user_id = p_user)
    and (fa.location_id is null or location_in_subtree(l.id, fa.location_id))
    and user_has_location_role(p_user, l.id, '{assessor,manager,super_admin}');
$$;

-- How many assessments use any version of this form. Form managers only, because the
-- assessments themselves may not be visible to them.
create or replace function form_assessment_count(p_form uuid)
returns integer language plpgsql stable security definer set search_path = public as $$
declare org uuid;
begin
  select organisation_id into org from forms where id = p_form;
  if org is null or not has_role(org, '{super_admin,form_editor}') then
    raise exception 'You cannot manage this form';
  end if;
  return (select count(*)::int from assessments a
            join form_versions fv on fv.id = a.form_version_id
           where fv.form_id = p_form);
end $$;

create or replace function delete_form(p_form uuid)
returns void language plpgsql security definer set search_path = public as $$
declare n integer;
begin
  n := form_assessment_count(p_form);
  if n > 0 then
    raise exception 'This form has % % and cannot be deleted. Disable it instead.',
      n, case when n = 1 then 'assessment' else 'assessments' end;
  end if;
  delete from forms where id = p_form;
end $$;

revoke execute on function form_assessment_count(uuid), delete_form(uuid) from public, anon;
grant execute on function form_assessment_count(uuid), delete_form(uuid) to authenticated;

notify pgrst, 'reload schema';
