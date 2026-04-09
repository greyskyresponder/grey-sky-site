-- Grey Sky Responder Portal — initial Supabase schema
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL CHECK (type IN ('jurisdiction', 'organization', 'responder_hub')),
  region TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS requirement_packs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  discipline TEXT NOT NULL,
  version TEXT NOT NULL,
  title TEXT NOT NULL,
  notes TEXT,
  requirements JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS requirements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  discipline TEXT NOT NULL,
  code TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  requirement_type TEXT NOT NULL CHECK (requirement_type IN ('training','certification','experience','equipment','document')),
  currency_interval_days INTEGER,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  discipline TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  requirement_pack_id UUID REFERENCES requirement_packs(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_programs_tenant ON programs(tenant_id);

CREATE TABLE IF NOT EXISTS teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  program_id UUID REFERENCES programs(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  location_city TEXT,
  location_state TEXT,
  status TEXT NOT NULL CHECK (status IN ('pending','scheduled','assessed','credentialed','action_required')),
  next_review_at TIMESTAMPTZ,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_teams_tenant ON teams(tenant_id);

CREATE TABLE IF NOT EXISTS responders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  primary_program_id UUID REFERENCES programs(id) ON DELETE SET NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  primary_discipline TEXT,
  status TEXT NOT NULL CHECK (status IN ('onboarding','in_review','credentialed','action_required','inactive')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_responders_tenant ON responders(tenant_id);

CREATE TABLE IF NOT EXISTS evidence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  responder_id UUID REFERENCES responders(id) ON DELETE CASCADE,
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  file_path TEXT NOT NULL,
  source TEXT,
  status TEXT NOT NULL CHECK (status IN ('received','in_review','accepted','rejected')),
  notes TEXT,
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  verified_at TIMESTAMPTZ,
  verified_by UUID
);
CREATE INDEX IF NOT EXISTS idx_evidence_tenant ON evidence(tenant_id);

CREATE TABLE IF NOT EXISTS responder_requirements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  responder_id UUID NOT NULL REFERENCES responders(id) ON DELETE CASCADE,
  requirement_id UUID NOT NULL REFERENCES requirements(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('pending','submitted','verified','expired')),
  due_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  evidence_id UUID REFERENCES evidence(id) ON DELETE SET NULL,
  reviewer_id UUID,
  reviewer_notes TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_responder_requirement_unique ON responder_requirements(responder_id, requirement_id);

CREATE TABLE IF NOT EXISTS assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  program_id UUID REFERENCES programs(id) ON DELETE SET NULL,
  assessor_id UUID,
  stage TEXT NOT NULL CHECK (stage IN ('intake','scheduled','site_visit','reporting','closed')),
  scheduled_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  overall_rating TEXT,
  summary TEXT,
  action_items JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_assessments_tenant ON assessments(tenant_id);

CREATE TABLE IF NOT EXISTS assessment_findings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
  requirement_id UUID REFERENCES requirements(id) ON DELETE SET NULL,
  severity TEXT NOT NULL CHECK (severity IN ('critical','major','minor','info')),
  finding TEXT NOT NULL,
  recommendation TEXT,
  resolved BOOLEAN NOT NULL DEFAULT false,
  resolved_at TIMESTAMPTZ
);

-- helper trigger for updated_at columns
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_programs_updated BEFORE UPDATE ON programs FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_teams_updated BEFORE UPDATE ON teams FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_responders_updated BEFORE UPDATE ON responders FOR EACH ROW EXECUTE FUNCTION set_updated_at();
