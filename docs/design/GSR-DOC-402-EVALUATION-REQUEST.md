---
doc_id: GSR-DOC-402
title: "Evaluation Request — Send + Track"
phase: 4
status: approved
blocks_on:
  - GSR-DOC-203
  - GSR-DOC-205
priority: critical
author: Roy E. Dunn
created: 2026-04-15
updated: 2026-04-24
notes: Split from GSR-DOC-402-403-EVALUATION.md on 2026-04-24 per NAMING-CONVENTIONS.md "one doc per buildable unit" rule. Companion is GSR-DOC-403-EVALUATION-RESPONSE.md (the public form evaluators see). Build after GSR-DOC-400/401 (Validation) — patterns are identical, evaluation adds the rating UI.
---

# GSR-DOC-402: Evaluation Request — Send + Track

| Field | Value |
|-------|-------|
| Phase | 4 |
| Status | approved |
| Blocks on | GSR-DOC-203 ✅, GSR-DOC-205 ✅ |
| Priority | critical |

## Purpose

The ICS-225 Evaluation is the performance assessment layer. Where validation answers "Were you there?", evaluation answers "How did you perform?" A member asks a supervisor, team lead, or qualified peer to rate their performance across five core competency areas drawn from the ICS-225 (Incident Personnel Performance Rating) framework.

Evaluations are the performance record that supports higher-tier credentialing. The Qualification Review Board (QRB) uses evaluation data when deciding whether to issue or renew credentials. Strong evaluations across multiple deployments demonstrate sustained competence; weak or missing evaluations create gaps that need to be addressed.

This doc covers the **member-side request flow**. The public response form (where the evaluator submits ratings) is GSR-DOC-403.

This is not a pass/fail. It is a 1–5 rating across five dimensions with narrative commentary. Even a "3" (Satisfactory) is a valid and useful data point.

## User Journey — Member Requests an Evaluation

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

### RLS Policies (member-side)

Active policies after the 2026-04-15 security patch:
- `evaluation_select_own` — member sees their own requests
- `evaluation_select_admin` — platform admin sees all
- `evaluation_insert_own` — member creates their own requests

Token-based external access goes through SECURITY DEFINER functions only — see GSR-DOC-403.

## Files to Create / Modify (Member-Side)

### New Files

1. **`src/lib/evaluation/actions.ts`** — Server actions (member-side subset):
   - `requestEvaluation(deploymentRecordId, evaluatorEmail, evaluatorName, evaluatorRole?)`
     - Auth check, membership check, duplicate check, coin spend (15 coins)
     - Insert evaluation_requests row
     - Return `{ success: true, token }` or `{ error: string }`
   - `getDeploymentEvaluations(deploymentRecordId)` — fetches all evaluation requests for a deployment

2. **`src/lib/evaluation/schemas.ts`** — Zod schemas (member-side subset):
   - `requestEvaluationSchema` — email, name, optional role

3. **`src/components/evaluation/RequestEvaluationModal.tsx`** — Client component:
   - Email input, name input, optional role/relationship textarea
   - Coin cost display ("This will cost 15 Sky Coins")
   - Submit → calls `requestEvaluation` server action

4. **`src/components/evaluation/EvaluationStatusBadge.tsx`** — Status component:
   - Pending (yellow), completed (green), denied (red), expired (gray)

5. **`src/components/evaluation/EvaluationRatingDisplay.tsx`** — Read-only display:
   - Shows 5 ratings as visual bars or stars
   - Overall rating prominently displayed
   - Used on deployment record detail page

### Modified Files

6. **`src/components/dashboard/records/RecordDetail.tsx`** — Add:
   - "Request Evaluation" button (opens modal)
   - Evaluation history section showing all evaluations for this deployment
   - Rating display for completed evaluations

## Error States (Member-Side)

| Scenario | Message |
|----------|---------|
| Insufficient coins | "You need 15 Sky Coins to request an evaluation. [Link to earn/purchase coins]" |
| No active membership | "An active membership is required to request evaluations. [Link to membership page]" |
| Duplicate pending request | "An evaluation request to this email for this deployment is already pending." |
| Server error | "Something went wrong. Please try again or contact support." |

## Acceptance Criteria

1. Member can request an evaluation from a deployment record detail page
2. 15 Sky Coins are deducted on request
3. Evaluation request appears as "Pending" on the deployment record
4. Duplicate requests to the same email for the same deployment are blocked
5. Members without active membership cannot request evaluations
6. Members with insufficient coins cannot request evaluations
7. Completed evaluations show ratings on deployment record detail
8. All server actions have error handling
9. Zod validation on all form inputs

## Companion Doc

- **GSR-DOC-403-EVALUATION-RESPONSE.md** — the public `/evaluate/[token]` form the evaluator sees and submits.

## Build Prompt

This pattern is nearly identical to GSR-DOC-400. Build after the validation flow ships, then mirror the structure — the evaluation form adds the 5-area rating UI on top.
