# GSR-DOC-400 + 401: Validation Request & Response

| Field | Value |
|-------|-------|
| Phase | 4 |
| Status | approved |
| Blocks on | GSR-DOC-203 ✅, GSR-DOC-205 ✅ |
| Priority | critical |

## Purpose

The 360 Validation is the trust mechanism that transforms a self-reported deployment record into a peer-verified record. A member asks a colleague who was there — someone who can personally attest that the member served in the role they claimed, at the incident they described, for the duration they reported.

This is not a performance evaluation. It is a factual attestation: "Were you there? Did you see this person doing this job?" The answer is yes or no, with optional context.

Validation is foundational to the credentialing pathway. Without peer-verified records, the system has no basis for issuing credentials. Everything above Tier 2 in the platform depends on this.

## User Journey

### DOC-400: Member Requests a Validation

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

### DOC-401: Validator Responds (Public Form)

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

### Existing Functions (NO new migrations required)

**`get_validation_by_token(p_token UUID)`** — in `20260415000002_security_patch.sql`:
- SECURITY DEFINER, returns pending + non-expired request
- Granted to `anon` and `authenticated`

**`submit_validation_response(p_token, p_status, p_response_text, p_attestation_accepted)`** — same migration:
- SECURITY DEFINER, validates status is `confirmed` or `denied`
- Locks row with `FOR UPDATE`, checks pending + non-expired
- Updates status, response_text, attestation_text, attestation_accepted, responded_at

### RLS Policies

**Original (in `20260409000008_rls_policies.sql`):**
- `validation_select_own` — member sees their own requests
- `validation_select_admin` — platform admin sees all
- `validation_insert_own` — member creates their own requests
- `validation_select_by_token` — `USING (true)` [SUPERSEDED by security patch]
- `validation_update_by_token` — `USING (true) WITH CHECK (status = 'pending')` [SUPERSEDED]

**Security patch (in `20260415000002_security_patch.sql`):**
- Dropped `validation_select_by_token` and `validation_update_by_token`
- Revoked direct `anon` access to table
- All token-based access now goes through SECURITY DEFINER functions only

## Files to Create / Modify

### New Files

1. **`src/lib/validation/actions.ts`** — Server actions:
   - `requestValidation(deploymentRecordId: string, validatorEmail: string, validatorName: string, relationshipContext?: string)`
     - Auth check: `getUser()` → redirect if not logged in
     - Membership check: user.membership_status === 'active'
     - Duplicate check: no pending request from same email for same deployment
     - Coin spend: `spendCoins(userId, 'validation_request', deploymentRecordId, 'deployment_record', desc)`
     - Insert: `supabase.from('validation_requests').insert({...})`
     - Return: `{ success: true, token }` or `{ error: string }`
   - `getValidationByToken(token: string)` — calls `supabase.rpc('get_validation_by_token', { p_token: token })`
   - `submitValidationResponse(token: string, status: 'confirmed' | 'denied', responseText?: string, attestationAccepted: boolean)` — calls `supabase.rpc('submit_validation_response', {...})`
   - `getDeploymentValidations(deploymentRecordId: string)` — fetches all validation requests for a deployment (for status display)

2. **`src/lib/validation/schemas.ts`** — Zod schemas:
   - `requestValidationSchema` — email, name, optional relationship context
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

5. **`src/components/validation/RequestValidationModal.tsx`** — Client component:
   - Triggered from deployment record detail page
   - Email input, name input, optional context textarea
   - Coin cost display ("This will cost 10 Sky Coins")
   - Submit → calls `requestValidation` server action
   - Success / error handling

6. **`src/components/validation/ValidationStatusBadge.tsx`** — Small status component:
   - Shows pending (yellow), confirmed (green), denied (red), expired (gray)
   - Used on deployment record detail page

### Modified Files

7. **`src/components/dashboard/records/RecordDetail.tsx`** — Add:
   - "Request Validation" button (opens modal)
   - Validation history section showing all requests for this deployment
   - Import `RequestValidationModal` and `ValidationStatusBadge`

## Design System

- Use existing Tailwind utilities + CSS variables (`--gs-navy`, `--gs-gold`, `--gs-silver`)
- Public validation form should feel professional and trustworthy — this is the first thing an external person sees from Grey Sky
- Navy header bar with Grey Sky logo on the public form
- Mobile-responsive — validators may open the link on their phone
- No authentication barriers — the token IS the authorization

## Error States

| Scenario | Message |
|----------|---------|
| Token not found | "This validation link is not valid." |
| Token expired | "This validation link has expired. The requesting member can send a new request." |
| Already responded | "This validation has already been submitted. Thank you." |
| Insufficient coins | "You need 10 Sky Coins to request a validation. [Link to earn/purchase coins]" |
| No active membership | "An active membership is required to request validations. [Link to membership page]" |
| Duplicate pending request | "A validation request to this email for this deployment is already pending." |
| Server error | "Something went wrong. Please try again or contact support." |

## Acceptance Criteria

1. Member can request a validation from a deployment record detail page
2. 10 Sky Coins are deducted on request
3. Validation request appears as "Pending" on the deployment record
4. `/validate/[token]` loads deployment details for valid, pending, non-expired tokens
5. Validator can confirm or decline with optional comments
6. Attestation checkbox is required before submission
7. After submission, request status updates to confirmed or denied
8. Expired tokens show a clear error message
9. Already-used tokens show "already submitted" message
10. Mobile responsive
11. All server actions have error handling
12. Zod validation on all form inputs

## Claude Code Prompt

Build the validation request and response flow (GSR-DOC-400 + DOC-401).

**Tier: Full**

The database schema, SECURITY DEFINER functions, and RLS policies already exist — do NOT create migrations. Build only the application layer:

1. Create `src/lib/validation/actions.ts` with four server actions: `requestValidation`, `getValidationByToken`, `submitValidationResponse`, `getDeploymentValidations`
2. Create `src/lib/validation/schemas.ts` with Zod validation schemas
3. Replace the stub at `src/app/validate/[token]/page.tsx` with the full public validation response form
4. Create `src/components/validation/ValidationResponseForm.tsx` (client component — confirm/decline, comments, attestation)
5. Create `src/components/validation/RequestValidationModal.tsx` (client component — email, name, context, coin cost display)
6. Create `src/components/validation/ValidationStatusBadge.tsx` (status indicator)
7. Modify `src/components/dashboard/records/RecordDetail.tsx` to add "Request Validation" button and validation history section

**Key patterns to follow:**
- Server actions: `src/lib/stripe/actions.ts` and `src/lib/coins/actions.ts`
- Form pattern: `src/components/dashboard/records/RecordForm.tsx`
- Coin spend: `spendCoins(userId, 'validation_request', deploymentRecordId, 'deployment_record', description)`
- Token lookup: `supabase.rpc('get_validation_by_token', { p_token: token })`
- Token submit: `supabase.rpc('submit_validation_response', { p_token, p_status, p_response_text, p_attestation_accepted })`
- Auth guard: `const session = await getUser(); if (!session) redirect('/login');`

**Important:**
- The public form at `/validate/[token]` requires NO authentication — the token is the authorization
- The form must feel professional — external validators seeing Grey Sky for the first time
- Use design tokens: `--gs-navy`, `--gs-gold`, `--gs-silver`
- Mobile-responsive required
- Add `// TODO: test` comments on all server actions at minimum
- Follow `CLAUDE-CODE-DISCIPLINE.md` — self-review gate mandatory

Refer to this design doc for data model, user flows, error states, and acceptance criteria.
