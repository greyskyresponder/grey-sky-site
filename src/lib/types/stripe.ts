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
