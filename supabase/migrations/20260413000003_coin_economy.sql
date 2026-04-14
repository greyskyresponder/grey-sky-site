-- GSR-DOC-205: Sky Coins Economy
-- Tables, functions, triggers, RLS policies, seed data

-- ── Enum ────────────────────────────────────────────────
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

-- ── Tables ──────────────────────────────────────────────

-- coin_accounts: one row per user
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

-- coin_transactions: append-only ledger
CREATE TABLE coin_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES coin_accounts(id),
  type coin_transaction_type NOT NULL,
  amount INTEGER NOT NULL,
  balance_after INTEGER NOT NULL,
  product_code TEXT,
  reference_id UUID,
  reference_type TEXT,
  description TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES public.users(id)
);

CREATE INDEX idx_coin_transactions_account ON coin_transactions(account_id);
CREATE INDEX idx_coin_transactions_created ON coin_transactions(created_at DESC);
CREATE INDEX idx_coin_transactions_type ON coin_transactions(type);
CREATE INDEX idx_coin_transactions_reference ON coin_transactions(reference_id);

-- coin_products: admin-managed product catalog
CREATE TABLE coin_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  tier INTEGER NOT NULL CHECK (tier BETWEEN 0 AND 5),
  cost_coins INTEGER NOT NULL DEFAULT 0,
  earn_coins INTEGER NOT NULL DEFAULT 0,
  category TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  requires_staff_action BOOLEAN NOT NULL DEFAULT false,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- coin_pending_balances: non-member earn-back accumulation
CREATE TABLE coin_pending_balances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  amount INTEGER NOT NULL CHECK (amount > 0),
  source_type TEXT NOT NULL,
  source_id UUID NOT NULL,
  transferred BOOLEAN NOT NULL DEFAULT false,
  transferred_at TIMESTAMPTZ,
  transferred_to UUID REFERENCES public.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_coin_pending_email ON coin_pending_balances(email) WHERE NOT transferred;

-- rtlt_position_overrides: admin tier overrides
CREATE TABLE rtlt_position_overrides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rtlt_position_id UUID NOT NULL,
  certification_tier TEXT CHECK (certification_tier IN ('3A', '3B')),
  credentialing_tier TEXT CHECK (credentialing_tier IN ('4A', '4B', '4C')),
  reason TEXT NOT NULL,
  created_by UUID NOT NULL REFERENCES public.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── RLS Policies ────────────────────────────────────────

-- coin_accounts
ALTER TABLE coin_accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own account" ON coin_accounts FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "System manages accounts" ON coin_accounts FOR ALL USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'platform_admin')
);

-- coin_transactions
ALTER TABLE coin_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own transactions" ON coin_transactions FOR SELECT USING (
  account_id IN (SELECT id FROM coin_accounts WHERE user_id = auth.uid())
);
CREATE POLICY "Server inserts transactions" ON coin_transactions FOR INSERT
  WITH CHECK (false);

-- coin_products: public read for active products
ALTER TABLE coin_products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read products" ON coin_products FOR SELECT USING (is_active = true);

-- coin_pending_balances: no client access
ALTER TABLE coin_pending_balances ENABLE ROW LEVEL SECURITY;

-- rtlt_position_overrides: admin only
ALTER TABLE rtlt_position_overrides ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage overrides" ON rtlt_position_overrides FOR ALL USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'platform_admin')
);

-- ── Functions ───────────────────────────────────────────

-- Atomic coin spend
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

-- Atomic coin credit
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

-- Auto-create coin_accounts row on user creation
CREATE OR REPLACE FUNCTION create_coin_account()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO coin_accounts (user_id) VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ── Triggers ────────────────────────────────────────────

CREATE TRIGGER transfer_pending_coins_on_registration
  AFTER INSERT ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION transfer_pending_coins();

CREATE TRIGGER create_coin_account_on_registration
  AFTER INSERT ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION create_coin_account();

-- ── Seed: Product Catalog ───────────────────────────────

INSERT INTO coin_products (code, name, description, tier, cost_coins, earn_coins, category, is_active, requires_staff_action, metadata) VALUES
-- Tier 1: Record Building (FREE)
('response_report', 'File a Response Report (ICS 222)', 'The atomic unit of the platform. Free to encourage filing.', 1, 0, 0, 'record_building', true, false, '{}'),
('document_upload', 'Upload a Supporting Document', 'Portfolio building should be frictionless.', 1, 0, 0, 'record_building', true, false, '{}'),
('historical_deployment', 'Add a Historical Deployment', 'Critical for early adoption — backfill without penalty.', 1, 0, 0, 'record_building', true, false, '{}'),

-- Tier 2: Network Actions (Growth Engine)
('validation_request', 'Request a Validation', 'Send a validation request to a colleague.', 2, 10, 5, 'network', true, false, '{"requester_cost": 10, "recipient_earn": 5, "grey_sky_net": 5}'),
('evaluation_request', 'Request an Evaluation', 'Send an evaluation request to a supervisor or peer.', 2, 15, 10, 'network', true, false, '{"requester_cost": 15, "recipient_earn": 10, "grey_sky_net": 5}'),

-- Tier 3: Certification
('certification_staff', 'Certification — Staff/Support', 'Types 3–4 positions: general staff, technical specialists, support roles.', 3, 4000, 0, 'certification', true, true, '{"tier": "3A", "renewal_cost": 1600, "renewal_cycle_years": 3}'),
('certification_command', 'Certification — Command/Section', 'Types 1–2 positions: IC, Section Chiefs, Branch Directors, Unit Leaders.', 3, 5000, 0, 'certification', true, true, '{"tier": "3B", "renewal_cost": 2000, "renewal_cycle_years": 3}'),
('certification_staff_renewal', 'Certification Renewal — Staff/Support', 'Renew Staff/Support certification (3-year cycle).', 3, 1600, 0, 'certification', true, true, '{"tier": "3A", "is_renewal": true, "renewal_cycle_years": 3}'),
('certification_command_renewal', 'Certification Renewal — Command/Section', 'Renew Command/Section certification (3-year cycle).', 3, 2000, 0, 'certification', true, true, '{"tier": "3B", "is_renewal": true, "renewal_cycle_years": 3}'),

-- Tier 4: Credentialing (QRB)
('credential_standard', 'Credentialing — Standard', 'Types 3–4 positions. 2 QRB reviewers.', 4, 10000, 0, 'credentialing', true, true, '{"tier": "4A", "qrb_size": 2, "reviewer_pay": 1000, "renewal_cost": 4000, "renewal_cycle_years": 2}'),
('credential_senior', 'Credentialing — Senior', 'Types 1–2 general staff, Section Chiefs, Branch Directors, Unit Leaders. 2 QRB reviewers.', 4, 20000, 0, 'credentialing', true, true, '{"tier": "4B", "qrb_size": 2, "reviewer_pay": 1000, "renewal_cost": 8000, "renewal_cycle_years": 2}'),
('credential_command', 'Credentialing — Command', 'IC, Deputy IC, Agency Rep — highest-complexity positions. 3 QRB reviewers.', 4, 30000, 0, 'credentialing', true, true, '{"tier": "4C", "qrb_size": 3, "reviewer_pay": 1000, "renewal_cost": 12000, "renewal_cycle_years": 2}'),
('credential_standard_renewal', 'Credentialing Renewal — Standard', 'Renew Standard credential (2-year cycle).', 4, 4000, 0, 'credentialing', true, true, '{"tier": "4A", "is_renewal": true, "qrb_size": 2, "renewal_cycle_years": 2}'),
('credential_senior_renewal', 'Credentialing Renewal — Senior', 'Renew Senior credential (2-year cycle).', 4, 8000, 0, 'credentialing', true, true, '{"tier": "4B", "is_renewal": true, "qrb_size": 2, "renewal_cycle_years": 2}'),
('credential_command_renewal', 'Credentialing Renewal — Command', 'Renew Command credential (2-year cycle).', 4, 12000, 0, 'credentialing', true, true, '{"tier": "4C", "is_renewal": true, "qrb_size": 3, "renewal_cycle_years": 2}'),
('credential_appeal', 'Credentialing Appeal', 'Appeal a credentialing decision. Assigns a different QRB panel.', 4, 5000, 0, 'credentialing', true, true, '{"is_appeal": true}'),

-- Tier 5: Products and Services
('verified_report', 'Verified Response Report', 'Staff-confirmed deployment record. Higher trust weight.', 5, 50, 0, 'product', true, true, '{}'),
('print_certificate', 'Printable Credential Certificate', 'PDF with digital seal for framing or agency files.', 5, 25, 0, 'product', true, true, '{}'),
('verification_letter', 'Agency Verification Letter', 'Formal letter on Grey Sky letterhead confirming credential status.', 5, 75, 0, 'product', true, true, '{}'),
('history_export', 'Service History Export', 'Formatted PDF of complete deployment history.', 5, 25, 0, 'product', true, false, '{}'),
('profile_summary', 'Professional Profile Summary', 'One-page verified qualification summary.', 5, 50, 0, 'product', true, true, '{}'),
('affinity_report', 'Affinity Report', 'Service network map — shared incidents, agencies, disciplines, communities.', 5, 25, 0, 'product', true, false, '{}'),
('digital_badge', 'Digital Badge', 'Shareable badge per certification/credential earned. Free — marketing.', 5, 0, 0, 'product', true, false, '{}'),

-- Purchase packages (reference entries for transaction logging)
('purchase_250', 'Top-Up Small', '250 Sky Coins for $25.', 0, 0, 0, 'purchase', true, false, '{"coins": 250, "price_usd": 25}'),
('purchase_500', 'Top-Up Medium', '500 Sky Coins for $50.', 0, 0, 0, 'purchase', true, false, '{"coins": 500, "price_usd": 50}'),
('purchase_1000', 'Top-Up Large', '1,000 Sky Coins for $100.', 0, 0, 0, 'purchase', true, false, '{"coins": 1000, "price_usd": 100}'),
('purchase_2500', 'Top-Up XL', '2,500 Sky Coins for $250.', 0, 0, 0, 'purchase', true, false, '{"coins": 2500, "price_usd": 250}'),
('purchase_5000', 'Top-Up Max', '5,000 Sky Coins for $500.', 0, 0, 0, 'purchase', true, false, '{"coins": 5000, "price_usd": 500}');
