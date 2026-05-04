-- GSR-DOC-204: Incident Registry Expansion
-- Expands the incidents table from DOC-002 minimal schema to comprehensive
-- content-engine schema with ICS 209 alignment, FEMA enrichment fields,
-- geospatial support, and editorial storytelling capabilities.

-- Enable trigram extension for fuzzy search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- ── New Enum Types ────────────────────────────────────────

DO $$ BEGIN
  CREATE TYPE incident_scale_enum AS ENUM (
    'local', 'regional', 'state', 'multi_state', 'national', 'international'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE incident_source_enum AS ENUM (
    'member_submitted', 'staff_created', 'atlas_enriched', 'fema_imported', 'seed_data'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE incident_verification_enum AS ENUM (
    'unverified', 'staff_verified', 'fema_matched', 'authoritative'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Expand existing incident_type_enum with new values
ALTER TYPE incident_type_enum ADD VALUE IF NOT EXISTS 'natural_disaster';
ALTER TYPE incident_type_enum ADD VALUE IF NOT EXISTS 'technological';
ALTER TYPE incident_type_enum ADD VALUE IF NOT EXISTS 'human_caused';
ALTER TYPE incident_type_enum ADD VALUE IF NOT EXISTS 'biological';

-- Expand existing incident_status_enum with new values
ALTER TYPE incident_status_enum ADD VALUE IF NOT EXISTS 'historical';
ALTER TYPE incident_status_enum ADD VALUE IF NOT EXISTS 'merged';
ALTER TYPE incident_status_enum ADD VALUE IF NOT EXISTS 'draft';

-- ── Rename existing columns to match DOC-204 schema ───────

-- Rename 'state' → 'location_state', 'county' → 'location_county'
-- Rename 'type' → 'incident_type', 'start_date' → 'incident_start_date', 'end_date' → 'incident_end_date'
DO $$ BEGIN
  ALTER TABLE incidents RENAME COLUMN state TO location_state;
EXCEPTION WHEN undefined_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE incidents RENAME COLUMN county TO location_county;
EXCEPTION WHEN undefined_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE incidents RENAME COLUMN type TO incident_type;
EXCEPTION WHEN undefined_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE incidents RENAME COLUMN start_date TO incident_start_date;
EXCEPTION WHEN undefined_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE incidents RENAME COLUMN end_date TO incident_end_date;
EXCEPTION WHEN undefined_column THEN NULL;
END $$;

-- ── Add new columns ───────────────────────────────────────

-- Core Identity
ALTER TABLE incidents ADD COLUMN IF NOT EXISTS slug varchar(255);
ALTER TABLE incidents ADD COLUMN IF NOT EXISTS incident_number varchar(50);
ALTER TABLE incidents ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE incidents ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

-- Classification
ALTER TABLE incidents ADD COLUMN IF NOT EXISTS incident_subtype varchar(100);
ALTER TABLE incidents ADD COLUMN IF NOT EXISTS complexity_level smallint CHECK (complexity_level BETWEEN 1 AND 5);
ALTER TABLE incidents ADD COLUMN IF NOT EXISTS incident_scale incident_scale_enum;

-- FEMA Declaration (fema_disaster_number already exists from DOC-002)
ALTER TABLE incidents ADD COLUMN IF NOT EXISTS fema_declaration_string varchar(20);
ALTER TABLE incidents ADD COLUMN IF NOT EXISTS fema_declaration_type varchar(5);
ALTER TABLE incidents ADD COLUMN IF NOT EXISTS fema_declaration_date date;
ALTER TABLE incidents ADD COLUMN IF NOT EXISTS fema_fiscal_year smallint;
ALTER TABLE incidents ADD COLUMN IF NOT EXISTS fema_incident_type varchar(50);
ALTER TABLE incidents ADD COLUMN IF NOT EXISTS fema_declaration_title varchar(255);
ALTER TABLE incidents ADD COLUMN IF NOT EXISTS fema_ih_program_declared boolean;
ALTER TABLE incidents ADD COLUMN IF NOT EXISTS fema_ia_program_declared boolean;
ALTER TABLE incidents ADD COLUMN IF NOT EXISTS fema_pa_program_declared boolean;
ALTER TABLE incidents ADD COLUMN IF NOT EXISTS fema_hm_program_declared boolean;
ALTER TABLE incidents ADD COLUMN IF NOT EXISTS fema_place_code varchar(10);
ALTER TABLE incidents ADD COLUMN IF NOT EXISTS fema_designated_area varchar(255);
ALTER TABLE incidents ADD COLUMN IF NOT EXISTS fema_enriched_at timestamptz;

-- State/Local Declaration
ALTER TABLE incidents ADD COLUMN IF NOT EXISTS state_declaration_number varchar(50);
ALTER TABLE incidents ADD COLUMN IF NOT EXISTS state_declaration_date date;
ALTER TABLE incidents ADD COLUMN IF NOT EXISTS local_declaration_number varchar(50);
ALTER TABLE incidents ADD COLUMN IF NOT EXISTS local_declaration_date date;

-- Temporal
ALTER TABLE incidents ADD COLUMN IF NOT EXISTS incident_start_time timetz;
ALTER TABLE incidents ADD COLUMN IF NOT EXISTS incident_end_time timetz;
ALTER TABLE incidents ADD COLUMN IF NOT EXISTS duration_days integer;
ALTER TABLE incidents ADD COLUMN IF NOT EXISTS operational_periods integer;

-- Geospatial
ALTER TABLE incidents ADD COLUMN IF NOT EXISTS location_point geography(POINT, 4326);
ALTER TABLE incidents ADD COLUMN IF NOT EXISTS location_polygon geography(POLYGON, 4326);
ALTER TABLE incidents ADD COLUMN IF NOT EXISTS location_city varchar(100);
ALTER TABLE incidents ADD COLUMN IF NOT EXISTS location_address text;
ALTER TABLE incidents ADD COLUMN IF NOT EXISTS location_description text;
ALTER TABLE incidents ADD COLUMN IF NOT EXISTS location_latitude decimal(10,7);
ALTER TABLE incidents ADD COLUMN IF NOT EXISTS location_longitude decimal(10,7);
ALTER TABLE incidents ADD COLUMN IF NOT EXISTS fips_state_code varchar(2);
ALTER TABLE incidents ADD COLUMN IF NOT EXISTS fips_county_code varchar(5);
ALTER TABLE incidents ADD COLUMN IF NOT EXISTS affected_states text[];
ALTER TABLE incidents ADD COLUMN IF NOT EXISTS affected_counties jsonb;

-- Impact & Scope
ALTER TABLE incidents ADD COLUMN IF NOT EXISTS area_size varchar(50);
ALTER TABLE incidents ADD COLUMN IF NOT EXISTS population_affected integer;
ALTER TABLE incidents ADD COLUMN IF NOT EXISTS fatalities_civilian integer;
ALTER TABLE incidents ADD COLUMN IF NOT EXISTS fatalities_responder integer;
ALTER TABLE incidents ADD COLUMN IF NOT EXISTS injuries_civilian integer;
ALTER TABLE incidents ADD COLUMN IF NOT EXISTS injuries_responder integer;
ALTER TABLE incidents ADD COLUMN IF NOT EXISTS evacuations integer;
ALTER TABLE incidents ADD COLUMN IF NOT EXISTS sheltered integer;
ALTER TABLE incidents ADD COLUMN IF NOT EXISTS structures_damaged integer;
ALTER TABLE incidents ADD COLUMN IF NOT EXISTS structures_destroyed integer;
ALTER TABLE incidents ADD COLUMN IF NOT EXISTS estimated_cost decimal(15,2);
ALTER TABLE incidents ADD COLUMN IF NOT EXISTS primary_hazards text[];
ALTER TABLE incidents ADD COLUMN IF NOT EXISTS damage_summary text;
ALTER TABLE incidents ADD COLUMN IF NOT EXISTS peak_responders integer;
ALTER TABLE incidents ADD COLUMN IF NOT EXISTS peak_resources integer;

-- Industry & Sector
ALTER TABLE incidents ADD COLUMN IF NOT EXISTS disciplines_involved text[];
ALTER TABLE incidents ADD COLUMN IF NOT EXISTS resource_categories_involved text[];
ALTER TABLE incidents ADD COLUMN IF NOT EXISTS sectors_involved text[];
ALTER TABLE incidents ADD COLUMN IF NOT EXISTS agencies_involved jsonb;
ALTER TABLE incidents ADD COLUMN IF NOT EXISTS mutual_aid_activated boolean;
ALTER TABLE incidents ADD COLUMN IF NOT EXISTS emac_activated boolean;
ALTER TABLE incidents ADD COLUMN IF NOT EXISTS mission_types text[];

-- Editorial & Storytelling
ALTER TABLE incidents ADD COLUMN IF NOT EXISTS narrative_summary text;
ALTER TABLE incidents ADD COLUMN IF NOT EXISTS lessons_learned text;
ALTER TABLE incidents ADD COLUMN IF NOT EXISTS significance text;
ALTER TABLE incidents ADD COLUMN IF NOT EXISTS hero_image_url varchar(500);
ALTER TABLE incidents ADD COLUMN IF NOT EXISTS gallery_urls text[];
ALTER TABLE incidents ADD COLUMN IF NOT EXISTS external_links jsonb;
ALTER TABLE incidents ADD COLUMN IF NOT EXISTS tags text[];
ALTER TABLE incidents ADD COLUMN IF NOT EXISTS featured boolean NOT NULL DEFAULT false;
ALTER TABLE incidents ADD COLUMN IF NOT EXISTS public_visible boolean NOT NULL DEFAULT true;

-- Data Provenance
ALTER TABLE incidents ADD COLUMN IF NOT EXISTS source incident_source_enum NOT NULL DEFAULT 'member_submitted';
ALTER TABLE incidents ADD COLUMN IF NOT EXISTS verification_status incident_verification_enum NOT NULL DEFAULT 'unverified';
ALTER TABLE incidents ADD COLUMN IF NOT EXISTS verified_by uuid REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE incidents ADD COLUMN IF NOT EXISTS verified_at timestamptz;
ALTER TABLE incidents ADD COLUMN IF NOT EXISTS merge_target_id uuid REFERENCES incidents(id) ON DELETE SET NULL;
ALTER TABLE incidents ADD COLUMN IF NOT EXISTS merged_at timestamptz;

-- Aggregate Counters
ALTER TABLE incidents ADD COLUMN IF NOT EXISTS deployment_count integer NOT NULL DEFAULT 0;
ALTER TABLE incidents ADD COLUMN IF NOT EXISTS responder_count integer NOT NULL DEFAULT 0;
ALTER TABLE incidents ADD COLUMN IF NOT EXISTS agency_count integer NOT NULL DEFAULT 0;
ALTER TABLE incidents ADD COLUMN IF NOT EXISTS validation_count integer NOT NULL DEFAULT 0;

-- ── Indexes ───────────────────────────────────────────────

CREATE UNIQUE INDEX IF NOT EXISTS idx_incidents_slug ON incidents(slug);
CREATE UNIQUE INDEX IF NOT EXISTS idx_incidents_fema_number_unique
  ON incidents(fema_disaster_number) WHERE fema_disaster_number IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_incidents_name_trgm ON incidents USING gin (name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_incidents_incident_type ON incidents(incident_type);
CREATE INDEX IF NOT EXISTS idx_incidents_location_state ON incidents(location_state);
CREATE INDEX IF NOT EXISTS idx_incidents_status_204 ON incidents(status);
CREATE INDEX IF NOT EXISTS idx_incidents_verification ON incidents(verification_status);
CREATE INDEX IF NOT EXISTS idx_incidents_start_date ON incidents(incident_start_date DESC);
CREATE INDEX IF NOT EXISTS idx_incidents_featured ON incidents(featured) WHERE featured = true;
CREATE INDEX IF NOT EXISTS idx_incidents_public ON incidents(public_visible, status);

-- Geospatial indexes
CREATE INDEX IF NOT EXISTS idx_incidents_location_point ON incidents USING gist (location_point);
CREATE INDEX IF NOT EXISTS idx_incidents_location_polygon ON incidents USING gist (location_polygon);

-- Full-text search index
CREATE INDEX IF NOT EXISTS idx_incidents_fts ON incidents USING gin (
  to_tsvector('english', coalesce(name, '') || ' ' || coalesce(description, '') || ' ' ||
  coalesce(incident_subtype, '') || ' ' || coalesce(location_description, '') || ' ' ||
  coalesce(fema_declaration_title, ''))
);

-- ── Supporting Tables ─────────────────────────────────────

-- Junction table: incident_affinities
CREATE TABLE IF NOT EXISTS incident_affinities (
  incident_id uuid NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
  affinity_id uuid NOT NULL REFERENCES affinities(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (incident_id, affinity_id)
);

-- Timeline table: incident_updates
CREATE TABLE IF NOT EXISTS incident_updates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_id uuid NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
  update_date date NOT NULL,
  update_time timetz,
  title varchar(255) NOT NULL,
  body text,
  update_type varchar(50) NOT NULL,
  source varchar(100),
  created_by uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_incident_updates_incident ON incident_updates(incident_id, update_date);

-- ── Triggers ──────────────────────────────────────────────

-- Auto-populate location_point from lat/lng
CREATE OR REPLACE FUNCTION incidents_set_location_point()
RETURNS trigger AS $$
BEGIN
  IF NEW.location_latitude IS NOT NULL AND NEW.location_longitude IS NOT NULL THEN
    NEW.location_point := ST_SetSRID(ST_MakePoint(NEW.location_longitude, NEW.location_latitude), 4326)::geography;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_incidents_set_location_point ON incidents;
CREATE TRIGGER trg_incidents_set_location_point
  BEFORE INSERT OR UPDATE OF location_latitude, location_longitude ON incidents
  FOR EACH ROW EXECUTE FUNCTION incidents_set_location_point();

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION incidents_set_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_incidents_updated_at ON incidents;
CREATE TRIGGER trg_incidents_updated_at
  BEFORE UPDATE ON incidents
  FOR EACH ROW EXECUTE FUNCTION incidents_set_updated_at();

-- Auto-generate slug from name
CREATE OR REPLACE FUNCTION incidents_generate_slug()
RETURNS trigger AS $$
DECLARE
  base_slug text;
  final_slug text;
  counter integer := 0;
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    base_slug := lower(regexp_replace(regexp_replace(NEW.name, '[^a-zA-Z0-9\s-]', '', 'g'), '\s+', '-', 'g'));
    base_slug := regexp_replace(base_slug, '-+', '-', 'g');
    base_slug := trim(both '-' from base_slug);
    final_slug := base_slug;
    WHILE EXISTS (SELECT 1 FROM incidents WHERE slug = final_slug AND id != NEW.id) LOOP
      counter := counter + 1;
      final_slug := base_slug || '-' || counter;
    END LOOP;
    NEW.slug := final_slug;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_incidents_generate_slug ON incidents;
CREATE TRIGGER trg_incidents_generate_slug
  BEFORE INSERT OR UPDATE OF name ON incidents
  FOR EACH ROW EXECUTE FUNCTION incidents_generate_slug();

-- ── RLS Policies ──────────────────────────────────────────

ALTER TABLE incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE incident_affinities ENABLE ROW LEVEL SECURITY;
ALTER TABLE incident_updates ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (from DOC-002) to avoid conflicts
DROP POLICY IF EXISTS "Users can view all incidents" ON incidents;
DROP POLICY IF EXISTS "Authenticated users can create incidents" ON incidents;

-- Drop policies from 20260409000008_rls_policies.sql that this migration replaces
-- (added 2026-05-04 — original migration missed these, breaking `db reset`)
DROP POLICY IF EXISTS incidents_select_all ON incidents;
DROP POLICY IF EXISTS incidents_insert_authenticated ON incidents;
DROP POLICY IF EXISTS incidents_update_admin ON incidents;

-- Incidents: any authenticated user can read non-merged incidents
CREATE POLICY incidents_select_authenticated ON incidents
  FOR SELECT TO authenticated
  USING (status != 'merged');

-- Incidents: public can read public_visible non-merged incidents
CREATE POLICY incidents_select_public ON incidents
  FOR SELECT TO anon
  USING (public_visible = true AND status NOT IN ('merged', 'draft'));

-- Incidents: any authenticated user can insert
CREATE POLICY incidents_insert_authenticated ON incidents
  FOR INSERT TO authenticated
  WITH CHECK (true);

-- Incidents: creator or platform_admin can update
CREATE POLICY incidents_update_owner_or_admin ON incidents
  FOR UPDATE TO authenticated
  USING (
    created_by = auth.uid() OR is_platform_admin()
  );

-- Incidents: only platform_admin can delete
CREATE POLICY incidents_delete_admin ON incidents
  FOR DELETE TO authenticated
  USING (is_platform_admin());

-- incident_affinities: follow parent incident policies
CREATE POLICY incident_affinities_select ON incident_affinities
  FOR SELECT TO authenticated USING (true);

CREATE POLICY incident_affinities_select_public ON incident_affinities
  FOR SELECT TO anon USING (
    EXISTS (SELECT 1 FROM incidents WHERE id = incident_id AND public_visible = true AND status NOT IN ('merged', 'draft'))
  );

CREATE POLICY incident_affinities_insert ON incident_affinities
  FOR INSERT TO authenticated WITH CHECK (true);

-- incident_updates
CREATE POLICY incident_updates_select ON incident_updates
  FOR SELECT TO authenticated USING (true);

CREATE POLICY incident_updates_select_public ON incident_updates
  FOR SELECT TO anon USING (
    EXISTS (SELECT 1 FROM incidents WHERE id = incident_id AND public_visible = true AND status NOT IN ('merged', 'draft'))
  );

CREATE POLICY incident_updates_insert ON incident_updates
  FOR INSERT TO authenticated WITH CHECK (true);

-- ── Backfill slugs for existing rows ──────────────────────

UPDATE incidents SET slug = NULL WHERE slug IS NULL;
