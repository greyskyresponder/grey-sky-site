# Grey Sky Responder Society — Build Status

**Last updated:** April 14, 2026, 14:50 EDT
**Commit:** `0b8bf73` (59 total)
**Live at:** greysky.dev

---

## Platform Summary

Professional credentialing and team assessment platform for disaster responders, built on FEMA NQS/RTLT standards. Owned by Longview Solutions Group LLC (Roy E. Dunn, Principal).

**Production database is live** — 36 tables, all RLS policies, all triggers, all seed data. Authentication works end-to-end. Member dashboard is functional.

---

## The Numbers

| Metric | Value |
|--------|-------|
| Total commits | 59 |
| TypeScript/TSX files | 194 |
| Lines of TypeScript | 18,368 |
| SQL migration files | 15 |
| Lines of SQL | 2,379 |
| Production tables | 36 |
| Design documents authored | 23 |
| Design documents built | 17 |
| FEMA RTLT positions seeded | 468 |
| RTLT team types seeded | 152 |
| Affinities seeded | 37 |
| Coin products seeded | 28 |
| Pages/routes | 40 |
| React components | 78 |
| Server actions | 4 modules |
| Zod validators | 10 modules |
| Build start → today | 54 days (Feb 19 → Apr 14) |

---

## Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16.1.6 (App Router, Server Components) |
| UI | React 19.2.3, Tailwind CSS 4, Lucide icons |
| Language | TypeScript 5, Zod 4.3 validation |
| Database | Supabase Postgres 17.6 (36 tables, RLS everywhere) |
| Auth | Supabase Auth (email/password, MFA TOTP placeholder) |
| Hosting | Azure Static Web Apps (Free tier, East US 2) |
| Domains | greysky.dev + www.greysky.dev |
| CI/CD | GitHub Actions → Azure SWA auto-deploy on push to main |
| Payments | Stripe (keys configured, webhook pending) |
| Repo | github.com/greyskyresponder/grey-sky-site |

**Not in stack:** Vercel, Sanity CMS, Express.js — all removed.

---

## What's Built

### ✅ Phase 0 — Foundation
- **DOC-001** Data Entity Map — complete schema design
- **DOC-002** Database Schema — 15 migrations, 36 tables, 30+ enums, all constraints/indexes
- **DOC-003** Seed Data — 468 RTLT positions, 152 team types, 37 affinities, 28 coin products
- **DOC-004** Project Scaffolding — Next.js 16, TypeScript, Tailwind, Supabase integration
- **DOC-005** Environment Config — Zod schema, storage/email abstraction layers
- **DOC-006** CI/CD — GitHub Actions, Azure SWA deployment

### ✅ Phase 1 — Public Site
- **DOC-100** Homepage — hero, disciplines, membership pitch, CTAs
- **DOC-102** Organizations page — service lanes (A: individual credentialing, B: SRT-CAP team assessment), process steps, RTLT disciplines grid
- **Standards** — `/standards` + 17 discipline detail pages
- **Positions** — `/positions` + `/positions/[slug]` (468 FEMA RTLT positions)
- **Teams** — `/teams` + `/teams/[slug]`
- **Incidents (public)** — `/incidents` + `/incidents/[slug]`
- **Story, About, Community, Membership** — marketing pages
- **Join** — `/join` + `/join/success`

### ✅ Phase 2 — Member Portal (Core)
- **DOC-200** Authentication — login, register, password reset, email verification, session middleware, role-based route protection, rate limiting
- **DOC-201** Dashboard Layout — sidebar (desktop), bottom nav (mobile), status grid, quick actions, recent activity, welcome bar
- **DOC-202** Member Profile — view + edit, service identity, qualifications (RTLT-linked), affinities, communities, teams, organizations, languages, avatar upload, completeness engine
- **DOC-203** Deployment Records — list with filters, detail view, create/edit forms, incident + position linking, status/verification badges
- **DOC-204** Incident Registry — search with type filters, create form, detail with timeline + impact summary, incident affinities/updates, public + auth views
- **DOC-205** Sky Coins Economy — balance display, 5-tier product catalog (28 products), transaction ledger, purchase page (Stripe integration point), pending balances for non-members, Sky Points integrity ledger
- **DOC-206** Document Library — file upload with dropzone, categorization, preview, link to qualifications/deployments, document detail, full API routes

### ✅ Cross-Cutting
- **DOC-900** Security Hardening (partial) — security headers, rate limiter (in-memory token bucket), RLS on all tables, audit log with hash chain (tamper-evident), input validators, global error boundary, redirect loop protection

### 🔧 Entry Points (Phase 4/5 stubs)
- `/validate/[token]` — validation request entry
- `/evaluate/[token]` — evaluation request entry
- `/verify/[userId]` — credential verification

---

## Database — 36 Production Tables

**Core:** `users`, `organizations`, `user_organizations`, `positions`, `incidents`, `deployment_records`

**Profile:** `user_qualifications`, `user_certifications`, `user_communities`, `user_languages`, `user_service_orgs`, `user_teams`, `user_affinities`, `affinities`

**Incidents:** `incident_affinities`, `incident_updates`

**Documents:** `documents`

**Economy:** `coin_accounts`, `coin_transactions`, `coin_products`, `coin_pending_balances`, `sky_points_ledger`

**Trust:** `validation_requests`, `evaluation_requests`, `certification_pathways`

**Organizations:** `organization_sponsorships`

**Team Credentialing (SRT-CAP):** `tc_engagements`, `tc_reports`, `tc_report_sections`, `tc_self_assessments`, `tc_sa_sections`, `tc_site_assessments`, `tc_team_members`

**Taxonomy:** `rtlt_team_types`, `rtlt_position_overrides`

**Security:** `audit_log` (hash-chained, append-only)

**Key triggers:** `handle_new_auth_user` (auto-creates profile on signup), `set_updated_at` (all tables), `compute_audit_hash` (tamper evidence)

---

## 40 Routes

### Public (17)
```
/                              Homepage
/about                         About
/community                     Community
/incidents                     Incident registry (public)
/incidents/[slug]              Incident detail
/join                          Join flow
/join/success                  Join confirmation
/membership                    Membership info
/organizations                 For agencies + organizations
/positions                     RTLT positions browser
/positions/[slug]              Position detail
/standards                     Standards browser
/standards/[discipline]        Discipline detail
/story                         Our story
/teams                         Teams browser
/teams/[slug]                  Team detail
```

### Auth (3)
```
/login                         Email/password login
/register                      New account
/reset-password                Password reset
```

### Dashboard (17)
```
/dashboard                     Home — status grid + activity
/dashboard/profile             Member profile view
/dashboard/profile/edit        Profile editor
/dashboard/records             Deployment records list
/dashboard/records/new         Create record
/dashboard/records/[id]        Record detail
/dashboard/records/[id]/edit   Edit record
/dashboard/incidents           Incident search (auth)
/dashboard/incidents/new       Create incident
/dashboard/incidents/[slug]    Incident detail (auth)
/dashboard/documents           Document library
/dashboard/documents/upload    Upload document
/dashboard/documents/[id]      Document detail
/dashboard/coins               Sky Coins balance + ledger
/dashboard/coins/purchase      Purchase coins
/dashboard/settings/security   MFA + security settings
```

### Admin / Org / Trust (3)
```
/admin                         Platform admin (stub)
/agency                        Organization dashboard (stub)
/validate/[token]              Validation entry (Phase 4)
/evaluate/[token]              Evaluation entry (Phase 4)
/verify/[userId]               Credential verification (Phase 5)
```

---

## 78 Components

### Marketing (9)
`About`, `CTA`, `Disciplines`, `Footer`, `Header`, `Hero`, `Membership`, `WhyCredential`, `WaitlistForm`

### Auth (5)
`MfaChallenge`, `MfaEnroll`, `MfaSettings`, `mfa-toggle`, `submit-button`

### Dashboard Core (10)
`DashboardHeader`, `DashboardSidebar`, `MobileBottomNav`, `NavLinks`, `QuickActionPanel`, `RecentActivity`, `StatCard`, `StatusGrid`, `UserBadge`, `WelcomeBar`

### Profile (23)
View: `ProfileView`, `ProfileHeader`, `ProfileDetails`, `ProfileStats`, `ProfileCompleteness`, `ProfileAffinities`, `ServiceIdentity`, `QualificationsSection`, `CommunitiesSection`, `LanguagesSection`, `OrganizationsSection`, `TeamsSection`, `AffinitySelector`, `AvatarUpload`
Edit: `ProfileEditPage`, `BasicInfoForm`, `ServiceIdentityForm`, `QualificationEditor`, `CommunityEditor`, `LanguageEditor`, `OrgEditor`, `TeamEditor`, `AffinityPicker`

### Records (7)
`RecordCard`, `RecordDetail`, `RecordForm`, `RecordStatusBadge`, `RecordVerificationBadge`, `RecordsFilters`, `EmptyRecords`

### Incidents (7)
`IncidentSearch`, `IncidentSearchResult`, `IncidentCreateForm`, `IncidentDetail`, `IncidentTimeline`, `IncidentImpactSummary`, `IncidentSelector`

### Coins (5)
`CoinBalance`, `CoinBadge`, `CoinLedger`, `CoinPurchase`, `ProductCatalog`

### Documents (8)
`DocumentLibrary`, `DocumentCard`, `DocumentRow`, `DocumentDetail`, `DocumentPreview`, `DocumentUploadForm`, `DocumentLinkSelector`, `FileDropzone`, `AvatarUpload`

### Marketing/Org (3)
`ServiceLane`, `AgencyCtaSection`, `JoinCTA`, `OnboardingForm`, `PositionsGrid`

---

## Environment Status

### Production (Azure SWA)
| Variable | Status |
|----------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ |
| `NEXT_PUBLIC_APP_URL` | ✅ `https://greysky.dev` |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | ✅ |
| `STRIPE_SECRET_KEY` | ✅ |
| `EMAIL_MODE` | ✅ `disabled` |
| `STORAGE_MODE` | ✅ `supabase` |
| `STRIPE_WEBHOOK_SECRET` | ❌ Blocks payment processing |
| `SUPABASE_DB_URL` | ❌ Blocks direct DB queries |
| `SENDGRID_API_KEY` | ❌ Blocks transactional email |

### Production User
| Field | Value |
|-------|-------|
| Auth ID | `6ffa15e7-b6a9-4aab-b68e-ed487ddda31e` |
| Email | `roy@longviewsolutionsgroup.com` |
| Role | `platform_admin` |
| Membership | `active` |

---

## Known Issues

### Blocking
1. **`navigationFallback` missing** in `staticwebapp.config.json` — direct URL navigation to client routes returns 404 on Azure SWA
2. **`env.ts` not imported** — Zod env validation schema exists but is never called; app uses raw `process.env`
3. **Stripe webhook not configured** — no `STRIPE_WEBHOOK_SECRET`; coin purchases and membership payments can't process

### Non-Blocking
4. **`handle_new_auth_user` trigger** doesn't create coin account — Roy's was created manually; future signups need trigger update
5. **Per-route `error.tsx`** — only `global-error.tsx` exists
6. **Rate limiter in-memory** — resets on deploy; Redis planned
7. **MFA placeholder** — UI exists, enforcement deferred
8. **`password_hash` column** — NOT NULL but always empty string; should be nullable or removed

---

## What's Next — Build Queue

### Immediate (unblocks revenue)
| Doc | Title | Priority | Notes |
|-----|-------|----------|-------|
| GSR-DOC-207 | Stripe Payments + Membership Billing | **CRITICAL** | Webhook, subscription, coin purchases |
| GSR-DOC-208 | Notifications + Email | HIGH | SendGrid integration, transactional emails |
| GSR-DOC-904 | Admin Dashboard | HIGH | Platform management, member oversight |

### Phase 1 Gaps
| Doc | Title | Notes |
|-----|-------|-------|
| GSR-DOC-101 | Membership Page (copy alignment) | Sky Coins spend categories vs. spec |
| GSR-DOC-105 | Additional public pages | TBD |

### Phase 4 — Trust Layer
| Doc | Title |
|-----|-------|
| GSR-DOC-400–403 | Validation + Evaluation Workflow |
| GSR-DOC-404 | Qualification Review Board |
| GSR-DOC-405 | Notification Service |

### Phase 5 — Credentialing
| Doc | Title |
|-----|-------|
| GSR-DOC-500–503 | Certification Workflow, Verification Portal, Renewal |

### Phase 6 — Organization Sponsorship
| Doc | Title |
|-----|-------|
| GSR-DOC-600–613 | Org Onboarding, Team Credentialing, Assessments, Reports |

### Phase 3 — AI Layer (parallel)
| Doc | Title |
|-----|-------|
| GSR-DOC-300–303 | ATLAS Architecture, Agent Config, FEMA Enrichment, Doc AI |

---

## Permanent Rules

1. **No preferred pronouns** — anywhere in the platform. Permanent.
2. **"Service" not "career"** — use "serving," "important roles," "the work"
3. **Privacy is sovereign** — responders own their profile; agencies see only what's consented and scoped
4. **Azure SWA only** — no Vercel-specific features
5. **Design doc pipeline** — nothing built without a design doc and a queue number
6. **Brand:** Command Navy `#0A1628`, Signal Gold `#C5933A` — "Operational authority, not corporate polish"
7. **`NEXT_PUBLIC_*` must be available at build time** in GitHub Actions
8. **Auth is Supabase Auth (GoTrue)** — not NextAuth.js
9. **ICS/NIMS/NQS/RTLT terminology** throughout — this is an emergency management platform
10. **Dashboard = command post** — ICS-structured, not consumer SaaS

---

## Key Files

| Path | Purpose |
|------|---------|
| `CLAUDE.md` | Claude Code project instructions |
| `docs/design/GSR-DOC-000-PLATFORM-SPEC.md` | Canonical platform specification |
| `docs/design/GSR-DOC-QUEUE.md` | Master build queue + phase dependencies |
| `docs/design/README.md` | Design doc conventions + workflow |
| `docs/prompts/CLAUDE-CODE-DISCIPLINE.md` | Self-review gate (mandatory for all builds) |
| `docs/prompts/CLAUDE-APP-ARCHITECT.md` | Architect session prompt |
| `docs/prompts/CONCURRENT-BUILD-ROUND-2.md` | ⚠️ Outdated — targets already-built features |
| `docs/BUILD-JOURNAL.md` | Narrative build history |
| `references/FEMA_RTLT_NQS_Database.json` | 625 FEMA RTLT records |
| `references/RTLT-TAXONOMY.md` | Discipline taxonomy |
| `src/lib/config/env.ts` | Zod env schema (not yet imported) |
| `staticwebapp.config.json` | Azure SWA config (needs navigationFallback) |

---

## ⚠️ Important Note

The file `docs/prompts/CONCURRENT-BUILD-ROUND-2.md` contains build prompts for DOC-202, DOC-205, DOC-206, DOC-102, and DOC-900. **All five of these are already built.** Do not re-execute those prompts. The next work is DOC-207 (Stripe), DOC-208 (Email/Notifications), and DOC-904 (Admin Dashboard).
