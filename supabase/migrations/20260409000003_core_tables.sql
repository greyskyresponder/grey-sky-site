-- Grey Sky Responder Society — Migration 3: Core Tables
-- DOC-002 Section 4. Groups A–D. 13 tables.

-- ── Group A: Users & Organizations ──────────────────────

CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  first_name    TEXT NOT NULL,
  last_name     TEXT NOT NULL,
  phone         TEXT,
  location_city TEXT,
  location_state TEXT,
  location_country TEXT,
  bio           TEXT,
  avatar_url    TEXT,
  mfa_enabled   BOOLEAN NOT NULL DEFAULT false,
  role          TEXT NOT NULL DEFAULT 'member',
  membership_status   membership_status_enum NOT NULL DEFAULT 'none',
  membership_paid_by  membership_paid_by_enum NOT NULL DEFAULT 'self',
  membership_expires_at TIMESTAMPTZ,
  status        user_status_enum NOT NULL DEFAULT 'active',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE users IS 'Core user accounts. Synced from auth.users on registration.';
COMMENT ON COLUMN users.membership_status IS 'active = paid member, expired = lapsed, none = never joined';
COMMENT ON COLUMN users.membership_paid_by IS 'self = individual, organization = org-sponsored';

CREATE TABLE organizations (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name                TEXT NOT NULL,
  type                organization_type_enum NOT NULL,
  jurisdiction_level  jurisdiction_level_enum NOT NULL,
  state               TEXT,
  county              TEXT,
  website             TEXT,
  logo_url            TEXT,
  sponsorship_enabled BOOLEAN NOT NULL DEFAULT false,
  status              organization_status_enum NOT NULL DEFAULT 'active',
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE organizations IS 'Agencies and organizations that sponsor members or contract team credentialing.';
COMMENT ON COLUMN organizations.sponsorship_enabled IS 'True if org has an active sponsorship agreement with Grey Sky.';

CREATE TABLE user_organizations (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  org_id              UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  role                user_org_role_enum NOT NULL DEFAULT 'member',
  title               TEXT,
  start_date          DATE,
  end_date            DATE,
  sponsorship_active  BOOLEAN NOT NULL DEFAULT false,
  sponsorship_scope   JSONB,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE user_organizations IS 'Many-to-many: user affiliations with organizations. Role determines dashboard access.';
COMMENT ON COLUMN user_organizations.sponsorship_scope IS 'JSON defining which disciplines the org sponsors for this user.';

CREATE TABLE organization_sponsorships (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id          UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
  engagement_id   UUID, -- deferred FK to tc_engagements, added in Migration 4
  notes           TEXT,
  started_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at      TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT chk_sponsorship_target CHECK (
    (user_id IS NOT NULL AND engagement_id IS NULL) OR
    (user_id IS NULL AND engagement_id IS NOT NULL)
  )
);
COMMENT ON TABLE organization_sponsorships IS 'Tracks individual member sponsorships and team credentialing sponsorships.';
COMMENT ON CONSTRAINT chk_sponsorship_target ON organization_sponsorships IS 'Exactly one of user_id or engagement_id must be set — individual or team sponsorship, not both.';

-- ── Group B: Incidents & Deployments ────────────────────

CREATE TABLE incidents (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name                  TEXT NOT NULL,
  description           TEXT,
  type                  incident_type_enum NOT NULL,
  declaration_number    TEXT,
  fema_disaster_number  TEXT,
  start_date            DATE,
  end_date              DATE,
  state                 TEXT,
  county                TEXT,
  status                incident_status_enum NOT NULL DEFAULT 'active',
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE incidents IS 'Disaster declarations, exercises, training events, and planned events.';
COMMENT ON COLUMN incidents.fema_disaster_number IS 'FEMA DR/EM number if federally declared.';

CREATE TABLE positions (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title             TEXT NOT NULL,
  nims_type         nims_type_enum,
  complexity_level  TEXT,
  resource_category TEXT,
  rtlt_code         TEXT,
  discipline        TEXT,
  description       TEXT,
  requirements_json JSONB
);
COMMENT ON TABLE positions IS 'NIMS/ICS positions and FEMA RTLT position qualifications.';
COMMENT ON COLUMN positions.rtlt_code IS 'FEMA Resource Typing Library Tool code.';

CREATE TABLE deployment_records (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  incident_id       UUID REFERENCES incidents(id) ON DELETE SET NULL,
  position_id       UUID REFERENCES positions(id) ON DELETE SET NULL,
  org_id            UUID REFERENCES organizations(id) ON DELETE SET NULL,
  start_date        DATE,
  end_date          DATE,
  hours             INTEGER,
  verification_tier verification_tier_enum NOT NULL DEFAULT 'self_certified',
  supervisor_name   TEXT,
  supervisor_email  TEXT,
  notes             TEXT,
  status            deployment_record_status_enum NOT NULL DEFAULT 'draft',
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE deployment_records IS 'Individual deployment history entries. Core of the verification pipeline.';
COMMENT ON COLUMN deployment_records.verification_tier IS 'Highest verification level achieved: self, 360, or ICS-225.';

CREATE TABLE validation_requests (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deployment_record_id  UUID NOT NULL REFERENCES deployment_records(id) ON DELETE CASCADE,
  requestor_id          UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  validator_email       TEXT NOT NULL,
  validator_name        TEXT,
  validator_user_id     UUID REFERENCES users(id) ON DELETE SET NULL,
  status                validation_request_status_enum NOT NULL DEFAULT 'pending',
  response_text         TEXT,
  attestation_text      TEXT,
  attestation_accepted  BOOLEAN,
  responded_at          TIMESTAMPTZ,
  token                 UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),
  expires_at            TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '30 days'),
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE validation_requests IS '360 validation: external peer confirms deployment details. Costs 10 Sky Points.';
COMMENT ON COLUMN validation_requests.token IS 'Single-use UUID token emailed to validator. Expires after 30 days.';

CREATE TABLE evaluation_requests (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deployment_record_id  UUID NOT NULL REFERENCES deployment_records(id) ON DELETE CASCADE,
  requestor_id          UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  evaluator_email       TEXT NOT NULL,
  evaluator_name        TEXT,
  evaluator_user_id     UUID REFERENCES users(id) ON DELETE SET NULL,
  status                evaluation_request_status_enum NOT NULL DEFAULT 'pending',
  rating_leadership     INTEGER CHECK (rating_leadership BETWEEN 1 AND 5),
  rating_tactical       INTEGER CHECK (rating_tactical BETWEEN 1 AND 5),
  rating_communication  INTEGER CHECK (rating_communication BETWEEN 1 AND 5),
  rating_planning       INTEGER CHECK (rating_planning BETWEEN 1 AND 5),
  rating_technical      INTEGER CHECK (rating_technical BETWEEN 1 AND 5),
  overall_rating        NUMERIC(3,2),
  commentary            TEXT,
  attestation_text      TEXT,
  attestation_accepted  BOOLEAN,
  responded_at          TIMESTAMPTZ,
  token                 UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),
  expires_at            TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '30 days'),
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE evaluation_requests IS 'ICS-225 evaluation: supervisor rates five performance areas. Costs 20 Sky Points.';
COMMENT ON COLUMN evaluation_requests.overall_rating IS 'Computed average of five rating areas (1.00–5.00).';

-- ── Group C: Economy ────────────────────────────────────

CREATE TABLE sky_points_ledger (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  transaction_type  sky_points_transaction_type_enum NOT NULL,
  amount            INTEGER NOT NULL,
  balance_after     INTEGER NOT NULL,
  reference_type    VARCHAR(50),
  reference_id      UUID,
  description       TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE sky_points_ledger IS 'APPEND ONLY. Immutable ledger of all Sky Points transactions. Triggers prevent UPDATE/DELETE.';
COMMENT ON COLUMN sky_points_ledger.balance_after IS 'Running balance after this transaction. Verified by trigger.';

-- ── Group D: Documents & Certifications ─────────────────

CREATE TABLE documents (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  org_id              UUID REFERENCES organizations(id) ON DELETE SET NULL,
  filename            TEXT NOT NULL,
  blob_url            TEXT NOT NULL,
  mime_type           TEXT NOT NULL,
  file_size_bytes     BIGINT NOT NULL,
  category            document_category_enum NOT NULL DEFAULT 'other',
  linked_record_type  VARCHAR(50),
  linked_record_id    UUID,
  ai_extracted_data   JSONB,
  upload_status       upload_status_enum NOT NULL DEFAULT 'pending',
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE documents IS 'Uploaded files: certificates, licenses, training records, reports. Linked to records/pathways.';
COMMENT ON COLUMN documents.ai_extracted_data IS 'ATLAS AI extraction output (populated by DOC-303).';

CREATE TABLE certification_pathways (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title                 TEXT NOT NULL,
  discipline            TEXT,
  description           TEXT,
  required_positions    JSONB,
  required_training     JSONB,
  required_evaluations  INTEGER,
  requirements_json     JSONB,
  status                certification_pathway_status_enum NOT NULL DEFAULT 'draft',
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE certification_pathways IS 'Defines what is required to achieve a Grey Sky credential in a given discipline.';

CREATE TABLE user_certifications (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  pathway_id      UUID NOT NULL REFERENCES certification_pathways(id) ON DELETE CASCADE,
  engagement_id   UUID, -- deferred FK to tc_engagements, added in Migration 4
  status          user_certification_status_enum NOT NULL DEFAULT 'in_progress',
  progress_json   JSONB,
  certified_at    TIMESTAMPTZ,
  expires_at      TIMESTAMPTZ,
  approved_by     UUID REFERENCES users(id) ON DELETE SET NULL,
  approved_at     TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE user_certifications IS 'Tracks individual progress toward and achievement of Grey Sky credentials.';
COMMENT ON COLUMN user_certifications.engagement_id IS 'Set when certification earned through team credentialing engagement (DOC-608).';
