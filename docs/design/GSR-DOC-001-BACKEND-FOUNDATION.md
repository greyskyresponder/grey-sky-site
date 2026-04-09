---
doc_id: GSR-DOC-001
title: Backend Foundation + Database Schema + Seed Data
phase: 2
status: approved
blocks_on: []
priority: critical
author: Roy E. Dunn
created: 2026-04-09
updated: 2026-04-09
notes: Covers Platform Spec sections 2, 3, 4. Replaces the old tenant-based schema with the spec-defined entity model.
---

## Purpose
Stand up the backend infrastructure, complete database schema, and reference data seeds. This is the data foundation everything else builds on — auth, dashboards, SRT-CAP workflows, and the Sky Points economy all depend on this schema being correct.

## Data Entities
All entities defined in GSR-DOC-000 sections 2-4. See `docs/design/GSR-DOC-000-PLATFORM-SPEC.md` for the authoritative schema definitions.

## Structure

### Backend API (`/backend`)
```
/backend
  /src
    /routes       — API route handlers (stub files only this phase)
    /middleware    — auth, validation, rate limiting (stubs)
    /services     — business logic (stubs)
    /models       — TypeScript interfaces matching all DB entities
    /migrations   — node-pg-migrate migration files
    /seeds        — reference data seed scripts
  tsconfig.json
  package.json
  .env.example
```

### Docker Compose (`docker-compose.yml` at project root)
- PostgreSQL 16 with pgcrypto extension (port 5432)
- Backend API service (port 3001)
- Frontend Next.js service (port 3000)
- `.env.example` with all required variables

## Business Rules

### Schema Rules (from Platform Spec)
- `sky_points_ledger` — APPEND ONLY. Database trigger must prevent UPDATE and DELETE.
- `audit_log` — APPEND ONLY. Database trigger must prevent UPDATE and DELETE.
- `validation_requests.token` — UUID v4, unique, expires after 30 days
- `evaluation_requests.token` — UUID v4, unique, expires after 30 days
- All enum constraints via CHECK constraints
- All foreign keys indexed
- `updated_at` auto-trigger on all tables that have it

### Schema Migration from Old Design
- The existing `supabase/schema.sql` uses a tenant-based model (tenants, responders, evidence, assessments, assessment_findings). This is the OLD schema.
- **Do NOT drop or modify the old schema yet** — leave `supabase/schema.sql` in place for reference.
- Create the new schema via Supabase migrations in `supabase/migrations/` using timestamped SQL files.
- The new schema follows GSR-DOC-000 exactly — users, organizations, user_organizations, incidents, positions, deployment_records, validation_requests, evaluation_requests, sky_points_ledger, documents, certification_pathways, user_certifications, all srt_cap_* tables, affinities, user_affinities, audit_log.

### Seed Data Requirements
**NIMS/ICS Positions** — populate `positions` table:
- Command Staff: IC, Deputy IC, Safety Officer, PIO, Liaison
- Operations: Ops Chief, Division/Group Supervisor, Branch Director, Task Force/Strike Team Leader
- Planning: PSC, Situation Unit Leader, Resources Unit Leader, Documentation Unit Leader, Demob Unit Leader
- Logistics: LSC, Supply Unit Leader, Facilities Unit Leader, Ground Support Unit Leader, Comms Unit Leader, Food Unit Leader, Medical Unit Leader
- Finance: FSC, Time Unit Leader, Procurement Unit Leader, Comp/Claims Unit Leader, Cost Unit Leader
- Each with Type 1-4 complexity levels where applicable
- Also seed from `references/FEMA_RTLT_NQS_Database.json` — 328 position qualifications with RTLT codes, categories, and requirements

**SRT Disciplines** — all 13:
US&R, Swiftwater/Flood Rescue, HazMat, SWAT, Bomb Squad, Waterborne SAR, Land SAR, sUAS, Rotary Wing SAR, Animal Rescue/SAR, IMT, EOC Management Support, Public Safety Dive Teams

**Affinity Controlled Vocabulary:**
- Hazard types: Hurricane, Tornado, Flood, Earthquake, Wildfire, HazMat Release, Structural Collapse, Mass Casualty, Pandemic, Radiological, Terrorism, Cyber, Dam/Levee Failure
- Functional specialties: Incident Command, Operations, Planning, Logistics, Finance/Admin, Emergency Communications, Damage Assessment, Mass Care, Evacuation, Search & Rescue, Law Enforcement, Fire Suppression, EMS, Public Health, Environmental Response
- Sector experience: Federal, State, County, Municipal, Tribal, Private Sector, NGO/Voluntary, Military, International

## Copy Direction
N/A — backend only, no user-facing content.

## Acceptance Criteria
- [ ] `/backend` directory exists with Express.js + TypeScript project structure
- [ ] `docker-compose.yml` at project root starts PostgreSQL 16, backend, and frontend
- [ ] `.env.example` documents all required environment variables
- [ ] TypeScript interfaces in `/backend/src/models/` match every entity in GSR-DOC-000
- [ ] Supabase migration files create all tables with correct columns, types, constraints, and indexes per GSR-DOC-000
- [ ] `sky_points_ledger` has database trigger preventing UPDATE/DELETE
- [ ] `audit_log` has database trigger preventing UPDATE/DELETE
- [ ] `updated_at` trigger fires on all applicable tables
- [ ] All foreign keys have indexes
- [ ] All unique constraints defined (users.email, validation_requests.token, evaluation_requests.token)
- [ ] Seed script populates positions table with ICS positions (Type 1-4) + RTLT position qualifications from JSON
- [ ] Seed script populates affinities with all three vocabulary categories
- [ ] Seed script populates 13 SRT discipline reference data
- [ ] `docker-compose up` runs without errors
- [ ] `npm run build` in both frontend and backend passes
- [ ] Migration can be applied to a clean database without errors

## Open Questions
- None — all entity definitions are settled in GSR-DOC-000.
