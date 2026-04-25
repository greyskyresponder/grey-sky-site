---
doc_id: GSR-DOC-401
title: "Validation Response — External Public Form"
phase: 4
status: approved
blocks_on:
  - GSR-DOC-400
priority: critical
author: Roy E. Dunn
created: 2026-04-15
updated: 2026-04-24
notes: Split from GSR-DOC-400-401-VALIDATION.md on 2026-04-24 per NAMING-CONVENTIONS.md "one doc per buildable unit" rule. Companion is GSR-DOC-400-VALIDATION-REQUEST.md (the member-side request flow). Combined Claude Code build prompt at docs/prompts/GSR-DOC-400-PROMPT.md.
---

# GSR-DOC-401: Validation Response — External Public Form

| Field | Value |
|-------|-------|
| Phase | 4 |
| Status | approved |
| Blocks on | GSR-DOC-400 |
| Priority | critical |

## Purpose

This doc covers the **public-facing validation response form** seen by the validator (a colleague, supervisor, or peer named in a member's validation request). It is the external surface of the 360 validation workflow.

The token IS the authorization. No authentication is required. The validator clicks a link, sees a clean, professional form summarizing the deployment under attestation, confirms or declines, and submits. The form must work on a phone in the field, and it must look credible to a senior official seeing Grey Sky for the first time.

The member-side request flow (where the member spends 10 Sky Coins and dispatches the link) is GSR-DOC-400.

## User Journey — Validator Responds (Public Form)

1. Validator clicks the link in their email (or receives it directly)
2. Arrives at `/validate/[token]` — **no authentication required**
3. Page calls `get_validation_by_token(token)` via Supabase RPC
4. **If token is invalid, expired, or already used:** Show clean error message ("This validation link has expired or has already been used.")
5. **If token is valid:** Display:

   **Header:** "Deployment Validation Request"

   **Deployment Summary** (read-only, sanitized — no PII beyond what the validator needs):
   - Member name (first + last)
   - Incident name
   - Position/role title
   - Dates of deployment (start → end)
   - Agency/organization

   **Question:** "Can you confirm that this person served in this role during this deployment?"

   **Response Options:**
   - ✅ **Confirm** — "Yes, I can attest to this deployment"
   - ❌ **Decline** — "I cannot confirm this deployment"

   **Comments** (textarea, optional): Additional context from the validator

   **Legal Attestation** (required checkbox):
   > "I attest that the information I have provided is true and accurate to the best of my knowledge. I understand that this attestation may be used in professional credentialing processes."

   **Submit button** — disabled until attestation is checked + confirm/decline selected

6. On submit, calls `submit_validation_response(token, status, response_text, attestation_accepted)` via server action
7. **Success page:** "Thank you. Your response has been recorded."
8. Member's deployment record detail updates to show **Confirmed** or **Denied** status
9. [Future] Member receives notification of the response
10. [Future] If confirmed, validator earns 5 Sky Coins (if they have an account)

## Data Entities

### Existing Tables and Functions (NO migrations required)

**`validation_requests`** — schema in GSR-DOC-400.

**`get_validation_by_token(p_token UUID)`** — in `20260415000002_security_patch.sql`:
- SECURITY DEFINER, returns pending + non-expired request
- Granted to `anon` and `authenticated`

**`submit_validation_response(p_token, p_status, p_response_text, p_attestation_accepted)`** — same migration:
- SECURITY DEFINER, validates status is `confirmed` or `denied`
- Locks row with `FOR UPDATE`, checks pending + non-expired
- Updates status, response_text, attestation_text, attestation_accepted, responded_at

### RLS Posture for Token Access

The 2026-04-15 security patch dropped the older `validation_select_by_token` and `validation_update_by_token` policies and revoked direct `anon` access to the table. **All token-based access now goes through SECURITY DEFINER functions only.** This is a Threshold lens hard line — never expose token-keyed rows directly via RLS.

## Files to Create / Modify (Public-Side)

### New Files

1. **`src/lib/validation/actions.ts`** — Server actions (response-side subset):
   - `getValidationByToken(token)` — calls `supabase.rpc('get_validation_by_token', { p_token: token })`
   - `submitValidationResponse(token, status, responseText?, attestationAccepted)` — calls `supabase.rpc('submit_validation_response', {...})`

2. **`src/lib/validation/schemas.ts`** — Zod schemas (response-side subset):
   - `submitValidationSchema` — status enum, optional response text, attestation boolean

3. **`src/app/validate/[token]/page.tsx`** — Replace stub. Public form:
   - Server component that calls `getValidationByToken(token)`
   - If not found / expired → error state
   - If found → render `ValidationResponseForm` client component

4. **`src/components/validation/ValidationResponseForm.tsx`** — Client component:
   - Deployment summary display (readonly)
   - Confirm / Decline radio or button group
   - Comments textarea
   - Attestation checkbox with legal text
   - Submit handler → calls `submitValidationResponse` server action
   - Success state after submission

## Design System

- Use existing Tailwind utilities + CSS variables (`--gs-navy`, `--gs-gold`, `--gs-silver`)
- Public validation form should feel professional and trustworthy — this is the first thing an external person sees from Grey Sky
- Navy header bar with Grey Sky logo on the public form
- Mobile-responsive — validators may open the link on their phone
- No authentication barriers — the token IS the authorization

## Error States (Public-Side)

| Scenario | Message |
|----------|---------|
| Token not found | "This validation link is not valid." |
| Token expired | "This validation link has expired. The requesting member can send a new request." |
| Already responded | "This validation has already been submitted. Thank you." |
| Server error | "Something went wrong. Please try again or contact support." |

## Acceptance Criteria

1. `/validate/[token]` loads deployment details for valid, pending, non-expired tokens
2. Validator can confirm or decline with optional comments
3. Attestation checkbox is required before submission
4. After submission, request status updates to confirmed or denied
5. Expired tokens show a clear error message
6. Already-used tokens show "already submitted" message
7. Mobile responsive
8. All server actions have error handling
9. Zod validation on all form inputs
10. No direct table access — token operations only via SECURITY DEFINER functions

## Companion Doc

- **GSR-DOC-400-VALIDATION-REQUEST.md** — the member-side request flow that creates the token this form consumes.

## Build Prompt

See `docs/prompts/GSR-DOC-400-PROMPT.md`. The prompt covers DOC-400 and DOC-401 (this doc) — Claude Code may execute both features in a single session.
