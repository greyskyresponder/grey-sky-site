---
doc_id: GSR-DOC-000
title: Platform Reference Specification
phase: 0
status: approved
blocks_on: []
priority: critical
author: Roy E. Dunn
created: 2026-03-04
updated: 2026-04-09
notes: Canonical platform spec. All phase docs reference this for schema, API contracts, and entity definitions.
---

# Grey Sky Responders — Platform Reference Specification

> **Origin:** Master build prompt authored by Roy E. Dunn in Claude App (March 2026).
> **Role:** This is the single source of truth for database schema, API endpoints, SRT-CAP workflows, security requirements, and system architecture. Phase-specific design docs (GSR-DOC-001+) reference this document — they do not duplicate it.

---

Read the entire codebase first. This is the Grey Sky Responder Society platform — a FEMA NQS/RTLT-aligned professional credentialing and team assessment system for disaster responders. It is owned by Longview Solutions Group LLC (Florida, EIN 87-3155203, DBA Grey Sky Responders).

We are evolving this from a marketing site into a full platform that serves THREE user types and TWO service models simultaneously:

**User Types:**
1. Individual Responders — own their profile, control privacy, self-directed certification, $100/year membership
2. Agencies/Organizations — sponsor their people, see ONLY certification status and readiness for what they sponsor (consent-based, scoped visibility), do NOT see full private profiles
3. Specialty Response Teams (SRTs) — organizational clients receiving packaged SRT-CAP assessment and certification services

**Service Models:**
1. Individual credentialing — member pays $100/year, gets 100 Sky Points, builds career record, pursues verification and certification
2. SRT-CAP Package — state EM agency or organization contracts Longview to assess their SRTs. Workflow: self-assessment → onsite assessment → field report → final report → team credentialing + individual member certifications. Custom-quoted per engagement.

**Context:** Longview Solutions Group is currently under contract with the Florida Division of Emergency Management (FDEM) delivering SRT-CAP assessments across 13 SRT disciplines statewide. Florida uses their own ReadyOp instance. This platform is being built so Longview can sell this service to ALL OTHER STATES with the platform as the delivery mechanism.

**The 13 SRT Disciplines:**
1. Urban Search & Rescue (US&R)
2. Swiftwater/Flood Rescue (SWFRT)
3. Hazardous Materials (HazMat)
4. SWAT
5. Bomb Squad
6. Waterborne SAR
7. Land SAR
8. Small Unmanned Aircraft Systems (sUAS)
9. Rotary Wing SAR
10. Animal Rescue/SAR
11. Incident Management Teams (IMT)
12. EOC Management Support Teams
13. Public Safety Dive Teams (newly added)

---

## SESSION TASKS — Execute in this order:

### 1. UPDATE EXISTING MARKETING PAGES

Keep the existing public marketing pages but make these changes:

- Remove the three-tier pricing ($99/$499/$999) entirely
- Replace with single membership: $100/year, includes 100 Sky Points
- Add explanation of Sky Points economy (10 points = $1 value, used for verification services)
- Add the three-tier verification model:
  - Self-Certified (free with record entry) — member enters the record themselves
  - Validated 360 (10 Sky Points) — supervisor/colleague confirms the record via email attestation
  - Evaluated ICS 225 (20 Sky Points) — formal evaluation modeled on ICS 225, five performance areas rated 1-5
- Add certification pathways section: $500 per pathway (5,000 Sky Points)
- Update the SRT disciplines list to include all 13 (add Public Safety Dive Teams)
- Add a "For State Agencies" section on the marketing site explaining the SRT-CAP service:
  - Statewide SRT assessment and credentialing program
  - Self-assessment collection and analysis
  - Onsite expert assessment with typed credentialing outcomes
  - Field reports and final assessment reports
  - Individual team member certifications
  - Real-time readiness dashboards
  - Reference: Currently under contract with the Florida Division of Emergency Management
- Update CTA buttons to point to /register (individual) and /contact (agencies)
- Keep the Longview Solutions Group attribution in the footer

### 2. BACKEND FOUNDATION

Create a /backend directory with Express.js + TypeScript:

```
/backend
  /src
    /routes       — API route handlers
    /middleware    — auth, validation, rate limiting
    /services     — business logic
    /models       — TypeScript interfaces/types
    /migrations   — database migrations
    /seeds        — reference data seeds
  tsconfig.json
  package.json
```

Create a docker-compose.yml at the project root:
- PostgreSQL 16 with PostGIS extension (port 5432)
- The backend API service (port 3001)
- The frontend Next.js service (port 3000)
- Include .env.example with all required environment variables

### 3. DATABASE SCHEMA

Create the complete schema with these entities. Use node-pg-migrate for migrations.

**Core User & Organization:**
- `users` (id uuid, email, password_hash, first_name, last_name, phone, location_city, location_state, location_country, bio, avatar_url, mfa_enabled boolean, membership_status enum[active/expired/none], membership_paid_by enum[self/organization], membership_expires_at, status enum[active/suspended/deactivated], created_at, updated_at)
- `organizations` (id uuid, name, type enum[state_agency/county_agency/city_agency/fire_department/sheriff/private/federal/tribal], jurisdiction_level enum[federal/state/county/city/district], state, county, website, logo_url, sponsorship_enabled boolean, status enum[active/inactive], created_at, updated_at)
- `user_organizations` (id uuid, user_id, org_id, role enum[member/team_lead/admin/assessor], title, start_date, end_date, sponsorship_active boolean, sponsorship_scope jsonb, created_at)

**Deployment & Verification:**
- `incidents` (id uuid, name, description, type enum[disaster/exercise/planned_event/training/steady_state], declaration_number, fema_disaster_number, start_date, end_date, state, county, status enum[active/closed], created_at)
- `positions` (id uuid, title, nims_type enum[type1/type2/type3/type4/type5], complexity_level, resource_category, rtlt_code, discipline, description, requirements_json jsonb)
- `deployment_records` (id uuid, user_id, incident_id, position_id, org_id, start_date, end_date, hours, verification_tier enum[self_certified/validated_360/evaluated_ics225], supervisor_name, supervisor_email, notes, status enum[draft/submitted/verified], created_at, updated_at)
- `validation_requests` (id uuid, deployment_record_id, requestor_id, validator_email, validator_name, validator_user_id, status enum[pending/confirmed/denied/expired], response_text, attestation_text, attestation_accepted boolean, responded_at, token uuid unique, expires_at, created_at)
- `evaluation_requests` (id uuid, deployment_record_id, requestor_id, evaluator_email, evaluator_name, evaluator_user_id, status enum[pending/completed/denied/expired], rating_leadership int, rating_tactical int, rating_communication int, rating_planning int, rating_technical int, overall_rating decimal, commentary text, attestation_text, attestation_accepted boolean, responded_at, token uuid unique, expires_at, created_at)

**Sky Points Economy:**
- `sky_points_ledger` (id uuid, user_id, transaction_type enum[membership_credit/purchase/spend/refund/admin_adjustment/sponsor_credit], amount integer, balance_after integer, reference_type varchar, reference_id uuid, description, created_at) — APPEND ONLY TABLE, no updates, no deletes. Add database trigger to enforce.

**Documents & Certifications:**
- `documents` (id uuid, user_id, org_id nullable, filename, blob_url, mime_type, file_size_bytes, category enum[certificate/license/training_record/assessment_report/field_report/self_assessment/photo_id/other], linked_record_type varchar, linked_record_id uuid, ai_extracted_data jsonb, upload_status enum[pending/processed/failed], created_at)
- `certification_pathways` (id uuid, title, discipline, description, required_positions jsonb, required_training jsonb, required_evaluations int, requirements_json jsonb, status enum[active/draft/retired], created_at)
- `user_certifications` (id uuid, user_id, pathway_id, status enum[in_progress/pending_review/certified/expired/revoked], progress_json jsonb, certified_at, expires_at, approved_by uuid, approved_at, created_at)

**SRT-CAP Assessment Workflow (CRITICAL — this supports the state agency service model):**
- `srt_cap_engagements` (id uuid, organization_id, state_agency_id uuid references organizations, discipline enum matching 13 SRT types, team_name, team_size int, engagement_status enum[quoted/contracted/self_assessment_sent/self_assessment_received/assessment_scheduled/assessment_complete/field_report_delivered/final_report_delivered/closed], quoted_price decimal, contract_reference varchar, notes, created_at, updated_at)
- `srt_cap_self_assessments` (id uuid, engagement_id, sent_at, due_date, received_at, reviewed_by uuid, review_notes, status enum[pending/sent/received/under_review/reviewed], created_at)
- `srt_cap_sa_sections` (id uuid, self_assessment_id, section_number int, section_title varchar, self_score int check 0-3 or null, meets_standard enum[yes/no/na/not_evident], narrative text, form_data jsonb, created_at, updated_at)
  — The self-assessment tool has 11 sections based on the actual SRT-CAP Self-Assessment Tool V3.0:
    (1) Team Identification — team name, sponsoring agency, POC, typing level sought, willingness to deploy (county/statewide/EMAC/federal)
    (2a) Deployment/Activation/Callout History — up to 3 deployment reports with: incident name, dates, team leader, jurisdiction, deployment type, typing level, environment checkboxes, metrics (members deployed, disciplines, operational tempo), capabilities delivered checkboxes, executive summary narrative
    (2b) Deployment AAR/Improvement Plan — table of issues, corrective actions, completion dates, costs
    (3) Administrative Compliance — MOUs (partners, review date), insurance coverage (types, carrier), SOPs checklist (14 policy areas: program governance, credentialing, training plan, deployment ops, mobilization, cache readiness, finance, comms, records, AAR, self-assessment, COOP, mutual aid, annual reporting — each Yes/No/In Progress)
    (4) Personnel — staffing matrix: positions vs NIMS typing minimums (Type IV/III/II/I), actual rostered count per position. No double-counting across positions.
    (5) Equipment & Cache Readiness — MRP evaluation (scored 0-3 per MRP: Canine, Comms, HazMat, Logistics, Medical, Search, Structures, Tech Rescue, Tunnel, Water) + cache evaluation (PPE, comms, technical, medical, hazmat, safety — each 0-3) + equipment gap table (item, units needed, unit cost, total cost)
    (6) Operational Capabilities — scored 0-3 per capability area (discipline-specific, e.g. wide-area search, structural collapse, confined space, trench, mass transport, companion animal, all-hazards coordination)
    (7) Training — ICS/NIMS compliance (IS-100/200/700/800, ICS-300/400, position-specific), tracking platform, training improvement plan table by position (36-month goals, costs)
    (8) Exercises — FSE/FE/TTX counts past 3 years, evaluated Y/N, AAR/IP completed Y/N, lessons applied, exercise improvement plan table
    (9) Supplemental Information — unique capabilities narrative, estimated daily deployment cost by typing level, team size
    (10) Improvement Plan Roll-Up — aggregated from sections 2b, 5, 7, 8
    (11) Certification Statement — signatures
- `srt_cap_site_assessments` (id uuid, engagement_id, scheduled_date, location_address, location_city, location_state, lead_assessor_id uuid, assessor_ids uuid[], status enum[scheduled/in_progress/complete/cancelled], observations jsonb, created_at, updated_at)
- `srt_cap_reports` (id uuid, engagement_id, report_type enum[field_report/final_report], document_id uuid references documents, credentialing_outcome enum[credentialed/not_credentialed/conditional], typing_level enum[type1/type2/type3/type4], created_at)
- `srt_cap_report_sections` (id uuid, report_id, section_number int, section_title varchar, meets_standard enum[yes/no/na], score int check 0-3 or null, assessor_observations text, assessor_recommendations text, created_at, updated_at)
  — The Assessor's Report has these sections matching the self-assessment (based on actual SRT-CAP Assessor's Report HazMat V3):
    Header fields on srt_cap_reports: assessment_date, assessed_team_name, assessed_typing_level, rtlt_version, assessment_type varchar
    (1) Team Identification — N/A for scoring
    (2a) Deployment/Activation/Callout History — Y/N meets standard, score 0-3, observations
    (2b) Deployment AAR/Improvement Plan — Y/N, score, observations + recommendations
    (3) Administrative Compliance — Y/N, score, observations + recommendations
    (4) Personnel — Y/N, score, observations
    (5) Equipment Capabilities — Y/N, score, observations + recommendations
    (6) Operational Capabilities Self-Assessment — Y/N, score, observations + recommendations
    (7) Training — Y/N, score, observations + recommendations
    (8) Exercises — Y/N, score, observations + recommendations
    (9) Supplemental Information — Y/N, score, observations + recommendations
    (10) Improvement Plan Roll-Up — Y/N, score
    (11) Certification Statement — N/A
    Additional fields on srt_cap_reports:
    - capital_cache_confirmed boolean (equipment visually confirmed)
    - deployment_capability_validated boolean
    - training_verified boolean
    - ics_nims_compliant boolean
    - training_platform varchar (Excel/Arcadis/SharePoint/Other)
    - final_readiness_type3_rating int (0-3 or null)
    - final_readiness_type2_rating int (0-3 or null)
    - final_readiness_type1_rating int (0-3 or null)
    - lead_assessor_id uuid
    - lead_assessor_name varchar
    - team_leader_name varchar
    - sert_chief_name varchar
    - delivered_at timestamp
- `srt_cap_team_members` (id uuid, engagement_id, user_id, role_on_team varchar, certification_status enum[pending/certified/not_certified], certification_id uuid references user_certifications, created_at)

**Affinities & Taxonomy:**
- `affinities` (id uuid, category enum[hazard_type/functional_specialty/sector_experience], value varchar, description, sort_order int)
- `user_affinities` (user_id uuid, affinity_id uuid, primary key both)

**Audit:**
- `audit_log` (id uuid, actor_id uuid, actor_type enum[user/system/admin], action varchar, entity_type varchar, entity_id uuid, details_json jsonb, ip_address inet, created_at) — APPEND ONLY, no updates, no deletes.

**Add proper indexes on:**
- All foreign keys
- users.email (unique)
- users.membership_status
- deployment_records.user_id + verification_tier
- srt_cap_engagements.organization_id + state_agency_id + discipline
- srt_cap_engagements.engagement_status
- sky_points_ledger.user_id + created_at
- audit_log.entity_type + entity_id
- audit_log.actor_id + created_at
- validation_requests.token (unique)
- evaluation_requests.token (unique)

### 4. SEED DATA

Create seed scripts for:

**NIMS/ICS Positions** — populate the positions table with standard ICS positions across complexity levels:
- Command Staff (IC, Deputy IC, Safety Officer, PIO, Liaison)
- Operations Section (Ops Chief, Division/Group Supervisor, Branch Director, Task Force/Strike Team Leader)
- Planning Section (PSC, Situation Unit Leader, Resources Unit Leader, Documentation Unit Leader, Demob Unit Leader)
- Logistics Section (LSC, Supply Unit Leader, Facilities Unit Leader, Ground Support Unit Leader, Comms Unit Leader, Food Unit Leader, Medical Unit Leader)
- Finance Section (FSC, Time Unit Leader, Procurement Unit Leader, Comp/Claims Unit Leader, Cost Unit Leader)
- Each with Type 1 through Type 4 complexity levels where applicable

**SRT Disciplines** — all 13 as affinity entries plus reference data

**Affinity Controlled Vocabulary:**
- Hazard types: Hurricane, Tornado, Flood, Earthquake, Wildfire, HazMat Release, Structural Collapse, Mass Casualty, Pandemic, Radiological, Terrorism, Cyber, Dam/Levee Failure
- Functional specialties: Incident Command, Operations, Planning, Logistics, Finance/Admin, Emergency Communications, Damage Assessment, Mass Care, Evacuation, Search & Rescue, Law Enforcement, Fire Suppression, EMS, Public Health, Environmental Response
- Sector experience: Federal, State, County, Municipal, Tribal, Private Sector, NGO/Voluntary, Military, International

### 5. AUTHENTICATION

Set up NextAuth.js (Auth.js v5) with:
- Credentials provider (email + password) for initial launch
- Password hashing with bcrypt, minimum 12 characters, complexity requirements
- JWT session tokens
- Role-based access: member, org_admin, assessor, platform_admin
- Protected route middleware for /dashboard/* routes
- Protected route middleware for /agency/* routes (org_admin role required)
- Protected route middleware for /admin/* routes (platform_admin role required)
- MFA placeholder — add the UI toggle and database field, wire up later with Azure AD B2C
- /login page with Grey Sky branding
- /register page with Grey Sky branding — collects: first name, last name, email, password, state, primary discipline (optional)
- Session includes: userId, email, role, organizationId (if applicable)

### 6. MEMBER DASHBOARD (Individual Responder Experience)

Build these pages with Grey Sky brand styling (Navy #002E5D, Honey Gold #E39D1B, supporting palette from existing site). All pages mobile-responsive.

- `/dashboard` — main dashboard with sidebar nav. Shows: welcome message, membership status, Sky Points balance, verification progress summary, recent activity, quick actions
- `/dashboard/profile` — profile view and edit. Fields: name, photo, location, bio, organizations, affinities, positions held. Privacy controls: what's visible to agencies vs public
- `/dashboard/records` — deployment records list with filters (date, incident, position, verification tier). Each record shows verification status badge
- `/dashboard/records/new` — create deployment record form. Fields: incident (search/create), position (dropdown from NIMS taxonomy), organization, dates, hours, supervisor name/email, notes. Auto-sets to Self-Certified tier
- `/dashboard/records/[id]` — record detail with actions: request validation, request evaluation, upload supporting document
- `/dashboard/points` — Sky Points balance, transaction history (ledger view), purchase more points button (Stripe integration placeholder)
- `/dashboard/documents` — document library. Upload, categorize, link to records or pathways. Show AI processing status
- `/dashboard/certifications` — certification pathways available, progress on active pathways, earned certifications

### 7. AGENCY DASHBOARD (Organization/State Agency Experience)

- `/agency` — organization dashboard home. Shows: sponsored members count, assessment status overview, readiness summary by discipline
- `/agency/members` — list of sponsored members. Shows ONLY: name, role, certification status for sponsored disciplines, readiness status. Does NOT show: full deployment history, private records, other certifications, personal documents
- `/agency/assessments` — SRT-CAP engagement tracker. Shows all engagements with status pipeline: Contracted → Self-Assessment → Onsite → Field Report → Final Report → Closed
- `/agency/assessments/[id]` — engagement detail: team info, self-assessment status, assessment schedule, reports (downloadable), team member certification status, credentialing outcome and typing level
- `/agency/reports` — all delivered reports (field reports and final reports) downloadable
- `/agency/readiness` — readiness dashboard by SRT discipline: which teams are credentialed, at what type level, expiration dates, gaps

### 8. ADMIN/ASSESSOR TOOLS (for Longview team)

- `/admin` — platform admin dashboard. Member counts, engagement pipeline, revenue summary
- `/admin/engagements` — manage SRT-CAP engagements: create new, update status, assign assessors
- `/admin/engagements/new` — create engagement: select state agency, select organization being assessed, discipline, team name, team size, price, contract reference
- `/admin/engagements/[id]` — engagement management: send self-assessment, schedule onsite, upload field report, upload final report, record credentialing outcome and typing, certify individual team members
- `/admin/assessors` — assessor roster management
- `/admin/members` — member search and management

### 9. API ENDPOINTS

Build RESTful API routes in Express.js:

```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/logout
GET    /api/auth/session

GET    /api/users/me
PUT    /api/users/me
GET    /api/users/:id/public-profile

GET    /api/deployment-records
POST   /api/deployment-records
GET    /api/deployment-records/:id
PUT    /api/deployment-records/:id
DELETE /api/deployment-records/:id

POST   /api/validation-requests
GET    /api/validation-requests/:token  (public — validator responds here)
PUT    /api/validation-requests/:token/respond

POST   /api/evaluation-requests
GET    /api/evaluation-requests/:token  (public — evaluator responds here)
PUT    /api/evaluation-requests/:token/respond

GET    /api/sky-points/balance
GET    /api/sky-points/history
POST   /api/sky-points/purchase  (Stripe checkout session)

GET    /api/documents
POST   /api/documents/upload
GET    /api/documents/:id
DELETE /api/documents/:id

GET    /api/certifications/pathways
GET    /api/certifications/mine
GET    /api/certifications/:id

GET    /api/organizations/:id
GET    /api/organizations/:id/members  (scoped to sponsorship)
GET    /api/organizations/:id/readiness

GET    /api/srt-cap/engagements  (admin)
POST   /api/srt-cap/engagements  (admin)
GET    /api/srt-cap/engagements/:id
PUT    /api/srt-cap/engagements/:id
POST   /api/srt-cap/engagements/:id/self-assessment/send
POST   /api/srt-cap/engagements/:id/site-assessment
POST   /api/srt-cap/engagements/:id/reports
PUT    /api/srt-cap/engagements/:id/credentialing-outcome
POST   /api/srt-cap/engagements/:id/certify-members

GET    /api/positions  (reference data)
GET    /api/affinities  (reference data)
GET    /api/incidents
POST   /api/incidents

GET    /api/verify/:userId  (public credential verification)
```

All endpoints use:
- Input validation with zod schemas
- Parameterized SQL queries (no string concatenation)
- Proper error responses with consistent format
- Pagination on list endpoints
- Authentication middleware where required
- Role-based authorization where required

### 10. SECURITY — Build this from the start, not bolted on later

- Helmet.js for HTTP security headers
- CORS configured: allow frontend origin only
- Rate limiting: 5 login attempts per 15 minutes per IP, 100 API calls per minute per user
- Input validation with zod on ALL API endpoints — reject anything that doesn't match schema
- Parameterized queries ONLY — zero string concatenation in SQL
- CSRF protection on all state-changing endpoints
- Content Security Policy headers
- All secrets in environment variables, never in code
- Audit log writes on: login, registration, record creation, verification actions, point transactions, engagement status changes, credentialing outcomes
- Sky Points ledger: database trigger prevents UPDATE and DELETE on the table
- Validation/evaluation tokens: UUID v4, expire after 30 days, single use

### 11. COMMIT STRATEGY

Commit after each major section with clear messages:
1. "feat: update marketing pages — single membership, Sky Points, 13 SRT disciplines, state agency section"
2. "feat: backend foundation — Express.js + TypeScript, docker-compose, project structure"
3. "feat: database schema — all entities, indexes, constraints, append-only triggers"
4. "feat: seed data — NIMS/ICS positions, SRT disciplines, affinity vocabulary"
5. "feat: authentication — NextAuth.js, credentials provider, role-based middleware"
6. "feat: member dashboard — profile, records, points, documents, certifications"
7. "feat: agency dashboard — sponsored members, assessments, readiness"
8. "feat: admin tools — engagement management, assessor assignment, credentialing"
9. "feat: API endpoints — all routes with validation, auth, pagination"
10. "feat: security hardening — Helmet, CORS, rate limiting, CSP, audit logging"

Push to the greyskyresponder/grey-sky-site repo on the main branch after each commit.

---

## BRAND & DESIGN NOTES

- Primary: Navy #002E5D
- Accent: Honey Gold #E39D1B
- Supporting: Warm Sand #EEE1C3, Stone Gray #CCC8C4, Shadow #61524E
- White #FFFFFF, Body Text #333333
- Headings: serif font (match existing site)
- Body: clean sans-serif (match existing site)
- All dashboards: clean, professional, mobile-first. This is used by firefighters, law enforcement, and emergency managers — not tech workers. Clarity over cleverness. Every element must be immediately understandable.
- Status badges use color: Green = credentialed/verified, Gold = in progress, Red = expired/failed, Gray = not started
- Navigation: sidebar on desktop, bottom nav on mobile

## TECHNICAL NOTES

- This will migrate from Vercel to Azure Container Apps. For now, keep it deployable to Vercel for development, but don't use any Vercel-specific features that can't be moved.
- Database will be Azure PostgreSQL Flexible Server in production. Docker PostgreSQL for local dev.
- File storage will be Azure Blob Storage in production. Local filesystem for dev with an abstraction layer.
- Email will be SendGrid. For now, log emails to console in dev mode.
- Stripe in test mode only. Do not activate live payments.

## REFERENCE DOCUMENTS (available in the repo or uploaded separately)

The SRT-CAP form schemas above are derived from actual operational documents currently in use under the Florida DEM contract:

1. **FL_SRT_Self_Assessment_Tool_US_R_V3_1.pdf** — The US&R Self-Assessment Tool (31 pages, 11 sections). This is the template for all self-assessment forms. Other disciplines (HazMat, Swiftwater, SWAT, etc.) follow the same section structure with discipline-specific fields in Sections 4-6.

2. **FL_SRTCAP_Assessors_Report_HazMat_V3** — Completed Assessor's Reports for Hollywood, Fort Lauderdale, and Sunrise HazMat teams (February 2026). These show the finished deliverable format including the Assessment Summary Table, scoring, observations, recommendations, final readiness determination with per-type ratings, and signature blocks.

3. **SRT_CAP_SitRep_Feb_21_-_27.pdf** — Weekly SitRep showing the active assessment schedule, 13 disciplines, team roster, milestone tracking, and credentialing outcomes to date.

When building the SRT-CAP self-assessment forms in the platform, replicate the section structure from document #1. When building the assessor report interface, replicate the structure from document #2. The scoring key (0-3 + NA/NE) and the Final Readiness Determination table (ratings per typing level) must match exactly — these are the outputs that state agencies and FDEM receive.
