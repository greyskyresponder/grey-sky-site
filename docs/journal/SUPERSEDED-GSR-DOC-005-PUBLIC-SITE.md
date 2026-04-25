# GSR-DOC-005: Public Site — Phase 1

| Field | Value |
|-------|-------|
| Phase | 1 |
| Status | draft |
| Blocks on | GSR-DOC-004 (scaffolding must be complete) |
| Priority | critical |

## Purpose

This builds the public-facing Phase 1 site for greysky.dev — the first thing every responder, agency, and potential member sees. It is not a brochure. It is the top of the funnel for a professional ecosystem.

Three things must work when this doc is complete:

1. **Homepage** — communicates the Grey Sky mission in operational language. Connects on the human level. Drives toward "Tell Your Story."
2. **RTLT Explainer Pages** — dynamic routes for every FEMA position and team type in the platform's reference database. Plain language. No jargon walls. Each page ends with a path to registration.
3. **Tell Your Story** — the onboarding funnel disguised as a storytelling invitation. Captures first name, last name, email, state, and primary discipline, then routes into Supabase Auth registration and the member onboarding flow.

The public site is pre-auth. No dashboard access. No member data. Every page ends with a clear path to join.

---

## Data Entities

No new tables. This doc reads from existing seed data and the RTLT reference JSON.

### Types

```typescript
// /src/types/rtlt.ts
export interface RTLTPosition {
  id: string
  title: string
  category: string
  discipline: string
  typing_levels: ('Type I' | 'Type II' | 'Type III' | 'Type IV')[]
  description: string
  minimum_qualifications: string[]
  nqs_alignment: string | null
  ptb_required: boolean
  slug: string
}

// /src/types/onboarding.ts
export interface OnboardingFormData {
  firstName: string
  lastName: string
  email: string
  state: string
  primaryDiscipline: string | null
  story: string | null  // optional free-text, captured but not required
}
```

### RTLT Data Source

- File: `references/FEMA_RTLT_NQS_Database.json` (625 records, in repo)
- Loaded at build time via `generateStaticParams` for static export compatibility
- Slugs derived from position title: lowercase, hyphens, no special chars

---

## Structure

```
src/
  app/
    (public)/
      layout.tsx                  — Public layout: nav + footer, no auth state
      page.tsx                    — Homepage
      about/
        page.tsx                  — About Grey Sky and the mission
      join/
        page.tsx                  — "Tell Your Story" — onboarding entry point
        success/
          page.tsx                — Post-submission confirmation
      positions/
        page.tsx                  — RTLT position index (browse all)
        [slug]/
          page.tsx                — Individual position explainer
      teams/
        page.tsx                  — Team type index
        [slug]/
          page.tsx                — Individual team type explainer
      register/
        page.tsx                  — Full registration form (post-story)
      login/
        page.tsx                  — Login
  components/
    public/
      SiteNav.tsx                 — Top nav with mobile menu
      SiteFooter.tsx              — Footer
      HeroSection.tsx             — Homepage hero
      MissionStatement.tsx        — Mission block
      RTLTCard.tsx                — Position card for index pages
      RTLTPositionDetail.tsx      — Full position explainer layout
      DisciplineGrid.tsx          — 13 SRT disciplines visual grid
      JoinCTA.tsx                 — Reusable "Tell Your Story" CTA block
      OnboardingForm.tsx          — Multi-step story capture + registration
      StepIndicator.tsx           — Step 1 / 2 / 3 progress indicator
  lib/
    rtlt.ts                       — Load + parse RTLT JSON, generate slugs
    onboarding.ts                 — Supabase registration action
```

### Route Summary

| Route | Type | Description |
|-------|------|-------------|
| `/` | Static | Homepage |
| `/about` | Static | Mission and platform overview |
| `/join` | Static | Tell Your Story entry |
| `/join/success` | Static | Post-submission page |
| `/positions` | Static | All RTLT positions index |
| `/positions/[slug]` | Static (625 pages) | Individual position explainer |
| `/teams` | Static | All team types index |
| `/teams/[slug]` | Static (13 pages) | Individual team type explainer |
| `/register` | Dynamic (client) | Registration form with Supabase auth |
| `/login` | Dynamic (client) | Login with redirect to `/dashboard` |

---

## Business Rules

**RTLT Pages**
- Every page generated at build time from `FEMA_RTLT_NQS_Database.json`
- Slug generation: `title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')`
- If a position has no description in source data, use a standard placeholder: "This position is part of the FEMA National Qualification System. Grey Sky is building verified credentialing for this role."
- Every position page ends with a `JoinCTA` block linking to `/join`
- No position page shows member data, search, or counts

**Tell Your Story / Onboarding Flow**
- Step 1: Story prompt — "What's a moment from your service that changed you?" (textarea, optional) + name + email
- Step 2: Location + discipline — State (required), primary discipline (optional dropdown from 13 SRT + General EM)
- Step 3: Account creation — password (min 12 chars, complexity enforced client-side) + terms acceptance
- On submit: `supabase.auth.signUp()` with metadata (firstName, lastName, state, primaryDiscipline, story)
- On success: redirect to `/join/success` then auto-redirect to `/dashboard` after 3 seconds
- On error: inline error message, no page reload
- Story text stored in `users.bio` column after account creation trigger fires

**Registration (direct `/register` route)**
- Same Step 2 and Step 3 as above (skips story prompt)
- For users who arrive from RTLT pages via "I serve in this role" CTA

**Login**
- Email + password via `supabase.auth.signInWithPassword()`
- On success: redirect to `/dashboard`
- Failed login: generic "Invalid email or password" — no enumeration
- Rate limiting: enforced at Supabase Auth layer

**Nav**
- Public nav: Logo | Positions | Teams | About | Join (gold button)
- Authenticated state (if session exists): replace "Join" with "Dashboard"
- Mobile: hamburger menu, full-screen overlay

---

## Copy Direction

**Homepage hero:** Lead with the human reality.
> "You've responded to disasters most people only see on the news. Grey Sky is where that service is documented, verified, and recognized."

Not: "The leading platform for emergency management professionals."

**RTLT pages:** Write like a mission brief, not a job description.
- What does this position actually do in the field?
- What makes someone qualified to hold it?
- What does FEMA say about it, in plain language?

**Tell Your Story CTA:** Invitation, not pitch.
> "Every responder has a moment that defines them. Tell us yours. It's how we start building your record."

**Join button label:** "Tell Your Story" — not "Sign Up," not "Register," not "Join Now"

**Form field labels:** Direct. "Your state" not "State of residence." "Your discipline" not "Primary specialty area."

---

## Acceptance Criteria

1. `npm run build` completes with zero errors and zero TypeScript errors
2. Homepage renders at `/` with hero, mission block, discipline grid, and JoinCTA
3. `/positions` renders index of all 625 RTLT positions, paginated (50 per page)
4. `/positions/[slug]` renders correctly for at least 10 spot-checked slugs including edge cases (long titles, special chars in source)
5. `/teams` renders all 13 team types
6. `/teams/[slug]` renders for all 13 slugs
7. `/join` multi-step form completes all 3 steps without page reload
8. Submitting `/join` with valid data creates a Supabase Auth user and a `public.users` row (verify in Supabase Studio)
9. Post-registration redirect lands at `/join/success` then navigates to `/dashboard` within 3 seconds
10. `/login` authenticates a seeded test user and redirects to `/dashboard`
11. SiteNav renders correctly on mobile (375px) and desktop (1280px)
12. All pages pass Lighthouse accessibility score ≥ 90
13. No page references auth-protected data or exposes member information
14. Azure Static Web Apps deployment (`npm run build && npx swa deploy`) completes without error

---

## Agent Lenses

- **Baseplate**: No new tables. RTLT data is read-only from JSON at build time. Registration writes only to Supabase Auth + the `public.users` trigger from DOC-002. No schema risk in this doc.
- **Meridian**: Position titles must match FEMA RTLT source exactly — no renaming, no shortening on the detail pages. Index cards may use shortened display titles for space. "Tell Your Story" language keeps service framing throughout.
- **Lookout**: Three-step form must never feel long. Step 1 is a single question + two fields. Progress indicator always visible. Mobile-first — responders will hit this on phones between shifts. Every CTA is one tap from the hero.
- **Threshold**: Registration form hits Supabase Auth — no raw passwords touch application code. Story text is user-generated content; sanitize before storing in `bio`. Login response never distinguishes between bad email and bad password. No session data rendered server-side on public routes.

---

## Claude Code Prompt

You are building the Phase 1 public site for the Grey Sky Responder Society platform at `greysky.dev`. This is a Next.js 16 (App Router) project with React 19, TypeScript 5, Tailwind CSS 4, and Supabase Auth. The repo is `greyskyresponder/grey-sky-site`.

**Brand tokens (already defined in globals.css — use these class names):**
- `--color-navy: #0A1628` (Command Navy — primary background, nav)
- `--color-gold: #C5933A` (Signal Gold — CTAs, accents, active states)
- `--color-ops-white: #F5F5F5` (Ops White — page background)
- `--color-text: #1A1A2E` (body text)

Tailwind 4 uses CSS custom properties. Use `bg-[var(--color-navy)]` etc. where needed, or define brand utilities in the CSS layer.

---

### STEP 1 — Install dependencies

```bash
npm install @supabase/supabase-js @supabase/ssr
```

Supabase client is already configured from DOC-004 scaffolding. Client is at `src/lib/supabase/client.ts` and server client at `src/lib/supabase/server.ts`.

---

### STEP 2 — RTLT data utility

Create `/src/lib/rtlt.ts`:

```typescript
import rtltData from '@/references/FEMA_RTLT_NQS_Database.json'

export interface RTLTPosition {
  id: string
  title: string
  category: string
  discipline: string
  typing_levels: string[]
  description: string
  minimum_qualifications: string[]
  nqs_alignment: string | null
  ptb_required: boolean
  slug: string
}

function toSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export function getAllPositions(): RTLTPosition[] {
  return (rtltData as any[]).map((entry) => ({
    id: entry.id ?? entry.resource_id ?? String(Math.random()),
    title: entry.title ?? entry.resource_name ?? 'Unknown Position',
    category: entry.category ?? entry.resource_category ?? '',
    discipline: entry.discipline ?? entry.kind ?? '',
    typing_levels: entry.typing_levels ?? [],
    description: entry.description ?? entry.minimum_capabilities ??
      'This position is part of the FEMA National Qualification System. Grey Sky is building verified credentialing for this role.',
    minimum_qualifications: entry.minimum_qualifications ?? [],
    nqs_alignment: entry.nqs_alignment ?? null,
    ptb_required: entry.ptb_required ?? false,
    slug: toSlug(entry.title ?? entry.resource_name ?? 'position'),
  }))
}

export function getPositionBySlug(slug: string): RTLTPosition | undefined {
  return getAllPositions().find((p) => p.slug === slug)
}

export function getAllSlugs(): string[] {
  return getAllPositions().map((p) => p.slug)
}
```

---

### STEP 3 — Public layout

Create `/src/app/(public)/layout.tsx`:

```tsx
import { SiteNav } from '@/components/public/SiteNav'
import { SiteFooter } from '@/components/public/SiteFooter'

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteNav />
      <main>{children}</main>
      <SiteFooter />
    </>
  )
}
```

---

### STEP 4 — SiteNav component

Create `/src/components/public/SiteNav.tsx`:

```tsx
'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navLinks = [
  { label: 'Positions', href: '/positions' },
  { label: 'Teams', href: '/teams' },
  { label: 'About', href: '/about' },
]

export function SiteNav() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  return (
    <header className="bg-[var(--color-navy)] border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3">
          <span className="text-white font-bold text-lg tracking-wide">GREY SKY</span>
          <span className="text-[var(--color-gold)] text-xs font-medium uppercase tracking-widest hidden sm:block">
            Responder Society
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-medium transition-colors ${
                pathname.startsWith(link.href)
                  ? 'text-[var(--color-gold)]'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/join"
            className="bg-[var(--color-gold)] text-[var(--color-navy)] px-4 py-2 rounded text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            Tell Your Story
          </Link>
        </nav>

        {/* Mobile menu button */}
        <button
          className="md:hidden text-white p-2"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          <div className="w-6 h-0.5 bg-current mb-1.5" />
          <div className="w-6 h-0.5 bg-current mb-1.5" />
          <div className="w-6 h-0.5 bg-current" />
        </button>
      </div>

      {/* Mobile overlay */}
      {open && (
        <div className="md:hidden bg-[var(--color-navy)] border-t border-white/10 px-4 py-6 flex flex-col gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="text-white text-lg font-medium"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/join"
            onClick={() => setOpen(false)}
            className="bg-[var(--color-gold)] text-[var(--color-navy)] px-4 py-3 rounded text-center font-semibold"
          >
            Tell Your Story
          </Link>
        </div>
      )}
    </header>
  )
}
```

---

### STEP 5 — SiteFooter component

Create `/src/components/public/SiteFooter.tsx`:

```tsx
import Link from 'next/link'

export function SiteFooter() {
  return (
    <footer className="bg-[var(--color-navy)] text-white/60 mt-24 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <p className="text-white font-semibold mb-2">Grey Sky Responder Society</p>
            <p className="text-sm">A Longview Solutions Group platform.<br />Serving those who serve.</p>
          </div>
          <div>
            <p className="text-white font-semibold mb-2">Platform</p>
            <ul className="text-sm space-y-1">
              <li><Link href="/positions" className="hover:text-white transition-colors">RTLT Positions</Link></li>
              <li><Link href="/teams" className="hover:text-white transition-colors">Team Types</Link></li>
              <li><Link href="/about" className="hover:text-white transition-colors">About</Link></li>
            </ul>
          </div>
          <div>
            <p className="text-white font-semibold mb-2">Join</p>
            <ul className="text-sm space-y-1">
              <li><Link href="/join" className="hover:text-white transition-colors">Tell Your Story</Link></li>
              <li><Link href="/login" className="hover:text-white transition-colors">Member Login</Link></li>
            </ul>
          </div>
        </div>
        <p className="text-xs border-t border-white/10 pt-6">
          © {new Date().getFullYear()} Longview Solutions Group LLC. All rights reserved.
        </p>
      </div>
    </footer>
  )
}
```

---

### STEP 6 — JoinCTA reusable block

Create `/src/components/public/JoinCTA.tsx`:

```tsx
import Link from 'next/link'

interface JoinCTAProps {
  heading?: string
  subtext?: string
}

export function JoinCTA({
  heading = 'Your service deserves a record.',
  subtext = "Every responder has a moment that defines them. Tell us yours. It's how we start building your record.",
}: JoinCTAProps) {
  return (
    <section className="bg-[var(--color-navy)] text-white py-16 px-4">
      <div className="max-w-2xl mx-auto text-center">
        <h2 className="text-2xl sm:text-3xl font-bold mb-4">{heading}</h2>
        <p className="text-white/70 mb-8 text-lg">{subtext}</p>
        <Link
          href="/join"
          className="inline-block bg-[var(--color-gold)] text-[var(--color-navy)] font-semibold px-8 py-4 rounded hover:opacity-90 transition-opacity text-lg"
        >
          Tell Your Story
        </Link>
      </div>
    </section>
  )
}
```

---

### STEP 7 — Homepage

Create `/src/app/(public)/page.tsx`:

```tsx
import Link from 'next/link'
import { JoinCTA } from '@/components/public/JoinCTA'

const disciplines = [
  'Urban Search & Rescue',
  'Swiftwater / Flood Rescue',
  'Hazardous Materials',
  'SWAT',
  'Bomb Squad',
  'Waterborne SAR',
  'Land SAR',
  'Small UAS',
  'Rotary Wing SAR',
  'Animal Rescue / SAR',
  'Incident Management',
  'EOC Management Support',
  'Public Safety Dive',
]

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-[var(--color-navy)] text-white py-24 px-4">
        <div className="max-w-4xl mx-auto">
          <p className="text-[var(--color-gold)] text-sm font-semibold uppercase tracking-widest mb-4">
            Grey Sky Responder Society
          </p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6">
            You've responded to disasters most people only see on the news.
          </h1>
          <p className="text-xl text-white/80 mb-10 max-w-2xl">
            Grey Sky is where that service is documented, verified, and recognized —
            against the standards that actually matter in emergency management.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/join"
              className="bg-[var(--color-gold)] text-[var(--color-navy)] font-semibold px-8 py-4 rounded hover:opacity-90 transition-opacity text-center"
            >
              Tell Your Story
            </Link>
            <Link
              href="/positions"
              className="border border-white/30 text-white px-8 py-4 rounded hover:bg-white/10 transition-colors text-center"
            >
              Browse RTLT Positions
            </Link>
          </div>
        </div>
      </section>

      {/* Mission statement */}
      <section className="bg-[var(--color-ops-white)] py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-[var(--color-navy)] mb-6">
            Emergency management is still finding its identity as a profession.
          </h2>
          <p className="text-lg text-gray-700 mb-6">
            Responders spend years building expertise across incidents, disciplines, and agencies —
            but there's no unified way to document it, verify it, or have it recognized.
            Grey Sky changes that.
          </p>
          <p className="text-lg text-gray-700">
            We align every credential and certification to the FEMA Resource Typing Library Tool —
            the national standard for emergency management positions and team types.
            Not self-reported. Verified.
          </p>
        </div>
      </section>

      {/* Discipline grid */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold text-[var(--color-navy)] mb-2">
            13 Specialty Response Disciplines
          </h2>
          <p className="text-gray-600 mb-10">
            Grey Sky credentials all FEMA RTLT positions — starting with Florida's 13 SRT disciplines.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {disciplines.map((d) => (
              <div
                key={d}
                className="border border-gray-200 rounded p-4 bg-white hover:border-[var(--color-gold)] transition-colors"
              >
                <p className="font-medium text-[var(--color-navy)]">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <JoinCTA />
    </>
  )
}
```

---

### STEP 8 — RTLT Positions index

Create `/src/app/(public)/positions/page.tsx`:

```tsx
import Link from 'next/link'
import { getAllPositions } from '@/lib/rtlt'
import { JoinCTA } from '@/components/public/JoinCTA'

export const dynamic = 'force-static'

const PAGE_SIZE = 50

export default function PositionsPage({
  searchParams,
}: {
  searchParams: { page?: string }
}) {
  const page = parseInt(searchParams?.page ?? '1', 10)
  const positions = getAllPositions()
  const total = positions.length
  const start = (page - 1) * PAGE_SIZE
  const pagePositions = positions.slice(start, start + PAGE_SIZE)
  const totalPages = Math.ceil(total / PAGE_SIZE)

  return (
    <>
      <section className="bg-[var(--color-navy)] text-white py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-bold mb-4">RTLT Positions</h1>
          <p className="text-white/70 text-lg">
            {total} positions from the FEMA Resource Typing Library Tool —
            the national standard for emergency management roles.
          </p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
          {pagePositions.map((pos) => (
            <Link
              key={pos.slug}
              href={`/positions/${pos.slug}`}
              className="border border-gray-200 rounded p-4 bg-white hover:border-[var(--color-gold)] hover:shadow-sm transition-all"
            >
              <p className="font-semibold text-[var(--color-navy)] mb-1">{pos.title}</p>
              {pos.category && (
                <p className="text-sm text-gray-500">{pos.category}</p>
              )}
              {pos.typing_levels.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {pos.typing_levels.map((t) => (
                    <span
                      key={t}
                      className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              )}
            </Link>
          ))}
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Showing {start + 1}–{Math.min(start + PAGE_SIZE, total)} of {total}
          </p>
          <div className="flex gap-2">
            {page > 1 && (
              <Link
                href={`/positions?page=${page - 1}`}
                className="px-4 py-2 border border-gray-200 rounded text-sm hover:bg-gray-50"
              >
                Previous
              </Link>
            )}
            {page < totalPages && (
              <Link
                href={`/positions?page=${page + 1}`}
                className="px-4 py-2 bg-[var(--color-navy)] text-white rounded text-sm hover:opacity-90"
              >
                Next
              </Link>
            )}
          </div>
        </div>
      </section>

      <JoinCTA heading="Serve in one of these roles?" subtext="Start building your verified record today." />
    </>
  )
}
```

---

### STEP 9 — RTLT Position detail page

Create `/src/app/(public)/positions/[slug]/page.tsx`:

```tsx
import { notFound } from 'next/navigation'
import { getAllSlugs, getPositionBySlug } from '@/lib/rtlt'
import { JoinCTA } from '@/components/public/JoinCTA'
import type { Metadata } from 'next'

export async function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }))
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string }
}): Promise<Metadata> {
  const position = getPositionBySlug(params.slug)
  if (!position) return {}
  return {
    title: `${position.title} | Grey Sky Responder Society`,
    description: position.description.slice(0, 160),
  }
}

export default function PositionDetailPage({ params }: { params: { slug: string } }) {
  const position = getPositionBySlug(params.slug)
  if (!position) notFound()

  return (
    <>
      <section className="bg-[var(--color-navy)] text-white py-16 px-4">
        <div className="max-w-4xl mx-auto">
          {position.category && (
            <p className="text-[var(--color-gold)] text-sm font-semibold uppercase tracking-widest mb-3">
              {position.category}
            </p>
          )}
          <h1 className="text-3xl sm:text-4xl font-bold mb-4">{position.title}</h1>
          {position.typing_levels.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {position.typing_levels.map((t) => (
                <span
                  key={t}
                  className="bg-white/10 text-white/90 text-sm px-3 py-1 rounded"
                >
                  {t}
                </span>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-4 py-12">
        <div className="prose prose-lg max-w-none mb-12">
          <h2 className="text-xl font-semibold text-[var(--color-navy)] mb-4">About This Position</h2>
          <p className="text-gray-700">{position.description}</p>
        </div>

        {position.minimum_qualifications.length > 0 && (
          <div className="mb-12">
            <h2 className="text-xl font-semibold text-[var(--color-navy)] mb-4">
              Minimum Qualifications
            </h2>
            <ul className="space-y-2">
              {position.minimum_qualifications.map((q, i) => (
                <li key={i} className="flex gap-3 text-gray-700">
                  <span className="text-[var(--color-gold)] mt-1">▪</span>
                  <span>{q}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="bg-gray-50 border border-gray-200 rounded p-6">
          <p className="text-sm text-gray-500 mb-1">FEMA RTLT Standard</p>
          <p className="font-medium text-[var(--color-navy)]">{position.title}</p>
          {position.ptb_required && (
            <p className="text-sm text-gray-600 mt-2">
              ✓ Position Task Book (PTB) required for qualification
            </p>
          )}
          {position.nqs_alignment && (
            <p className="text-sm text-gray-600 mt-1">
              NQS Alignment: {position.nqs_alignment}
            </p>
          )}
        </div>
      </section>

      <JoinCTA
        heading="Do you serve in this role?"
        subtext="Grey Sky documents and verifies your service against the FEMA standard. Start your record today."
      />
    </>
  )
}
```

---

### STEP 10 — Teams index and detail

Create `/src/app/(public)/teams/page.tsx`:

```tsx
import Link from 'next/link'
import { JoinCTA } from '@/components/public/JoinCTA'

const teams = [
  { title: 'Urban Search & Rescue', slug: 'urban-search-and-rescue', description: 'Structural collapse, confined space, and technical rescue operations.' },
  { title: 'Swiftwater / Flood Rescue', slug: 'swiftwater-flood-rescue', description: 'Water rescue operations in moving and floodwater environments.' },
  { title: 'Hazardous Materials', slug: 'hazardous-materials', description: 'Detection, containment, and mitigation of hazardous substance incidents.' },
  { title: 'SWAT', slug: 'swat', description: 'Law enforcement tactical operations in high-risk environments.' },
  { title: 'Bomb Squad', slug: 'bomb-squad', description: 'Explosive ordnance disposal and render-safe operations.' },
  { title: 'Waterborne SAR', slug: 'waterborne-sar', description: 'Search and rescue on open water, lakes, and coastal environments.' },
  { title: 'Land SAR', slug: 'land-sar', description: 'Ground-based search and rescue in wilderness and urban settings.' },
  { title: 'Small UAS', slug: 'small-uas', description: 'Drone operations in support of emergency response missions.' },
  { title: 'Rotary Wing SAR', slug: 'rotary-wing-sar', description: 'Helicopter-based search and rescue operations.' },
  { title: 'Animal Rescue / SAR', slug: 'animal-rescue-sar', description: 'Large and small animal rescue operations during disasters.' },
  { title: 'Incident Management', slug: 'incident-management', description: 'ICS-based command and coordination across all hazard types.' },
  { title: 'EOC Management Support', slug: 'eoc-management-support', description: 'Emergency Operations Center staffing and coordination support.' },
  { title: 'Public Safety Dive', slug: 'public-safety-dive', description: 'Underwater search, recovery, and rescue in public safety contexts.' },
]

export default function TeamsPage() {
  return (
    <>
      <section className="bg-[var(--color-navy)] text-white py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-bold mb-4">Specialty Response Team Types</h1>
          <p className="text-white/70 text-lg">
            Aligned to FEMA RTLT team typing standards. Grey Sky credentials all 13 Florida SRT disciplines —
            with national expansion underway.
          </p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {teams.map((team) => (
            <Link
              key={team.slug}
              href={`/teams/${team.slug}`}
              className="border border-gray-200 rounded p-6 bg-white hover:border-[var(--color-gold)] hover:shadow-sm transition-all"
            >
              <h2 className="font-bold text-[var(--color-navy)] text-lg mb-2">{team.title}</h2>
              <p className="text-gray-600 text-sm">{team.description}</p>
            </Link>
          ))}
        </div>
      </section>

      <JoinCTA heading="Your team deserves recognition." subtext="SRT-CAP credentialing starts with Grey Sky." />
    </>
  )
}
```

Create `/src/app/(public)/teams/[slug]/page.tsx` — mirrors the positions detail pattern. Use the `teams` array above as the data source (move it to a shared constant or a `lib/teams.ts` file). `generateStaticParams` returns all 13 slugs. Each page shows the team title, description, a "What this team does" section, and a `JoinCTA`. Full implementation follows the same pattern as the position detail page — adapt for team data shape.

---

### STEP 11 — Tell Your Story (multi-step onboarding)

Create `/src/app/(public)/join/page.tsx`:

```tsx
import { OnboardingForm } from '@/components/public/OnboardingForm'

export default function JoinPage() {
  return (
    <div className="min-h-screen bg-[var(--color-ops-white)]">
      <section className="bg-[var(--color-navy)] text-white py-16 px-4">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-bold mb-4">Tell Your Story</h1>
          <p className="text-white/70 text-lg">
            Your service matters. Your experience is real. Grey Sky helps you document and verify it —
            starting with the moment that brought you here.
          </p>
        </div>
      </section>
      <div className="max-w-2xl mx-auto px-4 py-12">
        <OnboardingForm />
      </div>
    </div>
  )
}
```

Create `/src/components/public/OnboardingForm.tsx`:

```tsx
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const US_STATES = [
  'Alabama','Alaska','Arizona','Arkansas','California','Colorado','Connecticut',
  'Delaware','Florida','Georgia','Hawaii','Idaho','Illinois','Indiana','Iowa',
  'Kansas','Kentucky','Louisiana','Maine','Maryland','Massachusetts','Michigan',
  'Minnesota','Mississippi','Missouri','Montana','Nebraska','Nevada','New Hampshire',
  'New Jersey','New Mexico','New York','North Carolina','North Dakota','Ohio',
  'Oklahoma','Oregon','Pennsylvania','Rhode Island','South Carolina','South Dakota',
  'Tennessee','Texas','Utah','Vermont','Virginia','Washington','West Virginia',
  'Wisconsin','Wyoming','District of Columbia',
]

const DISCIPLINES = [
  'Urban Search & Rescue',
  'Swiftwater / Flood Rescue',
  'Hazardous Materials',
  'SWAT',
  'Bomb Squad',
  'Waterborne SAR',
  'Land SAR',
  'Small UAS',
  'Rotary Wing SAR',
  'Animal Rescue / SAR',
  'Incident Management',
  'EOC Management Support',
  'Public Safety Dive',
  'General Emergency Management',
]

interface FormState {
  firstName: string
  lastName: string
  email: string
  story: string
  state: string
  primaryDiscipline: string
  password: string
  confirmPassword: string
  termsAccepted: boolean
}

const INITIAL: FormState = {
  firstName: '',
  lastName: '',
  email: '',
  story: '',
  state: '',
  primaryDiscipline: '',
  password: '',
  confirmPassword: '',
  termsAccepted: false,
}

function validatePassword(pw: string): string | null {
  if (pw.length < 12) return 'Password must be at least 12 characters.'
  if (!/[A-Z]/.test(pw)) return 'Password must include an uppercase letter.'
  if (!/[0-9]/.test(pw)) return 'Password must include a number.'
  if (!/[^A-Za-z0-9]/.test(pw)) return 'Password must include a special character.'
  return null
}

export function OnboardingForm() {
  const [step, setStep] = useState(1)
  const [form, setForm] = useState<FormState>(INITIAL)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const update = (field: keyof FormState) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const value = e.target.type === 'checkbox'
      ? (e.target as HTMLInputElement).checked
      : e.target.value
    setForm((prev) => ({ ...prev, [field]: value }))
    setError(null)
  }

  function validateStep1(): string | null {
    if (!form.firstName.trim()) return 'Your first name is required.'
    if (!form.lastName.trim()) return 'Your last name is required.'
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      return 'A valid email address is required.'
    return null
  }

  function validateStep2(): string | null {
    if (!form.state) return 'Your state is required.'
    return null
  }

  function validateStep3(): string | null {
    const pwError = validatePassword(form.password)
    if (pwError) return pwError
    if (form.password !== form.confirmPassword) return 'Passwords do not match.'
    if (!form.termsAccepted) return 'You must accept the terms to continue.'
    return null
  }

  function handleNext() {
    const validators: Record<number, () => string | null> = {
      1: validateStep1,
      2: validateStep2,
    }
    const err = validators[step]?.()
    if (err) { setError(err); return }
    setStep((s) => s + 1)
  }

  async function handleSubmit() {
    const err = validateStep3()
    if (err) { setError(err); return }

    setLoading(true)
    setError(null)

    const sanitizedStory = form.story.replace(/<[^>]*>/g, '').slice(0, 2000)

    const { error: authError } = await supabase.auth.signUp({
      email: form.email.trim().toLowerCase(),
      password: form.password,
      options: {
        data: {
          first_name: form.firstName.trim(),
          last_name: form.lastName.trim(),
          state: form.state,
          primary_discipline: form.primaryDiscipline || null,
          bio: sanitizedStory || null,
        },
      },
    })

    if (authError) {
      setError('Something went wrong. Please try again.')
      setLoading(false)
      return
    }

    router.push('/join/success')
  }

  return (
    <div>
      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-8">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                s === step
                  ? 'bg-[var(--color-navy)] text-white'
                  : s < step
                  ? 'bg-[var(--color-gold)] text-[var(--color-navy)]'
                  : 'bg-gray-200 text-gray-500'
              }`}
            >
              {s < step ? '✓' : s}
            </div>
            {s < 3 && <div className={`h-0.5 w-8 ${s < step ? 'bg-[var(--color-gold)]' : 'bg-gray-200'}`} />}
          </div>
        ))}
        <span className="text-sm text-gray-500 ml-2">
          {step === 1 && 'Your story'}
          {step === 2 && 'Your background'}
          {step === 3 && 'Create account'}
        </span>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded p-3 mb-6 text-sm">
          {error}
        </div>
      )}

      {/* Step 1 */}
      {step === 1 && (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              What's a moment from your service that changed you?
              <span className="text-gray-400 font-normal ml-1">(optional)</span>
            </label>
            <textarea
              value={form.story}
              onChange={update('story')}
              rows={4}
              placeholder="You don't have to have the right words. Just start."
              className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-[var(--color-navy)]"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">First name</label>
              <input
                type="text"
                value={form.firstName}
                onChange={update('firstName')}
                className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-[var(--color-navy)]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Last name</label>
              <input
                type="text"
                value={form.lastName}
                onChange={update('lastName')}
                className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-[var(--color-navy)]"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Your email</label>
            <input
              type="email"
              value={form.email}
              onChange={update('email')}
              className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-[var(--color-navy)]"
            />
          </div>
          <button
            onClick={handleNext}
            className="w-full bg-[var(--color-navy)] text-white py-3 rounded font-semibold hover:opacity-90"
          >
            Continue
          </button>
        </div>
      )}

      {/* Step 2 */}
      {step === 2 && (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Your state</label>
            <select
              value={form.state}
              onChange={update('state')}
              className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-[var(--color-navy)]"
            >
              <option value="">Select your state</option>
              {US_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Your primary discipline
              <span className="text-gray-400 font-normal ml-1">(optional)</span>
            </label>
            <select
              value={form.primaryDiscipline}
              onChange={update('primaryDiscipline')}
              className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-[var(--color-navy)]"
            >
              <option value="">Select a discipline</option>
              {DISCIPLINES.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setStep(1)}
              className="flex-1 border border-gray-200 text-gray-700 py-3 rounded font-medium hover:bg-gray-50"
            >
              Back
            </button>
            <button
              onClick={handleNext}
              className="flex-1 bg-[var(--color-navy)] text-white py-3 rounded font-semibold hover:opacity-90"
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {/* Step 3 */}
      {step === 3 && (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Create a password</label>
            <input
              type="password"
              value={form.password}
              onChange={update('password')}
              className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-[var(--color-navy)]"
            />
            <p className="text-xs text-gray-400 mt-1">
              Min 12 characters, uppercase, number, and special character required.
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm password</label>
            <input
              type="password"
              value={form.confirmPassword}
              onChange={update('confirmPassword')}
              className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-[var(--color-navy)]"
            />
          </div>
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              id="terms"
              checked={form.termsAccepted}
              onChange={update('termsAccepted')}
              className="mt-0.5"
            />
            <label htmlFor="terms" className="text-sm text-gray-700">
              I agree to the Grey Sky Responder Society terms of service and understand that my
              deployment records will be stored and verified on this platform.
            </label>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setStep(2)}
              disabled={loading}
              className="flex-1 border border-gray-200 text-gray-700 py-3 rounded font-medium hover:bg-gray-50 disabled:opacity-50"
            >
              Back
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 bg-[var(--color-gold)] text-[var(--color-navy)] py-3 rounded font-semibold hover:opacity-90 disabled:opacity-50"
            >
              {loading ? 'Creating account…' : 'Join Grey Sky'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
```

---

### STEP 12 — Join success page

Create `/src/app/(public)/join/success/page.tsx`:

```tsx
'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function JoinSuccessPage() {
  const router = useRouter()

  useEffect(() => {
    const timer = setTimeout(() => router.push('/dashboard'), 3000)
    return () => clearTimeout(timer)
  }, [router])

  return (
    <div className="min-h-screen bg-[var(--color-navy)] flex items-center justify-center px-4">
      <div className="text-center text-white max-w-md">
        <div className="text-5xl mb-6">✓</div>
        <h1 className="text-3xl font-bold mb-4">Welcome to Grey Sky.</h1>
        <p className="text-white/70 text-lg mb-4">
          Your account is created. Your record starts now.
        </p>
        <p className="text-white/40 text-sm">Taking you to your dashboard…</p>
      </div>
    </div>
  )
}
```

---

### STEP 13 — Login page

Create `/src/app/(public)/login/page.tsx`:

```tsx
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleLogin() {
    setLoading(true)
    setError(null)

    const { error: authError } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    })

    if (authError) {
      setError('Invalid email or password.')
      setLoading(false)
      return
    }

    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen bg-[var(--color-ops-white)] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-[var(--color-navy)]">Member Login</h1>
          <p className="text-gray-600 mt-2">Access your Grey Sky record.</p>
        </div>

        <div className="bg-white border border-gray-200 rounded p-8">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded p-3 mb-6 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-[var(--color-navy)]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-[var(--color-navy)]"
              />
            </div>
            <button
              onClick={handleLogin}
              disabled={loading}
              className="w-full bg-[var(--color-navy)] text-white py-3 rounded font-semibold hover:opacity-90 disabled:opacity-50"
            >
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </div>

          <p className="text-center text-sm text-gray-500 mt-6">
            Not a member?{' '}
            <Link href="/join" className="text-[var(--color-navy)] font-medium hover:underline">
              Tell Your Story
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
```

---

### STEP 14 — About page

Create `/src/app/(public)/about/page.tsx` — static content page. Include: mission statement, the problem Grey Sky solves (no unified EM professional development), the RTLT/NQS backbone, how credentialing works (three trust layers: self-certified → validated → evaluated), and a `JoinCTA` at the bottom. Use service framing throughout — never "career."

---

### STEP 15 — Verify build and commit

```bash
npm run build
```

Zero errors required. Fix any TypeScript errors before committing.

Spot-check these routes in dev (`npm run dev`):
- `/` — hero renders, 13-item discipline grid shows, JoinCTA visible
- `/positions` — 625 position cards render, pagination controls appear
- `/positions/incident-commander` (or any valid slug) — detail page renders without error
- `/teams` — all 13 team cards render
- `/join` — all 3 steps complete without page reload, step indicator advances
- `/join/success` — renders and redirects to `/dashboard` after 3 seconds
- `/login` — renders, Enter key triggers login attempt

Commit message:
```
feat: public site — homepage, RTLT positions, teams, Tell Your Story onboarding (GSR-DOC-005)
```

Push to `main`.
