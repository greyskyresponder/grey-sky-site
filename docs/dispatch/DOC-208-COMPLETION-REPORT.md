# GSR-DOC-208 — Completion Report

**Spec:** `docs/dispatch/GSR-DOC-208-stripe-billing-extensions.md` (dispatch baseline `4b8aee1`)
**Build plan:** `docs/prompts/GSR-DOC-208-BUILD-PLAN.md`
**Builder:** ATLAS via Claude Code session
**Status:** ✅ Build complete — awaiting Roy's review and push approval
**Branch:** `main` (local only; no push performed per project rules)
**Date:** 2026-05-04

---

## TL;DR

DOC-208 (Stripe billing extensions) shipped end-to-end across 7 build stages plus one out-of-scope DB unblocker.

- **23 files changed, 2,009 insertions, 0 deletions**
- **76/76 tests pass** (was 68 pre-DOC-208; +8 new for DOC-208 webhook handlers)
- **All gates clean:** `tsc --noEmit`, `npm run lint`, `npm test`, `npm run build`
- **Zero edits to existing production code paths** — additive only, except 5 new fields on `User` type and 2 new switch cases on the webhook
- Existing 20 webhook tests + 13 coin tests + 17 auth tests still pass unchanged

---

## Commit Log

```
0147087  test(stripe): DOC-208 stage 7 — webhook handler coverage
a918ba0  feat(billing): DOC-208 stage 6 — billing dashboard UI
98890a5  feat(billing): DOC-208 stage 5 — REST API routes for checkout/portal
dc7677f  feat(stripe): DOC-208 stage 4 — webhook handlers for refund + grace period
c9c8fa5  feat(stripe): DOC-208 stage 3 — stripe SDK helpers
2465889  feat(db):     DOC-208 stage 2 — idempotency-aware ledger functions
52a3e87  feat(db):     DOC-208 stage 1 — stripe billing schema extensions
7a32223  fix(db):      [out-of-scope, flagged] unblock supabase db reset on
                       DOC-204 enum + policy collision
```

---

## Stage-by-stage Summary

### Stage 1 — Schema (`52a3e87`)
**File:** `supabase/migrations/20260504000001_doc208_billing_extensions.sql` (227 lines)

- 4 new tables:
  - `stripe_events` — webhook idempotency log + reconciliation queue
  - `stripe_invoices` — cached invoice metadata for the billing dashboard
  - `stripe_coin_pack_purchases` — links Stripe charges to coin grants for refund reversal
  - `processed_idempotency_keys` — replay protection for ledger functions
- 5 new columns on `users`: `verified_active`, `verified_active_until`, `spending_blocked`, `grace_period_started_at`, `grace_period_ends_at`
- 7 RLS policies (read-only for owners, service role bypasses for webhook writes)
- Index `idx_stripe_events_needs_reconcile` for operator reconciliation

### Stage 2 — Idempotent ledger (`2465889`)
**Files:**
- `20260504000002_doc208_ledger_entry_id_type_fix.sql` (34 lines)
- `20260504000003_doc208_idempotent_ledger.sql` (209 lines)

- 8-arg `credit_coins` overload adds `p_idempotency_key TEXT DEFAULT NULL`. Existing 7-arg signature preserved for backwards compat — Postgres function overloading dispatches correctly.
- New `reverse_coin_grant(UUID, TEXT, TEXT)` for refund reversal. Emits a negative ledger entry referencing the original grant; idempotent on `(p_idempotency_key)`.
- SQL smoke test verified: replaying the same key returns the original ledger ID; balances reconcile correctly across grant + reverse.

### Out-of-scope: DOC-204 unblocker (`7a32223`)
**Files:**
- `20260411000000_incidents_enum_prequel.sql` (32 lines)
- `20260411000001_incidents_expansion.sql` (added `DROP POLICY IF EXISTS` for `incidents_select_all` / `incidents_insert_authenticated` / `incidents_update_admin`)

`supabase db reset` was failing on enum + policy collisions in already-committed DOC-204 history. Could not run DOC-208 migrations without unblocking. Used a prequel migration + idempotent `DROP POLICY IF EXISTS` rather than rewriting committed history. **Flagged for separate review** — strictly out of DOC-208 scope but a hard prerequisite.

### Stage 3 — Stripe SDK helpers (`c9c8fa5`)
**Files (all new):**
- `src/lib/stripe/customer.ts` (78 lines) — `findOrCreateCustomer`; persists `stripe_customer_id` to `users`; idempotent via early-return when row already has one
- `src/lib/stripe/checkout.ts` (125 lines) — `createMembershipCheckoutSession`, `createCoinPackCheckoutSession`, `retrieveCheckoutSession`, `resolveCoinPackPriceId`. Both flows attach `gsr_user_id` + `gsr_purchase_type` metadata to PaymentIntent / Subscription for webhook reconciliation.
- `src/lib/stripe/portal.ts` (20 lines) — `createPortalSession` thin wrapper
- `src/lib/stripe/invoices.ts` (41 lines) — `listInvoicesForUser` reads from cached `stripe_invoices` table (does NOT call Stripe API directly — privacy-respecting + cheaper)
- `src/lib/types/stripe.ts` — extended with `CoinPackSku` literal union and `InvoiceRecord` interface

**Env vars added (all `.optional()`):** `STRIPE_PRICE_COINS_100`, `STRIPE_PRICE_COINS_500`, `STRIPE_PRICE_COINS_1000`, `STRIPE_PRICE_COINS_2500`. Routes return HTTP 503 at request-time when the corresponding price is unset.

**Stripe API version:** kept production's `'2026-03-25.dahlia'` rather than the spec's `'2024-12-18.acacia'`. Switching is out of scope.

### Stage 4 — Webhook handlers (`dc7677f`)
**File:** `src/app/api/stripe/webhook/route.ts` (+223 lines, additive)

Added 2 new switch cases to the existing webhook + 2 new handler functions at the end of the file:

- **`invoice.payment_failed`** → `handleInvoicePaymentFailed`
  - On first failure: sets `grace_period_started_at = now`, `grace_period_ends_at = now + 14d`, `spending_blocked = true`
  - On subsequent failures within an open window: sets `spending_blocked` only — does NOT reopen the timestamps
  - Skips when invoice has no customer or no subscription (one-time payments don't trigger grace)
  - **Does not revoke access** — only flags. Revocation comes from grace-expiry sweep or `customer.subscription.deleted`.

- **`charge.refunded`** → `handleChargeRefunded`
  - Looks up the matching `stripe_coin_pack_purchases` row by `payment_intent`
  - Calls `reverse_coin_grant(original_ledger_entry_id, reason, idempotency_key=event.id)`
  - Stamps `refunded_at` and `refund_ledger_entry_id` on the purchase row
  - Idempotent: skips if `refunded_at` already set; skips when no matching purchase (membership refunds handled separately)

**Reframing decision (documented in commit body):** the existing webhook is already well-factored per event. Originally Stage 4 scoped a router-pattern extraction; on reading the code, additive handlers were the minimum-risk path. Preserves the proven `OpError`/`OpContext`/`runOp`/`finalizeEventStatus` error contract and existing 20 webhook tests untouched.

### Stage 5 — REST API routes (`98890a5`)
**Files (all new):**
- `src/app/api/billing/checkout/membership/route.ts` (75 lines)
- `src/app/api/billing/checkout/coin-pack/route.ts` (73 lines)
- `src/app/api/billing/portal/route.ts` (64 lines)
- `src/app/api/billing/checkout-success/route.ts` (83 lines)

All routes: `runtime = 'nodejs'`, `dynamic = 'force-dynamic'`, Zod-validated bodies, structured error responses (401 unauth / 400 invalid / 503 not configured / 502 upstream / 500 unexpected).

**`/api/billing/checkout-success`** is a `GET` redirect target only — does NOT mutate state. The webhook is the single source of truth. Defense-in-depth: verifies `session.metadata.gsr_user_id` matches the logged-in user.

**Reframing decision (documented in commit body):** existing `src/lib/stripe/actions.ts` already has working Server Actions for checkout / portal, wired to existing UI components (`CoinPurchase`, `MembershipCta`) using the original `PURCHASE_PACKAGES` SKUs (`purchase_250/500/1000/2500/5000` with inline `price_data`). New REST routes use the **DOC-208 SKUs** (`coins_100/500/1000/2500` with pre-configured Stripe Price IDs). Both code paths coexist cleanly. Consolidation is a separate refactor.

### Stage 6 — Billing dashboard UI (`a918ba0`)
**Files (all new):**
- `src/app/(dashboard)/dashboard/billing/page.tsx` (145 lines) — server component
- `src/components/billing/PortalButton.tsx` (53 lines) — client component
- `src/components/billing/InvoiceList.tsx` (103 lines) — server component

**Modified:** `src/lib/types/users.ts` (+11 lines) — added the 5 DOC-208 columns to the `User` interface.

The page renders:
1. **Header + Manage Billing button** (only if user has `stripe_customer_id`)
2. **Grace period banner** (amber) when `grace_period_ends_at` is in the future. Adds "Sky Coin purchases are paused" copy if `spending_blocked` is true.
3. **Post-cancellation banner** (red) when `spending_blocked` is true but no active grace.
4. **Membership summary card** — status, renewal date, member-since, verified-active flag.
5. **Invoice history table** — server-rendered from cached `stripe_invoices`. Status pills, hosted-URL + PDF links per row. Best-effort: Stripe table query failure does not fail the page.

### Stage 7 — Tests (`0147087`)
**Files:**
- `src/test/utils/stripe-helpers.ts` (+24 lines) — `createPaymentFailedEvent`, `createChargeRefundedEvent` factories
- `src/app/api/stripe/webhook/__tests__/route.test.ts` (+200 lines) — 8 new tests

**`invoice.payment_failed` (4 tests):**
- Opens 14-day grace window on first failure with start/end timestamps ~14d apart and sets `spending_blocked=true`
- On subsequent failure within open window: sets `spending_blocked` only; leaves grace timestamps untouched
- Skips when invoice has no customer
- Skips when invoice is one-time payment (no subscription on lines)

**`charge.refunded` (4 tests):**
- Calls `reverse_coin_grant()` with original ledger ID + Stripe event id as idempotency key; stamps `refunded_at` and `refund_ledger_entry_id` on purchase row
- Skips when no matching coin pack purchase (membership refunds)
- Idempotent: skips when `refunded_at` is already populated
- Skips when charge has no `payment_intent`

---

## Verification Evidence (final commit, fresh)

```
$ npx tsc --noEmit
(clean — no output, exit 0)

$ npm run lint
(clean — no output, exit 0)

$ npm test -- --run
 ✓ src/lib/security/__tests__/sanitize-filter.test.ts (11 tests) 4ms
 ✓ src/lib/coins/__tests__/coins.test.ts (13 tests) 26ms
 ✓ src/lib/__tests__/env.test.ts (7 tests) 47ms
 ✓ src/lib/auth/__tests__/actions.test.ts (17 tests) 70ms
 ✓ src/app/api/stripe/webhook/__tests__/route.test.ts (28 tests) 103ms

 Test Files  5 passed (5)
      Tests  76 passed (76)

$ npm run build
(success — all routes registered)
  ƒ /api/billing/checkout-success
  ƒ /api/billing/checkout/coin-pack
  ƒ /api/billing/checkout/membership
  ƒ /api/billing/portal
  ƒ /dashboard/billing
  ƒ /api/stripe/webhook

$ supabase db reset
(success — all 28 migrations apply cleanly, including the 3 new DOC-208 ones
 and the DOC-204 unblocker prequel)
```

---

## Discipline Self-Review (5-check gate per CLAUDE-CODE-DISCIPLINE.md)

| Check | Status | Notes |
|---|---|---|
| **Security** | ✅ | Webhook signature verification preserved (existing path). Service-role writes confined to webhook + admin client. New REST routes auth-gated via `getUser()`. checkout-success verifies `gsr_user_id` matches logged-in user. RLS policies on all new tables. Zod at every API boundary. No secrets in code; only `.env.example` documents the new vars. |
| **Doctrine** | ✅ | Sky Coins terminology preserved (not "Sky Points"). Test mode only. Webhook is single source of truth — the success-redirect handler does NOT mutate state. Existing webhook error contract preserved (signature 400 / dup 200 / insert-fail 500 / post-record-error 200 with `processing_status='error'`). |
| **UX** | ✅ | Grace period banner gives clear deadline + remediation path. Empty-state messaging for invoice list. Errors surfaced inline, not as exceptions. Manage Billing button only shown when user has a Stripe customer (avoids 400 on click). |
| **Error handling** | ✅ | Every API route distinguishes 400 / 401 / 503 / 502 / 500. Invoice list query failure renders an inline message rather than 500-ing the whole page. Webhook handlers pipe everything through `runOp()` which translates exceptions to structured `OpError[]`. |
| **Test coverage** | ✅ | 8 new tests against the 2 new handlers (4 each, including idempotency + skip-paths + grace-window math). Existing 68 tests still pass — no regressions in coin / auth / env / sanitize / 20 prior webhook scenarios. SQL ledger functions verified via SQL smoke test (Stage 2). |

---

## Known Gaps / Follow-ups (not blockers)

1. **REST routes vs Server Actions duplication.** Two valid code paths to checkout/portal exist. Recommend a follow-up to consolidate the existing Server Actions (`src/lib/stripe/actions.ts`) onto the new helpers (`src/lib/stripe/checkout.ts` / `customer.ts`), then either deprecate the REST routes or rewrite the existing UI to call them. Out of scope for DOC-208.
2. **Stripe Price IDs are env-driven.** Routes return HTTP 503 when `STRIPE_PRICE_COINS_*` is unset. Production deploy needs these populated before the new coin pack flow is usable. `.env.example` documents them.
3. **Grace-expiry sweep job not in this PR.** The handler sets the grace deadline, but a scheduled sweep (or check-on-spend) is needed to actually flip `verified_active = false` when grace expires. Recommend a separate doc — likely a Postgres `pg_cron` job or a Next route hit by a cron pinger.
4. **Stripe API version drift.** Spec called for `'2024-12-18.acacia'`; production uses `'2026-03-25.dahlia'`. Kept production. If you ever pin a typed Stripe SDK to spec, regenerate types.
5. **DOC-204 unblocker (`7a32223`)** is mixed into this branch. Cleanest path is to land it as its own follow-up PR if you want strict 1-doc-1-PR hygiene; otherwise it ships with DOC-208.

---

## Push Approval Checklist

When you're ready to push:

- [ ] Review this report
- [ ] Spot-check the diff: `git diff 4b8aee1..HEAD --stat` and any files of concern
- [ ] (Optional) Drop me back into the session for any rework
- [ ] Approve push: `git push origin main` (8 commits stacked)
- [ ] Set the 4 `STRIPE_PRICE_COINS_*` env vars in Azure Static Web Apps before users hit `/dashboard/coins/purchase` via the new SKUs
- [ ] Set up Stripe webhook endpoint for the 2 new event types in test mode (`charge.refunded`, `invoice.payment_failed`) — existing endpoint already has signature secret

---

*Generated 2026-05-04 by ATLAS at end of DOC-208 build session.*
