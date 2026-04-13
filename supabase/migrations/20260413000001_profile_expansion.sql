-- GSR-DOC-202 Expansion: Service identity tables and profile completeness engine
-- Prerequisite: users table exists with core fields (DOC-002)

-- ============================================================
-- 1. Expand users table with service identity fields
-- ============================================================

ALTER TABLE users ADD COLUMN IF NOT EXISTS preferred_name varchar(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS date_of_birth date;
ALTER TABLE users ADD COLUMN IF NOT EXISTS service_start_year integer;
ALTER TABLE users ADD COLUMN IF NOT EXISTS primary_discipline varchar(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS secondary_disciplines text[];
ALTER TABLE users ADD COLUMN IF NOT EXISTS service_statement text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS years_of_service_computed integer;
ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_completeness integer NOT NULL DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_updated_at timestamptz;

-- Constraints
ALTER TABLE users ADD CONSTRAINT chk_service_start_year
  CHECK (service_start_year IS NULL OR (service_start_year >= 1950 AND service_start_year <= EXTRACT(YEAR FROM CURRENT_DATE)::integer));

ALTER TABLE users ADD CONSTRAINT chk_service_statement_length
  CHECK (service_statement IS NULL OR LENGTH(service_statement) <= 500);

-- ============================================================
-- 2. user_communities — Where You've Served
-- ============================================================

CREATE TABLE IF NOT EXISTS user_communities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  community_name varchar(200) NOT NULL,
  state varchar(2),
  country varchar(3) NOT NULL DEFAULT 'USA',
  relationship varchar(50) NOT NULL CHECK (relationship IN ('home_base', 'deployed_to', 'assigned_to', 'mutual_aid')),
  start_year integer CHECK (start_year IS NULL OR (start_year >= 1950 AND start_year <= EXTRACT(YEAR FROM CURRENT_DATE)::integer)),
  end_year integer CHECK (end_year IS NULL OR (end_year >= 1950 AND end_year <= EXTRACT(YEAR FROM CURRENT_DATE)::integer)),
  is_current boolean NOT NULL DEFAULT false,
  notes varchar(500),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT chk_community_year_range CHECK (end_year IS NULL OR start_year IS NULL OR end_year >= start_year)
);

CREATE INDEX idx_user_communities_user ON user_communities(user_id);
CREATE INDEX idx_user_communities_state ON user_communities(state);
CREATE INDEX idx_user_communities_current ON user_communities(user_id, is_current) WHERE is_current = true;

-- ============================================================
-- 3. user_service_orgs — Who You've Served With
-- ============================================================

CREATE TABLE IF NOT EXISTS user_service_orgs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  organization_id uuid REFERENCES organizations(id) ON DELETE SET NULL,
  organization_name varchar(300) NOT NULL,
  organization_type varchar(50),
  role_title varchar(200),
  start_year integer CHECK (start_year IS NULL OR (start_year >= 1950 AND start_year <= EXTRACT(YEAR FROM CURRENT_DATE)::integer)),
  end_year integer CHECK (end_year IS NULL OR (end_year >= 1950 AND end_year <= EXTRACT(YEAR FROM CURRENT_DATE)::integer)),
  is_current boolean NOT NULL DEFAULT false,
  is_primary boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT chk_org_year_range CHECK (end_year IS NULL OR start_year IS NULL OR end_year >= start_year)
);

CREATE INDEX idx_user_service_orgs_user ON user_service_orgs(user_id);
CREATE INDEX idx_user_service_orgs_org ON user_service_orgs(organization_id);
CREATE INDEX idx_user_service_orgs_current ON user_service_orgs(user_id, is_current) WHERE is_current = true;
CREATE INDEX idx_user_service_orgs_primary ON user_service_orgs(user_id, is_primary) WHERE is_primary = true;

-- ============================================================
-- 4. user_teams — Teams You've Been Part Of
-- ============================================================

CREATE TABLE IF NOT EXISTS user_teams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  team_name varchar(300) NOT NULL,
  team_type_id uuid REFERENCES rtlt_team_types(id) ON DELETE SET NULL,
  organization_id uuid REFERENCES organizations(id) ON DELETE SET NULL,
  position_on_team varchar(200),
  rtlt_position_slug varchar(200),
  start_year integer CHECK (start_year IS NULL OR (start_year >= 1950 AND start_year <= EXTRACT(YEAR FROM CURRENT_DATE)::integer)),
  end_year integer CHECK (end_year IS NULL OR (end_year >= 1950 AND end_year <= EXTRACT(YEAR FROM CURRENT_DATE)::integer)),
  is_current boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT chk_team_year_range CHECK (end_year IS NULL OR start_year IS NULL OR end_year >= start_year)
);

CREATE INDEX idx_user_teams_user ON user_teams(user_id);
CREATE INDEX idx_user_teams_type ON user_teams(team_type_id);
CREATE INDEX idx_user_teams_org ON user_teams(organization_id);
CREATE INDEX idx_user_teams_current ON user_teams(user_id, is_current) WHERE is_current = true;

-- ============================================================
-- 5. user_qualifications — What You Bring
-- ============================================================

CREATE TABLE IF NOT EXISTS user_qualifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  qualification_name varchar(300) NOT NULL,
  issuing_authority varchar(300),
  credential_number varchar(100),
  issued_date date,
  expiration_date date,
  is_active boolean NOT NULL DEFAULT true,
  document_id uuid, -- FK to documents table (DOC-206), not constrained yet
  verification_status varchar(20) NOT NULL DEFAULT 'self_reported'
    CHECK (verification_status IN ('self_reported', 'document_linked', 'staff_verified')),
  category varchar(50)
    CHECK (category IS NULL OR category IN ('medical', 'technical', 'leadership', 'hazmat', 'communications', 'legal', 'fema_ics', 'state_cert', 'other')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_user_qualifications_user ON user_qualifications(user_id);
CREATE INDEX idx_user_qualifications_active ON user_qualifications(user_id, is_active) WHERE is_active = true;
CREATE INDEX idx_user_qualifications_category ON user_qualifications(category);

-- ============================================================
-- 6. user_languages — Languages Spoken
-- ============================================================

CREATE TABLE IF NOT EXISTS user_languages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  language varchar(100) NOT NULL,
  proficiency varchar(20) NOT NULL DEFAULT 'conversational'
    CHECK (proficiency IN ('native', 'fluent', 'conversational', 'basic')),
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT uq_user_language UNIQUE (user_id, language)
);

CREATE INDEX idx_user_languages_user ON user_languages(user_id);

-- ============================================================
-- 7. Triggers
-- ============================================================

-- updated_at triggers for new tables
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_user_communities_updated_at') THEN
    CREATE TRIGGER trg_user_communities_updated_at BEFORE UPDATE ON user_communities
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_user_service_orgs_updated_at') THEN
    CREATE TRIGGER trg_user_service_orgs_updated_at BEFORE UPDATE ON user_service_orgs
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_user_teams_updated_at') THEN
    CREATE TRIGGER trg_user_teams_updated_at BEFORE UPDATE ON user_teams
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_user_qualifications_updated_at') THEN
    CREATE TRIGGER trg_user_qualifications_updated_at BEFORE UPDATE ON user_qualifications
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- Years of service computed trigger
CREATE OR REPLACE FUNCTION compute_years_of_service()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.service_start_year IS NOT NULL THEN
    NEW.years_of_service_computed = EXTRACT(YEAR FROM CURRENT_DATE)::integer - NEW.service_start_year;
  ELSE
    NEW.years_of_service_computed = NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_users_years_of_service') THEN
    CREATE TRIGGER trg_users_years_of_service BEFORE INSERT OR UPDATE OF service_start_year ON users
      FOR EACH ROW EXECUTE FUNCTION compute_years_of_service();
  END IF;
END $$;

-- Profile completeness engine
CREATE OR REPLACE FUNCTION compute_profile_completeness()
RETURNS TRIGGER AS $$
DECLARE
  score integer := 0;
  comm_count integer;
  org_count integer;
  team_count integer;
  qual_count integer;
  aff_count integer;
BEGIN
  -- Basic Info (15): first_name + last_name + location_state
  IF NEW.first_name IS NOT NULL AND NEW.last_name IS NOT NULL AND NEW.location_state IS NOT NULL THEN
    score := score + 15;
  END IF;

  -- Service Identity (20): primary_discipline + service_start_year
  IF NEW.primary_discipline IS NOT NULL AND NEW.service_start_year IS NOT NULL THEN
    score := score + 20;
  END IF;

  -- Service Statement (10): service_statement >= 50 chars
  IF NEW.service_statement IS NOT NULL AND LENGTH(NEW.service_statement) >= 50 THEN
    score := score + 10;
  END IF;

  -- Communities (15): at least 1 current community
  SELECT COUNT(*) INTO comm_count FROM user_communities WHERE user_id = NEW.id AND is_current = true;
  IF comm_count > 0 THEN
    score := score + 15;
  END IF;

  -- Organizations (15): at least 1 service org
  SELECT COUNT(*) INTO org_count FROM user_service_orgs WHERE user_id = NEW.id;
  IF org_count > 0 THEN
    score := score + 15;
  END IF;

  -- Teams (10): at least 1 team
  SELECT COUNT(*) INTO team_count FROM user_teams WHERE user_id = NEW.id;
  IF team_count > 0 THEN
    score := score + 10;
  END IF;

  -- Qualifications (10): at least 1 qualification
  SELECT COUNT(*) INTO qual_count FROM user_qualifications WHERE user_id = NEW.id;
  IF qual_count > 0 THEN
    score := score + 10;
  END IF;

  -- Affinities (5): at least 3 affinities selected
  SELECT COUNT(*) INTO aff_count FROM user_affinities WHERE user_id = NEW.id;
  IF aff_count >= 3 THEN
    score := score + 5;
  END IF;

  NEW.profile_completeness = score;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_users_profile_completeness') THEN
    CREATE TRIGGER trg_users_profile_completeness BEFORE UPDATE ON users
      FOR EACH ROW EXECUTE FUNCTION compute_profile_completeness();
  END IF;
END $$;

-- ============================================================
-- 8. RLS Policies — all new tables
-- ============================================================

-- user_communities
ALTER TABLE user_communities ENABLE ROW LEVEL SECURITY;
CREATE POLICY user_communities_select ON user_communities FOR SELECT
  USING (user_id = auth.uid() OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'platform_admin'));
CREATE POLICY user_communities_insert ON user_communities FOR INSERT
  WITH CHECK (user_id = auth.uid());
CREATE POLICY user_communities_update ON user_communities FOR UPDATE
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY user_communities_delete ON user_communities FOR DELETE
  USING (user_id = auth.uid());

-- user_service_orgs
ALTER TABLE user_service_orgs ENABLE ROW LEVEL SECURITY;
CREATE POLICY user_service_orgs_select ON user_service_orgs FOR SELECT
  USING (user_id = auth.uid() OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'platform_admin'));
CREATE POLICY user_service_orgs_insert ON user_service_orgs FOR INSERT
  WITH CHECK (user_id = auth.uid());
CREATE POLICY user_service_orgs_update ON user_service_orgs FOR UPDATE
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY user_service_orgs_delete ON user_service_orgs FOR DELETE
  USING (user_id = auth.uid());

-- user_teams
ALTER TABLE user_teams ENABLE ROW LEVEL SECURITY;
CREATE POLICY user_teams_select ON user_teams FOR SELECT
  USING (user_id = auth.uid() OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'platform_admin'));
CREATE POLICY user_teams_insert ON user_teams FOR INSERT
  WITH CHECK (user_id = auth.uid());
CREATE POLICY user_teams_update ON user_teams FOR UPDATE
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY user_teams_delete ON user_teams FOR DELETE
  USING (user_id = auth.uid());

-- user_qualifications
ALTER TABLE user_qualifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY user_qualifications_select ON user_qualifications FOR SELECT
  USING (user_id = auth.uid() OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'platform_admin'));
CREATE POLICY user_qualifications_insert ON user_qualifications FOR INSERT
  WITH CHECK (user_id = auth.uid());
CREATE POLICY user_qualifications_update ON user_qualifications FOR UPDATE
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY user_qualifications_delete ON user_qualifications FOR DELETE
  USING (user_id = auth.uid());

-- user_languages
ALTER TABLE user_languages ENABLE ROW LEVEL SECURITY;
CREATE POLICY user_languages_select ON user_languages FOR SELECT
  USING (user_id = auth.uid() OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'platform_admin'));
CREATE POLICY user_languages_insert ON user_languages FOR INSERT
  WITH CHECK (user_id = auth.uid());
CREATE POLICY user_languages_delete ON user_languages FOR DELETE
  USING (user_id = auth.uid());
