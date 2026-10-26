-- seed.sql  — local development seed data
-- Run after: supabase db reset
-- Creates one organisation, two top-level locations (regions) and six sub-locations,
-- a published form version, and five sample assessments (approved / submitted / returned / 2 drafts).

do $$
declare
  admin_id  uuid := '00000000-0000-0000-0000-000000000001';
  org_id    uuid := '00000000-0000-0000-0000-000000000002';
  -- Fixed UUIDs so cross-references stay stable across db resets
  puntland  uuid := '00000000-0000-0000-0000-000000000010';
  jubbaland uuid := '00000000-0000-0000-0000-000000000011';
  d_garowe  uuid := '00000000-0000-0000-0000-000000000020';
  d_bosaso  uuid := '00000000-0000-0000-0000-000000000021';
  d_qardho  uuid := '00000000-0000-0000-0000-000000000022';
  d_kismayo uuid := '00000000-0000-0000-0000-000000000023';
  d_baidoa  uuid := '00000000-0000-0000-0000-000000000024';
  d_lasanod uuid := '00000000-0000-0000-0000-000000000025';
  v_form_id uuid := '00000000-0000-0000-0000-000000000030';
  fv_id     uuid := '00000000-0000-0000-0000-000000000031';
  a_garowe  uuid := '00000000-0000-0000-0000-000000000040';
  a_bosaso  uuid := '00000000-0000-0000-0000-000000000041';
  a_kismayo uuid := '00000000-0000-0000-0000-000000000042';
  a_baidoa  uuid := '00000000-0000-0000-0000-000000000043';
  a_lasanod uuid := '00000000-0000-0000-0000-000000000044';
begin

  -- ── Default admin user ───────────────────────────────────────────────────────
  -- email: admin@assessment.local  password: Admin1234!
  insert into auth.users (
    instance_id, id, aud, role, email,
    encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data,
    created_at, updated_at,
    confirmation_token, email_change, email_change_token_new, recovery_token
  ) values (
    '00000000-0000-0000-0000-000000000000',
    admin_id, 'authenticated', 'authenticated', 'admin@assessment.local',
    crypt('Admin1234!', gen_salt('bf')), now(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Demo Admin"}',
    now(), now(), '', '', '', ''
  ) on conflict (id) do nothing;

  insert into profiles (id, full_name)
  values (admin_id, 'Demo Admin')
  on conflict (id) do nothing;

  -- ── Organisation ─────────────────────────────────────────────────────────────
  insert into organisations (id, name) values (org_id, 'Puntland Regional Governance')
  on conflict (id) do nothing;

  insert into memberships (user_id, organisation_id, role)
  values (admin_id, org_id, 'super_admin')
  on conflict do nothing;

  -- ── Geography (locations tree) ───────────────────────────────────────────────
  -- Level 0: regions (top-level, parent_id null)
  insert into locations (id, organisation_id, parent_id, code, name, level) values
    (puntland,  org_id, null, 'puntland',  '{"en":"Puntland","so":"Puntland","ar":"بونتلاند"}',  0),
    (jubbaland, org_id, null, 'jubbaland', '{"en":"Jubbaland","so":"Jubbaland","ar":"جوبالاند"}', 0)
  on conflict (organisation_id, parent_id, code) do nothing;

  -- Level 1: districts (children of regions)
  insert into locations (id, organisation_id, parent_id, code, name, level) values
    (d_garowe,  org_id, puntland,  'garowe',  '{"en":"Garowe","so":"Garoowe","ar":"غاروي"}',        1),
    (d_bosaso,  org_id, puntland,  'bosaso',  '{"en":"Bosaso","so":"Boosaaso","ar":"بوصاصو"}',       1),
    (d_qardho,  org_id, puntland,  'qardho',  '{"en":"Qardho","so":"Qardho","ar":"قرضو"}',           1),
    (d_lasanod, org_id, puntland,  'lasanod', '{"en":"Las Anod","so":"Laascaanood","ar":"لاس عانود"}',1),
    (d_kismayo, org_id, jubbaland, 'kismayo', '{"en":"Kismayo","so":"Kismaayo","ar":"كيسمايو"}',     1),
    (d_baidoa,  org_id, jubbaland, 'baidoa',  '{"en":"Baidoa","so":"Baydhabo","ar":"بيدوا"}',        1)
  on conflict (organisation_id, parent_id, code) do nothing;

  -- ── Form & published version ──────────────────────────────────────────────────
  insert into forms (id, organisation_id, key, title) values
    (v_form_id, org_id, 'district_governance_assessment',
     '{"en":"District Governance Assessment","so":"Qiimaynta Maamulka Degmada","ar":"تقييم حوكمة المقاطعة"}')
  on conflict (id) do nothing;

  insert into form_versions (id, form_id, version, status, definition, created_by, published_by, published_at) values (
    fv_id, v_form_id, '1.0.0', 'published',
    '{"schema_version":1,"form_key":"district_governance_assessment","version":"1.0.0","default_language":"en","languages":["en","so","ar"],"title":{"en":"Assessment of District elements underpinning democratisation and good governance"},"scoring":{"method":"sum","exclude_not_assessed":true,"show_percentage":true},"scales":[{"key":"maturity_0_6","title":{"en":"District development maturity"},"levels":[{"value":0,"label":{"en":"Not yet started"},"description":{"en":"Not yet started"}},{"value":1,"label":{"en":"Awareness & dialogue"},"description":{"en":"Awareness / active dialogue and engagement on element"}},{"value":2,"label":{"en":"Emerging practice"},"description":{"en":"Emerging practice / Active development"}},{"value":3,"label":{"en":"Practicing"},"description":{"en":"Practicing / Policy protocols in place coming through State and peer districts"}},{"value":4,"label":{"en":"Working"},"description":{"en":"Working / Some use of policy, regulations and active people engagement"}},{"value":5,"label":{"en":"Established"},"description":{"en":"Established and people using District services and council"}},{"value":6,"label":{"en":"Fully functioning"},"description":{"en":"Fully functioning all sub areas of district know and involved with district decision making and service delivery"}}]},{"key":"logistics_scale_1","title":{"en":"Logistics scale 1"},"levels":[{"value":0,"label":{"en":"Intermittent access"},"description":null},{"value":1,"label":{"en":"Security district town only"},"description":null},{"value":2,"label":{"en":"On demand-lead time week plus"},"description":null},{"value":3,"label":{"en":"Every two weeks"},"description":null},{"value":4,"label":{"en":"Weekly flights"},"description":null},{"value":5,"label":{"en":"2/3 times per week. Road escorts"},"description":null},{"value":6,"label":{"en":"Daily/road access"},"description":null}]},{"key":"logistics_scale_2","title":{"en":"Logistics scale 2"},"levels":[{"value":0,"label":{"en":"Intermittent access"},"description":null},{"value":1,"label":{"en":"Security district town only"},"description":null},{"value":2,"label":{"en":"Poor and volatile"},"description":null},{"value":3,"label":{"en":"Volatility - district authorities predicting week plus"},"description":null},{"value":4,"label":{"en":"Minor volatility - district able to predict and control"},"description":null},{"value":5,"label":{"en":"Settled with resolution approaches working"},"description":null},{"value":6,"label":{"en":"District linked to wider RoL"},"description":null}]},{"key":"logistics_scale_3","title":{"en":"Logistics scale 3"},"levels":[{"value":0,"label":{"en":"No other work"},"description":null},{"value":1,"label":{"en":"Humanitarian through external Somali contractors"},"description":null},{"value":2,"label":{"en":"Humanitarian, co-ordination with district admin."},"description":null},{"value":3,"label":{"en":"District needs recognised but not comprehensively mapped"},"description":null},{"value":4,"label":{"en":"Some district support but no direct implementation"},"description":null},{"value":5,"label":{"en":"District aware of 70% of all interventions"},"description":null},{"value":6,"label":{"en":"District able to coordinate external interventions. Some direct engagement"},"description":null}]},{"key":"logistics_scale_4","title":{"en":"Logistics scale 4"},"levels":[{"value":0,"label":{"en":"No support"},"description":null},{"value":1,"label":{"en":"Recognition of district formation. Support to councillors / leaders"},"description":null},{"value":2,"label":{"en":"Seeking active engagement through State for formation, consolidation and develop-ment of district"},"description":null},{"value":3,"label":{"en":"Acknowledge technical needs for department formation"},"description":null},{"value":4,"label":{"en":"State recognition of needs. Supportive of governance and technical develop-ment"},"description":null},{"value":5,"label":{"en":"State seeking support for district from key governance and technical partners"},"description":null},{"value":6,"label":{"en":"Comprehensive engagement. Active State support with coherent approach"},"description":null}]}],"sections":[{"key":"governance","title":{"en":"Governance elements"},"description":{"en":"Has the District developed these elements?"},"groups":[{"key":"council_stability","title":{"en":"Council formation & stability"}},{"key":"participation_resources","title":{"en":"Participation & resources"}},{"key":"technical_services","title":{"en":"Technical & service capacity"}},{"key":"effectiveness_systems","title":{"en":"Government effectiveness & systems"}}],"items":[{"key":"stability_defined_no_conflicts","type":"scale","scale":"maturity_0_6","group":"council_stability","title":{"en":"Stability (how defined? No conflicts have become violent and not been handled within existing community/district mechanisms)"},"guidance":null,"prompt":null,"required":false,"weight":1,"include_in_total":true},{"key":"structured_approach_ability_dispute","type":"scale","scale":"maturity_0_6","group":"council_stability","title":{"en":"Structured approach/ability for dispute settlement as basis for rule of law (Noting the role and remit of District Administration separate but linked with RofL)."},"guidance":{"en":"Defining which laws is steps further? Note stakeholder groupings around a council formation. Key stakeholder understanding of change in two loop setting - define roles and how to build from present powers (into a setting of increased resource availability?)."},"prompt":null,"required":false,"weight":1,"include_in_total":true},{"key":"councillors_elected_selected_building","type":"scale","scale":"maturity_0_6","group":"council_stability","title":{"en":"How Councillors are elected or selected is building the basis for accountability/democratisation"},"guidance":null,"prompt":null,"required":false,"weight":1,"include_in_total":true},{"key":"understanding_motivations_possible_incentives","type":"scale","scale":"maturity_0_6","group":"council_stability","title":{"en":"Understanding of motivations and (possible) incentives in becoming a district councillor?"},"guidance":{"en":"The different projects and programs: What are the legacies in the districts? At state level to support the democratisation and governance development? JPLG, PREMIS, Support to Stabilisation: S2S, TIS (and its successor) and Wadajir Framework."},"prompt":null,"required":false,"weight":1,"include_in_total":true},{"key":"key_stakeholders_district_known","type":"scale","scale":"maturity_0_6","group":"council_stability","title":{"en":"Key stakeholders in the district known by those involved in governance in building next steps democratisation"},"guidance":{"en":"Skills, knowledge, outlook, opinions and practice audit SKOOP"},"prompt":null,"required":false,"weight":1,"include_in_total":true},{"key":"communications_between_key_stakeholders","type":"scale","scale":"maturity_0_6","group":"council_stability","title":{"en":"Communications between key stakeholders with power and influence inside District"},"guidance":null,"prompt":{"en":"How?"},"required":false,"weight":1,"include_in_total":true},{"key":"social_reconciliation_social_healing","type":"scale","scale":"maturity_0_6","group":"council_stability","title":{"en":"Social reconciliation - social healing (how measured?) as basis for next steps -> district council formation"},"guidance":{"en":"Social engagement as means to shape a district authority. Differentiate between administration and the council itself. Look at accountability considerations when seeking resources by a Council. Map graphically process? Break narratives reinforce visual, kinaesthetic, aural, social, solitary, verbal, logical."},"prompt":null,"required":false,"weight":1,"include_in_total":true},{"key":"basis_social_contract_understanding","type":"scale","scale":"maturity_0_6","group":"council_stability","title":{"en":"Is there the basis for a social contract? Understanding of role and remit of district administration/council? Thinking and dialogue on priority projects? Resourcing?"},"guidance":null,"prompt":null,"required":false,"weight":1,"include_in_total":true},{"key":"participation_wider_district_constituents","type":"scale","scale":"maturity_0_6","group":"participation_resources","title":{"en":"Participation of wider district constituents - people to people. People with community leaders. Leaders forums supporting the roll of District Council and Administration in linking with external actors (beyond"},"guidance":{"en":"The Somali Dialogue Platform (SDP) and SSF III''s government counterpart, JSS MoIFAR, will scope and engage opportunities to open political space for dialogue, including the Gedo/Lower Juba division, to more actors who can meaningfully participate in structures that go beyond one-off dialogues. State to District engagement"},"prompt":{"en":"How?"},"required":false,"weight":1,"include_in_total":true},{"key":"working_assumptions_financial_flows","type":"scale","scale":"maturity_0_6","group":"participation_resources","title":{"en":"What working assumptions on financial flows? Who has heard of PREMIS (or JPLG)?"},"guidance":{"en":"Have district leaders been able to listen to different groups across the district and be supported in presenting needs and priorities?"},"prompt":{"en":"What are these?"},"required":false,"weight":1,"include_in_total":true},{"key":"resources_district_controls","type":"scale","scale":"maturity_0_6","group":"participation_resources","title":{"en":"Resources district controls."},"guidance":{"en":"Any engagement where any district reconciliation is built on from outside? Peace dividend sets out what can be done for people with reconciliation into processes for managing future disgreements. Use of updated approaches in the Xeer system?"},"prompt":{"en":"What working assumptions on financial flows?"},"required":false,"weight":1,"include_in_total":true},{"key":"support_from_state_through","type":"scale","scale":"maturity_0_6","group":"participation_resources","title":{"en":"Support from State and through State FGS to the district"},"guidance":null,"prompt":null,"required":false,"weight":1,"include_in_total":true},{"key":"technical_skills_available_district","type":"scale","scale":"maturity_0_6","group":"technical_services","title":{"en":"What technical skills available for the district administration?"},"guidance":null,"prompt":null,"required":false,"weight":1,"include_in_total":true},{"key":"committees_consultative_bodies_place","type":"scale","scale":"maturity_0_6","group":"technical_services","title":{"en":"What committees/consultative bodies in place? Water, Health, Education, Women and Youth, Conflict resolution?"},"guidance":null,"prompt":null,"required":false,"weight":1,"include_in_total":true},{"key":"water_department","type":"scale","scale":"maturity_0_6","group":"technical_services","title":{"en":"Water Department"},"guidance":null,"prompt":null,"required":false,"weight":1,"include_in_total":true},{"key":"health_department","type":"scale","scale":"maturity_0_6","group":"technical_services","title":{"en":"Health Department"},"guidance":null,"prompt":null,"required":false,"weight":1,"include_in_total":true},{"key":"education_department","type":"scale","scale":"maturity_0_6","group":"technical_services","title":{"en":"Education Department"},"guidance":null,"prompt":null,"required":false,"weight":1,"include_in_total":true},{"key":"public_works_time_reach","type":"scale","scale":"maturity_0_6","group":"technical_services","title":{"en":"Public works - time to reach each key settlement across the district?"},"guidance":null,"prompt":null,"required":false,"weight":1,"include_in_total":true},{"key":"cash_programming_district_district","type":"scale","scale":"maturity_0_6","group":"technical_services","title":{"en":"Cash programming in the district with district involvement. Cash for work, social safety net/cash transfer, productive safety net development. VSLAs - roll and remit under District administration rules and regs fit to private sector engagement."},"guidance":{"en":"Fit to DRM work and consultative processes on targeting."},"prompt":null,"required":false,"weight":1,"include_in_total":true},{"key":"agriculture_livestock_environmental_management","type":"scale","scale":"maturity_0_6","group":"technical_services","title":{"en":"Agriculture, Livestock and Environmental Management skills"},"guidance":null,"prompt":null,"required":false,"weight":1,"include_in_total":true},{"key":"government_effectiveness","type":"scale","scale":"maturity_0_6","group":"effectiveness_systems","title":{"en":"Government Effectiveness"},"guidance":{"en":"How to measure government effectiveness?"},"prompt":null,"required":false,"weight":1,"include_in_total":true},{"key":"base_knowledge_district_population","type":"scale","scale":"maturity_0_6","group":"effectiveness_systems","title":{"en":"Base knowledge of district - population, settlements mapped"},"guidance":null,"prompt":{"en":"Base district data? How done and available?"},"required":false,"weight":1,"include_in_total":true},{"key":"knowledge_working_district","type":"scale","scale":"maturity_0_6","group":"effectiveness_systems","title":{"en":"Knowledge of who is working in the District"},"guidance":null,"prompt":{"en":"Register of projects?"},"required":false,"weight":1,"include_in_total":true},{"key":"management_skills_district_resourced","type":"scale","scale":"maturity_0_6","group":"effectiveness_systems","title":{"en":"Management skills in the district are resourced - separate from short-term, less than 9 months, humanitarian funding"},"guidance":{"en":"Capability to manage all the different agendas from outside the district itself."},"prompt":null,"required":false,"weight":1,"include_in_total":true},{"key":"involvement_ingo_un_project","type":"scale","scale":"maturity_0_6","group":"effectiveness_systems","title":{"en":"Involvement in INGO/UN Project Cycle Management of district officials"},"guidance":null,"prompt":{"en":"At what stage? How?"},"required":false,"weight":1,"include_in_total":true},{"key":"basic_service_delivery_delivered","type":"scale","scale":"maturity_0_6","group":"effectiveness_systems","title":{"en":"Basic service delivery - delivered by District"},"guidance":null,"prompt":null,"required":false,"weight":1,"include_in_total":true},{"key":"basic_service_knowledge_available","type":"scale","scale":"maturity_0_6","group":"effectiveness_systems","title":{"en":"Basic service knowledge of what is available to who?"},"guidance":null,"prompt":null,"required":false,"weight":1,"include_in_total":true},{"key":"systems_communications","type":"scale","scale":"maturity_0_6","group":"effectiveness_systems","title":{"en":"Systems - communications"},"guidance":null,"prompt":{"en":"Conversations, calls to action"},"required":false,"weight":1,"include_in_total":true},{"key":"systems_procurement","type":"scale","scale":"maturity_0_6","group":"effectiveness_systems","title":{"en":"Systems - procurement"},"guidance":null,"prompt":null,"required":false,"weight":1,"include_in_total":true},{"key":"systems_data_management","type":"scale","scale":"maturity_0_6","group":"effectiveness_systems","title":{"en":"Systems - data management"},"guidance":null,"prompt":null,"required":false,"weight":1,"include_in_total":true},{"key":"systems_m_e_capability","type":"scale","scale":"maturity_0_6","group":"effectiveness_systems","title":{"en":"Systems - M&E (capability to take over TPM and reinforce accountability flows)"},"guidance":{"en":"Puntland - enlist the Bureau of Statistics to work with districts on M&E - we overlay learning in terms of data management, interpretation to fit into the DIDAflow"},"prompt":null,"required":false,"weight":1,"include_in_total":true},{"key":"systems_accounting_premis_jplg","type":"scale","scale":"maturity_0_6","group":"effectiveness_systems","title":{"en":"Systems - accounting (PREMIS or JPLG support?)"},"guidance":null,"prompt":{"en":"Digital capability"},"required":false,"weight":1,"include_in_total":true}]},{"key":"logistics","title":{"en":"Initial Logistical Engagement Considerations"},"description":{"en":"Conditionalities / leading questions to cause further thinking and dialogue on operationalisation This is NOT an approach to generate an answer. It is to structure questioning and how we think about how we are to work. The practicality of initial engagement to develop the foundations for further, more engaged work. The higher the score, the greater the flexibility in our direct engagement. However, where we can sense potential, then we look at how we develop our own expectations and working styles to be to deliver outputs (set to context) and build for next level engagement. Under State auspices, we seek district-to-district engagement. Given political decisions on priority districts, this initial thinking is open to development and can be used as basis for taking forward institutional development at all governmental levels. It can be the basis for how different elements in government interact to assess and address key areas of policy (into practice). All FMSs have Articles or Laws noting the critical role of the district, even sub-district, in government, governance. However, the practicality of governance is not keeping pace with consultants writing laws and policies. Credibility of government will be a critical element in what we do to reinforce democratization. The development of what a social contract should have in it and what it means in tangible terms will involve how we work with and through government at state, district and gain feedback from sub-district) levels. Key elements beyond the council formation and the induction of councillors will be how State is to support delivery of the district and state government. How peace dividend is realised through technocractic approaches noting resourcing, technical people, skills as well as funds, is going to be critical."},"groups":[{"key":"logistics","title":{"en":"Logistics & engagement"}}],"items":[{"key":"accessibility_flights_land_connections","type":"scale","scale":"logistics_scale_1","group":"logistics","title":{"en":"Accessibility - flights, land connections to district key town"},"guidance":null,"prompt":null,"required":false,"weight":1,"include_in_total":true},{"key":"security_volatility_atop_threat","type":"scale","scale":"logistics_scale_2","group":"logistics","title":{"en":"Security - volatility atop of threat and risk assessment"},"guidance":null,"prompt":null,"required":false,"weight":1,"include_in_total":true},{"key":"secure_decent_clean_water","type":"scale","scale":"logistics_scale_2","group":"logistics","title":{"en":"Secure and decent (clean water and decent food) place to stay for all team required in district"},"guidance":null,"prompt":null,"required":false,"weight":1,"include_in_total":true},{"key":"other_initiatives_engaged_district","type":"scale","scale":"logistics_scale_3","group":"logistics","title":{"en":"What other initiatives are engaged in the district"},"guidance":null,"prompt":null,"required":false,"weight":1,"include_in_total":true},{"key":"state_support_district_development","type":"scale","scale":"logistics_scale_4","group":"logistics","title":{"en":"State support to the district development process"},"guidance":null,"prompt":null,"required":false,"weight":1,"include_in_total":true},{"key":"support_district_democratization_process","type":"scale","scale":"logistics_scale_4","group":"logistics","title":{"en":"Support to the district democratization process seeking active CSO, community and constituent engagement"},"guidance":null,"prompt":null,"required":false,"weight":1,"include_in_total":true},{"key":"quality_people_district_whom","type":"scale","scale":"logistics_scale_4","group":"logistics","title":{"en":"Quality people in district with whom can work"},"guidance":null,"prompt":null,"required":false,"weight":1,"include_in_total":true}]}]}'::jsonb,
    admin_id, admin_id, now()
  ) on conflict (form_id, version) do nothing;

  -- ── Sample assessments ────────────────────────────────────────────────────────
  -- Garowe: APPROVED  — full responses, score 116/228 (matches Garowe fixture)
  -- Bosaso: SUBMITTED — all items value 4, score 152/228
  -- Kismayo: RETURNED — all items value 2, score 76/228, review note attached
  -- Baidoa: DRAFT     — 15 items answered, no totals
  -- Las Anod: DRAFT   — brand new, no responses

  insert into assessments
    (id, organisation_id, form_version_id, location_id, language, status,
     created_by, assessors, assessed_on, totals, review_note, submitted_at,
     created_at, updated_at)
  values
    (
      a_garowe, org_id, fv_id, d_garowe, 'en', 'approved',
      admin_id, ARRAY[admin_id], '2026-09-15',
      '{
        "score":116,"max":228,"pct":50.88,"missing":[],
        "sections":{
          "governance":{
            "score":98,"max":192,"pct":51.04,"answered":32,"not_assessed":0,
            "groups":{
              "council_stability":{"score":26,"max":48,"count":8},
              "participation_resources":{"score":12,"max":24,"count":4},
              "technical_services":{"score":24,"max":48,"count":8},
              "effectiveness_systems":{"score":36,"max":72,"count":12}
            }
          },
          "logistics":{
            "score":18,"max":36,"pct":50.0,"answered":6,"not_assessed":1,
            "groups":{"logistics":{"score":18,"max":36,"count":6}}
          }
        }
      }'::jsonb,
      null,
      '2026-09-15 10:30:00+00',
      '2026-09-14 08:00:00+00', '2026-09-20 14:00:00+00'
    ),
    (
      a_bosaso, org_id, fv_id, d_bosaso, 'en', 'submitted',
      admin_id, ARRAY[admin_id], '2026-09-22',
      '{
        "score":152,"max":228,"pct":66.67,"missing":[],
        "sections":{
          "governance":{
            "score":128,"max":192,"pct":66.67,"answered":32,"not_assessed":0,
            "groups":{
              "council_stability":{"score":32,"max":48,"count":8},
              "participation_resources":{"score":16,"max":24,"count":4},
              "technical_services":{"score":32,"max":48,"count":8},
              "effectiveness_systems":{"score":48,"max":72,"count":12}
            }
          },
          "logistics":{
            "score":24,"max":36,"pct":66.67,"answered":6,"not_assessed":1,
            "groups":{"logistics":{"score":24,"max":36,"count":6}}
          }
        }
      }'::jsonb,
      null,
      '2026-09-22 09:15:00+00',
      '2026-09-20 07:00:00+00', '2026-09-22 09:15:00+00'
    ),
    (
      a_kismayo, org_id, fv_id, d_kismayo, 'en', 'returned',
      admin_id, ARRAY[admin_id], '2026-09-10',
      '{
        "score":76,"max":228,"pct":33.33,"missing":[],
        "sections":{
          "governance":{
            "score":64,"max":192,"pct":33.33,"answered":32,"not_assessed":0,
            "groups":{
              "council_stability":{"score":16,"max":48,"count":8},
              "participation_resources":{"score":8,"max":24,"count":4},
              "technical_services":{"score":16,"max":48,"count":8},
              "effectiveness_systems":{"score":24,"max":72,"count":12}
            }
          },
          "logistics":{
            "score":12,"max":36,"pct":33.33,"answered":6,"not_assessed":1,
            "groups":{"logistics":{"score":12,"max":36,"count":6}}
          }
        }
      }'::jsonb,
      'Please provide more evidence for the council stability section and re-assess the logistics items. The scores appear lower than expected — verify with the district officer.',
      '2026-09-10 11:00:00+00',
      '2026-09-08 06:00:00+00', '2026-09-18 16:30:00+00'
    ),
    (
      a_baidoa, org_id, fv_id, d_baidoa, 'en', 'draft',
      admin_id, ARRAY[admin_id], '2026-09-28',
      null, null, null,
      '2026-09-28 09:00:00+00', '2026-09-28 14:00:00+00'
    ),
    (
      a_lasanod, org_id, fv_id, d_lasanod, 'en', 'draft',
      admin_id, ARRAY[admin_id], '2026-09-30',
      null, null, null,
      '2026-09-30 08:00:00+00', '2026-09-30 08:00:00+00'
    )
  on conflict (id) do nothing;

  -- ── Responses: Garowe (approved) — fixture values, score 116/228 ──────────────
  insert into responses (assessment_id, item_key, value, not_assessed, updated_by)
  values
    (a_garowe,'stability_defined_no_conflicts',5,false,admin_id),
    (a_garowe,'structured_approach_ability_dispute',3,false,admin_id),
    (a_garowe,'councillors_elected_selected_building',3,false,admin_id),
    (a_garowe,'understanding_motivations_possible_incentives',3,false,admin_id),
    (a_garowe,'key_stakeholders_district_known',3,false,admin_id),
    (a_garowe,'communications_between_key_stakeholders',3,false,admin_id),
    (a_garowe,'social_reconciliation_social_healing',3,false,admin_id),
    (a_garowe,'basis_social_contract_understanding',3,false,admin_id),
    (a_garowe,'participation_wider_district_constituents',3,false,admin_id),
    (a_garowe,'working_assumptions_financial_flows',3,false,admin_id),
    (a_garowe,'resources_district_controls',3,false,admin_id),
    (a_garowe,'support_from_state_through',3,false,admin_id),
    (a_garowe,'technical_skills_available_district',3,false,admin_id),
    (a_garowe,'committees_consultative_bodies_place',3,false,admin_id),
    (a_garowe,'water_department',3,false,admin_id),
    (a_garowe,'health_department',3,false,admin_id),
    (a_garowe,'education_department',3,false,admin_id),
    (a_garowe,'public_works_time_reach',3,false,admin_id),
    (a_garowe,'cash_programming_district_district',3,false,admin_id),
    (a_garowe,'agriculture_livestock_environmental_management',3,false,admin_id),
    (a_garowe,'government_effectiveness',3,false,admin_id),
    (a_garowe,'base_knowledge_district_population',3,false,admin_id),
    (a_garowe,'knowledge_working_district',3,false,admin_id),
    (a_garowe,'management_skills_district_resourced',3,false,admin_id),
    (a_garowe,'involvement_ingo_un_project',3,false,admin_id),
    (a_garowe,'basic_service_delivery_delivered',3,false,admin_id),
    (a_garowe,'basic_service_knowledge_available',3,false,admin_id),
    (a_garowe,'systems_communications',3,false,admin_id),
    (a_garowe,'systems_procurement',3,false,admin_id),
    (a_garowe,'systems_data_management',3,false,admin_id),
    (a_garowe,'systems_m_e_capability',3,false,admin_id),
    (a_garowe,'systems_accounting_premis_jplg',3,false,admin_id),
    (a_garowe,'accessibility_flights_land_connections',3,false,admin_id),
    (a_garowe,'security_volatility_atop_threat',3,false,admin_id),
    (a_garowe,'secure_decent_clean_water',3,false,admin_id),
    (a_garowe,'other_initiatives_engaged_district',3,false,admin_id),
    (a_garowe,'state_support_district_development',3,false,admin_id),
    (a_garowe,'support_district_democratization_process',3,false,admin_id),
    (a_garowe,'quality_people_district_whom',null,true,admin_id)
  on conflict (assessment_id, item_key) do nothing;

  -- ── Responses: Bosaso (submitted) — all value 4, 1 not_assessed ───────────────
  insert into responses (assessment_id, item_key, value, not_assessed, updated_by)
  values
    (a_bosaso,'stability_defined_no_conflicts',4,false,admin_id),
    (a_bosaso,'structured_approach_ability_dispute',4,false,admin_id),
    (a_bosaso,'councillors_elected_selected_building',4,false,admin_id),
    (a_bosaso,'understanding_motivations_possible_incentives',4,false,admin_id),
    (a_bosaso,'key_stakeholders_district_known',4,false,admin_id),
    (a_bosaso,'communications_between_key_stakeholders',4,false,admin_id),
    (a_bosaso,'social_reconciliation_social_healing',4,false,admin_id),
    (a_bosaso,'basis_social_contract_understanding',4,false,admin_id),
    (a_bosaso,'participation_wider_district_constituents',4,false,admin_id),
    (a_bosaso,'working_assumptions_financial_flows',4,false,admin_id),
    (a_bosaso,'resources_district_controls',4,false,admin_id),
    (a_bosaso,'support_from_state_through',4,false,admin_id),
    (a_bosaso,'technical_skills_available_district',4,false,admin_id),
    (a_bosaso,'committees_consultative_bodies_place',4,false,admin_id),
    (a_bosaso,'water_department',4,false,admin_id),
    (a_bosaso,'health_department',4,false,admin_id),
    (a_bosaso,'education_department',4,false,admin_id),
    (a_bosaso,'public_works_time_reach',4,false,admin_id),
    (a_bosaso,'cash_programming_district_district',4,false,admin_id),
    (a_bosaso,'agriculture_livestock_environmental_management',4,false,admin_id),
    (a_bosaso,'government_effectiveness',4,false,admin_id),
    (a_bosaso,'base_knowledge_district_population',4,false,admin_id),
    (a_bosaso,'knowledge_working_district',4,false,admin_id),
    (a_bosaso,'management_skills_district_resourced',4,false,admin_id),
    (a_bosaso,'involvement_ingo_un_project',4,false,admin_id),
    (a_bosaso,'basic_service_delivery_delivered',4,false,admin_id),
    (a_bosaso,'basic_service_knowledge_available',4,false,admin_id),
    (a_bosaso,'systems_communications',4,false,admin_id),
    (a_bosaso,'systems_procurement',4,false,admin_id),
    (a_bosaso,'systems_data_management',4,false,admin_id),
    (a_bosaso,'systems_m_e_capability',4,false,admin_id),
    (a_bosaso,'systems_accounting_premis_jplg',4,false,admin_id),
    (a_bosaso,'accessibility_flights_land_connections',4,false,admin_id),
    (a_bosaso,'security_volatility_atop_threat',4,false,admin_id),
    (a_bosaso,'secure_decent_clean_water',4,false,admin_id),
    (a_bosaso,'other_initiatives_engaged_district',4,false,admin_id),
    (a_bosaso,'state_support_district_development',4,false,admin_id),
    (a_bosaso,'support_district_democratization_process',4,false,admin_id),
    (a_bosaso,'quality_people_district_whom',null,true,admin_id)
  on conflict (assessment_id, item_key) do nothing;

  -- ── Responses: Kismayo (returned) — all value 2, 1 not_assessed ──────────────
  insert into responses (assessment_id, item_key, value, not_assessed, updated_by)
  values
    (a_kismayo,'stability_defined_no_conflicts',2,false,admin_id),
    (a_kismayo,'structured_approach_ability_dispute',2,false,admin_id),
    (a_kismayo,'councillors_elected_selected_building',2,false,admin_id),
    (a_kismayo,'understanding_motivations_possible_incentives',2,false,admin_id),
    (a_kismayo,'key_stakeholders_district_known',2,false,admin_id),
    (a_kismayo,'communications_between_key_stakeholders',2,false,admin_id),
    (a_kismayo,'social_reconciliation_social_healing',2,false,admin_id),
    (a_kismayo,'basis_social_contract_understanding',2,false,admin_id),
    (a_kismayo,'participation_wider_district_constituents',2,false,admin_id),
    (a_kismayo,'working_assumptions_financial_flows',2,false,admin_id),
    (a_kismayo,'resources_district_controls',2,false,admin_id),
    (a_kismayo,'support_from_state_through',2,false,admin_id),
    (a_kismayo,'technical_skills_available_district',2,false,admin_id),
    (a_kismayo,'committees_consultative_bodies_place',2,false,admin_id),
    (a_kismayo,'water_department',2,false,admin_id),
    (a_kismayo,'health_department',2,false,admin_id),
    (a_kismayo,'education_department',2,false,admin_id),
    (a_kismayo,'public_works_time_reach',2,false,admin_id),
    (a_kismayo,'cash_programming_district_district',2,false,admin_id),
    (a_kismayo,'agriculture_livestock_environmental_management',2,false,admin_id),
    (a_kismayo,'government_effectiveness',2,false,admin_id),
    (a_kismayo,'base_knowledge_district_population',2,false,admin_id),
    (a_kismayo,'knowledge_working_district',2,false,admin_id),
    (a_kismayo,'management_skills_district_resourced',2,false,admin_id),
    (a_kismayo,'involvement_ingo_un_project',2,false,admin_id),
    (a_kismayo,'basic_service_delivery_delivered',2,false,admin_id),
    (a_kismayo,'basic_service_knowledge_available',2,false,admin_id),
    (a_kismayo,'systems_communications',2,false,admin_id),
    (a_kismayo,'systems_procurement',2,false,admin_id),
    (a_kismayo,'systems_data_management',2,false,admin_id),
    (a_kismayo,'systems_m_e_capability',2,false,admin_id),
    (a_kismayo,'systems_accounting_premis_jplg',2,false,admin_id),
    (a_kismayo,'accessibility_flights_land_connections',2,false,admin_id),
    (a_kismayo,'security_volatility_atop_threat',2,false,admin_id),
    (a_kismayo,'secure_decent_clean_water',2,false,admin_id),
    (a_kismayo,'other_initiatives_engaged_district',2,false,admin_id),
    (a_kismayo,'state_support_district_development',2,false,admin_id),
    (a_kismayo,'support_district_democratization_process',2,false,admin_id),
    (a_kismayo,'quality_people_district_whom',null,true,admin_id)
  on conflict (assessment_id, item_key) do nothing;

  -- ── Responses: Baidoa (draft) — 15 items partially filled ────────────────────
  insert into responses (assessment_id, item_key, value, not_assessed, updated_by)
  values
    (a_baidoa,'stability_defined_no_conflicts',3,false,admin_id),
    (a_baidoa,'structured_approach_ability_dispute',2,false,admin_id),
    (a_baidoa,'councillors_elected_selected_building',3,false,admin_id),
    (a_baidoa,'understanding_motivations_possible_incentives',2,false,admin_id),
    (a_baidoa,'key_stakeholders_district_known',3,false,admin_id),
    (a_baidoa,'communications_between_key_stakeholders',2,false,admin_id),
    (a_baidoa,'social_reconciliation_social_healing',3,false,admin_id),
    (a_baidoa,'basis_social_contract_understanding',2,false,admin_id),
    (a_baidoa,'participation_wider_district_constituents',3,false,admin_id),
    (a_baidoa,'working_assumptions_financial_flows',2,false,admin_id),
    (a_baidoa,'resources_district_controls',3,false,admin_id),
    (a_baidoa,'support_from_state_through',2,false,admin_id),
    (a_baidoa,'technical_skills_available_district',3,false,admin_id),
    (a_baidoa,'committees_consultative_bodies_place',2,false,admin_id),
    (a_baidoa,'water_department',3,false,admin_id)
  on conflict (assessment_id, item_key) do nothing;

  raise notice 'Seed complete. org_id=%, fv_id=%, assessments: garowe(approved) bosaso(submitted) kismayo(returned) baidoa(draft) lasanod(draft)', org_id, fv_id;
end $$;
