-- Grey Sky Responder Society — Migration 2: Enum Types
-- DOC-002 Section 3
-- 30 enum types grouped by entity

-- ── Group A: Users & Organizations ──────────────────────

CREATE TYPE membership_status_enum AS ENUM ('active', 'expired', 'none');
CREATE TYPE membership_paid_by_enum AS ENUM ('self', 'organization');
CREATE TYPE user_status_enum AS ENUM ('active', 'suspended', 'deactivated');

CREATE TYPE organization_type_enum AS ENUM (
  'state_agency', 'county_agency', 'city_agency', 'fire_department',
  'sheriff', 'private', 'federal', 'tribal'
);
CREATE TYPE jurisdiction_level_enum AS ENUM ('federal', 'state', 'county', 'city', 'district');
CREATE TYPE organization_status_enum AS ENUM ('active', 'inactive');

CREATE TYPE user_org_role_enum AS ENUM ('member', 'team_lead', 'admin', 'assessor');

-- ── Group B: Incidents & Deployments ────────────────────

CREATE TYPE incident_type_enum AS ENUM ('disaster', 'exercise', 'planned_event', 'training', 'steady_state');
CREATE TYPE incident_status_enum AS ENUM ('active', 'closed');

CREATE TYPE nims_type_enum AS ENUM ('type1', 'type2', 'type3', 'type4', 'type5');

CREATE TYPE verification_tier_enum AS ENUM ('self_certified', 'validated_360', 'evaluated_ics225');
CREATE TYPE deployment_record_status_enum AS ENUM ('draft', 'submitted', 'verified');

CREATE TYPE validation_request_status_enum AS ENUM ('pending', 'confirmed', 'denied', 'expired');
CREATE TYPE evaluation_request_status_enum AS ENUM ('pending', 'completed', 'denied', 'expired');

-- ── Group C: Economy & Documents ────────────────────────

CREATE TYPE sky_points_transaction_type_enum AS ENUM (
  'membership_credit', 'purchase', 'spend', 'refund', 'admin_adjustment', 'sponsor_credit'
);

CREATE TYPE document_category_enum AS ENUM (
  'certificate', 'license', 'training_record', 'assessment_report',
  'field_report', 'self_assessment', 'photo_id', 'other'
);
CREATE TYPE upload_status_enum AS ENUM ('pending', 'processed', 'failed');

CREATE TYPE certification_pathway_status_enum AS ENUM ('active', 'draft', 'retired');
CREATE TYPE user_certification_status_enum AS ENUM (
  'in_progress', 'pending_review', 'certified', 'expired', 'revoked'
);

-- ── Group D: Team Credentialing (tc_) ───────────────────

CREATE TYPE engagement_status_enum AS ENUM (
  'quoted', 'contracted', 'self_assessment_sent', 'self_assessment_received',
  'assessment_scheduled', 'assessment_complete', 'field_report_delivered',
  'final_report_delivered', 'closed'
);
CREATE TYPE srt_discipline_enum AS ENUM (
  'usar', 'swfrt', 'hazmat', 'swat', 'bomb_squad', 'waterborne_sar',
  'land_sar', 'suas', 'rotary_wing_sar', 'animal_rescue_sar',
  'imt', 'eoc_management', 'public_safety_dive'
);

CREATE TYPE self_assessment_status_enum AS ENUM ('pending', 'sent', 'received', 'under_review', 'reviewed');
CREATE TYPE meets_standard_enum AS ENUM ('yes', 'no', 'na', 'not_evident');
CREATE TYPE site_assessment_status_enum AS ENUM ('scheduled', 'in_progress', 'complete', 'cancelled');

CREATE TYPE report_type_enum AS ENUM ('field_report', 'final_report');
CREATE TYPE credentialing_outcome_enum AS ENUM ('credentialed', 'not_credentialed', 'conditional');
CREATE TYPE typing_level_enum AS ENUM ('type1', 'type2', 'type3', 'type4');

CREATE TYPE team_member_certification_status_enum AS ENUM ('pending', 'certified', 'not_certified');

-- ── Group E: Community & Audit ──────────────────────────

CREATE TYPE affinity_category_enum AS ENUM ('hazard_type', 'functional_specialty', 'sector_experience', 'srt_discipline');
CREATE TYPE actor_type_enum AS ENUM ('user', 'system', 'admin');
