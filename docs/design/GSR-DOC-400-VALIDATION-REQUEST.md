---
doc_id: GSR-DOC-400
title: "Validation Request — Send + Track"
phase: 4
status: approved
blocks_on:
  - GSR-DOC-203
  - GSR-DOC-205
priority: critical
author: Roy E. Dunn
created: 2026-04-15
updated: 2026-04-24
notes: Split from GSR-DOC-400-401-VALIDATION.md on 2026-04-24 per NAMING-CONVENTIONS.md "one doc per buildable unit" rule. Companion is GSR-DOC-401-VALIDATION-RESPONSE.md (the public form validators see). Combined Claude Code build prompt at docs/prompts/GSR-DOC-400-PROMPT.md.
---

# GSR-DOC-400: Validation Request — Send + Track

| Field | Value |
|-------|-------|
| Phase | 4 |
| Status | approved |
| Blocks on | GSR-DOC-203 ✅, GSR-DOC-205 ✅ |
| Priority | critical |

## Purpose

The 360 Validation is the trust mechanism that transforms a self-reported deployment record into a peer-verified record. A member asks a colleague who was there — someone who can personally attest that the member served in the role they claimed, at the incident they described, for the duration they reported.

This is not a performance evaluation. It is a factual attestation: "Were you there? Did you see this person doing this job?" The answer is yes or no, with optional context.

This doc covers the **member-side request flow** — the dashboard interaction where a member sends a validation request to a colleague. The **public response form** seen by the validator is GSR-DOC-401.

Validation is foundational to the credentialing pathway. Without peer-verified records, the system has no basis for issuing credentials. Everything above Tier 2 in the platform depends on this.

## User Journey — Member Requests a Validation

1. Member navigates to a **deployment record detail page** in their dashboard
2. Clicks **"Request Validation"** button
3. Modal/form appears:
   - **Validator email** (required) — the person they're asking to attest
   - **Validator name** (required) — display name for the request
   - **Relationship context** (optional, textarea) — "We served together at Helene as Section Chiefs"
4. System checks:
   - Member has a valid membership (`membership_status = 'active'`)
   - Member has sufficient Sky Coins balance (10 coins)
   - No existing pending validation from the same email for the same deployment
5. System executes:
   - `spendCoins(userId, 'validation_request', deploymentRecordId, 'deployment_record', description)` — deducts 10 coins
   - `INSERT INTO validation_requests` with token + 30-day expiration
   - [Future] Sends transactional email to validator with link: `https://greysky.dev/validate/{token}`
   - [MVP] Console logs the token URL for testing
6. Dashboard shows the validation request as **Pending** on the deployment record detail

## Data Entities

### Existing Tables (NO schema changes required)

**`validation_requests`** — already in `20260409000003_core_tables.sql`:
```sql
CREATE TABLE validation_requests (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deployment_record_id  UUID NOT NULL REFERENCES deployment_records(id) ON DELETE CASCADE,
  requestor_id          UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  validator_email       TEXT NOT NULL,
  validator_name        TEXT,
  validator_user_id     UUID REFERENCES users(id) ON DELETE SET NULL,
  status                validation_request_status_enum NOT NULL DEFAULT 'pending',
  response_text         TEXT,
  attestation_text      TEXT,
  attestation_accepted  BOOLEAN,
  responded_at          TIMESTAMPTZ,
  token                 UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),
  expires_at            TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '30 days'),
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

**Enum:** `validation_request_status_enum` = `pending | confirmed | denied | expired`

**Coin product:** `validation_request` — cost: 10, recipient earns: 5, category: `network`

### RLS Policies (member-side)

Active policies after the 2026-04-15 security patch:
- `validation_select_own` — member sees their own requests
- `validation_select_admin` — platform admin sees all
- `validation_insert_own` — member creates their own requests

Token-based external access is handled via SECURITY DEFINER functions only — see GSR-DOC-401.

## Files to Create / Modify (Member-Side)

### New Files

1. **`src/lib/validation/actions.ts`** — Server actions (member-side subset):
   - `requestValidation(deploymentRecordId, validatorEmail, validatorName, relationshipContext?)`
     - Auth check: `getUser()` → redirect if not logged in
     - Membership check: user.membership_status === 'active'
     - Duplicate check: no pending request from same email for same deployment
     - Coin spend: `spendCoins(userId, 'validation_request', deploymentRecordId, 'deployment_record', desc)`
     - Insert: `supabase.from('validation_requests').insert({...})`
     - Return: `{ success: true, token }` or `{ error: string }`
   - `getDeploymentValidations(deploymentRecordId)` — fetches all validation requests for a deployment (for status display)

2. **`src/lib/validation/schemas.ts`** — Zod schemas (member-side subset):
   - `requestValidationSchema` — email, name, optional relationship context

3. **`src/components/validation/RequestValidationModal.tsx`** — Client component:
   - Triggered from deployment record detail page
   - Email input, name input, optional context textarea
   - Coin cost display ("This will cost 10 Sky Coins")
   - Submit → calls `requestValidation` server action
   - Success / error handling

4. **`src/components/validation/ValidationStatusBadge.tsx`** — Small status component:
   - Shows pending (yellow), confirmed (green), denied (red), expired (gray)
   - Used on deployment record detail page

### Modified Files

5. **`src/components/dashboard/records/RecordDetail.tsx`** — Add:
   - "Request Validation" button (opens modal)
   - Validation history section showing all requests for this deployment
   - Import `RequestValidationModal` and `ValidationStatusBadge`

## Error States (Member-Side)

| Scenario | Message |
|----------|---------|
| Insufficient coins | "You need 10 Sky Coins to request a validation. [Link to earn/purchase coins]" |
| No active membership | "An active membership is required to request validations. [Link to membership page]" |
| Duplicate pending request | "A validation request to this email for this deployment is already pending." |
| Server error | "Something went wrong. Please try again or contact support." |

## Acceptance Criteria

1. Member can request a validation from a deployment record detail page
2. 10 Sky Coins are deducted on request
3. Validation request appears as "Pending" on the deployment record
4. Duplicate requests to the same email for the same deployment are blocked
5. Members without active membership cannot request validations
6. Members with insufficient coins cannot request validations
7. All server actions have error handling
8. Zod validation on all form inputs

## Companion Doc

- **GSR-DOC-401-VALIDATION-RESPONSE.md** — the public `/validate/[token]` form the validator sees and submits.

## Build Prompt

See `docs/prompts/GSR-DOC-400-PROMPT.md`. The prompt covers DOC-400 (this doc) and DOC-401 — Claude Code may execute both features in a single session.
