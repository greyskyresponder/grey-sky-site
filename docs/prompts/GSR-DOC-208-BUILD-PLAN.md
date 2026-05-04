# GSR-DOC-208 — Build Plan (ATLAS Driving)

**Authored:** 2026-05-04 by ATLAS
**Reason ATLAS is driving:** Roy on something else; Claude Code subprocess auth blocked; ATLAS has tool access to repo
**Tier:** Full (per dispatch protocol)
**Strategy:** Option 2 — refactor in place, supersede where DOC-208 conflicts with shipped reality

## Build Reality Check (vs. DOC-208 file tree)

DOC-208 was authored fresh; the codebase already has substantial Stripe scaffolding from April. Authoritative paths in this build:

| DOC-208 says | Actual repo | Decision |
|---|---|---|
| `app/(member)/billing/page.tsx` | route group is `(dashboard)`, no billing page yet | Build at `src/app/(dashboard)/dashboard/billing/page.tsx` |
| `app/(member)/coins/...` | `src/app/(dashboard)/dashboard/coins/purchase/page.tsx` exists | Add coin pack tiles to existing purchase page |
| `app/api/webhooks/stripe/route.ts` | `src/app/api/stripe/webhook/route.ts` (575 LOC, working) | Keep current path — refactor in place |
| `app/api/checkout/membership` | `src/lib/stripe/membership.ts` has logic but no route | Promote to `src/app/api/checkout/membership/route.ts` |
| `app/api/checkout/coin-pack` | doesn't exist | Create at `src/app/api/checkout/coin-pack/route.ts` |
| `app/api/billing/portal` | doesn't exist | Create at `src/app/api/billing/portal/route.ts` |
| `lib/stripe/...` | mostly mapped 1:1 | Keep `client.ts`; add `config.ts`, `checkout.ts`, `portal.ts`, `customer.ts`, `webhook-handlers/` |
| `grant_coins` function | code uses `credit_coins` (existing) | DO NOT rename. Add `idempotency_key` parameter to `credit_coins` instead. Bridge in handler. |
| `users.verified_active` | doesn't exist; `users.membership_status` does | Add `verified_active`, derive from `membership_status='active'` in trigger or handler. Both coexist. |
| `coin_accounts.frozen` | exists | Keep in sync with new `users.spending_blocked` |

## Stage Plan (commit per stage)

### Stage 1 — Database migration (additive, non-breaking)
**File:** `supabase/migrations/20260504000001_doc208_billing_extensions.sql`

Adds:
- `processed_idempotency_keys` table
- `stripe_subscriptions` table
- `stripe_invoices` table
- `stripe_coin_pack_purchases` table
- `users.verified_active`, `users.verified_active_until`, `users.spending_blocked`, `users.grace_period_started_at`, `users.grace_period_ends_at` columns (DOC-208 calls for grace period on subscription record; we mirror to user for fast lookup)
- RLS policies on all new tables (member SELECT own, platform_admin SELECT all, service-role INSERT/UPDATE/DELETE)
- Indexes per spec

**Verify:** `npx supabase db reset` succeeds. Re-run `supabase status`.

### Stage 2 — Idempotency-aware ledger functions
**File:** `supabase/migrations/20260504000002_doc208_idempotent_ledger.sql`

- `CREATE OR REPLACE FUNCTION credit_coins(... p_idempotency_key TEXT DEFAULT NULL)` — adds idempotency key parameter; on duplicate key, returns previously-recorded result without re-writing
- `CREATE OR REPLACE FUNCTION reverse_coin_grant(p_original_ledger_entry_id BIGINT, p_idempotency_key TEXT, p_reason TEXT) RETURNS BOOLEAN`
- Both consult `processed_idempotency_keys` before writing

**Verify:** `npx supabase db reset`; manually call `SELECT credit_coins(...)` twice with same key — second call no-ops.

### Stage 3 — Stripe SDK additions + types
**Files:**
- `src/lib/stripe/config.ts` — coin pack catalog with lookup keys
- `src/lib/types/stripe.ts` — extend with DOC-208 types (StripeSubscription, BillingDashboardData, CoinPackSku, etc.)
- `src/lib/stripe/customer.ts` — `getOrCreateStripeCustomer(userId)`
- `src/lib/stripe/checkout.ts` — `createMembershipCheckout`, `createCoinPackCheckout`
- `src/lib/stripe/portal.ts` — `createCustomerPortalSession`
- `src/lib/stripe/invoices.ts` — `listUserInvoices`

**Verify:** `npm run lint`, `npm run build` — green.

### Stage 4 — Refactor webhook into handler-router
**Files:**
- `src/lib/stripe/webhook-handlers/index.ts` — event router (re-exports all handlers, dispatches by type)
- `src/lib/stripe/webhook-handlers/checkout-session-completed.ts` — split coin_purchase + membership branches; both use `credit_coins` with `p_idempotency_key = event.id`; coin_purchase inserts `stripe_coin_pack_purchases` audit row
- `src/lib/stripe/webhook-handlers/invoice-payment-succeeded.ts` — moves logic from current route; mirrors `stripe_invoices` row; updates `verified_active_until`
- `src/lib/stripe/webhook-handlers/invoice-payment-failed.ts` — NEW — sets grace period (now + 14 days), `spending_blocked = true`
- `src/lib/stripe/webhook-handlers/customer-subscription-updated.ts` — moves logic; upserts `stripe_subscriptions` row
- `src/lib/stripe/webhook-handlers/customer-subscription-deleted.ts` — moves logic
- `src/lib/stripe/webhook-handlers/charge-refunded.ts` — NEW — reverses coin pack grants via `reverse_coin_grant`
- `src/app/api/stripe/webhook/route.ts` — slimmed to: signature verification, event recording, dispatch to router, finalize

**Verify:** `npm test src/app/api/stripe` — existing tests pass. `npm run lint`. `npm run build`.

### Stage 5 — Checkout + portal API routes
**Files:**
- `src/app/api/checkout/membership/route.ts` — POST creates membership Checkout session
- `src/app/api/checkout/coin-pack/route.ts` — POST creates coin pack Checkout session (validates SKU)
- `src/app/api/billing/portal/route.ts` — POST creates Customer Portal session
- `src/app/api/billing/checkout-success/route.ts` — GET landing page handler
- All routes auth-gated to authenticated members (Supabase auth helpers)

**Verify:** `npm test`, `npm run lint`, `npm run build`.

### Stage 6 — Billing dashboard + coin pack UI
**Files:**
- `src/app/(dashboard)/dashboard/billing/page.tsx` — server component
- `src/app/(dashboard)/dashboard/billing/_components/billing-summary.tsx`
- `src/app/(dashboard)/dashboard/billing/_components/grace-period-banner.tsx`
- `src/app/(dashboard)/dashboard/billing/_components/payment-method-card.tsx`
- `src/app/(dashboard)/dashboard/billing/_components/invoice-list.tsx`
- `src/app/(dashboard)/dashboard/billing/_components/manage-billing-button.tsx`
- `src/app/(dashboard)/dashboard/coins/purchase/_components/coin-pack-grid.tsx`
- `src/app/(dashboard)/dashboard/coins/purchase/_components/coin-pack-card.tsx`
- Coin pack tiles wired into existing `purchase/page.tsx`

**Verify:** `npm run build` — billing page renders, no TypeScript errors.

### Stage 7 — Tests + final verification
**Files:**
- New unit tests for each new webhook handler in `src/lib/stripe/webhook-handlers/__tests__/`
- Idempotency replay test (same event ID twice → no double grant)
- Refund reversal test
- Grace period entry test on `invoice.payment_failed`

**Verify:**
- `npm test` — all green, full suite
- `npm run lint` — no errors
- `npm run build` — clean build
- Run `npx supabase db reset` end-to-end — confirm migrations apply cleanly

### Stage 8 — Self-review gate + Completion Report
Per discipline doc Section 1:
- Security: RLS verified, no secrets exposed, signature verification preserved
- Doctrine: terminology aligned (Sky Coins not Sky Points)
- A11y/UX: billing page WCAG-checked, ARIA labels present, keyboard nav works
- Error Handling: every async has handler; user-facing errors actionable
- Test Coverage: each new handler has happy-path + error-path test

Write Completion Report to `docs/journal/STATUS-2026-05-04-DOC-208-BUILD.md`.

## Stop Conditions

Per 3-strike rule, halt and ask Roy if any of these happen:
- Migration fails 3 times against local Supabase
- TypeScript build fails 3 times after focused fixes
- A test fails 3 times for the same root cause
- Any need to modify `.env.local`, CI workflows, or already-applied migrations
- Webhook handler refactor breaks more than 2 existing tests at once
- Discovery of architectural conflict that wasn't visible from the design doc

## Out of Scope (per DOC-208 deferred items)
- Live Stripe keys (test mode only)
- Tax handling beyond Stripe automatic
- Org-level billing (Phase 6)
- Coin gifting / transfers
- Refund flow UI (admin uses Stripe dashboard)

## Out of Scope (added by ATLAS during this build)
- Renaming `credit_coins` → `grant_coins` (would require parallel function + caller updates; DOC-208's spec is satisfied by adding `idempotency_key` parameter to existing `credit_coins`)
- Migrating webhook URL from `/api/stripe/webhook` to `/api/webhooks/stripe` (keeps existing tests + Stripe dashboard config)
- Replacing `users.membership_status` with `users.verified_active` (additive coexistence is safer; cleanup is a separate pass)
