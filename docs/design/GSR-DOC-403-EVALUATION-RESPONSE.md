---
doc_id: GSR-DOC-403
title: "Evaluation Response — External Public Form"
phase: 4
status: approved
blocks_on:
  - GSR-DOC-402
priority: critical
author: Roy E. Dunn
created: 2026-04-15
updated: 2026-04-24
notes: Split from GSR-DOC-402-403-EVALUATION.md on 2026-04-24 per NAMING-CONVENTIONS.md "one doc per buildable unit" rule. Companion is GSR-DOC-402-EVALUATION-REQUEST.md (the member-side request flow).
---

# GSR-DOC-403: Evaluation Response — External Public Form

| Field | Value |
|-------|-------|
| Phase | 4 |
| Status | approved |
| Blocks on | GSR-DOC-402 |
| Priority | critical |

## Purpose

This doc covers the **public-facing evaluation response form** seen by the evaluator. It is the external surface of the ICS-225 performance evaluation workflow.

The token IS the authorization. No authentication is required. The evaluator clicks a link, sees the deployment summary, rates five performance areas, adds optional commentary, attests, and submits. Like the validation form (GSR-DOC-401), this surface must be credible to senior officials seeing Grey Sky for the first time.

The member-side request flow is GSR-DOC-402.

## User Journey — Evaluator Responds (Public Form)

1. Evaluator clicks the link in their email
2. Arrives at `/evaluate/[token]` — **no authentication required**
3. Page calls `get_evaluation_by_token(token)` via Supabase RPC
4. **If token is invalid, expired, or already used:** Show clean error message
5. **If token is valid:** Display:

   **Header:** "ICS-225 Performance Evaluation"

   **Deployment Summary** (read-only, sanitized):
   - Member name (first + last)
   - Incident name
   - Position/role title
   - Dates of deployment (start → end)
   - Agency/organization

   **Performance Ratings** — five areas, each rated 1–5:

   | Area | Description | Rating |
   |------|-------------|--------|
   | **Leadership** | Ability to lead, motivate, and manage personnel | 1–5 slider/select |
   | **Tactical** | Technical proficiency in assigned role and ICS functions | 1–5 slider/select |
   | **Communication** | Clear, timely, and effective communication up/down/lateral | 1–5 slider/select |
   | **Planning** | Ability to anticipate needs, plan operations, and adapt | 1–5 slider/select |
   | **Technical** | Subject matter expertise and application of specialized skills | 1–5 slider/select |

   **Rating Scale:**
   - 5 = Outstanding — Significantly exceeds expectations
   - 4 = Superior — Exceeds expectations
   - 3 = Satisfactory — Meets expectations
   - 2 = Needs Improvement — Below expectations in some areas
   - 1 = Unsatisfactory — Does not meet minimum expectations

   **Commentary** (textarea, recommended): Narrative assessment, strengths, areas for growth, specific examples

   **Legal Attestation** (required checkbox):
   > "I attest that this evaluation reflects my honest professional assessment based on direct observation during the deployment described above. I understand that this evaluation may be used in professional credentialing processes."

   **Submit button** — disabled until all 5 ratings selected + attestation checked

   **Option to Decline:**
   - "I am unable to evaluate this person" button/link
   - Optional reason textarea
   - Submits with status = `denied`

6. On submit:
   - If completing: calls `submit_evaluation_response(token, 'completed', ratings×5, overall, commentary, attestation)` — overall_rating computed as average of 5 ratings
   - If declining: calls `submit_evaluation_response(token, 'denied', nulls, null, commentary, false)`
7. **Success page:** "Thank you. Your evaluation has been recorded."
8. Member's deployment record detail updates to show evaluation status + ratings (if completed)
9. [Future] Member receives notification
10. [Future] If completed, evaluator earns 10 Sky Coins (if they have an account)

## Data Entities

### Existing Tables and Functions (NO migrations required)

**`evaluation_requests`** — schema in GSR-DOC-402.

**`get_evaluation_by_token(p_token UUID)`** — in `20260415000002_security_patch.sql`:
- SECURITY DEFINER, returns pending + non-expired request
- Granted to `anon` and `authenticated`

**`submit_evaluation_response(p_token, p_status, p_rating_leadership, p_rating_tactical, p_rating_communication, p_rating_planning, p_rating_technical, p_overall_rating, p_commentary, p_attestation_accepted)`** — same migration:
- SECURITY DEFINER, validates status is `completed` or `denied`
- If `completed`: validates all 5 ratings are 1–5
- Locks row with `FOR UPDATE`, checks pending + non-expired
- Updates all fields + `responded_at = now()`

### RLS Posture for Token Access

Same as DOC-401: direct anon access revoked; token operations only via SECURITY DEFINER functions.

## Files to Create / Modify (Public-Side)

### New Files

1. **`src/lib/evaluation/actions.ts`** — Server actions (response-side subset):
   - `getEvaluationByToken(token)` — calls `supabase.rpc('get_evaluation_by_token', { p_token: token })`
   - `submitEvaluationResponse(token, data)` — computes `overall_rating` as average, calls `supabase.rpc('submit_evaluation_response', {...})`

2. **`src/lib/evaluation/schemas.ts`** — Zod schemas (response-side subset):
   - `submitEvaluationSchema` — status enum, 5 ratings (each 1–5), optional commentary, attestation boolean
   - `ratingSchema` — `z.number().int().min(1).max(5)`

3. **`src/app/evaluate/[token]/page.tsx`** — Replace stub. Public form:
   - Server component that calls `getEvaluationByToken(token)`
   - If not found / expired → error state
   - If found → render `EvaluationResponseForm` client component

4. **`src/components/evaluation/EvaluationResponseForm.tsx`** — Client component:
   - Deployment summary display
   - 5 rating inputs (slider or segmented control, 1–5 with labels)
   - Rating scale legend
   - Commentary textarea
   - Attestation checkbox
   - Submit (complete) and Decline paths
   - Success state after submission

## Rating UI Design

The rating input should be:
- **Clear:** Each area has its name, a one-line description, and a 1–5 selector
- **Visual:** Consider segmented buttons (1 | 2 | 3 | 4 | 5) with color coding:
  - 1 = red, 2 = orange, 3 = yellow, 4 = light green, 5 = green
- **Accessible:** Keyboard navigable, ARIA labels for screen readers
- **Mobile-friendly:** Large enough tap targets on mobile

The rating display (read-only, on dashboard) should be:
- Horizontal bar or filled circles for each area
- Overall rating shown as large number with label
- Commentary shown if present

## Error States (Public-Side)

| Scenario | Message |
|----------|---------|
| Token not found | "This evaluation link is not valid." |
| Token expired | "This evaluation link has expired. The requesting member can send a new request." |
| Already responded | "This evaluation has already been submitted. Thank you." |
| Invalid ratings | "All five performance areas must be rated between 1 and 5." |
| Server error | "Something went wrong. Please try again or contact support." |

## Acceptance Criteria

1. `/evaluate/[token]` loads deployment details for valid, pending, non-expired tokens
2. Evaluator can rate all five performance areas (1–5)
3. Evaluator can add narrative commentary
4. Evaluator can decline if unable to evaluate
5. Attestation checkbox is required for completion (not for decline)
6. Overall rating is computed as average of 5 ratings
7. After submission, request status updates to completed or denied
8. Rating UI is accessible and mobile-responsive
9. All server actions have error handling
10. Zod validation on all form inputs (especially rating bounds)
11. Rating scale labels visible to the evaluator
12. No direct table access — token operations only via SECURITY DEFINER functions

## Companion Doc

- **GSR-DOC-402-EVALUATION-REQUEST.md** — the member-side request flow that creates the token this form consumes.
