---
doc_id: GSR-DOC-106
title: "Public Site — Tell Your Story"
phase: 1
status: complete
blocks_on: []
priority: normal
author: Roy E. Dunn
created: 2026-04-24
updated: 2026-04-24
backfilled: true
notes: Backfilled 2026-04-24. Live at /story. The page is the onboarding funnel disguised as a storytelling invitation — a deliberate framing choice that distinguishes Grey Sky from a recruitment platform.
---

# GSR-DOC-106: Public Site — Tell Your Story

| Field | Value |
|-------|-------|
| Phase | 1 |
| Status | complete (backfilled) |
| Blocks on | — |
| Priority | normal |

## Purpose

"Tell Your Story" is the platform's primary onboarding surface for individual responders, framed as an invitation to document professional service rather than a recruitment funnel. The framing is doctrinal: responders serve. This is not a job board. The page invites a responder to begin the process of putting their service on the record — and that record is what becomes the basis for credentialing.

The page also surfaces the lifecycle stages of professional development on the platform, so a visitor sees the long arc, not just the first step.

## Structure

### Route

```
src/app/(public)/story/page.tsx
```

### Composed components

```
src/components/Header.tsx
src/components/Footer.tsx
src/components/WaitlistForm.tsx                — Email capture for prospective members
```

### Sections

1. **Hero** — "Tell Your Story" framing, subhead establishing professional-service language
2. **Lifecycle stages** — Entry, Training, Deployment, Validation, Evaluation, Credentialing — each described in terms of what the responder does, not what the platform does to them
3. **Why this matters** — the human-level connection: "I can never explain to my children what we do in disasters" → Grey Sky solves that
4. **CTA / waitlist form** — email capture, currently routed to a waitlist (full registration is gated behind DOC-200 auth flow)
5. **Footer**

## Business Rules

1. Page is fully public
2. Waitlist form captures email + state + primary discipline (minimum); persists to a `waitlist` table or routes via the email service (verify in source)
3. The page does NOT collect PII beyond what is required for waitlist routing — no DOB, no SSN, no government IDs
4. Language uses "service", "the work", "important roles" — never "career"

## Copy Direction

- Frame service as identity, not job
- Lifecycle stages are described in active voice from the responder's perspective ("You begin..." not "We onboard you...")
- The platform is the recipient of the story, not its author
- Any quote-style framings about "explaining to my children" or similar must be honest — these are real responder experiences, not marketing artifacts

## Acceptance Criteria

Page renders at `/story`. Waitlist form submits without error. Lifecycle stages display correctly across viewport sizes. Language compliance: zero instances of "career" on the page.

## Agent Lenses

- **Meridian:** language doctrine enforced. The page is the platform's strongest doctrinal statement to a non-member visitor.
- **Lookout:** the form is reachable above the fold on mobile after a single scroll; the lifecycle is browsable but not blocking the conversion.

## Backfill Note

Live behavior is the spec.
