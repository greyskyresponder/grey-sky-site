-- GSR-DOC-208 Stage 2: idempotency-aware ledger functions
--
-- Extends credit_coins with an optional idempotency key (consulted via
-- processed_idempotency_keys before writing) and adds reverse_coin_grant
-- for refund flows.
--
-- Backwards-compatible: existing callers passing the original 7-argument
-- positional or named signature continue to work unchanged because
-- p_idempotency_key has a DEFAULT NULL.
--
-- When p_idempotency_key IS NOT NULL:
--   * If a row already exists in processed_idempotency_keys for the key,
--     the function returns TRUE WITHOUT writing a ledger entry (replay
--     protection).
--   * Otherwise it writes the ledger entry AND records the key + entry id
--     atomically (same transaction, plpgsql exception block on duplicate-key
--     prevents race-condition double-credit).
--
-- Authored 2026-05-04 by ATLAS, DOC-208 build stage 2.

BEGIN;

-- ─────────────────────────────────────────────────────────
-- credit_coins (idempotency-aware)
-- ─────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.credit_coins(
  p_user_id UUID,
  p_amount INTEGER,
  p_type coin_transaction_type DEFAULT 'purchase',
  p_product_code TEXT DEFAULT NULL,
  p_reference_id UUID DEFAULT NULL,
  p_reference_type TEXT DEFAULT NULL,
  p_description TEXT DEFAULT 'Coin credit',
  p_idempotency_key TEXT DEFAULT NULL
) RETURNS BOOLEAN AS $$
DECLARE
  v_account_id UUID;
  v_new_balance INTEGER;
  v_ledger_entry_id UUID;
  v_existing_key RECORD;
BEGIN
  -- Reject pathological inputs.
  IF p_amount <= 0 THEN
    RAISE EXCEPTION 'credit_coins: amount must be positive (got %)', p_amount;
  END IF;

  -- Idempotency replay check: if we've already processed this key, no-op.
  IF p_idempotency_key IS NOT NULL THEN
    SELECT * INTO v_existing_key
    FROM public.processed_idempotency_keys
    WHERE idempotency_key = p_idempotency_key;

    IF FOUND THEN
      -- Replay detected; original write succeeded; return TRUE so caller
      -- treats this as success without re-crediting.
      RETURN TRUE;
    END IF;
  END IF;

  -- Balance update (existing logic, unchanged math).
  SELECT id, balance + p_amount INTO v_account_id, v_new_balance
  FROM public.coin_accounts
  WHERE user_id = p_user_id
  FOR UPDATE;

  IF v_account_id IS NULL THEN
    RETURN FALSE;
  END IF;

  UPDATE public.coin_accounts
  SET balance = v_new_balance,
      lifetime_earned = lifetime_earned + p_amount,
      updated_at = now()
  WHERE id = v_account_id;

  INSERT INTO public.coin_transactions
    (account_id, type, amount, balance_after, product_code,
     reference_id, reference_type, description)
  VALUES
    (v_account_id, p_type, p_amount, v_new_balance, p_product_code,
     p_reference_id, p_reference_type, p_description)
  RETURNING id INTO v_ledger_entry_id;

  -- Record idempotency key AFTER ledger write succeeds. PRIMARY KEY on
  -- idempotency_key means a parallel duplicate request would error here;
  -- we re-check and treat it as already-processed.
  IF p_idempotency_key IS NOT NULL THEN
    BEGIN
      INSERT INTO public.processed_idempotency_keys
        (idempotency_key, operation, ledger_entry_id)
      VALUES
        (p_idempotency_key, 'credit_coins:' || p_type::TEXT, v_ledger_entry_id);
    EXCEPTION WHEN unique_violation THEN
      -- Concurrent caller beat us. The other caller's INSERT will succeed
      -- against coin_transactions too (separate row). To preserve at-most-
      -- once semantics, raise — caller sees the failure; the FIRST insert
      -- already credited. This is the rare race; webhooks are serialized
      -- by Stripe per-event-id so this should never fire in practice.
      RAISE EXCEPTION 'credit_coins: duplicate idempotency key % won race; ledger entry % may need reconciliation',
        p_idempotency_key, v_ledger_entry_id;
    END;
  END IF;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.credit_coins(UUID, INTEGER, coin_transaction_type, TEXT, UUID, TEXT, TEXT, TEXT) IS
  'GSR-DOC-208: credits coins with optional idempotency key. When p_idempotency_key is non-null, prior calls with the same key are no-ops returning TRUE.';

-- ─────────────────────────────────────────────────────────
-- reverse_coin_grant
-- ─────────────────────────────────────────────────────────
-- Issues a 'refund' ledger entry against the original credit. Used for
-- charge.refunded webhook events that void prior coin pack purchases.

CREATE OR REPLACE FUNCTION public.reverse_coin_grant(
  p_original_ledger_entry_id UUID,
  p_idempotency_key TEXT,
  p_reason TEXT DEFAULT 'Refund'
) RETURNS UUID AS $$
DECLARE
  v_original RECORD;
  v_account RECORD;
  v_new_balance INTEGER;
  v_reversal_id UUID;
  v_existing_key RECORD;
BEGIN
  IF p_idempotency_key IS NULL THEN
    RAISE EXCEPTION 'reverse_coin_grant requires p_idempotency_key';
  END IF;

  -- Idempotency: if we've already reversed under this key, return the
  -- previously-recorded reversal id.
  SELECT * INTO v_existing_key
  FROM public.processed_idempotency_keys
  WHERE idempotency_key = p_idempotency_key;

  IF FOUND THEN
    RETURN v_existing_key.ledger_entry_id;
  END IF;

  -- Load the original ledger entry.
  SELECT * INTO v_original
  FROM public.coin_transactions
  WHERE id = p_original_ledger_entry_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'reverse_coin_grant: original ledger entry % not found',
      p_original_ledger_entry_id;
  END IF;

  IF v_original.amount <= 0 THEN
    RAISE EXCEPTION 'reverse_coin_grant: original entry % is not a credit (amount=%)',
      p_original_ledger_entry_id, v_original.amount;
  END IF;

  -- Lock account, compute new balance.
  SELECT id, balance - v_original.amount AS new_balance
  INTO v_account
  FROM public.coin_accounts
  WHERE id = v_original.account_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'reverse_coin_grant: coin account % missing', v_original.account_id;
  END IF;

  v_new_balance := v_account.new_balance;

  -- Allow balance to go negative on refund (rare but possible if user
  -- already spent the refunded coins). Operations team handles via
  -- admin_adjustment.

  UPDATE public.coin_accounts
  SET balance = v_new_balance,
      lifetime_earned = GREATEST(lifetime_earned - v_original.amount, 0),
      updated_at = now()
  WHERE id = v_original.account_id;

  INSERT INTO public.coin_transactions
    (account_id, type, amount, balance_after, product_code,
     reference_id, reference_type, description, metadata)
  VALUES
    (v_original.account_id, 'refund', -v_original.amount, v_new_balance,
     v_original.product_code, p_original_ledger_entry_id, 'reversal_of',
     p_reason, jsonb_build_object('reversed_entry_id', p_original_ledger_entry_id))
  RETURNING id INTO v_reversal_id;

  -- Record idempotency key.
  BEGIN
    INSERT INTO public.processed_idempotency_keys
      (idempotency_key, operation, ledger_entry_id)
    VALUES
      (p_idempotency_key, 'reverse_coin_grant', v_reversal_id);
  EXCEPTION WHEN unique_violation THEN
    RAISE EXCEPTION 'reverse_coin_grant: duplicate idempotency key % won race; reversal entry % may need reconciliation',
      p_idempotency_key, v_reversal_id;
  END;

  RETURN v_reversal_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.reverse_coin_grant(UUID, TEXT, TEXT) IS
  'GSR-DOC-208: reverses a prior coin credit by writing a refund ledger entry. Idempotent via processed_idempotency_keys.';

COMMIT;
