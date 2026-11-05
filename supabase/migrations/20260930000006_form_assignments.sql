-- 0006_form_assignments.sql : decide which forms a person may assess, and where.
--
-- A row says "this form may be assessed at this location by this person":
--   location_id null  = at every location
--   user_id     null  = by every assessor in the organisation
-- Assigning a location covers that location and everything beneath it.
-- A person only ever sees the intersection of their assignments and the locations
-- their own membership covers (memberships.location_id), restricted to roles that can assess.

create table form_assignments (
  id              uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references organisations on delete cascade,
  form_id         uuid not null references forms on delete cascade,
  location_id     uuid references locations on delete cascade,
  user_id         uuid references profiles on delete cascade,
  created_by      uuid references profiles default auth.uid(),
  created_at      timestamptz not null default now(),
  unique nulls not distinct (form_id, location_id, user_id)
);
create index on form_assignments (organisation_id, user_id);

alter table form_assignments enable row level security;

-- ---------- Integrity: everything referenced must belong to the same organisation ----------
create or replace function check_form_assignment() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if not exists (select 1 from forms f where f.id = new.form_id and f.organisation_id = new.organisation_id) then
    raise exception 'Form does not belong to this organisation';
  end if;
  if new.location_id is not null and not exists (
       select 1 from locations l where l.id = new.location_id and l.organisation_id = new.organisation_id) then
    raise exception 'Location does not belong to this organisation';
  end if;
  if new.user_id is not null and not exists (
       select 1 from memberships m where m.user_id = new.user_id and m.organisation_id = new.organisation_id) then
    raise exception 'User is not a member of this organisation';
  end if;
  return new;
end $$;

create trigger t_form_assignments_check before insert or update on form_assignments
  for each row execute function check_form_assignment();
create trigger t_audit_form_assignments after insert or delete on form_assignments
  for each row execute function write_audit();

-- ---------- Policies ----------
create policy form_assignment_read on form_assignments for select using (
  has_role(organisation_id, '{super_admin,form_editor,manager}')
  or (is_member(organisation_id) and (user_id is null or user_id = auth.uid())));

create policy form_assignment_write on form_assignments for all
  using (has_role(organisation_id, '{super_admin,form_editor}'))
  with check (has_role(organisation_id, '{super_admin,form_editor}'));

-- ---------- Helpers ----------

-- True when p_location is p_root or sits anywhere beneath it. `union` (not `union all`)
-- stops the walk if a bad edit ever creates a parent cycle.
create or replace function location_in_subtree(p_location uuid, p_root uuid)
returns boolean language sql stable security definer set search_path = public as $$
  with recursive up(id, parent_id) as (
    select id, parent_id from locations where id = p_location
    union
    select l.id, l.parent_id from locations l join up on l.id = up.parent_id
  )
  select exists (select 1 from up where id = p_root);
$$;

-- Same rule as has_location_role(), for an explicit user (edge functions run as service role).
create or replace function user_has_location_role(p_user uuid, p_location uuid, p_roles app_role[])
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1
    from locations l
    join memberships m on m.organisation_id = l.organisation_id
    where l.id = p_location
      and m.user_id = p_user
      and m.role = any(p_roles)
      and (m.location_id is null or location_in_subtree(p_location, m.location_id)));
$$;

-- The concrete (form, location) pairs a user may start an assessment for.
create or replace function assessable_form_locations(p_user uuid)
returns table (form_id uuid, location_id uuid)
language sql stable security definer set search_path = public as $$
  select distinct fa.form_id, l.id
  from form_assignments fa
  join locations l on l.organisation_id = fa.organisation_id and l.active
  where (fa.user_id is null or fa.user_id = p_user)
    and (fa.location_id is null or location_in_subtree(l.id, fa.location_id))
    and user_has_location_role(p_user, l.id, '{assessor,manager,super_admin}');
$$;

create or replace function user_can_assess(p_user uuid, p_form_version_id uuid, p_location uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1
    from form_versions fv
    join assessable_form_locations(p_user) a on a.form_id = fv.form_id
    where fv.id = p_form_version_id and a.location_id = p_location);
$$;

-- Callers acting as themselves (admin portal, RLS).
create or replace function my_assessable_form_locations()
returns table (form_id uuid, location_id uuid)
language sql stable security definer set search_path = public as $$
  select a.form_id, a.location_id from assessable_form_locations(auth.uid()) a;
$$;

create or replace function can_assess_here(p_form_version_id uuid, p_location uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select user_can_assess(auth.uid(), p_form_version_id, p_location);
$$;

-- The explicit-user variants let a caller probe anyone's access, so only the
-- service role (edge functions) may call them.
revoke execute on function
  location_in_subtree(uuid, uuid),
  user_has_location_role(uuid, uuid, app_role[]),
  assessable_form_locations(uuid),
  user_can_assess(uuid, uuid, uuid)
  from public, anon, authenticated;
grant execute on function
  location_in_subtree(uuid, uuid),
  user_has_location_role(uuid, uuid, app_role[]),
  assessable_form_locations(uuid),
  user_can_assess(uuid, uuid, uuid)
  to service_role;

revoke execute on function my_assessable_form_locations(), can_assess_here(uuid, uuid) from public, anon;
grant execute on function my_assessable_form_locations(), can_assess_here(uuid, uuid) to authenticated, service_role;

-- ---------- New assessments must use an assigned form at an assigned location ----------
drop policy assessment_insert on assessments;
create policy assessment_insert on assessments for insert with check (
  created_by = auth.uid() and status = 'draft'
  and has_location_role(location_id, '{assessor,manager,super_admin}')
  and can_assess_here(form_version_id, location_id));

-- Make the new rpc functions visible to PostgREST without a restart.
notify pgrst, 'reload schema';
