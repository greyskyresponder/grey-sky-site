-- ICS 222 Response Report — Deployment Records Expansion
-- Aligns deployment_records table with Grey Sky adapted ICS 222 form (Rev 3/26).
-- Adds missing fields for Blocks 8, 9c, 13, 14, 15, 16, and ensures position_free_text exists.
-- See: docs/design/GSR-DOC-202-203-PROFILE-DEPLOYMENTS.md

-- ── New Enum Types ────────────────────────────────────────

DO $$ BEGIN
  CREATE TYPE operational_setting_enum AS ENUM (
    'eoc',           -- Emergency Operations Center
    'icp',           -- Incident Command Post
    'fob',           -- Forward Operating Base
    'boo',           -- Base of Operations
    'field_staging', -- Field/Staging
    'jfo',           -- Joint Field Office
    'other'          -- Other (use operational_setting_other for detail)
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE compensation_status_enum AS ENUM (
    'paid',
    'volunteer',
    'mutual_aid',
    'other'          -- Use compensation_status_other for detail
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ── Add ICS 222 Columns to deployment_records ─────────────

-- Block 5: Position free text (for non-RTLT positions)
-- Referenced in code but never migrated
ALTER TABLE deployment_records
  ADD COLUMN IF NOT EXISTS position_free_text TEXT;
COMMENT ON COLUMN deployment_records.position_free_text
  IS 'ICS 222 Block 5: Free-text position title when not found in RTLT positions table.';

-- Block 8: Operational Setting
ALTER TABLE deployment_records
  ADD COLUMN IF NOT EXISTS operational_setting operational_setting_enum;
ALTER TABLE deployment_records
  ADD COLUMN IF NOT EXISTS operational_setting_other TEXT;
COMMENT ON COLUMN deployment_records.operational_setting
  IS 'ICS 222 Block 8: EOC, ICP, FOB, BOO, Field/Staging, JFO, or Other.';
COMMENT ON COLUMN deployment_records.operational_setting_other
  IS 'ICS 222 Block 8: Free text when operational_setting = other.';

-- Block 9: Extended assignment fields
ALTER TABLE deployment_records
  ADD COLUMN IF NOT EXISTS total_days INTEGER;
ALTER TABLE deployment_records
  ADD COLUMN IF NOT EXISTS operational_periods INTEGER;
COMMENT ON COLUMN deployment_records.total_days
  IS 'ICS 222 Block 9: Total days on incident. Auto-calculated from dates but user-overridable.';
COMMENT ON COLUMN deployment_records.operational_periods
  IS 'ICS 222 Block 9: Number of operational periods served.';

-- Block 13: Compensation Status
ALTER TABLE deployment_records
  ADD COLUMN IF NOT EXISTS compensation_status compensation_status_enum;
ALTER TABLE deployment_records
  ADD COLUMN IF NOT EXISTS compensation_status_other TEXT;
COMMENT ON COLUMN deployment_records.compensation_status
  IS 'ICS 222 Block 13: Paid, Volunteer, Mutual Aid, or Other.';
COMMENT ON COLUMN deployment_records.compensation_status_other
  IS 'ICS 222 Block 13: Free text when compensation_status = other.';

-- Block 14: Summary of Duties and Responsibilities (narrative)
ALTER TABLE deployment_records
  ADD COLUMN IF NOT EXISTS duties_summary TEXT;
COMMENT ON COLUMN deployment_records.duties_summary
  IS 'ICS 222 Block 14: Duties, scope of authority, reporting relationships, key functions.';

-- Block 15: Key Accomplishments and Activities (narrative)
ALTER TABLE deployment_records
  ADD COLUMN IF NOT EXISTS key_accomplishments TEXT;
COMMENT ON COLUMN deployment_records.key_accomplishments
  IS 'ICS 222 Block 15: Significant accomplishments, outcomes, contributions to incident objectives.';

-- Block 16: Resources Managed/Supervised
ALTER TABLE deployment_records
  ADD COLUMN IF NOT EXISTS personnel_supervised TEXT;
ALTER TABLE deployment_records
  ADD COLUMN IF NOT EXISTS equipment_supervised TEXT;
COMMENT ON COLUMN deployment_records.personnel_supervised
  IS 'ICS 222 Block 16: Range of personnel supervised/managed.';
COMMENT ON COLUMN deployment_records.equipment_supervised
  IS 'ICS 222 Block 16: Range of equipment/vehicles supervised/managed.';

-- Block 18: Self-Certification timestamp (explicit, separate from status change)
ALTER TABLE deployment_records
  ADD COLUMN IF NOT EXISTS self_certified_at TIMESTAMPTZ;
COMMENT ON COLUMN deployment_records.self_certified_at
  IS 'ICS 222 Block 18: Timestamp when member self-certified accuracy. Set on submit.';

-- ── Indexes ───────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_deployment_records_operational_setting
  ON deployment_records(operational_setting)
  WHERE operational_setting IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_deployment_records_compensation_status
  ON deployment_records(compensation_status)
  WHERE compensation_status IS NOT NULL;

-- ── Update table comment ──────────────────────────────────

COMMENT ON TABLE deployment_records
  IS 'ICS 222 Response Report — individual deployment/service records aligned with Grey Sky adapted ICS 222 (Rev 3/26). Core of the verification pipeline.';
