-- GSR-DOC-205 reconciliation: align coin_economy with spec
-- Additive, data-safe changes only.

-- ── 1. coin_transactions.account_id: add ON DELETE CASCADE ───
ALTER TABLE coin_transactions
  DROP CONSTRAINT IF EXISTS coin_transactions_account_id_fkey;

ALTER TABLE coin_transactions
  ADD CONSTRAINT coin_transactions_account_id_fkey
  FOREIGN KEY (account_id) REFERENCES coin_accounts(id) ON DELETE CASCADE;

-- ── 2. Composite index for ledger scans (account_id, created_at DESC) ───
CREATE INDEX IF NOT EXISTS idx_coin_tx_account_created
  ON coin_transactions(account_id, created_at DESC);

-- ── 3. Partial index on active products by category ───
CREATE INDEX IF NOT EXISTS idx_coin_products_category_active
  ON coin_products(category) WHERE is_active = true;

-- ── 4. Partial index on non-null reference_id ───
CREATE INDEX IF NOT EXISTS idx_coin_tx_reference_partial
  ON coin_transactions(reference_id) WHERE reference_id IS NOT NULL;

-- ── 5. Unique index on rtlt_position_overrides ───
CREATE UNIQUE INDEX IF NOT EXISTS idx_override_position
  ON rtlt_position_overrides(rtlt_position_id);

-- ── 6. Rename rtlt_position_overrides.reason → override_reason ───
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'rtlt_position_overrides'
      AND column_name = 'reason'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'rtlt_position_overrides'
      AND column_name = 'override_reason'
  ) THEN
    ALTER TABLE rtlt_position_overrides RENAME COLUMN reason TO override_reason;
  END IF;
END $$;

-- ── 7. updated_at triggers (idempotent) ───
DROP TRIGGER IF EXISTS set_updated_at_coin_accounts ON coin_accounts;
CREATE TRIGGER set_updated_at_coin_accounts
  BEFORE UPDATE ON coin_accounts
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_coin_products ON coin_products;
CREATE TRIGGER set_updated_at_coin_products
  BEFORE UPDATE ON coin_products
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ── 8. Patch create_coin_account() with ON CONFLICT ───
CREATE OR REPLACE FUNCTION create_coin_account()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO coin_accounts (user_id) VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ── 9. Patch spend_coins / credit_coins with spec parameter defaults ───
-- Signature unchanged (arg types identical), so CREATE OR REPLACE is valid.
CREATE OR REPLACE FUNCTION spend_coins(
  p_user_id UUID,
  p_amount INTEGER,
  p_product_code TEXT DEFAULT NULL,
  p_reference_id UUID DEFAULT NULL,
  p_reference_type TEXT DEFAULT NULL,
  p_description TEXT DEFAULT 'Coin spend'
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

CREATE OR REPLACE FUNCTION credit_coins(
  p_user_id UUID,
  p_amount INTEGER,
  p_type coin_transaction_type DEFAULT 'purchase',
  p_product_code TEXT DEFAULT NULL,
  p_reference_id UUID DEFAULT NULL,
  p_reference_type TEXT DEFAULT NULL,
  p_description TEXT DEFAULT 'Coin credit'
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
