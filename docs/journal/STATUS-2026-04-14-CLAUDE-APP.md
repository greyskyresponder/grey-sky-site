# Grey Sky Responder Society — Platform Status Brief

**Date:** April 14, 2026
**Prepared by:** ATLAS (Longview Solutions Group)
**Purpose:** Onboard a Claude App session with full current-state awareness of the Grey Sky platform.

---

## Executive Summary

The Grey Sky Responder Society platform is a credentialing and professional development portal for disaster responders, built on FEMA NQS/RTLT standards. Owned by Roy E. Dunn, Principal of Longview Solutions Group LLC. Live at **greysky.dev**.

As of today, the production database is fully migrated (36 tables), authentication works end-to-end, and the member dashboard is functional. The platform crossed from "scaffolding" to "operational" today.

---

## The Numbers

| Metric | Count |
|--------|-------|
| Commits | 57 |
| TypeScript/TSX files | 195 |
| SQL migrations | 15 |
| Design documents | 23 |
| Lines of TypeScript | 18,426 |
| Lines of SQL (migrations) | 2,379 |
| Production database tables | 36 |
| FEMA RTLT positions seeded | 468 |
| RTLT team types seeded | 152 |
| Coin product catalog entries | 28 |
| Build time (first → latest commit) | 54 days |
| Repo | github.com/greyskyresponder/grey-sky-site |

---

## Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16.1.6 (App Router, Server Components) |
| UI | React 19.2.3, Tailwind CSS 4 |
| Language | TypeScript 5 |
| Database | Supabase (Postgres 17.6) |
| Auth | Supabase Auth (email/password + MFA TOTP placeholder) |
| Hosting | Azure Static Web Apps (Free tier, East US 2) |
| Domains | greysky.dev + www.greysky.dev |
| CI/CD | GitHub Actions → Azure SWA |
| Payments | Stripe (keys configured, webhook integration pending) |

**NOT in stack:** Vercel, Sanity CMS, Express.js (removed — pure Next.js now)

---

## What's Built — Feature Inventory

### ✅ Phase 1: Public Site (Complete)
- **Homepage** — Hero, disciplines, CTA, membership pitch
- **Standards browser** — `/standards`, `/standards/[discipline]` — 17 FEMA RTLT discipline pages
- **Story, About, Community, Membership** — marketing pages
- **Positions browser** — `/positions`, `/positions/[slug]` — 468 FEMA RTLT positions
- **Teams browser** — `/teams`, `/teams/[slug]` — derived from RTLT categories
- **Incidents (public view)** — `/incidents`, `/incidents/[slug]`
- **Organizations page** — `/organizations`
- **Join flow** — `/join`, `/join/success`
- **Brand:** Command Navy `#0A1628`, Signal Gold `#C5933A`, Inter font

### ✅ Phase 2: Authentication (DOC-200) (Complete)
- Login, Register, Password Reset pages
- Supabase Auth integration with session middleware
- Role-based route protection (`platform_admin` → `/admin`, members → `/dashboard`)
- Auth callback handler for email verification
- MFA enrollment/challenge UI (Supabase TOTP — placeholder, not enforced yet)
- Rate limiting: in-memory token bucket per route category

### ✅ Phase 2: Dashboard (DOC-201) (Complete)
- Sidebar + header layout with mobile bottom nav
- Status cards (deployments, documents, incidents, coins)
- Recent activity feed
- Quick action panel
- Welcome bar with user greeting
- Security settings page

### ✅ Phase 2: Member Profile (DOC-202) (Complete)
- Profile view + edit with completeness engine
- Service identity fields (no pronouns — permanent rule)
- Organizations, teams, communities, languages sections
- Qualifications linked to RTLT positions
- Affinities (shared incident/discipline connections)
- Avatar upload
- Profile stats

### ✅ Phase 2: Deployment Records (DOC-203) (Complete)
- Record list with filters
- Record detail view
- Record create/edit forms
- Linked to incidents and positions
- Status badges and verification badges

### ✅ Phase 2: Incident Registry (DOC-204) (Complete)
- Incident search with expanded types (natural_disaster, technological, human_caused, biological)
- Incident create form
- Incident detail with timeline and impact summary
- Incident affinities and updates
- Public + authenticated views with RLS separation

### ✅ Phase 2: Sky Coins Economy (DOC-205) (Complete)
- Coin balance display and badge
- 5-tier product catalog (28 products seeded):
  - Tier 1: Record building (free)
  - Tier 2: Network actions (validation/evaluation requests)
  - Tier 3: Certification ($40-$50 value via coins)
  - Tier 4: Credentialing + QRB review ($100-$300 value)
  - Tier 5: Products and services (verified reports, certificates, badges)
  - Tier 0: Purchase packages ($25-$100 top-ups)
- Transaction ledger
- Coin purchase page (Stripe integration point)
- Pending balances for non-members (earn-back accumulation)
- Sky Points ledger (append-only integrity)

### ✅ Phase 2: Document Library (DOC-206) (Complete)
- Upload with file dropzone
- Document categorization and preview
- Link documents to qualifications and deployments
- Document detail view
- API routes: upload, get/update/delete, link management

### ✅ Phase 2: Organizations (DOC-102) (Complete)
- Organizations page with org listing
- Organization sponsorship model in schema

### ✅ Cross-Cutting: Security Hardening (DOC-900) (Partial)
- Global security headers (X-Frame-Options, X-Content-Type-Options, Referrer-Policy)
- Rate limiter (in-memory token bucket) with route-specific limits
- RLS policies on all 36 tables
- Audit log table
- Input validators (Zod schemas)
- `global-error.tsx` error boundary
- Redirect loop protection (dashboard renders fallback instead of looping when profile missing)

### ✅ Validation/Evaluation Entry Points (Partial)
- `/validate/[token]` and `/evaluate/[token]` pages exist (entry points for Phase 4)
- `/verify/[userId]` page exists

---

## Database Schema — Production State

**36 tables across 15 migrations.** All applied to production as of 2026-04-14 11:47 EDT.

### Core Tables
- `users` — member profiles (id linked to auth.users via FK)
- `organizations` — agencies, departments, companies
- `user_organizations` — membership with roles (member, team_lead, admin, assessor)
- `positions` — 468 FEMA RTLT positions
- `incidents` — disaster/incident registry
- `deployment_records` — who deployed where, when, in what role

### Profile Expansion
- `user_qualifications`, `user_certifications`, `user_communities`
- `user_languages`, `user_service_orgs`, `user_teams`
- `user_affinities`, `affinities`

### Incident Expansion
- `incident_affinities`, `incident_updates`

### Documents
- `documents` — file metadata, categorization, linked records

### Coin Economy
- `coin_accounts` — per-user balance
- `coin_transactions` — ledger entries
- `coin_products` — 28-item product catalog
- `coin_pending_balances` — non-member earn-back
- `sky_points_ledger` — append-only integrity log

### Trust & Validation
- `validation_requests`, `evaluation_requests`
- `certification_pathways`

### Organization Sponsorship
- `organization_sponsorships`

### TC (Team Credentialing / SRT-CAP)
- `tc_engagements`, `tc_reports`, `tc_report_sections`
- `tc_self_assessments`, `tc_sa_sections`
- `tc_site_assessments`, `tc_team_members`

### Taxonomy
- `rtlt_team_types` (152 entries), `rtlt_position_overrides`

### Security
- `audit_log`

### Key Triggers
- `handle_new_auth_user` — auto-creates `public.users` row on auth.users INSERT
- `set_updated_at` — auto-updates `updated_at` on all tables with that column

### Key RLS Notes
- All tables have RLS enabled
- Pattern: authenticated users see own data; `platform_admin` role sees all
- Public read on active incidents, positions, teams, coin products
- Audit log: insert-only, no update/delete

---

## Environment & Infrastructure

### Production (Azure SWA + Supabase)
| Variable | Status |
|----------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ Set |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ Set |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ Set (today) |
| `NEXT_PUBLIC_APP_URL` | ✅ Set (today) — `https://greysky.dev` |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | ✅ Set |
| `STRIPE_SECRET_KEY` | ✅ Set |
| `STRIPE_WEBHOOK_SECRET` | ❌ Not set — blocks payment processing |
| `SUPABASE_DB_URL` | ❌ Not set — blocks direct DB queries from app |
| `SENDGRID_API_KEY` | ❌ Not set — blocks transactional email |
| `EMAIL_MODE` | ✅ Set — `disabled` |
| `STORAGE_MODE` | ✅ Set — `supabase` |

### GitHub Secrets (Build-Time)
| Secret | Status |
|--------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ Set today |
| `NEXT_PUBLIC_APP_URL` | ✅ Set today |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | ✅ |
| `STRIPE_SECRET_KEY` | ✅ |
| `STRIPE_WEBHOOK_SECRET` | ❌ |
| `SENDGRID_API_KEY` | ❌ |

### Supabase Project
- **Ref:** `rweoepylzegqsbmtpbhm`
- **Region:** us-east-1
- **URL:** `https://rweoepylzegqsbmtpbhm.supabase.co`
- **Postgres:** 17.6.1.104

### Azure
- **SWA:** `greysky-portal` in `rg-greysky-portal`, East US 2, Free tier
- **Subscription:** `294ea830-6478-4a2c-af25-4d9203e44e7a`

---

## Known Issues & Technical Debt

### Blocking
1. **`navigationFallback` missing** — Azure SWA returns 404 on direct navigation to client-side routes (e.g., typing `greysky.dev/dashboard/profile` directly). Needs `staticwebapp.config.json` update.
2. **`env.ts` not imported** — `src/lib/config/env.ts` has a comprehensive Zod schema for environment validation but is never called. App uses `process.env` directly everywhere.
3. **Stripe webhook** — No `STRIPE_WEBHOOK_SECRET` configured. Coin purchases and membership payments can't process.

### Non-Blocking
4. **`handle_new_auth_user` trigger doesn't set `role`** — defaults to `member`, doesn't create coin account. Roy's profile was manually created with `platform_admin`. Future signups get profile rows but need coin account creation added to trigger.
5. **Per-route `error.tsx` boundaries** — Only `global-error.tsx` exists. Individual route groups should have their own.
6. **Rate limiter is in-memory** — Resets on deploy. Fine for now, Redis upgrade planned.
7. **MFA is placeholder** — UI exists, Supabase TOTP configured, but enforcement is deferred.
8. **`password_hash` column on `users`** — NOT NULL but always empty string (passwords managed by Supabase Auth). Should be nullable or removed.

---

## Design Doc Pipeline Status

### ✅ Complete
| Doc | Title |
|-----|-------|
| GSR-DOC-000 | Platform Reference Specification |
| GSR-DOC-001 | Backend Foundation / Data Entity Map |
| GSR-DOC-002 | Database Schema + Migrations |
| GSR-DOC-003 | Seed Data |
| GSR-DOC-004 | Project Scaffolding |
| GSR-DOC-005 | Public Site + Env Config |
| GSR-DOC-006 | CI/CD Pipeline |
| GSR-DOC-100 | Public Site Home |
| GSR-DOC-102 | Organizations Page |
| GSR-DOC-200 | Authentication |
| GSR-DOC-201 | Dashboard Layout |
| GSR-DOC-202 | Member Profile |
| GSR-DOC-203 | Deployment Records |
| GSR-DOC-204 | Incident Registry |
| GSR-DOC-205 | Sky Coins Economy |
| GSR-DOC-206 | Document Library |
| GSR-DOC-900 | Security Hardening (partial) |

### 🔜 Next Up (Phase 2 Completion)
| Doc | Title | Priority |
|-----|-------|----------|
| GSR-DOC-207 | Stripe Payments + Membership Billing | HIGH |
| GSR-DOC-208 | Notifications + Email | HIGH |
| GSR-DOC-101 | Public Site — remaining pages | MEDIUM |
| GSR-DOC-904 | Admin Dashboard | HIGH |

### 📋 Queued (Phase 4–6)
| Doc | Title | Phase |
|-----|-------|-------|
| GSR-DOC-400–405 | Validation + Evaluation Workflow | 4 |
| GSR-DOC-500–503 | Certification + Credentialing | 5 |
| GSR-DOC-600–613 | Organization Sponsorship + Team Credentialing | 6 |

---

## File Structure (Key Paths)

```
grey-sky-site/
├── CLAUDE.md                          # Claude Code project instructions
├── docs/
│   ├── design/                        # 23 design documents
│   │   ├── GSR-DOC-000-PLATFORM-SPEC.md  # Canonical reference
│   │   ├── GSR-DOC-QUEUE.md              # Master build queue
│   │   └── ...
│   ├── prompts/                       # Agent prompts
│   │   ├── CLAUDE-CODE-DISCIPLINE.md     # Self-review gate (mandatory)
│   │   ├── CLAUDE-APP-ARCHITECT.md       # Architect session prompt
│   │   └── CLAUDE-APP-ONBOARDING.md      # Onboarding prompt (outdated)
│   └── BUILD-JOURNAL.md              # Narrative history
├── references/
│   ├── FEMA_RTLT_NQS_Database.json   # 625 FEMA records
│   └── RTLT-TAXONOMY.md
├── src/
│   ├── app/
│   │   ├── (auth)/                    # Login, register, reset-password
│   │   ├── (dashboard)/               # All member dashboard pages
│   │   ├── (public)/                  # Marketing + public pages
│   │   ├── (admin)/                   # Admin stub
│   │   ├── (organization)/            # Agency stub
│   │   ├── api/documents/             # Document API routes
│   │   ├── evaluate/[token]/          # Phase 4 entry point
│   │   ├── validate/[token]/          # Phase 4 entry point
│   │   └── verify/[userId]/           # Verification page
│   ├── components/
│   │   ├── auth/                      # MFA, submit button
│   │   ├── coins/                     # Balance, ledger, purchase, catalog
│   │   ├── dashboard/                 # Layout, nav, stats, profile/*
│   │   ├── documents/                 # Upload, preview, library
│   │   ├── incidents/                 # Search, create, detail, timeline
│   │   ├── marketing/                 # Agency CTA, service lanes
│   │   └── public/                    # Join, onboarding, positions grid
│   └── lib/
│       ├── actions/                   # Server actions
│       ├── auth/                      # getUser, getUserOrPartial
│       ├── coins/                     # Coin operations
│       ├── config/                    # env.ts (Zod schema)
│       ├── queries/                   # Database queries
│       ├── security/                  # Rate limiter, validators
│       ├── supabase/                  # Client, server, middleware
│       ├── types/                     # TypeScript types + enums
│       └── validators/                # Input validation schemas
├── supabase/
│   └── migrations/                    # 15 SQL migration files
└── staticwebapp.config.json           # Azure SWA config
```

---

## Permanent Rules

These are non-negotiable platform constraints:

1. **No preferred pronouns anywhere in the platform** — permanent rule from Roy
2. **Language:** NOT "career" — use "service" / "serving" / "important roles" / "the work"
3. **Privacy is sovereign** — responders own their profile; agencies see only what's consented and scoped
4. **No Vercel-specific features** — hosted on Azure SWA
5. **No Sanity CMS** — removed early; platform owns its own data
6. **Design doc pipeline** — nothing gets built without a design doc, nothing gets a design doc without a number in the queue
7. **Brand:** Command Navy `#0A1628`, Signal Gold `#C5933A` — "Operational authority, not corporate polish"
8. **`NEXT_PUBLIC_*` secrets must be available at build time** in GitHub Actions

---

## Current Production User

| Field | Value |
|-------|-------|
| Auth ID | `6ffa15e7-b6a9-4aab-b68e-ed487ddda31e` |
| Email | `roy@longviewsolutionsgroup.com` |
| Role | `platform_admin` |
| Membership | `active` |
| Coin Balance | 0 |

---

## What to Do With This Document

If you're a Claude App session being briefed:

1. Read this document for current state awareness
2. Read `CLAUDE.md` in the repo root for build conventions
3. Read `docs/design/GSR-DOC-000-PLATFORM-SPEC.md` for the canonical platform spec
4. Read `docs/design/GSR-DOC-QUEUE.md` for the full build queue
5. Ask Roy what he wants to work on next

You are now current as of April 14, 2026, 12:20 PM EDT.
