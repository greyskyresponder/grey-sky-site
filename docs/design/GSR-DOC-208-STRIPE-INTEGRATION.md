---
doc_id: GSR-DOC-208
title: Stripe Integration — Membership Subscriptions, Coin Packs, and Billing
phase: 3
status: approved
blocks_on: [GSR-DOC-205]
priority: critical
author: Claude (Architecture Agent)
created: 2026-05-02
updated: 2026-05-02
notes: Decision Brief reviewed and locked by Roy 2026-05-02. All eight primary decisions plus two follow-ups resolved interactively. Decision Log appendix preserved at end of doc.
---

# GSR-DOC-207: Stripe Integration

| Field | Value |
|-------|-------|
| Phase | 3 |
| Status | approved |
| Blocks on | GSR-DOC-205 |
| Priority | critical |

## Purpose

DOC-207 establishes the payment infrastructure for the Grey Sky Responder Society Portal. It enables individual responders to purchase $100/year memberships and one-time Sky Coins packs through Stripe, integrates Stripe webhook events into DOC-205's append-only coin ledger with exactly-once delivery guarantees, and provides members with a self-service billing surface that respects both brand cohesion and regulatory compliance.

This is critical-path infrastructure for public launch. Without it, no member can pay, no coin can be granted from a real transaction, and no verification economy exists. It is also security-sensitive: the Stripe webhook handler is the single most attractive target for an attacker seeking to inflate coin balances or bypass payment, and the design treats it accordingly.

DOC-207 is bounded to individual responder billing only. Organization and agency billing follow a different commercial model (sponsorship-based, often invoiced rather than card-charged) and are deferred to DOC-600. QRB reviewer payouts via Stripe Connect are deferred to a future doc.

## Data Entities

### New tables

#### `stripe_events`

Idempotency log for all webhook deliveries. The Stripe event ID is the primary key, which makes duplicate inserts impossible at the database level. Every webhook delivery attempts to insert before processing; on conflict, the handler returns 200 OK without re-processing.

```sql
CREATE TABLE public.stripe_events (
  event_id TEXT PRIMARY KEY,
  event_type TEXT NOT NULL,
  livemode BOOLEAN NOT NULL,
  api_version TEXT,
  received_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  processed_at TIMESTAMPTZ,
  processing_status TEXT NOT NULL DEFAULT 'received'
    CHECK (processing_status IN ('received', 'processing', 'completed', 'failed', 'skipped')),
  processing_error TEXT,
  payload JSONB NOT NULL,
  retry_count INT NOT NULL DEFAULT 0
);

CREATE INDEX idx_stripe_events_type ON public.stripe_events(event_type);
CREATE INDEX idx_stripe_events_received ON public.stripe_events(received_at DESC);
CREATE INDEX idx_stripe_events_status ON public.stripe_events(processing_status)
  WHERE processing_status IN ('received', 'processing', 'failed');
```

#### `processed_idempotency_keys`

Auxiliary idempotency table consumed by DOC-205's atomic ledger functions. Stripe event IDs are passed as idempotency keys when granting or reversing coins. This table is populated by the ledger functions themselves and acts as the second layer of defense against duplicate ledger writes.

```sql
CREATE TABLE public.processed_idempotency_keys (
  idempotency_key TEXT PRIMARY KEY,
  operation TEXT NOT NULL,
  ledger_entry_id BIGINT,
  processed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_processed_idempotency_operation ON public.processed_idempotency_keys(operation);
```

#### `stripe_subscriptions`

Mirror of Stripe subscription state, updated from webhook events. The source of truth remains Stripe; this table exists for query performance, dashboard rendering, and offline-resilient verification lookups.

```sql
CREATE TABLE public.stripe_subscriptions (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
  stripe_subscription_id TEXT NOT NULL UNIQUE,
  stripe_customer_id TEXT NOT NULL,
  stripe_price_id TEXT NOT NULL,
  status TEXT NOT NULL
    CHECK (status IN ('trialing', 'active', 'past_due', 'canceled', 'unpaid', 'incomplete', 'incomplete_expired', 'paused')),
  current_period_start TIMESTAMPTZ NOT NULL,
  current_period_end TIMESTAMPTZ NOT NULL,
  cancel_at_period_end BOOLEAN NOT NULL DEFAULT false,
  canceled_at TIMESTAMPTZ,
  grace_period_started_at TIMESTAMPTZ,
  grace_period_ends_at TIMESTAMPTZ,
  spending_blocked BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_stripe_subs_user ON public.stripe_subscriptions(user_id);
CREATE INDEX idx_stripe_subs_status ON public.stripe_subscriptions(status);
CREATE INDEX idx_stripe_subs_period_end ON public.stripe_subscriptions(current_period_end);
CREATE INDEX idx_stripe_subs_grace ON public.stripe_subscriptions(grace_period_ends_at)
  WHERE grace_period_ends_at IS NOT NULL;
```

#### `stripe_invoices`

Cached invoice metadata for billing dashboard rendering. Invoice PDFs are fetched on-demand from Stripe; we cache the metadata for fast list rendering.

```sql
CREATE TABLE public.stripe_invoices (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
  stripe_invoice_id TEXT NOT NULL UNIQUE,
  stripe_customer_id TEXT NOT NULL,
  stripe_subscription_id TEXT,
  amount_paid_cents INT NOT NULL,
  amount_due_cents INT NOT NULL,
  currency TEXT NOT NULL DEFAULT 'usd',
  status TEXT NOT NULL
    CHECK (status IN ('draft', 'open', 'paid', 'uncollectible', 'void')),
  invoice_number TEXT,
  hosted_invoice_url TEXT,
  invoice_pdf_url TEXT,
  paid_at TIMESTAMPTZ,
  period_start TIMESTAMPTZ,
  period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_stripe_invoices_user ON public.stripe_invoices(user_id);
CREATE INDEX idx_stripe_invoices_paid ON public.stripe_invoices(paid_at DESC);
```

#### `stripe_coin_pack_purchases`

Audit trail for one-time coin pack purchases. References the resulting ledger entry in DOC-205's `coin_ledger`.

```sql
CREATE TABLE public.stripe_coin_pack_purchases (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
  stripe_payment_intent_id TEXT NOT NULL UNIQUE,
  stripe_checkout_session_id TEXT NOT NULL,
  pack_sku TEXT NOT NULL
    CHECK (pack_sku IN ('coins_100', 'coins_500', 'coins_1000', 'coins_2500')),
  coins_granted INT NOT NULL,
  amount_paid_cents INT NOT NULL,
  ledger_entry_id BIGINT,
  refunded_at TIMESTAMPTZ,
  refund_ledger_entry_id BIGINT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_coin_pack_purchases_user ON public.stripe_coin_pack_purchases(user_id);
CREATE INDEX idx_coin_pack_purchases_created ON public.stripe_coin_pack_purchases(created_at DESC);
```

### Modified tables

#### `public.users`

Add Stripe customer linkage and verified-active flag for billing-state-aware verification responses.

```sql
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS verified_active BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS verified_active_until TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_users_stripe_customer ON public.users(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_users_verified_active ON public.users(verified_active)
  WHERE verified_active = true;
```

The `verified_active` boolean is the single field consumed by third-party verification endpoints (per DOC-202's verification-only model). It is set true on first successful membership payment, remains true through grace period, and is set false only on full deactivation. The `verified_active_until` mirrors `current_period_end` plus the grace window, allowing offline reasoning about expiration.

### TypeScript types

Place in `lib/types/stripe.ts`:

```typescript
export type StripeSubscriptionStatus =
  | 'trialing'
  | 'active'
  | 'past_due'
  | 'canceled'
  | 'unpaid'
  | 'incomplete'
  | 'incomplete_expired'
  | 'paused';

export type CoinPackSku = 'coins_100' | 'coins_500' | 'coins_1000' | 'coins_2500';

export interface CoinPack {
  sku: CoinPackSku;
  coins: number;
  priceCents: number;
  displayLabel: string;
  stripePriceId: string;
}

export interface StripeSubscription {
  id: number;
  userId: string;
  stripeSubscriptionId: string;
  stripeCustomerId: string;
  stripePriceId: string;
  status: StripeSubscriptionStatus;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  canceledAt: string | null;
  gracePeriodStartedAt: string | null;
  gracePeriodEndsAt: string | null;
  spendingBlocked: boolean;
}

export interface StripeInvoiceSummary {
  id: number;
  stripeInvoiceId: string;
  amountPaidCents: number;
  status: 'draft' | 'open' | 'paid' | 'uncollectible' | 'void';
  invoiceNumber: string | null;
  invoicePdfUrl: string | null;
  paidAt: string | null;
  periodStart: string | null;
  periodEnd: string | null;
}

export interface BillingDashboardData {
  hasActiveSubscription: boolean;
  subscription: StripeSubscription | null;
  paymentMethodLast4: string | null;
  paymentMethodBrand: string | null;
  recentInvoices: StripeInvoiceSummary[];
  customerPortalUrl: string | null;
  inGracePeriod: boolean;
  gracePeriodEndsAt: string | null;
  spendingBlocked: boolean;
}
```

### Stripe product/price configuration

DOC-207 build creates the following in Stripe (test mode initially):

| Product | Type | Price | Stripe SKU lookup_key |
|---------|------|-------|------------------------|
| Grey Sky Responder Society Annual Membership | Subscription, yearly | $100.00 USD | `gsr_membership_annual` |
| 100 Sky Coins Pack | One-time | $10.00 USD | `coins_100` |
| 500 Sky Coins Pack | One-time | $50.00 USD | `coins_500` |
| 1,000 Sky Coins Pack | One-time | $100.00 USD | `coins_1000` |
| 2,500 Sky Coins Pack | One-time | $250.00 USD | `coins_2500` |

Lookup keys are used for code-side price retrieval, allowing price IDs to be regenerated (for environment promotion) without code changes.

## Structure

### File tree to create or modify

```
app/
  (member)/
    billing/
      page.tsx                          [NEW] Billing dashboard (server component)
      _components/
        billing-summary.tsx             [NEW] Plan + renewal display
        invoice-list.tsx                [NEW] Invoice history with PDF links
        payment-method-card.tsx         [NEW] Last-4 display, "Manage" CTA
        grace-period-banner.tsx         [NEW] Shown when in grace period
        manage-billing-button.tsx       [NEW] Server action → Customer Portal redirect
    coins/
      _components/
        coin-pack-grid.tsx              [NEW] Four-pack purchase UI
        coin-pack-card.tsx              [NEW] Individual pack tile
  api/
    webhooks/
      stripe/
        route.ts                        [NEW] Stripe webhook handler (POST)
    checkout/
      membership/
        route.ts                        [NEW] Create Checkout session for membership
      coin-pack/
        route.ts                        [NEW] Create Checkout session for coin pack
    billing/
      portal/
        route.ts                        [NEW] Create Customer Portal session
      checkout-success/
        route.ts                        [NEW] Post-checkout return handler

lib/
  stripe/
    client.ts                           [NEW] Stripe SDK singleton
    config.ts                           [NEW] Coin pack catalog, price lookup keys
    checkout.ts                         [NEW] createMembershipCheckout, createCoinPackCheckout
    portal.ts                           [NEW] createCustomerPortalSession
    invoices.ts                         [NEW] listUserInvoices, fetchInvoicePdfUrl
    customer.ts                         [NEW] getOrCreateStripeCustomer
    webhook-handlers/
      index.ts                          [NEW] Event router
      invoice-payment-succeeded.ts      [NEW] Membership renewal grant
      invoice-payment-failed.ts         [NEW] Grace period entry
      checkout-session-completed.ts     [NEW] Coin pack purchase grant
      customer-subscription-updated.ts  [NEW] Subscription state sync
      customer-subscription-deleted.ts  [NEW] Full deactivation
      charge-refunded.ts                [NEW] Refund reversal
  types/
    stripe.ts                           [NEW] TypeScript types from this doc

supabase/
  migrations/
    YYYYMMDDHHMMSS_stripe_integration.sql              [NEW] Tables + columns
    YYYYMMDDHHMMSS_idempotency_aware_ledger.sql        [NEW] Conditional DOC-205 patch

scripts/
  setup-stripe-products.ts              [NEW] One-time product/price creation
  verify-doc205-signatures.ts           [NEW] DOC-205 function signature inspector
```

### Route definitions

| Route | Method | Purpose | Auth |
|-------|--------|---------|------|
| `/api/webhooks/stripe` | POST | Stripe webhook receiver | Stripe signature only |
| `/api/checkout/membership` | POST | Create membership Checkout session | Member |
| `/api/checkout/coin-pack` | POST | Create coin pack Checkout session | Member |
| `/api/billing/portal` | POST | Create Customer Portal session | Member |
| `/api/billing/checkout-success` | GET | Post-checkout success landing | Member |
| `/billing` (member) | — | Billing dashboard view | Member |
| `/coins` (member, existing) | — | Add coin pack purchase tiles | Member |

### Component tree

```
app/(member)/billing/page.tsx (Server Component)
└── BillingSummary
    ├── GracePeriodBanner (conditional)
    ├── PaymentMethodCard
    ├── InvoiceList
    │   └── InvoiceRow × N
    └── ManageBillingButton (Server Action)

app/(member)/coins/page.tsx (existing, additive)
└── CoinPackGrid
    └── CoinPackCard × 4
        └── PurchaseButton (POST /api/checkout/coin-pack)
```

## Business Rules

### Coin granting rules

1. **Membership initial purchase** — On `checkout.session.completed` for a membership Checkout session, grant 1,000 coins to the member's ledger via DOC-205's `grant_coins(user_id, amount, source, idempotency_key)` function. Idempotency key = Stripe event ID. Source = `'membership_initial_purchase'`. Concurrent with the grant, set `users.verified_active = true` and `users.verified_active_until = current_period_end + 14 days`.

2. **Membership renewal** — On `invoice.payment_succeeded` where the invoice's billing reason is `subscription_cycle`, grant 1,000 coins. Source = `'membership_renewal'`. Update `verified_active_until`.

3. **Coin pack purchase** — On `checkout.session.completed` for a coin pack session, grant the pack's coin count. Source = `'coin_pack_purchase'`. Insert audit row in `stripe_coin_pack_purchases`.

4. **Refund handling** — On `charge.refunded`, look up the original purchase. If a coin pack: reverse the grant via DOC-205's `reverse_coin_grant(original_ledger_entry_id, idempotency_key)` function. If a membership invoice: this is a policy decision deferred to Roy — DOC-207 logs the refund event but takes no automatic coin action on membership refunds. The handler emits a `MEMBERSHIP_REFUND_REQUIRES_REVIEW` notification for manual triage.

5. **No coin grant happens outside webhook handlers.** The Checkout success page is purely cosmetic — it shows "thanks, processing" and polls or waits for the webhook to complete. Granting coins from the success page would create a path where a closed/blocked webhook delivery still produces coins, which violates ledger integrity.

### Subscription lifecycle and verified-active state

| Stripe Event | DB Update | verified_active | spending_blocked |
|--------------|-----------|------------------|--------------------|
| `customer.subscription.created` (active) | Insert subscription row, status=active | true | false |
| `invoice.payment_succeeded` | current_period_end advanced | true | false |
| `invoice.payment_failed` (first failure) | status=past_due, grace_period_started_at=now, grace_period_ends_at=now+14d | true | true |
| `invoice.payment_succeeded` (during grace) | status=active, clear grace fields | true | false |
| Grace period expiration (cron) | status=canceled, full deactivation | false | true |
| `customer.subscription.deleted` | status=canceled | false | true |
| `customer.subscription.updated` (cancel_at_period_end=true) | cancel_at_period_end=true, status unchanged | true (until period_end) | false |

Grace period expiration is handled by a scheduled task (Supabase pg_cron or equivalent) that runs daily and processes subscriptions where `grace_period_ends_at < now()` and `status = 'past_due'`.

### Spending block enforcement

When `spending_blocked = true` on a member's subscription:

- **Allowed:** Read profile, view past records, view billing, update payment method, view existing in-flight validation/evaluation requests
- **Blocked:** Request validation (10 coins), request evaluation (15 coins), purchase certifications, file new ICS-222 reports against active deployments, any action that creates a new coin debit

The block is enforced at the DOC-205 ledger function layer — every `spend_coins()` call checks the calling user's `spending_blocked` flag and rejects if true. This is the canonical enforcement point; UI-side disables are a courtesy, not a security boundary.

In-flight requests at the moment of soft cutoff complete normally per the locked decision. Their coin debits already occurred; the validator/evaluator can still respond; the resulting service history record still gets created.

### Webhook signature verification

Every webhook request must:

1. Read raw request body via `await req.text()` before any JSON parsing
2. Read the `stripe-signature` header
3. Verify the signature using `stripe.webhooks.constructEvent(rawBody, signature, webhookSecret)` from the Stripe SDK
4. On verification failure: return HTTP 400 immediately with body `{"error": "invalid_signature"}`. Do not log the body. Do not insert into `stripe_events`.
5. On verification success: proceed with idempotency check and processing

The webhook secret is read from environment variable `STRIPE_WEBHOOK_SECRET`. There is no fallback. There is no development bypass. If the secret is missing in production, the handler returns 500 and the event is never processed (Stripe will retry).

### Idempotency processing flow

For each verified webhook event:

1. Attempt `INSERT INTO stripe_events(event_id, event_type, livemode, payload, processing_status='received')`. On conflict (duplicate event_id): return 200 OK without further processing.
2. On successful insert: update row to `processing_status='processing'`, dispatch to event-type-specific handler.
3. Handler performs business logic, calling DOC-205 ledger functions with `idempotency_key=stripe_event_id`. Ledger functions consult `processed_idempotency_keys` and skip if already present.
4. On handler success: update `stripe_events.processing_status='completed'`, set `processed_at`. Return 200 OK.
5. On handler failure: update `stripe_events.processing_status='failed'`, set `processing_error`, increment `retry_count`. Return 500 to trigger Stripe retry.
6. If `retry_count > 5`: update to `processing_status='failed'` permanently and emit alert. Stripe gives up after ~3 days regardless.

### Tax handling

Stripe Tax is enabled on all Checkout sessions via `automatic_tax: { enabled: true }`. Customer addresses are collected at checkout (Stripe Checkout default behavior). Tax calculation, collection, and reporting are handled by Stripe Tax. DOC-207 build ships with Stripe Tax integration plumbed in test mode; production activation is a configuration toggle that requires explicit Roy approval after one month of test-mode data review.

### PCI scope discipline

DOC-207 maintains SAQ-A scope. To preserve this:

- Raw card data never reaches Grey Sky servers. Stripe Checkout collects all payment information on Stripe-hosted pages.
- The Customer Portal (Decision 6 hybrid: change actions delegated) is also Stripe-hosted, preserving SAQ-A.
- Card metadata stored locally is limited to last-4 digits and brand, both of which are non-sensitive per PCI DSS.
- `stripe_customer_id` and `stripe_subscription_id` are not PCI-protected data; they are Stripe identifiers, safe to store.

## Copy Direction

### Membership purchase CTA (public membership page, future DOC-101)

**Headline:** "Become a Verified Member"
**Subhead:** "$100 a year. Includes 1,000 Sky Coins. Cancel anytime."
**Body:** Operational and direct. Frame the membership as joining a society of people who serve, not as buying a product.

### Auto-renewal disclosure at checkout

Above the Checkout button, in plain language:

> "Your membership renews each year for $100 until you cancel. You'll get a reminder before each renewal. Cancel any time from your billing dashboard."

This satisfies FTC click-to-cancel disclosure requirements and matches the operational-authority tone — no fine print, no dark patterns.

### Coin pack purchase tiles

| SKU | Headline | Sub-line |
|-----|----------|----------|
| coins_100 | "100 Sky Coins" | "$10 — for occasional needs" |
| coins_500 | "500 Sky Coins" | "$50 — covers a typical year of activity" |
| coins_1000 | "Top up: 1,000 Sky Coins" | "$100 — same as a year of membership" |
| coins_2500 | "2,500 Sky Coins" | "$250 — for active validators and certification candidates" |

Avoid promotional language ("Best value!", "Most popular!"). Members are professionals making a purchasing decision, not retail customers being optimized.

### Grace period banner

When `spending_blocked = true` and within grace period:

> **Heads up — your last payment didn't go through.**
> Your membership is still active for verification, but you can't request validations or evaluations until your payment method is updated. Stripe is automatically retrying. You have until [DATE] to resolve this before your membership lapses.
>
> [Update payment method →]

Tone: matter-of-fact. Not panicky, not corporate. The member is a professional who can handle a clear status report.

### Verification endpoint copy (third-party-facing, future doc reference)

When a third party looks up a member during their grace period, the response shows them as **active**. This is intentional. Third parties do not need to know about billing transients. DOC-401/403 verification endpoints are billing-state-naive by design.

### Refund policy

DOC-207 references but does not author refund policy text. The application includes a placeholder URL `/legal/refunds` in Customer Portal configuration. Roy provides actual policy copy separately.

## Acceptance Criteria

1. Migration `stripe_integration.sql` runs cleanly against a fresh DOC-205-complete database. All five new tables exist; `users` has `stripe_customer_id`, `verified_active`, `verified_active_until` columns. RLS policies are in place on all new tables (members read own rows; platform_admin reads all; service role writes).

2. Migration `idempotency_aware_ledger.sql` first inspects existing DOC-205 ledger function signatures via the verification script. If `idempotency_key` parameter is absent, the migration adds it. If present, the migration is a no-op for the function signature but still creates `processed_idempotency_keys` table (which is unconditional).

3. `scripts/setup-stripe-products.ts` runs once against a Stripe test-mode account and creates: one Product + Price for annual membership (`gsr_membership_annual`), four Products + Prices for coin packs (`coins_100`, `coins_500`, `coins_1000`, `coins_2500`). Outputs the resulting price IDs to console for `.env.local` configuration.

4. POST `/api/checkout/membership` with an authenticated member returns a Checkout session URL. Visiting the URL renders Stripe's hosted checkout with the $100/year subscription line item, automatic tax enabled, and the auto-renewal disclosure visible.

5. POST `/api/checkout/coin-pack` with a valid `pack_sku` and authenticated member returns a Checkout session URL for the appropriate one-time price.

6. POST `/api/webhooks/stripe` rejects requests with missing or invalid signatures with HTTP 400 and no database side effects.

7. POST `/api/webhooks/stripe` with a valid `checkout.session.completed` event for a membership purchase: inserts row in `stripe_events`, creates row in `stripe_subscriptions` with status=active, sets `users.verified_active=true`, calls DOC-205 `grant_coins` with 1,000 coins and the event ID as idempotency key, returns 200.

8. Replaying the same `checkout.session.completed` event a second time returns 200 with no additional database writes (idempotency confirmed at both `stripe_events` and `processed_idempotency_keys` layers).

9. POST `/api/webhooks/stripe` with `invoice.payment_failed`: updates subscription to `status=past_due`, sets `grace_period_started_at` and `grace_period_ends_at = now + 14 days`, sets `spending_blocked=true`, leaves `verified_active=true`.

10. POST `/api/webhooks/stripe` with `invoice.payment_succeeded` during grace period: clears grace fields, sets `status=active`, sets `spending_blocked=false`, calls `grant_coins` for the renewal cycle.

11. Daily cron job (or equivalent scheduled task) processes subscriptions where `grace_period_ends_at < now()` and `status = 'past_due'`: sets `status=canceled`, `verified_active=false`, leaves `spending_blocked=true`.

12. POST `/api/webhooks/stripe` with `charge.refunded` for a coin pack purchase: reverses the original coin grant via `reverse_coin_grant`, sets `refunded_at` and `refund_ledger_entry_id` on the purchase row.

13. POST `/api/webhooks/stripe` with `charge.refunded` for a membership invoice: logs the event, emits `MEMBERSHIP_REFUND_REQUIRES_REVIEW` notification, takes no automatic coin action.

14. `/billing` member route renders: current plan name, renewal date, payment method last-4 + brand, list of recent invoices with downloadable PDF links (PDFs fetched on-demand from Stripe), "Manage in Stripe" button.

15. Clicking "Manage in Stripe" creates a Customer Portal session and redirects to it. The portal allows updating payment method, canceling subscription, and downloading invoices.

16. Coin pack grid renders four tiles on `/coins` with correct prices ($10/$50/$100/$250), correct coin counts (100/500/1000/2500), and the locked copy from this doc.

17. Attempting to call DOC-205 `spend_coins` for a member with `spending_blocked=true` returns an error and produces no ledger entry.

18. In-flight validation request created before a soft cutoff completes normally even after `spending_blocked` becomes true — the original debit stands, the validator can respond, the service history record is created.

19. All Stripe SDK calls use the API version specified in `lib/stripe/client.ts` (pinned, not auto-upgraded).

20. No raw card data appears in any log, database column, or application code. Grep across the repo for "card_number", "cvc", "cvv" returns zero matches outside dependency files.

## Agent Lenses

### Baseplate (data/architecture)

- All five new tables have explicit primary keys, appropriate indexes, and foreign key relationships to `public.users` with `ON DELETE RESTRICT` (deleting a user with billing history would create orphaned Stripe records — better to fail loudly).
- The two-layer idempotency design (`stripe_events` PK + `processed_idempotency_keys` consumed by ledger functions) creates defense in depth against duplicate processing without introducing distributed locks.
- The `stripe_subscriptions` table mirrors Stripe state but does not pretend to be authoritative — every consumer that needs guaranteed-fresh data calls Stripe directly. This is the right tradeoff: cached state for performance, live calls for correctness-sensitive operations.
- `verified_active` on `users` is denormalized intentionally. The third-party verification lookup is a hot path; joining through subscriptions on every check is wasteful. The webhook handler is responsible for keeping this column in sync, and the daily cron catches any drift.
- All `created_at` timestamps use `TIMESTAMPTZ DEFAULT now()` per Postgres time-zone discipline.

### Meridian (doctrine)

- DOC-207 contains no FEMA NQS or RTLT-typed terminology because this is pure billing infrastructure. There are no positions, no team types, no incident references in this doc.
- The "verified active" terminology aligns with NREMT's verification model (which DOC-202 already references), where third parties confirm certification status by name + ID without seeing financial state.
- The grace period concept does not appear in NIMS doctrine because billing is not a NIMS concern. The doctrine alignment here is to the verification ecosystem, not to incident management.
- No Florida-specific or FDEM-specific logic in this doc — Stripe billing is national infrastructure.

### Lookout (UX)

- The billing dashboard is intentionally minimal: one screen, four pieces of information (plan, renewal date, payment method, invoices), one CTA ("Manage in Stripe"). A responder under stress is not on the billing page; this surface is for once-a-year administration.
- The grace period banner is the only place where billing state intrudes on member workflow, and it appears only when action is required. Grace is communicated factually with a clear deadline and a single CTA.
- The coin pack grid uses fixed denominations to eliminate the "how much should I buy?" decision overhead. Members see four tiles and pick one in under three seconds.
- Auto-renewal disclosure uses plain language at the point of decision, not buried in terms of service. This is both an FTC requirement and good design.

### Threshold (security)

- Webhook signature verification is mandatory and fails closed. No development bypass exists. Missing webhook secret in any environment produces 500, not silent acceptance.
- Raw request body must be read before parsing. The Next.js Route Handler implementation explicitly uses `await req.text()` and the Stripe SDK's `constructEvent`, never `await req.json()`. This is documented in code comments because future maintainers will be tempted to "simplify."
- The two-layer idempotency design defends against the highest-value attack on the platform: webhook replay to inflate coin balances. An attacker who somehow obtained a valid signed webhook payload still cannot replay it for additional coins because `stripe_events.event_id` is a primary key.
- Spending block enforcement happens at the DOC-205 ledger layer, not the UI layer. UI disables are courtesy; the database is the security boundary.
- The `MEMBERSHIP_REFUND_REQUIRES_REVIEW` notification on membership refunds prevents an automated path where a refunded membership leaves an active verification status. Manual triage is the right call here — membership refunds are infrequent and the policy is unsettled.
- PCI scope is preserved at SAQ-A. No card data ever touches Grey Sky infrastructure. The Customer Portal redirect (Decision 6 hybrid) is the deliberate mechanism for keeping change-action surfaces on Stripe-hosted pages.
- Stripe SDK API version is pinned. Auto-upgrade of the API version would silently change webhook payload shapes and is forbidden.

## Decision Log

This appendix records the architectural decisions made during the Decision Brief session preceding this doc. Future maintainers reading this doc three weeks or three years from now should look here to understand *why* the doc is shaped this way.

| # | Decision | Choice | Reasoning anchor |
|---|----------|--------|------------------|
| 0 | Stripe account state at build time | Test mode, no products yet | DOC-207 includes initial product/price creation script |
| 1 | Checkout surface | Stripe Checkout (hosted) for v1; Payment Element planned for v2 | Lowest PCI surface area; Stripe maintains conversion-optimized UI; matches nation-state threat posture by minimizing attack surface near payment |
| 2 | Subscription model | Auto-renewing annual subscription | Industry standard for professional societies (IAEM, NREMT, PMI); auto-renewal retention significantly outperforms manual renewal; FTC click-to-cancel compliance via Customer Portal makes cancellation friction-free |
| 3 | Webhook idempotency | Two-layer: `stripe_events` PK + `idempotency_key` to DOC-205 ledger functions | Stripe's documented best practice is event-ID logging; PK alone has a race window between concurrent deliveries; ledger-layer idempotency closes the window |
| 4 | Coin pack denominations | Fixed: 100 / 500 / 1,000 / 2,500 | Preserves $1 = 10 coins invariant from DOC-205; bonus tiers would break the invariant and complicate refund math; ledger clarity over conversion optimization |
| 5 | Failed payment handling | Soft cutoff with 14-day grace; verified-active maintained, spending blocked | Third-party verification consumers should not see false negatives from billing transients; Stripe Smart Retries recover ~40% of failures within retry window; the verification ecosystem is the unique constraint that distinguishes Grey Sky from typical SaaS billing |
| 6 | Self-service surface | Hybrid — view-only on greysky.dev, redirect to Customer Portal for changes | Brand cohesion on the read path; Stripe handles compliance-sensitive change flows (cancellation, FTC click-to-cancel, payment method updates); minimizes surface we maintain |
| 7 | Tax handling | Stripe Tax in test mode initially; production activation gated on accountant review | Sales tax on professional society memberships and digital services is jurisdiction-dependent; Stripe Tax cost (0.5%) is cheap insurance; one month of test-mode data informs the live decision |
| 8 | Webhook endpoint | Next.js Route Handler at `/api/webhooks/stripe` on Azure SWA | Single deployment surface; same Supabase connection pool; Stripe webhook delivery is robust enough for single-handler design at launch volume; migration path to dedicated handler exists if needed |
| F-A | Billing dashboard view scope | Standard view: plan, renewal, last-4, full invoice history with PDFs, "Manage in Stripe" CTA | Invoice history is the most-asked-for billing feature; Stripe makes invoice PDFs trivially fetchable; upcoming invoice previews and proration calculations are over-engineered for annual billing |
| F-B | DOC-205 idempotency parameter status | Verify-then-migrate at build time | Avoids assuming current DOC-205 function signatures; migration is additive and safe whether the parameter exists or not |

**Dissent on record:** None. All decisions align with architecture recommendations.

**Standing constraints reaffirmed in this doc:**
- Append-only ledger discipline (no DELETE on coin entries; refunds are negative grants)
- Pronouns field never reintroduced
- Nation-state threat model applied to webhook security
- PCI SAQ-A scope preserved (no raw card data on Grey Sky infrastructure)

## Claude Code Prompt

You are Claude Code, executing GSR-DOC-207 against the `greyskyresponder/grey-sky-site` repository. This prompt is self-contained. Do not reference other GSR-DOC files; everything you need is here.

### Stack context

- Next.js 16.1.6, App Router, React 19, TypeScript 5
- Supabase (Postgres 16 + PostGIS, RLS-enforced)
- Tailwind CSS 4
- Hosted on Azure Static Web Apps
- Brand tokens: Command Navy `#0A1628`, Signal Gold `#C5933A`, Ops White `#F5F5F5`
- Existing DOC-205 (Sky Coins economy) is deployed; this build extends it

### Dependencies to add

```bash
npm install stripe@^17.0.0 @stripe/stripe-js@^4.0.0
```

Pin the major versions. Do not use `latest`.

### Environment variables to document

Add to `.env.example` (do not commit real values):

```
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_MEMBERSHIP_ANNUAL=price_...
STRIPE_PRICE_COINS_100=price_...
STRIPE_PRICE_COINS_500=price_...
STRIPE_PRICE_COINS_1000=price_...
STRIPE_PRICE_COINS_2500=price_...
NEXT_PUBLIC_APP_URL=https://greysky.dev
```

### Build sequence

Execute in this order. Do not parallelize within this prompt — each step depends on the previous.

#### Step 1: Verification script for DOC-205

Create `scripts/verify-doc205-signatures.ts` that connects to the Supabase database and inspects existing function signatures. Output to console:
- Whether function `grant_coins` exists, and whether it accepts an `idempotency_key TEXT` parameter
- Whether function `spend_coins` exists, and whether it accepts an `idempotency_key TEXT` parameter
- Whether function `reverse_coin_grant` exists; if not, flag it for creation in this build

Use `pg_get_function_arguments(oid)` from `pg_proc` joined to `pg_namespace` for the inspection. Output structured JSON for parsing.

Run this script and store the output. The next step's migration depends on it.

#### Step 2: Database migrations

Create `supabase/migrations/{timestamp}_stripe_integration.sql` containing:

- `stripe_events` table (full DDL from Data Entities section above)
- `processed_idempotency_keys` table
- `stripe_subscriptions` table
- `stripe_invoices` table
- `stripe_coin_pack_purchases` table
- ALTER TABLE on `public.users` adding `stripe_customer_id`, `verified_active`, `verified_active_until` columns
- All indexes from the Data Entities section
- RLS policies on all new tables:
  - Members can SELECT rows where `user_id = auth.uid()`
  - `platform_admin` role (use existing `is_platform_admin()` helper from DOC-205) can SELECT all
  - INSERT/UPDATE/DELETE restricted to service role only — webhook handler uses service role client

Create `supabase/migrations/{timestamp+1}_idempotency_aware_ledger.sql` that:

- ALWAYS creates `processed_idempotency_keys` if not already created in the previous migration (defensive — in case migrations are run out of order)
- IF the verification script from Step 1 reported that `grant_coins` or `spend_coins` lack the `idempotency_key` parameter: ALTER the function signatures to add `p_idempotency_key TEXT DEFAULT NULL` as the trailing parameter
- IF the verification reported `reverse_coin_grant` does not exist: CREATE OR REPLACE that function with signature `(p_original_ledger_entry_id BIGINT, p_idempotency_key TEXT, p_reason TEXT)` that inserts a compensating negative entry referencing the original
- All function bodies must consult `processed_idempotency_keys` before performing the ledger write; on existing key, return the previously recorded result without writing

If the verification script reports all parameters are already present, this migration is effectively a no-op except for the `processed_idempotency_keys` safety creation.

Run the migrations against a local Supabase instance with `npx supabase db reset` to verify clean execution. Then push to staging.

#### Step 3: Stripe SDK setup and types

Create `lib/stripe/client.ts`:

```typescript
import Stripe from 'stripe';

const apiKey = process.env.STRIPE_SECRET_KEY;
if (!apiKey) {
  throw new Error('STRIPE_SECRET_KEY is required');
}

export const stripe = new Stripe(apiKey, {
  apiVersion: '2024-12-18.acacia', // Pinned. Do not auto-upgrade.
  typescript: true,
});
```

Create `lib/stripe/config.ts` with the coin pack catalog as a const array, mapping SKU → coins → priceCents → env var name for the Stripe price ID. Export a `getCoinPack(sku: CoinPackSku)` helper.

Create `lib/types/stripe.ts` with the full TypeScript type definitions from the Data Entities section above.

#### Step 4: One-time setup script

Create `scripts/setup-stripe-products.ts` that uses the Stripe SDK to create the five products and prices listed in the Data Entities section. Use `lookup_key` on each price for code-side retrieval. Output the resulting price IDs to console with copy-paste-ready `.env.local` lines.

The script must be idempotent: if a product with the same lookup_key already exists, skip creation and report the existing ID. Use Stripe's `prices.list({ lookup_keys: [...] })` to check before creation.

#### Step 5: Customer creation helper

Create `lib/stripe/customer.ts` exporting `getOrCreateStripeCustomer(userId: string, email: string, name: string): Promise<string>`. Implementation:

- SELECT `stripe_customer_id` from `users` WHERE id = userId
- If present, return it
- If absent, call `stripe.customers.create({ email, name, metadata: { user_id: userId } })`, UPDATE the user row with the new ID, return it

This is the only path that creates Stripe customers. It is called by both Checkout creation routes.

#### Step 6: Checkout session creation

Create `app/api/checkout/membership/route.ts` (POST handler):

- Authenticate the request via Supabase auth
- Call `getOrCreateStripeCustomer`
- Create a Checkout session: mode=`subscription`, line_items=[{ price: env.STRIPE_PRICE_MEMBERSHIP_ANNUAL, quantity: 1 }], customer=stripeCustomerId, success_url=`${appUrl}/api/billing/checkout-success?session_id={CHECKOUT_SESSION_ID}`, cancel_url=`${appUrl}/membership`, automatic_tax={enabled: true}, billing_address_collection='required', subscription_data={ metadata: { user_id: userId } }
- Return JSON `{ url: session.url }`

Create `app/api/checkout/coin-pack/route.ts` (POST handler) with similar pattern but mode=`payment`, line_items derived from request body's `pack_sku` parameter, payment_intent_data.metadata containing `user_id` and `pack_sku`.

Both routes validate the authenticated user has not been deleted/banned (check `users.status` if such a column exists; else just verify auth.uid() resolves to a row).

#### Step 7: Webhook handler

Create `app/api/webhooks/stripe/route.ts` (POST handler). This is the most security-critical file in the build.

Implementation skeleton:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe/client';
import { handleStripeEvent } from '@/lib/stripe/webhook-handlers';
import { createServiceClient } from '@/lib/supabase/service';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return NextResponse.json({ error: 'misconfigured' }, { status: 500 });
  }

  // CRITICAL: Read raw body before any parsing.
  // Stripe signature is computed over the original bytes.
  // Do NOT use req.json() here.
  const rawBody = await req.text();
  const signature = req.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'missing_signature' }, { status: 400 });
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err) {
    return NextResponse.json({ error: 'invalid_signature' }, { status: 400 });
  }

  const supabase = createServiceClient();

  // Idempotency check via stripe_events PK
  const { error: insertError } = await supabase
    .from('stripe_events')
    .insert({
      event_id: event.id,
      event_type: event.type,
      livemode: event.livemode,
      api_version: event.api_version,
      payload: event,
      processing_status: 'received',
    });

  if (insertError) {
    if (insertError.code === '23505') {
      // Duplicate event - already received
      return NextResponse.json({ received: true, duplicate: true });
    }
    return NextResponse.json({ error: 'db_error' }, { status: 500 });
  }

  try {
    await supabase
      .from('stripe_events')
      .update({ processing_status: 'processing' })
      .eq('event_id', event.id);

    await handleStripeEvent(event, supabase);

    await supabase
      .from('stripe_events')
      .update({
        processing_status: 'completed',
        processed_at: new Date().toISOString(),
      })
      .eq('event_id', event.id);

    return NextResponse.json({ received: true });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'unknown';
    await supabase
      .from('stripe_events')
      .update({
        processing_status: 'failed',
        processing_error: errorMessage,
      })
      .eq('event_id', event.id);

    return NextResponse.json({ error: 'processing_failed' }, { status: 500 });
  }
}
```

#### Step 8: Event handlers

Create `lib/stripe/webhook-handlers/index.ts` with a router:

```typescript
export async function handleStripeEvent(event: Stripe.Event, supabase: ServiceClient) {
  switch (event.type) {
    case 'checkout.session.completed':
      return handleCheckoutSessionCompleted(event, supabase);
    case 'invoice.payment_succeeded':
      return handleInvoicePaymentSucceeded(event, supabase);
    case 'invoice.payment_failed':
      return handleInvoicePaymentFailed(event, supabase);
    case 'customer.subscription.updated':
      return handleSubscriptionUpdated(event, supabase);
    case 'customer.subscription.deleted':
      return handleSubscriptionDeleted(event, supabase);
    case 'charge.refunded':
      return handleChargeRefunded(event, supabase);
    default:
      // Unhandled event type — mark skipped, do not error
      return;
  }
}
```

Create each handler in its own file under `lib/stripe/webhook-handlers/`. Each handler implements the corresponding row from the Business Rules → Subscription lifecycle table. Each call to DOC-205 ledger functions passes `event.id` as the `idempotency_key`.

The membership-vs-coin-pack distinction in `checkout.session.completed` is determined by `event.data.object.mode` — `'subscription'` is membership initial purchase, `'payment'` is coin pack.

#### Step 9: Customer Portal route

Create `app/api/billing/portal/route.ts` (POST handler):

- Authenticate user
- Look up `stripe_customer_id`
- Call `stripe.billingPortal.sessions.create({ customer, return_url: `${appUrl}/billing` })`
- Return JSON `{ url: session.url }`

Configure the Customer Portal in Stripe Dashboard (or via API) to allow: payment method updates, subscription cancellation, invoice history. Disable subscription pausing and plan changes (we have one plan).

#### Step 10: Billing dashboard

Create `app/(member)/billing/page.tsx` as a Server Component that:

- Fetches the current user's subscription, payment method, and invoice list (latest 12)
- Renders the components specified in the component tree
- Shows the grace period banner when `spending_blocked = true`

Create the supporting components in `app/(member)/billing/_components/`. Use Tailwind 4 with the brand tokens. Follow operational-authority tone in all copy.

The `manage-billing-button.tsx` is a Server Action that POSTs to `/api/billing/portal` and redirects to the returned URL.

#### Step 11: Coin pack purchase UI

Modify the existing `/coins` page (from DOC-205) to add a coin pack grid above the existing coin balance display. Create `coin-pack-grid.tsx` and `coin-pack-card.tsx` as Client Components (need onClick handlers).

The purchase button in each card POSTs to `/api/checkout/coin-pack` with the pack_sku and redirects to the returned Checkout URL.

#### Step 12: Grace period cron job

Create `supabase/migrations/{timestamp+2}_grace_period_cron.sql` that uses `pg_cron` to schedule a daily job:

```sql
SELECT cron.schedule(
  'expire_grace_periods',
  '0 6 * * *',  -- Daily at 06:00 UTC
  $$
  UPDATE public.stripe_subscriptions
  SET status = 'canceled',
      spending_blocked = true
  WHERE status = 'past_due'
    AND grace_period_ends_at < now();

  UPDATE public.users u
  SET verified_active = false
  FROM public.stripe_subscriptions s
  WHERE u.id = s.user_id
    AND s.status = 'canceled'
    AND s.grace_period_ends_at < now()
    AND u.verified_active = true;
  $$
);
```

If `pg_cron` is not enabled in the Supabase project, the migration must enable it. Document the alternative: an external scheduler hitting a `/api/cron/grace-period-expiration` endpoint with a shared secret. Build the API endpoint as a fallback.

#### Step 13: Testing

Add Vitest test files following the patterns from GSR-DOC-902:

- `__tests__/api/webhooks/stripe.test.ts` — signature verification, idempotency replay, all event types
- `__tests__/lib/stripe/webhook-handlers/checkout-session-completed.test.ts` — both membership and coin pack paths
- `__tests__/lib/stripe/webhook-handlers/invoice-payment-failed.test.ts` — grace period entry
- `__tests__/lib/stripe/webhook-handlers/charge-refunded.test.ts` — coin pack reversal vs membership review path

Use Stripe's test fixtures (`stripe fixtures` CLI or stub event objects) for webhook payload generation.

#### Step 14: Documentation

Update `CLAUDE.md` to record DOC-207 as complete.
Update `PROJECT-STATUS.md` to reflect the new billing infrastructure.
Add a `docs/stripe-runbook.md` covering: how to rotate the webhook secret, how to promote prices from test to live mode, how to handle the manual review queue for membership refunds.

### Verification before commit

Run all of the following and confirm passing:

1. `npm run build` — clean Next.js build
2. `npm run typecheck` — zero TypeScript errors
3. `npm run lint` — zero lint errors
4. `npx supabase db reset` followed by all migrations — clean execution
5. Vitest test suite — all tests pass
6. Stripe CLI webhook forwarding (`stripe listen --forward-to localhost:3000/api/webhooks/stripe`) with `stripe trigger checkout.session.completed` — confirm 200 response and database row inserted
7. Manual end-to-end: create test member, click purchase membership, complete Stripe Checkout with test card `4242 4242 4242 4242`, observe webhook delivery, confirm 1,000 coins granted and `verified_active=true`
8. Replay the same webhook event via Stripe CLI — confirm 200 response with `duplicate: true` and no additional database writes
9. Grep for forbidden terms: `grep -ri "card_number\|cvc\|cvv" --exclude-dir=node_modules .` returns zero matches
10. Grep for forbidden terms: `grep -ri "pronouns" --exclude-dir=node_modules .` returns zero matches (standing constraint)

### Commit messages

Use a single squashed commit on a feature branch, then merge to main:

```
GSR-DOC-207: Stripe integration — membership, coin packs, webhook handler

- Add stripe_events, processed_idempotency_keys, stripe_subscriptions,
  stripe_invoices, stripe_coin_pack_purchases tables
- Add verified_active and stripe_customer_id columns to users
- Implement webhook handler with two-layer idempotency at /api/webhooks/stripe
- Add Checkout session creation for membership and coin packs
- Add Customer Portal redirect for change actions
- Build view-only billing dashboard at /billing
- Add coin pack grid to /coins with four fixed denominations
- Implement 14-day grace period with soft cutoff for failed payments
- Configure Stripe Tax in test mode (production gated on accountant review)
- Pin Stripe API version 2024-12-18.acacia

Co-authored-by: ATLAS <ops@longviewsolutionsgroup.com>
```

### Out of scope reminders

If you encounter the temptation to do any of the following, stop:

- Building organization/agency billing — DOC-600
- Building Stripe Connect for QRB payouts — future doc
- Authoring refund policy text — Roy's call
- Designing dunning emails — DOC-206
- Adding bonus tiers to coin packs — explicitly rejected in Decision 4
- Reintroducing pronouns column — permanent prohibition
- Embedding Stripe Elements on greysky.dev — Decision 1 deferred to v2
- Building a custom subscription cancellation flow — Decision 6 delegates to Customer Portal

### When complete

Report back with:

1. Confirmation all 20 acceptance criteria pass
2. The actual Stripe price IDs created by the setup script (for `.env.production` configuration)
3. The output of the DOC-205 verification script (so the architecture team can update DOC-205's status if function signatures changed)
4. Any deviations from this prompt with reasoning

End of GSR-DOC-207.
