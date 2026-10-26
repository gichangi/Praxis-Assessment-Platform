-- 0003_functions.sql : workflow functions, scoring, audit and housekeeping triggers.

-- ---------- updated_at ----------
create or replace function touch_updated_at() returns trigger language plpgsql as $$
begin new.updated_at := now(); return new; end $$;

create trigger t_form_versions_touch before update on form_versions for each row execute function touch_updated_at();
create trigger t_assessments_touch before update on assessments for each row execute function touch_updated_at();
create trigger t_tickets_touch before update on support_tickets for each row execute function touch_updated_at();
create trigger t_help_touch before update on help_articles for each row execute function touch_updated_at();

-- ---------- Published form versions are frozen ----------
create or replace function freeze_published_version() returns trigger language plpgsql as $$
begin
  if old.status <> 'draft' and new.definition is distinct from old.definition then
    raise exception 'Form version % is %, its definition cannot change. Create a new draft.', old.version, old.status;
  end if;
  if old.status = 'archived' and new.status <> 'archived' then
    raise exception 'Archived versions cannot be reactivated.';
  end if;
  return new;
end $$;
create trigger t_freeze_published before update on form_versions for each row execute function freeze_published_version();

-- Called by the publish-form edge function AFTER it has run the TypeScript validator.
create or replace function publish_form_version(p_version_id uuid, p_checksum text, p_note text)
returns form_versions language plpgsql security definer set search_path = public as $$
declare v form_versions; org uuid;
begin
  select * into v from form_versions where id = p_version_id;
  select f.organisation_id into org from forms f where f.id = v.form_id;
  if not has_role(org, '{super_admin,form_editor}') then raise exception 'Not allowed to publish'; end if;
  if v.status <> 'draft' then raise exception 'Only drafts can be published'; end if;
  update form_versions set status = 'published', checksum = p_checksum, change_note = p_note,
         published_by = auth.uid(), published_at = now()
   where id = p_version_id returning * into v;
  return v;
end $$;

-- Start a new draft by copying the latest published definition.
create or replace function create_draft_from(p_version_id uuid, p_new_version text)
returns form_versions language plpgsql security definer set search_path = public as $$
declare src form_versions; org uuid; v form_versions;
begin
  select * into src from form_versions where id = p_version_id;
  select organisation_id into org from forms where id = src.form_id;
  if not has_role(org, '{super_admin,form_editor}') then raise exception 'Not allowed'; end if;
  insert into form_versions (form_id, version, status, definition, created_by)
  values (src.form_id, p_new_version, 'draft',
          jsonb_set(src.definition, '{version}', to_jsonb(p_new_version)), auth.uid())
  returning * into v;
  return v;
end $$;

-- Translators edit text only. p_entries = [{"path": ["sections","0","items","3","title"], "text": "..."}]
-- Each path must point at an existing i18n object that has default-language text.
create or replace function save_translations(p_version_id uuid, p_lang text, p_entries jsonb)
returns int language plpgsql security definer set search_path = public as $$
declare v form_versions; org uuid; e jsonb; p text[]; def jsonb; n int := 0; dflt text;
begin
  select * into v from form_versions where id = p_version_id;
  select organisation_id into org from forms where id = v.form_id;
  if not has_role(org, '{super_admin,form_editor,translator}') then raise exception 'Not allowed'; end if;
  if v.status <> 'draft' then raise exception 'Translate the draft version, not a published one'; end if;
  def := v.definition; dflt := def->>'default_language';
  if not (def->'languages') ? p_lang then raise exception 'Language % is not enabled for this form', p_lang; end if;
  if p_lang = dflt then raise exception 'Use the form builder to edit the default language'; end if;
  for e in select * from jsonb_array_elements(p_entries) loop
    select array_agg(x) into p from jsonb_array_elements_text(e->'path') x;
    if jsonb_typeof(def #> p) <> 'object' or (def #> p) ->> dflt is null then
      raise exception 'Path % is not a translatable text', p;
    end if;
    def := jsonb_set(def, p || p_lang, to_jsonb(e->>'text'));
    n := n + 1;
  end loop;
  update form_versions set definition = def where id = p_version_id;
  return n;
end $$;

-- ---------- Scoring (server is the source of truth for totals) ----------
create or replace function compute_totals(p_assessment_id uuid)
returns jsonb language plpgsql stable security definer set search_path = public as $$
declare
  def jsonb; sec jsonb; it jsonb; r responses; item_max numeric; w numeric; grp text;
  s_score numeric; s_max numeric; answered int; na int; missing text[] := '{}';
  groups jsonb; out jsonb := '{"sections": {}}'::jsonb; all_score numeric := 0; all_max numeric := 0;
begin
  select fv.definition into def from assessments a join form_versions fv on fv.id = a.form_version_id
   where a.id = p_assessment_id;
  for sec in select * from jsonb_array_elements(def->'sections') loop
    s_score := 0; s_max := 0; answered := 0; na := 0; groups := '{}'::jsonb;
    for it in select * from jsonb_array_elements(sec->'items') loop
      continue when not coalesce((it->>'include_in_total')::boolean, true)
                or it->>'type' not in ('scale', 'single_choice', 'yes_no');
      if it->>'type' = 'yes_no' then item_max := 1;
      else
        select max((l->>'value')::numeric) into item_max
          from jsonb_array_elements(def->'scales') s, jsonb_array_elements(s->'levels') l
         where s->>'key' = it->>'scale';
      end if;
      w := coalesce((it->>'weight')::numeric, 1);
      grp := coalesce(it->>'group', sec->>'key');
      select * into r from responses where assessment_id = p_assessment_id and item_key = it->>'key';
      if found and r.not_assessed then
        na := na + 1;
      elsif found and r.value is not null then
        answered := answered + 1;
        s_score := s_score + r.value * w; s_max := s_max + item_max * w;
        groups := jsonb_set(groups, array[grp], jsonb_build_object(
          'score', coalesce((groups->grp->>'score')::numeric, 0) + r.value * w,
          'max',   coalesce((groups->grp->>'max')::numeric, 0) + item_max * w,
          'count', coalesce((groups->grp->>'count')::int, 0) + 1));
      else
        missing := missing || (it->>'key');
      end if;
    end loop;
    out := jsonb_set(out, array['sections', sec->>'key'], jsonb_build_object(
      'score', s_score, 'max', s_max, 'answered', answered, 'not_assessed', na,
      'pct', case when s_max > 0 then round(100 * s_score / s_max, 1) end, 'groups', groups));
    all_score := all_score + s_score; all_max := all_max + s_max;
  end loop;
  return out || jsonb_build_object('score', all_score, 'max', all_max,
    'pct', case when all_max > 0 then round(100 * all_score / all_max, 1) end, 'missing', to_jsonb(missing));
end $$;

-- ---------- Assessment workflow ----------
create or replace function submit_assessment(p_id uuid)
returns assessments language plpgsql security definer set search_path = public as $$
declare a assessments; t jsonb;
begin
  select * into a from assessments where id = p_id;
  if not can_edit_assessment(a) then raise exception 'You cannot submit this assessment'; end if;
  t := compute_totals(p_id);
  if jsonb_array_length(t->'missing') > 0 then
    raise exception 'Answer or mark "not assessed" for: %', t->'missing';
  end if;
  update assessments set status = 'submitted', totals = t - 'missing', submitted_at = now()
   where id = p_id returning * into a;
  return a;
end $$;

create or replace function review_assessment(p_id uuid, p_decision text, p_note text default null)
returns assessments language plpgsql security definer set search_path = public as $$
declare a assessments;
begin
  select * into a from assessments where id = p_id;
  if not (has_district_role(a.district_id, '{manager}') or has_role(a.organisation_id, '{super_admin}')) then
    raise exception 'Only managers can review assessments';
  end if;
  if a.status <> 'submitted' then raise exception 'Only submitted assessments can be reviewed'; end if;
  if p_decision not in ('returned', 'approved') then raise exception 'Decision must be returned or approved'; end if;
  update assessments set status = p_decision::assessment_status, review_note = p_note
   where id = p_id returning * into a;
  return a;
end $$;

-- ---------- Audit ----------
create or replace function write_audit() returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into audit_log (actor, action, entity, entity_id, diff)
  values (auth.uid(), lower(tg_op), tg_table_name,
          coalesce((case when tg_op = 'DELETE' then old.id else new.id end)::text, ''),
          case when tg_op = 'UPDATE' then jsonb_build_object('old', to_jsonb(old), 'new', to_jsonb(new))
               when tg_op = 'INSERT' then to_jsonb(new) else to_jsonb(old) end);
  return coalesce(new, old);
end $$;

create trigger t_audit_form_versions after insert or update or delete on form_versions for each row execute function write_audit();
create trigger t_audit_assessments after update of status, deleted_at on assessments for each row execute function write_audit();
create trigger t_audit_memberships after insert or update or delete on memberships for each row execute function write_audit();
