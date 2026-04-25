# Grey Sky Responder Society — Build Journal

> *A record of building something that matters.*
> *Started February 19, 2026. Built by Roy E. Dunn with AI assistance.*

---

## The Numbers (as of April 12, 2026)

| Metric | Count |
|--------|-------|
| Total commits | 48 |
| TypeScript/TSX files | 136 |
| SQL migrations | 9 |
| Design documents | 17 |
| Lines of TypeScript | 11,579 |
| Lines of SQL | 3,601 |
| FEMA RTLT positions seeded | 468 |
| RTLT team types seeded | 152 |
| Affinities seeded | 37 |
| Build time (first → latest commit) | 52 days |

---

## The Story

### Chapter 1 — The Spark (February 19, 2026)

It started with a scaffold and an idea: a professional society for emergency responders. Not another LinkedIn. Not another job board. A place where the people who run toward disaster could find each other, prove their qualifications, and build something together.

The first night was five commits — standing up a Next.js app, fighting Tailwind version conflicts, getting something deployed. The brand was already clear: **Command Navy and Signal Gold**. Operational authority, not corporate polish.

Then six weeks of silence. Not because the idea died — because disaster response doesn't wait for side projects. The real work came first.

**Commits:**
- `1313ebe` — Initial scaffold
- `6a4fc9b` through `f11b2ff` — Deployment fixes, Tailwind compatibility
- `3340029` — README update

---

### Chapter 2 — The Architecture Sprint (April 8–9, 2026)

When Roy came back, he came back with a plan. Two days, and the entire foundation went in:

**April 8** — The infrastructure decision. Azure Static Web Apps over Vercel. Supabase for auth and database. Sprint 1 shipped in a single commit: login, signup, protected dashboard, deployment pipeline. A decision was made to drop Sanity CMS — unnecessary complexity for a platform that would own its own data.

**April 9** — The marketing pivot. Roy redirected: marketing pages first, not the dashboard. The language changed — every reference to "career" became "service." RTLT expanded from 12 SRT disciplines to the full 17 FEMA categories (612 entries). The positioning crystallized: this isn't a platform for credentials — it's a platform for **identity in service**.

Then the design doc pipeline was born. GSR-DOC-000 (Platform Reference Spec), DOC-001 (Backend Foundation), the FEMA RTLT database integration, the Claude Code Discipline Protocol. Thirteen commits in two days. The bones of the platform.

**Key decisions:**
- Marketing-first MVP — tell the story before building the tools
- Azure SWA over Vercel — own the infrastructure
- No Sanity CMS — the platform owns its data
- Design-doc-driven development — every feature starts as a spec

**Commits:**
- `ce19e0b` — Azure SWA CI/CD
- `bc6351e` — Sprint 1: auth, dashboard, deploy
- `8129b22` — Marketing pages with positioning directives
- `7fa07b1` — Design assets consolidated
- `e1603a0` through `aafeff6` — DOC-001 backend foundation (6 commits)
- `75bdfaf` — Claude App onboarding
- `cdf6c71` — DOC-QUEUE: 50+ design docs across 7 phases

---

### Chapter 3 — The Schema (April 10, 2026)

The hardest day. The database schema — 24 tables, 30 enums, 8 migration files. Row-level security on every table. Append-only triggers on the ledger and audit log. The full FEMA RTLT NQS database: 152 team types, 468 positions, 37 affinities, all with deterministic UUIDs for reproducibility.

This wasn't just tables. This was the **data model for a responder's professional life** — deployments, certifications, organizations, incident history, verification workflows, skill affinities. Every column had to match NIMS typing. Every enum had to align with FEMA doctrine.

The TypeScript types came next — 24 interfaces across 7 entity group files, every property matching the schema exactly. Then the Claude Code Discipline Protocol: a self-review gate requiring security, doctrine, UX, error handling, and test coverage checks on every session.

**Commits:**
- `470ad2b` — Project restructure (DOC-004)
- `57a071f` — Complete database schema (DOC-002)
- `6801a3a` — Initial seed data (DOC-003)
- `e22e203` — Full FEMA RTLT database import (DOC-003)
- `43605fe` — TypeScript entity interfaces (DOC-004)
- `c492b44` — RLS fix for Supabase schema constraints
- `5cc8cc3` — Claude Code Discipline Protocol

---

### Chapter 4 — The Platform Takes Shape (April 11, 2026)

The biggest day. From infrastructure to features. Twelve commits. The platform went from schema and types to something a responder could actually use.

**Morning (0800–0900):** Six commits in one hour. Environment config with typed validation (DOC-005). CI/CD pipeline with GitHub Actions (DOC-006). Then the auth system — registration with state dropdown, login with session management, password reset, middleware role enforcement, MFA placeholder, security hardening. Every auth file got TODO test comments per the discipline protocol.

**Midday (0900–1100):** The dashboard came alive. Sidebar with navigation. Mobile bottom nav for field use. Welcome bar. Status cards. Recent activity feed. Quick action panel. Empty states written in operational language, not corporate boilerplate.

The public site got fixed too — teams derived dynamically from all 20 FEMA RTLT categories instead of a hardcoded array. Positions got pagination. Accessibility got real attention: ARIA labels, keyboard nav, screen reader support.

**Afternoon (1500–1620):** Two massive features shipped. Member profiles with avatar upload, organization affiliations, and affinity selection. Deployment records with full CRUD, RTLT position search, inline incident creation, and a draft→submitted workflow with ownership enforcement.

Then the incidents feature — the most complex build yet. ICS 209 alignment. FEMA enrichment fields. Geospatial support. Editorial storytelling. A full incident registry with dashboard pages, public pages, search, filtering, and a timeline component. Twenty-four files changed, 2,138 lines added.

**Commits:**
- `7aec1f6` — Environment config (DOC-005)
- `5ba7845` — CI/CD pipeline (DOC-006)
- `8387a8b` through `a0aed6a` — Auth system, 5 commits (DOC-200)
- `0f3b374`, `2e87c5b`, `1bd8890` — Dashboard layout + home (DOC-201)
- `ba5df8d` — Public site fix (DOC-005)
- `688fb0b` — Member profile + deployments (DOC-202, DOC-203)
- `5a69ddb` — Incident registry expansion (DOC-204)

---

### Chapter 5 — Refinement (April 12, 2026)

Past midnight. The expanded profile design doc got committed — a forward spec for Phase 2 covering service history, qualifications, languages, and a profile completeness engine. The pronoun fields were removed per directive: no controversial concepts in this society. The CI pipeline got cleaned — ESLint errors fixed, warnings suppressed, zero issues.

**Commits:**
- `24978cf` — DOC-202 expanded profile design doc
- `17c8e53` — Pronoun fields removed
- `2f05d65` — CI lint fixes: 0 errors, 0 warnings

---

## Design Documents Completed

| Doc ID | Title | Phase |
|--------|-------|-------|
| DOC-000 | Platform Reference Spec | Foundation |
| DOC-001 | Backend Foundation | Foundation |
| DOC-002 | Database Schema | Foundation |
| DOC-003 | Seed Data | Foundation |
| DOC-004 | Project Structure | Foundation |
| DOC-005 | Environment Config | Foundation |
| DOC-005-PUBLIC | Public Site | Foundation |
| DOC-006 | CI/CD Pipeline | Foundation |
| DOC-200 | Authentication | Phase 2 |
| DOC-201 | Dashboard Layout | Phase 2 |
| DOC-202 | Member Profile (Phase 1 + expansion spec) | Phase 2 |
| DOC-203 | Deployment Records | Phase 2 |
| DOC-204 | Incident Registry | Phase 2 |

---

## What's Built

- **Public marketing site** — Landing, teams (20 RTLT categories), positions (468), standards, story page
- **Authentication** — Register, login, password reset, email verification, middleware protection, role enforcement
- **Dashboard** — Sidebar nav, mobile nav, welcome bar, status cards, activity feed, quick actions
- **Member Profile** — View, edit, avatar upload, organization affiliations, affinity selection
- **Deployment Records** — List, create, edit, detail, RTLT position search, draft→submitted workflow
- **Incident Registry** — Dashboard CRUD + public pages, ICS 209 alignment, search, timeline, geospatial
- **Database** — 24 tables, 30 enums, 9 migrations, RLS on every table, append-only triggers
- **Seed Data** — Full FEMA RTLT database: 152 team types, 468 positions, 37 affinities
- **CI/CD** — GitHub Actions lint + build + Azure SWA deploy on every push
- **Infrastructure** — Azure Static Web Apps, Supabase (Postgres + Auth), Next.js 16.1.6

## What's Next

- [ ] GitHub repo secrets for full deployment pipeline
- [ ] Test coverage (TODO comments placed across all files)
- [ ] Profile expansion: service history, qualifications, completeness engine
- [ ] Sky Points economy
- [ ] Document library and certification tracking
- [ ] Organization dashboards
- [ ] SRT-CAP assessment workflow
- [ ] Verification portal

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16.1.6 (App Router, Server Components) |
| Language | TypeScript 5, React 19 |
| Styling | Tailwind CSS 4 |
| Database | Supabase (PostgreSQL + Auth + Storage) |
| Hosting | Azure Static Web Apps (Free tier) |
| CI/CD | GitHub Actions |
| Schema | 24 tables, 30 enums, RLS, append-only triggers |
| Data | FEMA RTLT NQS Database (625 records) |
| Brand | Command Navy #0A1628, Signal Gold #C5933A |

---

## The Guiding Principles

1. **Service, not career.** Every word in this platform reflects that responders serve — they don't just work.
2. **Privacy is sovereign.** The responder owns their data. No public directories. No browsable rosters.
3. **Doctrine alignment.** NIMS, NQS, RTLT, ICS 209 — the platform speaks the language of the profession.
4. **Operational authority, not corporate polish.** The brand says: these are the people who show up.
5. **Design-doc-driven.** Every feature starts as a spec. Every spec gets reviewed. Nothing ships without a plan.

---

*48 commits. 15,180 lines of code. 17 design documents. 52 days from first scaffold to a platform that can show a responder who they are, where they've served, and what they're capable of.*

*This is just the beginning.*
