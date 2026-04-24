-- GSR-DOC-207: Position Requirements — RTLT-driven document slots + verification
--
-- Creates the master checklist of requirements per position (seeded from FEMA RTLT)
-- and the per-user fulfillment tracking linked to uploaded documents.

-- ── Enums ────────────────────────────────────────────────

DO $$ BEGIN
  CREATE TYPE requirement_type_enum AS ENUM (
    'course', 'certification', 'fitness', 'ptb', 'experience', 'other'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE fulfillment_status_enum AS ENUM (
    'unfulfilled', 'pending', 'verified', 'rejected', 'expired'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ── position_requirements: master checklist per position ─

CREATE TABLE IF NOT EXISTS position_requirements (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  position_id       UUID NOT NULL REFERENCES positions(id) ON DELETE CASCADE,
  requirement_type  requirement_type_enum NOT NULL,
  code              TEXT,
  title             TEXT NOT NULL,
  description       TEXT,
  document_category document_category_enum,
  is_required       BOOLEAN NOT NULL DEFAULT true,
  sort_order        INTEGER NOT NULL DEFAULT 0,
  group_label       TEXT,
  rtlt_source       TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE position_requirements
  IS 'FEMA RTLT-derived requirements per position. Seeded from references/rtlt/. One row per requirement per position.';
COMMENT ON COLUMN position_requirements.code
  IS 'Course code (IS-700, ICS-300) when applicable. Used for cross-position fulfillment reuse.';
COMMENT ON COLUMN position_requirements.rtlt_source
  IS 'Provenance: which RTLT field this row was derived from (e.g., course_codes, certifications, fitness_level).';

CREATE INDEX IF NOT EXISTS idx_position_requirements_position
  ON position_requirements(position_id);
CREATE INDEX IF NOT EXISTS idx_position_requirements_type
  ON position_requirements(requirement_type);
CREATE INDEX IF NOT EXISTS idx_position_requirements_code
  ON position_requirements(code) WHERE code IS NOT NULL;

-- Natural-key uniqueness for idempotent seeding (a given position has each
-- typed code at most once).
CREATE UNIQUE INDEX IF NOT EXISTS uq_position_requirements_position_type_code
  ON position_requirements(position_id, requirement_type, code)
  WHERE code IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS uq_position_requirements_position_type_title
  ON position_requirements(position_id, requirement_type, title)
  WHERE code IS NULL;

-- ── user_position_pursuits: which positions a user is working toward ─

CREATE TABLE IF NOT EXISTS user_position_pursuits (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  position_id   UUID NOT NULL REFERENCES positions(id) ON DELETE CASCADE,
  priority      INTEGER NOT NULL DEFAULT 0,
  started_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  notes         TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, position_id)
);

COMMENT ON TABLE user_position_pursuits
  IS 'Positions a user is actively pursuing. Drives which requirement checklists appear in their dashboard.';

CREATE INDEX IF NOT EXISTS idx_pursuits_user
  ON user_position_pursuits(user_id);
CREATE INDEX IF NOT EXISTS idx_pursuits_position
  ON user_position_pursuits(position_id);

-- ── user_requirement_fulfillments: per-user progress ─

CREATE TABLE IF NOT EXISTS user_requirement_fulfillments (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  requirement_id    UUID NOT NULL REFERENCES position_requirements(id) ON DELETE CASCADE,
  document_id       UUID REFERENCES documents(id) ON DELETE SET NULL,
  status            fulfillment_status_enum NOT NULL DEFAULT 'unfulfilled',
  verified_by       UUID REFERENCES users(id) ON DELETE SET NULL,
  verified_at       TIMESTAMPTZ,
  rejection_reason  TEXT,
  notes             TEXT,
  document_date     DATE,
  expires_at        TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, requirement_id)
);

COMMENT ON TABLE user_requirement_fulfillments
  IS 'Per-user fulfillment of position requirements. One row per (user, requirement). Staff verifies each.';
COMMENT ON COLUMN user_requirement_fulfillments.expires_at
  IS 'When the certificate/course/fitness test expires. A cron or lazy check flips verified -> expired when now() > expires_at.';

CREATE INDEX IF NOT EXISTS idx_fulfillments_user
  ON user_requirement_fulfillments(user_id);
CREATE INDEX IF NOT EXISTS idx_fulfillments_requirement
  ON user_requirement_fulfillments(requirement_id);
CREATE INDEX IF NOT EXISTS idx_fulfillments_status
  ON user_requirement_fulfillments(status);
CREATE INDEX IF NOT EXISTS idx_fulfillments_document
  ON user_requirement_fulfillments(document_id) WHERE document_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_fulfillments_verified_by
  ON user_requirement_fulfillments(verified_by) WHERE verified_by IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_fulfillments_expires
  ON user_requirement_fulfillments(expires_at) WHERE expires_at IS NOT NULL;

-- updated_at trigger
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_fulfillments_updated_at') THEN
    CREATE TRIGGER trg_fulfillments_updated_at BEFORE UPDATE ON user_requirement_fulfillments
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- ── RLS ─────────────────────────────────────────────────

ALTER TABLE position_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_position_pursuits ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_requirement_fulfillments ENABLE ROW LEVEL SECURITY;

-- position_requirements: anyone can read; only staff/admin manage.
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'position_requirements_select_all') THEN
    CREATE POLICY position_requirements_select_all ON position_requirements
      FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'position_requirements_manage_staff') THEN
    CREATE POLICY position_requirements_manage_staff ON position_requirements
      FOR ALL USING (
        EXISTS (
          SELECT 1 FROM users
          WHERE id = auth.uid() AND role IN ('platform_admin', 'staff')
        )
      );
  END IF;
END $$;

-- user_position_pursuits: user manages own; staff/admin can view all.
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'user_pursuits_select_own') THEN
    CREATE POLICY user_pursuits_select_own ON user_position_pursuits
      FOR SELECT USING (user_id = auth.uid());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'user_pursuits_select_staff') THEN
    CREATE POLICY user_pursuits_select_staff ON user_position_pursuits
      FOR SELECT USING (
        EXISTS (
          SELECT 1 FROM users
          WHERE id = auth.uid() AND role IN ('platform_admin', 'staff')
        )
      );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'user_pursuits_insert_own') THEN
    CREATE POLICY user_pursuits_insert_own ON user_position_pursuits
      FOR INSERT WITH CHECK (user_id = auth.uid());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'user_pursuits_update_own') THEN
    CREATE POLICY user_pursuits_update_own ON user_position_pursuits
      FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'user_pursuits_delete_own') THEN
    CREATE POLICY user_pursuits_delete_own ON user_position_pursuits
      FOR DELETE USING (user_id = auth.uid());
  END IF;
END $$;

-- user_requirement_fulfillments: user manages own (unfulfilled -> pending);
-- only staff/admin may flip to verified/rejected/expired.
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'fulfillments_select_own') THEN
    CREATE POLICY fulfillments_select_own ON user_requirement_fulfillments
      FOR SELECT USING (user_id = auth.uid());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'fulfillments_select_staff') THEN
    CREATE POLICY fulfillments_select_staff ON user_requirement_fulfillments
      FOR SELECT USING (
        EXISTS (
          SELECT 1 FROM users
          WHERE id = auth.uid() AND role IN ('platform_admin', 'staff')
        )
      );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'fulfillments_insert_own') THEN
    CREATE POLICY fulfillments_insert_own ON user_requirement_fulfillments
      FOR INSERT WITH CHECK (user_id = auth.uid());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'fulfillments_update_own') THEN
    -- Responders may update their own fulfillment but only when swapping the
    -- attached document / notes. Any transition into a staff-only status
    -- (verified, rejected, expired) is blocked by the WITH CHECK clause.
    CREATE POLICY fulfillments_update_own ON user_requirement_fulfillments
      FOR UPDATE USING (user_id = auth.uid())
      WITH CHECK (
        user_id = auth.uid()
        AND status IN ('unfulfilled', 'pending')
      );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'fulfillments_update_staff') THEN
    CREATE POLICY fulfillments_update_staff ON user_requirement_fulfillments
      FOR UPDATE USING (
        EXISTS (
          SELECT 1 FROM users
          WHERE id = auth.uid() AND role IN ('platform_admin', 'staff')
        )
      );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'fulfillments_delete_own') THEN
    CREATE POLICY fulfillments_delete_own ON user_requirement_fulfillments
      FOR DELETE USING (user_id = auth.uid() AND status IN ('unfulfilled', 'pending', 'rejected'));
  END IF;
END $$;
