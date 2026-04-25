# GSR-DOC-405 — Notification Service Build Prompt

> **Usage:** Self-contained Claude Code build prompt. Paste the entire block below or run via ATLAS dispatch.
> **Prerequisites:** Phase 0 foundation complete; DOC-400 / DOC-401 / DOC-402 / DOC-403 in place; `SENDGRID_API_KEY` provisioned in Azure SWA env (or `EMAIL_MODE=test` for local).
> **Design doc:** `docs/design/GSR-DOC-405-NOTIFICATION-SERVICE.md`
> **Discipline protocol:** `docs/agents/CLAUDE-CODE-DISCIPLINE.md` (mandatory — self-review gate before reporting done)

---

```
Read CLAUDE.md, then read docs/design/NAMING-CONVENTIONS.md, then read docs/design/GSR-DOC-405-NOTIFICATION-SERVICE.md in full. This session builds the transactional email notification service.

## Context

The trust layer is built but operationally blocked: validation and evaluation tokens are generated, public forms render at /validate/[token] and /evaluate/[token], the database accepts responses — but no email is delivered, so the link never reaches external recipients. Members are paying 10 / 15 Sky Coins for requests that produce no result. This build closes that loop.

Decisions captured in DOC-405 (do not reopen):
- Provider: SendGrid (via @sendgrid/mail), provider-abstracted so we can swap later
- Templates: React Email (@react-email/components)
- Sender: noreply@greysky.dev (Display name: "Grey Sky Responder")
- Reply path: replies bounce; body-level support contact is support@longviewsolutionsgroup.com
- Scope: transactional only; no marketing/bulk
- Locale: en-US only

## Build Order

### Step 1: Database migrations

File: supabase/migrations/20260424000002_email_dispatches.sql
- Create enums: email_dispatch_entity_type_enum, email_dispatch_status_enum (values per DOC-405 schema section)
- Create table email_dispatches with all columns specified in DOC-405 § Data Entities
- Create indexes: status+next_retry_at (partial WHERE status IN queued/failed_retryable), related_entity, recipient+created_at DESC
- Create BEFORE INSERT trigger compute_email_dispatch_hash() that mirrors compute_audit_hash() pattern from existing 20260409000007_triggers.sql — concatenate canonical row content with hash of previous row (lookup by created_at DESC LIMIT 1) and SHA-256 hash the result
- Enable RLS
- Create policies email_dispatches_select_admin and email_dispatches_select_own per DOC-405 § RLS Policies
- No INSERT/UPDATE policies for clients

File: supabase/migrations/20260424000003_email_dispatches_security_definer.sql
- Create SECURITY DEFINER function enqueue_email_dispatch(p_template_key text, p_recipient_email text, p_recipient_name text, p_related_entity_type email_dispatch_entity_type_enum, p_related_entity_id uuid, p_payload jsonb, p_subject text, p_body_html text, p_body_text text) returns uuid
  - Idempotency check: if a row with same (template_key, related_entity_type, related_entity_id) exists in status IN ('queued','sending','sent','delivered'), return its id; do not insert
  - Else insert with status='queued', return new id
- Create SECURITY DEFINER function update_email_dispatch_status(p_id uuid, p_status email_dispatch_status_enum, p_provider_message_id text, p_last_error text, p_next_retry_at timestamptz) returns void
- Create SECURITY DEFINER function record_email_dispatch_event(p_provider_message_id text, p_event text, p_timestamp timestamptz) returns void  -- called by webhook
- REVOKE INSERT, UPDATE, DELETE on email_dispatches FROM authenticated, anon
- GRANT EXECUTE on the three functions to authenticated; record_email_dispatch_event also to service_role (webhook uses service role)

### Step 2: TypeScript types and Zod schemas

File: src/lib/types/email.ts
- Per DOC-405 § TypeScript Types section — paste those interfaces verbatim, then export

File: src/lib/email/schemas.ts
- Zod schemas for each EmailTemplateKey's payload. Examples:
  - validationRequestPayload: requestorName, validatorName, incidentName, positionTitle, deploymentStartDate, deploymentEndDate (nullable), tokenUrl
  - evaluationRequestPayload: requestorName, evaluatorName, incidentName, positionTitle, dates, tokenUrl
  - welcomePayload: firstName, dashboardUrl
  - passwordResetPayload: firstName, resetUrl, expiresInMinutes
  - membershipConfirmationPayload: firstName, expirationDate, receiptUrl
  - certificationIssuedPayload: firstName, certificationName, credentialUrl
- Export a single TemplatePayload union type derived from the schemas

### Step 3: Provider layer

File: src/lib/email/provider.ts
- Per DOC-405 § Provider Interface — interface EmailProvider, types ProviderMessage, ProviderResult
- Export a getProvider() factory that switches on env.EMAIL_MODE:
  - 'sendgrid' → src/lib/email/providers/sendgrid.ts
  - 'test' or 'disabled' or undefined → src/lib/email/providers/null-provider.ts

File: src/lib/email/providers/sendgrid.ts
- Implements EmailProvider
- Uses @sendgrid/mail (npm install)
- send(): builds SendGrid payload from ProviderMessage; passes customArgs as customArgs; categories as categories; reads from-address from env.EMAIL_FROM_ADDRESS / env.EMAIL_FROM_NAME
- Maps SendGrid response codes to ProviderResult: 202 → ok=true; 429 or 5xx → retryable=true; 4xx (other) → retryable=false
- On exception: retryable=true (network errors are transient by default)

File: src/lib/email/providers/null-provider.ts
- send(): returns { ok: true, providerMessageId: 'null:' + crypto.randomUUID(), retryable: false }
- Used for EMAIL_MODE=test/disabled and for vitest

### Step 4: Templates (React Email)

Install: @react-email/components, @react-email/render

File: src/lib/email/templates/components/EmailLayout.tsx
- Branded shell: Command Navy (#0A1628) header bar with "Grey Sky Responder" logotext, Signal Gold (#C5933A) horizontal rule, Inter font, Ops White (#F5F5F5) body background
- Footer: sender disclosure (Sent by Grey Sky Responder Society on behalf of Longview Solutions Group LLC), physical mailing address (placeholder for now: "Longview Solutions Group LLC, [address TBD]"), platform domain (greysky.dev), notification preferences link (placeholder href="https://greysky.dev/dashboard/settings/notifications")
- Accepts children + optional preheader text

File: src/lib/email/templates/components/Button.tsx
- Branded primary button (Command Navy fill, white text, 6px radius, 14px/20px padding)
- Accepts href and children

File: src/lib/email/templates/components/Heading.tsx, Body.tsx, Footer.tsx, Disclosure.tsx
- Reusable typographic components matching dashboard brand tokens

File: src/lib/email/templates/index.ts
- Export a registry: Record<EmailTemplateKey, (payload) => Promise<{ subject, html, text }>>
- Each entry: validates payload via Zod, renders via @react-email/render's render() to HTML, also produces a plaintext alternative via render() with plainText:true option, returns { subject, html, text }

For each template, follow this pattern (validation-request example):

File: src/lib/email/templates/validation-request.tsx
- Subject: `Validation requested for your service at ${incidentName}`
- Body opening: deployment summary (member name, position, incident, dates) in a clean facts-block
- Body middle: "${requestorName} is asking you to confirm that they served in this role during this incident. Your response will be recorded as part of their professional service history."
- CTA button: "Confirm this deployment" → href={tokenUrl}
- Fallback line: "If the button does not work, copy and paste this address into your browser:" + tokenUrl as plain text on the next line
- Closing: "This request expires in 30 days. Questions? Contact support@longviewsolutionsgroup.com."
- Disclosure block via shared component

Replicate for the other 9 templates per DOC-405 § Templates list. Subject lines and copy direction per DOC-405 § Copy Direction.

### Step 5: Dispatch layer

File: src/lib/email/dispatch.ts
- queueEmail(input: { templateKey, recipientEmail, recipientName?, relatedEntityType?, relatedEntityId?, payload }) — server action (use 'use server' directive; this can be called from other server actions only)
  - Validate: ensure called from server context (no client invocation)
  - Lookup template from registry; validate payload against template's Zod schema
  - Render via template
  - Call supabase.rpc('enqueue_email_dispatch', { p_template_key, p_recipient_email, p_recipient_name, p_related_entity_type, p_related_entity_id, p_payload, p_subject, p_body_html, p_body_text })
  - If RPC returns existing dispatch id without status='queued' → return immediately (idempotency hit)
  - Else: attempt provider.send() immediately
    - On ok: call update_email_dispatch_status with status='sent', provider_message_id
    - On retryable failure: status='failed_retryable', next_retry_at = computeBackoff(0)
    - On permanent failure: status='failed_permanent', last_error
  - Return { dispatchId, status }
  - Email failure NEVER throws to the caller — the calling business logic (e.g. validation request) must succeed even if email fails. The dispatch row records the failure for retry.

- processQueue() — called by /api/cron/email-retry
  - Select rows where status='failed_retryable' AND next_retry_at <= now() ORDER BY next_retry_at LIMIT 50
  - For each: increment attempt_count (in-memory), call provider.send(), apply same status logic as queueEmail
  - If attempt_count would exceed 5: status='failed_permanent', last_error, log line "Email dispatch [id] permanently failed after 5 attempts"

- computeBackoff(attemptCount) → ms: [60_000, 300_000, 900_000, 3_600_000, 21_600_000][attemptCount] || null

### Step 6: Webhook handler

File: src/app/api/email/webhook/sendgrid/route.ts
- POST handler
- Read raw body and signature header (X-Twilio-Email-Event-Webhook-Signature)
- Verify signature using env.SENDGRID_WEBHOOK_PUBLIC_KEY via ECDSA P-256 (SendGrid's documented algorithm) — use node:crypto
- On verification failure: 401, log "Rejected unverified SendGrid webhook"
- On success: parse events array; for each event, lookup dispatch by sg_message_id, call record_email_dispatch_event RPC mapping event to status:
  - delivered → status='delivered', delivered_at=event timestamp
  - bounce → status='bounced', bounced_at=event timestamp
  - dropped → status='failed_permanent', last_error=event reason
  - deferred → no status change (transient)
  - other events (open, click, etc.) → ignored for now
- Return 200 with count of events processed

### Step 7: Cron retry endpoint

File: src/app/api/cron/email-retry/route.ts
- GET handler (Azure SWA HTTP trigger compatible)
- Verify a shared secret header (env.CRON_SHARED_SECRET) — reject 401 if mismatch
- Call processQueue()
- Return 200 with { processed, succeeded, retried, permanentlyFailed } counts

### Step 8: Wire into existing trust-layer actions

Modify src/lib/validation/actions.ts:
- After successful insert in requestValidation: queueEmail({ templateKey: 'validation_request', recipientEmail: validatorEmail, recipientName: validatorName, relatedEntityType: 'validation_request', relatedEntityId: newRequestId, payload: { requestorName, validatorName, incidentName, positionTitle, deploymentStartDate, deploymentEndDate, tokenUrl: `${env.NEXT_PUBLIC_APP_URL}/validate/${token}` } })
- Wrap in try/catch — log but don't fail the action on email error
- After successful submitValidationResponse: queueEmail({ templateKey: 'validation_response_confirmation', recipientEmail: requestorEmail, ... })

Modify src/lib/evaluation/actions.ts:
- Same pattern for requestEvaluation → 'evaluation_request' and submitEvaluationResponse → 'evaluation_response_confirmation'

### Step 9: Admin surface

File: src/components/admin/email/EmailDispatchList.tsx (server component)
- Filterable list: template_key, status, date range, recipient search
- Columns: created_at, template, recipient_email, status, attempts, related entity link

File: src/components/admin/email/EmailDispatchDetail.tsx
- Detail view: rendered HTML preview in iframe srcdoc, payload jsonb, status timeline (created/sent/delivered/bounced), error trace if any, manual retry button (calls a server action that flips status back to 'failed_retryable' and next_retry_at=now())

File: src/app/(admin)/admin/email/page.tsx — list view
File: src/app/(admin)/admin/email/[id]/page.tsx — detail view
- Add "Email" link to admin nav

### Step 10: Tests (extend GSR-DOC-902 foundation)

File: src/lib/email/__tests__/provider.test.ts
- SendGrid response code mapping (202, 429, 4xx, 5xx) → ProviderResult shape
- Null provider returns ok and a stable-format providerMessageId

File: src/lib/email/__tests__/dispatch.test.ts
- computeBackoff schedule
- Idempotency: queueing twice for same (template, entity, id) returns same dispatch id

File: src/lib/email/__tests__/webhook.test.ts
- Signature verification: rejects on bad signature; accepts on good
- Event → status mapping correctness

File: src/lib/email/__tests__/templates.test.ts
- Each template's Zod schema accepts a valid payload and rejects invalid
- Each template renders to HTML containing required brand markers (sender disclosure, footer)

### Step 11: Environment configuration

Update src/lib/config/env.ts:
- Add: SENDGRID_API_KEY (string, optional in non-prod), SENDGRID_WEBHOOK_PUBLIC_KEY (string, optional), EMAIL_FROM_ADDRESS (string, default 'noreply@greysky.dev'), EMAIL_FROM_NAME (string, default 'Grey Sky Responder'), EMAIL_MODE (enum 'sendgrid'|'test'|'disabled', default 'disabled'), CRON_SHARED_SECRET (string, optional in non-prod)
- Production check: if EMAIL_MODE='sendgrid' then SENDGRID_API_KEY and SENDGRID_WEBHOOK_PUBLIC_KEY must be set, else fail-fast at startup

Update .env.example with the new vars and inline notes.

### Step 12: Operations doc (new)

File: docs/operations/EMAIL-DOMAIN-AUTHENTICATION.md
- Step-by-step: provisioning SendGrid sender authentication for greysky.dev
- DNS records to add at the domain registrar: SPF TXT, DKIM CNAMEs (3, returned by SendGrid), DMARC TXT (initially p=none, later p=quarantine)
- Verification steps in SendGrid console
- Pre-flight checklist before flipping EMAIL_MODE='sendgrid' in production: domain authenticated, single sender verified, webhook URL added in SendGrid Mail Settings → Event Webhook, signature verification enabled, dedicated IP NOT requested (use shared until volume justifies)

## Critical Rules

1. Email failure NEVER rolls back business logic. The validation_request row commits even if the email fails; the dispatch row records the failure for retry.
2. NO direct INSERT/UPDATE on email_dispatches from any server action — only via SECURITY DEFINER functions.
3. NO PII in subject lines. Tokens NEVER in subject lines. Tokens appear once in body, hyperlinked.
4. NO marketing copy. Transactional voice only. Operational, factual, respectful of recipient time.
5. Idempotency must hold — accidental double-clicks must not produce duplicate sends.
6. EMAIL_MODE='disabled' in production until DKIM/SPF/DMARC are configured. The null-provider must be safe to use in production for the interim.
7. The hash chain must mirror the audit_log pattern exactly. Use the same SHA-256 + canonical-serialization approach.
8. Self-Review Gate (5 checks) per CLAUDE-CODE-DISCIPLINE.md is mandatory before reporting done.

## Verification

After build:
1. npm run build passes with zero errors
2. npx tsc --noEmit passes
3. vitest run passes; new tests cover provider abstraction, dispatch, webhook, templates
4. Local smoke test with EMAIL_MODE=test: trigger requestValidation; observe dispatch row created with status='sent', provider='null', rendered HTML stored in payload_jsonb
5. Admin /admin/email lists the dispatch
6. Admin /admin/email/[id] shows the rendered HTML preview correctly
7. Pulling the latest commits and running `npx supabase db push` (or equivalent) applies both migrations cleanly

## Commit Convention

One commit per logical step. Final commits:
- feat(email): GSR-DOC-405 dispatch table, enums, hash-chain trigger, RLS (migration)
- feat(email): GSR-DOC-405 provider abstraction (SendGrid + null)
- feat(email): GSR-DOC-405 React Email templates (10 transactional templates + brand layout)
- feat(email): GSR-DOC-405 dispatch + retry logic + webhook handler
- feat(email): GSR-DOC-405 wire validation/evaluation actions
- feat(email): GSR-DOC-405 admin surface (/admin/email list + detail)
- test(email): GSR-DOC-405 vitest coverage (provider, dispatch, webhook, templates)
- docs(ops): GSR-DOC-405 email domain authentication operations doc

## Out of Scope (do NOT build in this session)

- Marketing/bulk email
- Localization (en-US only for v1)
- Platform-owned suppression list (use SendGrid's for now)
- Operational alerting on failed_permanent (placeholder log line only)
- Notification preference center UI (placeholder link in footer only; the route is built later)
- Phase 5 / Phase 6 / QRB email templates (registry slots reserved, templates not authored here)
- DKIM/SPF/DMARC DNS configuration itself (operational task — documented in EMAIL-DOMAIN-AUTHENTICATION.md, executed by Roy out-of-band)
```

---

## Reference Files

| File | Purpose |
|------|---------|
| `docs/design/GSR-DOC-405-NOTIFICATION-SERVICE.md` | Full design spec (read first) |
| `docs/design/NAMING-CONVENTIONS.md` | Filename and folder rules |
| `docs/agents/CLAUDE-CODE-DISCIPLINE.md` | Self-review gate (mandatory) |
| `supabase/migrations/20260409000007_triggers.sql` | Reference: existing audit_log hash-chain trigger pattern |
| `supabase/migrations/20260415000002_security_patch.sql` | Reference: SECURITY DEFINER function patterns |
| `src/lib/validation/actions.ts` | Modify: add queueEmail call after request insert |
| `src/lib/evaluation/actions.ts` | Modify: add queueEmail call after request insert |
| `src/lib/config/env.ts` | Modify: add email-related env vars |
| `src/components/dashboard/records/RecordDetail.tsx` | Reference only: existing surface |

## Discipline Protocol

Follow `docs/agents/CLAUDE-CODE-DISCIPLINE.md` in full:
- Self-Review Gate (Security, Doctrine, UX, Error Handling, Test Coverage)
- Investigation Protocol if debugging
- Safety Guardrails
- Structured Completion Report at end
