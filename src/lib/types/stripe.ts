// GSR-DOC-207: Stripe-related types
import type { MembershipStatus } from './enums';

/** Raw Stripe subscription status values. */
export type StripeSubscriptionStatus =
  | 'active'
  | 'past_due'
  | 'canceled'
  | 'unpaid'
  | 'trialing'
  | 'incomplete'
  | 'incomplete_expired';

export interface MembershipInfo {
  /** High-level user-facing status (active/expired/none). */
  status: MembershipStatus;
  /** Raw Stripe subscription status, when available. */
  stripeStatus: StripeSubscriptionStatus | null;
  startedAt: string | null;
  expiresAt: string | null;
  /** True iff status is 'active' AND expiresAt is in the future. */
  isActive: boolean;
}

export interface StripeCheckoutResult {
  url?: string;
  error?: string;
}

// ── GSR-DOC-208 additions ───────────────────────────────────────────────

export type CoinPackSku = 'coins_100' | 'coins_500' | 'coins_1000' | 'coins_2500';

export interface CoinPackPurchaseRecord {
  id: number;
  user_id: string;
  stripe_payment_intent_id: string;
  stripe_checkout_session_id: string;
  pack_sku: CoinPackSku;
  coins_granted: number;
  amount_paid_cents: number;
  ledger_entry_id: string | null;
  refunded_at: string | null;
  refund_ledger_entry_id: string | null;
  created_at: string;
}

export interface SubscriptionRecord {
  id: number;
  user_id: string;
  stripe_subscription_id: string;
  stripe_customer_id: string;
  stripe_price_id: string;
  status: StripeSubscriptionStatus | 'paused';
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  canceled_at: string | null;
  grace_period_started_at: string | null;
  grace_period_ends_at: string | null;
  spending_blocked: boolean;
  created_at: string;
  updated_at: string;
}
