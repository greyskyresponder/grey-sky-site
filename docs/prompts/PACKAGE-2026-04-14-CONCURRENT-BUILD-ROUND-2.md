# Grey Sky Portal — Concurrent Build Round 2

**Generated:** April 14, 2026
**Source:** Architecture Agent (Claude App)
**Purpose:** Five approved design docs with fully self-contained Claude Code prompts. All five are unblocked and can be built in parallel.

---

## Build Manifest

| # | Doc ID | Title | Priority | Touches DB? | Estimated Scope |
|---|--------|-------|----------|-------------|-----------------|
| 1 | GSR-DOC-202 | Member Profile Expansion | critical | Yes — migration + 5 new tables | ~35 files |
| 2 | GSR-DOC-205 | Sky Coins Economy | high | Yes — migration + 4 new tables, functions, seed | ~20 files |
| 3 | GSR-DOC-206 | Document Library | high | Yes — migration + storage buckets | ~18 files |
| 4 | GSR-DOC-102 | Organizations + Agencies Public Page | high | No — static content | ~5 files |
| 5 | GSR-DOC-900 | Security Hardening | critical | Yes — migration (audit hash chain) | ~12 files |

**Migration ordering:** If running all five migrations, apply in this order:
1. `20260414000001_user_profile_expansion.sql` (DOC-202)
2. `20260414000002_coin_economy.sql` (DOC-205)
3. `20260414000003_document_library.sql` (DOC-206)
4. `20260414000004_security_hardening.sql` (DOC-900)

DOC-102 has no migration.

**Cross-dependency note:** DOC-206 creates the `avatars` storage bucket that DOC-202 references for avatar upload. If DOC-202 builds first, it should use an initials placeholder for avatar (already spec'd). Avatar upload becomes functional when DOC-206 completes.

---

## Critical Rules (Apply to ALL builds)

- **Auth is Supabase Auth (GoTrue)** — NOT NextAuth.js
- **Hosting is Azure Static Web Apps** — NOT Vercel (no Vercel-specific features)
- **"Service" not "career"** — always
- **Privacy is sovereign** — responder owns their data
- **`npm run build` must pass with zero errors** before any commit
- **Pronouns field is PERMANENTLY REMOVED** — never add to any schema, type, form, or UI
- **ICS/NIMS/NQS/RTLT terminology** throughout
- **Dashboard = command post** — ICS-structured, not consumer SaaS
- **Brand:** Command Navy `#0A1628`, Signal Gold `#C5933A`, Ops White `#F5F5F5`, Inter font

---
---
---

# BUILD 1: GSR-DOC-202 — Member Profile Expansion

**Commit message:** `feat: member profile expansion — service history, qualifications, languages, completeness engine (DOC-202)`

## Context

You are adding the comprehensive member profile system to the Grey Sky Responder Society platform. The platform is a Next.js 16 app (App Router, React 19, TypeScript 5, Tailwind CSS 4) backed by Supabase (PostgreSQL 16 + PostGIS). Auth is Supabase Auth (GoTrue), NOT NextAuth.js.

The dashboard layout (DOC-201) is already built with sidebar (desktop) and bottom nav (mobile). Auth (DOC-200) is complete with registration, login, middleware role enforcement. The `users` table exists with core fields. Seed data (DOC-003) has been applied: 63 positions, 13 team types (in `rtlt_team_types`), 37 affinities (in `affinities`).

Brand tokens are CSS custom properties: `--gs-navy: #0A1628`, `--gs-gold: #C5933A`, `--gs-white: #F5F5F5`. Font is Inter.

A basic profile view and edit page may already exist at `src/app/(dashboard)/dashboard/profile/`. This build REPLACES those with the expanded multi-section profile.

**CRITICAL:** Do NOT include a `pronouns` field anywhere — not in the migration, not in types, not in forms, not in UI. This field is permanently removed from the platform.

## Step 1: Create Migration

Create `supabase/migrations/20260414000001_user_profile_expansion.sql`:

```sql
-- GSR-DOC-202: Member Profile Expansion
-- Adds profile fields to users table and creates structured service history tables
-- PRONOUNS FIELD IS PERMANENTLY EXCLUDED

-- ============================================================
-- 1. Expand users table
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

-- Drop pronouns column if it exists from any earlier migration
ALTER TABLE users DROP COLUMN IF EXISTS pronouns;

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
  document_id uuid,
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

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$ BEGIN
  CREATE TRIGGER trg_user_communities_updated_at BEFORE UPDATE ON user_communities
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TRIGGER trg_user_service_orgs_updated_at BEFORE UPDATE ON user_service_orgs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TRIGGER trg_user_teams_updated_at BEFORE UPDATE ON user_teams
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TRIGGER trg_user_qualifications_updated_at BEFORE UPDATE ON user_qualifications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- years_of_service_computed trigger
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
  CREATE TRIGGER trg_users_years_of_service BEFORE INSERT OR UPDATE OF service_start_year ON users
    FOR EACH ROW EXECUTE FUNCTION compute_years_of_service();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Profile completeness trigger
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

  -- Affinities (5): at least 3 affinities
  SELECT COUNT(*) INTO aff_count FROM user_affinities WHERE user_id = NEW.id;
  IF aff_count >= 3 THEN
    score := score + 5;
  END IF;

  NEW.profile_completeness = score;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$ BEGIN
  CREATE TRIGGER trg_users_profile_completeness BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION compute_profile_completeness();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================================
-- 8. RLS Policies
-- ============================================================

ALTER TABLE user_communities ENABLE ROW LEVEL SECURITY;
CREATE POLICY user_communities_select ON user_communities FOR SELECT
  USING (user_id = auth.uid() OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'platform_admin'));
CREATE POLICY user_communities_insert ON user_communities FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY user_communities_update ON user_communities FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY user_communities_delete ON user_communities FOR DELETE USING (user_id = auth.uid());

ALTER TABLE user_service_orgs ENABLE ROW LEVEL SECURITY;
CREATE POLICY user_service_orgs_select ON user_service_orgs FOR SELECT
  USING (user_id = auth.uid() OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'platform_admin'));
CREATE POLICY user_service_orgs_insert ON user_service_orgs FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY user_service_orgs_update ON user_service_orgs FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY user_service_orgs_delete ON user_service_orgs FOR DELETE USING (user_id = auth.uid());

ALTER TABLE user_teams ENABLE ROW LEVEL SECURITY;
CREATE POLICY user_teams_select ON user_teams FOR SELECT
  USING (user_id = auth.uid() OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'platform_admin'));
CREATE POLICY user_teams_insert ON user_teams FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY user_teams_update ON user_teams FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY user_teams_delete ON user_teams FOR DELETE USING (user_id = auth.uid());

ALTER TABLE user_qualifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY user_qualifications_select ON user_qualifications FOR SELECT
  USING (user_id = auth.uid() OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'platform_admin'));
CREATE POLICY user_qualifications_insert ON user_qualifications FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY user_qualifications_update ON user_qualifications FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY user_qualifications_delete ON user_qualifications FOR DELETE USING (user_id = auth.uid());

ALTER TABLE user_languages ENABLE ROW LEVEL SECURITY;
CREATE POLICY user_languages_select ON user_languages FOR SELECT
  USING (user_id = auth.uid() OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'platform_admin'));
CREATE POLICY user_languages_insert ON user_languages FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY user_languages_delete ON user_languages FOR DELETE USING (user_id = auth.uid());
```

## Step 2: TypeScript Types

Create `src/lib/types/profile.ts` with these interfaces (NO pronouns field anywhere):

```typescript
export interface UserProfile {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  preferred_name: string | null;
  phone: string | null;
  date_of_birth: string | null;
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
  credential_number: string | null;
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

## Step 3: Zod Validators

Create `src/lib/validators/profile.ts` with schemas for:
- `basicInfoSchema` — first_name, last_name, preferred_name, phone, location_city, location_state, location_country. **NO pronouns.**
- `serviceIdentitySchema` — primary_discipline, secondary_disciplines, service_start_year (int, 1950 to current year), service_statement (max 500 chars)
- `communitySchema` — community_name (required, max 200), state, country, relationship (required, enum), start_year, end_year, is_current, notes (max 500)
- `serviceOrgSchema` — organization_name (required, max 300), organization_id (optional uuid), organization_type, role_title, start_year, end_year, is_current, is_primary
- `teamSchema` — team_name (required, max 300), team_type_id (optional uuid), organization_id (optional uuid), position_on_team, rtlt_position_slug, start_year, end_year, is_current
- `qualificationSchema` — qualification_name (required, max 300), issuing_authority, credential_number, issued_date, expiration_date, is_active, category (enum), verification_status
- `languageSchema` — language (required, max 100), proficiency (required, enum)
- `affinitiesSchema` — array of uuid strings

All year fields: integer, min 1950, max current year. end_year >= start_year when both set.

## Step 4: Server Actions

Create `src/lib/actions/profile.ts` with `'use server'` directive:

- `getMyProfile()` — single users query + parallel queries for all 6 related tables. Returns full UserProfile.
- `updateBasicInfo(data)` — validates with basicInfoSchema, updates users table, sets profile_updated_at = now()
- `updateServiceIdentity(data)` — validates, updates users table
- `getCommunities()`, `addCommunity(data)`, `updateCommunity(id, data)`, `removeCommunity(id)`
- `getServiceOrgs()`, `addServiceOrg(data)`, `updateServiceOrg(id, data)`, `removeServiceOrg(id)`, `setPrimaryOrg(id)` — wraps in transaction: unset all is_primary, then set target
- `getTeams()`, `addTeam(data)`, `updateTeam(id, data)`, `removeTeam(id)`
- `getQualifications()`, `addQualification(data)`, `updateQualification(id, data)`, `removeQualification(id)`
- `getLanguages()`, `addLanguage(data)`, `removeLanguage(id)`
- `getAffinities()`, `updateAffinities(affinity_ids: string[])` — delete all, bulk insert, wrap in transaction

After any mutation on related tables, trigger completeness recompute via:
`UPDATE users SET profile_updated_at = now() WHERE id = auth.uid()`

All actions use `revalidatePath('/dashboard/profile')`.

## Step 5: Profile View Components

Create these at `src/components/profile/`:

- **ProfileHeader.tsx** — Server component. Avatar (initials placeholder if no avatar_url), display name (preferred_name or first+last), location, membership badge, years of service badge, ProfileCompleteness ring.
- **ProfileCompleteness.tsx** — Client component. SVG circular progress ring. Gold fill, steel gray remainder. Percentage in center. 8-section checklist below. At 100%: gold ring with checkmark, "Profile Complete". Below 100%: "Next: [incomplete section] →"
- **ServiceIdentity.tsx** — Primary discipline with RTLT label, secondary disciplines as tags, service start year with computed years, service statement blockquote.
- **CommunitiesSection.tsx** — Card list. Relationship badges (home_base=navy, deployed_to=gold, assigned_to=steel, mutual_aid=green). Empty: "You haven't added any communities yet. The places you've protected — they matter. Add them when you're ready."
- **OrganizationsSection.tsx** — Card list. Primary org gold star. Empty: "The agencies and organizations that shaped your service. Add them here."
- **TeamsSection.tsx** — Card list with team type from rtlt_team_types join. Empty: "Your crews, task forces, and units. The teams that had your back."
- **QualificationsSection.tsx** — Grouped by category. Status badges (active=green, expired=red, self_reported=gray, document_linked=blue, staff_verified=green). Credential number masked: "····1234". Empty: "Certifications, licenses, credentials — from any source. They all count."
- **LanguagesSection.tsx** — Inline tags with proficiency. Empty: "Every language is a lifeline in a disaster."
- **AffinitiesSection.tsx** — Three columns: Hazard Types, Functional Specialties, Sector Experience. Empty: "What connects you to other responders? Select your areas of experience."
- **ProfileView.tsx** — Assembles all sections. Each section has an "Edit" pencil button linking to `/dashboard/profile/edit#section-id`.

## Step 6: Profile Edit Components

Create at `src/components/profile/edit/`:

- **ProfileEditForm.tsx** — Client component. Multi-section accordion/scroll with anchors. Each section saves independently. Toast on save. Back button: "← Back to Profile".
- **BasicInfoForm.tsx** — Fields: first_name, last_name, preferred_name, phone, location_city, location_state (US state dropdown), location_country (default USA). **NO pronouns field.** Header: "You" / "The basics. How you want to be known."
- **ServiceIdentityForm.tsx** — primary_discipline (dropdown from `src/lib/disciplines.ts`), secondary_disciplines (multi-select), service_start_year (number, 1950-current), service_statement (textarea, max 500, char counter). Header: "Your Service"
- **CommunityEditor.tsx** — List + inline add/edit/remove. Dropdowns for relationship, state, country. Header: "Where You've Served"
- **OrgEditor.tsx** — List + inline add/edit/remove. is_primary radio (only one). Header: "Who You've Served With"
- **TeamEditor.tsx** — team_type_id dropdown from rtlt_team_types. Header: "Your Teams"
- **QualificationEditor.tsx** — Category dropdown. Date pickers for issued/expiration. Header: "What You Bring"
- **LanguageEditor.tsx** — Compact inline add. Proficiency dropdown. Header: "Languages"
- **AffinityPicker.tsx** — Fetch all 37 affinities, group by category, checkboxes. Set-based save. Header: "What Connects You"

## Step 7: Dashboard Pages

- **`src/app/(dashboard)/dashboard/profile/page.tsx`** — Server component. Calls getMyProfile(). Renders ProfileView. Title: "My Service Profile". Breadcrumb: Dashboard > Profile.
- **`src/app/(dashboard)/dashboard/profile/edit/page.tsx`** — Server component fetches data, renders ProfileEditForm (client) with initial data as props. Title: "Edit Profile". Breadcrumb: Dashboard > Profile > Edit.

## Step 8: Dashboard Nav Update

Add "Profile" to sidebar nav in `src/components/dashboard/`. Icon: user from lucide-react. Second item after Dashboard home. Link to `/dashboard/profile`.

## Step 9: Verify

- `npx supabase db reset` to apply migrations
- `npm run build` — zero errors
- Profile view renders with empty state copy for all sections
- Profile edit saves each section independently
- Completeness ring updates after saving
- RLS prevents cross-user access
- `date_of_birth` never appears on view page
- `credential_number` displays masked
- NO pronouns field anywhere in the UI or schema

---
---
---

# BUILD 2: GSR-DOC-205 — Sky Coins Economy

**Commit message:** `feat: Sky Coins economy — tables, functions, types, dashboard UI (DOC-205)`

## Context

You are building the Sky Coins internal currency system. Next.js 16 + Supabase. The existing `sky_points_ledger` table from DOC-002 migrations is being REPLACED by the new `coin_accounts` + `coin_transactions` architecture. The old table can remain — these new tables are additive.

Denomination: $1 USD = 10 Sky Coins. $100 annual membership = 1,000 Sky Coins.

## Step 1: Migration

Create `supabase/migrations/20260414000002_coin_economy.sql` with ALL of the following:

1. `coin_transaction_type` enum: membership_grant, purchase, spend, earn_validation, earn_evaluation, earn_qrb_review, refund, admin_adjustment, pending_transfer, freeze, unfreeze
2. `coin_accounts` table — id uuid PK, user_id uuid UNIQUE FK users, balance INTEGER >= 0, lifetime_earned, lifetime_spent, frozen boolean DEFAULT false, created_at, updated_at
3. `coin_transactions` table — append-only: id uuid PK, account_id FK coin_accounts, type coin_transaction_type, amount INTEGER, balance_after INTEGER, product_code TEXT, reference_id UUID, reference_type TEXT, description TEXT NOT NULL, metadata JSONB DEFAULT '{}', created_at, created_by UUID FK users
4. `coin_products` table — id uuid PK, code TEXT UNIQUE, name, description, tier INTEGER 1-5, cost_coins INTEGER DEFAULT 0, earn_coins INTEGER DEFAULT 0, category TEXT, is_active BOOLEAN DEFAULT true, requires_staff_action BOOLEAN DEFAULT false, metadata JSONB DEFAULT '{}', created_at, updated_at
5. `coin_pending_balances` table — id uuid PK, email TEXT, amount INTEGER > 0, source_type TEXT, source_id UUID, transferred BOOLEAN DEFAULT false, transferred_at, transferred_to UUID FK users, created_at
6. `rtlt_position_overrides` table — id uuid PK, rtlt_position_id UUID, certification_tier TEXT, credentialing_tier TEXT, reason TEXT NOT NULL, created_by UUID FK users, created_at
7. All indexes as specified in the DOC-205 spec
8. RLS: coin_accounts (user sees own, admin manages all), coin_transactions (user SELECT own account's, INSERT false for client — server only), coin_products (public SELECT where active), coin_pending_balances (no client access)
9. `spend_coins()` SECURITY DEFINER function — atomic debit with row lock, returns boolean
10. `credit_coins()` SECURITY DEFINER function — atomic credit with row lock, returns boolean
11. `transfer_pending_coins()` trigger function + AFTER INSERT trigger on public.users
12. Trigger to create `coin_accounts` row on `public.users` INSERT (extends or adds to existing auth sync)
13. Seed ALL coin_products from the full catalog:
    - Tier 1 (free): response_report(0), document_upload(0), historical_deployment(0)
    - Tier 2 (network): validation_request(cost:10, earn:5), evaluation_request(cost:15, earn:10)
    - Tier 3 (certification): certification_staff(4000), certification_command(5000), certification_staff_renewal(1600), certification_command_renewal(2000)
    - Tier 4 (credentialing): credential_standard(10000), credential_senior(20000), credential_command(30000), credential_standard_renewal(4000), credential_senior_renewal(8000), credential_command_renewal(12000), credential_appeal(5000)
    - Tier 5 (products): verified_report(50), print_certificate(25), verification_letter(75), history_export(25), profile_summary(50), affinity_report(25), digital_badge(0)

## Step 2: TypeScript Types

Replace `src/lib/types/economy.ts` with the full type definitions: CoinTransactionType, ProductCategory, CertificationTier, CredentialingTier, CoinAccount, CoinTransaction, CoinProduct, CoinPurchasePackage, CoinBalance, CoinLedgerEntry, PositionPricing. Update barrel export.

## Step 3: Zod Validators

Create `src/lib/validators/coins.ts`: SpendCoinsSchema, PurchaseCoinsSchema, AdminAdjustmentSchema, CoinHistoryQuerySchema (page, limit max 50, type filter).

## Step 4: Server Actions

Create `src/lib/coins/actions.ts`:
- `getBalance(userId)` → CoinBalance
- `getHistory(userId, page, limit, type?)` → { transactions, total }
- `spendCoins(userId, productCode, referenceId?, referenceType?, description?)` → { success, newBalance?, error? }
- `creditCoins(userId, amount, type, productCode?, referenceId?, description?)` → { success }
- `getProducts(category?)` → CoinProduct[]

## Step 5: Pricing Module

Create `src/lib/coins/pricing.ts`:
- `getPositionPricing(rtltPositionId)` → PositionPricing
- Check rtlt_position_overrides first, then derive from RTLT type level + resource category
- Types 1-2 command-track → cert 3B, cred 4B/4C. Types 3-4 → cert 3A, cred 4A.
- IC/Deputy IC/Agency Rep → cred 4C (3 QRB). Section Chiefs/Branch Directors Types 1-2 → cred 4B (2 QRB). All others → cred 4A (2 QRB).

## Step 6: Product Constants

Create `src/lib/coins/products.ts`:
- PURCHASE_PACKAGES array: 250/$25, 500/$50, 1000/$100, 2500/$250, 5000/$500
- COIN_EXCHANGE_RATE = 10, ANNUAL_MEMBERSHIP_COINS = 1000
- formatCoinAmount(), coinsToUsd(), usdToCoins()

## Step 7: Dashboard Components

- **CoinBadge** (`src/components/coins/CoinBadge.tsx`) — Small inline for sidebar. Balance + coin icon (circle with "SC"). Signal Gold. Click → /dashboard/coins.
- **CoinBalance** (`src/components/coins/CoinBalance.tsx`) — Large display: balance, lifetime earned, lifetime spent. Frozen state explanation if applicable. "Add Coins" button.
- **CoinLedger** (`src/components/coins/CoinLedger.tsx`) — Reverse-chronological list. Date, description, amount (green credit/red debit), balance_after. Type filter dropdown. 25/page. Empty: "No transactions yet. Your Sky Coins activity will appear here."
- **CoinPurchase** (`src/components/coins/CoinPurchase.tsx`) — Grid of packages. Each: coin amount, price, "Coming Soon" button (until DOC-207 Stripe). Note: "Sky Coins are non-refundable and non-transferable."
- **ProductCatalog** (`src/components/coins/ProductCatalog.tsx`) — Tabs by category. Each product: name, description, cost in coins, USD equivalent. Free → "Included with Membership" badge. Earn-back shows both.

## Step 8: Pages

- `/dashboard/coins` — Server component. Fetches balance + recent transactions. CoinBalance + CoinLedger + ProductCatalog link. Title: "Sky Coins".
- `/dashboard/coins/purchase` — CoinPurchase component. Title: "Add Sky Coins".

## Step 9: Dashboard Integration

- Add CoinBadge to Sidebar.tsx (below user info, above nav)
- Add CoinBadge to MobileNav.tsx (header area)
- Add "Sky Coins" link to dashboard nav (icon: coins/currency from lucide-react)
- Add coin balance card to StatusGrid.tsx

## Step 10: Verify

- `npm run build` — zero errors
- RLS: client cannot INSERT into coin_transactions
- spend_coins() returns false for insufficient balance
- spend_coins() returns false for frozen accounts
- credit_coins() correctly updates balance and lifetime_earned
- Product catalog seed includes ALL products

---
---
---

# BUILD 3: GSR-DOC-206 — Document Library

**Commit message:** `feat: document library — storage, upload, categorize, link, avatar (DOC-206)`

## Context

You are building the document management system. The `documents` table already exists in `supabase/migrations/20260409000003_core_tables.sql`. The `document_category` and `upload_status` enums exist in `20260409000002_enums.sql`. This build extends the existing schema and adds Supabase Storage buckets.

## Step 1: Migration

Create `supabase/migrations/20260414000003_document_library.sql`:

1. Extend `document_category` enum: ADD VALUE IF NOT EXISTS for 'ics_form', 'deployment_order', 'task_book', 'letter_of_recommendation', 'avatar'
2. Add columns to `documents`: `thumbnail_path TEXT`, `tags TEXT[] DEFAULT '{}'`
3. Add `original_filename TEXT` column if not present. For existing rows, copy from `filename`.
4. Add `storage_path TEXT` column if not present.
5. Create indexes: idx_documents_user, idx_documents_category, idx_documents_linked, idx_documents_upload_status
6. Create Supabase Storage buckets via SQL INSERT INTO storage.buckets:
   - `member-documents` (private, 25MB limit, PDF/JPEG/PNG/WebP/DOC/DOCX)
   - `avatars` (public, 5MB limit, JPEG/PNG/WebP)
7. Storage RLS policies:
   - member-documents: user manages own files (folder = user_id)
   - avatars: public read, owner write (folder = user_id)
8. Document table RLS: user sees own, admin sees all, user CRUDs own

## Step 2: TypeScript Types

Update `src/lib/types/documents.ts` with: DocumentCategory (including new values), UploadStatus, LinkedRecordType, Document interface (with thumbnailPath, tags, originalFilename, storagePath), DocumentUploadInput, DocumentListFilters, DocumentSummary. Update barrel export.

## Step 3: Zod Validators

Create/update `src/lib/validators/documents.ts`: DocumentUploadSchema, DocumentLinkSchema, DocumentListQuerySchema (limit max 50).

## Step 4: Storage Helpers

Create `src/lib/documents/storage.ts`:
- `uploadDocument(userId, file)` → { storagePath, filename } — uploads to member-documents/{userId}/{uuid}.{ext}
- `uploadAvatar(userId, file)` → { storagePath, publicUrl } — uploads to avatars/{userId}/{uuid}.{ext}
- `deleteStorageObject(bucket, path)` → void
- `getPublicUrl(bucket, path)` → string
- `getSignedUrl(bucket, path, expiresIn?)` → string (default 1 hour)

## Step 5: Server Actions

Create `src/lib/documents/actions.ts`:
- `uploadDocument(userId, formData)` → Document (validate, upload, create row)
- `listDocuments(userId, filters)` → { documents, total }
- `getDocument(userId, documentId)` → Document & { signedUrl }
- `linkDocument(userId, documentId, linkedRecordType, linkedRecordId)` → Document
- `unlinkDocument(userId, documentId)` → Document
- `deleteDocument(userId, documentId)` → void (storage + row, clear avatar_url if avatar)
- `uploadAvatar(userId, formData)` → publicUrl (upload, update users.avatar_url, create document row)
- `getDocumentSummary(userId)` → DocumentSummary

## Step 6: API Routes

- `src/app/api/documents/upload/route.ts` — POST multipart
- `src/app/api/documents/[id]/route.ts` — GET detail w/ signed URL, DELETE
- `src/app/api/documents/[id]/link/route.ts` — PUT link, DELETE unlink

## Step 7: Components

- **DocumentUpload** — Drag-and-drop zone + file picker. Category dropdown (required). Optional description. Client-side size (25MB) + type validation. Progress indicator.
- **DocumentList** — Grid/list toggle. Filter bar: category dropdown, search. Each doc: thumbnail/icon, filename, category badge, date, linked indicator. Click → detail.
- **DocumentCard** — Thumbnail or file-type icon, original filename (truncated), category badge (color-coded), file size, date, link indicator.
- **DocumentDetail** — Preview (inline image, PDF embed, download link for DOC/DOCX). Metadata. Linked record (clickable). Actions: Delete (confirm), Download, Edit description/category. AI extraction placeholder.
- **DocumentCategoryBadge** — Colored badges: certificates=green, licenses=blue, training=gold, ICS forms=navy, deployment orders=slate, task books=steel, letters=purple, other=gray.
- **AvatarUpload** — Circular preview (current or initials). Click for file picker (JPEG/PNG/WebP, 5MB). Upload progress. Immediate update on success.

## Step 8: Pages

- `/dashboard/documents` — Server component. DocumentUpload (collapsed, expand with button) + DocumentList. Title: "Documents".
- `/dashboard/documents/[id]` — Server component. DocumentDetail. 404 if not found or not owned.

## Step 9: Dashboard Integration

- Add "Documents" link to sidebar (icon: file from lucide-react) and mobile nav
- Add document count to StatusGrid if appropriate

## Step 10: Verify

- `npm run build` — zero errors
- Upload PDF → appears in list
- Upload image → thumbnail/preview works
- Link document → link appears
- Delete → storage object AND row removed
- Avatar upload → users.avatar_url updated, image displays
- RLS: user cannot access another user's documents

---
---
---

# BUILD 4: GSR-DOC-102 — Organizations + Agencies Public Page

**Commit message:** `feat: organizations + agencies public page — service lanes, SRT-CAP process, FDEM reference (DOC-102)`

## Context

You are building a static public marketing page. No database, no auth. This is the sales page for agency decision-makers explaining Grey Sky's two service lanes: individual member sponsorship and SRT-CAP team credentialing.

The existing public site has: homepage with 17-discipline grid, /about, /story, /community, /membership, /teams, /positions, /standards, /join. Layout at `src/app/(public)/layout.tsx` with Header and Footer. Brand: Command Navy #0A1628, Signal Gold #C5933A, Ops White #F5F5F5. Font: Inter. The 13 SRT disciplines are defined in `src/lib/disciplines.ts`.

## Step 1: Page Component

Create `src/app/(public)/organizations/page.tsx`:
- Server component
- Metadata: { title: 'For Organizations + Agencies | Grey Sky Responder Society', description: 'Sponsor your responders and credential your specialty response teams with Grey Sky.' }
- Six sections:

**1. Hero:** "Your Teams. Verified Ready." + subhead about Grey Sky partnering with agencies for credentialing and sponsorship. Command Navy background.

**2. Two Service Lanes** (side by side, stack mobile):
- Lane A — "Individual Member Sponsorship": $100/year per member, consent-based visibility, RTLT positions, readiness dashboards, bulk sponsorship
- Lane B — "Specialty Response Team Assessment + Credentialing": SRT-CAP methodology, 11 operational areas, RTLT typing, currently under FL FDEM contract

**3. SRT-CAP Process Flow** (6 steps, horizontal desktop, vertical mobile):
Contract → Self-Assessment → Onsite Assessment → Field Report → Final Report → Credentialing

**4. 13 SRT Disciplines Grid** (3 cols lg, 2 md, 1 sm). Note below: "Grey Sky supports credentialing for ALL team types defined in the FEMA RTLT — not limited to the 13 Florida SRT disciplines listed above."

**5. Reference Client** — Full-width navy band: "Currently delivering statewide SRT-CAP assessments across 13 specialty response team disciplines under contract with the Florida Division of Emergency Management." Placeholder numbers.

**6. CTA Section** — Two buttons:
- "Start Sponsoring Your Team" → mailto:info@greysky.org?subject=Organization%20Sponsorship%20Inquiry
- "Schedule a Readiness Conversation" → mailto:info@greysky.org?subject=Team%20Credentialing%20Inquiry

## Step 2: Components

- **ServiceLane** (`src/components/marketing/ServiceLane.tsx`) — Props: title, headline, body, points[], ctaText, ctaHref, variant ('primary'|'secondary'). Primary=navy bg/white text, secondary=white bg/navy text/gold border.
- **ReferenceClient** (`src/components/marketing/ReferenceClient.tsx`) — Full-width navy band, gold border accent, centered text.
- **AgencyCtaSection** (`src/components/marketing/AgencyCtaSection.tsx`) — Two CTA buttons. Primary: gold bg/navy text. Secondary: outline/navy border.

## Step 3: Process Flow

Build SRT-CAP process as horizontal step sequence (flexbox/grid). 6 numbered circles + titles + descriptions, connected by lines. Signal Gold numbers, Navy text. Vertical on mobile.

## Step 4: Navigation Update

- Add "For Agencies" to Header nav (after Community or before Join). Links to /organizations.
- Add "For Agencies" to Footer nav.

## Step 5: Verify

- `npm run build` — zero errors
- /organizations renders all six sections
- Responsive across mobile/tablet/desktop
- Header and Footer include "For Agencies"
- mailto links work with correct subjects
- Language: "service" not "career", "readiness" not "compliance", "assessment" not "audit"
- No pricing shown for team credentialing

---
---
---

# BUILD 5: GSR-DOC-900 — Security Hardening

**Commit message:** `feat: security hardening — MFA, CSP, CORS, rate limiting, audit hash chain (DOC-900)`

## Context

You are adding security hardening to the Grey Sky portal. Next.js 16 + Supabase. Existing middleware at `src/middleware.ts` handles route protection and role enforcement. MFA placeholder toggle exists at `src/components/auth/mfa-toggle.tsx`. Audit log table exists with append-only trigger from DOC-002.

Nation-state threat model. This platform holds PII, legal attestations, deployment histories, and credentialing data for professionals who deploy to national-security-level incidents.

## Step 1: Migration

Create `supabase/migrations/20260414000004_security_hardening.sql`:

1. Add `previous_hash TEXT` and `entry_hash TEXT` columns to `audit_log`
2. Create hash chain function:
```sql
CREATE OR REPLACE FUNCTION compute_audit_hash()
RETURNS TRIGGER AS $$
DECLARE
  v_previous_hash TEXT;
BEGIN
  SELECT entry_hash INTO v_previous_hash
  FROM audit_log ORDER BY created_at DESC, id DESC LIMIT 1;
  IF v_previous_hash IS NULL THEN v_previous_hash := 'GENESIS'; END IF;
  NEW.previous_hash := v_previous_hash;
  NEW.entry_hash := encode(
    sha256(convert_to(
      v_previous_hash || '|' ||
      COALESCE(NEW.actor_id::text, 'system') || '|' ||
      NEW.action || '|' ||
      COALESCE(NEW.entity_type, '') || '|' ||
      COALESCE(NEW.entity_id::text, '') || '|' ||
      NEW.created_at::text, 'UTF8'
    )), 'hex');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```
3. Create trigger `audit_log_hash_chain` BEFORE INSERT on audit_log
4. Create index `idx_audit_log_security ON audit_log(action) WHERE action = 'security_anomaly'`

## Step 2: Security Headers

Create `src/lib/security/headers.ts`:
- `getSecurityHeaders()` returning: X-Content-Type-Options: nosniff, X-Frame-Options: DENY, X-XSS-Protection: 0, Referrer-Policy: strict-origin-when-cross-origin, Permissions-Policy: camera=(), microphone=(), geolocation=(), Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
- `getCspHeader(reportOnly: boolean)` — CSP with self for most, unsafe-inline for script/style (Next.js), Supabase + Stripe domains for connect-src, fonts.gstatic.com for fonts, none for frame/object
- Export `REPORT_ONLY = true` (flip to false after validation)

## Step 3: Rate Limiter

Create `src/lib/security/rate-limiter.ts`:
- In-memory token bucket with IP + user ID composite key
- RateLimiter class with check(key, limit) → { allowed, retryAfter? }
- Stale entry cleanup every 5 min
- Limits: auth/login 5/15min, auth/register 3/hr, auth/reset 3/hr, api/default 100/min, api/upload 10/min, api/coins/spend 20/min, public/verify 30/min, public/validate 10/min
- 429 response with Retry-After header. No remaining-attempts leak.

## Step 4: Input Sanitization

Create `src/lib/security/sanitize.ts`:
- `sanitizeTextInput(input)` — strip HTML tags, javascript: URIs, event handlers
- `sanitizeFilename(filename)` — allow only [a-zA-Z0-9._-], no path traversal, max 255 chars
- `sanitizeObject(obj)` — recursively sanitize all string values

## Step 5: Anomaly Detection

Create `src/lib/security/anomaly.ts`:
- AnomalyType: rapid_login_failures, unusual_location, rapid_coin_spend, bulk_document_download, validation_flood, admin_action_outside_hours, credential_enumeration
- `logAnomaly(type, context, actorId?)` — writes to audit_log with action='security_anomaly'
- `checkLoginAnomaly(email, ip)` → AnomalyType | null
- `checkCoinAnomaly(userId)` → AnomalyType | null
- In-memory recent event tracking

## Step 6: Middleware Update

Update `src/middleware.ts` — order matters:
1. Security headers on ALL responses
2. CSP header on ALL responses
3. CORS on API routes — reject non-allowed origins (greysky.dev, greyskyresponder.net) with 403
4. Rate limiting on auth + API routes
5. Existing session validation (unchanged)
6. Existing role enforcement (unchanged)
7. MFA challenge check for sensitive routes (if user has MFA enrolled)

Allowed CORS origins from env: NEXT_PUBLIC_SITE_URL, NEXT_PUBLIC_VERIFICATION_URL. No wildcard. Credentials: true. Methods: GET, POST, PUT, DELETE, OPTIONS. Max-Age: 86400.

## Step 7: MFA Components

Install `qrcode.react` or equivalent for QR code rendering.

- **MfaEnroll** (`src/components/auth/MfaEnroll.tsx`) — calls `supabase.auth.mfa.enroll({ factorType: 'totp' })`. Shows QR code. 6-digit input. On success: display 10 backup codes, download as text file.
- **MfaChallenge** (`src/components/auth/MfaChallenge.tsx`) — 6-digit input. "Use a backup code" toggle. Calls challenge() then verify().
- **MfaSettings** (`src/components/auth/MfaSettings.tsx`) — Status display. "Enable Two-Factor Authentication" → MfaEnroll. If enabled: "Disable" (requires TOTP). Regenerate backup codes (requires TOTP).

Update `src/components/auth/mfa-toggle.tsx` — replace placeholder with real enrollment trigger or navigate to `/dashboard/settings/security`.

## Step 8: Login Flow Update

Update `src/app/(auth)/login/page.tsx`:
- After successful email/password, check `supabase.auth.mfa.getAuthenticatorAssuranceLevel()`
- If aal1 and nextLevel is aal2 → show MfaChallenge
- On MFA success → redirect to dashboard
- On failure → show error, allow retry

## Step 9: Security Settings Page

Create `src/app/(dashboard)/dashboard/settings/security/page.tsx`:
- Server component, auth-gated
- MfaSettings component
- "Sign out all devices" button
- Title: "Security Settings"

## Step 10: Supabase Client Update

Update `src/lib/supabase/client.ts`: add `flowType: 'pkce'` to auth config. Verify autoRefreshToken and persistSession are set.

## Step 11: Verify

- `npm run build` — zero errors
- Security headers present on all responses (browser dev tools)
- CSP header present (report-only)
- Rate limiting triggers on repeated login attempts
- MFA enrollment: QR code → verify → backup codes
- MFA challenge on login for enrolled users
- CORS rejects non-allowed origins
- Audit log hash chain: insert entries, verify sequential hashes
- Auth error messages are generic (no user enumeration)

---

## End of Concurrent Build Round 2
