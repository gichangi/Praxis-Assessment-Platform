-- 0012_submit_requires_required.sql : an assessment can be submitted once its REQUIRED items are done.
--
-- submit_assessment() used to refuse unless every scored item was answered, ignoring the
-- per-item "required" flag the form builder sets. Now only required items must be answered
-- (or marked "not assessed"); optional items may stay blank and simply don't score.
--
-- "Answered" means: not assessed, or a number for scale / single_choice / yes_no / number
-- items, or non-blank text for text items. Items hidden by their visible_if condition are
-- skipped, and photo / gps items are attachments, not answers, so they never block.
-- compute_totals() is untouched, so scoring parity is unchanged.

create or replace function required_missing(p_assessment_id uuid)
returns text[] language plpgsql stable security definer set search_path = public as $$
declare
  def jsonb; sec jsonb; it jsonb; c jsonb; cv numeric;
  r responses; cr responses; shown boolean; out text[] := '{}';
begin
  select fv.definition into def
    from assessments a join form_versions fv on fv.id = a.form_version_id
   where a.id = p_assessment_id;

  for sec in select * from jsonb_array_elements(def->'sections') loop
    for it in select * from jsonb_array_elements(sec->'items') loop
      continue when not coalesce((it->>'required')::boolean, false)
                or it->>'type' not in ('scale', 'single_choice', 'yes_no', 'number', 'text');

      shown := true;
      c := it->'visible_if';
      if c is not null and jsonb_typeof(c) = 'object' then
        select * into cr from responses
         where assessment_id = p_assessment_id and item_key = c->>'item';
        cv := case when jsonb_typeof(c->'value') = 'number' then (c->>'value')::numeric end;
        shown := case c->>'op'
          when 'eq'  then cv is not null and cr.value is not null and cr.value = cv
          when 'neq' then not (cv is not null and cr.value is not null and cr.value = cv)
          when 'gte' then cv is not null and cr.value is not null and cr.value >= cv
          when 'lte' then cv is not null and cr.value is not null and cr.value <= cv
          else true
        end;
      end if;
      continue when not shown;

      select * into r from responses
       where assessment_id = p_assessment_id and item_key = it->>'key';
      if found and (
           r.not_assessed
        or (it->>'type' = 'text' and btrim(coalesce(r.note, '')) <> '')
        or (it->>'type' <> 'text' and r.value is not null)) then
        continue;
      end if;
      out := out || (it->>'key');
    end loop;
  end loop;
  return out;
end $$;

revoke execute on function required_missing(uuid) from public, anon, authenticated;
grant execute on function required_missing(uuid) to service_role;

create or replace function submit_assessment(p_id uuid)
returns assessments language plpgsql security definer set search_path = public as $$
declare a assessments; t jsonb; need text[];
begin
  select * into a from assessments where id = p_id;
  if not can_edit_assessment(a) then raise exception 'You cannot submit this assessment'; end if;
  need := required_missing(p_id);
  if coalesce(array_length(need, 1), 0) > 0 then
    raise exception 'Answer or mark "not assessed" for: %', array_to_string(need, ', ');
  end if;
  t := compute_totals(p_id);
  update assessments set status = 'submitted', totals = t - 'missing', submitted_at = now()
   where id = p_id returning * into a;
  return a;
end $$;

notify pgrst, 'reload schema';
