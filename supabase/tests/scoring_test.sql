-- pgTAP scoring parity test
-- Requirement: SQL compute_totals() must return 116/228 on the Garowe fixture,
-- matching packages/core/test/scoring.test.ts and apps/mobile/test/domain/scoring_test.dart.
-- Run: supabase test db

begin;
select plan(5);

do $$
declare
  org_id   uuid := 'a0000000-0000-0000-0000-000000000001';
  loc_id   uuid := 'c0000000-0000-0000-0000-000000000001';
  form_id  uuid := 'e0000000-0000-0000-0000-000000000001';
  fv_id    uuid := 'd0000000-0000-0000-0000-000000000001';
  asmnt_id uuid := 'f0000000-0000-0000-0000-000000000001';
  user_id  uuid := '00000000-0000-0000-0000-000000000001';
  def      jsonb;
begin
  -- ── auth + profile ──────────────────────────────────────────────────────────
  insert into auth.users (id, email, raw_user_meta_data, created_at, updated_at,
                          aud, role, instance_id)
  values (user_id, 'parity@test.local', '{"full_name":"Parity Test"}'::jsonb,
          now(), now(), 'authenticated', 'authenticated',
          '00000000-0000-0000-0000-000000000000');
  insert into public.profiles (id, full_name) values (user_id, 'Parity Test')
    on conflict (id) do nothing;

  -- ── org / location ────────────────────────────────────────────────────────
  insert into organisations (id, name) values (org_id, 'Test Org');
  insert into locations (id, organisation_id, parent_id, code, name, level)
    values (loc_id, org_id, null, 'garowe', '{"en":"Garowe"}'::jsonb, 0);

  -- ── minimal Garowe form definition (scales + item keys only) ──────────────
  -- Five 0-6 scales; 32 governance items + 7 logistics items = 39 total.
  -- This is the minimal structure compute_totals() needs: scale keys, item keys,
  -- type, include_in_total (omitted = true), weight (omitted = 1).
  def := $json${
    "schema_version": 1,
    "form_key": "district_governance_assessment",
    "version": "1.0.0",
    "default_language": "en",
    "languages": ["en"],
    "title": {"en": "District Governance Assessment"},
    "scoring": {"method": "sum", "exclude_not_assessed": true, "show_percentage": true},
    "scales": [
      {"key": "maturity_0_6",     "levels": [{"value":0},{"value":1},{"value":2},{"value":3},{"value":4},{"value":5},{"value":6}]},
      {"key": "logistics_scale_1","levels": [{"value":0},{"value":1},{"value":2},{"value":3},{"value":4},{"value":5},{"value":6}]},
      {"key": "logistics_scale_2","levels": [{"value":0},{"value":1},{"value":2},{"value":3},{"value":4},{"value":5},{"value":6}]},
      {"key": "logistics_scale_3","levels": [{"value":0},{"value":1},{"value":2},{"value":3},{"value":4},{"value":5},{"value":6}]},
      {"key": "logistics_scale_4","levels": [{"value":0},{"value":1},{"value":2},{"value":3},{"value":4},{"value":5},{"value":6}]}
    ],
    "sections": [
      {
        "key": "governance",
        "title": {"en": "Governance"},
        "groups": [],
        "items": [
          {"key":"stability_defined_no_conflicts",              "type":"scale","scale":"maturity_0_6","group":"council_stability"},
          {"key":"structured_approach_ability_dispute",         "type":"scale","scale":"maturity_0_6","group":"council_stability"},
          {"key":"councillors_elected_selected_building",       "type":"scale","scale":"maturity_0_6","group":"council_stability"},
          {"key":"understanding_motivations_possible_incentives","type":"scale","scale":"maturity_0_6","group":"council_stability"},
          {"key":"key_stakeholders_district_known",             "type":"scale","scale":"maturity_0_6","group":"council_stability"},
          {"key":"communications_between_key_stakeholders",     "type":"scale","scale":"maturity_0_6","group":"council_stability"},
          {"key":"social_reconciliation_social_healing",        "type":"scale","scale":"maturity_0_6","group":"council_stability"},
          {"key":"basis_social_contract_understanding",         "type":"scale","scale":"maturity_0_6","group":"council_stability"},
          {"key":"participation_wider_district_constituents",   "type":"scale","scale":"maturity_0_6","group":"participation_resources"},
          {"key":"working_assumptions_financial_flows",         "type":"scale","scale":"maturity_0_6","group":"participation_resources"},
          {"key":"resources_district_controls",                 "type":"scale","scale":"maturity_0_6","group":"participation_resources"},
          {"key":"support_from_state_through",                  "type":"scale","scale":"maturity_0_6","group":"participation_resources"},
          {"key":"technical_skills_available_district",         "type":"scale","scale":"maturity_0_6","group":"participation_resources"},
          {"key":"committees_consultative_bodies_place",        "type":"scale","scale":"maturity_0_6","group":"participation_resources"},
          {"key":"water_department",                            "type":"scale","scale":"maturity_0_6","group":"technical_services"},
          {"key":"health_department",                           "type":"scale","scale":"maturity_0_6","group":"technical_services"},
          {"key":"education_department",                        "type":"scale","scale":"maturity_0_6","group":"technical_services"},
          {"key":"public_works_time_reach",                     "type":"scale","scale":"maturity_0_6","group":"technical_services"},
          {"key":"cash_programming_district_district",          "type":"scale","scale":"maturity_0_6","group":"technical_services"},
          {"key":"agriculture_livestock_environmental_management","type":"scale","scale":"maturity_0_6","group":"technical_services"},
          {"key":"government_effectiveness",                    "type":"scale","scale":"maturity_0_6","group":"technical_services"},
          {"key":"base_knowledge_district_population",          "type":"scale","scale":"maturity_0_6","group":"effectiveness_systems"},
          {"key":"knowledge_working_district",                  "type":"scale","scale":"maturity_0_6","group":"effectiveness_systems"},
          {"key":"management_skills_district_resourced",        "type":"scale","scale":"maturity_0_6","group":"effectiveness_systems"},
          {"key":"involvement_ingo_un_project",                 "type":"scale","scale":"maturity_0_6","group":"effectiveness_systems"},
          {"key":"basic_service_delivery_delivered",            "type":"scale","scale":"maturity_0_6","group":"effectiveness_systems"},
          {"key":"basic_service_knowledge_available",           "type":"scale","scale":"maturity_0_6","group":"effectiveness_systems"},
          {"key":"systems_communications",                      "type":"scale","scale":"maturity_0_6","group":"effectiveness_systems"},
          {"key":"systems_procurement",                         "type":"scale","scale":"maturity_0_6","group":"effectiveness_systems"},
          {"key":"systems_data_management",                     "type":"scale","scale":"maturity_0_6","group":"effectiveness_systems"},
          {"key":"systems_m_e_capability",                      "type":"scale","scale":"maturity_0_6","group":"effectiveness_systems"},
          {"key":"systems_accounting_premis_jplg",              "type":"scale","scale":"maturity_0_6","group":"effectiveness_systems"}
        ]
      },
      {
        "key": "logistics",
        "title": {"en": "Logistics"},
        "groups": [],
        "items": [
          {"key":"accessibility_flights_land_connections","type":"scale","scale":"logistics_scale_1","group":"logistics"},
          {"key":"security_volatility_atop_threat",       "type":"scale","scale":"logistics_scale_2","group":"logistics"},
          {"key":"secure_decent_clean_water",             "type":"scale","scale":"logistics_scale_3","group":"logistics"},
          {"key":"other_initiatives_engaged_district",    "type":"scale","scale":"logistics_scale_4","group":"logistics"},
          {"key":"state_support_district_development",    "type":"scale","scale":"logistics_scale_1","group":"logistics"},
          {"key":"support_district_democratization_process","type":"scale","scale":"logistics_scale_2","group":"logistics"},
          {"key":"quality_people_district_whom",          "type":"scale","scale":"logistics_scale_3","group":"logistics"}
        ]
      }
    ]
  }$json$;

  -- ── form + form_version ────────────────────────────────────────────────────
  insert into forms (id, organisation_id, key, title)
    values (form_id, org_id, 'district_governance_assessment',
            '{"en":"District Governance Assessment"}'::jsonb);
  -- Insert as 'published' to avoid draft-only constraint issues in tests.
  -- audit trigger fires here; auth.uid() returns null → actor=null, which is allowed.
  insert into form_versions (id, form_id, version, status, definition, created_by)
    values (fv_id, form_id, '1.0.0', 'published', def, user_id);

  -- ── assessment ────────────────────────────────────────────────────────────
  insert into assessments (id, organisation_id, form_version_id, location_id, created_by)
    values (asmnt_id, org_id, fv_id, loc_id, user_id);

  -- ── 39 responses: item 1 → value 5, items 2–38 → value 3, item 39 → not_assessed ──
  -- governance items (32)
  insert into responses (assessment_id, item_key, value, not_assessed) values
    (asmnt_id, 'stability_defined_no_conflicts',               5,    false),
    (asmnt_id, 'structured_approach_ability_dispute',          3,    false),
    (asmnt_id, 'councillors_elected_selected_building',        3,    false),
    (asmnt_id, 'understanding_motivations_possible_incentives',3,    false),
    (asmnt_id, 'key_stakeholders_district_known',              3,    false),
    (asmnt_id, 'communications_between_key_stakeholders',      3,    false),
    (asmnt_id, 'social_reconciliation_social_healing',         3,    false),
    (asmnt_id, 'basis_social_contract_understanding',          3,    false),
    (asmnt_id, 'participation_wider_district_constituents',    3,    false),
    (asmnt_id, 'working_assumptions_financial_flows',          3,    false),
    (asmnt_id, 'resources_district_controls',                  3,    false),
    (asmnt_id, 'support_from_state_through',                   3,    false),
    (asmnt_id, 'technical_skills_available_district',          3,    false),
    (asmnt_id, 'committees_consultative_bodies_place',         3,    false),
    (asmnt_id, 'water_department',                             3,    false),
    (asmnt_id, 'health_department',                            3,    false),
    (asmnt_id, 'education_department',                         3,    false),
    (asmnt_id, 'public_works_time_reach',                      3,    false),
    (asmnt_id, 'cash_programming_district_district',           3,    false),
    (asmnt_id, 'agriculture_livestock_environmental_management',3,   false),
    (asmnt_id, 'government_effectiveness',                     3,    false),
    (asmnt_id, 'base_knowledge_district_population',           3,    false),
    (asmnt_id, 'knowledge_working_district',                   3,    false),
    (asmnt_id, 'management_skills_district_resourced',         3,    false),
    (asmnt_id, 'involvement_ingo_un_project',                  3,    false),
    (asmnt_id, 'basic_service_delivery_delivered',             3,    false),
    (asmnt_id, 'basic_service_knowledge_available',            3,    false),
    (asmnt_id, 'systems_communications',                       3,    false),
    (asmnt_id, 'systems_procurement',                          3,    false),
    (asmnt_id, 'systems_data_management',                      3,    false),
    (asmnt_id, 'systems_m_e_capability',                       3,    false),
    (asmnt_id, 'systems_accounting_premis_jplg',               3,    false);
  -- logistics items (7; last one is not_assessed)
  insert into responses (assessment_id, item_key, value, not_assessed) values
    (asmnt_id, 'accessibility_flights_land_connections',       3,    false),
    (asmnt_id, 'security_volatility_atop_threat',              3,    false),
    (asmnt_id, 'secure_decent_clean_water',                    3,    false),
    (asmnt_id, 'other_initiatives_engaged_district',           3,    false),
    (asmnt_id, 'state_support_district_development',           3,    false),
    (asmnt_id, 'support_district_democratization_process',     3,    false),
    (asmnt_id, 'quality_people_district_whom',                 null, true);
end $$;

-- ── assertions ──────────────────────────────────────────────────────────────
select is(
  (compute_totals('f0000000-0000-0000-0000-000000000001'::uuid) ->> 'score')::numeric,
  116::numeric,
  'overall score = 116'
);

select is(
  (compute_totals('f0000000-0000-0000-0000-000000000001'::uuid) ->> 'max')::numeric,
  228::numeric,
  'overall max = 228'
);

select is(
  (compute_totals('f0000000-0000-0000-0000-000000000001'::uuid) -> 'sections' -> 'governance' ->> 'score')::numeric,
  98::numeric,
  'governance score = 98'
);

select is(
  (compute_totals('f0000000-0000-0000-0000-000000000001'::uuid) -> 'sections' -> 'logistics' ->> 'score')::numeric,
  18::numeric,
  'logistics score = 18'
);

select is(
  (compute_totals('f0000000-0000-0000-0000-000000000001'::uuid) -> 'sections' -> 'logistics' ->> 'not_assessed')::int,
  1,
  'logistics not_assessed = 1'
);

select * from finish();
rollback;
