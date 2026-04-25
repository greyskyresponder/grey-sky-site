# BUILD: GSR-DOC-205 — Sky Coins Economy

| Field | Value |
|-------|-------|
| Doc ID | GSR-DOC-205 |
| Phase | 2 — Member Portal |
| Priority | High |
| Dependencies | GSR-DOC-201 (Dashboard Layout) ✅ |
| Parallel Safe | ✅ Yes — new tables, no conflicts with existing schema |
| Resolves | OD-03 (denomination), OD-15 (spend categories), OD-08 (renewal cycles) |

---

## Context

Read `CLAUDE.md` at the repo root before starting. This is a Next.js 16 + Supabase (Postgres) application. Brand colors: Command Navy `#0A1628`, Signal Gold `#C5933A`, Ops White `#F5F5F5`.

**Key decisions locked in this build:**
- $1 USD = 10 Sky Coins
- $100 annual membership = 1,000 Sky Coins
- Certification renewal: 3 years
- Credential renewal: 2 years
- Coins do not expire while membership is active
- Coins freeze (not forfeit) on lapsed membership

---

## What You Are Building

A complete internal currency system: database tables, Postgres functions for atomic transactions, TypeScript types, Zod validators, server actions, pricing module, product constants, and dashboard UI for coin balance, transaction history, product catalog, and purchase page.

## Prerequisites (already exist)

- Supabase Auth with `public.users` table and auth sync trigger (`supabase/migrations/20260409000007_triggers.sql`)
- Dashboard layout with sidebar, header, and mobile nav (`src/components/dashboard/`)
- Type system at `src/lib/types/` with barrel export at `src/lib/types/index.ts`
- Validator system at `src/lib/validators/`
- RTLT data at `references/FEMA_RTLT_NQS_Database.json` with accessor at `src/lib/rtlt.ts`
- Tailwind CSS 4, React 19

---

## Step 1: Migration File

Create `supabase/migrations/20260413000001_coin_economy.sql`:

### 1a. Enum
```sql
CREATE TYPE coin_transaction_type AS ENUM (
  'membership_grant',
  'purchase',
  'spend',
  'earn_validation',
  'earn_evaluation',
  'earn_qrb_review',
  'refund',
  'admin_adjustment',
  'pending_transfer',
  'freeze',
  'unfreeze'
);
```

### 1b. coin_accounts
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

### 1c. coin_transactions (append-only ledger)
```sql
CREATE TABLE coin_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES coin_accounts(id) ON DELETE CASCADE,
  type coin_transaction_type NOT NULL,
  amount INTEGER NOT NULL,
  balance_after INTEGER NOT NULL,
  product_code TEXT,
  reference_id UUID,
  reference_type TEXT,
  description TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- NO updated_at — append-only
CREATE INDEX idx_coin_tx_account ON coin_transactions(account_id, created_at DESC);
CREATE INDEX idx_coin_tx_type ON coin_transactions(type);
CREATE INDEX idx_coin_tx_ref ON coin_transactions(reference_id) WHERE reference_id IS NOT NULL;
```

### 1d. coin_products (product catalog)
```sql
CREATE TABLE coin_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  tier TEXT NOT NULL,
  cost_coins INTEGER NOT NULL DEFAULT 0,
  earn_coins INTEGER NOT NULL DEFAULT 0,
  category TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  requires_staff_action BOOLEAN NOT NULL DEFAULT false,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_coin_products_code ON coin_products(code);
CREATE INDEX idx_coin_products_category ON coin_products(category) WHERE is_active = true;
```

### 1e. coin_pending_balances (pre-registration earn-back)
```sql
CREATE TABLE coin_pending_balances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  amount INTEGER NOT NULL CHECK (amount > 0),
  type coin_transaction_type NOT NULL,
  source_description TEXT NOT NULL,
  reference_id UUID,
  transferred BOOLEAN NOT NULL DEFAULT false,
  transferred_at TIMESTAMPTZ,
  transferred_to UUID REFERENCES public.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_pending_email ON coin_pending_balances(email) WHERE transferred = false;
```

### 1f. rtlt_position_overrides (admin tier overrides)
```sql
CREATE TABLE rtlt_position_overrides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rtlt_position_id UUID NOT NULL,
  certification_tier TEXT,
  credentialing_tier TEXT,
  override_reason TEXT NOT NULL,
  created_by UUID NOT NULL REFERENCES public.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX idx_override_position ON rtlt_position_overrides(rtlt_position_id);
```

### 1g. RLS Policies
```sql
ALTER TABLE coin_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE coin_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE coin_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE coin_pending_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE rtlt_position_overrides ENABLE ROW LEVEL SECURITY;

-- coin_accounts: members see own, no client write (managed by functions)
CREATE POLICY "Members can view own coin account"
  ON coin_accounts FOR SELECT
  USING (user_id = auth.uid());

-- coin_transactions: members see own, NO client INSERT/UPDATE/DELETE
CREATE POLICY "Members can view own transactions"
  ON coin_transactions FOR SELECT
  USING (account_id IN (SELECT id FROM coin_accounts WHERE user_id = auth.uid()));

-- coin_products: public read for active products
CREATE POLICY "Anyone can view active products"
  ON coin_products FOR SELECT
  USING (is_active = true);

-- coin_pending_balances: service_role only (no client access)
-- No policies = default deny for anon/authenticated

-- rtlt_position_overrides: service_role only
-- No policies = default deny for anon/authenticated
```

### 1h. spend_coins() function (atomic debit with row lock)
```sql
CREATE OR REPLACE FUNCTION spend_coins(
  p_user_id UUID,
  p_amount INTEGER,
  p_product_code TEXT DEFAULT NULL,
  p_reference_id UUID DEFAULT NULL,
  p_reference_type TEXT DEFAULT NULL,
  p_description TEXT DEFAULT 'Coin spend'
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_account coin_accounts%ROWTYPE;
  v_new_balance INTEGER;
BEGIN
  -- Lock the account row
  SELECT * INTO v_account
  FROM coin_accounts
  WHERE user_id = p_user_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN false;
  END IF;

  -- Check frozen
  IF v_account.frozen THEN
    RETURN false;
  END IF;

  -- Check sufficient balance
  IF v_account.balance < p_amount THEN
    RETURN false;
  END IF;

  v_new_balance := v_account.balance - p_amount;

  -- Debit
  UPDATE coin_accounts
  SET balance = v_new_balance,
      lifetime_spent = lifetime_spent + p_amount,
      updated_at = now()
  WHERE id = v_account.id;

  -- Record transaction
  INSERT INTO coin_transactions (account_id, type, amount, balance_after, product_code, reference_id, reference_type, description)
  VALUES (v_account.id, 'spend', -p_amount, v_new_balance, p_product_code, p_reference_id, p_reference_type, p_description);

  RETURN true;
END;
$$;
```

### 1i. credit_coins() function (atomic credit)
```sql
CREATE OR REPLACE FUNCTION credit_coins(
  p_user_id UUID,
  p_amount INTEGER,
  p_type coin_transaction_type DEFAULT 'purchase',
  p_product_code TEXT DEFAULT NULL,
  p_reference_id UUID DEFAULT NULL,
  p_reference_type TEXT DEFAULT NULL,
  p_description TEXT DEFAULT 'Coin credit'
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_account coin_accounts%ROWTYPE;
  v_new_balance INTEGER;
BEGIN
  SELECT * INTO v_account
  FROM coin_accounts
  WHERE user_id = p_user_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN false;
  END IF;

  v_new_balance := v_account.balance + p_amount;

  UPDATE coin_accounts
  SET balance = v_new_balance,
      lifetime_earned = lifetime_earned + p_amount,
      updated_at = now()
  WHERE id = v_account.id;

  INSERT INTO coin_transactions (account_id, type, amount, balance_after, product_code, reference_id, reference_type, description)
  VALUES (v_account.id, p_type, p_amount, v_new_balance, p_product_code, p_reference_id, p_reference_type, p_description);

  RETURN true;
END;
$$;
```

### 1j. Transfer pending coins trigger
```sql
CREATE OR REPLACE FUNCTION transfer_pending_coins()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_total INTEGER;
  v_pending RECORD;
BEGIN
  -- Sum all pending balances for this email
  SELECT COALESCE(SUM(amount), 0) INTO v_total
  FROM coin_pending_balances
  WHERE email = NEW.email AND transferred = false;

  IF v_total > 0 THEN
    -- Credit the new account
    PERFORM credit_coins(
      NEW.id,
      v_total,
      'pending_transfer',
      NULL,
      NULL,
      NULL,
      'Transferred pending balance from pre-registration activity'
    );

    -- Mark all pending rows as transferred
    UPDATE coin_pending_balances
    SET transferred = true,
        transferred_at = now(),
        transferred_to = NEW.id
    WHERE email = NEW.email AND transferred = false;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_transfer_pending_coins
  AFTER INSERT ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION transfer_pending_coins();
```

### 1k. Auto-create coin_accounts on user creation
```sql
CREATE OR REPLACE FUNCTION create_coin_account()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO coin_accounts (user_id, balance)
  VALUES (NEW.id, 0)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_create_coin_account
  AFTER INSERT ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION create_coin_account();
```

### 1l. Seed product catalog
```sql
INSERT INTO coin_products (code, name, description, tier, cost_coins, earn_coins, category, requires_staff_action) VALUES
-- Tier 1: Record Building (free)
('response_report', 'Response Report', 'Create a new deployment/response report', 'tier_1', 0, 0, 'record_building', false),
('document_upload', 'Document Upload', 'Upload a supporting document', 'tier_1', 0, 0, 'record_building', false),
('historical_deployment', 'Historical Deployment', 'Add a historical deployment record', 'tier_1', 0, 0, 'record_building', false),

-- Tier 2: Network (validation/evaluation)
('validation_request', 'Validation Request', 'Request 360-degree validation from a colleague', 'tier_2', 10, 5, 'network', false),
('evaluation_request', 'Evaluation Request', 'Request ICS 225 performance evaluation', 'tier_2', 15, 10, 'network', false),

-- Tier 3: Certification
('certification_staff', 'Staff-Level Certification', 'Certification for staff-level RTLT positions (Types 3-4)', 'tier_3a', 4000, 0, 'certification', true),
('certification_command', 'Command-Level Certification', 'Certification for command-level RTLT positions (Types 1-2)', 'tier_3b', 5000, 0, 'certification', true),
('certification_staff_renewal', 'Staff Certification Renewal', 'Renew staff-level certification (3-year cycle)', 'tier_3a', 1600, 0, 'certification', true),
('certification_command_renewal', 'Command Certification Renewal', 'Renew command-level certification (3-year cycle)', 'tier_3b', 2000, 0, 'certification', true),

-- Tier 4: Credentialing
('credential_standard', 'Standard Credential', 'Expert peer review credential — standard positions', 'tier_4a', 10000, 0, 'credentialing', true),
('credential_senior', 'Senior Credential', 'Expert peer review credential — senior/section chief positions', 'tier_4b', 20000, 0, 'credentialing', true),
('credential_command', 'Command Credential', 'Expert peer review credential — IC, Deputy IC, Agency Rep', 'tier_4c', 30000, 0, 'credentialing', true),
('credential_standard_renewal', 'Standard Credential Renewal', 'Renew standard credential (2-year cycle)', 'tier_4a', 4000, 0, 'credentialing', true),
('credential_senior_renewal', 'Senior Credential Renewal', 'Renew senior credential (2-year cycle)', 'tier_4b', 8000, 0, 'credentialing', true),
('credential_command_renewal', 'Command Credential Renewal', 'Renew command credential (2-year cycle)', 'tier_4c', 12000, 0, 'credentialing', true),
('credential_appeal', 'Credential Appeal', 'Appeal a credentialing decision to expanded QRB panel', 'tier_4', 5000, 0, 'credentialing', true),

-- Tier 5: Products & Services
('verified_report', 'Verified Response Report', 'Official verified response report for external use', 'tier_5', 50, 0, 'products', false),
('print_certificate', 'Printed Certificate', 'Physical certificate mailed to you', 'tier_5', 25, 0, 'products', true),
('verification_letter', 'Verification Letter', 'Official verification letter for employer or agency', 'tier_5', 75, 0, 'products', true),
('history_export', 'Service History Export', 'PDF export of complete service history', 'tier_5', 25, 0, 'products', false),
('profile_summary', 'Professional Profile Summary', 'Formatted professional summary document', 'tier_5', 50, 0, 'products', false),
('affinity_report', 'Affinity Connection Report', 'Report of incident, agency, and discipline connections', 'tier_5', 25, 0, 'products', false),
('digital_badge', 'Digital Badge', 'Shareable digital badge for certification/credential', 'tier_5', 0, 0, 'products', false),

-- Purchase packages (reference records for Stripe integration)
('purchase_250', '250 Sky Coins', '$25 — 250 Sky Coins', 'purchase', 0, 250, 'purchase', false),
('purchase_500', '500 Sky Coins', '$50 — 500 Sky Coins', 'purchase', 0, 500, 'purchase', false),
('purchase_1000', '1,000 Sky Coins', '$100 — 1,000 Sky Coins', 'purchase', 0, 1000, 'purchase', false),
('purchase_2500', '2,500 Sky Coins', '$250 — 2,500 Sky Coins', 'purchase', 0, 2500, 'purchase', false),
('purchase_5000', '5,000 Sky Coins', '$500 — 5,000 Sky Coins', 'purchase', 0, 5000, 'purchase', false);
```

### 1m. Updated_at trigger for new tables
```sql
CREATE TRIGGER set_updated_at_coin_accounts BEFORE UPDATE ON coin_accounts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at_coin_products BEFORE UPDATE ON coin_products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

---

## Step 2: TypeScript Types

Replace `src/lib/types/economy.ts` with complete type definitions. Key types:

```typescript
export type CoinTransactionType =
  | 'membership_grant' | 'purchase' | 'spend'
  | 'earn_validation' | 'earn_evaluation' | 'earn_qrb_review'
  | 'refund' | 'admin_adjustment' | 'pending_transfer'
  | 'freeze' | 'unfreeze';

export type ProductCategory =
  | 'record_building' | 'network' | 'certification'
  | 'credentialing' | 'products' | 'purchase';

export interface CoinAccount {
  id: string;
  user_id: string;
  balance: number;
  lifetime_earned: number;
  lifetime_spent: number;
  frozen: boolean;
  created_at: string;
  updated_at: string;
}

export interface CoinTransaction {
  id: string;
  account_id: string;
  type: CoinTransactionType;
  amount: number;
  balance_after: number;
  product_code: string | null;
  reference_id: string | null;
  reference_type: string | null;
  description: string;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface CoinProduct {
  id: string;
  code: string;
  name: string;
  description: string | null;
  tier: string;
  cost_coins: number;
  earn_coins: number;
  category: ProductCategory;
  is_active: boolean;
  requires_staff_action: boolean;
  metadata: Record<string, unknown>;
}

export interface CoinBalance {
  balance: number;
  lifetime_earned: number;
  lifetime_spent: number;
  frozen: boolean;
}

export interface CoinLedgerEntry extends CoinTransaction {}

export interface PurchasePackage {
  code: string;
  coins: number;
  priceUsd: number;
  label: string;
}

export interface PositionPricing {
  certificationTier: string;
  certificationCost: number;
  certificationRenewalCost: number;
  credentialingTier: string;
  credentialingCost: number;
  credentialingRenewalCost: number;
  qrbReviewers: number;
  renewalCycleCert: number; // years
  renewalCycleCred: number; // years
}
```

Update `src/lib/types/index.ts` barrel export to include all new types.

---

## Step 3: Zod Validators

Create `src/lib/validators/coins.ts`:

```typescript
import { z } from 'zod';

export const SpendCoinsSchema = z.object({
  productCode: z.string().min(1),
  referenceId: z.string().uuid().optional(),
  referenceType: z.string().optional(),
});

export const PurchaseCoinsSchema = z.object({
  packageCode: z.enum([
    'purchase_250', 'purchase_500', 'purchase_1000',
    'purchase_2500', 'purchase_5000'
  ]),
});

export const AdminAdjustmentSchema = z.object({
  userId: z.string().uuid(),
  amount: z.number().int(),
  reason: z.string().min(10).max(500),
});

export const CoinHistoryQuerySchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(50).default(25),
  type: z.string().optional(),
});
```

Update `src/lib/validators/index.ts` barrel export.

---

## Step 4: Server Actions

Create `src/lib/coins/actions.ts`:

- `getBalance(userId: string): Promise<CoinBalance>` — returns current balance, lifetime stats, frozen status from `coin_accounts`
- `getHistory(userId: string, page: number, limit: number, type?: CoinTransactionType): Promise<{ transactions: CoinLedgerEntry[], total: number }>` — paginated reverse-chronological from `coin_transactions`
- `spendCoins(userId: string, productCode: string, referenceId?: string, referenceType?: string, description?: string): Promise<{ success: boolean, newBalance?: number, error?: string }>` — calls database `spend_coins()` RPC
- `creditCoins(userId: string, amount: number, type: CoinTransactionType, productCode?: string, referenceId?: string, description?: string): Promise<{ success: boolean }>` — calls database `credit_coins()` RPC
- `getProducts(category?: ProductCategory): Promise<CoinProduct[]>` — returns active products, optionally filtered by category

All actions use `createClient()` from `src/lib/supabase/admin.ts` for server-side operations. Auth enforcement via `getUser()` from `src/lib/auth/getUser.ts`.

---

## Step 5: Pricing Module

Create `src/lib/coins/pricing.ts`:

- `getPositionPricing(rtltPositionId: string): Promise<PositionPricing>` — resolves tier and cost for any RTLT position
- Check `rtlt_position_overrides` first, then derive from RTLT type level + resource category:
  - Types 1–2 in command-track categories → certification tier_3b (5,000 coins), credentialing tier_4b or tier_4c
  - Types 3–4 → certification tier_3a (4,000 coins), credentialing tier_4a
  - IC, Deputy IC, Agency Rep → credentialing tier_4c (30,000 coins, 3 QRB reviewers)
  - Section Chiefs, Branch Directors, Unit Leaders Types 1–2 → credentialing tier_4b (20,000 coins, 2 QRB reviewers)
  - All others → credentialing tier_4a (10,000 coins, 2 QRB reviewers)

---

## Step 6: Product Constants

Create `src/lib/coins/products.ts`:

```typescript
export const COIN_EXCHANGE_RATE = 10; // coins per dollar
export const ANNUAL_MEMBERSHIP_COINS = 1000;
export const MIN_PURCHASE_COINS = 250;
export const MAX_PURCHASE_COINS = 10000;

export const PURCHASE_PACKAGES: PurchasePackage[] = [
  { code: 'purchase_250', coins: 250, priceUsd: 25, label: '250 Sky Coins' },
  { code: 'purchase_500', coins: 500, priceUsd: 50, label: '500 Sky Coins' },
  { code: 'purchase_1000', coins: 1000, priceUsd: 100, label: '1,000 Sky Coins' },
  { code: 'purchase_2500', coins: 2500, priceUsd: 250, label: '2,500 Sky Coins' },
  { code: 'purchase_5000', coins: 5000, priceUsd: 500, label: '5,000 Sky Coins' },
];

export function formatCoinAmount(coins: number): string {
  return `${coins.toLocaleString()} Sky Coins`;
}

export function coinsToUsd(coins: number): string {
  return `$${(coins / COIN_EXCHANGE_RATE).toFixed(2)}`;
}

export function usdToCoins(usd: number): number {
  return Math.round(usd * COIN_EXCHANGE_RATE);
}
```

---

## Step 7: Dashboard Components

**CoinBadge** (`src/components/coins/CoinBadge.tsx`):
- Small inline component for sidebar and mobile nav
- Shows balance with small coin icon (circle with "SC" or simple SVG)
- Signal Gold color for balance number
- Click navigates to `/dashboard/coins`

**CoinBalance** (`src/components/coins/CoinBalance.tsx`):
- Large balance display: current balance (large number), lifetime earned, lifetime spent
- If frozen: shows frozen state with explanation and link to renew
- "Add Coins" button → `/dashboard/coins/purchase`

**CoinLedger** (`src/components/coins/CoinLedger.tsx`):
- Reverse-chronological transaction list
- Each row: date, description, amount (green for credit, red for debit), balance_after
- Filter dropdown by transaction type
- Paginated (25 per page)
- Empty state: "No transactions yet. Your Sky Coins activity will appear here."

**CoinPurchase** (`src/components/coins/CoinPurchase.tsx`):
- Grid of purchase packages (from PURCHASE_PACKAGES constant)
- Each card: coin amount, USD price, "Add to Balance" button
- Button state: "Coming Soon" (until DOC-207 Stripe integration)
- Footer note: "Sky Coins are non-refundable and non-transferable."

**ProductCatalog** (`src/components/coins/ProductCatalog.tsx`):
- Tabbed display by category (Record Building, Network, Certification, Credentialing, Products)
- Each product: name, description, cost in coins, USD equivalent
- Free products: "Included with Membership" badge
- Earn-back products: show both cost and earn amount

---

## Step 8: Pages

**`/dashboard/coins`** (`src/app/(dashboard)/dashboard/coins/page.tsx`):
- Server component, auth-gated
- Fetches balance and recent transactions
- Renders CoinBalance + CoinLedger + link to ProductCatalog
- Page title: "Sky Coins"

**`/dashboard/coins/purchase`** (`src/app/(dashboard)/dashboard/coins/purchase/page.tsx`):
- Server component, auth-gated
- Renders CoinPurchase component
- Page title: "Add Sky Coins"

---

## Step 9: Dashboard Integration

- Add CoinBadge to `src/components/dashboard/Sidebar.tsx` — below user info, above nav links
- Add CoinBadge to `src/components/dashboard/MobileNav.tsx` — in header area
- Add "Sky Coins" link to dashboard navigation (icon: coins/currency)
- Add coin balance card to `src/components/dashboard/StatusGrid.tsx` — shows balance with link

---

## Step 10: Verify

- `npm run build` passes with zero errors
- Migration applies cleanly
- RLS: client cannot INSERT into `coin_transactions` directly
- `spend_coins()` returns false for insufficient balance
- `spend_coins()` returns false for frozen accounts
- `credit_coins()` correctly updates balance and lifetime_earned
- Product catalog seed includes ALL 30 products from this spec
- Dashboard shows CoinBadge in sidebar and mobile nav
- `/dashboard/coins` displays balance + transaction history
- `/dashboard/coins/purchase` displays packages with "Coming Soon" state

## Commit Message

```
GSR-DOC-205: Sky Coins economy — tables, functions, types, dashboard UI
```
