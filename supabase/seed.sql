-- Grey Sky Responder Society — Seed Data (DOC-003)
-- Idempotent: all INSERTs use ON CONFLICT DO NOTHING.
-- UUIDs are deterministic via uuid_generate_v5 for reproducibility.

-- ── 1. Extension Check ──────────────────────────────────

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'uuid-ossp') THEN
    CREATE EXTENSION "uuid-ossp" SCHEMA extensions;
  END IF;
END
$$;

-- Namespace UUID for all seed data
-- a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11

-- ── 2. RTLT Team Types (13 Florida SRT Disciplines) ─────

INSERT INTO rtlt_team_types (id, code, name, discipline, nims_category, description, sort_order) VALUES
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'team_type:usar'), 'ESF9-USAR', 'Urban Search & Rescue', 'usar', 'Search and Rescue', 'Structural collapse search, rescue, and recovery operations', 1),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'team_type:swfrt'), 'ESF9-SWFRT', 'Swiftwater/Flood Rescue', 'swfrt', 'Search and Rescue', 'Moving water and flood rescue operations', 2),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'team_type:hazmat'), 'ESF10-HAZMAT', 'Hazardous Materials', 'hazmat', 'Hazardous Materials', 'Chemical, biological, radiological, nuclear, and explosive response', 3),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'team_type:swat'), 'ESF13-SWAT', 'SWAT/Tactical', 'swat', 'Law Enforcement', 'Special weapons and tactics operations', 4),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'team_type:bomb_squad'), 'ESF13-BOMB', 'Bomb Squad', 'bomb_squad', 'Law Enforcement', 'Explosive device detection, rendering safe, and disposal', 5),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'team_type:waterborne_sar'), 'ESF9-WSAR', 'Waterborne Search & Rescue', 'waterborne_sar', 'Search and Rescue', 'Surface water and coastal search and rescue operations', 6),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'team_type:land_sar'), 'ESF9-LSAR', 'Land Search & Rescue', 'land_sar', 'Search and Rescue', 'Wilderness, rural, and urban land-based search and rescue', 7),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'team_type:suas'), 'ESF9-SUAS', 'Small Unmanned Aircraft Systems', 'suas', 'Search and Rescue', 'sUAS operations for reconnaissance, search, and damage assessment', 8),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'team_type:rotary_wing_sar'), 'ESF9-RWSAR', 'Rotary Wing Search & Rescue', 'rotary_wing_sar', 'Search and Rescue', 'Helicopter-based search, rescue, and medevac operations', 9),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'team_type:animal_rescue_sar'), 'ESF11-ASAR', 'Animal Rescue/SAR', 'animal_rescue_sar', 'Agriculture and Natural Resources', 'Large and small animal rescue and sheltering operations', 10),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'team_type:imt'), 'ESF5-IMT', 'Incident Management Team', 'imt', 'Emergency Management', 'All-hazard incident management team operations', 11),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'team_type:eoc_management'), 'ESF5-EOC', 'EOC Management Support', 'eoc_management', 'Emergency Management', 'Emergency operations center activation, staffing, and management', 12),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'team_type:public_safety_dive'), 'ESF9-DIVE', 'Public Safety Dive', 'public_safety_dive', 'Search and Rescue', 'Underwater search, rescue, recovery, and evidence operations', 13)
ON CONFLICT (name) DO NOTHING;

-- ── 3. NIMS/ICS Positions ───────────────────────────────

-- ── 3.1 Command Staff (14 positions) ────────────────────

INSERT INTO positions (id, title, nims_type, complexity_level, resource_category, discipline, description) VALUES
  -- Incident Commander (4 types)
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:ic-type1'), 'Incident Commander', 'type1', 'Type 1 — National/International', 'Command', 'Incident Command', 'Commands large-scale, complex incidents requiring national-level coordination'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:ic-type2'), 'Incident Commander', 'type2', 'Type 2 — State/Regional', 'Command', 'Incident Command', 'Commands multi-jurisdictional or state-level incidents'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:ic-type3'), 'Incident Commander', 'type3', 'Type 3 — County/Local Extended', 'Command', 'Incident Command', 'Commands extended county/local incidents with multiple operational periods'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:ic-type4'), 'Incident Commander', 'type4', 'Type 4 — Initial Response', 'Command', 'Incident Command', 'Commands initial response incidents within single operational period'),
  -- Deputy Incident Commander (2 types)
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:dic-type1'), 'Deputy Incident Commander', 'type1', 'Type 1 — National/International', 'Command', 'Incident Command', 'Supports IC at national-level incidents; assumes command as needed'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:dic-type2'), 'Deputy Incident Commander', 'type2', 'Type 2 — State/Regional', 'Command', 'Incident Command', 'Supports IC at state/regional incidents; assumes command as needed'),
  -- Safety Officer (3 types)
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:sofr-type1'), 'Safety Officer', 'type1', 'Type 1 — National/International', 'Command', 'Incident Command', 'Monitors safety conditions at large-scale incidents; authority to stop operations'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:sofr-type2'), 'Safety Officer', 'type2', 'Type 2 — State/Regional', 'Command', 'Incident Command', 'Monitors safety at state/regional incidents; develops safety plan'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:sofr-type3'), 'Safety Officer', 'type3', 'Type 3 — County/Local Extended', 'Command', 'Incident Command', 'Monitors safety at extended local incidents'),
  -- Public Information Officer (3 types)
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:pio-type1'), 'Public Information Officer', 'type1', 'Type 1 — National/International', 'Command', 'Incident Command', 'Manages public information at national-level incidents; coordinates JIC'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:pio-type2'), 'Public Information Officer', 'type2', 'Type 2 — State/Regional', 'Command', 'Incident Command', 'Manages media relations and public messaging at state/regional incidents'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:pio-type3'), 'Public Information Officer', 'type3', 'Type 3 — County/Local Extended', 'Command', 'Incident Command', 'Manages public information at extended local incidents'),
  -- Liaison Officer (2 types)
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:lofr-type1'), 'Liaison Officer', 'type1', 'Type 1 — National/International', 'Command', 'Incident Command', 'Coordinates with assisting and cooperating agencies at national-level incidents'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:lofr-type2'), 'Liaison Officer', 'type2', 'Type 2 — State/Regional', 'Command', 'Incident Command', 'Coordinates with assisting and cooperating agencies at state/regional incidents')
ON CONFLICT DO NOTHING;

-- ── 3.2 Operations Section (10 positions) ───────────────

INSERT INTO positions (id, title, nims_type, complexity_level, resource_category, discipline, description) VALUES
  -- Operations Section Chief (3 types)
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:osc-type1'), 'Operations Section Chief', 'type1', 'Type 1 — National/International', 'Operations', 'Operations', 'Directs all tactical operations at national-level incidents'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:osc-type2'), 'Operations Section Chief', 'type2', 'Type 2 — State/Regional', 'Operations', 'Operations', 'Directs tactical operations at state/regional incidents'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:osc-type3'), 'Operations Section Chief', 'type3', 'Type 3 — County/Local Extended', 'Operations', 'Operations', 'Directs tactical operations at extended local incidents'),
  -- Division/Group Supervisor (2 types)
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:divs-type2'), 'Division/Group Supervisor', 'type2', 'Type 2 — State/Regional', 'Operations', 'Operations', 'Supervises division/group resources at state/regional incidents'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:divs-type3'), 'Division/Group Supervisor', 'type3', 'Type 3 — County/Local Extended', 'Operations', 'Operations', 'Supervises division/group resources at extended local incidents'),
  -- Branch Director (2 types)
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:brcd-type1'), 'Branch Director', 'type1', 'Type 1 — National/International', 'Operations', 'Operations', 'Directs operations branch at national-level incidents'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:brcd-type2'), 'Branch Director', 'type2', 'Type 2 — State/Regional', 'Operations', 'Operations', 'Directs operations branch at state/regional incidents'),
  -- Task Force/Strike Team Leader (3 types)
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:tfst-type2'), 'Task Force/Strike Team Leader', 'type2', 'Type 2 — State/Regional', 'Operations', 'Operations', 'Leads task force or strike team at state/regional incidents'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:tfst-type3'), 'Task Force/Strike Team Leader', 'type3', 'Type 3 — County/Local Extended', 'Operations', 'Operations', 'Leads task force or strike team at extended local incidents'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:tfst-type4'), 'Task Force/Strike Team Leader', 'type4', 'Type 4 — Initial Response', 'Operations', 'Operations', 'Leads task force or strike team at initial response incidents')
ON CONFLICT DO NOTHING;

-- ── 3.3 Planning Section (11 positions) ─────────────────

INSERT INTO positions (id, title, nims_type, complexity_level, resource_category, discipline, description) VALUES
  -- Planning Section Chief (3 types)
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:psc-type1'), 'Planning Section Chief', 'type1', 'Type 1 — National/International', 'Planning', 'Planning', 'Manages planning section at national-level incidents; oversees IAP development'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:psc-type2'), 'Planning Section Chief', 'type2', 'Type 2 — State/Regional', 'Planning', 'Planning', 'Manages planning section at state/regional incidents'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:psc-type3'), 'Planning Section Chief', 'type3', 'Type 3 — County/Local Extended', 'Planning', 'Planning', 'Manages planning section at extended local incidents'),
  -- Situation Unit Leader (2 types)
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:sitl-type1'), 'Situation Unit Leader', 'type1', 'Type 1 — National/International', 'Planning', 'Planning', 'Collects and analyzes situation information at national-level incidents'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:sitl-type2'), 'Situation Unit Leader', 'type2', 'Type 2 — State/Regional', 'Planning', 'Planning', 'Collects and analyzes situation information at state/regional incidents'),
  -- Resources Unit Leader (2 types)
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:resl-type1'), 'Resources Unit Leader', 'type1', 'Type 1 — National/International', 'Planning', 'Planning', 'Tracks all incident resources at national-level incidents'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:resl-type2'), 'Resources Unit Leader', 'type2', 'Type 2 — State/Regional', 'Planning', 'Planning', 'Tracks all incident resources at state/regional incidents'),
  -- Documentation Unit Leader (2 types)
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:docl-type1'), 'Documentation Unit Leader', 'type1', 'Type 1 — National/International', 'Planning', 'Planning', 'Maintains incident documentation at national-level incidents'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:docl-type2'), 'Documentation Unit Leader', 'type2', 'Type 2 — State/Regional', 'Planning', 'Planning', 'Maintains incident documentation at state/regional incidents'),
  -- Demobilization Unit Leader (2 types)
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:dmob-type1'), 'Demobilization Unit Leader', 'type1', 'Type 1 — National/International', 'Planning', 'Planning', 'Develops demobilization plan at national-level incidents'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:dmob-type2'), 'Demobilization Unit Leader', 'type2', 'Type 2 — State/Regional', 'Planning', 'Planning', 'Develops demobilization plan at state/regional incidents')
ON CONFLICT DO NOTHING;

-- ── 3.4 Logistics Section (15 positions) ────────────────

INSERT INTO positions (id, title, nims_type, complexity_level, resource_category, discipline, description) VALUES
  -- Logistics Section Chief (3 types)
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:lsc-type1'), 'Logistics Section Chief', 'type1', 'Type 1 — National/International', 'Logistics', 'Logistics', 'Manages logistics section at national-level incidents; oversees service and support branches'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:lsc-type2'), 'Logistics Section Chief', 'type2', 'Type 2 — State/Regional', 'Logistics', 'Logistics', 'Manages logistics section at state/regional incidents'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:lsc-type3'), 'Logistics Section Chief', 'type3', 'Type 3 — County/Local Extended', 'Logistics', 'Logistics', 'Manages logistics section at extended local incidents'),
  -- Supply Unit Leader (2 types)
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:spul-type1'), 'Supply Unit Leader', 'type1', 'Type 1 — National/International', 'Logistics', 'Logistics', 'Manages ordering, receiving, storage, and distribution of supplies'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:spul-type2'), 'Supply Unit Leader', 'type2', 'Type 2 — State/Regional', 'Logistics', 'Logistics', 'Manages supply operations at state/regional incidents'),
  -- Facilities Unit Leader (2 types)
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:facl-type1'), 'Facilities Unit Leader', 'type1', 'Type 1 — National/International', 'Logistics', 'Logistics', 'Manages base camp, ICP, and staging area facilities'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:facl-type2'), 'Facilities Unit Leader', 'type2', 'Type 2 — State/Regional', 'Logistics', 'Logistics', 'Manages facilities at state/regional incidents'),
  -- Ground Support Unit Leader (2 types)
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:gsul-type1'), 'Ground Support Unit Leader', 'type1', 'Type 1 — National/International', 'Logistics', 'Logistics', 'Manages transportation and vehicle services at national-level incidents'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:gsul-type2'), 'Ground Support Unit Leader', 'type2', 'Type 2 — State/Regional', 'Logistics', 'Logistics', 'Manages transportation at state/regional incidents'),
  -- Communications Unit Leader (2 types)
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:coml-type1'), 'Communications Unit Leader', 'type1', 'Type 1 — National/International', 'Logistics', 'Logistics', 'Manages incident communications plan and resources'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:coml-type2'), 'Communications Unit Leader', 'type2', 'Type 2 — State/Regional', 'Logistics', 'Logistics', 'Manages communications at state/regional incidents'),
  -- Food Unit Leader (2 types)
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:fdul-type1'), 'Food Unit Leader', 'type1', 'Type 1 — National/International', 'Logistics', 'Logistics', 'Manages food and water services for incident personnel'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:fdul-type2'), 'Food Unit Leader', 'type2', 'Type 2 — State/Regional', 'Logistics', 'Logistics', 'Manages food services at state/regional incidents'),
  -- Medical Unit Leader (2 types)
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:medl-type1'), 'Medical Unit Leader', 'type1', 'Type 1 — National/International', 'Logistics', 'Logistics', 'Manages medical support for incident personnel'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:medl-type2'), 'Medical Unit Leader', 'type2', 'Type 2 — State/Regional', 'Logistics', 'Logistics', 'Manages medical support at state/regional incidents')
ON CONFLICT DO NOTHING;

-- ── 3.5 Finance/Admin Section (11 positions) ────────────

INSERT INTO positions (id, title, nims_type, complexity_level, resource_category, discipline, description) VALUES
  -- Finance/Admin Section Chief (3 types)
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:fsc-type1'), 'Finance/Admin Section Chief', 'type1', 'Type 1 — National/International', 'Finance/Admin', 'Finance/Admin', 'Manages financial and administrative operations at national-level incidents'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:fsc-type2'), 'Finance/Admin Section Chief', 'type2', 'Type 2 — State/Regional', 'Finance/Admin', 'Finance/Admin', 'Manages financial operations at state/regional incidents'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:fsc-type3'), 'Finance/Admin Section Chief', 'type3', 'Type 3 — County/Local Extended', 'Finance/Admin', 'Finance/Admin', 'Manages financial operations at extended local incidents'),
  -- Time Unit Leader (2 types)
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:time-type1'), 'Time Unit Leader', 'type1', 'Type 1 — National/International', 'Finance/Admin', 'Finance/Admin', 'Tracks personnel time and equipment usage at national-level incidents'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:time-type2'), 'Time Unit Leader', 'type2', 'Type 2 — State/Regional', 'Finance/Admin', 'Finance/Admin', 'Tracks personnel time at state/regional incidents'),
  -- Procurement Unit Leader (2 types)
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:proc-type1'), 'Procurement Unit Leader', 'type1', 'Type 1 — National/International', 'Finance/Admin', 'Finance/Admin', 'Manages procurement and contracts at national-level incidents'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:proc-type2'), 'Procurement Unit Leader', 'type2', 'Type 2 — State/Regional', 'Finance/Admin', 'Finance/Admin', 'Manages procurement at state/regional incidents'),
  -- Compensation/Claims Unit Leader (2 types)
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:comp-type1'), 'Compensation/Claims Unit Leader', 'type1', 'Type 1 — National/International', 'Finance/Admin', 'Finance/Admin', 'Manages compensation and claims at national-level incidents'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:comp-type2'), 'Compensation/Claims Unit Leader', 'type2', 'Type 2 — State/Regional', 'Finance/Admin', 'Finance/Admin', 'Manages compensation and claims at state/regional incidents'),
  -- Cost Unit Leader (2 types)
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:cost-type1'), 'Cost Unit Leader', 'type1', 'Type 1 — National/International', 'Finance/Admin', 'Finance/Admin', 'Tracks and analyzes incident costs at national-level incidents'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:cost-type2'), 'Cost Unit Leader', 'type2', 'Type 2 — State/Regional', 'Finance/Admin', 'Finance/Admin', 'Tracks and analyzes incident costs at state/regional incidents')
ON CONFLICT DO NOTHING;

-- ── 4. Affinities (37 across 3 categories) ──────────────

-- ── 4.1 Hazard Types (13) ───────────────────────────────

INSERT INTO affinities (id, category, value, description, sort_order) VALUES
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'affinity:hazard_type:hurricane'), 'hazard_type', 'Hurricane', 'Tropical cyclone response and recovery', 1),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'affinity:hazard_type:tornado'), 'hazard_type', 'Tornado', 'Tornado response and recovery', 2),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'affinity:hazard_type:flood'), 'hazard_type', 'Flood', 'Riverine and flash flood response', 3),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'affinity:hazard_type:earthquake'), 'hazard_type', 'Earthquake', 'Seismic event response and recovery', 4),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'affinity:hazard_type:wildfire'), 'hazard_type', 'Wildfire', 'Wildland and wildland-urban interface fire', 5),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'affinity:hazard_type:hazmat_release'), 'hazard_type', 'HazMat Release', 'Hazardous materials release or spill', 6),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'affinity:hazard_type:structural_collapse'), 'hazard_type', 'Structural Collapse', 'Building or infrastructure collapse', 7),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'affinity:hazard_type:mass_casualty'), 'hazard_type', 'Mass Casualty', 'Mass casualty incident response', 8),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'affinity:hazard_type:pandemic'), 'hazard_type', 'Pandemic', 'Pandemic and public health emergency', 9),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'affinity:hazard_type:radiological'), 'hazard_type', 'Radiological', 'Radiological or nuclear incident', 10),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'affinity:hazard_type:terrorism'), 'hazard_type', 'Terrorism', 'Terrorism and active threat response', 11),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'affinity:hazard_type:cyber'), 'hazard_type', 'Cyber', 'Cyber incident and critical infrastructure disruption', 12),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'affinity:hazard_type:dam_levee_failure'), 'hazard_type', 'Dam/Levee Failure', 'Dam or levee failure and downstream flooding', 13)
ON CONFLICT (category, value) DO NOTHING;

-- ── 4.2 Functional Specialties (15) ─────────────────────

INSERT INTO affinities (id, category, value, description, sort_order) VALUES
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'affinity:functional_specialty:incident_command'), 'functional_specialty', 'Incident Command', 'ICS command and general staff functions', 1),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'affinity:functional_specialty:operations'), 'functional_specialty', 'Operations', 'Tactical operations and field response', 2),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'affinity:functional_specialty:planning'), 'functional_specialty', 'Planning', 'Situation analysis, resource tracking, and IAP development', 3),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'affinity:functional_specialty:logistics'), 'functional_specialty', 'Logistics', 'Supply chain, facilities, and service support', 4),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'affinity:functional_specialty:finance_admin'), 'functional_specialty', 'Finance/Admin', 'Cost tracking, procurement, and administrative functions', 5),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'affinity:functional_specialty:emergency_comms'), 'functional_specialty', 'Emergency Communications', 'Interoperable communications and information systems', 6),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'affinity:functional_specialty:damage_assessment'), 'functional_specialty', 'Damage Assessment', 'Preliminary and detailed damage assessment', 7),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'affinity:functional_specialty:mass_care'), 'functional_specialty', 'Mass Care', 'Sheltering, feeding, and emergency assistance', 8),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'affinity:functional_specialty:evacuation'), 'functional_specialty', 'Evacuation', 'Population evacuation planning and execution', 9),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'affinity:functional_specialty:search_rescue'), 'functional_specialty', 'Search & Rescue', 'All-hazard search and rescue operations', 10),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'affinity:functional_specialty:law_enforcement'), 'functional_specialty', 'Law Enforcement', 'Security, access control, and law enforcement operations', 11),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'affinity:functional_specialty:fire_suppression'), 'functional_specialty', 'Fire Suppression', 'Structural and wildland fire suppression', 12),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'affinity:functional_specialty:ems'), 'functional_specialty', 'EMS', 'Emergency medical services and pre-hospital care', 13),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'affinity:functional_specialty:public_health'), 'functional_specialty', 'Public Health', 'Public health surveillance, epidemiology, and medical countermeasures', 14),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'affinity:functional_specialty:environmental_response'), 'functional_specialty', 'Environmental Response', 'Environmental hazard mitigation and remediation', 15)
ON CONFLICT (category, value) DO NOTHING;

-- ── 4.3 Sector Experience (9) ───────────────────────────

INSERT INTO affinities (id, category, value, description, sort_order) VALUES
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'affinity:sector_experience:federal'), 'sector_experience', 'Federal', 'Federal government agencies (FEMA, DHS, DOD, etc.)', 1),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'affinity:sector_experience:state'), 'sector_experience', 'State', 'State-level emergency management and response agencies', 2),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'affinity:sector_experience:county'), 'sector_experience', 'County', 'County-level government and emergency services', 3),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'affinity:sector_experience:municipal'), 'sector_experience', 'Municipal', 'City and municipal government services', 4),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'affinity:sector_experience:tribal'), 'sector_experience', 'Tribal', 'Tribal nation emergency management', 5),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'affinity:sector_experience:private_sector'), 'sector_experience', 'Private Sector', 'Private sector disaster response and business continuity', 6),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'affinity:sector_experience:ngo_voluntary'), 'sector_experience', 'NGO/Voluntary', 'Non-governmental and voluntary organizations (Red Cross, NVOAD, etc.)', 7),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'affinity:sector_experience:military'), 'sector_experience', 'Military', 'Military DSCA, National Guard, and defense support to civil authorities', 8),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'affinity:sector_experience:international'), 'sector_experience', 'International', 'International disaster response and humanitarian assistance', 9)
ON CONFLICT (category, value) DO NOTHING;
