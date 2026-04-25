# Grey Sky Responder Society — Project Status

**Generated:** 2026-04-11 12:28 EDT by ATLAS
**Purpose:** Upload this to Claude App as project knowledge so it has the real state of the build.

---

## Stack

| Component | Version / Service |
|-----------|------------------|
| Framework | Next.js 16.1.6 (App Router, Server Components, React 19) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 4 |
| Database | Supabase (PostgreSQL) |
| CMS | Sanity.io (project: i5vzfkqt) |
| Auth | Supabase Auth (GoTrue) — NOT NextAuth.js |
| Hosting | Azure Static Web Apps (NOT Vercel) |
| CI/CD | GitHub Actions → Azure SWA |
| Email | SendGrid (abstracted via src/lib/config/email.ts) |
| Payments | Stripe (not yet integrated) |
| GitHub Org | greyskyresponder |

## Brand

- Command Navy: `#0A1628`
- Signal Gold: `#C5933A`
- Ops White: `#F5F5F5`
- Font: Inter
- Language: Use "service" / "serving" — NEVER "career"
- Terminology must align with NIMS / NQS / FEMA RTLT

---

## Completed Design Docs (11 total)

### Phase 0 — Foundation (ALL COMPLETE)

| Doc ID | Title | Status | Key Commit(s) |
|--------|-------|--------|---------------|
| GSR-DOC-000 | Platform Reference Specification | ✅ COMPLETE | Canonical spec, all docs reference this |
| GSR-DOC-001 | Backend Foundation (Entity Map) | ✅ COMPLETE | Consolidated with DOC-002/003/004 |
| GSR-DOC-002 | Database Schema + Migrations | ✅ COMPLETE | 8 migrations in supabase/migrations/ |
| GSR-DOC-003 | Seed Data | ✅ COMPLETE | 625 RTLT positions, 152 team types, 468 positions, 37 affinities |
| GSR-DOC-004 | Project Scaffolding | ✅ COMPLETE | Next.js 16 + Supabase + Docker Compose |
| GSR-DOC-005 | Environment Configuration | ✅ COMPLETE | Typed env validation, storage + email abstraction |
| GSR-DOC-006 | CI/CD Pipeline | ✅ COMPLETE | GitHub Actions: lint, type-check, build, Azure deploy |

### Phase 1 — Public Site (SUBSTANTIALLY COMPLETE)

| Doc ID | Title | Status | Notes |
|--------|-------|--------|-------|
| GSR-DOC-005-PUBLIC-SITE | Public Site Build | ✅ COMPLETE | Homepage, About, Story, Teams (20), Positions (625), Standards (17), Join funnel, Community, Membership pages |

**What exists:**
- Homepage with 17-discipline grid, hero, JoinCTA
- `/teams` — 20 team pages derived dynamically from all RTLT resource_category values
- `/positions` — 625 position detail pages with client-side pagination (50/page) + category filter
- `/standards` — 17 discipline standards pages
- `/about`, `/story`, `/community`, `/membership` — all built
- `/join` — onboarding funnel with success page
- Header + Footer with nav

**What's NOT built in Phase 1:**
- GSR-DOC-101 (Membership page copy alignment — page exists but Sky Coins details need OD-03)
- GSR-DOC-102 (Organizations/Agencies page — needs design doc)
- GSR-DOC-105 (Contact page — currently mailto only)

### Phase 2 — Member Portal (IN PROGRESS)

| Doc ID | Title | Status | Key Commit(s) |
|--------|-------|--------|---------------|
| GSR-DOC-200 | Authentication | ✅ COMPLETE | `8387a8b` through `a0aed6a` (5 commits) |
| GSR-DOC-201 | Dashboard Layout | ✅ COMPLETE | `0f3b374` through `1bd8890` (3 commits) |

**Auth details (DOC-200):**
- Supabase Auth (GoTrue) — NOT NextAuth.js
- Registration, login, password reset, email verification
- Middleware role enforcement via `public.users` table (roles: `member`, `org_admin`, `platform_admin`)
- Auth sync trigger: auto-creates `public.users` row on `auth.users` INSERT
- MFA toggle is a disabled placeholder at `src/components/auth/mfa-toggle.tsx` — deferred to DOC-900
- Open redirect fix: login redirect only accepts relative paths starting with `/`
- Password: min 12 chars, max 128

**Dashboard details (DOC-201):**
- Sidebar (desktop) + bottom nav (mobile)
- 13 dashboard components (1029 lines)
- `/dashboard` route is dynamic (server-rendered) for auth-gated content
- StatusGrid, StatCard, WelcomeBar, RecentActivity, QuickActionPanel, UserBadge, NavLinks

---

## Open Decision Points

| ID | Decision | Status | Blocks |
|----|----------|--------|--------|
| OD-01 | MFA provider | ✅ DEFERRED to DOC-900 | `mfa_enabled` toggle built as placeholder |
| OD-02 | Stripe Identity at registration | ✅ DEFERRED to Phase 5 | Email verification only for now |
| OD-03 | Sky Points: 100 or 1,000 with $100 membership? | ❓ OPEN | DOC-205 |
| OD-04 | Self-assessment form: universal vs. team-type-specific? | ❓ OPEN | DOC-603 |
| OD-05 | Assessor report: same variants question | ❓ OPEN | DOC-605, DOC-606 |
| OD-06 | Organization billing: invoicing mechanism? | ❓ OPEN | DOC-613 |
| OD-07 | QRB composition: who serves, quorum? | ❓ OPEN | DOC-404 |
| OD-08 | Credential expiration: 1yr, 2yr, or discipline-specific? | ❓ OPEN | DOC-503 |
| OD-09 | Verification portal domain: greyskyresponder.net? | ❓ OPEN | DOC-502 |
| OD-10 | Public profile: member directory or verification-only? | ❓ OPEN | DOC-202 |
| OD-11 | ATLAS hosting: which VPS? | ❓ OPEN | DOC-300 |
| OD-14 | Stack decision | ✅ RESOLVED — Next.js 16 + Supabase | — |
| OD-15 | Sky Coins spend categories | ❓ OPEN | DOC-101, DOC-205 |

---

## What's Built — File Tree (Key Files)

### Routes (22 pages)
```
src/app/(public)/page.tsx              — Homepage
src/app/(public)/about/page.tsx        — About / Mission
src/app/(public)/story/page.tsx        — Tell Your Story
src/app/(public)/community/page.tsx    — Community
src/app/(public)/membership/page.tsx   — Membership
src/app/(public)/teams/page.tsx        — Teams index (20 RTLT categories)
src/app/(public)/teams/[slug]/page.tsx — Team detail (dynamic)
src/app/(public)/positions/page.tsx    — Positions index (625, paginated)
src/app/(public)/positions/[slug]/page.tsx — Position detail
src/app/(public)/standards/page.tsx    — Standards index
src/app/(public)/standards/[discipline]/page.tsx — Discipline detail
src/app/(public)/join/page.tsx         — Onboarding funnel
src/app/(public)/join/success/page.tsx — Join success
src/app/(auth)/login/page.tsx          — Login
src/app/(auth)/register/page.tsx       — Registration
src/app/(auth)/reset-password/page.tsx — Password reset
src/app/(dashboard)/dashboard/page.tsx — Member dashboard home
src/app/(admin)/admin/page.tsx         — Admin (placeholder)
src/app/(organization)/agency/page.tsx — Agency (placeholder)
src/app/validate/[token]/page.tsx      — External validation (placeholder)
src/app/evaluate/[token]/page.tsx      — External evaluation (placeholder)
src/app/verify/[userId]/page.tsx       — Email verification
```

### Database (8 migrations)
```
supabase/migrations/
  20260409000001_extensions.sql
  20260409000002_enums.sql
  20260409000003_core_tables.sql
  20260409000004_tc_tables.sql
  20260409000005_taxonomy_tables.sql
  20260409000006_indexes.sql
  20260409000007_triggers.sql   — includes auth sync trigger
  20260409000008_rls_policies.sql
```

### Auth
```
src/lib/supabase/client.ts      — Browser Supabase client
src/lib/supabase/admin.ts       — Server admin client
src/lib/supabase/middleware.ts   — Session refresh
src/lib/auth/getUser.ts         — Server-side user fetch
src/lib/auth/actions.ts         — Server actions (login, register, reset)
src/middleware.ts                — Route protection + role enforcement
src/app/auth/callback/route.ts  — OAuth/magic link callback
```

### Type System
```
src/lib/types/users.ts
src/lib/types/deployments.ts
src/lib/types/documents.ts
src/lib/types/economy.ts
src/lib/types/team-credentialing.ts
src/lib/types/taxonomy.ts
src/lib/types/audit.ts
src/lib/types/enums.ts
src/lib/types/index.ts          — Barrel export
```

### RTLT Data
```
references/FEMA_RTLT_NQS_Database.json  — 625 records, 20 resource categories
src/lib/rtlt.ts                         — getAllPositions(), getPositionBySlug(), getAllSlugs()
src/lib/teams.ts                        — getAllTeams() derived from RTLT categories
src/lib/disciplines.ts                  — 17 curated discipline entries (homepage grid)
```

---

## What's Next — Recommended Design Docs to Draft

### Immediate (unblocks member value)
1. **GSR-DOC-202** — Member Profile (View + Edit) — blocks on DOC-201 ✅
2. **GSR-DOC-203** — Deployment Records (List + Create + Detail) — blocks on DOC-201 ✅
3. **GSR-DOC-204** — Incidents (Search + Create) — blocks on DOC-002 ✅

### Near-term
4. **GSR-DOC-205** — Sky Points (Balance + History + Purchase) — needs OD-03 resolved
5. **GSR-DOC-206** — Document Library (Upload + Categorize)
6. **GSR-DOC-207** — Stripe Integration

### Security (should be designed soon)
7. **GSR-DOC-900** — Security Hardening (includes MFA enrollment, DOC-200 deferred this here)

---

## Git Log (Recent)

```
ba5df8d fix: derive teams from RTLT categories (20), add positions pagination (DOC-005)
1bd8890 docs: add TODO test comments per discipline protocol (DOC-201)
2e87c5b feat: dashboard home — status cards, recent activity, quick actions (DOC-201)
0f3b374 feat: dashboard layout shell — sidebar, header, mobile nav (DOC-201)
a0aed6a feat: middleware role enforcement, MFA placeholder, security hardening (DOC-200)
ed8335e feat: password reset page, auth callback, middleware session refresh (DOC-200)
9700c92 feat: login page with session management (DOC-200)
dae71ae feat: registration page with Supabase Auth signup (DOC-200)
8387a8b feat: auth validation schemas, utilities, and shared components (DOC-200)
a326c9d fix: commit package-lock.json for CI (npm ci requires lockfile)
5ba7845 feat: CI/CD pipeline — GitHub Actions for lint, build, Azure deploy (DOC-006)
7aec1f6 feat: environment config — typed env validation, storage + email abstraction (DOC-005)
```

---

## Critical Rules for Claude App

1. **Auth is Supabase Auth (GoTrue)** — NOT NextAuth.js. DOC-000 originally said NextAuth; DOC-200 changed it.
2. **Hosting is Azure Static Web Apps** — NOT Vercel.
3. **Never use "career"** — always "service" / "serving"
4. **Privacy is sovereign** — not a feature, a right
5. **Password: 12-128 chars**
6. **Dashboard = command post** — ICS-structured, not consumer SaaS
7. **MFA deferred to DOC-900** — placeholder toggle exists
8. **Stripe Identity deferred to Phase 5** — email verification only for now
9. **DOC-005/006 were approved and built** despite queue showing "DRAFT" — Roy explicitly approved them
10. **Build with `npm run build`** — must pass with zero errors before any commit
