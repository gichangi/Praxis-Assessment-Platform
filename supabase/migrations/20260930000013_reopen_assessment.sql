-- 0013: the person an assessment belongs to can pull it back from "submitted" to "draft" to
-- change it. Approved assessments are final, and nobody else can reopen someone's work.
-- Status changes only ever go through functions (RLS blocks direct updates), so this is one.

create or replace function reopen_assessment(p_id uuid)
returns assessments language plpgsql security definer set search_path = public as $$
declare a assessments;
begin
  select * into a from assessments where id = p_id and deleted_at is null;
  if not found or not (a.created_by = auth.uid() or auth.uid() = any(a.assessors)) then
    raise exception 'You cannot edit this assessment';
  end if;
  if a.status = 'approved' then raise exception 'Approved assessments cannot be edited'; end if;
  if a.status <> 'submitted' then raise exception 'Only submitted assessments can be reopened'; end if;
  -- Totals are recomputed when it is submitted again, so don't leave stale ones behind.
  update assessments set status = 'draft', totals = null, submitted_at = null
   where id = p_id returning * into a;
  return a;
end $$;

revoke execute on function reopen_assessment(uuid) from public, anon;
grant execute on function reopen_assessment(uuid) to authenticated;

notify pgrst, 'reload schema';
