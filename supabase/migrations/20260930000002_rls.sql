-- 0002_rls.sql : row-level security. The database enforces who sees what,
-- so a bug in the mobile app or admin portal cannot leak another state's data.
-- Status changes (submit, return, approve, publish) go through the functions in 0003,
-- not direct updates.

-- ---------- Helpers ----------
create or replace function has_role(org uuid, roles app_role[])
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from memberships m
    where m.user_id = auth.uid() and m.organisation_id = org and m.role = any(roles));
$$;

create or replace function is_member(org uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from memberships m where m.user_id = auth.uid() and m.organisation_id = org);
$$;

-- Role in the org that also covers this district's state (state_id null = every state).
create or replace function has_district_role(dist uuid, roles app_role[])
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from districts d join states s on s.id = d.state_id
    join memberships m on m.organisation_id = s.organisation_id
    where d.id = dist and m.user_id = auth.uid() and m.role = any(roles)
      and (m.state_id is null or m.state_id = s.id));
$$;

create or replace function can_read_assessment(a assessments)
returns boolean language sql stable security definer set search_path = public as $$
  select a.deleted_at is null and (
       a.created_by = auth.uid()
    or auth.uid() = any(a.assessors)
    or has_role(a.organisation_id, '{super_admin}')
    or has_district_role(a.district_id, '{manager}')
    or (a.status in ('submitted', 'approved') and has_district_role(a.district_id, '{viewer}')));
$$;

create or replace function can_edit_assessment(a assessments)
returns boolean language sql stable security definer set search_path = public as $$
  select a.deleted_at is null and a.status in ('draft', 'returned')
     and (a.created_by = auth.uid() or auth.uid() = any(a.assessors));
$$;

-- ---------- Enable RLS everywhere ----------
alter table organisations enable row level security;
alter table profiles enable row level security;
alter table states enable row level security;
alter table districts enable row level security;
alter table memberships enable row level security;
alter table forms enable row level security;
alter table form_versions enable row level security;
alter table assessments enable row level security;
alter table responses enable row level security;
alter table attachments enable row level security;
alter table devices enable row level security;
alter table sync_events enable row level security;
alter table support_tickets enable row level security;
alter table support_messages enable row level security;
alter table help_articles enable row level security;
alter table app_config enable row level security;
alter table audit_log enable row level security;

-- ---------- Organisation and people ----------
create policy org_read on organisations for select using (is_member(id));

create policy profile_read on profiles for select using (
  id = auth.uid() or exists (
    select 1 from memberships mine join memberships theirs on theirs.organisation_id = mine.organisation_id
    where mine.user_id = auth.uid() and theirs.user_id = profiles.id));
create policy profile_update_self on profiles for update using (id = auth.uid());

create policy state_read on states for select using (is_member(organisation_id));
create policy state_admin on states for all using (has_role(organisation_id, '{super_admin}'))
  with check (has_role(organisation_id, '{super_admin}'));

create policy district_read on districts for select using (
  exists (select 1 from states s where s.id = state_id and is_member(s.organisation_id)));
create policy district_admin on districts for all using (
  exists (select 1 from states s where s.id = state_id and has_role(s.organisation_id, '{super_admin}')))
  with check (exists (select 1 from states s where s.id = state_id and has_role(s.organisation_id, '{super_admin}')));

create policy membership_read on memberships for select using (
  user_id = auth.uid() or has_role(organisation_id, '{super_admin}'));
create policy membership_admin on memberships for all using (has_role(organisation_id, '{super_admin}'))
  with check (has_role(organisation_id, '{super_admin}'));

-- ---------- Forms ----------
create policy form_read on forms for select using (is_member(organisation_id));
create policy form_write on forms for all using (has_role(organisation_id, '{super_admin,form_editor}'))
  with check (has_role(organisation_id, '{super_admin,form_editor}'));

create policy form_version_read on form_versions for select using (
  exists (select 1 from forms f where f.id = form_id and (
    (status = 'published' and is_member(f.organisation_id))
    or has_role(f.organisation_id, '{super_admin,form_editor,translator,manager}'))));
-- Editors may create and change drafts only; publishing uses publish_form_version().
-- Translators change text only through save_translations() in 0003.
create policy form_version_draft_write on form_versions for insert with check (
  status = 'draft' and exists (select 1 from forms f where f.id = form_id
    and has_role(f.organisation_id, '{super_admin,form_editor}')));
create policy form_version_draft_update on form_versions for update using (
  status = 'draft' and exists (select 1 from forms f where f.id = form_id
    and has_role(f.organisation_id, '{super_admin,form_editor}')))
  with check (status = 'draft');

-- ---------- Assessments ----------
create policy assessment_read on assessments for select using (can_read_assessment(assessments));
create policy assessment_insert on assessments for insert with check (
  created_by = auth.uid() and status = 'draft'
  and has_district_role(district_id, '{assessor,manager,super_admin}'));
create policy assessment_update on assessments for update using (can_edit_assessment(assessments))
  with check (status in ('draft', 'returned'));

create policy response_read on responses for select using (
  exists (select 1 from assessments a where a.id = assessment_id and can_read_assessment(a)));
create policy response_write on responses for all using (
  exists (select 1 from assessments a where a.id = assessment_id and can_edit_assessment(a)))
  with check (exists (select 1 from assessments a where a.id = assessment_id and can_edit_assessment(a)));

create policy attachment_read on attachments for select using (
  exists (select 1 from assessments a where a.id = assessment_id and can_read_assessment(a)));
create policy attachment_write on attachments for all using (
  exists (select 1 from assessments a where a.id = assessment_id and can_edit_assessment(a)))
  with check (exists (select 1 from assessments a where a.id = assessment_id and can_edit_assessment(a)));

-- ---------- Devices and sync (support console reads these) ----------
create policy device_own on devices for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy device_support_read on devices for select using (exists (
  select 1 from memberships m where m.user_id = devices.user_id
    and has_role(m.organisation_id, '{super_admin,manager}')));
create policy sync_event_read on sync_events for select using (exists (
  select 1 from devices d where d.id = device_id and (d.user_id = auth.uid() or exists (
    select 1 from memberships m where m.user_id = d.user_id
      and has_role(m.organisation_id, '{super_admin,manager}')))));

-- ---------- Support ----------
create policy ticket_own on support_tickets for select using (
  user_id = auth.uid() or has_role(organisation_id, '{super_admin,manager}'));
create policy ticket_create on support_tickets for insert with check (
  user_id = auth.uid() and is_member(organisation_id));
create policy ticket_staff_update on support_tickets for update using (
  has_role(organisation_id, '{super_admin,manager}'));

create policy message_read on support_messages for select using (exists (
  select 1 from support_tickets t where t.id = ticket_id
    and (t.user_id = auth.uid() or has_role(t.organisation_id, '{super_admin,manager}'))));
create policy message_write on support_messages for insert with check (
  author_id = auth.uid() and exists (select 1 from support_tickets t where t.id = ticket_id
    and (t.user_id = auth.uid() or has_role(t.organisation_id, '{super_admin,manager}'))));

-- ---------- Help content and config ----------
create policy help_read on help_articles for select using (
  (published and is_member(organisation_id)) or has_role(organisation_id, '{super_admin,form_editor,translator}'));
create policy help_write on help_articles for all using (has_role(organisation_id, '{super_admin,form_editor}'))
  with check (has_role(organisation_id, '{super_admin,form_editor}'));

create policy config_read on app_config for select using (is_member(organisation_id));
create policy config_write on app_config for all using (has_role(organisation_id, '{super_admin}'))
  with check (has_role(organisation_id, '{super_admin}'));

-- ---------- Audit (written by triggers; read by super admins) ----------
create policy audit_read on audit_log for select using (
  exists (select 1 from memberships m where m.user_id = auth.uid() and m.role = 'super_admin'));
