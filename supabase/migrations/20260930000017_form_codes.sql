-- 0017: new forms get a short, readable code (form_001, form_002, ...) instead of one derived from
-- the name. The name can be edited at any time, so the code must not depend on it. Codes are
-- counted per organisation and never reused, even after a form is deleted. A caller that supplies
-- its own key still gets it. Existing forms keep the keys they have: those keys are also written
-- inside their published versions, so renaming them would make the two disagree.

alter table organisations add column form_seq integer not null default 0;

-- Carry on after the highest code already in use.
update organisations o set form_seq = coalesce((
  select max(substring(f.key from '^form_(\d+)$')::int)
    from forms f where f.organisation_id = o.id and f.key ~ '^form_\d+$'), 0);

create or replace function assign_form_key() returns trigger
language plpgsql security definer set search_path = public as $$
declare n integer; candidate text;
begin
  if new.key is not null and btrim(new.key) <> '' then return new; end if;
  loop
    update organisations set form_seq = form_seq + 1 where id = new.organisation_id
      returning form_seq into n;
    candidate := 'form_' || lpad(n::text, 3, '0');
    exit when not exists (
      select 1 from forms where organisation_id = new.organisation_id and key = candidate);
  end loop;
  new.key := candidate;
  return new;
end $$;

create trigger t_forms_assign_key before insert on forms
  for each row execute function assign_form_key();
