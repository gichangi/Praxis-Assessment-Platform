-- 0014: record who approved or returned an assessment, and when, so the person who did the
-- work can see who decided and read their message (review_note).

alter table assessments
  add column reviewed_by uuid references profiles (id) on delete set null,
  add column reviewed_at timestamptz;

-- Fill in what the audit trail already knows about past decisions.
update assessments a set reviewed_by = l.actor, reviewed_at = l.at
  from (
    select distinct on (entity_id) entity_id, actor, at
      from audit_log
     where entity = 'assessments' and diff -> 'new' ->> 'status' in ('approved', 'returned')
     order by entity_id, at desc
  ) l
 where l.entity_id = a.id::text and a.status in ('approved', 'returned')
   and exists (select 1 from profiles p where p.id = l.actor);

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
  update assessments
     set status = p_decision::assessment_status, review_note = p_note,
         reviewed_by = auth.uid(), reviewed_at = now()
   where id = p_id returning * into a;
  return a;
end $$;

-- Only review_assessment() may set these. The person editing a returned assessment must not be
-- able to put someone else's name on a decision. (Database functions run as their owner, so
-- they are not affected; API callers are.)
create or replace function keep_review_columns() returns trigger language plpgsql as $$
begin
  if current_user in ('authenticated', 'anon') then
    new.reviewed_by := old.reviewed_by;
    new.reviewed_at := old.reviewed_at;
  end if;
  return new;
end $$;

create trigger t_assessments_keep_review before update on assessments
  for each row execute function keep_review_columns();

notify pgrst, 'reload schema';
