// GSR-DOC-207: Membership status helper
import type { MembershipStatus } from '@/lib/types/enums';
import type { MembershipInfo, StripeSubscriptionStatus } from '@/lib/types/stripe';

interface UserMembershipFields {
  membership_status: MembershipStatus | null;
  stripe_subscription_status: string | null;
  membership_started_at: string | null;
  membership_expires_at: string | null;
}

export function getMembershipInfo(user: UserMembershipFields): MembershipInfo {
  const status: MembershipStatus = user.membership_status ?? 'none';
  const expiresAt = user.membership_expires_at;

  const isActive =
    status === 'active' &&
    expiresAt !== null &&
    new Date(expiresAt) > new Date();

  return {
    status,
    stripeStatus: (user.stripe_subscription_status as StripeSubscriptionStatus | null) ?? null,
    startedAt: user.membership_started_at,
    expiresAt,
    isActive,
  };
}

/**
 * Map a raw Stripe subscription status to our high-level MembershipStatus enum.
 */
export function mapStripeStatusToMembership(
  stripeStatus: StripeSubscriptionStatus | string,
): MembershipStatus {
  switch (stripeStatus) {
    case 'active':
    case 'trialing':
      return 'active';
    case 'past_due':
    case 'unpaid':
    case 'canceled':
    case 'incomplete':
    case 'incomplete_expired':
      return 'expired';
    default:
      return 'none';
  }
}
