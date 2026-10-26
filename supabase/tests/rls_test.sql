-- pgTAP RLS isolation test
-- Run: supabase test db

begin;
select plan(3);

-- Simulate users with: set local role authenticated; set local request.jwt.claims = '{"sub":"<uuid>"}';
-- Full RLS tests are added alongside each new table/role in Phase 1–3.

-- Placeholder: verify helper functions exist
select has_function('public', 'has_role', array['uuid', 'app_role[]'],   'has_role() exists');
select has_function('public', 'is_member', array['uuid'],                'is_member() exists');
select has_function('public', 'has_location_role', array['uuid', 'app_role[]'], 'has_location_role() exists');

select * from finish();
rollback;
