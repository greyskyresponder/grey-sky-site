---
doc_id: GSR-DOC-104
title: "Public Site — About / Mission"
phase: 1
status: complete
blocks_on: []
priority: normal
author: Roy E. Dunn
created: 2026-04-24
updated: 2026-04-24
backfilled: true
notes: Backfilled 2026-04-24. Live at /about.
---

# GSR-DOC-104: Public Site — About / Mission

| Field | Value |
|-------|-------|
| Phase | 1 |
| Status | complete (backfilled) |
| Blocks on | — |
| Priority | normal |

## Purpose

The About page is where the platform claims its lineage and its mission. It establishes that Grey Sky Responder Society is owned by Longview Solutions Group LLC, founded by Roy E. Dunn (Principal and Chief Emergency Management Officer), and grounded in real operational experience — not a startup chasing a market. For senior officials evaluating the platform, this page is the credibility check.

## Structure

### Route

```
src/app/(public)/about/page.tsx
```

### Sections

1. **Hero** — "About Grey Sky Responder Society"
2. **Mission statement** — operational professional development for disaster responders
3. **Stats block** — four operational stats: 220+ professionals deployed, 17+ discipline categories, "Hours not days" response time framing, FEMA RTLT/NQS aligned
4. **Longview attribution** — Grey Sky is a Longview Solutions Group initiative; brief framing of Longview's role
5. **Founder framing** — Roy E. Dunn, Principal, decades of emergency management leadership
6. **CTA** — paths to `/membership` and `/organizations`

## Business Rules

1. The page is fully public, no auth gate
2. Stats are static in the page source — should be updated periodically as operational reality changes (no dynamic data dependency)
3. Longview Solutions Group LLC is named explicitly as the owning entity

## Copy Direction

- Voice: calm, confident, experienced. "Decades of leadership under pressure" not "industry-leading expertise"
- Avoid superlatives without substantiation
- Operational realism — claims are traceable to actual experience or verifiable doctrine

## Acceptance Criteria

Page renders at `/about`. Longview attribution visible. Mission statement aligned with the platform's anchor framing.

## Backfill Note

Authored retroactively. Stats may need refresh — note for next content sweep.
