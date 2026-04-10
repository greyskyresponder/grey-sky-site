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
  password_hash: string;
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
