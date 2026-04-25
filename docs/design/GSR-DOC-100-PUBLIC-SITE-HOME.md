---
doc_id: GSR-DOC-100
title: "Public Site — Home + Navigation"
phase: 1
status: complete
blocks_on: []
priority: critical
author: Roy E. Dunn
created: 2026-04-24
updated: 2026-04-24
backfilled: true
notes: Backfilled 2026-04-24 to close the design-doc gap on Phase 1 public pages that shipped ahead of formal documentation. Reflects live behavior at greysky.dev.
---

# GSR-DOC-100: Public Site — Home + Navigation

| Field | Value |
|-------|-------|
| Phase | 1 |
| Status | complete (backfilled) |
| Blocks on | — |
| Priority | critical |

## Purpose

The homepage is the first public-facing surface a prospective member, sponsoring agency, or curious responder encounters. It establishes the platform's positioning ("Your service. Your story. Recognized.") in operational language, signals doctrinal alignment (FEMA RTLT, NIMS), and routes visitors to the two primary funnels: tell-your-story for individual responders, and the organizations page for agencies. The homepage is not a marketing brochure; it is a credibility and routing surface.

## Structure

### Route

```
src/app/(public)/page.tsx                     — Homepage
```

### Composed components

```
src/components/Header.tsx                     — Global navigation (desktop + mobile)
src/components/Footer.tsx                     — Global footer
src/components/public/JoinCTA.tsx             — Tell Your Story CTA block
src/lib/disciplines.ts                        — Source data for the discipline grid
```

### Sections (top to bottom)

1. **Hero** — Command Navy background, gold accents, headline "Your service. Your story. Recognized.", supporting paragraph, primary CTA ("Tell Your Story" → `/join`), secondary CTA ("View RTLT Positions" → `/positions`)
2. **Disciplines grid** — 17 RTLT discipline categories surfaced as cards; each card links to `/standards/[discipline]`
3. **Membership pitch** — single-tier pricing framing ($100/yr, 1,000 Sky Coins), CTA to `/membership`
4. **Story prompt** — invitation block leading to `/story`
5. **Footer** — global, with Longview attribution and mailto fallback for contact

## Business Rules

1. The homepage is fully public (no auth gate, no member-only content)
2. The homepage is statically rendered where possible; dynamic sections (none currently) would mark `dynamic = 'force-dynamic'`
3. Brand tokens drive all colors and typography — Command Navy background, Signal Gold accents, Inter font, Ops White body backgrounds
4. The discipline grid pulls live from `lib/disciplines.ts` — adding a discipline updates the homepage automatically
5. Every CTA ends a visible path. No dead-ends.

## Copy Direction

- Headline uses the platform's anchor sentence: "Your service. Your story. Recognized."
- Body copy speaks to the responder directly: "You've spent years training, deploying, and leading..."
- Never use "career" — use "service", "the work", "important roles"
- No marketing punctuation excess — at most one exclamation point on the page; subjects of paragraphs are operational nouns

## Acceptance Criteria

Live at greysky.dev (root). Renders without auth. Every CTA routes correctly. Navigation header is global and consistent across public pages.

## Agent Lenses

- **Lookout:** mobile-first responsive; first paint shows the headline and primary CTA above the fold; total page weight constrained.
- **Meridian:** language and discipline framing aligns with FEMA RTLT vocabulary.
- **Threshold:** no PII rendered; no auth surface exposed.

## Backfill Note

Authored retroactively 2026-04-24. Live behavior is the spec. Subsequent homepage changes should update this doc rather than create a new one.
