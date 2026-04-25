---
doc_id: GSR-DOC-203
title: "Deployment Records — List + Create + Detail"
phase: 2
status: draft
blocks_on:
  - GSR-DOC-201
  - GSR-DOC-003
priority: critical
author: Roy E. Dunn
created: 2026-04-13
updated: 2026-04-24
notes: Split from GSR-DOC-202-203-PROFILE-DEPLOYMENTS.md on 2026-04-24 per NAMING-CONVENTIONS.md. Companion doc is GSR-DOC-202-MEMBER-PROFILE.md. The form built from this doc IS the digital ICS 222 Response Report (Rev 3/26 adapted) — see ICS 222 Block Mapping section. Combined Claude Code build prompt at docs/prompts/GSR-DOC-202-PROMPT.md.
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

**`deployment_records`** — created in DOC-002, expanded in `20260418000001_ics222_response_report.sql` to align with Grey Sky adapted ICS 222 (Rev 3/26):
- `id` uuid (PK)
- `user_id` uuid → users
- `incident_id` uuid → incidents (nullable — allow records without a registered incident)
- `position_id` uuid → positions (nullable — allow free-text position if not in RTLT)
- `position_free_text` text (nullable) — **ICS 222 Block 5** free-text position when not in RTLT
- `org_id` uuid → organizations (nullable)
- `start_date` date
- `end_date` date (nullable — ongoing deployments)
- `hours` integer (nullable — calculated or manual)
- `total_days` integer (nullable) — **ICS 222 Block 9** total days on incident
- `operational_periods` integer (nullable) — **ICS 222 Block 9** operational periods served
- `operational_setting` enum: `eoc` | `icp` | `fob` | `boo` | `field_staging` | `jfo` | `other` — **ICS 222 Block 8**
- `operational_setting_other` text (nullable) — when setting = `other`
- `compensation_status` enum: `paid` | `volunteer` | `mutual_aid` | `other` — **ICS 222 Block 13**
- `compensation_status_other` text (nullable) — when status = `other`
- `duties_summary` text (nullable) — **ICS 222 Block 14** summary of duties and responsibilities
- `key_accomplishments` text (nullable) — **ICS 222 Block 15** key accomplishments and activities
- `personnel_supervised` text (nullable) — **ICS 222 Block 16** range of personnel managed
- `equipment_supervised` text (nullable) — **ICS 222 Block 16** range of equipment/vehicles managed
- `verification_tier` enum: `self_certified` | `validated_360` | `evaluated_ics225`
- `supervisor_name` varchar (nullable)
- `supervisor_email` varchar (nullable)
- `notes` text (nullable) — **ICS 222 Block 17** Remarks
- `status` enum: `draft` | `submitted` | `verified`
- `self_certified_at` timestamptz (nullable) — **ICS 222 Block 18** explicit self-certification timestamp
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
- Create button: "Submit Response Report" — not "Add Record" or "New Entry" or "Record a Deployment"
- The form IS the ICS 222 Response Report. Every field maps to an ICS 222 block.
- Empty state heading: "Your service record starts here."
- Empty state body: "Every deployment you record becomes part of your verified professional history. Submit your first Response Report — document what you did, where, and what you accomplished."
- Verification tier labels displayed to member:
  - Self-Certified: "Self-Reported" with gray badge — "You recorded this deployment."
  - Validated 360: "Peer Verified" with gold badge — "Confirmed by a colleague or supervisor."
  - Evaluated ICS 225: "Formally Evaluated" with green badge — "Evaluated against ICS performance standards."
- Status labels:
  - Draft: "Draft" gray — "Not yet submitted. You can still edit this record."
  - Submitted: "Submitted" gold — "Submitted to your service record."
  - Verified: "Verified" green — "Confirmed through independent verification."
- Submit confirmation dialog includes self-certification language: "I certify that the information in this report is accurate and complete to the best of my knowledge. Once submitted, this record becomes part of your permanent service history."
- Supervisor fields label: "Supervisor / Point of Contact" — subtitle: "Optional. Used for verification requests."
- Notes label: "Remarks" — placeholder: "Any additional information relevant to this deployment record." (ICS 222 Block 17)
- Duties summary label: "Summary of Duties and Responsibilities" — placeholder: "Describe duties performed, scope of authority, reporting relationships, and key functions." (ICS 222 Block 14)
- Key accomplishments label: "Key Accomplishments and Activities" — placeholder: "Describe significant accomplishments, outcomes, and contributions to incident objectives." (ICS 222 Block 15)

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

## Agent Lenses

- **Baseplate** (data/schema): No new tables or migrations. Composite indexes on `deployment_records(user_id, start_date)` and `deployment_records(user_id, verification_tier)` already exist from DOC-002.

- **Meridian** (doctrine): Position selector uses the full 625-entry RTLT taxonomy seeded in DOC-003. NIMS typing levels (Type 1–5) displayed correctly. Incident types align with FEMA terminology (disaster, exercise, planned_event, training, steady_state). Verification tier names match the platform's three-tier model.

- **Lookout** (UX): Records list uses card layout with clear tier/status badges visible at glance. Create form is a single page, not a multi-step wizard — responders filling this out may be on a phone in the field. Position search has category grouping to narrow 625 entries.

- **Threshold** (security): RLS is the trust boundary for deployment_records. No application-layer authorization beyond confirming authentication. Supervisor email is PII — never exposed beyond the member's own view (and future admin, DOC-904).

## ICS 222 Response Report — Block Mapping

The deployment record form (RecordForm.tsx) is the digital implementation of the Grey Sky adapted **ICS 222 Response Report** (Rev 3/26). Every form field maps to an ICS 222 block:

| Block | ICS 222 Field | DB Column | Form Section |
|-------|---------------|-----------|---------------|
| 1 | Incident Name | `incidents.name` | Incident selector |
| 2 | Incident Number | `incidents.incident_number` | Auto from incident |
| 3 | Date/Time Prepared | `deployment_records.created_at` | Auto |
| 4 | Name | `users.first_name/last_name` | Auto from auth |
| 5 | Position Held | `position_id` / `position_free_text` | Position selector |
| 6 | Home Agency/Org | `org_id` | Org selector |
| 7 | Incident Location | `incidents.location_state/county` | From incident |
| 8 | Operational Setting | `operational_setting` / `_other` | Radio group |
| 9 | Dates/Duration | `start_date`, `end_date`, `total_days`, `operational_periods` | Date fields |
| 10 | Complexity Level | `incidents.complexity_level` | From incident |
| 11 | Incident Type | `incidents.incident_type` | From incident |
| 12 | Declaration Status | `incidents.fema_*` fields | From incident |
| 13 | Compensation Status | `compensation_status` / `_other` | Radio group |
| 14 | Summary of Duties | `duties_summary` | Textarea |
| 15 | Key Accomplishments | `key_accomplishments` | Textarea |
| 16 | Resources Managed | `personnel_supervised`, `equipment_supervised` | Dropdowns |
| 17 | Remarks | `notes` | Textarea |
| 18 | Self-Certification | `self_certified_at` + submit action | Checkbox + submit |
| 19 | Validation | `validation_requests` table | Post-submit modal |

**Doctrinal note:** "The ICS 222 documents the deployment. The ICS 225 evaluates performance. Both together create a complete incident service record."

**The standalone IncidentCreateForm (`/dashboard/incidents/new`) is deprecated for user-facing use.** Incidents are created inline during Response Report submission or imported from FEMA data. The incidents table remains as a shared registry.

## Companion Doc

- **GSR-DOC-202-MEMBER-PROFILE.md** — the responder's identity record; deployment record stats roll up into profile.

## Build Prompt

See `docs/prompts/GSR-DOC-202-PROMPT.md`. The prompt covers DOC-202 (Member Profile) and this doc together — Claude Code may execute both features in a single session.
