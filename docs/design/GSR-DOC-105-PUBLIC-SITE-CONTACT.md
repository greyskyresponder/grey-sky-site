---
doc_id: GSR-DOC-105
title: "Public Site — Contact Surface"
phase: 1
status: review
blocks_on: []
priority: normal
author: Roy E. Dunn
created: 2026-04-24
updated: 2026-04-24
backfilled: true
notes: Backfilled 2026-04-24. There is no standalone /contact route. Footer mailto is the current contact surface. Status is `review` pending decision on whether a dedicated contact page or form is warranted.
---

# GSR-DOC-105: Public Site — Contact Surface

| Field | Value |
|-------|-------|
| Phase | 1 |
| Status | review (no standalone page; footer mailto is current) |
| Blocks on | — |
| Priority | normal |

## Purpose

This doc captures the platform's current public contact surface and frames the decision for whether to expand it. As of 2026-04-24, the platform's only public contact surface is a `mailto:` link in the global footer. There is no `/contact` route, no contact form, no support ticketing surface.

## Current State

### Surface

The global `Footer.tsx` component renders a `mailto:` link that opens the visitor's default email client to compose a message. Recipient address is the platform's operational contact (currently `support@longviewsolutionsgroup.com` or equivalent — verify in source).

### What this implies operationally

- Inbound public contact arrives as email to a Longview-monitored inbox
- No structured intake; sender provides whatever they choose to provide
- No automated routing, categorization, or SLA tracking
- No CAPTCHA or anti-spam friction beyond what email client / mailbox filters apply

## Recommendation

Two options:

### Option A — Keep mailto, no dedicated page (current state)

Acceptable for current traffic. Email is universal. Senior officials who want to reach Longview will either use the mailto or look up Longview's primary domain contact. No engineering work required.

**When to revisit:** if inbound volume or signal-to-noise ratio degrades.

### Option B — Build a dedicated /contact route with a structured form

Form fields: name, email, organization (optional), inquiry type (general / membership / sponsorship / press / technical), message body. Server action validates, deposits into a `contact_submissions` table, and routes notification email to Longview operators. Adds CAPTCHA (Cloudflare Turnstile or hCaptcha).

**When this is justified:** when (a) inbound volume warrants categorization, or (b) the platform begins to be referenced in places that direct people to find a form (press kits, partner pages, agency pitch packs), or (c) compliance or audit needs structured intake records.

## Recommendation

Stay on Option A for now. Revisit when one of the triggers above fires. If a contact page is built, it should be a small follow-on doc (DOC-105 v2 or a new DOC-1XX) with the structured-intake design.

## Acceptance Criteria

The footer mailto resolves to the correct operational inbox. No `/contact` route currently exists or is required.

## Backfill Note

This is the smallest backfill in the set — it documents the absence of a feature and the rationale for that absence. Most platforms over-build the contact surface; this one deliberately does not. The doc is here so the decision is on the record.
