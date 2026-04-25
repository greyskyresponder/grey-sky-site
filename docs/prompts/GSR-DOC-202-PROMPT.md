# GSR-DOC-202 Expansion Build — Claude Code Prompt

| Field | Value |
|-------|-------|
| Phase | 2 |
| Status | approved |
| Blocks on | none (DOC-201 ✅, DOC-003 ✅) |
| Priority | critical |
| Commit | `17c8e53` committed the expanded design doc; `688fb0b` built basic profile |

---

## What Exists Already

The basic member profile was built in commit `688fb0b`:
- `/dashboard/profile` and `/dashboard/profile/edit` routes exist
- Basic profile view and edit components exist
- The `users` table has core fields (first_name, last_name, phone, email, location_*, bio, avatar_url, etc.)
- Profile nav link exists in dashboard sidebar

**What has NOT been built** (this is your scope):
- New columns on `users` table: `preferred_name`, `date_of_birth`, `service_start_year`, `primary_discipline`, `secondary_disciplines`, `service_statement`, `years_of_service_computed`, `profile_completeness`, `profile_updated_at`
- Five new tables: `user_communities`, `user_service_orgs`, `user_teams`, `user_qualifications`, `user_languages`
- Profile completeness engine (trigger-based)
- Years of service computed trigger
- All related server actions, types, validators, and UI components for the expanded sections
- RLS policies on all new tables

**Removed from original spec**: The `pronouns` field was removed per directive (commit `17c8e53`). Do NOT add a pronouns column or form field.

---

## Context

You are expanding the member profile system for the Grey Sky Responder Society platform. The platform is a Next.js 16 app (App Router, React 19, TypeScript 5, Tailwind CSS 4) backed by Supabase (PostgreSQL 16 + PostGIS). Auth is Supabase Auth (GoTrue), NOT NextAuth.js.

Brand tokens: `--gs-navy: #0A1628`, `--gs-gold: #C5933A`, `--gs-white: #F5F5F5`. Font: Inter.

Language rules: Never say "career" — use "service" / "serving" / "the work". Never say "resume" — say "service record" or "service identity". The profile is not a form to fill out — it is an invitation to be recognized.

Privacy: Member profiles are visible only to the member and GSRS staff. No public profile pages. No public directory. OD-10 resolved: verification-only.

---

## Step 1: Create Migration

Create `supabase/migrations/20260413000001_profile_expansion.sql`:

```sql
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

CREATE TRIGGER trg_users_years_of_service BEFORE INSERT OR UPDATE OF service_start_year ON users
  FOR EACH ROW EXECUTE FUNCTION compute_years_of_service();

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

CREATE TRIGGER trg_users_profile_completeness BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION compute_profile_completeness();

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
```

---

## Step 2: Create/Update TypeScript Types

Create or update `src/lib/types/profile.ts` with these interfaces:

```typescript
export interface UserProfile {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  preferred_name: string | null;
  phone: string | null;
  date_of_birth: string | null; // ISO date — NEVER displayed on view page
  location_city: string | null;
  location_state: string | null;
  location_country: string | null;
  bio: string | null;
  avatar_url: string | null;
  service_start_year: number | null;
  primary_discipline: string | null;
  secondary_disciplines: string[] | null;
  service_statement: string | null;
  years_of_service_computed: number | null;
  profile_completeness: number;
  membership_status: 'active' | 'expired' | 'none';
  membership_expires_at: string | null;
  role: 'member' | 'org_admin' | 'assessor' | 'platform_admin';
  created_at: string;
  profile_updated_at: string | null;
  // Related data
  communities: UserCommunity[];
  service_orgs: UserServiceOrg[];
  teams: UserTeam[];
  qualifications: UserQualification[];
  languages: UserLanguage[];
  affinities: UserAffinity[];
}

export interface UserCommunity {
  id: string;
  community_name: string;
  state: string | null;
  country: string;
  relationship: 'home_base' | 'deployed_to' | 'assigned_to' | 'mutual_aid';
  start_year: number | null;
  end_year: number | null;
  is_current: boolean;
  notes: string | null;
}

export interface UserServiceOrg {
  id: string;
  organization_id: string | null;
  organization_name: string;
  organization_type: string | null;
  role_title: string | null;
  start_year: number | null;
  end_year: number | null;
  is_current: boolean;
  is_primary: boolean;
}

export interface UserTeam {
  id: string;
  team_name: string;
  team_type_id: string | null;
  team_type_name?: string;
  organization_id: string | null;
  organization_name?: string;
  position_on_team: string | null;
  rtlt_position_slug: string | null;
  rtlt_position_title?: string;
  start_year: number | null;
  end_year: number | null;
  is_current: boolean;
}

export interface UserQualification {
  id: string;
  qualification_name: string;
  issuing_authority: string | null;
  credential_number: string | null; // Masked in display: "····1234"
  issued_date: string | null;
  expiration_date: string | null;
  is_active: boolean;
  document_id: string | null;
  verification_status: 'self_reported' | 'document_linked' | 'staff_verified';
  category: string | null;
}

export interface UserLanguage {
  id: string;
  language: string;
  proficiency: 'native' | 'fluent' | 'conversational' | 'basic';
}

export interface UserAffinity {
  affinity_id: string;
  category: 'hazard_type' | 'functional_specialty' | 'sector_experience';
  value: string;
  description: string | null;
}

export interface ProfileSection {
  key: string;
  label: string;
  weight: number;
  complete: boolean;
}
```

Add to the barrel export in `src/lib/types/index.ts`.

---

## Step 3: Create Zod Validators

Create `src/lib/validators/profile.ts` with schemas:

- `basicInfoSchema` — first_name (1-100 chars), last_name (1-100 chars), preferred_name (optional, 1-100), phone (optional), date_of_birth (optional ISO date string), location_city, location_state (2-char), location_country (3-char, default 'USA')
- `serviceIdentitySchema` — primary_discipline (optional string), secondary_disciplines (optional string array), service_start_year (int 1950 to current year), service_statement (optional, max 500 chars)
- `communitySchema` — community_name (required, 1-200), state (optional 2-char), country (3-char default 'USA'), relationship (required enum: 'home_base'|'deployed_to'|'assigned_to'|'mutual_aid'), start_year (optional int 1950-current), end_year (optional int >= start_year), is_current (boolean), notes (optional max 500)
- `serviceOrgSchema` — organization_name (required, 1-300), organization_id (optional uuid), organization_type (optional), role_title (optional 1-200), start_year, end_year, is_current, is_primary (boolean)
- `teamSchema` — team_name (required 1-300), team_type_id (optional uuid), organization_id (optional uuid), position_on_team (optional 1-200), rtlt_position_slug (optional), start_year, end_year, is_current
- `qualificationSchema` — qualification_name (required 1-300), issuing_authority (optional 1-300), credential_number (optional 1-100), issued_date (optional), expiration_date (optional), is_active (boolean), category (optional enum: 'medical'|'technical'|'leadership'|'hazmat'|'communications'|'legal'|'fema_ics'|'state_cert'|'other'), verification_status (default 'self_reported')
- `languageSchema` — language (required 1-100), proficiency (required enum: 'native'|'fluent'|'conversational'|'basic')
- `affinitiesSchema` — array of uuid strings

Add to barrel export in `src/lib/validators/index.ts`.

---

## Step 4: Create Server Actions

Create `src/lib/actions/profile.ts` with `'use server'` directive. Use `createServerSupabaseClient()` from `src/lib/supabase/server.ts`.

**Actions to implement:**

- `getMyProfile()` — Single query for `users` row, then parallel queries for all 6 related tables (communities, service_orgs, teams, qualifications, languages, affinities with joined affinity details). Returns full `UserProfile`.
- `updateBasicInfo(data)` — Validates with `basicInfoSchema`. Updates users table. Sets `profile_updated_at = now()`. Revalidates `/dashboard/profile`.
- `updateServiceIdentity(data)` — Validates with `serviceIdentitySchema`. Updates users table. Sets `profile_updated_at = now()`.
- `addCommunity(data)` / `updateCommunity(id, data)` / `removeCommunity(id)` — CRUD on `user_communities`. After each mutation, do a no-op update on users to trigger completeness recalc: `UPDATE users SET profile_updated_at = now() WHERE id = auth.uid()`.
- `addServiceOrg(data)` / `updateServiceOrg(id, data)` / `removeServiceOrg(id)` — CRUD on `user_service_orgs`.
- `setPrimaryOrg(id)` — Transaction: unset all `is_primary` for this user, then set target row.
- `addTeam(data)` / `updateTeam(id, data)` / `removeTeam(id)` — CRUD on `user_teams`.
- `addQualification(data)` / `updateQualification(id, data)` / `removeQualification(id)` — CRUD on `user_qualifications`. Auto-set `is_active = false` if `expiration_date` is in the past.
- `addLanguage(data)` / `removeLanguage(id)` — Create/delete on `user_languages`.
- `updateAffinities(affinity_ids: string[])` — Transaction: delete all `user_affinities` for user, bulk insert new set. Trigger completeness recalc.

All mutations: validate with Zod, call `revalidatePath('/dashboard/profile')`.

---

## Step 5: Create Profile View Components

All components in `src/components/profile/`. Replace or extend any existing basic profile components.

**`ProfileHeader.tsx`** — Server component. Avatar (initials placeholder if no avatar_url), display name (preferred_name or first+last, fallback "Grey Sky Member"), location, membership badge, years of service badge ("Since 2008 · 18 years"), ProfileCompleteness ring.

**`ProfileCompleteness.tsx`** — Client component. SVG circular progress ring. Gold fill for progress, steel gray remainder. Percentage in center. Below ring: checklist of 8 sections with check/empty icons. At 100%: gold ring + "Profile Complete". Below 100%: "Next: [incomplete section] →" link.

Profile completeness sections and weights:
| Section | Weight | Complete when |
|---------|--------|---------------|
| Basic Info | 15 | first_name + last_name + location_state filled |
| Service Identity | 20 | primary_discipline + service_start_year filled |
| Service Statement | 10 | service_statement >= 50 chars |
| Communities | 15 | >= 1 current community |
| Organizations | 15 | >= 1 service org |
| Teams | 10 | >= 1 team |
| Qualifications | 10 | >= 1 qualification |
| Affinities | 5 | >= 3 affinities selected |

**`ServiceIdentity.tsx`** — Primary discipline (RTLT label from `src/lib/disciplines.ts`), secondary disciplines as tags, service start year with computed years, service statement as styled blockquote.

**`CommunitiesSection.tsx`** — Card list. Each: community name, state, relationship badge (home_base=navy, deployed_to=gold, assigned_to=steel, mutual_aid=green), year range, "Current" badge. Empty state: "You haven't added any communities yet. The places you've protected — they matter. Add them when you're ready."

**`OrganizationsSection.tsx`** — Card list. Primary org has gold star. Each: org name, type badge, role, years, current badge. Empty state: "The agencies and organizations that shaped your service. Add them here."

**`TeamsSection.tsx`** — Card list. Each: team name, team type, org if set, position, years, current badge. Empty state: "Your crews, task forces, and units. The teams that had your back."

**`QualificationsSection.tsx`** — Grouped by category. Each: name, issuing authority, dates, status badges (active=green, expired=red, self_reported=gray, document_linked=blue, staff_verified=green). Credential number masked: "····1234". Empty state: "Certifications, licenses, credentials — from any source. They all count."

**`LanguagesSection.tsx`** — Inline tag list: language + proficiency badge. Empty state: "Every language is a lifeline in a disaster."

**`AffinitiesSection.tsx`** — Three columns (stacked on mobile): Hazard Types, Functional Specialties, Sector Experience. Styled tags. Empty state: "What connects you to other responders? Select your areas of experience."

**`ProfileView.tsx`** — Assembles all sections. Each section has "Edit" pencil icon linking to `/dashboard/profile/edit#section-id`.

---

## Step 6: Create Profile Edit Components

All in `src/components/profile/edit/`.

**`ProfileEditForm.tsx`** — Client component. Multi-section vertical scroll with anchors. Each section saves independently. Toast on success. "← Back to Profile" link at top.

**`BasicInfoForm.tsx`** — Fields: first_name, last_name, preferred_name, phone, date_of_birth (date picker), location_city, location_state (US state dropdown), location_country (country dropdown, default USA). Header: "You" / "The basics. How you want to be known."

**`ServiceIdentityForm.tsx`** — Fields: primary_discipline (dropdown from `src/lib/disciplines.ts` — 17 curated entries), secondary_disciplines (multi-select checkboxes), service_start_year (number 1950-current), service_statement (textarea, 500 char counter). Header: "Your Service" / "What you do and how long you've been doing it. Every year counts."

**`CommunityEditor.tsx`** — List with inline edit/remove. "Add Community" opens inline form. Header: "Where You've Served" / "The places you've protected. The communities that know your name."

**`OrgEditor.tsx`** — List with inline edit/remove. is_primary radio (only one). Header: "Who You've Served With" / "The agencies, departments, and organizations that shaped your service."

**`TeamEditor.tsx`** — List with inline edit/remove. team_type_id dropdown from `rtlt_team_types`. Header: "Your Teams" / "The crews, task forces, and units you've been part of."

**`QualificationEditor.tsx`** — List with inline edit/remove. Category dropdown. Expiration date with visual expired indicator. Header: "What You Bring" / "Certifications, licenses, and credentials you hold — from any source."

**`LanguageEditor.tsx`** — Compact inline add/remove. Proficiency dropdown. Header: "Languages" / "Every language is a lifeline in a disaster."

**`AffinityPicker.tsx`** — Fetch all 37 affinities from `affinities` table. Grouped by category with checkboxes. Save replaces all. Header: "What Connects You" / "Select the hazards, specialties, and sectors that define your experience."

---

## Step 7: Update Dashboard Pages

Update `src/app/(dashboard)/dashboard/profile/page.tsx`:
- Server component. Calls `getMyProfile()`. Renders `ProfileView`.
- Page title: "My Service Profile"

Update `src/app/(dashboard)/dashboard/profile/edit/page.tsx`:
- Server component. Fetches profile data. Renders `ProfileEditForm` (client) with initial data as props.
- Page title: "Edit Profile"

---

## Step 8: Verify

- Run `npx supabase db reset` to apply all migrations including the new one
- Run `npm run build` — must pass with zero errors
- Verify profile view renders all sections with empty state copy
- Verify profile edit saves each section independently
- Verify completeness ring updates after saving sections
- Verify RLS prevents cross-user data access
- Verify `date_of_birth` does NOT appear on profile view page
- Verify `credential_number` displays masked on view
- Verify NO pronoun field exists anywhere

---

## Commit Message

```
feat: profile expansion — service identity, communities, orgs, teams, qualifications, languages, affinities, completeness engine (DOC-202)
```

---

*End of DOC-202 Expansion Build Prompt*
