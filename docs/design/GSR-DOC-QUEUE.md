---
doc_id: GSR-DOC-QUEUE
title: Design Document Queue — Master Index
version: "1.0"
classification: INTERNAL — DEVELOPMENT REFERENCE
status: active
author: Roy E. Dunn
created: 2026-04-09
updated: 2026-04-24
notes: Canonical index. ATLAS scans this to determine build readiness. Nothing gets built without a design doc. Nothing gets a design doc without a number here. Filename and structure rules live in NAMING-CONVENTIONS.md — read it before adding entries.
---

# Grey Sky Responder Society — Design Document Queue

## Numbering Convention

| Range | Scope |
|-------|-------|
| GSR-DOC-000 | Platform Reference Specification (canonical) |
| GSR-DOC-0XX | Foundation and infrastructure (Phase 0) |
| GSR-DOC-1XX | Phase 1: Public Site |
| GSR-DOC-2XX | Phase 2: Member Portal + Payments |
| GSR-DOC-3XX | Phase 3: ATLAS Deployment + AI Layer |
| GSR-DOC-4XX | Phase 4: Validation / Evaluation Workflow |
| GSR-DOC-5XX | Phase 5: Certification + Credentialing Pathway |
| GSR-DOC-6XX | Organization Sponsorship + Team Credentialing |
| GSR-DOC-9XX | Cross-cutting concerns (security, DevOps, observability) |
| GSR-REF-* | Reference documents (informational only) |

## Phase Dependencies

```
Phase 1 ──── Public Site (no dependencies)
│
Phase 2 ──── Member Portal + Payments (requires Phase 1 registration flow)
│   │
│   Phase 3 ──── ATLAS + AI Layer (parallel with Phase 2)
│   │
Phase 4 ──── Validation / Evaluation (requires Phase 2 deployment records)
│
Phase 5 ──── Certification + Credentialing (requires Phase 4 verified records)

Phase 6 ──── Organization Sponsorship + Team Credentialing (parallel, requires Phase 2)
```

**Lifecycle:** draft → review → approved → in-build → complete

Claude Code only builds from docs with **status: approved** and **blocks_on: []** (all blockers resolved). ATLAS enforces this gate.

---

## Phase 0 — Foundation

| Doc ID | Title | Priority | Status | Blocks On | Notes |
|--------|-------|----------|--------|-----------|-------|
| GSR-DOC-000 | Platform Reference Specification | CRITICAL | ✅ APPROVED | — | Canonical spec. All docs reference this. |
| GSR-DOC-001 | Data Entity Map | CRITICAL | ✅ COMPLETE | — | Built as part of backend foundation. TypeScript models + 504-line SQL migration cover all entities and relationships. |
| GSR-DOC-002 | Database Schema + Migrations | CRITICAL | ✅ COMPLETE | DOC-001 | 001_initial_schema.sql: tables, indexes, constraints, triggers, enums. All deployed. |
| GSR-DOC-003 | Seed Data — Positions, Team Types, Disciplines, Affinities | CRITICAL | ✅ COMPLETE | DOC-002 | 112 ICS positions (Types 1–4), 328 RTLT qualifications, 13 SRT disciplines, 37 affinities. Idempotent seeds. |
| GSR-DOC-004 | Project Scaffolding + Docker Compose | CRITICAL | ✅ COMPLETE | — | Next.js 16 + Express backend + Docker Compose (Postgres 16). Azure SWA for production. |
| GSR-DOC-005 | Environment Configuration | HIGH | DRAFT | DOC-004 | .env.example, secrets management, storage/email abstraction layers. |
| GSR-DOC-006 | CI/CD Pipeline | NORMAL | DRAFT | DOC-004 | GitHub Actions: lint, type-check, build, test. Azure deployment. |

> **ATLAS Note (2026-04-09):** DOC-001 through DOC-004 were built together as a single Claude Code session (GSR-DOC-001-BACKEND-FOUNDATION). The queue originally numbered them separately; the build consolidated them. All acceptance criteria met — schema, models, seeds, Docker, builds clean.

---

## Phase 1 — Public Site

**Status (2026-04-09):** Dev site at greysky.dev substantially complete. Six pages live with consistent branding, RTLT taxonomy surfaced (17 disciplines, 612 entries), single membership at $100/yr with Sky Coins, waitlist CTA, Longview attribution.

| Doc ID | Title | Priority | Status | Blocks On | Notes |
|--------|-------|----------|--------|-----------|-------|
| GSR-DOC-100 | Public Site — Home + Navigation | CRITICAL | ✅ COMPLETE | — | Live at greysky.dev. Landing page, global nav, footer, waitlist CTA. 17 disciplines. Doc backfilled 2026-04-24: `GSR-DOC-100-PUBLIC-SITE-HOME.md`. |
| GSR-DOC-101 | Public Site — Membership Page | HIGH | REVIEW | OD-15 | Live at /membership. Copy alignment pending OD-15. Doc backfilled 2026-04-24: `GSR-DOC-101-PUBLIC-SITE-MEMBERSHIP.md`. |
| GSR-DOC-102 | Public Site — For Organizations + Agencies | HIGH | ✅ COMPLETE | — | Live at /organizations. Two-lane sponsorship pitch. Doc: `GSR-DOC-102-ORGANIZATIONS-PAGE.md`. |
| GSR-DOC-103 | Public Site — Standards + Disciplines | NORMAL | ✅ COMPLETE | — | Live at /standards. 17 RTLT discipline categories, 612 entries, detail pages. Doc backfilled 2026-04-24: `GSR-DOC-103-PUBLIC-SITE-STANDARDS.md`. |
| GSR-DOC-104 | Public Site — About / Mission | NORMAL | ✅ COMPLETE | — | Live at /about. Longview background, Grey Sky mission, deployment stats. Doc backfilled 2026-04-24: `GSR-DOC-104-PUBLIC-SITE-ABOUT.md`. |
| GSR-DOC-105 | Public Site — Contact Surface | NORMAL | REVIEW | — | No standalone /contact page. Footer mailto is current. Recommendation in backfilled doc: stay on mailto until volume warrants form. Doc: `GSR-DOC-105-PUBLIC-SITE-CONTACT.md`. |
| GSR-DOC-106 | Public Site — Tell Your Story | NORMAL | ✅ COMPLETE | — | Live at /story. Professional identity lifecycle. Doc backfilled 2026-04-24: `GSR-DOC-106-PUBLIC-SITE-STORY.md`. |
| GSR-DOC-107 | Public Site — Community | NORMAL | ✅ COMPLETE | — | Live at /community. Establishes Society framing. Doc backfilled 2026-04-24: `GSR-DOC-107-PUBLIC-SITE-COMMUNITY.md`. |

---

## Phase 2 — Member Portal + Payments

| Doc ID | Title | Priority | Status | Blocks On | Notes |
|--------|-------|----------|--------|-----------|-------|
| GSR-DOC-200 | Authentication — Registration + Login | CRITICAL | DRAFT | DOC-002, DOC-004 | NextAuth.js v5, credentials provider, bcrypt, JWT, role-based middleware. MFA placeholder. |
| GSR-DOC-201 | Member Dashboard — Layout + Navigation | CRITICAL | DRAFT | DOC-200 | Sidebar (desktop), bottom nav (mobile). Home: welcome, status, balance, activity. |
| GSR-DOC-202 | Member Profile — View + Edit | CRITICAL | DRAFT | DOC-201, DOC-003 | Profile fields, privacy controls. What agencies see vs. private. File: `GSR-DOC-202-MEMBER-PROFILE.md`. Split from former combined doc on 2026-04-24. |
| GSR-DOC-203 | Deployment Records — List + Create + Detail | CRITICAL | DRAFT | DOC-201, DOC-003 | ICS 222 Response Report. File: `GSR-DOC-203-DEPLOYMENT-RECORDS.md`. Split from former combined doc on 2026-04-24. |
| GSR-DOC-204 | Incidents — Search + Create | HIGH | DRAFT | DOC-002 | Incident registry: search existing, create new. Used by deployment records. |
| GSR-DOC-205 | Sky Points — Balance + History + Purchase | HIGH | DRAFT | DOC-201 | Balance, ledger history, Stripe checkout for purchases. OD-03 must be resolved. |
| GSR-DOC-206 | Document Library — Upload + Categorize + Link | HIGH | DRAFT | DOC-201 | Upload, categorize, link to records/pathways. Storage abstraction layer. |
| GSR-DOC-207 | Stripe Integration — Membership + Payments | HIGH | DRAFT | DOC-200, DOC-205 | Stripe test mode: $100/yr subscription, Sky Points purchases, webhook handling. |
| GSR-DOC-208 | Certifications — Pathways + Progress | NORMAL | DRAFT | DOC-201, DOC-003 | Available pathways, progress tracking, earned certs. Read-only in Phase 2. |

---

## Phase 3 — ATLAS Deployment + AI Layer

| Doc ID | Title | Priority | Status | Blocks On | Notes |
|--------|-------|----------|--------|-----------|-------|
| GSR-DOC-300 | ATLAS Architecture + Deployment | CRITICAL | DRAFT | DOC-004 | Mac Mini deployment, OpenClaw framework, Telegram bot, VPS config. |
| GSR-DOC-301 | Agent Configuration — Nine-Agent Team | CRITICAL | DRAFT | DOC-300 | OpenClaw configs for Ridgeline, Baseplate, Forge, Meridian, Threshold, Lookout, Bridgepoint, Proof, Garrison. |
| GSR-DOC-302 | FEMA Disaster Declaration Enrichment | HIGH | DRAFT | DOC-300, DOC-203 | ATLAS enriches deployment records via FEMA public data. Matching logic. |
| GSR-DOC-303 | Document AI Processing | NORMAL | DRAFT | DOC-300, DOC-206 | AI extraction from uploaded docs. Populates ai_extracted_data jsonb. |

---

## Phase 4 — Validation / Evaluation Workflow

| Doc ID | Title | Priority | Status | Blocks On | Notes |
|--------|-------|----------|--------|-----------|-------|
| GSR-DOC-400 | Validation Request — Send + Track | CRITICAL | APPROVED | DOC-203, DOC-205 | Member-side request flow. 10 Sky Coins, UUID token, 30-day expiration. File: `GSR-DOC-400-VALIDATION-REQUEST.md`. Split from former combined doc on 2026-04-24. |
| GSR-DOC-401 | Validation Response — External Public Form | CRITICAL | APPROVED | DOC-400 | Public /validate/:token. SECURITY DEFINER access only. File: `GSR-DOC-401-VALIDATION-RESPONSE.md`. |
| GSR-DOC-402 | Evaluation Request — Send + Track | CRITICAL | APPROVED | DOC-203, DOC-205 | Member-side request flow. ICS-225, 15 Sky Coins. File: `GSR-DOC-402-EVALUATION-REQUEST.md`. Split from former combined doc on 2026-04-24. |
| GSR-DOC-403 | Evaluation Response — External Public Form | CRITICAL | APPROVED | DOC-402 | Public /evaluate/:token. Five ratings, commentary, attestation. File: `GSR-DOC-403-EVALUATION-RESPONSE.md`. |
| GSR-DOC-404 | QRB — Qualification Review Board | HIGH | DRAFT | DOC-400, DOC-402 | Human review layer. Assigned reviewers, votes, decision rationale, appeals. |
| GSR-DOC-405 | Notification Service — Transactional Email | CRITICAL | APPROVED | DOC-400, DOC-402 | SendGrid + React Email + noreply@greysky.dev. Tamper-evident dispatch log. Closes the validation/evaluation delivery gap. File: `GSR-DOC-405-NOTIFICATION-SERVICE.md`. Build prompt: `docs/prompts/GSR-DOC-405-PROMPT.md`. Authored 2026-04-24. |

---

## Phase 5 — Certification + Credentialing Pathway

| Doc ID | Title | Priority | Status | Blocks On | Notes |
|--------|-------|----------|--------|-----------|-------|
| GSR-DOC-500 | Certification Workflow — Application + Progress | CRITICAL | DRAFT | DOC-208, DOC-400, DOC-402 | $500 / 5,000 Sky Points. Prerequisite checks. Progress dashboard. |
| GSR-DOC-501 | Certification Review + Issuance | CRITICAL | DRAFT | DOC-500, DOC-404 | Staff/QRB review. Approval → certified + digital credential. Denial → rationale. |
| GSR-DOC-502 | Credential Verification Portal | HIGH | DRAFT | DOC-501 | Public verification at greyskyresponder.net. NREMT model. No private data exposed. |
| GSR-DOC-503 | Credential Renewal + Expiration | NORMAL | DRAFT | DOC-501 | Expiration tracking, renewal notifications (90/60/30 days), lapsed handling. |

---

## Phase 6 — Organization Sponsorship + Team Credentialing

**Design principle:** An organization joins the Society and sponsors members, teams, or both. A "team" is any team type defined in the FEMA RTLT — the same taxonomy that defines individual positions. The 13 Florida SRT disciplines are the initial set, not a hard ceiling. The SRT-CAP methodology is the assessment process Longview delivers. The platform generalizes it so any state, county, municipality, or private organization can sponsor teams through the same pathway.

**Sponsorship Model — Two Lanes:**
1. Sponsor individual members — organization pays membership, sees scoped certification status, consent-based visibility.
2. Sponsor teams for credentialing — organization contracts Longview to assess and credential teams using SRT-CAP methodology.

| Doc ID | Title | Priority | Status | Blocks On | Notes |
|--------|-------|----------|--------|-----------|-------|
| GSR-DOC-600 | Organization Onboarding + Sponsorship Model | CRITICAL | DRAFT | DOC-002, DOC-200 | Org joins Society. Two lanes: individual member sponsorship and team credentialing. Billing track selection. |
| GSR-DOC-601 | Team Credentialing Engagement — Create + Manage | CRITICAL | DRAFT | DOC-600 | Engagement: sponsoring org, RTLT team type (any, not limited to FL 13), status pipeline. |
| GSR-DOC-602 | Team Self-Assessment — Send + Collect | CRITICAL | DRAFT | DOC-601 | 11 sections per SRT-CAP methodology. Structured data collection. Due date tracking. |
| GSR-DOC-603 | Team Self-Assessment — Form UI | CRITICAL | DRAFT | DOC-602 | 11-section form. Deployment tables, AAR/IP, SOPs, staffing, equipment, capabilities, training, exercises. |
| GSR-DOC-604 | Site Assessment — Schedule + Record | HIGH | DRAFT | DOC-602 | Schedule onsite: date, location, lead assessor, team. Record observations. |
| GSR-DOC-605 | Assessor Report — Field Report | CRITICAL | DRAFT | DOC-604 | Per-section scoring (0–3, Y/N), observations, recommendations. Generalized for any RTLT team type. |
| GSR-DOC-606 | Assessor Report — Final Report | CRITICAL | DRAFT | DOC-605 | Summary Table, Readiness Determination, typing ratings, confirmations, signatures. Agency deliverable. |
| GSR-DOC-607 | Team Credentialing Outcome | HIGH | DRAFT | DOC-606 | Credentialed / not / conditional. RTLT typing level. Triggers member certifications. |
| GSR-DOC-608 | Team Member Certification via Engagement | HIGH | DRAFT | DOC-607, DOC-501 | Individual certs through team engagement. Non-members invited; org can cover membership. |
| GSR-DOC-609 | Organization Dashboard — Home + Nav | CRITICAL | DRAFT | DOC-200, DOC-600 | Sponsored members, team assessment status, readiness by RTLT team type. Two views. |
| GSR-DOC-610 | Organization Dashboard — Sponsored Members | HIGH | DRAFT | DOC-609 | Scoped view: name, role, cert status for sponsored disciplines only. Consent-based. |
| GSR-DOC-611 | Organization Dashboard — Team Assessment Tracker | HIGH | DRAFT | DOC-609 | Engagement list with status pipeline. Detail: team info, reports, credentialing outcome. |
| GSR-DOC-612 | Organization Dashboard — Readiness + Reports | NORMAL | DRAFT | DOC-609, DOC-606 | Readiness by RTLT team type. Credentialed teams, typing, expiration, gaps. Reports downloadable. |
| GSR-DOC-613 | Organization Billing — Dual Track | NORMAL | DRAFT | DOC-600, DOC-207 | Sky Coin eligible vs. Direct Fee Only. Org coin pools. Invoice generation. |

---

## Phase 9 — Cross-Cutting Concerns

**Threat model (established 2026-04-09):** This platform holds PII, legal attestations, deployment histories, and credentialing data for professionals who deploy to national-security-level incidents. The verified responder registry is a high-value intelligence target. Security design assumes state-sponsored adversaries, not opportunistic attackers. Every doc in this phase is scoped against that assumption.

| Doc ID | Title | Priority | Status | Blocks On | Notes |
|--------|-------|----------|--------|-----------|-------|
| GSR-DOC-900 | Security Hardening | CRITICAL | DRAFT | DOC-004 | Nation-state threat model. Supabase RLS, CSP, CORS, CSRF, anomaly detection, token security, encryption, attack surface inventory. File: `GSR-DOC-900-SECURITY-HARDENING.md`. |
| GSR-DOC-901 | Security Patch — password_hash Removal, RLS Tightening, Admin Client Fix | CRITICAL | DRAFT | — | Audit-driven security patch. File: `GSR-DOC-901-SECURITY-PATCH.md`. **Numbering note (2026-04-24):** This file claimed 901 before the planned "Audit Logging + Tamper Evidence" entry was authored. Audit Logging will be renumbered to a free slot when authored. |
| GSR-DOC-902 | Testing Foundation — Vitest Setup + Critical Path Test Suites | CRITICAL | DRAFT | — | Audit-driven. Zero tests existed across 40+ TODO markers; this installs the framework. File: `GSR-DOC-902-TESTING-FOUNDATION.md`. **Numbering note (2026-04-24):** This file claimed 902 before the planned "Input Validation — Zod Schemas" entry was authored. Zod schema work will be renumbered to a free slot when authored. |
| GSR-DOC-903 | API Error Handling + Response Format | HIGH | REVIEW | DOC-004 | Pattern documented. Full-codebase audit pending. Doc backfilled 2026-04-24: `GSR-DOC-903-API-ERROR-HANDLING.md`. |
| GSR-DOC-904 | Admin Dashboard — Platform Management | HIGH | ✅ COMPLETE | DOC-200 | Live at /admin/* (home, users, memberships, validations, verifications, audit). Doc backfilled 2026-04-24: `GSR-DOC-904-ADMIN-DASHBOARD.md`. |
| GSR-DOC-905 | Sky Points Ledger — Integrity + Triggers | HIGH | DRAFT | DOC-002 | Append-only trigger. Write auth tightly scoped — no client-side coin minting. (Not yet authored.) |
| GSR-DOC-906 | Backup, Recovery + Incident Response | CRITICAL | DRAFT | DOC-004 | Destructive attack assumption. RPO/RTO targets. Geo-separated backups. IR plan. Credential revocation. (Not yet authored.) |
| GSR-DOC-907 | Data Classification + Privacy Controls | HIGH | DRAFT | DOC-001 | Field-level classification. Supabase RLS mapping. GDPR/state privacy. PII handling for attestations. (Not yet authored.) |
| GSR-DOC-908 | Audit Logging + Tamper Evidence (was DOC-901) | CRITICAL | DRAFT | DOC-002 | Tamper-evident logging (cryptographic chaining). Full event scope. Retention policy. Anomaly alerting. (Renumbered from 901 on 2026-04-24 to resolve filename conflict — file not yet authored.) |
| GSR-DOC-909 | Input Validation — Zod Schemas (was DOC-902) | HIGH | DRAFT | DOC-002 | Zod schemas all endpoints. Defense-in-depth: edge, application, database layers. (Renumbered from 902 on 2026-04-24 — file not yet authored.) |

---

## Reference Documents (Non-Build)

| Doc ID | Title | Status | Notes |
|--------|-------|--------|-------|
| GSR-REF-001 | Executive Framework | ✅ COMPLETE | Business model, revenue structure, standards framework. |
| GSR-REF-002 | Agent Architecture | ✅ COMPLETE | Nine-agent team: roles, functions, deployment model. |
| GSR-REF-003 | Executive Summary | ✅ COMPLETE | Platform overview for stakeholder communication. |
| GSR-REF-004 | Implementation Guide | ✅ COMPLETE | Build sequence, toolchain, deployment procedures. |

---

## Open Decision Points

Inherited from GSR-DOC-000. Each blocks one or more design docs until resolved. Memos for the open items live in `docs/decisions/OD-NN-*.md` (authored 2026-04-24, awaiting Roy's decisions).

| ID | Decision | Blocks | Phase | Memo |
|----|----------|--------|-------|------|
| OD-01 | MFA provider: Azure AD B2C or alternative? | DOC-200 | 2 | resolved (defer) |
| OD-02 | Stripe Identity: integrate at registration or defer? | DOC-200, DOC-207 | 2 | resolved (defer) |
| OD-03 | Sky Points: 100 or 1,000 with $100 membership? | DOC-205 | 2 | resolved (per coin_economy_reconcile migration) |
| OD-04 | Self-assessment form: universal vs. team-type-specific? | DOC-603 | 6 | `docs/decisions/OD-04-SELF-ASSESSMENT-FORM.md` |
| OD-05 | Assessor report: universal vs. team-type-specific? | DOC-605, DOC-606 | 6 | `docs/decisions/OD-05-ASSESSOR-REPORT.md` |
| OD-06 | Organization billing: invoicing mechanism for Direct Fee Only track? | DOC-613 | 6 | `docs/decisions/OD-06-ORG-BILLING.md` |
| OD-07 | QRB composition: who serves, selection, quorum rules? | DOC-404 | 4 | `docs/decisions/OD-07-QRB-COMPOSITION.md` |
| OD-08 | Credential expiration period | DOC-503 | 5 | `docs/decisions/OD-08-CREDENTIAL-EXPIRATION.md` |
| OD-09 | Verification portal domain | DOC-502 | 5 | `docs/decisions/OD-09-VERIFICATION-DOMAIN.md` |
| OD-10 | Public profile visibility | DOC-202 | 2 | resolved (verification-only by default) |
| OD-11 | ATLAS hosting (VPS provider) | DOC-300 | 3 | `docs/decisions/OD-11-ATLAS-VPS.md` |
| OD-12 | OpenClaw config structure | DOC-301 | 3 | `docs/decisions/OD-12-OPENCLAW-CONFIG.md` |
| OD-13 | Domain renewal: greyskyresponder.com expires Oct 2026 | — | 0 | calendar item (covered indirectly by OD-09 memo) |
| OD-14 | Stack decision | — | 0 | resolved (Next.js 16 + Supabase) |
| OD-15 | Sky Coins spend categories alignment | DOC-101, DOC-205 | 1/2 | open (copy reconciliation; no full memo authored) |

---

## Build Priority — Recommended Sequence

### Immediate (unblocks everything)
1. ~~Resolve OD-14 (stack decision)~~ ✅ RESOLVED
2. ~~GSR-DOC-004 — Project Scaffolding~~ ✅ COMPLETE
3. ~~GSR-DOC-001 — Data Entity Map~~ ✅ COMPLETE
4. ~~GSR-DOC-002 — Database Schema + Migrations~~ ✅ COMPLETE
5. ~~GSR-DOC-003 — Seed Data~~ ✅ COMPLETE

### Phase 1 sprint (public presence)
6. ~~GSR-DOC-100 — Public Site Home~~ ✅ COMPLETE
7. GSR-DOC-101 through GSR-DOC-107 — remaining public pages (101, 102, 105 outstanding)

### Phase 2 sprint (member value)
8. GSR-DOC-200 — Authentication ← **NEXT**
9. GSR-DOC-900 — Security Hardening (applied immediately with auth)
10. GSR-DOC-201 — Dashboard Layout
11. GSR-DOC-202 through GSR-DOC-208 — member features

### Phase 6 sprint (organization sponsorship + team credentialing)
12. GSR-DOC-600 — Organization Onboarding + Sponsorship Model
13. GSR-DOC-609 — Organization Dashboard
14. GSR-DOC-601 — Team Credentialing Engagement Management
15. GSR-DOC-602, DOC-603 — Self-Assessment workflow and form
16. GSR-DOC-605, DOC-606 — Assessor Reports

### Phase 4 sprint (trust layer)
17. GSR-DOC-400 through DOC-403 — Validation and Evaluation
18. GSR-DOC-404 — QRB
19. GSR-DOC-405 — Notification Service

### Phase 5 sprint (credentialing)
20. GSR-DOC-500, DOC-501 — Certification Workflow
21. GSR-DOC-502 — Verification Portal
22. GSR-DOC-503 — Renewal/Expiration

### Phase 3 sprint (AI layer — parallel once VPS provisioned)
23. GSR-DOC-300 — ATLAS Architecture
