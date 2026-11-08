-- 0015: a reviewer can also reject an assessment. Unlike "returned" (sent back to be fixed and
-- submitted again), "rejected" is final: the assessor can no longer edit or resubmit it, because
-- can_edit_assessment() only allows draft and returned. A rejection must say why.

alter type assessment_status add value if not exists 'rejected';

create or replace function review_assessment(p_id uuid, p_decision text, p_note text default null)
returns assessments language plpgsql security definer set search_path = public as $$
declare a assessments;
begin
  select * into a from assessments where id = p_id;
  if not (has_location_role(a.location_id, '{manager}') or has_role(a.organisation_id, '{super_admin}')) then
    raise exception 'Only managers can review assessments';
  end if;
  if a.status <> 'submitted' then raise exception 'Only submitted assessments can be reviewed'; end if;
  if p_decision not in ('returned', 'approved', 'rejected') then
    raise exception 'Decision must be approved, returned or rejected';
  end if;
  if p_decision = 'rejected' and coalesce(btrim(p_note), '') = '' then
    raise exception 'A message is required when rejecting an assessment';
  end if;
  update assessments
     set status = p_decision::assessment_status, review_note = p_note,
         reviewed_by = auth.uid(), reviewed_at = now()
   where id = p_id returning * into a;
  return a;
end $$;

notify pgrst, 'reload schema';
