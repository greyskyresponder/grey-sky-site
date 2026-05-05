// Group A: Users & Organizations

import type {
  MembershipStatus,
  MembershipPaidBy,
  UserStatus,
  OrganizationType,
  JurisdictionLevel,
  OrganizationStatus,
  UserOrgRole,
} from './enums';

/** users — 18 columns */
export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  location_city: string | null;
  location_state: string | null;
  location_country: string | null;
  bio: string | null;
  avatar_url: string | null;
  mfa_enabled: boolean;
  membership_status: MembershipStatus;
  membership_paid_by: MembershipPaidBy;
  membership_expires_at: string | null;
  /** Stripe customer id, set on first checkout. */
  stripe_customer_id: string | null;
  /** Stripe subscription id, set when membership starts. */
  stripe_subscription_id: string | null;
  /** Raw Stripe subscription status (active, past_due, canceled, …). */
  stripe_subscription_status: string | null;
  /** When the current membership term began. */
  membership_started_at: string | null;
  /** When membership coins were last credited (used to prevent double-grant). */
  membership_coins_granted_at: string | null;
  // ── GSR-DOC-208 billing extensions ──────────────────────────────
  /** True iff member is currently verified-active (eligible for verifications). */
  verified_active: boolean | null;
  /** Verification eligibility horizon (typically equals membership_expires_at). */
  verified_active_until: string | null;
  /** Set true when a payment fails or membership lapses; coin spends are denied. */
  spending_blocked: boolean | null;
  /** When the current grace period started (after first invoice.payment_failed). */
  grace_period_started_at: string | null;
  /** When the current grace period ends (14 days after start by default). */
  grace_period_ends_at: string | null;
  status: UserStatus;
  created_at: string;
  updated_at: string;
}

/** organizations — 12 columns */
export interface Organization {
  id: string;
  name: string;
  type: OrganizationType;
  jurisdiction_level: JurisdictionLevel;
  state: string | null;
  county: string | null;
  website: string | null;
  logo_url: string | null;
  sponsorship_enabled: boolean;
  status: OrganizationStatus;
  created_at: string;
  updated_at: string;
}

/** user_organizations — 10 columns */
export interface UserOrganization {
  id: string;
  user_id: string;
  org_id: string;
  role: UserOrgRole;
  title: string | null;
  start_date: string | null;
  end_date: string | null;
  sponsorship_active: boolean;
  sponsorship_scope: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

/** organization_sponsorships — 8 columns */
export interface OrganizationSponsorship {
  id: string;
  org_id: string;
  user_id: string | null;
  engagement_id: string | null;
  notes: string | null;
  started_at: string;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
}
