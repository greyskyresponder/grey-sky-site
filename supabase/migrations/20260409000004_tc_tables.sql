-- Grey Sky Responder Society — Migration 4: Team Credentialing Tables
-- DOC-002 Section 5. Group E. 7 tables.
-- Also adds deferred FKs from Migration 3.

-- ── tc_engagements ──────────────────────────────────────

CREATE TABLE tc_engagements (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id       UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  contracting_agency_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  team_type_id          UUID, -- deferred FK to rtlt_team_types, added in Migration 5
  discipline            srt_discipline_enum NOT NULL,
  team_name             TEXT,
  team_size             INTEGER,
  engagement_status     engagement_status_enum NOT NULL DEFAULT 'quoted',
  quoted_price          NUMERIC(10,2),
  contract_reference    VARCHAR(100),
  notes                 TEXT,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE tc_engagements IS 'Team credentialing engagement. An org contracts Longview to assess and credential a team.';
COMMENT ON COLUMN tc_engagements.contracting_agency_id IS 'The agency that contracted the assessment (renamed from state_agency_id per DOC-001).';
COMMENT ON COLUMN tc_engagements.team_type_id IS 'Generalized RTLT team type. Deferred FK — added in Migration 5 after rtlt_team_types is created.';

-- ── tc_self_assessments ─────────────────────────────────

CREATE TABLE tc_self_assessments (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  engagement_id   UUID NOT NULL REFERENCES tc_engagements(id) ON DELETE CASCADE,
  sent_at         TIMESTAMPTZ,
  due_date        DATE,
  received_at     TIMESTAMPTZ,
  reviewed_by     UUID REFERENCES users(id) ON DELETE SET NULL,
  review_notes    TEXT,
  status          self_assessment_status_enum NOT NULL DEFAULT 'pending',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE tc_self_assessments IS 'Team self-assessment package. 11 sections per SRT-CAP methodology.';

-- ── tc_sa_sections ──────────────────────────────────────

CREATE TABLE tc_sa_sections (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  self_assessment_id  UUID NOT NULL REFERENCES tc_self_assessments(id) ON DELETE CASCADE,
  section_number      INTEGER NOT NULL CHECK (section_number BETWEEN 1 AND 11),
  section_title       VARCHAR(200) NOT NULL,
  self_score          INTEGER CHECK (self_score BETWEEN 0 AND 3),
  meets_standard      meets_standard_enum,
  narrative           TEXT,
  form_data           JSONB,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE tc_sa_sections IS 'Individual sections of a team self-assessment. 11 sections per assessment.';
COMMENT ON COLUMN tc_sa_sections.self_score IS '0 = not met, 1 = partially met, 2 = largely met, 3 = fully met.';

-- ── tc_site_assessments ─────────────────────────────────

CREATE TABLE tc_site_assessments (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  engagement_id     UUID NOT NULL REFERENCES tc_engagements(id) ON DELETE CASCADE,
  scheduled_date    DATE,
  location_address  TEXT,
  location_city     TEXT,
  location_state    VARCHAR(2),
  lead_assessor_id  UUID REFERENCES users(id) ON DELETE SET NULL,
  assessor_ids      UUID[] NOT NULL DEFAULT '{}',
  status            site_assessment_status_enum NOT NULL DEFAULT 'scheduled',
  observations      JSONB,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE tc_site_assessments IS 'On-site team assessment. Scheduled by Longview assessors.';

-- ── tc_reports ──────────────────────────────────────────

CREATE TABLE tc_reports (
  id                              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  engagement_id                   UUID NOT NULL REFERENCES tc_engagements(id) ON DELETE CASCADE,
  report_type                     report_type_enum NOT NULL,
  document_id                     UUID REFERENCES documents(id) ON DELETE SET NULL,
  credentialing_outcome           credentialing_outcome_enum,
  typing_level                    typing_level_enum,
  assessment_date                 DATE,
  assessed_team_name              TEXT,
  assessed_typing_level           TEXT,
  rtlt_version                    TEXT,
  assessment_type                 VARCHAR(100),
  capital_cache_confirmed         BOOLEAN,
  deployment_capability_validated BOOLEAN,
  training_verified               BOOLEAN,
  ics_nims_compliant              BOOLEAN,
  training_platform               VARCHAR(200),
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
COMMENT ON TABLE tc_reports IS 'Field reports and final reports for team credentialing engagements.';
COMMENT ON COLUMN tc_reports.credentialing_outcome IS 'Set on final report: credentialed, not_credentialed, or conditional.';

-- ── tc_report_sections ──────────────────────────────────

CREATE TABLE tc_report_sections (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id                 UUID NOT NULL REFERENCES tc_reports(id) ON DELETE CASCADE,
  section_number            INTEGER NOT NULL CHECK (section_number BETWEEN 1 AND 11),
  section_title             VARCHAR(200) NOT NULL,
  meets_standard            meets_standard_enum,
  score                     INTEGER CHECK (score BETWEEN 0 AND 3),
  assessor_observations     TEXT,
  assessor_recommendations  TEXT,
  created_at                TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at                TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE tc_report_sections IS 'Per-section scoring and observations in a team credentialing report.';

-- ── tc_team_members ─────────────────────────────────────

CREATE TABLE tc_team_members (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  engagement_id         UUID NOT NULL REFERENCES tc_engagements(id) ON DELETE CASCADE,
  user_id               UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role_on_team          VARCHAR(100),
  certification_status  team_member_certification_status_enum NOT NULL DEFAULT 'pending',
  certification_id      UUID REFERENCES user_certifications(id) ON DELETE SET NULL,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE tc_team_members IS 'Individuals on a team being credentialed. Links to user certifications earned via engagement.';

-- ── Deferred Foreign Keys from Migration 3 ─────────────

ALTER TABLE organization_sponsorships
  ADD CONSTRAINT fk_sponsorship_engagement
  FOREIGN KEY (engagement_id) REFERENCES tc_engagements(id) ON DELETE SET NULL;

ALTER TABLE user_certifications
  ADD CONSTRAINT fk_certification_engagement
  FOREIGN KEY (engagement_id) REFERENCES tc_engagements(id) ON DELETE SET NULL;
