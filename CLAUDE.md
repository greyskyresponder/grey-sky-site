# Grey Sky Responder Society — Claude Code Project Instructions

## What This Is
Professional credentialing and team assessment platform for disaster responders, built on FEMA NQS/RTLT standards. Owned by Longview Solutions Group LLC.

## Design Doc Pipeline
All builds follow the design doc workflow. Before writing code:

1. Read `docs/design/NAMING-CONVENTIONS.md` — filename, folder, and structural rules (binding)
2. Read `docs/design/README.md` — phase map and workflow
3. Read `docs/design/GSR-DOC-000-PLATFORM-SPEC.md` — canonical platform reference (schema, API, workflows, security)
4. Read the specific GSR-DOC-NNN assigned for this session
5. If a build prompt exists, read `docs/prompts/GSR-DOC-NNN-PROMPT.md`

Only build what the design doc specifies. Do not freelance features.

## Reference Data
- `references/FEMA_RTLT_NQS_Database.json` — 625 FEMA RTLT records (positions, typing definitions, PTBs, skillsets)
- `references/RTLT-TAXONOMY.md` — discipline taxonomy
- `docs/design/GSR-REF-001-EXECUTIVE-FRAMEWORK.md` — business model, revenue, standards framework
- `docs/design/GSR-REF-002-AGENT-ARCHITECTURE.md` — nine-agent team roles and deployment model
- `docs/design/GSR-REF-003-EXECUTIVE-SUMMARY.md` — platform overview for stakeholders
- `docs/design/GSR-REF-004-IMPLEMENTATION-GUIDE.md` — build sequence, toolchain, deployment
- `docs/agents/CLAUDE-CODE-DISCIPLINE.md` — operating discipline for Claude Code sessions

## Stack
- Next.js 16 (App Router, Server Components)
- React 19
- TypeScript 5
- Tailwind CSS 4
- Supabase (Postgres)
- Hosted on Azure Static Web Apps (NOT Vercel — do not use Vercel-specific features)

## Brand
- Command Navy: `#0A1628`
- Signal Gold: `#C5933A`
- CSS custom properties: `--gs-navy`, `--gs-slate`, `--gs-steel`, `--gs-silver`, `--gs-cloud`, `--gs-white`, `--gs-accent`, `--gs-accent-dark`, `--gs-gold`, `--gs-alert`, `--gs-success`
- Font: Inter (Google Fonts)
- Tone: Operational authority, not corporate polish

## Language Rules
- NOT "career" — use "service" / "serving" / "important roles" / "the work"
- NOT "search for affinities" — Grey Sky creates content that brings people together
- Privacy is sovereign — responders own their profile, agencies see only what's consented and scoped

## Commit Convention
- `feat:` for new features
- `fix:` for bug fixes
- `docs:` for documentation
- `refactor:` for restructuring
- Push to `main` branch after each logical unit
- Reference the GSR-DOC-NNN in commit messages when applicable

## Verification
After every build:
- `npm run build` must pass with zero errors
- All new pages must render correctly
- Check against acceptance criteria in the design doc
