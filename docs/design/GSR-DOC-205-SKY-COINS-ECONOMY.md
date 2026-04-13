---
doc_id: GSR-DOC-205
title: "Sky Coins Economy — Balance, Ledger, Products, Pricing"
phase: 2
status: approved
blocks_on:
  - GSR-DOC-201
priority: high
author: Architecture Agent (Claude App)
created: 2026-04-13
updated: 2026-04-13
resolves: OD-03, OD-15, OD-08
notes: >
  OD-03 RESOLVED: $1 = 10 Sky Coins. $100 annual membership = 1,000 Sky Coins.
  OD-15 RESOLVED: Five-tier product catalog with free record building, cheap networking,
  tiered cert/credential pricing, product marketplace, and two-sided earn-back model.
  OD-08 RESOLVED: 2-year credential renewal cycle, 3-year certification renewal cycle.
---

# GSR-DOC-205: Sky Coins Economy — Balance, Ledger, Products, Pricing

| Field | Value |
|-------|-------|
| Phase | 2 |
| Status | approved |
| Blocks on | GSR-DOC-201 (Dashboard Layout) ✅ |
| Priority | high |

---

## Purpose

Sky Coins are the internal currency of the Grey Sky Responder Society. They exist to create a self-sustaining economy of professional development — where the act of building your record, validating your colleagues, and investing in your credentials all happen through a single, transparent value exchange.

This is not a gamification layer. This is the economic engine of a professional society.

**This doc defines:**
- Denomination and conversion rate
- Full product catalog with coin pricing across five tiers
- Two-sided earn-back model (validators and evaluators earn coins)
- Certification and credentialing tier structures with RTLT-driven pricing
- QRB reviewer compensation model
- Coin balance, ledger, and transaction infrastructure
- Stripe integration requirements for coin purchases
- Database tables, TypeScript types, Zod validators
- Dashboard UI for balance, history, and purchases

**What it does NOT build:**
- Stripe checkout integration (DOC-207 — references this doc for pricing)
- Certification workflow (DOC-500 — references this doc for fee structure)
- Credentialing workflow (DOC-501 — references this doc for QRB compensation)
- Organization coin pools (DOC-613 — references this doc for denomination)

**Why it matters:**
Every transaction on the Grey Sky platform flows through Sky Coins. Membership fees, validation requests, certification applications, credentialing reviews, product purchases — all denominated in coins. The economy is designed so that a $100 annual membership covers a full year of active professional development for most members. Only members pursuing certification and credentialing — the highest-value products — need additional coin purchases. That's the right revenue signal: the members investing the most in their professional standing contribute the most to platform sustainability.

---

## Foundational Decisions

### Denomination (OD-03 — RESOLVED)

| Parameter | Value |
|-----------|-------|
| Exchange rate | $1 USD = 10 Sky Coins |
| Annual membership | $100 = 1,000 Sky Coins |
| Minimum purchase | 250 coins ($25) |
| Maximum single purchase | 10,000 coins ($1,000) |
| Coin precision | Integer only — no fractional coins |
| Coin expiration | None — coins do not expire while membership is active |
| Lapsed membership | Coins freeze (not forfeited) — reactivate on renewal |

### Renewal Cycles (OD-08 — RESOLVED)

| Product | Cycle | Rationale |
|---------|-------|-----------|
| Certification | 3 years | Administrative review — checklist confirmation. Longer cycle appropriate. |
| Credential | 2 years | Expert peer review — higher assurance requires more frequent revalidation. |

---

## Product Catalog

### Tier 1 — Record Building (FREE)

All record-building activities are free with membership. The platform's data quality depends on volume of records filed. Gating record creation behind a paywall would reduce data quality and slow adoption.

| Product | Coins | Code | Notes |
|---------|-------|------|-------|
| File a Response Report (ICS 222) | 0 | `response_report` | The atomic unit of the platform. Free to encourage filing. |
| Upload a Supporting Document | 0 | `document_upload` | Portfolio building should be frictionless. |
| Add a Historical Deployment | 0 | `historical_deployment` | Critical for early adoption — don't penalize backfill. |

### Tier 2 — Network Actions (Growth Engine)

Every validation and evaluation request sends an email to someone who may not be a member. These are the platform's primary acquisition channel. Price low to encourage volume.

**Two-sided model:** The requester pays coins. The recipient earns coins. Grey Sky nets the difference. This creates a viral loop where completing validations for colleagues replenishes your balance — and non-members accumulate a pending balance that transfers on registration.

| Product | Cost (Requester) | Earned (Recipient) | Grey Sky Net | Code |
|---------|-----------------|-------------------|-------------|------|
| Request a Validation | 10 coins ($1.00) | 5 coins ($0.50) | 5 coins | `validation_request` |
| Request an Evaluation | 15 coins ($1.50) | 10 coins ($1.00) | 5 coins | `evaluation_request` |

**Earn-back rules:**
- Earned coins credit immediately upon form completion
- Applies to ALL recipients — members and non-members alike
- Non-member earnings accumulate in a `pending_coin_balance` on the `validation_tokens` / `evaluation_tokens` table
- On registration, pending balance transfers to the new member's coin account
- If pending balance exceeds 0 at registration, a welcome notification includes the earned amount
- There is no cap on earn-back — active community members can earn unlimited coins through participation

### Tier 3 — Certification (Staff Reviews Pathway Checklist)

Certification confirms a member has completed all pathway requirements for an RTLT position: specific response reports filed, validations received, evaluations completed, documents uploaded. It is administrative review — staff confirms the checklist, not expert judgment of quality.

**Tiered by position complexity, derived from RTLT data:**

| Tier | RTLT Criteria | Initial | Renewal (3-year) | Code |
|------|--------------|---------|-----------------|------|
| **3A — Staff/Support** | Types 3–4 positions; general staff, technical specialists, support roles | 4,000 coins ($400) | 1,600 coins ($160) | `certification_staff` |
| **3B — Command/Section** | Types 1–2 positions; IC, Deputy IC, Section Chiefs, Branch Directors, Division/Group Supervisors, Unit Leaders | 5,000 coins ($500) | 2,000 coins ($200) | `certification_command` |

**Tier assignment logic:**
- Each RTLT position has a `nqs_type_level` (1–4) and a `resource_category`
- Types 1–2 in command-track categories (Incident Management, Command Staff, Section Chief, Branch Director, Division/Group Supervisor, Unit Leader) → Tier 3B
- All other positions → Tier 3A
- Platform admin can override individual position tier assignments via `rtlt_position_overrides` table

### Tier 4 — Credentialing (Expert Peer Review — QRB)

Credentialing is the premium product. Qualified, credentialed members serve on a Qualification Review Board (QRB) to review the applicant's complete service portfolio and determine qualification. This is expert professional judgment, not a checklist.

**QRB Composition:**
- Minimum 2 reviewers, maximum 3 per review
- Reviewers must hold an active Grey Sky credential in the same or higher-level RTLT position
- Each reviewer is compensated 1,000 coins ($100) per review
- Reviewer assignment is managed by Grey Sky staff (DOC-404)

**Tiered by position complexity and documentation volume:**

| Tier | RTLT Criteria | Initial | Renewal (2-year) | QRB Size | Reviewer Pay | Code |
|------|--------------|---------|-----------------|----------|-------------|------|
| **4A — Standard** | Types 3–4 positions | 10,000 coins ($1,000) | 4,000 coins ($400) | 2 reviewers | 2,000 coins ($200) | `credential_standard` |
| **4B — Senior** | Types 1–2 general staff, Section Chiefs, Branch Directors, Unit Leaders | 20,000 coins ($2,000) | 8,000 coins ($800) | 2 reviewers | 2,000 coins ($200) | `credential_senior` |
| **4C — Command** | IC, Deputy IC, Agency Rep, highest-complexity positions | 30,000 coins ($3,000) | 12,000 coins ($1,200) | 3 reviewers | 3,000 coins ($300) | `credential_command` |

**Appeal:** 5,000 coins ($500). Assigns a different QRB panel. Code: `credential_appeal`.

**Revenue breakdown (Tier 4B example):**
- Member pays: 20,000 coins ($2,000)
- 2 QRB reviewers receive: 2,000 coins ($200)
- Grey Sky retains: 18,000 coins ($1,800) for staff time, platform operations, and sustainability

### Tier 5 — Products and Services

Tangible deliverables that members purchase for specific use cases. No expedited processing — every application is reviewed in order.

| Product | Coins | USD | Code | Notes |
|---------|-------|-----|------|-------|
| Verified Response Report | 50 | $5.00 | `verified_report` | Staff-confirmed deployment record. Higher trust weight than self-reported. |
| Printable Credential Certificate | 25 | $2.50 | `print_certificate` | PDF with digital seal. For framing, agency files. |
| Agency Verification Letter | 75 | $7.50 | `verification_letter` | Formal letter on Grey Sky letterhead confirming credential status. |
| Service History Export | 25 | $2.50 | `history_export` | Formatted PDF of complete deployment history. |
| Professional Profile Summary | 50 | $5.00 | `profile_summary` | One-page verified qualification summary. |
| Affinity Report | 25 | $2.50 | `affinity_report` | Service network map — shared incidents, agencies, disciplines, communities. |
| Digital Badge | 0 | Free | `digital_badge` | Shareable badge per cert/credential earned. Free — it's marketing. |

### Coin Purchase Packages

Members can purchase additional coins through Stripe at the standard 10:1 rate.

| Package | Coins | Price | Code |
|---------|-------|-------|------|
| Top-Up Small | 250 | $25 | `purchase_250` |
| Top-Up Medium | 500 | $50 | `purchase_500` |
| Top-Up Large | 1,000 | $100 | `purchase_1000` |
| Top-Up XL | 2,500 | $250 | `purchase_2500` |
| Top-Up Max | 5,000 | $500 | `purchase_5000` |

No bulk discount. The annual membership IS the discount. Parity rate on all top-ups keeps the math clean and prevents gaming.

---

## Data Entities

### Table: `coin_accounts`

One row per user. Created by trigger when `public.users` row is inserted.

```sql
CREATE TABLE coin_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
  balance INTEGER NOT NULL DEFAULT 0 CHECK (balance >= 0),
  lifetime_earned INTEGER NOT NULL DEFAULT 0,
  lifetime_spent INTEGER NOT NULL DEFAULT 0,
  frozen BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_coin_accounts_user ON coin_accounts(user_id);
```

### Table: `coin_transactions`

Append-only ledger. Every coin movement is recorded. No updates, no deletes.

```sql
CREATE TYPE coin_transaction_type AS ENUM (
  'membership_grant',        -- Annual 1,000 coins on membership purchase/renewal
  'purchase',                -- Stripe purchase of additional coins
  'spend',                   -- Member spends coins on a product
  'earn_validation',         -- Earned by completing a validation form
  'earn_evaluation',         -- Earned by completing an evaluation form
  'earn_qrb_review',         -- Earned as QRB reviewer compensation
  'refund',                  -- Refund (e.g., failed delivery, admin correction)
  'admin_adjustment',        -- Manual adjustment by platform admin (requires reason)
  'pending_transfer',        -- Non-member pending balance transferred on registration
  'freeze',                  -- Coins frozen (membership lapsed)
  'unfreeze'                 -- Coins unfrozen (membership renewed)
);

CREATE TABLE coin_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES coin_accounts(id),
  type coin_transaction_type NOT NULL,
  amount INTEGER NOT NULL,                    -- Positive for credit, negative for debit
  balance_after INTEGER NOT NULL,             -- Running balance after this transaction
  product_code TEXT,                           -- References product catalog code
  reference_id UUID,                          -- Links to the entity that triggered this (deployment, validation token, cert application, etc.)
  reference_type TEXT,                         -- Table name of the referenced entity
  description TEXT NOT NULL,                  -- Human-readable description
  metadata JSONB DEFAULT '{}',                -- Additional context (Stripe payment ID, admin reason, etc.)
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES public.users(id) -- NULL for system-generated transactions
);

CREATE INDEX idx_coin_transactions_account ON coin_transactions(account_id);
CREATE INDEX idx_coin_transactions_created ON coin_transactions(created_at DESC);
CREATE INDEX idx_coin_transactions_type ON coin_transactions(type);
CREATE INDEX idx_coin_transactions_reference ON coin_transactions(reference_id);
```

### Table: `coin_products`

Product catalog. Admin-managed. Drives pricing across the platform.

```sql
CREATE TABLE coin_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,                  -- e.g., 'validation_request', 'certification_command'
  name TEXT NOT NULL,                         -- Display name
  description TEXT,                           -- Human-readable description
  tier INTEGER NOT NULL CHECK (tier BETWEEN 1 AND 5),
  cost_coins INTEGER NOT NULL DEFAULT 0,      -- What the purchaser pays (0 for free products)
  earn_coins INTEGER NOT NULL DEFAULT 0,       -- What the recipient earns (for two-sided products)
  category TEXT NOT NULL,                     -- 'record_building', 'network', 'certification', 'credentialing', 'product'
  is_active BOOLEAN NOT NULL DEFAULT true,
  requires_staff_action BOOLEAN NOT NULL DEFAULT false,
  metadata JSONB DEFAULT '{}',                -- Tier criteria, renewal info, etc.
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### Table: `coin_pending_balances`

For non-members who earn coins by completing validations/evaluations before registering.

```sql
CREATE TABLE coin_pending_balances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,                         -- Email of the non-member
  amount INTEGER NOT NULL CHECK (amount > 0),
  source_type TEXT NOT NULL,                   -- 'validation_completion' or 'evaluation_completion'
  source_id UUID NOT NULL,                     -- Reference to the validation/evaluation token
  transferred BOOLEAN NOT NULL DEFAULT false,
  transferred_at TIMESTAMPTZ,
  transferred_to UUID REFERENCES public.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_coin_pending_email ON coin_pending_balances(email) WHERE NOT transferred;
```

### Table: `rtlt_position_overrides`

Admin overrides for certification/credentialing tier assignments when the automated RTLT-based logic doesn't fit.

```sql
CREATE TABLE rtlt_position_overrides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rtlt_position_id UUID NOT NULL REFERENCES rtlt_positions(id),
  certification_tier TEXT CHECK (certification_tier IN ('3A', '3B')),
  credentialing_tier TEXT CHECK (credentialing_tier IN ('4A', '4B', '4C')),
  reason TEXT NOT NULL,
  created_by UUID NOT NULL REFERENCES public.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### RLS Policies

```sql
-- coin_accounts: members see only their own
ALTER TABLE coin_accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own account" ON coin_accounts FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "System manages accounts" ON coin_accounts FOR ALL USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'platform_admin')
);

-- coin_transactions: members see only their own account's transactions
ALTER TABLE coin_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own transactions" ON coin_transactions FOR SELECT USING (
  account_id IN (SELECT id FROM coin_accounts WHERE user_id = auth.uid())
);
-- INSERT only via server-side functions — no client-side coin minting
CREATE POLICY "Server inserts transactions" ON coin_transactions FOR INSERT
  WITH CHECK (false); -- All inserts via service_role or database functions

-- coin_products: public read
ALTER TABLE coin_products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read products" ON coin_products FOR SELECT USING (is_active = true);

-- coin_pending_balances: no client access
ALTER TABLE coin_pending_balances ENABLE ROW LEVEL SECURITY;
-- All access via service_role only
```

### Database Functions

```sql
-- Atomic coin spend: debit account, insert transaction, return success/failure
CREATE OR REPLACE FUNCTION spend_coins(
  p_user_id UUID,
  p_amount INTEGER,
  p_product_code TEXT,
  p_reference_id UUID DEFAULT NULL,
  p_reference_type TEXT DEFAULT NULL,
  p_description TEXT DEFAULT ''
) RETURNS BOOLEAN AS $$
DECLARE
  v_account_id UUID;
  v_balance INTEGER;
  v_new_balance INTEGER;
BEGIN
  -- Lock the account row
  SELECT id, balance INTO v_account_id, v_balance
  FROM coin_accounts
  WHERE user_id = p_user_id AND frozen = false
  FOR UPDATE;

  IF v_account_id IS NULL THEN
    RETURN false;
  END IF;

  IF v_balance < p_amount THEN
    RETURN false;
  END IF;

  v_new_balance := v_balance - p_amount;

  UPDATE coin_accounts
  SET balance = v_new_balance,
      lifetime_spent = lifetime_spent + p_amount,
      updated_at = now()
  WHERE id = v_account_id;

  INSERT INTO coin_transactions (account_id, type, amount, balance_after, product_code, reference_id, reference_type, description)
  VALUES (v_account_id, 'spend', -p_amount, v_new_balance, p_product_code, p_reference_id, p_reference_type, p_description);

  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Atomic coin credit: credit account, insert transaction
CREATE OR REPLACE FUNCTION credit_coins(
  p_user_id UUID,
  p_amount INTEGER,
  p_type coin_transaction_type,
  p_product_code TEXT DEFAULT NULL,
  p_reference_id UUID DEFAULT NULL,
  p_reference_type TEXT DEFAULT NULL,
  p_description TEXT DEFAULT ''
) RETURNS BOOLEAN AS $$
DECLARE
  v_account_id UUID;
  v_new_balance INTEGER;
BEGIN
  SELECT id, balance + p_amount INTO v_account_id, v_new_balance
  FROM coin_accounts
  WHERE user_id = p_user_id
  FOR UPDATE;

  IF v_account_id IS NULL THEN
    RETURN false;
  END IF;

  UPDATE coin_accounts
  SET balance = v_new_balance,
      lifetime_earned = lifetime_earned + p_amount,
      updated_at = now()
  WHERE id = v_account_id;

  INSERT INTO coin_transactions (account_id, type, amount, balance_after, product_code, reference_id, reference_type, description)
  VALUES (v_account_id, p_type, p_amount, v_new_balance, p_product_code, p_reference_id, p_reference_type, p_description);

  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Transfer pending balances on registration
CREATE OR REPLACE FUNCTION transfer_pending_coins()
RETURNS TRIGGER AS $$
DECLARE
  v_total INTEGER;
  v_email TEXT;
BEGIN
  SELECT email INTO v_email FROM auth.users WHERE id = NEW.id;

  SELECT COALESCE(SUM(amount), 0) INTO v_total
  FROM coin_pending_balances
  WHERE email = v_email AND transferred = false;

  IF v_total > 0 THEN
    PERFORM credit_coins(NEW.id, v_total, 'pending_transfer', NULL, NULL, NULL,
      'Coins earned before registration from completing validations/evaluations');

    UPDATE coin_pending_balances
    SET transferred = true, transferred_at = now(), transferred_to = NEW.id
    WHERE email = v_email AND transferred = false;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Attach to user creation (after auth sync trigger creates public.users row)
CREATE TRIGGER transfer_pending_coins_on_registration
  AFTER INSERT ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION transfer_pending_coins();
```

---

## TypeScript Types

```typescript
// src/lib/types/economy.ts

export type CoinTransactionType =
  | 'membership_grant'
  | 'purchase'
  | 'spend'
  | 'earn_validation'
  | 'earn_evaluation'
  | 'earn_qrb_review'
  | 'refund'
  | 'admin_adjustment'
  | 'pending_transfer'
  | 'freeze'
  | 'unfreeze';

export type ProductCategory =
  | 'record_building'
  | 'network'
  | 'certification'
  | 'credentialing'
  | 'product';

export type CertificationTier = '3A' | '3B';
export type CredentialingTier = '4A' | '4B' | '4C';

export interface CoinAccount {
  id: string;
  userId: string;
  balance: number;
  lifetimeEarned: number;
  lifetimeSpent: number;
  frozen: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CoinTransaction {
  id: string;
  accountId: string;
  type: CoinTransactionType;
  amount: number;           // Positive = credit, negative = debit
  balanceAfter: number;
  productCode: string | null;
  referenceId: string | null;
  referenceType: string | null;
  description: string;
  metadata: Record<string, unknown>;
  createdAt: string;
  createdBy: string | null;
}

export interface CoinProduct {
  id: string;
  code: string;
  name: string;
  description: string | null;
  tier: number;
  costCoins: number;
  earnCoins: number;
  category: ProductCategory;
  isActive: boolean;
  requiresStaffAction: boolean;
  metadata: Record<string, unknown>;
}

export interface CoinPurchasePackage {
  code: string;
  coins: number;
  priceUsd: number;
  stripePriceId: string;    // Set after DOC-207 Stripe integration
}

export interface CoinBalance {
  balance: number;
  lifetimeEarned: number;
  lifetimeSpent: number;
  frozen: boolean;
}

export interface CoinLedgerEntry {
  id: string;
  type: CoinTransactionType;
  amount: number;
  balanceAfter: number;
  description: string;
  productCode: string | null;
  createdAt: string;
}

// Pricing tier resolution
export interface PositionPricing {
  rtltPositionId: string;
  positionName: string;
  certificationTier: CertificationTier;
  certificationCost: number;
  certificationRenewal: number;
  credentialingTier: CredentialingTier;
  credentialingCost: number;
  credentialingRenewal: number;
  qrbSize: number;
  hasOverride: boolean;
}
```

---

## Structure

### New Files

```
src/app/(dashboard)/dashboard/coins/page.tsx          — Coin balance + ledger
src/app/(dashboard)/dashboard/coins/purchase/page.tsx  — Purchase additional coins
src/app/api/coins/balance/route.ts                     — GET balance
src/app/api/coins/history/route.ts                     — GET transaction history (paginated)
src/app/api/coins/spend/route.ts                       — POST spend coins (server action)
src/app/api/coins/products/route.ts                    — GET product catalog
src/components/coins/CoinBalance.tsx                   — Balance display widget
src/components/coins/CoinLedger.tsx                    — Transaction history list
src/components/coins/CoinPurchase.tsx                  — Purchase packages grid
src/components/coins/CoinBadge.tsx                     — Inline balance badge (header/sidebar)
src/components/coins/ProductCatalog.tsx                — Browsable product catalog
src/lib/coins/actions.ts                               — Server actions: spend, credit, getBalance, getHistory
src/lib/coins/pricing.ts                               — Tier resolution: RTLT position → certification/credentialing tier + cost
src/lib/coins/products.ts                              — Product catalog constants + helpers
src/lib/validators/coins.ts                            — Zod schemas for coin operations
supabase/migrations/20260413000001_coin_economy.sql    — All tables, functions, triggers, RLS, seed data
```

### Modified Files

```
src/components/dashboard/StatusGrid.tsx        — Add coin balance card
src/components/dashboard/Sidebar.tsx           — Add CoinBadge to sidebar
src/components/dashboard/MobileNav.tsx         — Add CoinBadge to mobile nav
src/lib/types/economy.ts                       — Replace existing placeholder types
src/lib/types/index.ts                         — Update barrel export
```

---

## Business Rules

1. **No client-side coin minting.** All coin credits go through `credit_coins()` database function with `SECURITY DEFINER`. The `coin_transactions` table has `WITH CHECK (false)` for client INSERT — only server-side or database functions can create transactions.

2. **Atomic operations.** `spend_coins()` and `credit_coins()` use `FOR UPDATE` row locking on `coin_accounts`. Race conditions cannot produce negative balances or double-spends.

3. **Append-only ledger.** `coin_transactions` has no UPDATE or DELETE policies. Every transaction is permanent. Admin adjustments create new `admin_adjustment` entries with a required `reason` in metadata — they do not modify existing rows.

4. **Frozen accounts.** When membership lapses, coins freeze (`frozen = true`). Frozen accounts cannot spend. Balance is preserved. On renewal, `unfreeze` transaction is recorded and spending resumes.

5. **Pending balance transfer.** Non-member earn-back coins accumulate in `coin_pending_balances` keyed by email. On registration, the `transfer_pending_coins` trigger aggregates and credits all pending amounts. Each pending row is marked `transferred = true` with timestamp and user reference.

6. **Tier assignment.** Certification and credentialing tiers are derived from RTLT position data (type level + resource category). Admins can override via `rtlt_position_overrides`. The `pricing.ts` module resolves the effective tier for any position, checking overrides first, then falling back to automated logic.

7. **QRB reviewer compensation.** When a QRB review is completed and the credentialing outcome is recorded (DOC-501), each reviewer receives 1,000 coins via `credit_coins()` with type `earn_qrb_review`. Compensation is paid regardless of the credentialing outcome (approved, denied, or conditional).

8. **Validation/evaluation earn-back.** When a validation form (DOC-401) or evaluation form (DOC-403) is submitted, the system checks if the respondent is a member. If yes, `credit_coins()` is called immediately. If no, a `coin_pending_balances` row is created.

9. **Product catalog is admin-managed.** Prices can be adjusted without code changes. The `coin_products` table drives all pricing. Server actions look up the current price at transaction time — not at page load.

10. **No expedited processing.** All applications are reviewed in submission order. There is no mechanism to pay for priority.

---

## Copy Direction

**Balance display:** "Your Sky Coins" — not "wallet" or "credits." The coin is the unit. Display as "1,000 Sky Coins" with the Sky Coin icon.

**Transaction descriptions:** Clear, specific, action-oriented.
- "Annual membership — 1,000 Sky Coins" (not "membership_grant")
- "Validation request for [Deployment Name]" (not "spend")
- "Earned: completed validation for [Member Name]" (not "earn_validation")
- "QRB review compensation — [Position Name]" (not "earn_qrb_review")

**Purchase page:** "Add Sky Coins to your balance" — frame as investing in professional development, not buying virtual currency.

**Insufficient balance:** "You need [X] more Sky Coins to [action]. Add coins to continue." Direct, helpful, no guilt.

**Frozen account:** "Your Sky Coins are on hold while your membership is inactive. Renew your membership to resume using your balance."

---

## Acceptance Criteria

1. Migration creates all tables (`coin_accounts`, `coin_transactions`, `coin_products`, `coin_pending_balances`, `rtlt_position_overrides`) with correct constraints, indexes, and RLS policies
2. `spend_coins()` and `credit_coins()` functions execute atomically with row-level locking
3. `transfer_pending_coins` trigger fires on `public.users` INSERT and correctly aggregates/transfers pending balances
4. `coin_accounts` row is auto-created when a new `public.users` row is inserted (extend existing auth sync trigger)
5. Product catalog is seeded with all products from this spec (Tiers 1–5 + purchase packages)
6. Dashboard shows coin balance in sidebar/header via `CoinBadge` component
7. `/dashboard/coins` page shows current balance, lifetime earned/spent, and paginated transaction history
8. `/dashboard/coins/purchase` page shows available packages (Stripe integration deferred to DOC-207 — show packages with "Coming Soon" state)
9. `pricing.ts` correctly resolves certification/credentialing tiers from RTLT position data with override support
10. No client-side INSERT on `coin_transactions` — verified by RLS policy
11. Frozen accounts cannot spend — verified by `spend_coins()` function check
12. TypeScript types match database schema exactly
13. Zod validators cover all API inputs
14. `npm run build` passes with zero errors

---

## Agent Lenses

### Baseplate (data/schema)
- `coin_transactions` is append-only with no UPDATE/DELETE — correct for financial ledger
- `FOR UPDATE` locking prevents race conditions on concurrent spends
- `balance_after` on every transaction enables ledger reconciliation
- `coin_products` separates pricing from business logic — prices adjustable without code deploy
- Indexes on `account_id`, `created_at DESC`, `type`, and `reference_id` cover all query patterns
- `CHECK (balance >= 0)` on `coin_accounts` is the last-resort guard against negative balances

### Meridian (doctrine)
- Certification tiers aligned with RTLT typing levels (Types 1–4) and NQS position categories
- QRB review structure follows peer review board patterns established in medical credentialing
- Product codes use snake_case identifiers that map cleanly to RTLT taxonomy
- "Sky Coins" — not "points" or "credits" — establishes a currency with professional weight

### Lookout (UX)
- Balance visible at all times in sidebar/header — no hunting
- Transaction history is reverse-chronological with clear descriptions
- Insufficient balance shows exact shortfall and direct path to purchase
- Frozen state is explained clearly with path to resolution
- Product catalog browsable — members understand what their coins buy before they need to spend

### Threshold (security)
- No client-side coin minting — all credits via `SECURITY DEFINER` functions
- Append-only ledger — tamper resistance through immutability
- Admin adjustments require reason field — audit trail for manual corrections
- RLS enforces account isolation — members see only their own balance and history
- `service_role` only access on `coin_pending_balances` — no client reads on pre-registration data

---

## Claude Code Prompt

You are building the Sky Coins economy for the Grey Sky Responder Society portal. This is a Next.js 16 + Supabase (Postgres) application.

### What You Are Building

A complete internal currency system: database tables, server-side functions, TypeScript types, Zod validators, server actions, API routes, and dashboard UI for coin balance, transaction history, and product catalog display.

### Prerequisites

The following already exist in the codebase:
- Supabase Auth with `public.users` table and auth sync trigger (`supabase/migrations/20260409000007_triggers.sql`)
- Dashboard layout with sidebar, header, and mobile nav (`src/components/dashboard/`)
- Type system at `src/lib/types/` with barrel export at `src/lib/types/index.ts`
- Validator system at `src/lib/validators/`
- RTLT data at `references/FEMA_RTLT_NQS_Database.json` with accessor at `src/lib/rtlt.ts`
- Brand colors: Command Navy `#0A1628`, Signal Gold `#C5933A`, Ops White `#F5F5F5`
- Tailwind CSS 4, React 19

### Step 1: Migration File

Create `supabase/migrations/20260413000001_coin_economy.sql` with:

1. `coin_transaction_type` enum (membership_grant, purchase, spend, earn_validation, earn_evaluation, earn_qrb_review, refund, admin_adjustment, pending_transfer, freeze, unfreeze)
2. `coin_accounts` table — one row per user, balance INTEGER >= 0, lifetime_earned, lifetime_spent, frozen boolean
3. `coin_transactions` table — append-only ledger with type, amount, balance_after, product_code, reference_id, reference_type, description, metadata JSONB
4. `coin_products` table — product catalog with code (unique), name, tier, cost_coins, earn_coins, category, is_active, requires_staff_action
5. `coin_pending_balances` table — email-keyed pending balance for non-members
6. `rtlt_position_overrides` table — admin tier overrides
7. All indexes as specified in the Data Entities section above
8. RLS policies as specified above (members see own data, no client INSERT on transactions, public read on products)
9. `spend_coins()` function — atomic debit with row lock, returns boolean
10. `credit_coins()` function — atomic credit with row lock, returns boolean
11. `transfer_pending_coins()` trigger function + trigger on `public.users` INSERT
12. Extend existing auth sync trigger or add new trigger to create `coin_accounts` row on `public.users` INSERT
13. Seed `coin_products` with ALL products from the catalog:
    - Tier 1: response_report (0), document_upload (0), historical_deployment (0)
    - Tier 2: validation_request (cost 10, earn 5), evaluation_request (cost 15, earn 10)
    - Tier 3: certification_staff (4000), certification_command (5000), certification_staff_renewal (1600), certification_command_renewal (2000)
    - Tier 4: credential_standard (10000), credential_senior (20000), credential_command (30000), credential_standard_renewal (4000), credential_senior_renewal (8000), credential_command_renewal (12000), credential_appeal (5000)
    - Tier 5: verified_report (50), print_certificate (25), verification_letter (75), history_export (25), profile_summary (50), affinity_report (25), digital_badge (0)
    - Purchases: purchase_250 (0 cost, used as reference), purchase_500, purchase_1000, purchase_2500, purchase_5000

### Step 2: TypeScript Types

Replace `src/lib/types/economy.ts` with the full type definitions from this spec. Update `src/lib/types/index.ts` barrel export.

### Step 3: Zod Validators

Create `src/lib/validators/coins.ts` with schemas for:
- `SpendCoinsSchema` — { productCode: string, referenceId?: string, referenceType?: string }
- `PurchaseCoinsSchema` — { packageCode: string } (one of the purchase codes)
- `AdminAdjustmentSchema` — { userId: string, amount: number, reason: string }
- `CoinHistoryQuerySchema` — { page?: number, limit?: number (max 50), type?: CoinTransactionType }

### Step 4: Server Actions

Create `src/lib/coins/actions.ts` with:
- `getBalance(userId: string): Promise<CoinBalance>` — returns current balance, lifetime stats, frozen status
- `getHistory(userId: string, page: number, limit: number, type?: CoinTransactionType): Promise<{ transactions: CoinLedgerEntry[], total: number }>` — paginated history
- `spendCoins(userId: string, productCode: string, referenceId?: string, referenceType?: string, description?: string): Promise<{ success: boolean, newBalance?: number, error?: string }>` — calls database `spend_coins()` function
- `creditCoins(userId: string, amount: number, type: CoinTransactionType, productCode?: string, referenceId?: string, description?: string): Promise<{ success: boolean }>` — calls database `credit_coins()` function
- `getProducts(category?: ProductCategory): Promise<CoinProduct[]>` — returns active products, optionally filtered

### Step 5: Pricing Module

Create `src/lib/coins/pricing.ts` with:
- `getPositionPricing(rtltPositionId: string): Promise<PositionPricing>` — resolves certification/credentialing tier and cost for any RTLT position
- Logic: check `rtlt_position_overrides` first, then derive from RTLT type level and resource category
  - Types 1–2 in command-track categories → certification 3B, credentialing 4B or 4C
  - Types 3–4 → certification 3A, credentialing 4A
  - IC, Deputy IC, Agency Rep → credentialing 4C (3 QRB reviewers)
  - Section Chiefs, Branch Directors, Unit Leaders Types 1–2 → credentialing 4B (2 QRB reviewers)
  - All others → credentialing 4A (2 QRB reviewers)

### Step 6: Product Constants

Create `src/lib/coins/products.ts` with:
- `PURCHASE_PACKAGES` constant array with code, coins, priceUsd for each package
- `COIN_EXCHANGE_RATE = 10` — coins per dollar
- `ANNUAL_MEMBERSHIP_COINS = 1000`
- Helper: `formatCoinAmount(coins: number): string` — "1,000 Sky Coins"
- Helper: `coinsToUsd(coins: number): string` — "$100.00"
- Helper: `usdToCoins(usd: number): number` — 1000

### Step 7: Dashboard Components

**CoinBadge** (`src/components/coins/CoinBadge.tsx`):
- Small inline component for sidebar and mobile nav
- Shows balance with a small coin icon (use a circle with "SC" or a simple SVG)
- Signal Gold color for the balance number
- Click navigates to `/dashboard/coins`

**CoinBalance** (`src/components/coins/CoinBalance.tsx`):
- Large balance display for the coins page
- Shows: current balance (large), lifetime earned, lifetime spent
- If frozen, shows frozen state with explanation and link to renew
- "Add Coins" button links to purchase page

**CoinLedger** (`src/components/coins/CoinLedger.tsx`):
- Reverse-chronological transaction list
- Each row: date, description, amount (green for credit, red for debit), balance after
- Filter by transaction type (dropdown)
- Paginated (25 per page)
- Empty state: "No transactions yet. Your Sky Coins activity will appear here."

**CoinPurchase** (`src/components/coins/CoinPurchase.tsx`):
- Grid of purchase packages
- Each card: coin amount, price, "Add to Balance" button
- Button state: "Coming Soon" (until DOC-207 Stripe integration)
- Note at bottom: "Sky Coins are non-refundable and non-transferable."

**ProductCatalog** (`src/components/coins/ProductCatalog.tsx`):
- Tabbed display by category (Record Building, Network, Certification, Credentialing, Products)
- Each product: name, description, cost in coins, cost in USD equivalent
- Free products shown with "Included with Membership" badge
- Earn-back products show both cost and earn amount

### Step 8: Pages

**`/dashboard/coins`** (`src/app/(dashboard)/dashboard/coins/page.tsx`):
- Server component, auth-gated
- Fetches balance and recent transactions
- Renders CoinBalance + CoinLedger + link to ProductCatalog
- Page title: "Sky Coins"

**`/dashboard/coins/purchase`** (`src/app/(dashboard)/dashboard/coins/purchase/page.tsx`):
- Server component, auth-gated
- Renders CoinPurchase component
- Page title: "Add Sky Coins"

### Step 9: Dashboard Integration

- Add CoinBadge to `src/components/dashboard/Sidebar.tsx` — below user info, above nav links
- Add CoinBadge to `src/components/dashboard/MobileNav.tsx` — in the header area
- Add "Sky Coins" link to dashboard navigation (icon: coins/currency)
- Add coin balance card to `src/components/dashboard/StatusGrid.tsx` — shows balance with link to coins page

### Step 10: Verify

- `npm run build` must pass with zero errors
- Verify RLS: client cannot INSERT into `coin_transactions`
- Verify `spend_coins()` returns false for insufficient balance
- Verify `spend_coins()` returns false for frozen accounts
- Verify `credit_coins()` correctly updates balance and lifetime_earned
- Verify product catalog seed data includes all products from this spec

### Commit Message

`GSR-DOC-205: Sky Coins economy — tables, functions, types, dashboard UI`

---

## Comparative Market Context (Reference)

This pricing was benchmarked against established professional credentialing programs:

| Organization | Membership | Certification | Credential | Peer Review | Renewal |
|-------------|-----------|--------------|-----------|-------------|---------|
| IAEM (CEM) | $170/yr | $425–$635 | N/A | No (volunteer) | 5-year |
| PMI (PMP) | $164/yr | $405–$655 | N/A | No (exam) | 3-year, $60–$150 |
| NREMT | N/A | $88–$175 exam | State-issued | No | 2-year, $18–$32 |
| PE License | Varies | $450–$700 total | State board | Limited | 2-year, $25–$300 |
| ABMS (Medical) | N/A | $1,000–$2,500 | Board-issued | Yes | Annual, $200–$500 |
| **Grey Sky** | **$100/yr** | **$400–$500** | **$1,000–$3,000** | **Yes (paid QRB)** | **2–3 year** |

Grey Sky's membership is the most affordable. Certification is comparable to IAEM/PMI. Credentialing is premium because it delivers paid expert peer review — a service that does not exist elsewhere in emergency management.
