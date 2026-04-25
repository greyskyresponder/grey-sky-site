---
doc_id: GSR-DOC-103
title: "Public Site — Standards + Disciplines"
phase: 1
status: complete
blocks_on:
  - GSR-DOC-003
priority: normal
author: Roy E. Dunn
created: 2026-04-24
updated: 2026-04-24
backfilled: true
notes: Backfilled 2026-04-24. Live at /standards and /standards/[discipline].
---

# GSR-DOC-103: Public Site — Standards + Disciplines

| Field | Value |
|-------|-------|
| Phase | 1 |
| Status | complete (backfilled) |
| Blocks on | GSR-DOC-003 ✅ |
| Priority | normal |

## Purpose

The standards section surfaces the FEMA RTLT (Resource Typing Library Tool) taxonomy that the platform is built on. It is the doctrinal proof point — visitors see that Grey Sky tracks the same 17 discipline categories and the same 612-entry resource library that FEMA itself publishes. Anyone who knows the framework recognizes it instantly. Anyone who doesn't, learns the framework's shape from these pages.

This is not a sales page. It is a credibility-by-transparency surface.

## Structure

### Routes

```
src/app/(public)/standards/page.tsx                     — Discipline browser
src/app/(public)/standards/[discipline]/page.tsx        — Per-discipline detail
src/app/(public)/positions/page.tsx                     — RTLT position browser (sibling)
src/app/(public)/positions/[slug]/page.tsx              — Per-position detail
src/app/(public)/teams/page.tsx                         — RTLT team-type browser (sibling)
src/app/(public)/teams/[slug]/page.tsx                  — Per-team-type detail
```

### Data sources

```
src/lib/disciplines.ts                                  — 17 discipline categories
references/FEMA_RTLT_NQS_Database.json                  — 625 RTLT records (positions, team types, PTBs, skillsets)
references/RTLT-TAXONOMY.md                             — Discipline taxonomy reference
```

### Sections (standards index)

1. **Hero** — Command Navy framing with the doctrinal anchor: "FEMA Resource Typing Library Tool — 612 entries across 17+ discipline categories"
2. **Discipline grid** — 17 cards, each linking to `/standards/[discipline]`
3. **Path to credentialing** — brief explanation of how a position in RTLT becomes a Grey Sky credential pathway

### Sections (per-discipline)

1. **Discipline header** — name, summary, count of positions/teams in this discipline
2. **Positions list** — RTLT positions filtered to this discipline, linking to `/positions/[slug]`
3. **Team types list** — RTLT team types filtered to this discipline, linking to `/teams/[slug]`

## Business Rules

1. All RTLT data renders from seeded reference data. No hand-curated lists.
2. Discipline slugs are URL-safe; matched against `disciplines.ts` registry
3. 404 on unknown discipline / position / team slug
4. Pages are statically generated where possible (no auth dependency)

## Copy Direction

- Doctrinal terminology preserved — never paraphrase RTLT terms. "Type 3 Hazmat Entry Team" not "Mid-tier hazmat team"
- Plain-language summaries follow the formal name in italics or in a subtitle
- No claims that aren't traceable to an RTLT entry

## Acceptance Criteria

`/standards` renders the discipline browser. `/standards/[discipline]` renders per-discipline detail for all 17 disciplines. `/positions/[slug]` renders detail for any of the 468 seeded positions. `/teams/[slug]` renders detail for any of the 152 seeded team types. Navigation paths are bidirectional (discipline → positions → discipline).

## Agent Lenses

- **Meridian:** RTLT terminology preserved verbatim. Discipline taxonomy matches the canonical FEMA RTLT taxonomy seeded in DOC-003.
- **Lookout:** browser-first navigation; the discipline-position-team triad is reachable from any of those three entry points.

## Backfill Note

Live behavior is the spec.
