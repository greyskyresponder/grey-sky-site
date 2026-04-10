-- Grey Sky Responder Society — Migration 5: Taxonomy & Audit Tables
-- DOC-002 Section 6. Groups F–G. 4 tables.
-- Also adds deferred FK from tc_engagements.

-- ── Group F: Community & Taxonomy ───────────────────────

CREATE TABLE affinities (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category    affinity_category_enum NOT NULL,
  value       VARCHAR(200) NOT NULL,
  description TEXT,
  sort_order  INTEGER
);
COMMENT ON TABLE affinities IS 'Controlled vocabulary for community connections: hazard types, specialties, sectors, SRT disciplines.';

CREATE TABLE user_affinities (
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  affinity_id UUID NOT NULL REFERENCES affinities(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, affinity_id)
);
COMMENT ON TABLE user_affinities IS 'Many-to-many: users select affinities that connect them to shared experiences.';

CREATE TABLE rtlt_team_types (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code            VARCHAR(50) NOT NULL UNIQUE,
  name            TEXT NOT NULL,
  discipline      TEXT,
  nims_category   TEXT,
  description     TEXT,
  sort_order      INTEGER,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE rtlt_team_types IS 'FEMA RTLT team type definitions. Generalizes the 13 SRT disciplines to any RTLT team type.';
COMMENT ON COLUMN rtlt_team_types.code IS 'RTLT resource typing code (e.g., ESF4-ST-TYP for Type-specific teams).';

-- ── Group G: Audit ──────────────────────────────────────

CREATE TABLE audit_log (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id      UUID REFERENCES users(id) ON DELETE SET NULL,
  actor_type    actor_type_enum NOT NULL,
  action        VARCHAR(100) NOT NULL,
  entity_type   VARCHAR(100) NOT NULL,
  entity_id     UUID,
  details_json  JSONB,
  ip_address    INET,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE audit_log IS 'APPEND ONLY. Tamper-evident event log. Triggers prevent UPDATE/DELETE.';
COMMENT ON COLUMN audit_log.actor_type IS 'user = human, system = automated process, admin = platform administrator.';

-- ── Deferred Foreign Key from tc_engagements ────────────

ALTER TABLE tc_engagements
  ADD CONSTRAINT fk_engagement_team_type
  FOREIGN KEY (team_type_id) REFERENCES rtlt_team_types(id) ON DELETE SET NULL;
