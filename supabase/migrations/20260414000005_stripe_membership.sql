-- GSR-DOC-207: Stripe Integration
-- Adds Stripe customer/subscription tracking fields to users.
-- Note: users.membership_status (active/expired/none) already exists from DOC-201
-- and remains the high-level user-facing status. We add stripe_subscription_status
-- (raw Stripe state) for detail and the timestamps the webhook needs.

-- ── User columns ────────────────────────────────────────
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT,
  ADD COLUMN IF NOT EXISTS stripe_subscription_status TEXT,
  ADD COLUMN IF NOT EXISTS membership_started_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS membership_expires_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS membership_coins_granted_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_users_stripe_customer
  ON public.users(stripe_customer_id)
  WHERE stripe_customer_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_users_membership_expires
  ON public.users(membership_expires_at)
  WHERE membership_expires_at IS NOT NULL;

-- ── Stripe events log (idempotency) ─────────────────────
CREATE TABLE IF NOT EXISTS stripe_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_event_id TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL,
  processed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  payload JSONB NOT NULL DEFAULT '{}'
);

CREATE INDEX IF NOT EXISTS idx_stripe_events_type ON stripe_events(type);

ALTER TABLE stripe_events ENABLE ROW LEVEL SECURITY;
-- No client policies — service_role only.
