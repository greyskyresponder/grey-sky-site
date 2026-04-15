# BUILD: GSR-DOC-102 — Organizations + Agencies Public Page

| Field | Value |
|-------|-------|
| Doc ID | GSR-DOC-102 |
| Phase | 1 — Public Site |
| Priority | High |
| Dependencies | None — this is a static content page |
| Parallel Safe | ✅ Yes — no DB, no shared component conflicts |

---

## Context

Read `CLAUDE.md` at the repo root before starting. This is a Next.js 16 + Tailwind CSS 4 application hosted on Azure Static Web Apps. Supabase Auth is the auth provider. Brand colors: Command Navy `#0A1628`, Signal Gold `#C5933A`, Ops White `#F5F5F5`, Font: Inter.

**Language rules (strict):** Use "service" / "serving" — NEVER "career." Use "readiness" not "compliance." Use "assessment" not "audit." Teams are "credentialed," individuals are "certified."

---

## What You Are Building

A single public page at `/organizations` that explains Grey Sky's two service lanes to agency decision-makers: individual member sponsorship and SRT-CAP team credentialing. This is the sales page for state emergency management directors.

## Prerequisites (already exist)

- Public page layout at `src/app/(public)/layout.tsx` with Header and Footer
- Homepage at `src/app/(public)/page.tsx` with hero section, 17-discipline grid, JoinCTA patterns
- Existing marketing components in `src/components/marketing/` or `src/components/ui/`
- Brand tokens as CSS custom properties in `src/app/globals.css`
- The 13 SRT disciplines are defined in `src/lib/disciplines.ts`

## Step 1: Page Component

Create `src/app/(public)/organizations/page.tsx`:

- Server component (no client-side state needed)
- Export metadata: `{ title: 'For Organizations + Agencies | Grey Sky Responder Society', description: 'Sponsor your responders and credential your specialty response teams with Grey Sky.' }`
- Six sections:

### Section 1: Hero
- Headline: "Your Teams. Verified Ready."
- Subhead: "Grey Sky Responder Society partners with state, county, and local agencies to credential specialty response teams and sponsor individual responder professional development — built on FEMA RTLT standards, delivered by practitioners who have led the work."
- Background: Command Navy with subtle topographic/grid pattern (consistent with existing hero sections)

### Section 2: Two Service Lanes (side-by-side on desktop, stacked on mobile)

**Lane A — Sponsor Your Responders**
- Headline: "Individual Member Sponsorship"
- Body: Organizations sponsor their responders' Grey Sky memberships. Sponsored members build verified service records, earn certifications, and pursue credentials — all tracked through the platform. The sponsoring agency sees certification status and readiness for sponsored disciplines only. No access to private records, deployment details, or personal documents.
- Key points:
  - $100/year per sponsored member (includes 1,000 Sky Coins)
  - Consent-based visibility — responders control what agencies see
  - Certification tracking across all FEMA RTLT positions
  - Readiness dashboards by discipline and team
  - Bulk sponsorship with organizational coin pools

**Lane B — Team Credentialing**
- Headline: "Specialty Response Team Assessment + Credentialing"
- Body: Longview Solutions Group delivers the SRT-CAP (Specialty Response Team Capabilities Assessment Program) — a structured assessment methodology that evaluates team readiness across 11 operational areas, assigns FEMA RTLT typing levels, and credentials individual team members. Currently under contract with the Florida Division of Emergency Management across 13 SRT disciplines statewide.
- Key points:
  - Structured self-assessment collection (11 sections)
  - Onsite expert assessment by qualified assessors
  - Detailed field reports with per-section scoring and recommendations
  - Final readiness determination with RTLT typing levels
  - Individual team member certifications through the engagement
  - Readiness dashboards and gap analysis

### Section 3: SRT-CAP Process Flow
Visual 6-step process (horizontal on md+, vertical on mobile, connected by lines/arrows):
1. **Contract** — Agency engages Longview for team assessment. Scope defined by discipline and team count.
2. **Self-Assessment** — Teams complete an 11-section self-assessment documenting readiness.
3. **Onsite Assessment** — Qualified assessors conduct field evaluation. Equipment verified. Capabilities observed.
4. **Field Report** — Per-section scoring (0–3), observations, and actionable recommendations.
5. **Final Report** — Readiness determination with RTLT typing level assignment.
6. **Credentialing** — Team receives credentialing outcome. Individual team members earn Grey Sky certifications.

Use Signal Gold for step numbers, Command Navy for text.

### Section 4: 13 SRT Disciplines Grid
- Responsive grid (3 columns on lg, 2 on md, 1 on sm)
- Disciplines: Urban Search & Rescue (US&R), Swiftwater/Flood Rescue (SWFRT), Hazardous Materials (HazMat), SWAT, Bomb Squad, Waterborne SAR, Land SAR, Small Unmanned Aircraft Systems (sUAS), Rotary Wing SAR, Animal Rescue/SAR, Incident Management Teams (IMT), EOC Management Support Teams, Public Safety Dive Teams
- Note below grid (italic): "Grey Sky supports credentialing for ALL team types defined in the FEMA Resource Typing Library Tool — not limited to the 13 Florida SRT disciplines listed above."
- Match the visual style of the homepage discipline grid

### Section 5: Reference Client
- Full-width band, Command Navy background, Signal Gold 2px top/bottom border
- Text: "Currently delivering statewide SRT-CAP assessments across 13 specialty response team disciplines under contract with the Florida Division of Emergency Management. Longview Solutions Group has assessed [X]+ teams, credentialed [X]+ individual responders, and delivered actionable readiness reports to county and state leadership."
- Use placeholder [X] — Roy will provide actual numbers.

### Section 6: CTA Section
Two buttons side-by-side (stack on mobile):
- "Start Sponsoring Your Team" → `mailto:info@greysky.org?subject=Organization%20Sponsorship%20Inquiry` (Signal Gold bg, Command Navy text)
- "Schedule a Readiness Conversation" → `mailto:info@greysky.org?subject=Team%20Credentialing%20Inquiry` (outline, Command Navy border)

## Step 2: Components

**ServiceLane** (`src/components/marketing/ServiceLane.tsx`):
- Props: `{ title: string, headline: string, body: string, points: string[], ctaText: string, ctaHref: string, variant: 'primary' | 'secondary' }`
- `primary` variant: Command Navy background, white text
- `secondary` variant: White background, Command Navy text, Signal Gold accent border
- Responsive: side-by-side on md+, stacked on mobile

**ReferenceClient** (`src/components/marketing/ReferenceClient.tsx`):
- Full-width Command Navy band, Signal Gold 2px border accent, centered text

**AgencyCtaSection** (`src/components/marketing/AgencyCtaSection.tsx`):
- Two CTA buttons as described above

## Step 3: Navigation Update

Update `src/components/layout/Header.tsx`:
- Add "For Agencies" link to main navigation (after "Community" or before "Join")
- Links to `/organizations`

Update `src/components/layout/Footer.tsx`:
- Add "For Agencies" link to footer nav
- Links to `/organizations`

## Step 4: Business Rules

1. **No pricing on this page** for team credentialing. Individual sponsorship is $100/year (public). Team credentialing is custom-quoted — "Contact us for a tailored assessment proposal."
2. **No login required.** Public marketing page.
3. **Florida reference is factual.** Use "under contract with" not "partnered with."
4. **RTLT scope is universal.** Emphasize ALL RTLT positions and team types — not just Florida's 13.

## Step 5: Verify

- `npm run build` passes with zero errors
- `/organizations` renders all six sections
- Page is responsive across mobile, tablet, desktop
- "For Agencies" link appears in header and footer navigation
- mailto links open email client with correct subjects
- Brand consistency: Command Navy, Signal Gold, Ops White, Inter font

## Commit Message

```
GSR-DOC-102: organizations + agencies public page — service lanes, SRT-CAP process, FDEM reference
```
