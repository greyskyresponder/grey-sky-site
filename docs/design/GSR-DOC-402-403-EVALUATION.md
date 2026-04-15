# GSR-DOC-402 + 403: Evaluation Request & Response

| Field | Value |
|-------|-------|
| Phase | 4 |
| Status | approved |
| Blocks on | GSR-DOC-203 ✅, GSR-DOC-205 ✅ |
| Priority | critical |

## Purpose

The ICS-225 Evaluation is the performance assessment layer. Where validation answers "Were you there?", evaluation answers "How did you perform?" A member asks a supervisor, team lead, or qualified peer to rate their performance across five core competency areas drawn from the ICS-225 (Incident Personnel Performance Rating) framework.

Evaluations are the performance record that supports higher-tier credentialing. The Qualification Review Board (QRB) uses evaluation data when deciding whether to issue or renew credentials. Strong evaluations across multiple deployments demonstrate sustained competence; weak or missing evaluations create gaps that need to be addressed.

This is not a pass/fail. It is a 1–5 rating across five dimensions with narrative commentary. Even a "3" (Satisfactory) is a valid and useful data point.

## User Journey

### DOC-402: Member Requests an Evaluation

1. Member navigates to a **deployment record detail page** in their dashboard
2. Clicks **"Request Evaluation"** button
3. Modal/form appears:
   - **Evaluator email** (required) — the person they're asking to evaluate them
   - **Evaluator name** (required) — display name
   - **Evaluator role/relationship** (optional, textarea) — "Division Supervisor, Operations Section"
4. System checks:
   - Member has a valid membership (`membership_status = 'active'`)
   - Member has sufficient Sky Coins balance (15 coins per seed data; verify against `coin_products` table)
   - No existing pending evaluation from the same email for the same deployment
5. System executes:
   - `spendCoins(userId, 'evaluation_request', deploymentRecordId, 'deployment_record', description)` — deducts coins
   - `INSERT INTO evaluation_requests` with token + 30-day expiration
   - [Future] Sends transactional email to evaluator with link: `https://greysky.dev/evaluate/{token}`
   - [MVP] Console logs the token URL for testing
6. Dashboard shows the evaluation request as **Pending** on the deployment record detail

### DOC-403: Evaluator Responds (Public Form)

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

### Existing Tables (NO schema changes required)

**`evaluation_requests`** — already in `20260409000003_core_tables.sql`:
```sql
CREATE TABLE evaluation_requests (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deployment_record_id  UUID NOT NULL REFERENCES deployment_records(id) ON DELETE CASCADE,
  requestor_id          UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  evaluator_email       TEXT NOT NULL,
  evaluator_name        TEXT,
  evaluator_user_id     UUID REFERENCES users(id) ON DELETE SET NULL,
  status                evaluation_request_status_enum NOT NULL DEFAULT 'pending',
  rating_leadership     INTEGER CHECK (rating_leadership BETWEEN 1 AND 5),
  rating_tactical       INTEGER CHECK (rating_tactical BETWEEN 1 AND 5),
  rating_communication  INTEGER CHECK (rating_communication BETWEEN 1 AND 5),
  rating_planning       INTEGER CHECK (rating_planning BETWEEN 1 AND 5),
  rating_technical      INTEGER CHECK (rating_technical BETWEEN 1 AND 5),
  overall_rating        NUMERIC(3,2),
  commentary            TEXT,
  attestation_text      TEXT,
  attestation_accepted  BOOLEAN,
  responded_at          TIMESTAMPTZ,
  token                 UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),
  expires_at            TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '30 days'),
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

**Enum:** `evaluation_request_status_enum` = `pending | completed | denied | expired`

**Coin product:** `evaluation_request` — cost: 15, recipient earns: 10, category: `network`

### Existing Functions (NO new migrations required)

**`get_evaluation_by_token(p_token UUID)`** — in `20260415000002_security_patch.sql`:
- SECURITY DEFINER, returns pending + non-expired request
- Granted to `anon` and `authenticated`

**`submit_evaluation_response(p_token, p_status, p_rating_leadership, p_rating_tactical, p_rating_communication, p_rating_planning, p_rating_technical, p_overall_rating, p_commentary, p_attestation_accepted)`** — same migration:
- SECURITY DEFINER, validates status is `completed` or `denied`
- If `completed`: validates all 5 ratings are 1–5
- Locks row with `FOR UPDATE`, checks pending + non-expired
- Updates all fields + `responded_at = now()`

### RLS Policies

**Active policies (after security patch):**
- `evaluation_select_own` — member sees their own requests
- `evaluation_select_admin` — platform admin sees all
- `evaluation_insert_own` — member creates their own requests
- Direct anon access revoked — token access only through SECURITY DEFINER functions

## Files to Create / Modify

### New Files

1. **`src/lib/evaluation/actions.ts`** — Server actions:
   - `requestEvaluation(deploymentRecordId: string, evaluatorEmail: string, evaluatorName: string, evaluatorRole?: string)`
     - Auth check, membership check, duplicate check, coin spend (15 coins)
     - Insert evaluation_requests row
     - Return `{ success: true, token }` or `{ error: string }`
   - `getEvaluationByToken(token: string)` — calls `supabase.rpc('get_evaluation_by_token', { p_token: token })`
   - `submitEvaluationResponse(token: string, data: EvaluationSubmission)` — computes `overall_rating` as average, calls `supabase.rpc('submit_evaluation_response', {...})`
   - `getDeploymentEvaluations(deploymentRecordId: string)` — fetches all evaluation requests for a deployment

2. **`src/lib/evaluation/schemas.ts`** — Zod schemas:
   - `requestEvaluationSchema` — email, name, optional role
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

5. **`src/components/evaluation/RequestEvaluationModal.tsx`** — Client component:
   - Email input, name input, optional role/relationship textarea
   - Coin cost display ("This will cost 15 Sky Coins")
   - Submit → calls `requestEvaluation` server action

6. **`src/components/evaluation/EvaluationStatusBadge.tsx`** — Status component:
   - Pending (yellow), completed (green), denied (red), expired (gray)

7. **`src/components/evaluation/EvaluationRatingDisplay.tsx`** — Read-only display:
   - Shows 5 ratings as visual bars or stars
   - Overall rating prominently displayed
   - Used on deployment record detail page

### Modified Files

8. **`src/components/dashboard/records/RecordDetail.tsx`** — Add:
   - "Request Evaluation" button (opens modal)
   - Evaluation history section showing all evaluations for this deployment
   - Rating display for completed evaluations
   - Import evaluation components

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

## Error States

| Scenario | Message |
|----------|---------|
| Token not found | "This evaluation link is not valid." |
| Token expired | "This evaluation link has expired. The requesting member can send a new request." |
| Already responded | "This evaluation has already been submitted. Thank you." |
| Insufficient coins | "You need 15 Sky Coins to request an evaluation. [Link to earn/purchase coins]" |
| No active membership | "An active membership is required to request evaluations. [Link to membership page]" |
| Duplicate pending request | "An evaluation request to this email for this deployment is already pending." |
| Invalid ratings | "All five performance areas must be rated between 1 and 5." |
| Server error | "Something went wrong. Please try again or contact support." |

## Acceptance Criteria

1. Member can request an evaluation from a deployment record detail page
2. 15 Sky Coins are deducted on request
3. Evaluation request appears as "Pending" on the deployment record
4. `/evaluate/[token]` loads deployment details for valid, pending, non-expired tokens
5. Evaluator can rate all five performance areas (1–5)
6. Evaluator can add narrative commentary
7. Evaluator can decline if unable to evaluate
8. Attestation checkbox is required for completion (not for decline)
9. Overall rating is computed as average of 5 ratings
10. After submission, request status updates to completed or denied
11. Completed evaluations show ratings on deployment record detail
12. Rating UI is accessible and mobile-responsive
13. All server actions have error handling
14. Zod validation on all form inputs (especially rating bounds)
15. Rating scale labels visible to the evaluator

## Claude Code Prompt

Build the evaluation request and response flow (GSR-DOC-402 + DOC-403).

**Tier: Full**

The database schema, SECURITY DEFINER functions, and RLS policies already exist — do NOT create migrations. Build only the application layer:

1. Create `src/lib/evaluation/actions.ts` with four server actions: `requestEvaluation`, `getEvaluationByToken`, `submitEvaluationResponse`, `getDeploymentEvaluations`
2. Create `src/lib/evaluation/schemas.ts` with Zod validation schemas (especially rating bounds 1–5)
3. Replace the stub at `src/app/evaluate/[token]/page.tsx` with the full public evaluation response form
4. Create `src/components/evaluation/EvaluationResponseForm.tsx` (client component — 5 ratings, commentary, attestation, decline option)
5. Create `src/components/evaluation/RequestEvaluationModal.tsx` (client component — email, name, role, coin cost)
6. Create `src/components/evaluation/EvaluationStatusBadge.tsx` (status indicator)
7. Create `src/components/evaluation/EvaluationRatingDisplay.tsx` (read-only rating visualization)
8. Modify `src/components/dashboard/records/RecordDetail.tsx` to add "Request Evaluation" button and evaluation history with rating display

**This should be built AFTER DOC-400+401 (Validation) is complete.** The patterns will be nearly identical — the evaluation adds the rating UI layer on top.

**Key patterns to follow:**
- Same as DOC-400+401 validation build (use those files as templates)
- Coin spend: `spendCoins(userId, 'evaluation_request', deploymentRecordId, 'deployment_record', description)`
- Token lookup: `supabase.rpc('get_evaluation_by_token', { p_token: token })`
- Token submit: `supabase.rpc('submit_evaluation_response', { p_token, p_status, p_rating_leadership, p_rating_tactical, p_rating_communication, p_rating_planning, p_rating_technical, p_overall_rating, p_commentary, p_attestation_accepted })`
- Compute overall_rating client-side: `(leadership + tactical + communication + planning + technical) / 5` rounded to 2 decimal places

**Rating UI guidance:**
- Segmented buttons (1–5) per area with color coding
- Large enough for mobile tap targets
- Include rating scale legend on the form
- Read-only display uses bars, dots, or similar visual

**Important:**
- Public form requires NO authentication — token is authorization
- Professional look — evaluators may be senior officials seeing Grey Sky for the first time
- All 5 ratings required for completion; decline path skips ratings
- Follow `CLAUDE-CODE-DISCIPLINE.md` — self-review gate mandatory

Refer to this design doc for data model, user flows, error states, and acceptance criteria.
