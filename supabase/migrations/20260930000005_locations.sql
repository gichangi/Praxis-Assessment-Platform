-- 0005_locations.sql : replace states+districts with a generic n-level locations tree.
-- Each location has an optional parent_id (null = root / top-level).
-- assessments.district_id  → assessments.location_id
-- memberships.state_id     → memberships.location_id

-- ---------- 1. New locations table ----------
create table locations (
  id              uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references organisations on delete cascade,
  parent_id       uuid references locations on delete restrict,
  code            text not null,
  name            jsonb not null,
  level           int  not null default 0,
  active          boolean not null default true,
  created_at      timestamptz not null default now(),
  unique nulls not distinct (organisation_id, parent_id, code)
);

alter table locations enable row level security;

create policy location_read on locations for select using (is_member(organisation_id));
create policy location_admin on locations for all
  using (has_role(organisation_id, '{super_admin}'))
  with check (has_role(organisation_id, '{super_admin}'));

-- ---------- 2. Migrate states → locations (level 0, parent_id null) ----------
insert into locations (id, organisation_id, parent_id, code, name, level, active)
select id, organisation_id, null, code, name, 0, true
from states;

-- ---------- 3. Migrate districts → locations (level 1, parent_id = state's location id) ----------
insert into locations (id, organisation_id, parent_id, code, name, level, active)
select d.id, s.organisation_id, d.state_id, d.code, d.name, 1, d.active
from districts d join states s on s.id = d.state_id;

-- ---------- 4. Add location_id to assessments ----------
alter table assessments add column location_id uuid references locations;
update assessments set location_id = district_id;
alter table assessments alter column location_id set not null;
-- Drop the old policy before dropping district_id (it references that column).
drop policy if exists assessment_insert on assessments;
alter table assessments drop column district_id;

-- ---------- 5. Add location_id to memberships (replaces state_id) ----------
alter table memberships add column location_id uuid references locations;
update memberships set location_id = state_id where state_id is not null;
alter table memberships drop column state_id;

-- ---------- 6. Update unique constraint on memberships ----------
alter table memberships drop constraint if exists memberships_user_id_organisation_id_role_state_id_key;
alter table memberships
  add constraint memberships_user_id_organisation_id_role_location_id_key
  unique nulls not distinct (user_id, organisation_id, role, location_id);

-- ---------- 7. Recreate assessment index ----------
drop index if exists assessments_organisation_id_district_id_assessed_on_idx;
create index on assessments (organisation_id, location_id, assessed_on);

-- ---------- 8. Drop old tables (after data migration) ----------
drop table districts;
drop table states;

-- ---------- 9. Update helper functions ----------

-- has_location_role: check that the calling user has one of the given roles scoped to
-- the provided location (or any ancestor of it, up to the root org).
-- Membership with location_id null = all locations in the org.
create or replace function has_location_role(loc uuid, roles app_role[])
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from locations l
    join memberships m on m.organisation_id = l.organisation_id
    where l.id = loc
      and m.user_id = auth.uid()
      and m.role = any(roles)
      and (m.location_id is null or m.location_id = l.id
           or m.location_id in (
             -- ancestor ids (walk up parent chain via recursive CTE)
             with recursive ancestors as (
               select parent_id from locations where id = loc
               union all
               select l2.parent_id from locations l2 join ancestors a on a.parent_id = l2.id
               where l2.parent_id is not null
             )
             select parent_id from ancestors where parent_id is not null
           )));
$$;

-- Keep has_district_role as alias for backward compatibility (edge functions may reference it).
create or replace function has_district_role(dist uuid, roles app_role[])
returns boolean language sql stable security definer set search_path = public as $$
  select has_location_role(dist, roles);
$$;

create or replace function can_read_assessment(a assessments)
returns boolean language sql stable security definer set search_path = public as $$
  select a.deleted_at is null and (
       a.created_by = auth.uid()
    or auth.uid() = any(a.assessors)
    or has_role(a.organisation_id, '{super_admin}')
    or has_location_role(a.location_id, '{manager}')
    or (a.status in ('submitted', 'approved') and has_location_role(a.location_id, '{viewer}')));
$$;

-- can_edit_assessment has no location reference — no change needed.

-- review_assessment also referenced district_id — update it.
create or replace function review_assessment(p_id uuid, p_decision text, p_note text default null)
returns assessments language plpgsql security definer set search_path = public as $$
declare a assessments;
begin
  select * into a from assessments where id = p_id;
  if not (has_location_role(a.location_id, '{manager}') or has_role(a.organisation_id, '{super_admin}')) then
    raise exception 'Only managers can review assessments';
  end if;
  if a.status <> 'submitted' then raise exception 'Only submitted assessments can be reviewed'; end if;
  if p_decision not in ('returned', 'approved') then raise exception 'Decision must be returned or approved'; end if;
  update assessments set status = p_decision::assessment_status, review_note = p_note
   where id = p_id returning * into a;
  return a;
end $$;

-- ---------- 10. Recreate assessment_insert policy using location_id ----------
create policy assessment_insert on assessments for insert with check (
  created_by = auth.uid() and status = 'draft'
  and has_location_role(location_id, '{assessor,manager,super_admin}'));

