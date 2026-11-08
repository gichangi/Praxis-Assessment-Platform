-- pgTAP test for 0017_form_codes.sql
-- Run: supabase test db

begin;
select plan(7);

do $$
begin
  insert into organisations (id, name) values
    ('a1000000-0000-0000-0000-000000000001', 'Org One'),
    ('a1000000-0000-0000-0000-000000000002', 'Org Two');
end $$;

insert into forms (id, organisation_id, title) values
  ('e1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', '{"en":"Service Quality"}'),
  ('e1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000001', '{"en":"Service Quality"}');

select is(
  (select key from forms where id = 'e1000000-0000-0000-0000-000000000001'),
  'form_001', 'the first form gets form_001');
select is(
  (select key from forms where id = 'e1000000-0000-0000-0000-000000000002'),
  'form_002', 'the next gets form_002, even with the same name');

update forms set title = '{"en":"Something else entirely"}' where id = 'e1000000-0000-0000-0000-000000000001';
select is(
  (select key from forms where id = 'e1000000-0000-0000-0000-000000000001'),
  'form_001', 'renaming a form does not change its code');

delete from forms where id = 'e1000000-0000-0000-0000-000000000002';
insert into forms (id, organisation_id, title)
  values ('e1000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000001', '{"en":"C"}');
select is(
  (select key from forms where id = 'e1000000-0000-0000-0000-000000000003'),
  'form_003', 'a deleted form''s code is never reused');

insert into forms (id, organisation_id, key, title)
  values ('e1000000-0000-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000001', 'custom_key', '{"en":"D"}');
select is(
  (select key from forms where id = 'e1000000-0000-0000-0000-000000000004'),
  'custom_key', 'a key that is supplied is kept');

-- form_004 is taken by hand, so the counter must step over it.
insert into forms (id, organisation_id, key, title)
  values ('e1000000-0000-0000-0000-000000000005', 'a1000000-0000-0000-0000-000000000001', 'form_004', '{"en":"E"}');
insert into forms (id, organisation_id, title)
  values ('e1000000-0000-0000-0000-000000000006', 'a1000000-0000-0000-0000-000000000001', '{"en":"F"}');
select is(
  (select key from forms where id = 'e1000000-0000-0000-0000-000000000006'),
  'form_005', 'a code already in use is skipped');

insert into forms (id, organisation_id, title)
  values ('e1000000-0000-0000-0000-000000000007', 'a1000000-0000-0000-0000-000000000002', '{"en":"G"}');
select is(
  (select key from forms where id = 'e1000000-0000-0000-0000-000000000007'),
  'form_001', 'each organisation counts from its own form_001');

select * from finish();
rollback;
