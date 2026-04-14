---
doc_id: GSR-DOC-102
title: "Public Site — For Organizations + Agencies"
phase: 1
status: approved
blocks_on: []
priority: high
author: Architecture Agent (Claude App)
created: 2026-04-13
updated: 2026-04-13
notes: >
  Public-facing page explaining organization sponsorship and team credentialing
  to state emergency management directors, county EM coordinators, and agency
  leadership. This is the sales page for Longview's primary revenue model.
---

# GSR-DOC-102: Public Site — For Organizations + Agencies

| Field | Value |
|-------|-------|
| Phase | 1 |
| Status | approved |
| Blocks on | none |
| Priority | high |

---

## Purpose

This is the sales page. It explains the two services Grey Sky offers to organizations and agencies: (1) sponsoring individual members for professional development and credentialing, and (2) contracting Longview Solutions Group to assess and credential specialty response teams using the SRT-CAP methodology.

The target audience is state emergency management directors, county EM coordinators, fire chiefs, law enforcement command staff, and agency leadership responsible for team readiness. These are decision-makers who control budgets and need to justify expenditures. The page must speak their language — readiness, accountability, compliance, and return on investment — not marketing jargon.

**This doc builds:**
- `/organizations` public page with two service lanes
- Individual member sponsorship explanation
- Team credentialing (SRT-CAP) service explanation
- Florida FDEM reference client callout
- Contact/inquiry CTA routing to `/join` (for orgs) or contact email
- Responsive design matching existing public site patterns

**What it does NOT build:**
- Organization registration or onboarding (DOC-600)
- Organization dashboard (DOC-609)
- Pricing calculator or quote builder (future)
- Stripe integration for org billing (DOC-613)

**Why it matters:**
Individual memberships at $100/year sustain the platform. Organization sponsorship and team credentialing engagements at $15,000–$75,000+ per contract fund the mission. This page is how agency decision-makers learn what Grey Sky offers and decide to engage. Every other state beyond Florida starts here.

---

## Data Entities

None. This is a static content page with no database interaction.

---

## Structure

### New Files

```
src/app/(public)/organizations/page.tsx    — Organizations + Agencies page
src/components/marketing/ServiceLane.tsx   — Reusable two-lane service card component
src/components/marketing/ReferenceClient.tsx — Florida FDEM reference callout
src/components/marketing/AgencyCtaSection.tsx — CTA section for agency inquiries
```

### Modified Files

```
src/components/layout/Header.tsx    — Add "For Agencies" link to main nav
src/components/layout/Footer.tsx    — Add "For Agencies" link to footer nav
```

---

## Page Structure

### Hero Section

**Headline:** "Your Teams. Verified Ready."

**Subhead:** "Grey Sky Responder Society partners with state, county, and local agencies to credential specialty response teams and sponsor individual responder professional development — built on FEMA RTLT standards, delivered by practitioners who have led the work."

**Background:** Command Navy with subtle topographic/grid pattern (consistent with existing hero sections).

### Section 1: Two Service Lanes

Present two clear service paths side by side (stack on mobile):

**Lane A — Sponsor Your Responders**

Headline: "Individual Member Sponsorship"

Body: Organizations sponsor their responders' Grey Sky memberships. Sponsored members build verified service records, earn certifications, and pursue credentials — all tracked through the platform. The sponsoring agency sees certification status and readiness for sponsored disciplines only. No access to private records, deployment details, or personal documents.

Key points:
- $100/year per sponsored member (includes 1,000 Sky Coins)
- Consent-based visibility — responders control what agencies see
- Certification tracking across all FEMA RTLT positions
- Readiness dashboards by discipline and team
- Bulk sponsorship with organizational coin pools

**Lane B — Team Credentialing**

Headline: "Specialty Response Team Assessment + Credentialing"

Body: Longview Solutions Group delivers the SRT-CAP (Specialty Response Team Capabilities Assessment Program) — a structured assessment methodology that evaluates team readiness across 11 operational areas, assigns FEMA RTLT typing levels, and credentials individual team members. Currently under contract with the Florida Division of Emergency Management across 13 SRT disciplines statewide.

Key points:
- Structured self-assessment collection (11 sections)
- Onsite expert assessment by qualified assessors
- Detailed field reports with per-section scoring and recommendations
- Final readiness determination with RTLT typing levels
- Individual team member certifications through the engagement
- Readiness dashboards and gap analysis

### Section 2: The SRT-CAP Process

Visual step-by-step process flow (horizontal on desktop, vertical on mobile):

1. **Contract** — Agency engages Longview for team assessment. Scope defined by discipline and team count.
2. **Self-Assessment** — Teams complete an 11-section self-assessment documenting readiness across deployment history, administrative compliance, personnel, equipment, capabilities, training, and exercises.
3. **Onsite Assessment** — Qualified assessors conduct field evaluation. Equipment verified. Capabilities observed. Training records reviewed.
4. **Field Report** — Per-section scoring (0–3), observations, and actionable recommendations delivered to the team.
5. **Final Report** — Readiness determination with RTLT typing level assignment. Delivered to the sponsoring agency.
6. **Credentialing** — Team receives credentialing outcome. Individual team members earn Grey Sky certifications for their assessed positions.

### Section 3: The 13 SRT Disciplines

Grid display (matching the existing homepage discipline grid style) of all 13 disciplines:

1. Urban Search & Rescue (US&R)
2. Swiftwater/Flood Rescue (SWFRT)
3. Hazardous Materials (HazMat)
4. SWAT
5. Bomb Squad
6. Waterborne SAR
7. Land SAR
8. Small Unmanned Aircraft Systems (sUAS)
9. Rotary Wing SAR
10. Animal Rescue/SAR
11. Incident Management Teams (IMT)
12. EOC Management Support Teams
13. Public Safety Dive Teams

Note below grid: "Grey Sky supports credentialing for ALL team types defined in the FEMA Resource Typing Library Tool — not limited to the 13 Florida SRT disciplines listed above."

### Section 4: Reference Client

**Florida Division of Emergency Management callout:**

"Currently delivering statewide SRT-CAP assessments across 13 specialty response team disciplines under contract with the Florida Division of Emergency Management. Longview Solutions Group has assessed [X]+ teams, credentialed [X]+ individual responders, and delivered actionable readiness reports to county and state leadership."

(Use placeholder numbers — Roy will provide actuals.)

Design: Full-width band with Command Navy background, Signal Gold accent border. State of Florida seal or FDEM reference (text only if seal requires permission).

### Section 5: Why Grey Sky

Three-column feature blocks:

**Built on Standards**
"Every assessment, certification, and credential is grounded in the FEMA Resource Typing Library Tool and National Qualification System. Grey Sky doesn't invent standards — we make them operational."

**Verified, Not Self-Reported**
"Responder qualifications are validated through 360-degree attestation, ICS 225-modeled evaluations, and expert peer review. No self-attestation. No honor system."

**Practitioner-Led**
"Longview Solutions Group is led by emergency management professionals who have served in the field. Our assessors have led incident management teams, directed specialty response operations, and understand what readiness actually looks like."

### Section 6: CTA

**For organizations interested in sponsoring members:**
"Start Sponsoring Your Team" → links to a mailto: `info@greysky.org` with subject "Organization Sponsorship Inquiry" (or to `/join` with an org flag parameter if the join page supports it)

**For agencies interested in team credentialing:**
"Schedule a Readiness Conversation" → links to a mailto: `info@greysky.org` with subject "Team Credentialing Inquiry"

**Note:** These are email CTAs until a proper contact form is built (DOC-105). The join page could also be extended with an "I represent an organization" path, but that's DOC-600 scope.

---

## Business Rules

1. **No pricing on this page.** Individual sponsorship is $100/year per member (public knowledge from membership page). Team credentialing engagements are custom-quoted — do NOT publish pricing. "Contact us for a tailored assessment proposal."

2. **No login required.** This is a public marketing page. No auth, no data queries.

3. **Florida reference is factual.** Do not overstate. Use "under contract with" not "partnered with." Use actual numbers when available, placeholder text when not.

4. **Language rules apply.** "Service" not "career." "Readiness" not "compliance." "Assessment" not "audit." "Credentialing" not "certification" when referring to the team-level outcome (teams are credentialed, individuals are certified).

5. **RTLT scope is universal.** Emphasize that Grey Sky covers ALL RTLT positions and team types — not just Florida's 13. The 13 are the initial set, not the ceiling.

---

## Copy Direction

**Tone:** Authoritative, operational, confident. This page speaks to people who have been in Emergency Operations Centers at 3am. Do not use corporate marketing language. Do not use stock photo energy. Speak plainly about what the service delivers and why it matters.

**Frame:** Readiness and accountability. Agencies need to know their teams are ready. Grey Sky provides the assessment, the evidence, and the verification infrastructure to prove it.

**Avoid:** "Solutions," "leverage," "synergy," "cutting-edge," "innovative," "best-in-class." Use: "Built for the work," "Verified by the people who do it," "Standards you already follow."

---

## Acceptance Criteria

1. `/organizations` page renders with all six sections
2. Two-lane service display clearly differentiates member sponsorship from team credentialing
3. SRT-CAP process flow displays as a 6-step visual progression
4. 13 SRT disciplines display in a grid consistent with existing homepage discipline grid
5. Reference client section displays Florida FDEM callout with placeholder for actual numbers
6. CTA buttons link to appropriate mailto addresses
7. "For Agencies" link added to Header and Footer navigation
8. Page is fully responsive — stacks appropriately on mobile
9. Brand consistency: Command Navy, Signal Gold, Ops White, Inter font
10. Language rules followed: "service" not "career," "readiness" not "compliance"
11. No pricing shown for team credentialing engagements
12. `npm run build` passes with zero errors

---

## Agent Lenses

### Baseplate (data/schema)
- No database interaction. Static content page. No schema concerns.

### Meridian (doctrine)
- SRT-CAP process steps match the actual engagement workflow from DOC-600 through DOC-607
- 13 disciplines match the Florida contract scope exactly
- RTLT universality statement is critical — this is how you sell beyond Florida
- "Assessment" vs "audit" distinction matters to agency leadership — audits imply fault-finding, assessments imply improvement

### Lookout (UX)
- Decision-makers scan, not read. Headlines must convey value in 5 words or fewer.
- Two-lane layout must make the choice obvious: "Are you sponsoring people or credentialing teams?"
- Process flow is for visual reassurance — "we have a structured methodology, not ad-hoc consulting"
- Mobile layout: lanes stack, process flow goes vertical, discipline grid goes 2-column

### Threshold (security)
- Public page. No auth, no PII, no data queries. No security concerns beyond standard headers (applied globally by DOC-900).

---

## Claude Code Prompt

You are building the "For Organizations + Agencies" public marketing page for the Grey Sky Responder Society portal. This is a Next.js 16 + Tailwind CSS 4 application.

### What You Are Building

A single public page at `/organizations` that explains Grey Sky's two service lanes to agency decision-makers: individual member sponsorship and SRT-CAP team credentialing.

### Prerequisites

The following already exist:
- Public page layout at `src/app/(public)/layout.tsx` with Header and Footer
- Homepage at `src/app/(public)/page.tsx` with hero section, 17-discipline grid, JoinCTA patterns
- Existing marketing components in `src/components/marketing/` or `src/components/ui/`
- Brand: Command Navy `#0A1628`, Signal Gold `#C5933A`, Ops White `#F5F5F5`
- Font: Inter via Google Fonts
- Tailwind CSS 4 with brand tokens as CSS custom properties (check `src/app/globals.css` for existing vars)
- The 13 SRT disciplines are defined in `src/lib/disciplines.ts`

### Step 1: Page Component

Create `src/app/(public)/organizations/page.tsx`:

- Server component (no client-side state needed)
- Export metadata: `{ title: 'For Organizations + Agencies | Grey Sky Responder Society', description: 'Sponsor your responders and credential your specialty response teams with Grey Sky.' }`
- Six sections as specified in the Page Structure above:
  1. Hero with headline "Your Teams. Verified Ready." and subhead
  2. Two service lanes side-by-side (responsive stack on mobile)
  3. SRT-CAP 6-step process flow
  4. 13 SRT disciplines grid
  5. Florida FDEM reference client callout
  6. CTA section with two mailto buttons

### Step 2: Components

**ServiceLane** (`src/components/marketing/ServiceLane.tsx`):
- Props: `{ title: string, headline: string, body: string, points: string[], ctaText: string, ctaHref: string, variant: 'primary' | 'secondary' }`
- Card layout with icon area, headline, body text, bullet points, CTA button
- `primary` variant: Command Navy background, white text
- `secondary` variant: White background, Command Navy text, Signal Gold accent border
- Responsive: side-by-side on desktop (md+), stacked on mobile

**ReferenceClient** (`src/components/marketing/ReferenceClient.tsx`):
- Full-width band with Command Navy background
- Signal Gold top/bottom border accent (2px)
- Text content: Florida FDEM reference statement with placeholder numbers
- Centered layout, max-width constrained

**AgencyCtaSection** (`src/components/marketing/AgencyCtaSection.tsx`):
- Two CTA buttons side-by-side (stack on mobile)
- Button 1: "Start Sponsoring Your Team" → `mailto:info@greysky.org?subject=Organization%20Sponsorship%20Inquiry`
- Button 2: "Schedule a Readiness Conversation" → `mailto:info@greysky.org?subject=Team%20Credentialing%20Inquiry`
- Primary button style: Signal Gold background, Command Navy text
- Secondary button style: outline with Command Navy border

### Step 3: Process Flow

Build the SRT-CAP process flow as a horizontal step sequence (CSS flexbox/grid):
- 6 steps with numbered circles, titles, and short descriptions
- Connected by lines/arrows between steps
- Horizontal on md+ screens, vertical on mobile
- Use Signal Gold for step numbers, Command Navy for text
- Steps: Contract → Self-Assessment → Onsite Assessment → Field Report → Final Report → Credentialing

### Step 4: Disciplines Grid

Reuse or adapt the existing discipline grid from the homepage (`src/lib/disciplines.ts`):
- Display all 13 SRT disciplines in a responsive grid (3 columns on lg, 2 on md, 1 on sm)
- Each discipline: name and brief descriptor
- Below grid: italic note about RTLT universality
- Match the visual style of the homepage discipline grid

### Step 5: Navigation Update

Update `src/components/layout/Header.tsx`:
- Add "For Agencies" link to the main navigation, positioned after "Community" or before "Join"
- Links to `/organizations`

Update `src/components/layout/Footer.tsx`:
- Add "For Agencies" link to footer navigation
- Links to `/organizations`

### Step 6: Verify

- `npm run build` must pass with zero errors
- `/organizations` renders all six sections
- Page is responsive across mobile, tablet, and desktop
- Navigation includes "For Agencies" in header and footer
- mailto links open email client with correct subjects
- Brand consistency maintained

### Commit Message

`GSR-DOC-102: organizations + agencies public page — service lanes, SRT-CAP process, FDEM reference`
