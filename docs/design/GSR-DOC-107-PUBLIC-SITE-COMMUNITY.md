---
doc_id: GSR-DOC-107
title: "Public Site — Community"
phase: 1
status: complete
blocks_on: []
priority: normal
author: Roy E. Dunn
created: 2026-04-24
updated: 2026-04-24
backfilled: true
notes: Backfilled 2026-04-24. Live at /community. Establishes the Society framing — Grey Sky is a society of responders, not a job-board user base.
---

# GSR-DOC-107: Public Site — Community

| Field | Value |
|-------|-------|
| Phase | 1 |
| Status | complete (backfilled) |
| Blocks on | — |
| Priority | normal |

## Purpose

The community page establishes Grey Sky as a society of responders connected through shared professional experience — incidents served, communities helped, agencies served with, disciplines practiced. The platform's editorial premise: Grey Sky creates content that brings people together, rather than offering a search interface for finding peers.

This page is the doctrinal anchor for the affinity model that drives a responder's profile (DOC-202), connection prompts, and the editorial content surface (future docs).

## Structure

### Route

```
src/app/(public)/community/page.tsx
```

### Composed components

```
src/components/Header.tsx
src/components/Footer.tsx
src/components/WaitlistForm.tsx
```

### Sections

1. **Hero** — "Community" framing
2. **Affinity categories** — three cards illustrating the affinity model:
   - Shared Incidents (Hurricane Helene, Surfside Collapse, Maui Wildfires, Hurricane Ian as examples)
   - Communities Served (geographic and demographic)
   - Disciplines and Agencies (functional and organizational ties)
3. **How Grey Sky connects** — emphasis on editorial content, not search ("Grey Sky creates content that brings people together")
4. **CTA / waitlist** — email capture
5. **Footer**

## Business Rules

1. Page is fully public
2. The "search for affinities" framing is explicitly forbidden — language doctrine on this page is strict
3. Examples used (specific incidents, specific communities) must be ones the platform can credibly reference; do not invent connections that don't exist

## Copy Direction

- "Society", "community", "connection" — these are the operative terms
- Avoid "network", "user base", "members" (in the consumer-platform sense)
- Specific incidents named on the page should be ones with significant emergency-management presence (Helene, Surfside, Maui, Ian) — recognized by anyone in the field
- Editorial framing throughout — this is the page that signals Grey Sky is a publication-and-community surface, not a directory

## Acceptance Criteria

Page renders at `/community`. Affinity categories display correctly. Language compliance: zero instances of "search for affinities" or equivalent.

## Agent Lenses

- **Meridian:** "Grey Sky creates content that brings people together" is the doctrinal statement — preserved verbatim where used.
- **Lookout:** affinity cards are visible at a glance; the page communicates the model in seconds, not minutes.

## Backfill Note

Live behavior is the spec.
