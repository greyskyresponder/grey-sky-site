# LvSG Technical Handoff — Key Reference (extracted from DOCX)

## Stack (Roy's learning stack — applies to Grey Sky Portal)
- **Framework:** Next.js 16.1.6 (App Router, Server Components)
- **UI:** React 19
- **Language:** TypeScript 5
- **Styling:** Tailwind CSS 4 (CSS variables)
- **Icons:** lucide-react
- **Fonts:** Playfair Display, Inter, IBM Plex Mono
- **CMS:** Sanity.io (@sanity/client 7.20.0, GROQ queries, 60s ISR)
- **Hosting:** Vercel (free tier, auto-deploy on push to main)
- **DB (Portal):** Supabase (Postgres) — already scaffolded in grey-sky-site
- **CI/CD:** git push → Vercel auto-deploy
- **Dev tools:** npm, ESLint, Prettier, Husky + lint-staged

## Accounts
- **GitHub org:** greyskyresponder (private repos)
- **Vercel team:** greyskyresponders-projects
- **Sanity project ID:** i5vzfkqt (org: oOgKpCeeq)
- **Domain:** longviewsolutionsgroup.com (cutover pending)

## LvSG Site Status
- Sprints 0-6 complete (6 of 26)
- Live at: longview-lemon.vercel.app
- 30+ inner pages, 19 CMS documents seeded
- Next: Sprint 7 (Mapbox, Formspree, launch prep)
- Local dev path: /Users/roydunn/Longview.Website.2026

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
