# BUILD: GSR-DOC-207 — Stripe Integration (Membership + Sky Coins Purchases)

| Field | Value |
|-------|-------|
| Doc ID | GSR-DOC-207 |
| Phase | 2 — Member Portal |
| Priority | High |
| Dependencies | GSR-DOC-200 (Auth) ✅, GSR-DOC-205 (Sky Coins) — **must be built first** |
| Parallel Safe | ⛔ No — requires DOC-205 tables and types to exist |

---

## Context

Read `CLAUDE.md` at the repo root before starting. This is a Next.js 16 + Supabase application hosted on Azure Static Web Apps. Brand colors: Command Navy `#0A1628`, Signal Gold `#C5933A`, Ops White `#F5F5F5`.

**Key context from DOC-205 (must be built already):**
- `coin_accounts` table exists with user balances
- `coin_transactions` table exists (append-only ledger)
- `coin_products` table seeded with purchase packages (purchase_250 through purchase_5000)
- `credit_coins()` Postgres function exists for atomic crediting
- `PURCHASE_PACKAGES` constant at `src/lib/coins/products.ts`
- `CoinBadge` component at `src/components/coins/CoinBadge.tsx`
- `/dashboard/coins/purchase` page exists with "Coming Soon" buttons

**Stripe mode:** TEST MODE ONLY until launch. All keys are test keys. No live charges.

---

## What You Are Building

Stripe Checkout integration for two product types:
1. **Annual membership** — $100/year recurring subscription, grants 1,000 Sky Coins on each payment
2. **Sky Coins purchases** — One-time payments for coin packages ($25–$500)

Plus: Stripe webhook handler to process payment confirmations and credit coins, customer portal for subscription management, and membership status tracking.

**What you are NOT building:**
- Organization billing (DOC-613)
- Invoicing (future)
- Stripe Identity verification (Phase 5)
- Refund processing UI (admin-only, future)

---

## Step 1: Install Stripe

```bash
npm install stripe @stripe/stripe-js
```

---

## Step 2: Environment Variables

Add to `.env.example` and document in `src/lib/config/env.ts`:

```
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_MEMBERSHIP_PRICE_ID=price_...  # Created in Stripe dashboard
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

Update the typed env validation at `src/lib/config/env.ts` to include these new variables. `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` are server-only (no NEXT_PUBLIC prefix). `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` is client-accessible.

---

## Step 3: Stripe Server Client

Create `src/lib/stripe/client.ts`:

```typescript
import Stripe from 'stripe';

let stripeInstance: Stripe | null = null;

export function getStripe(): Stripe {
  if (!stripeInstance) {
    stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2024-12-18.acacia', // Use latest stable API version
      typescript: true,
    });
  }
  return stripeInstance;
}
```

Create `src/lib/stripe/client-browser.ts`:

```typescript
import { loadStripe, Stripe } from '@stripe/stripe-js';

let stripePromise: Promise<Stripe | null> | null = null;

export function getStripeBrowser(): Promise<Stripe | null> {
  if (!stripePromise) {
    stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
  }
  return stripePromise;
}
```

---

## Step 4: Migration — Membership Tracking

Create `supabase/migrations/20260414000001_stripe_membership.sql`:

```sql
-- Membership status enum
CREATE TYPE membership_status AS ENUM (
  'active',
  'past_due',
  'canceled',
  'unpaid',
  'trialing',
  'incomplete'
);

-- Add Stripe fields to users table
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT,
  ADD COLUMN IF NOT EXISTS membership_status membership_status DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS membership_started_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS membership_expires_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS membership_coins_granted_at TIMESTAMPTZ;

CREATE INDEX idx_users_stripe_customer ON public.users(stripe_customer_id) WHERE stripe_customer_id IS NOT NULL;
CREATE INDEX idx_users_membership_status ON public.users(membership_status) WHERE membership_status IS NOT NULL;

-- Stripe events log (idempotency tracking)
CREATE TABLE stripe_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_event_id TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL,
  processed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  payload JSONB NOT NULL DEFAULT '{}'
);

CREATE INDEX idx_stripe_events_type ON stripe_events(type);

ALTER TABLE stripe_events ENABLE ROW LEVEL SECURITY;
-- No client access — service_role only
```

---

## Step 5: Server Actions

Create `src/lib/stripe/actions.ts`:

### createCheckoutSession
```typescript
export async function createMembershipCheckout(userId: string): Promise<{ url: string } | { error: string }>
```
- Look up user in `public.users`, get or create Stripe customer
- Create Stripe Checkout session with mode `subscription`
- Price: `STRIPE_MEMBERSHIP_PRICE_ID` (configured in Stripe dashboard as $100/year recurring)
- Success URL: `/dashboard?membership=success`
- Cancel URL: `/dashboard/membership`
- Pass `client_reference_id: userId` and `customer: stripeCustomerId`
- Metadata: `{ userId, type: 'membership' }`

### createCoinPurchaseCheckout
```typescript
export async function createCoinPurchaseCheckout(userId: string, packageCode: string): Promise<{ url: string } | { error: string }>
```
- Validate packageCode against PURCHASE_PACKAGES
- Look up user, get or create Stripe customer
- Create Checkout session with mode `payment`
- Line item: name from package, unit_amount from package priceUsd * 100 (cents)
- Success URL: `/dashboard/coins?purchase=success`
- Cancel URL: `/dashboard/coins/purchase`
- Metadata: `{ userId, type: 'coin_purchase', packageCode, coins: package.coins }`

### createCustomerPortalSession
```typescript
export async function createCustomerPortalSession(userId: string): Promise<{ url: string } | { error: string }>
```
- Look up user's stripe_customer_id
- Create Stripe Billing Portal session
- Return URL: `/dashboard`

### getOrCreateStripeCustomer (internal helper)
```typescript
async function getOrCreateStripeCustomer(userId: string, email: string): Promise<string>
```
- Check if user has `stripe_customer_id`
- If not, create Stripe customer with email and metadata `{ userId }`
- Save `stripe_customer_id` to users table
- Return customer ID

---

## Step 6: Webhook Handler

Create `src/app/api/stripe/webhook/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
```

- Verify webhook signature using `STRIPE_WEBHOOK_SECRET`
- Parse raw body (important: use `request.text()` not `request.json()`)
- Idempotency: check `stripe_events` table before processing — skip if already processed
- Handle these event types:

### `checkout.session.completed`
- If metadata.type === 'membership':
  - Update user: `stripe_subscription_id`, `membership_status: 'active'`, `membership_started_at: now()`
  - Calculate `membership_expires_at` (1 year from now)
  - Call `credit_coins(userId, 1000, 'membership_grant', null, null, null, 'Annual membership — 1,000 Sky Coins')`
  - Set `membership_coins_granted_at: now()`
  - If coin_account was frozen, unfreeze it
- If metadata.type === 'coin_purchase':
  - Parse `metadata.coins` as integer
  - Call `credit_coins(userId, coins, 'purchase', metadata.packageCode, null, null, 'Sky Coins purchase — ' + coins + ' coins')`

### `invoice.payment_succeeded` (subscription renewal)
- Look up user by `stripe_customer_id`
- Update `membership_expires_at` (+1 year)
- Grant 1,000 coins for renewal (check `membership_coins_granted_at` to prevent double-grant — only grant if last grant was 11+ months ago)

### `customer.subscription.updated`
- Update `membership_status` based on subscription status mapping
- If status is `canceled` or `unpaid`, freeze coin account

### `customer.subscription.deleted`
- Set `membership_status: 'canceled'`
- Set `membership_expires_at` to current period end
- Freeze coin account

Log all processed events to `stripe_events` table.

**Critical:** Return 200 for all events, even unhandled ones. Never return error codes to Stripe for events you don't process.

---

## Step 7: TypeScript Types

Create `src/lib/types/stripe.ts`:

```typescript
export type MembershipStatus =
  | 'active' | 'past_due' | 'canceled'
  | 'unpaid' | 'trialing' | 'incomplete';

export interface MembershipInfo {
  status: MembershipStatus | null;
  startedAt: string | null;
  expiresAt: string | null;
  isActive: boolean;
}

export interface StripeCheckoutResult {
  url?: string;
  error?: string;
}
```

Update `src/lib/types/index.ts` barrel export.

---

## Step 8: UI Updates

### Update `/dashboard/coins/purchase` page
- Replace "Coming Soon" buttons with functional checkout buttons
- Each package card gets an "Add to Balance" button that calls `createCoinPurchaseCheckout` server action
- On click: redirect to Stripe Checkout
- Loading state while checkout session creates
- Error handling with toast/alert

### Create membership purchase component
**MembershipCta** (`src/components/membership/MembershipCta.tsx`):
- Client component
- Shows membership status (active/expired/none)
- If not a member: "Join Grey Sky — $100/year" button → calls `createMembershipCheckout`
- If active: "Manage Membership" button → calls `createCustomerPortalSession`
- If expired/canceled: "Renew Membership" button → calls `createMembershipCheckout`
- Shows expiration date if active

### Update Dashboard StatusGrid
- Add or update membership status card in `src/components/dashboard/StatusGrid.tsx`
- Show: membership status badge, expiration date, renewal CTA if needed

### Update `/membership` public page
- Add "Join Now" button that links to `/join` (existing flow) or directly to checkout for logged-in users

---

## Step 9: Membership Status Helper

Create `src/lib/stripe/membership.ts`:

```typescript
export function getMembershipInfo(user: { 
  membership_status: string | null,
  membership_started_at: string | null,
  membership_expires_at: string | null 
}): MembershipInfo {
  const isActive = user.membership_status === 'active' 
    && user.membership_expires_at 
    && new Date(user.membership_expires_at) > new Date();
  
  return {
    status: user.membership_status as MembershipStatus | null,
    startedAt: user.membership_started_at,
    expiresAt: user.membership_expires_at,
    isActive,
  };
}
```

---

## Step 10: Stripe Dashboard Setup Notes

These are manual steps Roy needs to do in Stripe Dashboard (test mode):
1. Create a Product: "Grey Sky Annual Membership" — $100/year recurring
2. Copy the Price ID → set as `STRIPE_MEMBERSHIP_PRICE_ID`
3. Set up webhook endpoint: `https://greysky.dev/api/stripe/webhook`
4. Select events: `checkout.session.completed`, `invoice.payment_succeeded`, `customer.subscription.updated`, `customer.subscription.deleted`
5. Copy webhook signing secret → set as `STRIPE_WEBHOOK_SECRET`
6. Configure Customer Portal: allow subscription cancellation and payment method update

Include a `docs/STRIPE-SETUP.md` file in the repo documenting these steps.

---

## Step 11: Verify

- `npm run build` passes with zero errors
- Migration applies cleanly
- Stripe checkout redirects work (test mode)
- Webhook endpoint accepts and verifies signatures
- Successful membership checkout:
  - Sets membership_status to active
  - Credits 1,000 Sky Coins
  - Creates coin_transaction record
  - Unfreezes account if frozen
- Successful coin purchase:
  - Credits correct coin amount
  - Creates coin_transaction record
- Customer portal session creates and redirects
- Duplicate webhook events are handled idempotently (no double-credit)
- Subscription cancellation freezes coin account
- All error paths return user-friendly messages

## Commit Message

```
GSR-DOC-207: Stripe integration — membership subscription, coin purchases, webhooks
```
