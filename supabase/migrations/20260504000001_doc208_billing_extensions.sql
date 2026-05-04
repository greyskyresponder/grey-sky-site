-- GSR-DOC-208: Stripe Integration — billing extensions
-- Authored 2026-05-04
--
-- Adds:
--   * processed_idempotency_keys (auxiliary idempotency table for ledger replay protection)
--   * stripe_subscriptions       (mirror of Stripe subscription state)
--   * stripe_invoices            (cached invoice metadata for billing dashboard)
--   * stripe_coin_pack_purchases (audit trail for one-time coin pack purchases)
--   * users.verified_active, verified_active_until, spending_blocked,
--     grace_period_started_at, grace_period_ends_at
--
-- Coexists with existing membership fields (membership_status, membership_expires_at,
-- coin_accounts.frozen). DOC-208 fields target the public verification API
-- (verified_active is the boolean consumed by third-party verifiers).
--
-- All INSERT/UPDATE/DELETE on new tables is service-role only (no RLS policy for
-- those operations). Service role bypasses RLS by default in Supabase. SELECT
-- policies allow members to read their own rows, platform_admin to read all.

BEGIN;

-- ─────────────────────────────────────────────────────────
-- 1. processed_idempotency_keys
-- ─────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.processed_idempotency_keys (
  idempotency_key TEXT PRIMARY KEY,
  operation       TEXT NOT NULL,
  ledger_entry_id BIGINT,
  processed_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_processed_idempotency_operation
  ON public.processed_idempotency_keys(operation);

COMMENT ON TABLE public.processed_idempotency_keys IS
  'GSR-DOC-208: replay protection for ledger writes triggered by Stripe webhooks. Populated by credit_coins/reverse_coin_grant when called with p_idempotency_key.';

ALTER TABLE public.processed_idempotency_keys ENABLE ROW LEVEL SECURITY;

-- No SELECT for end users; this is operations-only metadata.
-- Platform admins can read for reconciliation.
CREATE POLICY processed_idempotency_keys_select_admin
  ON public.processed_idempotency_keys
  FOR SELECT
  USING (public.is_platform_admin());

-- ─────────────────────────────────────────────────────────
-- 2. stripe_subscriptions
-- ─────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.stripe_subscriptions (
  id                       BIGSERIAL PRIMARY KEY,
  user_id                  UUID NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
  stripe_subscription_id   TEXT NOT NULL UNIQUE,
  stripe_customer_id       TEXT NOT NULL,
  stripe_price_id          TEXT NOT NULL,
  status                   TEXT NOT NULL
    CHECK (status IN ('trialing', 'active', 'past_due', 'canceled', 'unpaid',
                      'incomplete', 'incomplete_expired', 'paused')),
  current_period_start     TIMESTAMPTZ NOT NULL,
  current_period_end       TIMESTAMPTZ NOT NULL,
  cancel_at_period_end     BOOLEAN NOT NULL DEFAULT FALSE,
  canceled_at              TIMESTAMPTZ,
  grace_period_started_at  TIMESTAMPTZ,
  grace_period_ends_at     TIMESTAMPTZ,
  spending_blocked         BOOLEAN NOT NULL DEFAULT FALSE,
  created_at               TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at               TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_stripe_subs_user
  ON public.stripe_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_stripe_subs_status
  ON public.stripe_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_stripe_subs_period_end
  ON public.stripe_subscriptions(current_period_end);
CREATE INDEX IF NOT EXISTS idx_stripe_subs_grace
  ON public.stripe_subscriptions(grace_period_ends_at)
  WHERE grace_period_ends_at IS NOT NULL;

COMMENT ON TABLE public.stripe_subscriptions IS
  'GSR-DOC-208: mirror of Stripe subscription state. Source of truth remains Stripe; this table exists for query performance and verification lookups.';

ALTER TABLE public.stripe_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY stripe_subscriptions_select_own
  ON public.stripe_subscriptions
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY stripe_subscriptions_select_admin
  ON public.stripe_subscriptions
  FOR SELECT
  USING (public.is_platform_admin());

-- ─────────────────────────────────────────────────────────
-- 3. stripe_invoices
-- ─────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.stripe_invoices (
  id                      BIGSERIAL PRIMARY KEY,
  user_id                 UUID NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
  stripe_invoice_id       TEXT NOT NULL UNIQUE,
  stripe_customer_id      TEXT NOT NULL,
  stripe_subscription_id  TEXT,
  amount_paid_cents       INT NOT NULL,
  amount_due_cents        INT NOT NULL,
  currency                TEXT NOT NULL DEFAULT 'usd',
  status                  TEXT NOT NULL
    CHECK (status IN ('draft', 'open', 'paid', 'uncollectible', 'void')),
  invoice_number          TEXT,
  hosted_invoice_url      TEXT,
  invoice_pdf_url         TEXT,
  paid_at                 TIMESTAMPTZ,
  period_start            TIMESTAMPTZ,
  period_end              TIMESTAMPTZ,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_stripe_invoices_user
  ON public.stripe_invoices(user_id);
CREATE INDEX IF NOT EXISTS idx_stripe_invoices_paid
  ON public.stripe_invoices(paid_at DESC);

COMMENT ON TABLE public.stripe_invoices IS
  'GSR-DOC-208: cached invoice metadata for billing dashboard. PDFs fetched on-demand from Stripe.';

ALTER TABLE public.stripe_invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY stripe_invoices_select_own
  ON public.stripe_invoices
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY stripe_invoices_select_admin
  ON public.stripe_invoices
  FOR SELECT
  USING (public.is_platform_admin());

-- ─────────────────────────────────────────────────────────
-- 4. stripe_coin_pack_purchases
-- ─────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.stripe_coin_pack_purchases (
  id                            BIGSERIAL PRIMARY KEY,
  user_id                       UUID NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
  stripe_payment_intent_id      TEXT NOT NULL UNIQUE,
  stripe_checkout_session_id    TEXT NOT NULL,
  pack_sku                      TEXT NOT NULL
    CHECK (pack_sku IN ('coins_100', 'coins_500', 'coins_1000', 'coins_2500')),
  coins_granted                 INT NOT NULL,
  amount_paid_cents             INT NOT NULL,
  ledger_entry_id               BIGINT,
  refunded_at                   TIMESTAMPTZ,
  refund_ledger_entry_id        BIGINT,
  created_at                    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_coin_pack_purchases_user
  ON public.stripe_coin_pack_purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_coin_pack_purchases_created
  ON public.stripe_coin_pack_purchases(created_at DESC);

COMMENT ON TABLE public.stripe_coin_pack_purchases IS
  'GSR-DOC-208: audit trail for one-time coin pack purchases. References resulting ledger entry from credit_coins.';

ALTER TABLE public.stripe_coin_pack_purchases ENABLE ROW LEVEL SECURITY;

CREATE POLICY stripe_coin_pack_purchases_select_own
  ON public.stripe_coin_pack_purchases
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY stripe_coin_pack_purchases_select_admin
  ON public.stripe_coin_pack_purchases
  FOR SELECT
  USING (public.is_platform_admin());

-- ─────────────────────────────────────────────────────────
-- 5. users — additional billing-state columns
-- ─────────────────────────────────────────────────────────
-- These coexist with the existing membership_status enum. They serve the
-- public verification API (verified_active is the single boolean consumed by
-- third-party verifiers) and fast in-app lookup of grace-period state.

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS verified_active        BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS verified_active_until  TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS spending_blocked       BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS grace_period_started_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS grace_period_ends_at   TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_users_verified_active
  ON public.users(verified_active)
  WHERE verified_active = TRUE;

COMMENT ON COLUMN public.users.verified_active IS
  'GSR-DOC-208: single boolean consumed by third-party verification endpoints. True during active subscription + grace period; false on full deactivation.';
COMMENT ON COLUMN public.users.verified_active_until IS
  'GSR-DOC-208: mirrors current_period_end + grace window. Allows offline reasoning about expiration.';
COMMENT ON COLUMN public.users.spending_blocked IS
  'GSR-DOC-208: true when spending coins should be denied (past_due grace period). Independent of verified_active so verification lookups still succeed during grace.';
COMMENT ON COLUMN public.users.grace_period_started_at IS
  'GSR-DOC-208: set on first invoice.payment_failed for the current billing cycle.';
COMMENT ON COLUMN public.users.grace_period_ends_at IS
  'GSR-DOC-208: grace_period_started_at + 14 days. After this, full deactivation occurs.';

-- ─────────────────────────────────────────────────────────
-- 6. updated_at trigger for stripe_subscriptions
-- ─────────────────────────────────────────────────────────
-- Reuses the existing public.set_updated_at() helper if present, else creates one.

CREATE OR REPLACE FUNCTION public.set_updated_at_v2()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS stripe_subscriptions_set_updated_at ON public.stripe_subscriptions;
CREATE TRIGGER stripe_subscriptions_set_updated_at
  BEFORE UPDATE ON public.stripe_subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at_v2();

COMMIT;
