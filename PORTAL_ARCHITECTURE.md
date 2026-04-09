# Grey Sky Responder Credential Portal Architecture

## Mission Objective
Build a national credentialing platform that ingests FEMA RTLT/NQS standards once and serves every stakeholder:

- **States / jurisdictions** running programs like SRT-CAP.
- **Organizations** (health systems, utilities, private response teams) managing their own teams.
- **Individual responders** seeking portable, supervisor-verified credentials.

## Tenancy Model
| Tenant Type | Examples | Capabilities |
|-------------|----------|--------------|
| **Jurisdiction Program** | FL DEM SRT-CAP, state IMT offices | Discipline roster, assessment scheduling, assessor tasking, readiness dashboards |
| **Organization Program** | Hospital strike teams, utility storm crews, NGOs | Team credential cycles, internal rosters, compliance reporting |
| **Responder** | Individuals across 13+ disciplines | Credential portfolio, document uploads, supervisor references, deployment history |

All tenants ride on the same RTLT requirement library. Supabase/Postgres enforces tenancy via `tenant_id` on every entity plus role-based access control (RBAC).

## Core Data Entities
- **Jurisdictions / Organizations**: multi-tenant owners, metadata (region, contact, program type).
- **Programs**: discipline bundles (US&R, HazMat, Dive, etc.) tied to RTLT requirement sets.
- **Teams**: assessment targets (e.g., FL-TF3) with site visit history, readiness status.
- **Responders**: individuals with profile, deployments, skills, supervisor references.
- **Requirements**: derived from RTLT (training, certifications, PTBs, PPE, currency).
- **Evidence**: uploaded documents, endorsements, assessor notes with audit trails.
- **Assessments**: self-assessment submissions, site visits, scoring, final reports.
- **Travel Tasks (optional)**: hooks for Grey Sky Travel when assessments trigger movement.

## Workflow Overview
### 1. Team Programs (Jurisdiction/Organization)
1. **Intake**: self-assessments (ReadyOp form ingestion) populate program queue.
2. **Scheduling**: calendar + manifest for site visits, linked to Grey Sky Travel if needed.
3. **Assessment Execution**: assessor notes, photos, RTLT checklist captured via portal.
4. **Reporting**: readiness dashboards (credentialed/typing/date) + exportable assessor reports.
5. **Closeout**: action items assigned, credential status updated, next review date set.

### 2. Individual Responders
1. **Profile Creation**: verify identity, select discipline(s), import deployment history.
2. **Requirement Pack**: portal auto-generates RTLT checklist per discipline.
3. **Evidence Upload & References**: documents + supervisor endorsements tracked to completion.
4. **Verification Queue**: stewards validate evidence, log decisions, request clarifications.
5. **Credential Issuance**: publish badge + readiness state, portable across jurisdictions.

## Integrations
- **RTLT / FEMA Data**: JSON dataset staged (`data/rtlt`) — nightly job checks for updates.
- **ReadyOp**: ingest self-assessment responses via API/webhook into program intake.
- **Trello / Project boards**: optional sync for assessor tasking or punch lists.
- **Grey Sky Travel**: when site visits scheduled, push traveler manifests to GREYSKY-TRAVEL agent.

## Telemetry & Reporting
- **Adoption Dashboards**: counts by state, organization, discipline, responder status.
- **Throughput Metrics**: average time from intake → credential for teams and individuals.
- **Pipeline Health**: pending verifications, expiring credentials, geography heat maps.
- **Audit Logs**: every credential decision and document change is versioned for compliance.

## Scaling Considerations
- **Supabase/Postgres**: schema separated by tenants via `tenant_id`, plus row-level security.
- **File Storage**: Supabase storage buckets keyed by tenant + responder/team.
- **API Layer**: Next.js route handlers / Edge functions for programmatic access.
- **Future Hooks**: EMAC/Mutual Aid exports, state single sign-on, agency-specific forms.

## Next Steps
1. Finalize ERD + migration files reflecting entities above.
2. Build requirement-pack generator from RTLT JSON (maps each discipline to checklist).
3. Stand up Supabase project + seed baseline data (disciplines, requirements).
4. Implement responder onboarding flow in the Next.js app.
5. Implement program intake dashboard for jurisdictions/organizations.
