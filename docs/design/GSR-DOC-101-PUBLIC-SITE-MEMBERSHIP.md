---
doc_id: GSR-DOC-101
title: "Public Site — Membership Page"
phase: 1
status: review
blocks_on: []
priority: high
author: Roy E. Dunn
created: 2026-04-24
updated: 2026-04-24
backfilled: true
notes: Backfilled 2026-04-24. Status is `review` (not `complete`) because OD-15 — Sky Coins spend categories alignment — is unresolved. The page lists spend categories that are not fully reconciled with DOC-205 spec. Page is live; copy refresh pending OD-15 resolution.
---

# GSR-DOC-101: Public Site — Membership Page

| Field | Value |
|-------|-------|
| Phase | 1 |
| Status | review (backfilled; OD-15 pending) |
| Blocks on | OD-15 (copy reconciliation) |
| Priority | high |

## Purpose

The membership page is the conversion surface for individual responders. It explains what the platform is, what membership costs, what the membership unlocks, and how Sky Coins work. It is the first place a prospective member commits financially.

## Structure

### Route

```
src/app/(public)/membership/page.tsx
```

### Composed components and data

```
src/components/marketing/TierCard.tsx          — Single-tier card with price, features, CTA
src/components/membership/MembershipCta.tsx    — Auth-aware CTA (sign in vs. join)
src/lib/stripe/membership.ts                   — getMembershipInfo() for live pricing
src/lib/auth/getUser.ts                        — current-session check for CTA variant
```

### Sections

1. **Hero** — single-tier framing: $100/yr, 1,000 Sky Coins included
2. **What you get** — platform-access bullet list (dashboard, profile, response reports, document library, Sky Coins balance, validation/evaluation requests)
3. **How Sky Coins work** — currency explanation: earn through service activity, spend on validations/evaluations/certifications
4. **Sky Coins spend categories** — current list ⚠️ pending OD-15 reconciliation; some items may not match DOC-205 canonical product list
5. **CTA** — auth-aware: signed-in users see "Manage membership" → dashboard; signed-out see "Tell Your Story" → /join

## Business Rules

1. Pricing is rendered from `getMembershipInfo()` (Stripe-backed) — no hardcoded prices in the page body
2. Auth-aware CTA via server-side session check
3. Page is fully public; no auth gate

## Copy Direction

- "$100 a year. 1,000 Sky Coins included." — direct framing
- "Service" not "career"
- Avoid promotional adjectives. Membership is described, not sold

## Open Items

- **OD-15 (Sky Coins spend categories):** the page enumerates spend categories that are not fully reconciled with the DOC-205 canonical product list. Update copy after OD-15 resolves.

## Acceptance Criteria

Page renders at `/membership`. Pricing matches the Stripe product configuration. CTA correctly varies by auth state. OD-15-flagged copy is annotated in the source for the next pass.

## Backfill Note

Live behavior is the spec. Awaiting OD-15 to drive a copy refresh; doc status will flip to `complete` after that pass.
