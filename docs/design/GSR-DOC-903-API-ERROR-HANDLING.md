---
doc_id: GSR-DOC-903
title: "API Error Handling and Response Format"
phase: 9
status: review
blocks_on:
  - GSR-DOC-004
priority: high
author: Roy E. Dunn
created: 2026-04-24
updated: 2026-04-24
backfilled: true
notes: Backfilled 2026-04-24. Codifies the existing error-handling pattern across `src/app/api/*` routes and server actions, and sets the standard for new endpoints. Status is `review` rather than `complete` because the pattern exists in code but has not been audited for consistency across all endpoints — full audit is a follow-on task.
---

# GSR-DOC-903: API Error Handling and Response Format

| Field | Value |
|-------|-------|
| Phase | 9 |
| Status | review (pattern documented; full-codebase audit pending) |
| Blocks on | GSR-DOC-004 ✅ |
| Priority | high |

## Purpose

A platform that holds responder PII, deployment histories, paid Sky Coin transactions, and credentialing decisions cannot afford ad-hoc error handling. Inconsistent responses leak internal state, confuse client code, complicate logging, and create attack surface. This doc codifies the platform's API error handling standard so that every new endpoint, every server action, and every webhook handler responds in a predictable, secure, observable way.

## Standard Response Shapes

### Success

```json
{ "ok": true, "...payload": "..." }
```

Or, when returning a resource directly:

```json
{ "document": { ... }, "signedUrl": "..." }
```

Either pattern is acceptable. The shape is contractual with the calling client; once an endpoint commits to a shape it does not change without versioning.

### Error

```json
{ "error": "Human-readable message" }
```

HTTP status code carries the structured signal. Body is for human-readable display only.

### Validation error (when actionable detail is safe to expose)

```json
{
  "error": "Validation failed",
  "issues": [
    { "field": "email", "message": "Email must be a valid address" },
    { "field": "phone", "message": "Phone must be E.164 format" }
  ]
}
```

The `issues` array surfaces field-level details when (a) the data the client provided is the source of the error and (b) exposing the field name does not leak schema information. Reuse Zod's `flatten()` output where convenient.

## HTTP Status Code Mapping

| Status | When to use |
|--------|-------------|
| 200 OK | Success, response body present |
| 201 Created | Resource created; include `Location` header |
| 204 No Content | Success, no body (rare; prefer 200 with `{ ok: true }` for consistency) |
| 400 Bad Request | Client sent malformed input or input that fails schema validation |
| 401 Unauthorized | Authentication required and absent or invalid |
| 403 Forbidden | Authenticated but not allowed (role, RLS, or business rule) |
| 404 Not Found | Resource does not exist or caller lacks visibility (do not distinguish — 404 covers both, defending against existence-leak) |
| 409 Conflict | State conflict (e.g., duplicate idempotency key, version mismatch) |
| 422 Unprocessable Entity | Semantic validation failure (input is well-formed but rejected by business rule) — optional; 400 is acceptable instead |
| 429 Too Many Requests | Rate limit exceeded; include `Retry-After` header |
| 500 Internal Server Error | Unexpected failure, no client action expected |
| 502 / 503 / 504 | Upstream failures (database, Stripe, SendGrid). Map per upstream; 503 is the safest default |

**Critical rule:** never return 500 with the raw exception message in the body. The body should contain a generic error string; the exception is logged server-side with full context.

## What Never Appears in Error Bodies

1. **Stack traces.** Logged server-side, never returned.
2. **Database error text.** "duplicate key value violates unique constraint" tells an attacker about schema. Map to a generic "Resource conflict" or similar.
3. **Internal IDs that the caller did not provide.** If the request did not reference an ID, the response should not surface one.
4. **Authenticated user PII for unauthenticated calls.** A failed auth endpoint must not echo back the looked-up user's name or email.
5. **Existence signals from authorization failures.** If an unauthorized user requests a resource they cannot see, return 404, not 403 with "you don't have access to record `abc-123`".
6. **Retry diagnostics that imply backend topology.** "Database connection timeout" leaks more than "Service temporarily unavailable, please retry".

## Server Action Pattern

Server actions return a typed result object, not an HTTP response:

```typescript
type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string; issues?: ValidationIssue[] };
```

The calling client component reads the result and renders accordingly. Server actions never throw to the client unless the failure is genuinely unexpected and the error boundary should catch it.

Existing patterns to follow:

```typescript
// src/lib/actions/profile.ts (illustrative — adapt to actual file)
export async function updateProfileAction(formData: FormData): Promise<ActionResult<MemberProfile>> {
  const session = await getUser();
  if (!session) return { ok: false, error: 'Authentication required' };

  const parsed = profileUpdateSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { ok: false, error: 'Validation failed', issues: zodIssues(parsed.error) };
  }

  try {
    const profile = await updateProfile(supabase, session.user.id, parsed.data);
    return { ok: true, data: profile };
  } catch (err) {
    log.error('updateProfileAction failed', { userId: session.user.id, err });
    return { ok: false, error: 'Could not update profile. Please try again.' };
  }
}
```

The exception path logs structured context server-side and returns a generic message. The validation path returns actionable detail. The auth path is a guard, not a handler.

## API Route Handler Pattern

```typescript
// src/app/api/documents/[id]/route.ts (illustrative)
export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [{ document, error }, { url }] = await Promise.all([
    getDocumentById(id),
    getDocumentUrl(id),
  ]);
  if (error || !document) {
    return NextResponse.json({ error: error ?? 'Not found' }, { status: 404 });
  }
  return NextResponse.json({ document, signedUrl: url });
}
```

Patterns enforced:

1. Server logic is delegated to library functions in `src/lib/queries/*` or `src/lib/actions/*`. Route handlers compose; they do not contain business logic.
2. Error checks are explicit; the route handler decides the HTTP status from the error type, not from the upstream throwing.
3. No try/catch around the entire route handler unless the route handler itself can do something useful with the exception. Otherwise, allow the exception to surface to Next.js's standard 500 handler, which already returns a safe generic body.

## Webhook Handler Pattern

Webhook handlers (currently `src/app/api/stripe/webhook/route.ts`, future `src/app/api/email/webhook/sendgrid/route.ts`) follow a stricter pattern:

1. **Verify signature first.** Reject 401 on signature failure.
2. **Idempotency check.** Look up the provider event ID in a `*_events` table; if already processed, return 200 immediately.
3. **Process and persist.** Apply state changes within a single transaction where possible.
4. **Return 200 once persisted.** The provider treats non-200 as "retry", so any non-200 response will result in webhook redelivery.
5. **Errors during processing.** Log full context. Return 500 (provider will retry) only for transient errors. For permanent failures (malformed payload, unknown event type), return 400 once and log; the provider will not retry on 4xx.

## Logging

- Every error path logs with structured context: actor (if known), action, target entity, error class, timing
- Server-side logs are operational, not user-facing. They may contain PII for the recipient (the platform admin reviewing logs) but must be access-controlled
- Production logs are segregated from development; access to production logs is platform_admin role only
- Log retention is governed by DOC-907 (Data Classification + Privacy Controls — pending)

## Acceptance Criteria

These criteria establish the standard. Full codebase compliance is a follow-on audit task tracked in the QUEUE.

1. Every API route under `src/app/api/*` returns JSON responses matching the shapes above
2. Every server action returns an `ActionResult<T>` typed object; no thrown errors propagate to the client unless caught by an error boundary
3. No production response body contains a stack trace, raw database error message, or backend topology hint
4. Webhook handlers verify signatures before any state read or write
5. Idempotency is enforced via provider event ID lookup for every webhook event source
6. Validation errors expose field-level detail only when safe (Zod-verified input, no schema leakage)

## Agent Lenses

- **Threshold** (security): existence-leak avoidance is the central security rule. 404 over 403 in the ambiguous case. No internal IDs in responses. No raw upstream error text. Webhook signature verification is non-negotiable.
- **Lookout** (UX): error messages are honest about what the user can do — "Validation failed" with field detail when actionable; "Could not update profile. Please try again." when not. No "Internal server error 0xC000007B".
- **Baseplate** (data/schema): error responses do not betray schema. Database-level errors map to generic application-level errors before any response is constructed.
- **Meridian** (doctrine): operational language. "Resource conflict" not "duplicate key". "Service temporarily unavailable" not "retry-able exception in upstream call".

## Open Items

1. **Full codebase audit.** Pattern compliance across all existing endpoints has not been verified line-by-line. Audit deliverable: a table mapping each endpoint to its response patterns and any deviations. Fix deviations.
2. **Logging infrastructure.** Current logging uses `console.log/error`. Production observability needs structured logging (likely with the eventual addition of an APM tool — out of scope for this doc).
3. **Rate limiting integration.** When the in-memory rate limiter is replaced with Redis-backed (mentioned in DOC-900), 429 responses should include accurate `Retry-After` headers.

## Backfill Note

This doc captures the pattern that exists in the codebase, formalizes it as a standard, and notes the audit task to verify universal compliance.
