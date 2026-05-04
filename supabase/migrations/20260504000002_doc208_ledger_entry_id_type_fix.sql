-- DOC-208 Stage 1 amendment: fix ledger_entry_id column types
--
-- Stage 1 migration (20260504000001) declared ledger_entry_id as BIGINT
-- on processed_idempotency_keys and stripe_coin_pack_purchases. The actual
-- coin_transactions.id column is UUID (gen_random_uuid()). This migration
-- corrects the type before any data is inserted.
--
-- Authored 2026-05-04 by ATLAS during DOC-208 Stage 2 prep, after inspecting
-- the live coin_transactions schema.

BEGIN;

ALTER TABLE public.processed_idempotency_keys
  ALTER COLUMN ledger_entry_id TYPE UUID USING NULL;

ALTER TABLE public.stripe_coin_pack_purchases
  ALTER COLUMN ledger_entry_id TYPE UUID USING NULL,
  ALTER COLUMN refund_ledger_entry_id TYPE UUID USING NULL;

-- Add FK references to coin_transactions for referential integrity.
ALTER TABLE public.processed_idempotency_keys
  ADD CONSTRAINT processed_idempotency_keys_ledger_entry_fk
    FOREIGN KEY (ledger_entry_id) REFERENCES public.coin_transactions(id)
    ON DELETE SET NULL;

ALTER TABLE public.stripe_coin_pack_purchases
  ADD CONSTRAINT stripe_coin_pack_purchases_ledger_entry_fk
    FOREIGN KEY (ledger_entry_id) REFERENCES public.coin_transactions(id)
    ON DELETE SET NULL,
  ADD CONSTRAINT stripe_coin_pack_purchases_refund_ledger_entry_fk
    FOREIGN KEY (refund_ledger_entry_id) REFERENCES public.coin_transactions(id)
    ON DELETE SET NULL;

COMMIT;
