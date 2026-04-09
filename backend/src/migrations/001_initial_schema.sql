-- Grey Sky Responder Society — Initial Schema
-- GSR-DOC-001: Complete database schema matching GSR-DOC-000 Platform Spec

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================================
-- CORE USER & ORGANIZATION
-- ============================================================

CREATE TABLE users (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email           VARCHAR(255) NOT NULL UNIQUE,
  password_hash   VARCHAR(255) NOT NULL,
  first_name      VARCHAR(100) NOT NULL,
  last_name       VARCHAR(100) NOT NULL,
  phone           VARCHAR(30),
  location_city   VARCHAR(100),
  location_state  VARCHAR(50),
  location_country VARCHAR(50),
  bio             TEXT,
  avatar_url      VARCHAR(500),
  mfa_enabled     BOOLEAN NOT NULL DEFAULT FALSE,
  membership_status VARCHAR(20) NOT NULL DEFAULT 'none'
    CHECK (membership_status IN ('active', 'expired', 'none')),
  membership_paid_by VARCHAR(20) NOT NULL DEFAULT 'self'
    CHECK (membership_paid_by IN ('self', 'organization')),
  membership_expires_at TIMESTAMPTZ,
  status          VARCHAR(20) NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'suspended', 'deactivated')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_users_membership_status ON users(membership_status);

CREATE TABLE organizations (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name                VARCHAR(255) NOT NULL,
  type                VARCHAR(30) NOT NULL
    CHECK (type IN ('state_agency', 'county_agency', 'city_agency', 'fire_department', 'sheriff', 'private', 'federal', 'tribal')),
  jurisdiction_level  VARCHAR(20) NOT NULL
    CHECK (jurisdiction_level IN ('federal', 'state', 'county', 'city', 'district')),
  state               VARCHAR(50),
  county              VARCHAR(100),
  website             VARCHAR(500),
  logo_url            VARCHAR(500),
  sponsorship_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  status              VARCHAR(20) NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'inactive')),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE user_organizations (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  org_id              UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  role                VARCHAR(20) NOT NULL
    CHECK (role IN ('member', 'team_lead', 'admin', 'assessor')),
  title               VARCHAR(200),
  start_date          DATE,
  end_date            DATE,
  sponsorship_active  BOOLEAN NOT NULL DEFAULT FALSE,
  sponsorship_scope   JSONB,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_user_organizations_user_id ON user_organizations(user_id);
CREATE INDEX idx_user_organizations_org_id ON user_organizations(org_id);

-- ============================================================
-- DEPLOYMENT & VERIFICATION
-- ============================================================

CREATE TABLE incidents (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name                  VARCHAR(255) NOT NULL,
  description           TEXT,
  type                  VARCHAR(30) NOT NULL
    CHECK (type IN ('disaster', 'exercise', 'planned_event', 'training', 'steady_state')),
  declaration_number    VARCHAR(50),
  fema_disaster_number  VARCHAR(50),
  start_date            DATE,
  end_date              DATE,
  state                 VARCHAR(50),
  county                VARCHAR(100),
  status                VARCHAR(20) NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'closed')),
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE positions (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title             VARCHAR(255) NOT NULL,
  nims_type         VARCHAR(10)
    CHECK (nims_type IN ('type1', 'type2', 'type3', 'type4', 'type5')),
  complexity_level  VARCHAR(50),
  resource_category VARCHAR(100),
  rtlt_code         VARCHAR(50),
  discipline        VARCHAR(100),
  description       TEXT,
  requirements_json JSONB
);

CREATE TABLE deployment_records (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  incident_id       UUID REFERENCES incidents(id) ON DELETE SET NULL,
  position_id       UUID REFERENCES positions(id) ON DELETE SET NULL,
  org_id            UUID REFERENCES organizations(id) ON DELETE SET NULL,
  start_date        DATE,
  end_date          DATE,
  hours             INTEGER,
  verification_tier VARCHAR(30) NOT NULL DEFAULT 'self_certified'
    CHECK (verification_tier IN ('self_certified', 'validated_360', 'evaluated_ics225')),
  supervisor_name   VARCHAR(200),
  supervisor_email  VARCHAR(255),
  notes             TEXT,
  status            VARCHAR(20) NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'submitted', 'verified')),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_deployment_records_user_id ON deployment_records(user_id);
CREATE INDEX idx_deployment_records_incident_id ON deployment_records(incident_id);
CREATE INDEX idx_deployment_records_position_id ON deployment_records(position_id);
CREATE INDEX idx_deployment_records_org_id ON deployment_records(org_id);
CREATE INDEX idx_deployment_records_user_tier ON deployment_records(user_id, verification_tier);

CREATE TABLE validation_requests (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deployment_record_id  UUID NOT NULL REFERENCES deployment_records(id) ON DELETE CASCADE,
  requestor_id          UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  validator_email       VARCHAR(255) NOT NULL,
  validator_name        VARCHAR(200),
  validator_user_id     UUID REFERENCES users(id) ON DELETE SET NULL,
  status                VARCHAR(20) NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'confirmed', 'denied', 'expired')),
  response_text         TEXT,
  attestation_text      TEXT,
  attestation_accepted  BOOLEAN,
  responded_at          TIMESTAMPTZ,
  token                 UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),
  expires_at            TIMESTAMPTZ NOT NULL,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_validation_requests_deployment_record_id ON validation_requests(deployment_record_id);
CREATE INDEX idx_validation_requests_requestor_id ON validation_requests(requestor_id);

CREATE TABLE evaluation_requests (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deployment_record_id  UUID NOT NULL REFERENCES deployment_records(id) ON DELETE CASCADE,
  requestor_id          UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  evaluator_email       VARCHAR(255) NOT NULL,
  evaluator_name        VARCHAR(200),
  evaluator_user_id     UUID REFERENCES users(id) ON DELETE SET NULL,
  status                VARCHAR(20) NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'completed', 'denied', 'expired')),
  rating_leadership     INTEGER CHECK (rating_leadership BETWEEN 1 AND 5),
  rating_tactical       INTEGER CHECK (rating_tactical BETWEEN 1 AND 5),
  rating_communication  INTEGER CHECK (rating_communication BETWEEN 1 AND 5),
  rating_planning       INTEGER CHECK (rating_planning BETWEEN 1 AND 5),
  rating_technical      INTEGER CHECK (rating_technical BETWEEN 1 AND 5),
  overall_rating        DECIMAL(3,2),
  commentary            TEXT,
  attestation_text      TEXT,
  attestation_accepted  BOOLEAN,
  responded_at          TIMESTAMPTZ,
  token                 UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),
  expires_at            TIMESTAMPTZ NOT NULL,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_evaluation_requests_deployment_record_id ON evaluation_requests(deployment_record_id);
CREATE INDEX idx_evaluation_requests_requestor_id ON evaluation_requests(requestor_id);

-- ============================================================
-- SKY POINTS ECONOMY
-- ============================================================

CREATE TABLE sky_points_ledger (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  transaction_type  VARCHAR(30) NOT NULL
    CHECK (transaction_type IN ('membership_credit', 'purchase', 'spend', 'refund', 'admin_adjustment', 'sponsor_credit')),
  amount            INTEGER NOT NULL,
  balance_after     INTEGER NOT NULL,
  reference_type    VARCHAR(50),
  reference_id      UUID,
  description       TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_sky_points_ledger_user_created ON sky_points_ledger(user_id, created_at);

-- ============================================================
-- DOCUMENTS & CERTIFICATIONS
-- ============================================================

CREATE TABLE documents (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  org_id              UUID REFERENCES organizations(id) ON DELETE SET NULL,
  filename            VARCHAR(500) NOT NULL,
  blob_url            VARCHAR(1000) NOT NULL,
  mime_type           VARCHAR(100) NOT NULL,
  file_size_bytes     INTEGER NOT NULL,
  category            VARCHAR(30) NOT NULL
    CHECK (category IN ('certificate', 'license', 'training_record', 'assessment_report', 'field_report', 'self_assessment', 'photo_id', 'other')),
  linked_record_type  VARCHAR(50),
  linked_record_id    UUID,
  ai_extracted_data   JSONB,
  upload_status       VARCHAR(20) NOT NULL DEFAULT 'pending'
    CHECK (upload_status IN ('pending', 'processed', 'failed')),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_documents_user_id ON documents(user_id);
CREATE INDEX idx_documents_org_id ON documents(org_id);

CREATE TABLE certification_pathways (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title                 VARCHAR(255) NOT NULL,
  discipline            VARCHAR(100),
  description           TEXT,
  required_positions    JSONB,
  required_training     JSONB,
  required_evaluations  INTEGER,
  requirements_json     JSONB,
  status                VARCHAR(20) NOT NULL DEFAULT 'draft'
    CHECK (status IN ('active', 'draft', 'retired')),
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE user_certifications (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  pathway_id      UUID NOT NULL REFERENCES certification_pathways(id) ON DELETE CASCADE,
  status          VARCHAR(20) NOT NULL DEFAULT 'in_progress'
    CHECK (status IN ('in_progress', 'pending_review', 'certified', 'expired', 'revoked')),
  progress_json   JSONB,
  certified_at    TIMESTAMPTZ,
  expires_at      TIMESTAMPTZ,
  approved_by     UUID REFERENCES users(id) ON DELETE SET NULL,
  approved_at     TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_user_certifications_user_id ON user_certifications(user_id);
CREATE INDEX idx_user_certifications_pathway_id ON user_certifications(pathway_id);

-- ============================================================
-- SRT-CAP ASSESSMENT WORKFLOW
-- ============================================================

CREATE TABLE srt_cap_engagements (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id     UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  state_agency_id     UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  discipline          VARCHAR(30) NOT NULL
    CHECK (discipline IN ('usar', 'swfrt', 'hazmat', 'swat', 'bomb_squad', 'waterborne_sar', 'land_sar', 'suas', 'rotary_wing_sar', 'animal_rescue_sar', 'imt', 'eoc_management', 'public_safety_dive')),
  team_name           VARCHAR(255),
  team_size           INTEGER,
  engagement_status   VARCHAR(40) NOT NULL DEFAULT 'quoted'
    CHECK (engagement_status IN ('quoted', 'contracted', 'self_assessment_sent', 'self_assessment_received', 'assessment_scheduled', 'assessment_complete', 'field_report_delivered', 'final_report_delivered', 'closed')),
  quoted_price        DECIMAL(12,2),
  contract_reference  VARCHAR(100),
  notes               TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_srt_cap_engagements_org_agency_disc ON srt_cap_engagements(organization_id, state_agency_id, discipline);
CREATE INDEX idx_srt_cap_engagements_status ON srt_cap_engagements(engagement_status);

CREATE TABLE srt_cap_self_assessments (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  engagement_id   UUID NOT NULL REFERENCES srt_cap_engagements(id) ON DELETE CASCADE,
  sent_at         TIMESTAMPTZ,
  due_date        DATE,
  received_at     TIMESTAMPTZ,
  reviewed_by     UUID REFERENCES users(id) ON DELETE SET NULL,
  review_notes    TEXT,
  status          VARCHAR(20) NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'sent', 'received', 'under_review', 'reviewed')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_srt_cap_self_assessments_engagement_id ON srt_cap_self_assessments(engagement_id);

CREATE TABLE srt_cap_sa_sections (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  self_assessment_id  UUID NOT NULL REFERENCES srt_cap_self_assessments(id) ON DELETE CASCADE,
  section_number      INTEGER NOT NULL,
  section_title       VARCHAR(200) NOT NULL,
  self_score          INTEGER CHECK (self_score BETWEEN 0 AND 3),
  meets_standard      VARCHAR(20)
    CHECK (meets_standard IN ('yes', 'no', 'na', 'not_evident')),
  narrative           TEXT,
  form_data           JSONB,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_srt_cap_sa_sections_self_assessment_id ON srt_cap_sa_sections(self_assessment_id);

CREATE TABLE srt_cap_site_assessments (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  engagement_id     UUID NOT NULL REFERENCES srt_cap_engagements(id) ON DELETE CASCADE,
  scheduled_date    DATE,
  location_address  VARCHAR(500),
  location_city     VARCHAR(100),
  location_state    VARCHAR(50),
  lead_assessor_id  UUID REFERENCES users(id) ON DELETE SET NULL,
  assessor_ids      UUID[] DEFAULT '{}',
  status            VARCHAR(20) NOT NULL DEFAULT 'scheduled'
    CHECK (status IN ('scheduled', 'in_progress', 'complete', 'cancelled')),
  observations      JSONB,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_srt_cap_site_assessments_engagement_id ON srt_cap_site_assessments(engagement_id);

CREATE TABLE srt_cap_reports (
  id                              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  engagement_id                   UUID NOT NULL REFERENCES srt_cap_engagements(id) ON DELETE CASCADE,
  report_type                     VARCHAR(20) NOT NULL
    CHECK (report_type IN ('field_report', 'final_report')),
  document_id                     UUID REFERENCES documents(id) ON DELETE SET NULL,
  credentialing_outcome           VARCHAR(30)
    CHECK (credentialing_outcome IN ('credentialed', 'not_credentialed', 'conditional')),
  typing_level                    VARCHAR(10)
    CHECK (typing_level IN ('type1', 'type2', 'type3', 'type4')),
  assessment_date                 DATE,
  assessed_team_name              VARCHAR(255),
  assessed_typing_level           VARCHAR(50),
  rtlt_version                    VARCHAR(50),
  assessment_type                 VARCHAR(100),
  capital_cache_confirmed         BOOLEAN,
  deployment_capability_validated BOOLEAN,
  training_verified               BOOLEAN,
  ics_nims_compliant              BOOLEAN,
  training_platform               VARCHAR(100),
  final_readiness_type3_rating    INTEGER CHECK (final_readiness_type3_rating BETWEEN 0 AND 3),
  final_readiness_type2_rating    INTEGER CHECK (final_readiness_type2_rating BETWEEN 0 AND 3),
  final_readiness_type1_rating    INTEGER CHECK (final_readiness_type1_rating BETWEEN 0 AND 3),
  lead_assessor_id                UUID REFERENCES users(id) ON DELETE SET NULL,
  lead_assessor_name              VARCHAR(200),
  team_leader_name                VARCHAR(200),
  sert_chief_name                 VARCHAR(200),
  delivered_at                    TIMESTAMPTZ,
  created_at                      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_srt_cap_reports_engagement_id ON srt_cap_reports(engagement_id);

CREATE TABLE srt_cap_report_sections (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id                 UUID NOT NULL REFERENCES srt_cap_reports(id) ON DELETE CASCADE,
  section_number            INTEGER NOT NULL,
  section_title             VARCHAR(200) NOT NULL,
  meets_standard            VARCHAR(20)
    CHECK (meets_standard IN ('yes', 'no', 'na', 'not_evident')),
  score                     INTEGER CHECK (score BETWEEN 0 AND 3),
  assessor_observations     TEXT,
  assessor_recommendations  TEXT,
  created_at                TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at                TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_srt_cap_report_sections_report_id ON srt_cap_report_sections(report_id);

CREATE TABLE srt_cap_team_members (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  engagement_id         UUID NOT NULL REFERENCES srt_cap_engagements(id) ON DELETE CASCADE,
  user_id               UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role_on_team          VARCHAR(100),
  certification_status  VARCHAR(20) NOT NULL DEFAULT 'pending'
    CHECK (certification_status IN ('pending', 'certified', 'not_certified')),
  certification_id      UUID REFERENCES user_certifications(id) ON DELETE SET NULL,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_srt_cap_team_members_engagement_id ON srt_cap_team_members(engagement_id);
CREATE INDEX idx_srt_cap_team_members_user_id ON srt_cap_team_members(user_id);

-- ============================================================
-- AFFINITIES & TAXONOMY
-- ============================================================

CREATE TABLE affinities (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category    VARCHAR(30) NOT NULL
    CHECK (category IN ('hazard_type', 'functional_specialty', 'sector_experience', 'srt_discipline')),
  value       VARCHAR(200) NOT NULL,
  description TEXT,
  sort_order  INTEGER
);

CREATE TABLE user_affinities (
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  affinity_id UUID NOT NULL REFERENCES affinities(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, affinity_id)
);

CREATE INDEX idx_user_affinities_affinity_id ON user_affinities(affinity_id);

-- ============================================================
-- AUDIT LOG
-- ============================================================

CREATE TABLE audit_log (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id      UUID,
  actor_type    VARCHAR(20) NOT NULL
    CHECK (actor_type IN ('user', 'system', 'admin')),
  action        VARCHAR(100) NOT NULL,
  entity_type   VARCHAR(50),
  entity_id     UUID,
  details_json  JSONB,
  ip_address    INET,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_audit_log_entity ON audit_log(entity_type, entity_id);
CREATE INDEX idx_audit_log_actor_created ON audit_log(actor_id, created_at);

-- ============================================================
-- TRIGGERS
-- ============================================================

-- Append-only enforcement for sky_points_ledger and audit_log
CREATE OR REPLACE FUNCTION prevent_ledger_modification()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'sky_points_ledger is append-only. UPDATE and DELETE are prohibited.';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_sky_points_no_update
  BEFORE UPDATE ON sky_points_ledger
  FOR EACH ROW EXECUTE FUNCTION prevent_ledger_modification();

CREATE TRIGGER trg_sky_points_no_delete
  BEFORE DELETE ON sky_points_ledger
  FOR EACH ROW EXECUTE FUNCTION prevent_ledger_modification();

CREATE TRIGGER trg_audit_log_no_update
  BEFORE UPDATE ON audit_log
  FOR EACH ROW EXECUTE FUNCTION prevent_ledger_modification();

CREATE TRIGGER trg_audit_log_no_delete
  BEFORE DELETE ON audit_log
  FOR EACH ROW EXECUTE FUNCTION prevent_ledger_modification();

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_organizations_updated_at
  BEFORE UPDATE ON organizations
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_user_organizations_updated_at
  BEFORE UPDATE ON user_organizations
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_deployment_records_updated_at
  BEFORE UPDATE ON deployment_records
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_srt_cap_engagements_updated_at
  BEFORE UPDATE ON srt_cap_engagements
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_srt_cap_self_assessments_updated_at
  BEFORE UPDATE ON srt_cap_self_assessments
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_srt_cap_sa_sections_updated_at
  BEFORE UPDATE ON srt_cap_sa_sections
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_srt_cap_site_assessments_updated_at
  BEFORE UPDATE ON srt_cap_site_assessments
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_srt_cap_report_sections_updated_at
  BEFORE UPDATE ON srt_cap_report_sections
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
