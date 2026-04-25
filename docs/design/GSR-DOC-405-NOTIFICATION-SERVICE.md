---
doc_id: GSR-DOC-405
title: "Notification Service — Transactional Email Templates and Dispatch"
phase: 4
status: approved
blocks_on:
  - GSR-DOC-002
  - GSR-DOC-005
  - GSR-DOC-400
  - GSR-DOC-402
priority: critical
author: Roy E. Dunn
created: 2026-04-24
updated: 2026-04-24
notes: First Sprint 1 design doc post-naming-normalization. Resolves the operational gap that validation and evaluation tokens are generated but never reach external recipients. SendGrid + React Email + noreply@greysky.dev per decisions captured 2026-04-24. Tamper-evident dispatch log required because validation/evaluation requests are paid Sky Coin transactions with legal-attestation downstream consequences.
---

# GSR-DOC-405: Notification Service — Transactional Email Templates and Dispatch

| Field | Value |
|-------|-------|
| Phase | 4 |
| Status | approved |
| Blocks on | GSR-DOC-002 ✅, GSR-DOC-005 ✅, GSR-DOC-400 ✅, GSR-DOC-402 ✅ |
| Priority | critical |

## Purpose

Validation and evaluation requests are paid transactions — a member spends 10 Sky Coins to ask a peer to attest to their service, or 15 to ask a supervisor to evaluate it. The platform generates a UUID token, persists the request, and renders the public form at `/validate/[token]` or `/evaluate/[token]`. **What it does not do today is deliver the link.** Without delivery, the request never reaches the validator or evaluator, the member's spend produces no result, and the trust layer that the rest of the credentialing pathway depends on cannot function.

This doc builds the transactional email substrate that closes that loop. It covers:

- A provider-abstracted email dispatch layer (SendGrid as the initial implementation, swappable later)
- A React Email-based template architecture with shared brand components
- The initial template set required to operate the trust layer and supporting member flows
- A tamper-evident dispatch log so every send is auditable — required because these emails carry tokens that authorize legal attestations
- Failure handling, retry, and dead-letter behavior so a transient SendGrid outage does not silently lose paid requests
- DKIM and SPF prerequisites for the `greysky.dev` sender domain

The design is deliberately scoped to **transactional** email only. Marketing email, newsletters, and bulk announcements are out of scope and intentionally segregated — credentialing-related communications must not share infrastructure with promotional traffic, both for deliverability reasons and because some recipients may be senior officials who should never see promotional content from this platform.

## Data Entities

### New Table

**`email_dispatches`** — one row per send attempt, append-only, hash-chained for tamper evidence.

```sql
CREATE TABLE email_dispatches (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_key           TEXT NOT NULL,                    -- e.g. 'validation_request'
  recipient_email        TEXT NOT NULL,
  recipient_name         TEXT,
  related_entity_type    email_dispatch_entity_type_enum,  -- 'validation_request' | 'evaluation_request' | 'user' | etc.
  related_entity_id      UUID,                             -- FK by convention, not constraint
  payload_jsonb          JSONB NOT NULL,                   -- input data used to render the template
  rendered_subject       TEXT NOT NULL,
  rendered_body_html     TEXT NOT NULL,
  rendered_body_text     TEXT,
  status                 email_dispatch_status_enum NOT NULL DEFAULT 'queued',
  provider               TEXT NOT NULL DEFAULT 'sendgrid',
  provider_message_id    TEXT,                             -- returned by provider on accept
  attempt_count          INTEGER NOT NULL DEFAULT 0,
  last_error             TEXT,
  next_retry_at          TIMESTAMPTZ,
  sent_at                TIMESTAMPTZ,
  bounced_at             TIMESTAMPTZ,                      -- populated by webhook
  delivered_at           TIMESTAMPTZ,                      -- populated by webhook
  hash_prev              TEXT,                             -- hash of previous row in chain
  hash                   TEXT NOT NULL,                    -- hash(this row's content + hash_prev)
  created_at             TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at             TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX email_dispatches_status_idx ON email_dispatches(status, next_retry_at) WHERE status IN ('queued', 'failed_retryable');
CREATE INDEX email_dispatches_entity_idx ON email_dispatches(related_entity_type, related_entity_id);
CREATE INDEX email_dispatches_recipient_idx ON email_dispatches(recipient_email, created_at DESC);
```

### New Enums

```sql
CREATE TYPE email_dispatch_entity_type_enum AS ENUM (
  'validation_request',
  'evaluation_request',
  'user',
  'membership',
  'certification',
  'qrb_review',
  'system'
);

CREATE TYPE email_dispatch_status_enum AS ENUM (
  'queued',           -- created, not yet attempted
  'sending',          -- attempt in flight
  'sent',             -- accepted by provider
  'delivered',        -- confirmed delivered (webhook)
  'bounced',          -- hard bounce (webhook)
  'failed_retryable', -- transient failure, will retry
  'failed_permanent', -- gave up after retries
  'suppressed'        -- recipient on suppression list (e.g. previous hard bounce)
);
```

### Trigger

Reuse the existing audit-log hash-chain pattern (`compute_audit_hash` from Phase 0) — apply the same approach here. On `BEFORE INSERT`, compute `hash` from the row content concatenated with the most recent `hash` in the table (or empty string for the first row). This makes any post-hoc tampering detectable: changing a delivered or bounced row would invalidate every subsequent row's hash.

### RLS Policies

```sql
ALTER TABLE email_dispatches ENABLE ROW LEVEL SECURITY;

-- Platform admins see everything
CREATE POLICY email_dispatches_select_admin ON email_dispatches
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'platform_admin')
  );

-- Members see dispatches related to their own entities (their own validation requests, their own evaluation requests, etc.)
CREATE POLICY email_dispatches_select_own ON email_dispatches
  FOR SELECT USING (
    (related_entity_type = 'user' AND related_entity_id = auth.uid())
    OR (related_entity_type = 'validation_request' AND EXISTS (
      SELECT 1 FROM validation_requests vr
      WHERE vr.id = email_dispatches.related_entity_id AND vr.requestor_id = auth.uid()
    ))
    OR (related_entity_type = 'evaluation_request' AND EXISTS (
      SELECT 1 FROM evaluation_requests er
      WHERE er.id = email_dispatches.related_entity_id AND er.requestor_id = auth.uid()
    ))
  );

-- No INSERT/UPDATE policies for clients. All writes go through SECURITY DEFINER functions
-- called only by server actions. This prevents client-side dispatch forgery.
```

### TypeScript Types

**New file:** `src/lib/types/email.ts`

```typescript
export type EmailDispatchEntityType =
  | 'validation_request'
  | 'evaluation_request'
  | 'user'
  | 'membership'
  | 'certification'
  | 'qrb_review'
  | 'system';

export type EmailDispatchStatus =
  | 'queued'
  | 'sending'
  | 'sent'
  | 'delivered'
  | 'bounced'
  | 'failed_retryable'
  | 'failed_permanent'
  | 'suppressed';

export type EmailTemplateKey =
  | 'validation_request'
  | 'validation_response_confirmation'
  | 'evaluation_request'
  | 'evaluation_response_confirmation'
  | 'welcome'
  | 'password_reset'
  | 'membership_confirmation'
  | 'membership_renewal_reminder'
  | 'certification_issued'
  | 'qrb_decision';

export interface EmailDispatch {
  id: string;
  templateKey: EmailTemplateKey;
  recipientEmail: string;
  recipientName: string | null;
  relatedEntityType: EmailDispatchEntityType | null;
  relatedEntityId: string | null;
  payloadJsonb: Record<string, unknown>;
  renderedSubject: string;
  renderedBodyHtml: string;
  renderedBodyText: string | null;
  status: EmailDispatchStatus;
  provider: string;
  providerMessageId: string | null;
  attemptCount: number;
  lastError: string | null;
  nextRetryAt: string | null;
  sentAt: string | null;
  bouncedAt: string | null;
  deliveredAt: string | null;
  createdAt: string;
  updatedAt: string;
}
```

## Structure

### File Layout

```
src/lib/email/
  provider.ts                        — Provider-abstract interface (send, fetchStatus)
  providers/
    sendgrid.ts                      — SendGrid implementation
    null-provider.ts                 — No-op for testing and EMAIL_MODE=disabled
  dispatch.ts                        — queueEmail, processQueue, retry logic
  templates/
    index.ts                         — Template registry: templateKey → render fn
    validation-request.tsx           — React Email component
    validation-response-confirmation.tsx
    evaluation-request.tsx
    evaluation-response-confirmation.tsx
    welcome.tsx
    password-reset.tsx
    membership-confirmation.tsx
    membership-renewal-reminder.tsx
    certification-issued.tsx
    qrb-decision.tsx
    components/
      EmailLayout.tsx                — Shared header/footer, brand colors, logo
      Button.tsx
      Heading.tsx
      Body.tsx
      Footer.tsx
      Disclosure.tsx                 — Footer disclosure block (sender, legal, who to contact)
  schemas.ts                         — Zod schemas validating each template's payload

src/lib/queries/email-dispatches.ts  — Supabase queries
src/lib/actions/email.ts             — Server actions (queueEmail used by other features)

src/app/api/email/webhook/sendgrid/route.ts   — SendGrid event webhook (delivered, bounced, etc.)
src/app/api/cron/email-retry/route.ts          — Periodic retry of failed_retryable rows

src/components/admin/email/
  EmailDispatchList.tsx              — Admin view of recent dispatches with filters
  EmailDispatchDetail.tsx            — Detail with rendered body preview, error trace, retry button

supabase/migrations/
  20260424000002_email_dispatches.sql              — table + enums + trigger + RLS
  20260424000003_email_dispatches_security_definer.sql  — SECURITY DEFINER write functions
```

### Provider Interface

```typescript
// src/lib/email/provider.ts
export interface EmailProvider {
  name: string;
  send(message: ProviderMessage): Promise<ProviderResult>;
  fetchStatus?(providerMessageId: string): Promise<ProviderStatus>;
}

export interface ProviderMessage {
  to: { email: string; name?: string };
  from: { email: string; name: string };
  replyTo?: { email: string; name?: string };
  subject: string;
  html: string;
  text?: string;
  customArgs?: Record<string, string>;   // SendGrid-style metadata; passes through to webhook
  categories?: string[];                  // for SendGrid analytics; e.g. ['validation_request', 'phase4']
}

export interface ProviderResult {
  ok: boolean;
  providerMessageId?: string;
  retryable: boolean;
  error?: string;
}
```

### Dispatch Flow

1. **Caller invokes `queueEmail()`** with `templateKey`, payload, recipient, related entity. Server action only — never called from the browser.
2. `queueEmail()` validates payload against the template's Zod schema, renders the template via React Email, computes hash chain, inserts a row with `status='queued'` via SECURITY DEFINER function `enqueue_email_dispatch()`.
3. **Sync send path (default for transactional):** immediately attempt `provider.send()`. On accept, update row to `status='sent'` with `provider_message_id`. On retryable failure, set `status='failed_retryable'`, `next_retry_at=now()+backoff(attempt_count)`. On permanent failure, set `status='failed_permanent'`.
4. **Async retry path:** the `/api/cron/email-retry` endpoint (called by an external cron — initially Azure SWA's HTTP trigger, eventually a queue) picks up rows where `status='failed_retryable' AND next_retry_at <= now()` and retries via `processQueue()`. Backoff schedule: 1m, 5m, 15m, 1h, 6h, then permanent failure.
5. **Webhook updates:** SendGrid posts delivery, bounce, dropped, deferred events to `/api/email/webhook/sendgrid`. The handler verifies the event signature, looks up the dispatch by `provider_message_id`, and updates `delivered_at` / `bounced_at` / `status` accordingly.
6. **Suppression:** after a hard bounce or repeated soft bounces, the recipient email is added to a suppression set (initially the SendGrid-managed list; future migration to a platform-owned `email_suppressions` table). Subsequent `queueEmail()` calls for that recipient short-circuit to `status='suppressed'` without an attempt.

### Integration Points (Phase 4 Trust Layer)

The following existing server actions get a `queueEmail()` call added inline:

- `requestValidation` (in `src/lib/validation/actions.ts`) → after the `validation_requests` row inserts, queue a `validation_request` email to the validator with the token URL.
- `submitValidationResponse` → after the response is recorded, queue a `validation_response_confirmation` email to the requesting member.
- `requestEvaluation` (in `src/lib/evaluation/actions.ts`) → after the `evaluation_requests` row inserts, queue an `evaluation_request` email to the evaluator.
- `submitEvaluationResponse` → after the response is recorded, queue an `evaluation_response_confirmation` email to the requesting member.

For Phase 5 (when authored): certification issuance triggers `certification_issued`. For QRB (DOC-404): QRB decisions trigger `qrb_decision`. These integrations are noted but not built in this doc — they'll wire in when those phases ship.

## Business Rules

1. **Transactional only.** Every email sent via this service is in direct response to a member action or a system event tied to that member's account. Marketing email, newsletters, and bulk communications are out of scope and must use a separate provider account (or different provider entirely) when introduced.

2. **Sender identity.** Default `from` is `Grey Sky Responder <noreply@greysky.dev>`. Replies to `noreply@` auto-bounce with a polite redirect. Replies are not a supported channel for this service. Templates that need a reply path use `support@longviewsolutionsgroup.com` as the body-level contact, never as the From header.

3. **Domain authentication.** `greysky.dev` must have SPF, DKIM (CNAME records pointing to SendGrid's DKIM signing keys), and DMARC published before any production sends. DKIM is mandatory — without it, deliverability to Gmail and Outlook drops below 60%. DMARC initially set to `p=none` for monitoring, escalated to `p=quarantine` after 30 days of clean reports.

4. **Token URLs.** Validation and evaluation token URLs use the production domain only — `https://greysky.dev/validate/{token}` and `https://greysky.dev/evaluate/{token}`. Never include sensitive token strings in subject lines or display text. The full URL appears in the body once, hyperlinked.

5. **PII in dispatch logs.** `recipient_email`, `recipient_name`, and `payload_jsonb` contain PII. RLS scopes visibility to the requesting member and platform admins only. The `email_dispatches` table is never exported in bulk to external systems.

6. **No PII in subject lines.** Subjects are templated and parameterized only by non-sensitive values (e.g., the requesting member's first name as written by themselves on their profile, the incident name). Never include the validator's email, an account ID, or a token in the subject.

7. **Idempotency.** Server actions that queue email do not re-queue if a dispatch with the same `(template_key, related_entity_type, related_entity_id)` tuple already exists in `status IN ('queued', 'sending', 'sent', 'delivered')`. This prevents duplicate sends from accidental double-clicks or retried server actions.

8. **Hash chain integrity.** Every row's `hash` is computed from the canonical serialization of the row content plus the previous row's `hash`. The trigger that enforces this is identical in shape to the existing `audit_log` chain. Admin tooling exposes a "verify chain" action that walks the table and confirms every hash is consistent.

9. **Retry policy.** Maximum 5 attempts. Backoff: 1m, 5m, 15m, 1h, 6h. After the 5th failure, status becomes `failed_permanent` and the platform-admin alert channel receives a notification (the alert mechanism itself is out of scope for this doc — placeholder log line for now, observability ticket follow-up).

10. **Webhook signature verification.** SendGrid event webhook signatures are verified using the public key from SendGrid's settings. Unverified posts are rejected with 401 and logged. No state changes from unverified posts.

11. **Test-mode safety.** When `EMAIL_MODE='disabled'` (current production setting until DKIM/SPF are configured) or `'test'` (preview/staging), the `null-provider` is used. The dispatch row is still created with `status='sent'` and `provider='null'` so feature flows can be exercised end-to-end. The `payload_jsonb` and rendered HTML are still recorded — useful for development and review without sending real mail.

12. **Localization scope.** English (US) only for v1. Templates do not include localization scaffolding. When localization is needed (likely for territories — PR, GU, etc.) it will be a separate doc and a refactor of the template registry.

13. **Compliance.** Transactional email is exempt from CAN-SPAM unsubscribe requirements when sent in direct response to a user action. The footer of every template still includes: sender identity ("Sent by Grey Sky Responder Society on behalf of Longview Solutions Group LLC"), a physical mailing address (Longview's), the platform's domain, and a link to manage notification preferences (placeholder route for now — the preference center is a future doc).

## Copy Direction

- **Subject lines** are operational, not promotional. "Validation requested for your service at [Incident Name]" — not "Help [Member Name] verify their service!"
- **Greeting** uses the recipient's first name when available: "[First name],". When name is unknown: "Hello,". Never "Dear [name]" or "Hi friend!"
- **Body voice** is direct, factual, and respectful of the recipient's time. The validator/evaluator is a working professional. Get to the point in the first sentence.
- **No marketing copy** in transactional templates. No "Exciting news!" no "Welcome to the future!" no exclamation points except in the subject of the `welcome` template (and even there, sparingly).
- **CTAs** are unambiguous: "Confirm this deployment" or "Begin evaluation" — not "Click here" or "Get started."
- **Token URLs** are presented as full URLs hyperlinked, with a fallback "If the button does not work, copy and paste this address into your browser:" line beneath. Some recipients still rely on plaintext mail clients.
- **Attestation language** in validator/evaluator emails references the legal weight of the action: "Your response will be recorded as part of the requesting responder's professional service history."
- **Tone:** operational authority, not corporate polish. The recipient is being asked to attest to professional service that may inform credentialing decisions affecting future deployments. Treat it as such.

## Acceptance Criteria

1. Migration `20260424000002_email_dispatches.sql` creates the `email_dispatches` table, both enums, the hash-chain trigger, and all three indexes
2. Migration `20260424000003_email_dispatches_security_definer.sql` creates `enqueue_email_dispatch()` and `update_email_dispatch_status()` SECURITY DEFINER functions; revokes direct INSERT/UPDATE on the table from `authenticated` and `anon` roles
3. RLS policies on `email_dispatches` allow `select_admin` and `select_own` (related entity scoped); deny direct INSERT/UPDATE
4. `src/lib/email/provider.ts` exports the `EmailProvider` interface
5. `src/lib/email/providers/sendgrid.ts` implements the interface using `@sendgrid/mail`; reads API key from `env.SENDGRID_API_KEY`; returns `retryable=true` for 5xx and 429, `false` for 4xx
6. `src/lib/email/providers/null-provider.ts` returns `ok=true` immediately; used when `EMAIL_MODE !== 'sendgrid'`
7. `src/lib/email/dispatch.ts` exports `queueEmail()` server action; validates payload via Zod; renders template; calls `enqueue_email_dispatch` RPC; immediately attempts send; updates status accordingly
8. All ten templates render to valid HTML; each template's payload is validated by a Zod schema in `src/lib/email/schemas.ts`
9. `EmailLayout.tsx` shared component applies brand tokens (Command Navy header, Signal Gold rule, Inter font, Ops White background) consistent with the dashboard UI
10. SendGrid webhook handler at `/api/email/webhook/sendgrid` verifies the SendGrid signature; updates `delivered_at`, `bounced_at`, `status` on matching dispatches; rejects unverified posts with 401
11. Cron retry endpoint at `/api/cron/email-retry` picks up `failed_retryable` rows where `next_retry_at <= now()`; calls `processQueue()`; respects 5-attempt cap with documented backoff schedule
12. Existing `requestValidation`, `submitValidationResponse`, `requestEvaluation`, `submitEvaluationResponse` server actions queue the corresponding email after the database write; the email failure does not roll back the database write (the dispatch row records the failure for retry)
13. Idempotency check: queueing an email when an existing non-failed dispatch matches `(template_key, related_entity_type, related_entity_id)` returns the existing dispatch ID without creating a new row
14. Admin route `/admin/email` lists recent dispatches with filters (template, status, date range); detail page shows rendered HTML preview, error trace, and a manual retry button
15. `npm run build` passes with zero errors
16. `npx tsc --noEmit` passes
17. Vitest tests cover: provider abstraction (SendGrid + null), retry backoff math, hash chain computation, idempotency check, webhook signature verification
18. Production env vars documented: `SENDGRID_API_KEY`, `SENDGRID_WEBHOOK_PUBLIC_KEY`, `EMAIL_FROM_ADDRESS=noreply@greysky.dev`, `EMAIL_FROM_NAME=Grey Sky Responder`, `EMAIL_MODE=sendgrid` (or `disabled`/`test`)
19. DKIM, SPF, and DMARC DNS records for `greysky.dev` documented in `docs/operations/EMAIL-DOMAIN-AUTHENTICATION.md` (new ops doc — content scaffolded by this build)

## Agent Lenses

- **Baseplate** (data/schema): One new table, two new enums, one trigger, three indexes. Hash-chain pattern reuses the existing `audit_log` shape — no new conceptual surface. RLS is scoped tightly: members see only their own related dispatches; no client-side INSERT path. SECURITY DEFINER functions enforce the write boundary. Foreign relationships to `validation_requests`, `evaluation_requests`, `users` are by convention (UUID + entity-type discriminator) rather than constraint, because the related entity types vary and a polymorphic FK is cleaner than seven nullable FKs.

- **Meridian** (doctrine): Transactional emails carry tokens that authorize legal attestations of incident service. The hash chain on `email_dispatches` exists because, in a credentialing dispute, "we sent the email and the validator confirmed" must be defensible. The dispatch log is evidence. Subject lines and body copy use NIMS/RTLT-aware language ("deployment," "service," "incident") — never marketing terms.

- **Lookout** (UX): The validator or evaluator may be a senior official seeing Grey Sky for the first time. The email is the first impression. Subject lines are operational. The body opens with the deployment summary. The CTA button is single, prominent, and unambiguous. The recipient understands what they are being asked to do within five seconds of opening the message.

- **Threshold** (security): Five threats considered. (1) Forged dispatches — closed by SECURITY DEFINER write boundary; clients cannot insert into `email_dispatches` directly. (2) Token leak via subject line — closed by rule 6 (no PII or tokens in subjects). (3) Webhook spoofing — closed by SendGrid signature verification, unverified posts rejected. (4) Tampering with delivery records to fabricate evidence — closed by hash chain. (5) Subdomain takeover via stale DKIM record — mitigated by treating DKIM CNAMEs as a managed asset (documented in operations doc) and including DKIM verification in the production readiness checklist.

## Open Questions

None blocking. Two items for follow-on work:

1. **Suppression list ownership.** Initial implementation relies on SendGrid-managed suppression. A platform-owned `email_suppressions` table is preferable long-term so suppression decisions are portable across providers. Defer to a future doc; not blocking DOC-405.
2. **Operational alerting on `failed_permanent`.** Out of scope for this doc — placeholder log line. Will pair with the eventual observability/alerting design (DOC-906 territory).

## Companion Docs

- **GSR-DOC-400-VALIDATION-REQUEST.md** — calls `queueEmail('validation_request', ...)` after creating the request row.
- **GSR-DOC-401-VALIDATION-RESPONSE.md** — triggers `validation_response_confirmation` to the requesting member after submission.
- **GSR-DOC-402-EVALUATION-REQUEST.md** — calls `queueEmail('evaluation_request', ...)` after creating the request row.
- **GSR-DOC-403-EVALUATION-RESPONSE.md** — triggers `evaluation_response_confirmation` to the requesting member after submission.
- **GSR-DOC-404-QRB.md** (when authored) — will trigger `qrb_decision` notifications.
- **GSR-DOC-501** (when authored) — certification issuance will trigger `certification_issued`.

## Build Prompt

See `docs/prompts/GSR-DOC-405-PROMPT.md`.
