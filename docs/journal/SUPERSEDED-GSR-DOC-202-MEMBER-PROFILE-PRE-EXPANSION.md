---
doc_id: GSR-DOC-202
title: "Member Profile — View + Edit"
phase: 2
status: planned-expansion
blocks_on:
  - GSR-DOC-201
  - GSR-DOC-003
priority: critical
author: Architecture Agent (Claude App)
created: 2026-04-11
updated: 2026-04-11
resolves: OD-10
notes: >
  OD-10 RESOLVED: Member profiles are verification-only. No public directory,
  no browsable roster. Verification portal (DOC-502) pulls scoped data.
  Profile visible only to the member and GSRS staff.
---

# GSR-DOC-202: Member Profile — View + Edit

| Field | Value |
|-------|-------|
| Phase | 2 |
| Status | draft |
| Blocks on | GSR-DOC-201 (Dashboard Layout), GSR-DOC-003 (Seed Data) |
| Priority | critical |

---

## Purpose

The member profile is the responder's service identity — the single place where who they are, what they do, where they've served, and who they've served with comes together. It is not a résumé. It is not a LinkedIn page. It is a structured record of a life in service, designed to generate the affinities that connect Grey Sky members to each other and to the communities they protect.

**This doc builds:**
- Profile view page (dashboard)
- Profile edit page (dashboard, multi-section)
- New database tables for structured service data (communities, organizations, teams, positions held, languages, credentials)
- Server actions for profile CRUD
- TypeScript types and Zod validators
- Progressive collection UX — profile grows over time, never demands everything at once

**What it does NOT build:**
- Public profile pages (there are none — OD-10 resolved: verification-only)
- Verification portal (DOC-502)
- Avatar/photo upload (deferred to DOC-206 Document Library — uses the same storage abstraction)
- Deployment records (DOC-203 — separate doc, but profile links to them)

**Why it matters:**
Every structured entry a member adds to their profile — a community, an organization, a team, a position — becomes an affinity connection. Grey Sky doesn't ask members to "tag their interests." Grey Sky asks them to tell the truth about their service, and the platform finds the connections. The profile is the affinity engine's primary intake.

---

## Data Entities

### Existing Tables Modified

#### `users` — Add Profile Columns

The `users` table (DOC-002) already has: `id`, `email`, `first_name`, `last_name`, `phone`, `location_city`, `location_state`, `location_country`, `bio`, `avatar_url`, `mfa_enabled`, `membership_status`, `membership_paid_by`, `membership_expires_at`, `status`, `role`, `created_at`, `updated_at`.

**Add these columns:**

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `preferred_name` | `varchar(100)` | YES | NULL | What they want to be called. Many responders go by callsigns or shortened names. |
| `date_of_birth` | `date` | YES | NULL | For credential verification. Never displayed publicly. |
| `service_start_year` | `integer` | YES | NULL | "How long have you been doing this work?" Year they entered emergency management/public safety. |
| `primary_discipline` | `varchar(100)` | YES | NULL | Their primary RTLT discipline slug. What they'd say first if asked "what do you do?" |
| `secondary_disciplines` | `text[]` | YES | NULL | Additional RTLT discipline slugs. Many responders cross disciplines. |
| `service_statement` | `text` | YES | NULL | "In your own words, what does your service mean to you?" 500-char guided narrative. |
| `years_of_service_computed` | `integer` | YES | NULL | Derived from `service_start_year`. Computed by trigger on UPDATE. |
| `profile_completeness` | `integer` | NO | 0 | 0-100 score. Computed by trigger based on filled sections. Drives progressive collection nudges. |
| `profile_updated_at` | `timestamptz` | YES | NULL | Last time the member actively edited their profile (not system updates). |

### New Tables

#### `user_communities` — Where You've Served

Communities are the places responders protect. A firefighter in Miami-Dade who deployed to the Panhandle after Michael has served two communities. This table captures that relationship and generates geographic affinity connections.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | `uuid` | NO | `gen_random_uuid()` | Primary key |
| `user_id` | `uuid` | NO | — | FK → `users.id` ON DELETE CASCADE |
| `community_name` | `varchar(200)` | NO | — | City, county, region, or tribal nation name |
| `state` | `varchar(2)` | YES | NULL | US state abbreviation (NULL for international) |
| `country` | `varchar(3)` | NO | `'USA'` | ISO 3166-1 alpha-3 |
| `relationship` | `varchar(50)` | NO | — | Enum-like: `home_base`, `deployed_to`, `assigned_to`, `mutual_aid` |
| `start_year` | `integer` | YES | NULL | When this community relationship began |
| `end_year` | `integer` | YES | NULL | NULL = still active |
| `is_current` | `boolean` | NO | `false` | Currently based or assigned here |
| `notes` | `varchar(500)` | YES | NULL | Brief context: "Deployed for Hurricane Michael recovery" |
| `created_at` | `timestamptz` | NO | `now()` | — |
| `updated_at` | `timestamptz` | NO | `now()` | — |

Indexes: `user_id`, `state`, `(user_id, is_current)`.

#### `user_service_orgs` — Who You've Served With

Organizations the member has been part of — fire departments, sheriff's offices, state agencies, NGOs, private sector teams. This is separate from `user_organizations` (which tracks active platform sponsorship relationships). `user_service_orgs` is the member's self-reported service history.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | `uuid` | NO | `gen_random_uuid()` | Primary key |
| `user_id` | `uuid` | NO | — | FK → `users.id` ON DELETE CASCADE |
| `organization_id` | `uuid` | YES | NULL | FK → `organizations.id` if org exists in platform. NULL for free-text orgs not yet in system. |
| `organization_name` | `varchar(300)` | NO | — | Display name. If `organization_id` is set, denormalized from `organizations.name`. |
| `organization_type` | `varchar(50)` | YES | NULL | Same enum as `organizations.type`: `fire_department`, `sheriff`, `state_agency`, etc. |
| `role_title` | `varchar(200)` | YES | NULL | Their title/role at this org |
| `start_year` | `integer` | YES | NULL | — |
| `end_year` | `integer` | YES | NULL | NULL = current |
| `is_current` | `boolean` | NO | `false` | Currently active with this org |
| `is_primary` | `boolean` | NO | `false` | Their primary/home agency. Only one should be true per user. |
| `created_at` | `timestamptz` | NO | `now()` | — |
| `updated_at` | `timestamptz` | NO | `now()` | — |

Indexes: `user_id`, `organization_id`, `(user_id, is_current)`, `(user_id, is_primary)`.

**Constraint:** Application-level enforcement: only one `is_primary = true` per `user_id`. On setting a new primary, unset the previous one in the same transaction.

#### `user_teams` — Teams You've Been Part Of

Specific teams the member has served on — Task Force 2, HazMat Team 7, Type 1 IMT. Connects to RTLT team types for affinity matching. This is the member's record of team service; it is separate from `tc_team_members` (which tracks active team credentialing engagements).

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | `uuid` | NO | `gen_random_uuid()` | Primary key |
| `user_id` | `uuid` | NO | — | FK → `users.id` ON DELETE CASCADE |
| `team_name` | `varchar(300)` | NO | — | "Florida Task Force 2", "Metro-Dade HazMat", etc. |
| `team_type_id` | `uuid` | YES | NULL | FK → `rtlt_team_types.id`. Links to RTLT taxonomy for affinity. |
| `organization_id` | `uuid` | YES | NULL | FK → `organizations.id`. The org this team belongs to. |
| `position_on_team` | `varchar(200)` | YES | NULL | "Team Leader", "Rescue Specialist", "Communications Officer" |
| `rtlt_position_slug` | `varchar(200)` | YES | NULL | RTLT position slug if applicable. Links to positions reference data. |
| `start_year` | `integer` | YES | NULL | — |
| `end_year` | `integer` | YES | NULL | NULL = current |
| `is_current` | `boolean` | NO | `false` | Currently on this team |
| `created_at` | `timestamptz` | NO | `now()` | — |
| `updated_at` | `timestamptz` | NO | `now()` | — |

Indexes: `user_id`, `team_type_id`, `organization_id`, `(user_id, is_current)`.

#### `user_qualifications` — What You Bring

Qualifications, certifications, and licenses the member holds — outside of Grey Sky credentials. This is the "bring your own credentials" section. EMT-P, CDL, HAM license, FEMA certs, state-specific certifications. These are self-reported and unverified until linked to documents (DOC-206).

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | `uuid` | NO | `gen_random_uuid()` | Primary key |
| `user_id` | `uuid` | NO | — | FK → `users.id` ON DELETE CASCADE |
| `qualification_name` | `varchar(300)` | NO | — | "EMT-Paramedic", "CDL Class A", "FEMA IS-700", "HAM Radio General" |
| `issuing_authority` | `varchar(300)` | YES | NULL | "National Registry of EMTs", "Florida BFST", "FEMA EMI" |
| `credential_number` | `varchar(100)` | YES | NULL | License/cert number. Encrypted at rest (DOC-907). |
| `issued_date` | `date` | YES | NULL | — |
| `expiration_date` | `date` | YES | NULL | NULL = no expiration |
| `is_active` | `boolean` | NO | `true` | Manually or auto-set based on expiration |
| `document_id` | `uuid` | YES | NULL | FK → `documents.id`. Link to uploaded proof (DOC-206). |
| `verification_status` | `varchar(20)` | NO | `'self_reported'` | `self_reported`, `document_linked`, `staff_verified` |
| `category` | `varchar(50)` | YES | NULL | Grouping: `medical`, `technical`, `leadership`, `hazmat`, `communications`, `legal`, `fema_ics`, `state_cert`, `other` |
| `created_at` | `timestamptz` | NO | `now()` | — |
| `updated_at` | `timestamptz` | NO | `now()` | — |

Indexes: `user_id`, `(user_id, is_active)`, `category`.

#### `user_languages` — Languages Spoken

Disasters don't respect language barriers. Multilingual responders are force multipliers. This data also generates affinity connections.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | `uuid` | NO | `gen_random_uuid()` | Primary key |
| `user_id` | `uuid` | NO | — | FK → `users.id` ON DELETE CASCADE |
| `language` | `varchar(100)` | NO | — | "English", "Spanish", "Haitian Creole", "ASL" |
| `proficiency` | `varchar(20)` | NO | `'conversational'` | `native`, `fluent`, `conversational`, `basic` |
| `created_at` | `timestamptz` | NO | `now()` | — |

Indexes: `user_id`.
Unique constraint: `(user_id, language)`.

### Existing Junction Table: `user_affinities`

Already exists (DOC-002). The profile edit UI lets members select from the seeded affinities (37 entries from DOC-003: hazard types, functional specialties, sector experience). The profile view displays them grouped by category.

### TypeScript Types

```typescript
// src/lib/types/profile.ts

export interface UserProfile {
  // From users table
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  preferred_name: string | null;
  phone: string | null;
  date_of_birth: string | null; // ISO date string — never exposed outside profile edit
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

  // Related data (loaded separately)
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
  team_type_name?: string; // Joined from rtlt_team_types
  organization_id: string | null;
  organization_name?: string; // Joined from organizations
  position_on_team: string | null;
  rtlt_position_slug: string | null;
  rtlt_position_title?: string; // Joined from positions reference
  start_year: number | null;
  end_year: number | null;
  is_current: boolean;
}

export interface UserQualification {
  id: string;
  qualification_name: string;
  issuing_authority: string | null;
  credential_number: string | null; // Masked in display: "****1234"
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

// Profile completeness weights
export interface ProfileSection {
  key: string;
  label: string;
  weight: number;
  complete: boolean;
}
```

---

## Structure

### Migration File

```
supabase/migrations/20260411000002_user_profile_expansion.sql
```

### Routes

```
src/app/(dashboard)/dashboard/profile/page.tsx          — Profile view (read-only display)
src/app/(dashboard)/dashboard/profile/edit/page.tsx     — Profile edit (multi-section form)
```

### Components

```
src/components/profile/ProfileView.tsx                  — Full profile display, organized by section
src/components/profile/ProfileHeader.tsx                — Name, avatar, location, membership badge, completeness ring
src/components/profile/ProfileCompleteness.tsx           — Visual progress ring with section checklist
src/components/profile/ServiceIdentity.tsx               — Discipline, service years, service statement
src/components/profile/CommunitiesSection.tsx             — "Where You've Served" — community list
src/components/profile/OrganizationsSection.tsx           — "Who You've Served With" — org history
src/components/profile/TeamsSection.tsx                   — "Teams You've Been Part Of" — team list
src/components/profile/QualificationsSection.tsx          — "What You Bring" — certs and credentials
src/components/profile/LanguagesSection.tsx               — Languages spoken
src/components/profile/AffinitiesSection.tsx              — Affinity tags grouped by category

src/components/profile/edit/ProfileEditForm.tsx           — Multi-section edit container with save-per-section
src/components/profile/edit/BasicInfoForm.tsx             — Name, contact, location
src/components/profile/edit/ServiceIdentityForm.tsx       — Discipline, start year, service statement
src/components/profile/edit/CommunityEditor.tsx           — Add/edit/remove communities
src/components/profile/edit/OrgEditor.tsx                 — Add/edit/remove service organizations
src/components/profile/edit/TeamEditor.tsx                — Add/edit/remove team memberships
src/components/profile/edit/QualificationEditor.tsx       — Add/edit/remove qualifications
src/components/profile/edit/LanguageEditor.tsx            — Add/edit/remove languages
src/components/profile/edit/AffinityPicker.tsx            — Multi-select affinity tags from seed data
```

### Server Actions

```
src/lib/actions/profile.ts
  - getMyProfile()                                        — Full profile with all related data
  - updateBasicInfo(data)                                  — Users table core fields
  - updateServiceIdentity(data)                            — Discipline, start year, service statement

  - getCommunities()                                       — User's communities
  - addCommunity(data)                                     — Create
  - updateCommunity(id, data)                              — Edit
  - removeCommunity(id)                                    — Delete

  - getServiceOrgs()                                       — User's service organizations
  - addServiceOrg(data)                                    — Create
  - updateServiceOrg(id, data)                             — Edit
  - removeServiceOrg(id)                                   — Delete
  - setPrimaryOrg(id)                                      — Set is_primary (unsets others)

  - getTeams()                                             — User's teams
  - addTeam(data)                                          — Create
  - updateTeam(id, data)                                   — Edit
  - removeTeam(id)                                         — Delete

  - getQualifications()                                    — User's qualifications
  - addQualification(data)                                 — Create
  - updateQualification(id, data)                          — Edit
  - removeQualification(id)                                — Delete

  - getLanguages()                                         — User's languages
  - addLanguage(data)                                      — Create
  - removeLanguage(id)                                     — Delete

  - getAffinities()                                        — User's selected affinities
  - updateAffinities(affinity_ids: string[])               — Replace all (set-based, not incremental)
```

### Types & Validators

```
src/lib/types/profile.ts                                — TypeScript interfaces (defined above)
src/lib/validators/profile.ts                           — Zod schemas for all profile mutations
```

---

## Business Rules

### Profile Completeness Algorithm

Profile completeness drives progressive collection nudges on the dashboard. Each section has a weight. The score is the sum of weights for completed sections, out of 100.

| Section | Weight | Complete When |
|---------|--------|---------------|
| Basic Info | 15 | `first_name` AND `last_name` AND `location_state` are set |
| Service Identity | 20 | `primary_discipline` AND `service_start_year` are set |
| Service Statement | 10 | `service_statement` is set and ≥ 50 characters |
| Communities | 15 | At least 1 community with `is_current = true` |
| Organizations | 15 | At least 1 service org entry |
| Teams | 10 | At least 1 team entry |
| Qualifications | 10 | At least 1 qualification entry |
| Affinities | 5 | At least 3 affinities selected |

Trigger on `users` table computes `profile_completeness` on every UPDATE by querying related tables. Stored as integer 0-100 on the `users` row for dashboard display without joins.

### Progressive Collection

- **Registration (DOC-200):** Only email and password. No profile fields required.
- **First dashboard visit:** Welcome bar shows "Complete your profile" with completeness ring at 0%. Quick action card: "Tell us about yourself" → links to profile edit, auto-scrolls to Basic Info.
- **After Basic Info saved:** Completeness updates. Next nudge: "What kind of work do you do?" → Service Identity section.
- **After 3+ sections:** Nudge shifts to affinity-aware: "You haven't told us about your teams yet. Members who add their teams find more connections."
- **At 100%:** Completeness ring shows gold checkmark. No more nudges. Dashboard welcome message shifts to service-forward: "Your profile is complete. Your service record is ready."

### Affinity Generation (Implicit)

The profile does NOT have an "affinities" intake beyond the explicit affinity picker. Instead, affinity connections are generated implicitly from structured data:

- **Community → Geographic affinity:** Member served in Miami-Dade → connected to all other members who served in Miami-Dade.
- **Organization → Organizational affinity:** Member served with FL Task Force 2 → connected to all other TF2 members.
- **Team type → Discipline affinity:** Member was on a HazMat team → connected to all HazMat-affiliated members.
- **Incident (via DOC-203/204):** Member deployed to Hurricane Milton → connected to all other Milton responders.

These implicit connections are NOT stored in `user_affinities`. They are computed at query time or by background jobs (Phase 3, ATLAS). The explicit `user_affinities` table is for the member's self-selected interests from the controlled vocabulary.

### Data Ownership & Privacy

- **Only the member can edit their own profile.** RLS enforces `user_id = auth.uid()` on all profile tables.
- **Staff (platform_admin) can VIEW any profile** for support and verification purposes. They cannot EDIT member profiles.
- **No public profile page.** There is no `/profile/:userId` public route. OD-10 resolved.
- **Verification portal (DOC-502)** will pull a scoped subset: name, credential status, verification tier. Designed in a separate doc.
- **Organization dashboard (DOC-610)** will show only: name, role title, certification status for sponsored disciplines. Consent-based. Does NOT query these profile tables directly — uses scoped views.

### Validation Rules

- `first_name`, `last_name`: 1-100 chars, no special characters beyond hyphens and apostrophes.
- `preferred_name`: 1-100 chars, same constraints.
- `service_start_year`: 1950 to current year. Cannot be in the future.
- `service_statement`: max 500 chars. No minimum for saving; completeness requires ≥ 50.
- `community_name`: 1-200 chars.
- `organization_name`: 1-300 chars.
- `team_name`: 1-300 chars.
- `qualification_name`: 1-300 chars.
- `credential_number`: 1-100 chars. Stored encrypted (DOC-907 scope, not this doc). Displayed masked: last 4 chars visible.
- `language`: 1-100 chars.
- `start_year` / `end_year` on all tables: 1950 to current year. `end_year` >= `start_year` if both set.
- A user may have at most 50 communities, 30 service orgs, 30 teams, 100 qualifications, 20 languages. Enforced at application layer.

---

## Copy Direction

### Section Headers & Prompts (Profile Edit)

The profile edit form uses section headers that speak to the member's identity, not database fields. Each section includes a brief prompt that invites, not demands.

| Section | Header | Prompt |
|---------|--------|--------|
| Basic Info | **You** | "The basics. How you want to be known." |
| Service Identity | **Your Service** | "What you do and how long you've been doing it. Every year counts." |
| Service Statement | **In Your Own Words** | "What does this work mean to you? There's no wrong answer." |
| Communities | **Where You've Served** | "The places you've protected. The communities that know your name." |
| Organizations | **Who You've Served With** | "The agencies, departments, and organizations that shaped your service." |
| Teams | **Your Teams** | "The crews, task forces, and units you've been part of." |
| Qualifications | **What You Bring** | "Certifications, licenses, and credentials you hold — from any source." |
| Languages | **Languages** | "Every language is a lifeline in a disaster." |
| Affinities | **What Connects You** | "Select the hazards, specialties, and sectors that define your experience." |

### Tone Rules

- Never say "career" — say "service" or "the work."
- Never say "resume" or "CV" — this is a "service record" or "service identity."
- Never say "skills" generically — say "qualifications" or "what you bring."
- The profile is not a form to fill out. It is an invitation to be recognized.
- Empty sections show encouragement, not warnings: "You haven't added any teams yet. When you're ready, this is where your crews live."
- The completeness ring is motivational, not punitive. It never says "incomplete" — it says "keep going" or shows the percentage with "Your profile is growing."

---

## Acceptance Criteria

1. Migration `20260411000002_user_profile_expansion.sql` adds all new columns to `users` and creates tables `user_communities`, `user_service_orgs`, `user_teams`, `user_qualifications`, `user_languages` with correct foreign keys, indexes, and constraints.
2. RLS policies on all new tables enforce: SELECT where `user_id = auth.uid()` OR role is `platform_admin`; INSERT/UPDATE/DELETE where `user_id = auth.uid()`.
3. Profile completeness trigger on `users` table recomputes `profile_completeness` on UPDATE and returns correct score based on the weight table.
4. `/dashboard/profile` renders all profile sections with data from the database. Empty sections show encouraging placeholder copy.
5. `/dashboard/profile/edit` renders multi-section edit form. Each section saves independently (no single giant submit button).
6. Basic Info form saves `first_name`, `last_name`, `preferred_name`, `phone`, `location_city`, `location_state`, `location_country` to `users` table.
7. Service Identity form saves `primary_discipline` (dropdown from RTLT disciplines), `secondary_disciplines` (multi-select), `service_start_year`, `service_statement` to `users` table.
8. Community editor supports add, edit, remove. Dropdown for `relationship` type. State selector for US states. `is_current` toggle.
9. Organization editor supports add, edit, remove. Free-text org name with optional link to existing `organizations` table. `is_primary` toggle (only one at a time). `is_current` toggle.
10. Team editor supports add, edit, remove. Team type selector from `rtlt_team_types` seed data. Position on team field. `is_current` toggle.
11. Qualification editor supports add, edit, remove. Category dropdown. Expiration date with visual indicator for expired entries.
12. Language editor supports add, remove. Proficiency dropdown.
13. Affinity picker shows all seeded affinities grouped by category (hazard_type, functional_specialty, sector_experience). Multi-select with visual tags. Saves via `updateAffinities()` set-based replacement.
14. ProfileCompleteness ring renders on both view and edit pages. Shows percentage and section checklist.
15. `profile_updated_at` updates on every user-initiated profile save (not system-triggered updates).
16. `date_of_birth` field is present in edit form but NEVER rendered on the view page. It is PII for internal verification only.
17. `credential_number` displays masked (last 4 chars) on view page.
18. Dashboard "Profile" nav link in sidebar/bottom nav navigates to `/dashboard/profile`.
19. Zod validators enforce all validation rules specified in Business Rules.
20. `npm run build` passes with zero errors.
21. All pages render correctly on mobile (bottom nav) and desktop (sidebar).

---

## Agent Lenses

### Baseplate (data/schema)
- ✅ Five new tables with proper FKs, cascading deletes, and indexes on all foreign keys and common query patterns.
- ✅ `user_service_orgs` is intentionally separate from `user_organizations` — the former is self-reported history, the latter is active platform sponsorship. Different purposes, different trust levels.
- ✅ `user_teams` is separate from `tc_team_members` — same logic: self-reported vs. engagement-tracked.
- ✅ Profile completeness is a denormalized integer on `users` to avoid expensive joins on dashboard load.
- ✅ `primary_discipline` and `secondary_disciplines` reference RTLT slugs but are not FK-constrained (reference data is in JSON, not a relational table with stable UUIDs).
- ✅ `credential_number` flagged for encryption in DOC-907 scope.
- ⚠️ Cardinality limits (50 communities, 30 orgs, etc.) enforced at application layer, not DB constraints — keeps migration simple and limits adjustable without schema changes.

### Meridian (doctrine)
- ✅ Discipline selection uses RTLT taxonomy slugs — same vocabulary as positions, teams, and deployment records.
- ✅ Team types reference `rtlt_team_types` — expandable beyond Florida's 13 SRT disciplines.
- ✅ Qualification categories include `fema_ics` and `state_cert` — aligns with NQS credential recognition.
- ✅ Community relationships use ICS/NIMS deployment language: `home_base`, `deployed_to`, `assigned_to`, `mutual_aid`.
- ✅ No invented terminology. Everything maps to how responders actually describe their service.

### Lookout (UX)
- ✅ Progressive collection — never demands everything at once. Registration is email-only. Profile grows.
- ✅ Section-level save — responder can fill one section during a break, come back later for the rest. No lost work.
- ✅ Copy is invitational, not bureaucratic. "The communities that know your name" vs. "Enter your service locations."
- ✅ Empty states are encouraging, not scolding. Completeness is motivational.
- ✅ Mobile-first — all editors work on a phone. A responder in the field can add a community between shifts.
- ⚠️ No avatar upload in this doc — depends on DOC-206 storage abstraction. Placeholder avatar renders initials.

### Threshold (security)
- ✅ RLS enforces owner-only write access. Staff can view, not edit.
- ✅ No public profile routes. Verification portal (DOC-502) is a separate, scoped interface.
- ✅ `date_of_birth` never rendered on view page. Internal use only.
- ✅ `credential_number` masked in display. Encryption deferred to DOC-907 but field is ready.
- ✅ Organization sponsorship visibility (DOC-610) uses separate scoped queries — never reads from these profile tables directly.
- ✅ All profile mutations require authenticated session. No public write endpoints.

---

## Claude Code Prompt

### Context

You are adding the comprehensive member profile system to the Grey Sky Responder Society platform. The platform is a Next.js 16 app (App Router, React 19, TypeScript 5, Tailwind CSS 4) backed by Supabase (PostgreSQL 16 + PostGIS). Auth is Supabase Auth (GoTrue), NOT NextAuth.js.

The dashboard layout (DOC-201) is already built with sidebar (desktop) and bottom nav (mobile). Auth (DOC-200) is complete with registration, login, middleware role enforcement. The `users` table exists with core fields. Seed data (DOC-003) has been applied: 63 positions, 13 team types (in `rtlt_team_types`), 37 affinities (in `affinities`).

Brand tokens are CSS custom properties: `--gs-navy: #0A1628`, `--gs-gold: #C5933A`, `--gs-white: #F5F5F5`. Font is Inter.

### Step 1: Create Migration

Create `supabase/migrations/20260411000002_user_profile_expansion.sql`:

```sql
-- GSR-DOC-202: Member Profile Expansion
-- Adds profile fields to users table and creates structured service history tables

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

-- Constraint: service_start_year must be reasonable
ALTER TABLE users ADD CONSTRAINT chk_service_start_year
  CHECK (service_start_year IS NULL OR (service_start_year >= 1950 AND service_start_year <= EXTRACT(YEAR FROM CURRENT_DATE)::integer));

-- Constraint: service_statement max length
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
  document_id uuid, -- FK to documents table (DOC-206) — not constrained yet since table may not exist
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

CREATE TRIGGER trg_user_communities_updated_at BEFORE UPDATE ON user_communities
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_user_service_orgs_updated_at BEFORE UPDATE ON user_service_orgs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_user_teams_updated_at BEFORE UPDATE ON user_teams
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_user_qualifications_updated_at BEFORE UPDATE ON user_qualifications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

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

CREATE TRIGGER trg_users_years_of_service BEFORE INSERT OR UPDATE OF service_start_year ON users
  FOR EACH ROW EXECUTE FUNCTION compute_years_of_service();

-- Profile completeness trigger
-- This runs on users UPDATE and queries related tables to compute the score.
-- It's a simple approach that works at current scale. If performance becomes an issue,
-- switch to event-driven updates from each related table.
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

CREATE TRIGGER trg_users_profile_completeness BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION compute_profile_completeness();

-- ============================================================
-- 8. RLS Policies
-- ============================================================

-- user_communities
ALTER TABLE user_communities ENABLE ROW LEVEL SECURITY;

CREATE POLICY user_communities_select ON user_communities FOR SELECT
  USING (
    user_id = auth.uid()
    OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'platform_admin')
  );

CREATE POLICY user_communities_insert ON user_communities FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY user_communities_update ON user_communities FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY user_communities_delete ON user_communities FOR DELETE
  USING (user_id = auth.uid());

-- user_service_orgs
ALTER TABLE user_service_orgs ENABLE ROW LEVEL SECURITY;

CREATE POLICY user_service_orgs_select ON user_service_orgs FOR SELECT
  USING (
    user_id = auth.uid()
    OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'platform_admin')
  );

CREATE POLICY user_service_orgs_insert ON user_service_orgs FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY user_service_orgs_update ON user_service_orgs FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY user_service_orgs_delete ON user_service_orgs FOR DELETE
  USING (user_id = auth.uid());

-- user_teams
ALTER TABLE user_teams ENABLE ROW LEVEL SECURITY;

CREATE POLICY user_teams_select ON user_teams FOR SELECT
  USING (
    user_id = auth.uid()
    OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'platform_admin')
  );

CREATE POLICY user_teams_insert ON user_teams FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY user_teams_update ON user_teams FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY user_teams_delete ON user_teams FOR DELETE
  USING (user_id = auth.uid());

-- user_qualifications
ALTER TABLE user_qualifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY user_qualifications_select ON user_qualifications FOR SELECT
  USING (
    user_id = auth.uid()
    OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'platform_admin')
  );

CREATE POLICY user_qualifications_insert ON user_qualifications FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY user_qualifications_update ON user_qualifications FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY user_qualifications_delete ON user_qualifications FOR DELETE
  USING (user_id = auth.uid());

-- user_languages
ALTER TABLE user_languages ENABLE ROW LEVEL SECURITY;

CREATE POLICY user_languages_select ON user_languages FOR SELECT
  USING (
    user_id = auth.uid()
    OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'platform_admin')
  );

CREATE POLICY user_languages_insert ON user_languages FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY user_languages_delete ON user_languages FOR DELETE
  USING (user_id = auth.uid());
```

### Step 2: Create TypeScript Types

Create `src/lib/types/profile.ts` with the exact TypeScript interfaces defined in the Data Entities section above. Export all interfaces. Add to the barrel export in `src/lib/types/index.ts`.

### Step 3: Create Zod Validators

Create `src/lib/validators/profile.ts` with Zod schemas for:
- `basicInfoSchema` — first_name, last_name, preferred_name, phone, location_city, location_state, location_country
- `serviceIdentitySchema` — primary_discipline, secondary_disciplines, service_start_year, service_statement
- `communitySchema` — community_name (required), state, country, relationship (required, enum), start_year, end_year, is_current, notes
- `serviceOrgSchema` — organization_name (required), organization_id (optional uuid), organization_type, role_title, start_year, end_year, is_current, is_primary
- `teamSchema` — team_name (required), team_type_id (optional uuid), organization_id (optional uuid), position_on_team, rtlt_position_slug, start_year, end_year, is_current
- `qualificationSchema` — qualification_name (required), issuing_authority, credential_number, issued_date, expiration_date, is_active, category (enum), verification_status
- `languageSchema` — language (required), proficiency (required, enum)
- `affinitiesSchema` — array of uuid strings (affinity_ids)

All year fields: integer, min 1950, max current year. All string length constraints per Business Rules.

### Step 4: Create Server Actions

Create `src/lib/actions/profile.ts` with all server actions listed in the Structure section.

Key implementation notes:
- Use `createServerSupabaseClient()` from `src/lib/supabase/server.ts` for authenticated queries.
- Every mutation validates input with the corresponding Zod schema before touching the database.
- `getMyProfile()` does a single query for the `users` row, then parallel queries for all related tables. Returns the full `UserProfile` object.
- `setPrimaryOrg(id)` wraps two updates in a transaction: unset all `is_primary` for this user, then set the target row.
- `updateAffinities(affinity_ids)` deletes all existing `user_affinities` for the user, then bulk inserts the new set. Wrap in a transaction.
- After any mutation on related tables (communities, orgs, teams, qualifications, affinities), trigger a re-save on the `users` row to fire the completeness trigger. This can be a no-op update: `UPDATE users SET profile_updated_at = now() WHERE id = auth.uid()`.
- Use `'use server'` directive at the top of the file.
- All actions use `revalidatePath('/dashboard/profile')` after mutations.

### Step 5: Create Profile View Components

**`src/components/profile/ProfileHeader.tsx`**
- Server component. Shows: avatar (initials placeholder if no avatar_url), display name (preferred_name or first_name + last_name), location (city, state), membership badge (active/expired/none), years of service badge, and ProfileCompleteness ring.
- Display name logic: If `preferred_name` is set, show it with full name in smaller text below. Otherwise show `first_name + last_name`. If neither set, show "Grey Sky Member".

**`src/components/profile/ProfileCompleteness.tsx`**
- Client component. Circular progress ring using SVG. Percentage in center. Gold fill for progress, steel gray for remainder.
- Below the ring: checklist of 8 sections with checkmarks (green) or empty circles (gray).
- At 100%: ring turns gold with a checkmark icon. Label: "Profile Complete".
- Below 100%: Label shows the next incomplete section as a link: "Next: Tell us about your teams →"

**`src/components/profile/ServiceIdentity.tsx`**
- Displays: primary discipline (with RTLT label from disciplines data), secondary disciplines as tags, service start year with computed years ("Since 2008 · 18 years"), service statement in a styled blockquote.

**`src/components/profile/CommunitiesSection.tsx`**
- Card list of communities. Each card: community name, state, relationship badge (color-coded: home_base=navy, deployed_to=gold, assigned_to=steel, mutual_aid=green), year range, "Current" badge if is_current.
- Empty state: "You haven't added any communities yet. The places you've protected — they matter. Add them when you're ready."

**`src/components/profile/OrganizationsSection.tsx`**
- Card list. Primary org has a gold star badge. Each card: org name, type badge, role title, year range, current badge.
- Empty state: "The agencies and organizations that shaped your service. Add them here."

**`src/components/profile/TeamsSection.tsx`**
- Card list. Each card: team name, team type (from rtlt_team_types join), org name if set, position on team, year range, current badge.
- Empty state: "Your crews, task forces, and units. The teams that had your back."

**`src/components/profile/QualificationsSection.tsx`**
- Grouped by category. Each entry: qualification name, issuing authority, issued/expiration dates, status badges (active=green, expired=red, self_reported=gray, document_linked=blue, staff_verified=green).
- Credential number shown masked: "····1234".
- Empty state: "Certifications, licenses, credentials — from any source. They all count."

**`src/components/profile/LanguagesSection.tsx`**
- Inline tag list. Each tag: language name + proficiency badge.
- Empty state: "Every language is a lifeline in a disaster."

**`src/components/profile/AffinitiesSection.tsx`**
- Three columns (or stacked on mobile): Hazard Types, Functional Specialties, Sector Experience. Each affinity as a styled tag.
- Empty state: "What connects you to other responders? Select your areas of experience."

**`src/components/profile/ProfileView.tsx`**
- Assembles all sections in order: ProfileHeader, ServiceIdentity, CommunitiesSection, OrganizationsSection, TeamsSection, QualificationsSection, LanguagesSection, AffinitiesSection.
- Each section has an "Edit" button (pencil icon) that links to `/dashboard/profile/edit#section-id`.
- Section layout: heading left, edit button right, content below.

### Step 6: Create Profile Edit Components

**`src/components/profile/edit/ProfileEditForm.tsx`**
- Client component. Multi-section accordion or vertical scroll with section anchors.
- Each section saves independently via its own server action.
- Shows toast/notification on successful save per section.
- Back button at top: "← Back to Profile" linking to `/dashboard/profile`.

**`src/components/profile/edit/BasicInfoForm.tsx`**
- Fields: first_name, last_name, preferred_name, phone, location_city, location_state (US state dropdown), location_country (country dropdown, default USA).
- Section header: "You" / "The basics. How you want to be known."
- Save button: "Save" — calls `updateBasicInfo()`.

**`src/components/profile/edit/ServiceIdentityForm.tsx`**
- Fields: primary_discipline (dropdown from disciplines data — use `src/lib/disciplines.ts` for the 17 curated entries), secondary_disciplines (multi-select checkboxes from same list), service_start_year (number input, 1950-current), service_statement (textarea, max 500 chars, char counter).
- Section header: "Your Service" / "What you do and how long you've been doing it. Every year counts."
- Save button calls `updateServiceIdentity()`.

**`src/components/profile/edit/CommunityEditor.tsx`**
- List of existing communities with inline edit/remove.
- "Add Community" button opens inline form: community_name (text), state (dropdown), country (dropdown), relationship (dropdown: Home Base, Deployed To, Assigned To, Mutual Aid), start_year, end_year, is_current (toggle), notes (textarea).
- Section header: "Where You've Served" / "The places you've protected. The communities that know your name."

**`src/components/profile/edit/OrgEditor.tsx`**
- List of existing orgs with inline edit/remove.
- "Add Organization" button: organization_name (text — with future type-ahead against `organizations` table), organization_type (dropdown), role_title (text), start_year, end_year, is_current (toggle), is_primary (radio — only one).
- Section header: "Who You've Served With" / "The agencies, departments, and organizations that shaped your service."

**`src/components/profile/edit/TeamEditor.tsx`**
- "Add Team" form: team_name (text), team_type_id (dropdown from `rtlt_team_types` — fetch from seed data, show name), organization_id (optional — same type-ahead as OrgEditor), position_on_team (text), start_year, end_year, is_current (toggle).
- Section header: "Your Teams" / "The crews, task forces, and units you've been part of."

**`src/components/profile/edit/QualificationEditor.tsx`**
- "Add Qualification" form: qualification_name (text), category (dropdown: Medical, Technical, Leadership, HazMat, Communications, Legal, FEMA/ICS, State Certification, Other), issuing_authority (text), credential_number (text — masked display, full entry), issued_date (date picker), expiration_date (date picker), is_active (toggle — auto-set to false if expiration_date is past).
- Section header: "What You Bring" / "Certifications, licenses, and credentials you hold — from any source."

**`src/components/profile/edit/LanguageEditor.tsx`**
- Compact form: language (text), proficiency (dropdown: Native, Fluent, Conversational, Basic). Add button inline.
- Section header: "Languages" / "Every language is a lifeline in a disaster."

**`src/components/profile/edit/AffinityPicker.tsx`**
- Fetch all affinities from `affinities` table (37 seeded entries).
- Display grouped by category with checkboxes. Three groups: Hazard Types, Functional Specialties, Sector Experience.
- Save replaces all user_affinities for this user.
- Section header: "What Connects You" / "Select the hazards, specialties, and sectors that define your experience."

### Step 7: Create Dashboard Pages

**`src/app/(dashboard)/dashboard/profile/page.tsx`**
- Server component. Calls `getMyProfile()`. Renders `ProfileView` with data.
- Page title: "My Service Profile"
- Breadcrumb: Dashboard > Profile

**`src/app/(dashboard)/dashboard/profile/edit/page.tsx`**
- Server component that fetches profile data, then renders `ProfileEditForm` (client component) with initial data as props.
- Page title: "Edit Profile"
- Breadcrumb: Dashboard > Profile > Edit

### Step 8: Update Dashboard Navigation

Add "Profile" to the dashboard sidebar navigation in existing nav components at `src/components/dashboard/`. Icon: `user` from lucide-react. Position: second item (after Dashboard home, before other items). Link to `/dashboard/profile`.

### Step 9: Verify

- Run `npx supabase db reset` to apply all migrations including the new one
- Run `npm run build` — must pass with zero errors
- Verify profile view renders with empty state copy for all sections
- Verify profile edit saves each section independently
- Verify profile completeness ring updates after saving sections
- Verify RLS prevents cross-user data access
- Verify `date_of_birth` does not appear on the profile view page
- Verify credential_number displays masked on view

### Commit Message

```
feat: member profile — comprehensive service identity with communities, orgs, teams, qualifications, affinities (DOC-202)
```

---

*End of GSR-DOC-202*
