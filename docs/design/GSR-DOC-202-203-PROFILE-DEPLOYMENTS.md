# GSR-DOC-202: Member Profile — View + Edit

| Field | Value |
|-------|-------|
| Phase | 2 |
| Status | draft |
| Blocks on | GSR-DOC-201 ✅, GSR-DOC-003 ✅ |
| Priority | critical |

## Purpose

The member profile is the responder's identity in the Grey Sky system. It is where a responder sees themselves — their name, their location, the organizations they serve with, the affinities that connect them to others, and a short narrative about who they are in the emergency management community.

Privacy is sovereign. The profile is visible only to the member and Grey Sky staff. No public directory. No searchable roster. OD-10 (public profile visibility) remains open — this doc builds the private-first default. If a future decision adds public visibility, it will be a consent-based opt-in layered on top, not a restructure.

The profile also serves as the anchor point for deployment records, certifications, documents, and Sky Points. Without a profile, those features have no home.

## Data Entities

### Existing Tables (no schema changes required)

**`users`** — already created in DOC-002 migration `20260409000003_core_tables.sql`:
- `id` uuid (PK, synced from auth.users)
- `email` varchar (unique)
- `first_name`, `last_name` varchar
- `phone` varchar (nullable)
- `location_city`, `location_state`, `location_country` varchar (nullable)
- `bio` text (nullable)
- `avatar_url` varchar (nullable)
- `role` enum: `member` | `org_admin` | `assessor` | `platform_admin`
- `membership_status` enum: `active` | `expired` | `none`
- `membership_paid_by` enum: `self` | `organization`
- `membership_expires_at` timestamptz (nullable)
- `mfa_enabled` boolean (default false)
- `status` enum: `active` | `suspended` | `deactivated`
- `created_at`, `updated_at` timestamptz

**`user_organizations`** — join table for org affiliations:
- `id` uuid (PK)
- `user_id` uuid → users
- `org_id` uuid → organizations
- `role` enum: `member` | `team_lead` | `admin` | `assessor`
- `title` varchar (nullable)
- `start_date`, `end_date` date (nullable)
- `is_primary` boolean (default false)
- `sponsorship_active` boolean
- `sponsorship_scope` jsonb
- `created_at` timestamptz

**`user_affinities`** — join table linking users to affinities:
- `user_id` uuid → users
- `affinity_id` uuid → affinities
- Composite PK (user_id, affinity_id)

**`affinities`** — taxonomy reference:
- `id` uuid (PK)
- `category` enum: `hazard_type` | `functional_specialty` | `sector_experience`
- `value` varchar
- `description` text (nullable)
- `sort_order` int

### TypeScript Types

**Existing file:** `src/lib/types/users.ts` — extend with view-model types:

```typescript
// Profile view model (what the profile page renders)
export interface MemberProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  locationCity: string | null;
  locationState: string | null;
  locationCountry: string | null;
  bio: string | null;
  avatarUrl: string | null;
  role: UserRole;
  membershipStatus: MembershipStatus;
  membershipExpiresAt: string | null;
  createdAt: string;
  organizations: UserOrganizationDetail[];
  affinities: UserAffinityDetail[];
  stats: ProfileStats;
}

export interface UserOrganizationDetail {
  id: string;
  orgId: string;
  orgName: string;
  orgType: string;
  role: OrgRole;
  title: string | null;
  startDate: string | null;
  endDate: string | null;
  isPrimary: boolean;
}

export interface UserAffinityDetail {
  affinityId: string;
  category: AffinityCategory;
  value: string;
}

export interface ProfileStats {
  totalDeployments: number;
  verifiedDeployments: number;
  totalHours: number;
  certificationsEarned: number;
}

// Profile update payload (what the edit form submits)
export interface ProfileUpdatePayload {
  firstName: string;
  lastName: string;
  phone: string | null;
  locationCity: string | null;
  locationState: string | null;
  locationCountry: string | null;
  bio: string | null;
  affinityIds: string[];
}
```

## Structure

### Routes

```
src/app/(dashboard)/dashboard/profile/page.tsx       — Profile view (server component)
src/app/(dashboard)/dashboard/profile/edit/page.tsx   — Profile edit (client component)
```

### Components

```
src/components/dashboard/profile/
  ProfileHeader.tsx          — Avatar, name, location, membership badge
  ProfileDetails.tsx         — Bio, contact info, organizations
  ProfileAffinities.tsx      — Affinity tags grouped by category
  ProfileStats.tsx           — Deployment count, hours, certs summary
  ProfileEditForm.tsx        — Edit form (client component with useFormState)
  AffinitySelector.tsx       — Multi-select affinity picker grouped by category
  AvatarUpload.tsx           — Avatar image upload with preview (Supabase Storage)
```

### Server Actions

```
src/lib/actions/profile.ts   — updateProfile, updateAvatar server actions
```

### Validators

```
src/lib/validators/profile.ts — Zod schemas for profile update
```

### Hooks

```
src/hooks/useProfile.ts      — Client-side profile data hook (SWR pattern)
```

## Business Rules

1. **View access:** A member can only view their own profile. Platform admins can view any profile. Org admins cannot view profiles (they see scoped sponsorship data via DOC-610, not built yet).

2. **Edit access:** A member can only edit their own profile. The `email` field is read-only (managed via Supabase Auth). The `role`, `membership_status`, `membership_paid_by`, and `membership_expires_at` fields are read-only (managed by platform operations).

3. **Avatar upload:** Images uploaded to Supabase Storage bucket `avatars/{userId}/avatar.{ext}`. Max file size: 2 MB. Accepted types: image/jpeg, image/png, image/webp. On upload, the `avatar_url` column is updated with the public URL.

4. **Affinities:** The member selects from the seeded affinity vocabulary (37 entries across 3 categories). Multiple selections per category allowed. On save, the `user_affinities` join table is replaced (delete all existing, insert new set) within a single transaction.

5. **Organizations:** Organization affiliations are read-only on the profile page. Adding/removing org affiliations is managed via a separate workflow (DOC-600 org onboarding). The profile displays current affiliations.

6. **Bio:** Max 500 characters. No HTML. Plain text only.

7. **Phone:** Optional. Validated as E.164 format if provided. Displayed only to the member and platform admins.

8. **Location:** State is a dropdown of US states + territories. City is free text. Country defaults to "US" and is a dropdown for international responders.

9. **Stats:** Computed server-side from `deployment_records` and `user_certifications` tables. Not stored — calculated on each profile load. Counts only records with status `submitted` or `verified`.

10. **RLS enforcement:** The `users` table RLS policy (created in DOC-002) already enforces `auth.uid() = id` for SELECT and UPDATE on the member's own row. The profile page relies on this — no additional application-layer auth checks needed beyond confirming the user is authenticated.

## Copy Direction

- Header greeting: "Your Service Profile" — not "My Account" or "Settings"
- Bio placeholder: "Tell us about your experience in emergency management. What drives you to serve?"
- Stats section: "Service Record Summary" — deployment count, hours served, verifications earned
- Affinity section: "Your Connections" — subtitle: "The hazards, specialties, and sectors that define your experience"
- Organization section: "Organizations You Serve With"
- Empty state for deployments: "No deployments recorded yet. Your service record starts with your first entry."
- Edit button: "Update Profile" — not "Edit" or "Modify"
- Save button: "Save Changes"
- Tone: Respectful, operational. This is a professional identity, not a social media profile.

## Acceptance Criteria

1. `/dashboard/profile` renders the authenticated member's profile with all fields, organizations, affinities, and stats
2. `/dashboard/profile/edit` renders an edit form pre-populated with current values
3. Profile update via server action correctly updates `users` table and `user_affinities` join table
4. Avatar upload stores image in Supabase Storage and updates `avatar_url`
5. Avatar upload rejects files > 2 MB and non-image MIME types
6. Bio field enforces 500 character max with visible counter
7. Affinity selector displays all 37 seeded affinities grouped by category (hazard_type, functional_specialty, sector_experience)
8. Phone field validates E.164 format when provided
9. State dropdown includes all US states and territories
10. Profile stats show correct counts from deployment_records and user_certifications
11. Non-authenticated users redirected to /login (existing middleware handles this)
12. User cannot view or edit another member's profile (RLS enforced)
13. `npm run build` passes with zero errors
14. Dashboard sidebar "Profile" link navigates to `/dashboard/profile`

---

# GSR-DOC-203: Deployment Records — List + Create + Detail

| Field | Value |
|-------|-------|
| Phase | 2 |
| Status | draft |
| Blocks on | GSR-DOC-201 ✅, GSR-DOC-003 ✅ |
| Priority | critical |

## Purpose

Deployment records are the evidentiary backbone of the Grey Sky platform. Every certification, every validation, every evaluation, every credential traces back to a deployment record. This is where a responder says: "I was there. I served in this role. Here is when, where, and with whom."

A deployment record starts as self-certified — the responder's own attestation. Over time, it can be elevated through validation (a peer or supervisor confirms it) and evaluation (a formal ICS 225-modeled performance review). This three-tier verification model is what makes Grey Sky fundamentally different from every other system: verified credibility over self-attestation.

This doc builds the foundation: list, create, and view deployment records. The validation and evaluation workflows (DOC-400 through DOC-403) build on top of this.

## Data Entities

### Existing Tables (no schema changes required)

**`deployment_records`** — created in DOC-002:
- `id` uuid (PK)
- `user_id` uuid → users
- `incident_id` uuid → incidents (nullable — allow records without a registered incident)
- `position_id` uuid → positions (nullable — allow free-text position if not in RTLT)
- `org_id` uuid → organizations (nullable)
- `start_date` date
- `end_date` date (nullable — ongoing deployments)
- `hours` integer (nullable — calculated or manual)
- `verification_tier` enum: `self_certified` | `validated_360` | `evaluated_ics225`
- `supervisor_name` varchar (nullable)
- `supervisor_email` varchar (nullable)
- `notes` text (nullable)
- `status` enum: `draft` | `submitted` | `verified`
- `created_at`, `updated_at` timestamptz

**`incidents`** — created in DOC-002:
- `id` uuid (PK)
- `name` varchar
- `description` text (nullable)
- `type` enum: `disaster` | `exercise` | `planned_event` | `training` | `steady_state`
- `declaration_number` varchar (nullable)
- `fema_disaster_number` varchar (nullable)
- `start_date` date
- `end_date` date (nullable)
- `state` varchar (nullable)
- `county` varchar (nullable)
- `status` enum: `active` | `closed`
- `created_at` timestamptz

**`positions`** — seeded with 625 RTLT entries in DOC-003:
- `id` uuid (PK)
- `title` varchar
- `nims_type` enum: `type1` | `type2` | `type3` | `type4` | `type5`
- `complexity_level` varchar (nullable)
- `resource_category` varchar
- `rtlt_code` varchar (nullable)
- `discipline` varchar (nullable)
- `description` text (nullable)
- `requirements_json` jsonb (nullable)

### TypeScript Types

**Existing file:** `src/lib/types/deployments.ts` — extend with view-model types:

```typescript
// Deployment record with joined data for display
export interface DeploymentRecordDetail {
  id: string;
  userId: string;
  incidentId: string | null;
  positionId: string | null;
  orgId: string | null;
  startDate: string;
  endDate: string | null;
  hours: number | null;
  verificationTier: VerificationTier;
  supervisorName: string | null;
  supervisorEmail: string | null;
  notes: string | null;
  status: DeploymentStatus;
  createdAt: string;
  updatedAt: string;
  // Joined fields
  incident: IncidentSummary | null;
  position: PositionSummary | null;
  organization: OrganizationSummary | null;
  validationCount: number;
  evaluationCount: number;
}

export interface IncidentSummary {
  id: string;
  name: string;
  type: IncidentType;
  state: string | null;
  startDate: string;
  endDate: string | null;
  femaDisasterNumber: string | null;
}

export interface PositionSummary {
  id: string;
  title: string;
  nimsType: NimsType;
  resourceCategory: string;
  discipline: string | null;
}

export interface OrganizationSummary {
  id: string;
  name: string;
  type: string;
}

// Create deployment record payload
export interface CreateDeploymentPayload {
  incidentId: string | null;
  incidentName: string | null;       // for inline incident creation
  incidentType: IncidentType | null;  // for inline incident creation
  incidentState: string | null;       // for inline incident creation
  incidentStartDate: string | null;   // for inline incident creation
  positionId: string | null;
  positionFreeText: string | null;    // if position not in RTLT
  orgId: string | null;
  startDate: string;
  endDate: string | null;
  hours: number | null;
  supervisorName: string | null;
  supervisorEmail: string | null;
  notes: string | null;
}

// List filters
export interface DeploymentFilters {
  status: DeploymentStatus | 'all';
  verificationTier: VerificationTier | 'all';
  dateFrom: string | null;
  dateTo: string | null;
  search: string;    // searches incident name, position title
  page: number;
  perPage: number;   // default 20
}
```

## Structure

### Routes

```
src/app/(dashboard)/dashboard/records/page.tsx           — Records list (server component)
src/app/(dashboard)/dashboard/records/new/page.tsx       — Create record (client component)
src/app/(dashboard)/dashboard/records/[id]/page.tsx      — Record detail (server component)
src/app/(dashboard)/dashboard/records/[id]/edit/page.tsx — Edit record (client component, draft only)
```

### Components

```
src/components/dashboard/records/
  RecordsList.tsx            — Filterable, paginated list of deployment records
  RecordsFilters.tsx         — Filter bar: status, tier, date range, search
  RecordCard.tsx             — Individual record in list view (incident, position, dates, tier badge)
  RecordDetail.tsx           — Full record detail view
  RecordForm.tsx             — Create/edit form (shared between new and edit)
  RecordVerificationBadge.tsx — Tier badge: Self-Certified (gray), Validated (gold), Evaluated (green)
  RecordStatusBadge.tsx      — Status badge: Draft (gray), Submitted (gold), Verified (green)
  RecordActions.tsx          — Action buttons on detail view (edit, submit, request validation, request evaluation)
  IncidentSelector.tsx       — Search existing incidents or create inline
  PositionSelector.tsx       — Search RTLT positions with category filter, or enter free text
  RecordTimeline.tsx         — Visual timeline of verifications on this record
  EmptyRecords.tsx           — Empty state with CTA to create first record
```

### Server Actions

```
src/lib/actions/deployments.ts  — createDeployment, updateDeployment, submitDeployment server actions
```

### Validators

```
src/lib/validators/deployments.ts — Zod schemas for create/update deployment
```

### Data Access

```
src/lib/queries/deployments.ts   — Supabase queries for deployment CRUD + list with joins
src/lib/queries/incidents.ts     — Supabase queries for incident search + create
```

## Business Rules

### Record Lifecycle

1. **Create:** A deployment record starts with status `draft` and verification_tier `self_certified`. The member fills in what they know. Required fields: `start_date` and either `position_id` OR `position_free_text` (one or the other, not both empty).

2. **Save as Draft:** Records can be saved as drafts and returned to later. Drafts are editable. Drafts do not appear in any verification workflow.

3. **Submit:** When the member submits a record, status changes from `draft` to `submitted`. Submitted records are no longer editable by the member (they can request corrections via support). Submitted records are eligible for validation and evaluation requests (DOC-400+).

4. **Verified:** A record reaches `verified` status when it has at least one completed validation OR evaluation. This status change is handled by the validation/evaluation workflow (DOC-400+), not by this doc.

### Incident Handling

5. **Incident search:** The incident selector searches the `incidents` table by name. Fuzzy matching via `ILIKE` with wildcards. Results show: name, type, state, date range.

6. **Inline incident creation:** If the incident doesn't exist, the member can create one inline. Required fields for inline creation: `name`, `type`, `start_date`. The new incident is created in the `incidents` table and linked to the deployment record. State is optional but encouraged.

7. **No incident:** A deployment record can be created without linking to a registered incident. This covers steady-state operations, training, and situations where the incident isn't formalized. The `incident_id` field is nullable.

### Position Handling

8. **RTLT position search:** The position selector searches the 625 seeded RTLT positions by title. Results grouped by `resource_category`. Shows: title, NIMS type, category.

9. **Free-text position:** If the position isn't in RTLT (legitimate for many local/specialty roles), the member can enter a free-text position description. When `position_free_text` is provided, `position_id` is null.

10. **Position is required:** Either `position_id` or `position_free_text` must be provided. Both cannot be null.

### Field Validation

11. **Dates:** `start_date` is required. `end_date` must be >= `start_date` if provided. Neither can be in the future.

12. **Hours:** Optional. If provided, must be a positive integer. Max 8,760 (one year of hours — safety valve against typos).

13. **Supervisor:** Both `supervisor_name` and `supervisor_email` are optional. If email is provided, it must be a valid email format. This information is used later for validation requests (DOC-400).

14. **Notes:** Optional. Max 2,000 characters. Plain text only.

### List and Pagination

15. **Default sort:** Records sorted by `start_date` descending (most recent first).

16. **Pagination:** 20 records per page. Server-side pagination via Supabase `.range()`.

17. **Filters:** Status (all/draft/submitted/verified), verification tier (all/self_certified/validated_360/evaluated_ics225), date range, text search (incident name, position title).

### Privacy and Access

18. **A member sees only their own records.** RLS policy on `deployment_records` enforces `auth.uid() = user_id`.

19. **Draft records are private to the member.** No one else can see drafts — not even platform admins until DOC-904 builds the admin dashboard.

20. **Submitted/verified records** are visible to platform admins (future DOC-904) and to sponsoring organizations for scoped disciplines (future DOC-610). For now, member-only.

## Copy Direction

- Page title: "Service Record" — not "Deployment History" or "Experience Log"
- Create button: "Record a Deployment" — not "Add Record" or "New Entry"
- Empty state heading: "Your service record starts here."
- Empty state body: "Every deployment you record becomes part of your verified professional history. Start with what you remember — you can add details and request verifications later."
- Verification tier labels displayed to member:
  - Self-Certified: "Self-Reported" with gray badge — "You recorded this deployment."
  - Validated 360: "Peer Verified" with gold badge — "Confirmed by a colleague or supervisor."
  - Evaluated ICS 225: "Formally Evaluated" with green badge — "Evaluated against ICS performance standards."
- Status labels:
  - Draft: "Draft" gray — "Not yet submitted. You can still edit this record."
  - Submitted: "Submitted" gold — "Submitted to your service record."
  - Verified: "Verified" green — "Confirmed through independent verification."
- Submit confirmation dialog: "Once submitted, this record becomes part of your permanent service history. You can request verifications after submission. Are you sure?"
- Supervisor fields label: "Supervisor / Point of Contact" — subtitle: "Optional. Used for verification requests."
- Notes label: "Additional Context" — placeholder: "Anything else relevant to this deployment — conditions, challenges, outcomes."

## Acceptance Criteria

1. `/dashboard/records` renders a paginated list of the authenticated member's deployment records with filters
2. `/dashboard/records/new` renders a create form with incident selector, position selector, date fields, supervisor fields, and notes
3. Creating a record with a selected RTLT position correctly links `position_id`
4. Creating a record with free-text position stores `position_free_text` and leaves `position_id` null
5. Incident selector searches existing incidents by name with ILIKE
6. Inline incident creation creates a new `incidents` row and links it to the deployment record
7. Record can be created without an incident (incident_id null)
8. Draft records are editable; submitted records are not editable
9. Submit action changes status from `draft` to `submitted` with confirmation dialog
10. Records list supports filtering by status, verification tier, date range, and text search
11. Records list paginates at 20 per page with server-side pagination
12. Record detail page shows all fields with verification tier badge and status badge
13. Record detail page shows action buttons (edit for drafts, submit for drafts, validation/evaluation buttons disabled with "Coming soon" tooltip for submitted records)
14. Date validation: start_date required, end_date >= start_date, no future dates
15. Hours validation: positive integer, max 8,760
16. Notes validation: max 2,000 characters
17. User can only see their own records (RLS enforced — test by checking Supabase query includes auth context)
18. Dashboard sidebar "Service Record" link navigates to `/dashboard/records`
19. `npm run build` passes with zero errors

---

## Agent Lenses (applied to both DOC-202 and DOC-203)

- **Baseplate** (data/schema): No new tables or migrations. All entities exist in DOC-002 schema. Types extend existing files. Foreign keys validated against existing schema. Composite indexes on `deployment_records(user_id, start_date)` and `deployment_records(user_id, verification_tier)` already exist from DOC-002.

- **Meridian** (doctrine): Position selector uses the full 625-entry RTLT taxonomy seeded in DOC-003. NIMS typing levels (Type 1–5) displayed correctly. Incident types align with FEMA terminology (disaster, exercise, planned_event, training, steady_state). Verification tier names match the platform's three-tier model.

- **Lookout** (UX): Profile view is a single-scroll page — no tabs within tabs. Records list uses card layout with clear tier/status badges visible at glance. Create form is a single page, not a multi-step wizard — responders filling this out may be on a phone in the field. Position search has category grouping to narrow 625 entries. Empty states are encouraging, not clinical.

- **Threshold** (security): RLS is the trust boundary for both users and deployment_records tables. No application-layer authorization beyond confirming authentication. Avatar uploads scoped to user's own path in storage bucket. Phone and supervisor email are PII — never exposed beyond the member's own view (and future admin, DOC-904). No data leakage between members.

---

## Claude Code Prompt

### Context

You are building two features for the Grey Sky Responder Society platform (greysky.dev): Member Profile (view + edit) and Deployment Records (list + create + detail + edit). The project uses Next.js 16 with App Router, React 19, TypeScript 5, Tailwind CSS 4, and Supabase (Postgres + Auth).

**Auth is Supabase Auth (GoTrue), NOT NextAuth.js.** The auth system is already built (DOC-200). The dashboard layout shell is already built (DOC-201) with sidebar (desktop) and bottom nav (mobile).

**Existing infrastructure you will use:**
- `src/lib/supabase/client.ts` — browser Supabase client (use `createBrowserClient()`)
- `src/lib/supabase/server.ts` — server Supabase client (use `createServerClient()` in server components)
- `src/lib/supabase/admin.ts` — admin client (service role, use sparingly)
- `src/lib/auth/getUser.ts` — server-side authenticated user fetch
- `src/middleware.ts` — route protection (already protects `/dashboard/*`)
- `src/lib/types/` — TypeScript type files (users.ts, deployments.ts, enums.ts, etc.)
- `src/lib/validators/` — Zod schema directory
- `src/components/dashboard/` — existing dashboard components (StatusGrid, StatCard, etc.)

**Brand tokens (CSS custom properties, already configured in Tailwind):**
- `--gs-navy: #0A1628` (Command Navy — primary backgrounds, headers)
- `--gs-gold: #C5933A` (Signal Gold — accents, in-progress badges)
- `--gs-white: #F5F5F5` (Ops White — page backgrounds)
- `--gs-success: green` — verified/credentialed badges
- `--gs-alert: red` — expired/failed badges
- `--gs-slate`, `--gs-steel`, `--gs-silver`, `--gs-cloud` — supporting neutrals
- Font: Inter (Google Fonts, already loaded)

**Database tables already exist** (created by migrations in `supabase/migrations/`):
- `users` — member profiles (RLS: user sees own row only)
- `deployment_records` — deployment history (RLS: user sees own rows only)
- `incidents` — shared incident registry (RLS: all authenticated users can read, members can insert)
- `positions` — 625 RTLT entries (RLS: all authenticated users can read)
- `organizations` — org registry (RLS: all authenticated users can read)
- `user_organizations` — user↔org join (RLS: user sees own rows)
- `user_affinities` — user↔affinity join (RLS: user sees own rows)
- `affinities` — 37 seeded affinity entries (RLS: all authenticated users can read)

### Files to Create

**1. Type extensions**

File: `src/lib/types/profile.ts`
```typescript
import type { UserRole, MembershipStatus, AffinityCategory, OrgRole } from './enums';

export interface MemberProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  locationCity: string | null;
  locationState: string | null;
  locationCountry: string | null;
  bio: string | null;
  avatarUrl: string | null;
  role: UserRole;
  membershipStatus: MembershipStatus;
  membershipExpiresAt: string | null;
  createdAt: string;
  organizations: UserOrganizationDetail[];
  affinities: UserAffinityDetail[];
  stats: ProfileStats;
}

export interface UserOrganizationDetail {
  id: string;
  orgId: string;
  orgName: string;
  orgType: string;
  role: OrgRole;
  title: string | null;
  startDate: string | null;
  endDate: string | null;
  isPrimary: boolean;
}

export interface UserAffinityDetail {
  affinityId: string;
  category: AffinityCategory;
  value: string;
}

export interface ProfileStats {
  totalDeployments: number;
  verifiedDeployments: number;
  totalHours: number;
  certificationsEarned: number;
}

export interface ProfileUpdatePayload {
  firstName: string;
  lastName: string;
  phone: string | null;
  locationCity: string | null;
  locationState: string | null;
  locationCountry: string | null;
  bio: string | null;
  affinityIds: string[];
}
```

File: `src/lib/types/deployment-views.ts`
```typescript
import type { VerificationTier, DeploymentStatus, IncidentType, NimsType } from './enums';

export interface DeploymentRecordDetail {
  id: string;
  userId: string;
  incidentId: string | null;
  positionId: string | null;
  orgId: string | null;
  startDate: string;
  endDate: string | null;
  hours: number | null;
  verificationTier: VerificationTier;
  supervisorName: string | null;
  supervisorEmail: string | null;
  notes: string | null;
  status: DeploymentStatus;
  createdAt: string;
  updatedAt: string;
  incident: IncidentSummary | null;
  position: PositionSummary | null;
  organization: OrganizationSummary | null;
  validationCount: number;
  evaluationCount: number;
}

export interface IncidentSummary {
  id: string;
  name: string;
  type: IncidentType;
  state: string | null;
  startDate: string;
  endDate: string | null;
  femaDisasterNumber: string | null;
}

export interface PositionSummary {
  id: string;
  title: string;
  nimsType: NimsType;
  resourceCategory: string;
  discipline: string | null;
}

export interface OrganizationSummary {
  id: string;
  name: string;
  type: string;
}

export interface CreateDeploymentPayload {
  incidentId: string | null;
  incidentName: string | null;
  incidentType: IncidentType | null;
  incidentState: string | null;
  incidentStartDate: string | null;
  positionId: string | null;
  positionFreeText: string | null;
  orgId: string | null;
  startDate: string;
  endDate: string | null;
  hours: number | null;
  supervisorName: string | null;
  supervisorEmail: string | null;
  notes: string | null;
}

export interface DeploymentFilters {
  status: DeploymentStatus | 'all';
  verificationTier: VerificationTier | 'all';
  dateFrom: string | null;
  dateTo: string | null;
  search: string;
  page: number;
  perPage: number;
}
```

**2. Zod validators**

File: `src/lib/validators/profile.ts`
— Schema: `profileUpdateSchema` validating firstName (1-100 chars), lastName (1-100 chars), phone (nullable, E.164 regex `/^\+[1-9]\d{1,14}$/` if provided), locationCity (nullable, max 100), locationState (nullable, max 50), locationCountry (nullable, max 50, default "US"), bio (nullable, max 500 chars), affinityIds (array of UUID strings)

File: `src/lib/validators/deployments.ts`
— Schema: `createDeploymentSchema` validating startDate (required, ISO date string, not in future), endDate (nullable, >= startDate, not in future), hours (nullable, int, 1–8760), supervisorName (nullable, max 200), supervisorEmail (nullable, valid email), notes (nullable, max 2000), positionId (nullable UUID), positionFreeText (nullable, max 200), incidentId (nullable UUID), incidentName/incidentType/incidentState/incidentStartDate for inline creation, orgId (nullable UUID). Custom refinement: either positionId or positionFreeText must be non-null.

**3. Data access queries**

File: `src/lib/queries/profile.ts`
Functions:
- `getProfile(supabase, userId)` — fetches user row, joins user_organizations → organizations, joins user_affinities → affinities, counts deployment_records and user_certifications for stats
- `updateProfile(supabase, userId, payload)` — updates user row fields, deletes and re-inserts user_affinities in a transaction
- `uploadAvatar(supabase, userId, file)` — uploads to Supabase Storage `avatars/{userId}/avatar.{ext}`, returns public URL, updates user.avatar_url

File: `src/lib/queries/deployments.ts`
Functions:
- `listDeployments(supabase, userId, filters)` — paginated query with joins to incidents, positions, organizations; applies filters; counts validation_requests and evaluation_requests per record
- `getDeployment(supabase, userId, recordId)` — single record with all joins
- `createDeployment(supabase, userId, payload)` — creates incident inline if needed, then creates deployment_record with status `draft` and verification_tier `self_certified`
- `updateDeployment(supabase, userId, recordId, payload)` — updates draft record only (check status = 'draft')
- `submitDeployment(supabase, userId, recordId)` — changes status from `draft` to `submitted` (check current status is `draft`)

File: `src/lib/queries/incidents.ts`
Functions:
- `searchIncidents(supabase, query)` — ILIKE search on incidents.name, returns top 10 matches ordered by start_date desc
- `createIncident(supabase, payload)` — creates new incident row, returns id

File: `src/lib/queries/positions-search.ts`
Functions:
- `searchPositions(supabase, query, category?)` — ILIKE search on positions.title, optional filter by resource_category, returns top 20 matches grouped by category
- `getPositionCategories(supabase)` — distinct resource_category values for filter dropdown

**4. Server actions**

File: `src/lib/actions/profile.ts`
- `updateProfileAction(formData)` — server action using `createServerClient`, validates with Zod, calls `updateProfile`, revalidates `/dashboard/profile`
- `uploadAvatarAction(formData)` — server action, extracts file, validates size/type, calls `uploadAvatar`, revalidates

File: `src/lib/actions/deployments.ts`
- `createDeploymentAction(formData)` — server action, validates with Zod, calls `createDeployment`, redirects to `/dashboard/records/[id]`
- `updateDeploymentAction(recordId, formData)` — server action, validates, calls `updateDeployment`, revalidates
- `submitDeploymentAction(recordId)` — server action, calls `submitDeployment`, revalidates

**5. Route pages**

File: `src/app/(dashboard)/dashboard/profile/page.tsx` (Server Component)
- Calls `getUser()` to get authenticated user
- Calls `getProfile()` with server Supabase client
- Renders ProfileHeader, ProfileDetails, ProfileAffinities, ProfileStats
- "Update Profile" button links to `/dashboard/profile/edit`

File: `src/app/(dashboard)/dashboard/profile/edit/page.tsx` (Client Component wrapped in server loader)
- Server loader fetches profile + all affinities
- Client component renders ProfileEditForm with AffinitySelector and AvatarUpload
- Form submits via server action `updateProfileAction`
- On success, redirects to `/dashboard/profile`

File: `src/app/(dashboard)/dashboard/records/page.tsx` (Server Component)
- Calls `getUser()` for auth
- Reads filter params from searchParams
- Calls `listDeployments()` with filters
- Renders RecordsList with RecordsFilters and pagination
- "Record a Deployment" button links to `/dashboard/records/new`
- Empty state component if no records

File: `src/app/(dashboard)/dashboard/records/new/page.tsx` (Client Component wrapped in server loader)
- Server loader fetches position categories and user's organizations
- Client component renders RecordForm with IncidentSelector, PositionSelector
- Form submits via `createDeploymentAction`

File: `src/app/(dashboard)/dashboard/records/[id]/page.tsx` (Server Component)
- Calls `getDeployment()` — returns 404 if not found or not owned by user
- Renders RecordDetail with RecordVerificationBadge, RecordStatusBadge, RecordActions
- If status is `draft`: show Edit and Submit buttons
- If status is `submitted`: show "Request Validation" and "Request Evaluation" buttons (disabled with tooltip "Coming in a future update" — these will be wired in DOC-400/402)

File: `src/app/(dashboard)/dashboard/records/[id]/edit/page.tsx` (Client Component)
- Only accessible if record status is `draft` — redirect to detail page if submitted/verified
- Pre-populates RecordForm with existing data
- Submits via `updateDeploymentAction`

**6. Components**

All components in `src/components/dashboard/profile/` and `src/components/dashboard/records/` as listed in the Structure section above. Use Tailwind CSS 4 with the Grey Sky brand tokens. Mobile-first responsive design. No external UI libraries — build from Tailwind primitives.

**Component design guidelines:**
- Cards use `bg-white rounded-lg shadow-sm border border-[var(--gs-silver)]`
- Badges use `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium`
  - Self-Certified/Draft: `bg-gray-100 text-gray-700`
  - Validated/Submitted: `bg-[var(--gs-gold)]/10 text-[var(--gs-gold)]`
  - Evaluated/Verified: `bg-green-100 text-green-700`
- Section headings: `text-lg font-semibold text-[var(--gs-navy)]`
- Form labels: `text-sm font-medium text-[var(--gs-slate)]`
- Form inputs: `w-full rounded-md border border-[var(--gs-silver)] px-3 py-2 text-sm focus:border-[var(--gs-gold)] focus:ring-1 focus:ring-[var(--gs-gold)]`
- Primary buttons: `bg-[var(--gs-navy)] text-white hover:bg-[var(--gs-navy)]/90 px-4 py-2 rounded-md text-sm font-medium`
- Secondary buttons: `border border-[var(--gs-navy)] text-[var(--gs-navy)] hover:bg-[var(--gs-navy)]/5 px-4 py-2 rounded-md text-sm font-medium`

**7. Sidebar navigation update**

Modify `src/components/dashboard/NavLinks.tsx` (or equivalent sidebar nav component) to add:
- "Profile" link → `/dashboard/profile` (icon: UserCircle or equivalent)
- "Service Record" link → `/dashboard/records` (icon: ClipboardList or equivalent)

These should appear in the sidebar below the existing Dashboard home link.

### US States and Territories Constant

File: `src/lib/constants/states.ts`
Export an array of `{ value: string, label: string }` with all 50 US states, DC, and 5 territories (AS, GU, MP, PR, VI) for the state dropdown.

### Test Criteria

After building, verify:
1. `npm run build` passes with zero errors
2. Navigate to `/dashboard/profile` — see profile with all sections
3. Navigate to `/dashboard/profile/edit` — form pre-populated, save works
4. Navigate to `/dashboard/records` — empty state shown for new user
5. Navigate to `/dashboard/records/new` — form renders with incident search and position search
6. Create a record with an existing RTLT position — record appears in list
7. Create a record with free-text position — record appears in list
8. Create a record with inline incident creation — incident created, linked to record
9. Submit a draft record — status changes to submitted, record becomes non-editable
10. Filter records by status — list updates correctly
11. Record detail page shows verification tier badge and status badge
12. Cannot access another user's records (Supabase RLS enforced)

### Commit Messages

Split into two commits:
1. `feat: member profile — view, edit, avatar upload, affinities (DOC-202)`
2. `feat: deployment records — list, create, detail, edit, submit (DOC-203)`

Or a single commit if built together:
`feat: member profile + deployment records — profile view/edit, record CRUD, incident/position selectors (DOC-202, DOC-203)`
