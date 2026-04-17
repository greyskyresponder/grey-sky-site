-- Track webhook post-processing outcome per Stripe event.
-- When a post-event-recording operation (credit_coins RPC, membership update,
-- coin_account toggle) fails, we record the failure here and still ack 200 to
-- Stripe. An operator can then query rows where processing_status != 'completed'
-- to reconcile partial state.

ALTER TABLE public.stripe_events
  ADD COLUMN IF NOT EXISTS processing_status TEXT NOT NULL DEFAULT 'completed',
  ADD COLUMN IF NOT EXISTS processing_error JSONB;

-- Partial index so operators can cheaply find events that need reconciliation.
CREATE INDEX IF NOT EXISTS idx_stripe_events_needs_reconcile
  ON public.stripe_events(processing_status, processed_at)
  WHERE processing_status <> 'completed';
