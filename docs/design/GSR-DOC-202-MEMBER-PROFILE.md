---
doc_id: GSR-DOC-202
title: "Member Profile — View + Edit"
phase: 2
status: draft
blocks_on:
  - GSR-DOC-201
  - GSR-DOC-003
priority: critical
author: Roy E. Dunn
created: 2026-04-13
updated: 2026-04-24
notes: Split from GSR-DOC-202-203-PROFILE-DEPLOYMENTS.md on 2026-04-24 per NAMING-CONVENTIONS.md "one doc per buildable unit" rule. Companion doc is GSR-DOC-203-DEPLOYMENT-RECORDS.md. The combined Claude Code build prompt covering both 202 and 203 is at docs/prompts/GSR-DOC-202-PROMPT.md.
---

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

## Agent Lenses

- **Baseplate** (data/schema): No new tables or migrations. All entities exist in DOC-002 schema. Types extend existing files. Foreign keys validated against existing schema.

- **Meridian** (doctrine): Affinity vocabulary aligns with NIMS/RTLT functional categories. Member-facing language uses "service" / "serving" — never "career."

- **Lookout** (UX): Profile view is a single-scroll page — no tabs within tabs. Empty states are encouraging, not clinical.

- **Threshold** (security): RLS is the trust boundary. No application-layer authorization beyond confirming authentication. Avatar uploads scoped to user's own path in storage bucket. Phone is PII — never exposed beyond the member's own view.

## Companion Doc

- **GSR-DOC-203-DEPLOYMENT-RECORDS.md** — deployment record list/create/detail, the substrate this profile's stats roll up from.

## Build Prompt

See `docs/prompts/GSR-DOC-202-PROMPT.md`. The prompt covers both DOC-202 (this doc) and DOC-203 — Claude Code may execute both features in a single session.
