# Grey Sky Responder Society Portal

Credentialing, certification, and professional development platform for emergency responders. Built on FEMA NQS standards, mapped to FEMA RTLT.

## Stack

- **Framework:** Next.js 16.1.6 (App Router, Server Components)
- **UI:** React 19, Tailwind CSS, lucide-react
- **Language:** TypeScript 5
- **Database / Auth:** Supabase (Postgres + Auth)
- **Payments:** Stripe (test mode)
- **Hosting:** Azure Static Web Apps (`greysky-portal`, East US 2, Free tier)
- **Domains:** greysky.dev, www.greysky.dev
- **CI/CD:** GitHub Actions → Azure SWA on push to `main`

> **Do not use Vercel-specific features.** This project is hosted on Azure Static Web Apps. See `docs/design/GSR-DOC-006-CICD.md` and `CLAUDE.md` for guardrails.

## Brand

- Command Navy: `#0A1628`
- Signal Gold: `#C5933A`
- Doctrine: *Operational authority, not corporate polish.*

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Local dev server |
| `npm run build` | Production build |
| `npm start` | Run production build |
| `npm run lint` | ESLint |
| `npm test` | Vitest suite (run once) |
| `npm run test:watch` | Vitest watch mode |

## Supabase Schema

Schema, seeds, and migrations live in `supabase/`. To apply locally:

```bash
psql $DATABASE_URL -f supabase/schema.sql
psql $DATABASE_URL -f supabase/seeds/sample-tenants.sql
```

Migrations are in `supabase/migrations/` (run via Supabase CLI). TypeScript entity interfaces live in `src/lib/types.ts`.

## Documentation

- `CLAUDE.md` — Claude Code project guardrails
- `docs/design/` — design docs (GSR-DOC-NNN series)
- `docs/journal/` — build journal and status reports
- `docs/agents/` — agent onboarding (CLAUDE-APP-ARCHITECT, CLAUDE-APP-ONBOARDING)

## Repo

- **GitHub org:** `greyskyresponder`
- **Repo:** `grey-sky-site`
- **Default branch:** `main`
