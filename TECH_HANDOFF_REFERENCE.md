# LvSG Technical Handoff — Key Reference (extracted from DOCX)

> **NOTE (2026-05-04):** This file originated as a handoff snapshot from the LvSG marketing site. Stack details for **Grey Sky Portal** below have been corrected. The LvSG site (separate repo at `/Users/roydunn/Longview.Website.2026`) was its own decision tree. For Grey Sky Portal canonical stack, see `README.md` and `docs/agents/CLAUDE-APP-ONBOARDING.md`.

## Stack — Grey Sky Portal (authoritative)
- **Framework:** Next.js 16.1.6 (App Router, Server Components)
- **UI:** React 19
- **Language:** TypeScript 5
- **Styling:** Tailwind CSS (CSS variables)
- **Icons:** lucide-react
- **DB / Auth:** Supabase (Postgres + Auth)
- **Payments:** Stripe (test mode)
- **Hosting:** Azure Static Web Apps — `greysky-portal`, `rg-greysky-portal`, East US 2, Free tier (NOT Vercel — dropped 2026-04-08)
- **CMS:** None (Sanity.io dropped 2026-04-10 — never integrated)
- **CI/CD:** GitHub Actions → Azure SWA on push to `main`
- **Dev tools:** npm, ESLint, Vitest

## Accounts
- **GitHub org:** greyskyresponder (private repos)
- **Azure resource group:** rg-greysky-portal
- **Azure SWA:** greysky-portal
- **Custom domains:** greysky.dev, www.greysky.dev

## LvSG Site Status (separate repo, retained for context)
- Local dev path: `/Users/roydunn/Longview.Website.2026`
- Stack on that repo is its own decision; do not assume parity with Grey Sky Portal.

## Grey Sky Portal Status (grey-sky-site/)
- Marketing site scaffolded (Hero, About, Disciplines, Membership, CTA)
- Supabase schema.sql ready (10 tables)
- TypeScript types defined
- RTLT data staged in data/rtlt/
- No auth, no API routes, no dashboard pages yet

## Brand System
- Command Navy: #0A1628
- Signal Gold: #C5933A
- Design doctrine: "Operational authority, not corporate polish"
