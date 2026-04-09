export type MembershipStatus = 'active' | 'expired' | 'none';
export type MembershipPaidBy = 'self' | 'organization';
export type UserStatus = 'active' | 'suspended' | 'deactivated';

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
  membership_expires_at: Date | null;
  status: UserStatus;
  created_at: Date;
  updated_at: Date;
}

export type OrganizationType =
  | 'state_agency'
  | 'county_agency'
  | 'city_agency'
  | 'fire_department'
  | 'sheriff'
  | 'private'
  | 'federal'
  | 'tribal';

export type JurisdictionLevel = 'federal' | 'state' | 'county' | 'city' | 'district';
export type OrganizationStatus = 'active' | 'inactive';

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
  created_at: Date;
  updated_at: Date;
}

export type UserOrgRole = 'member' | 'team_lead' | 'admin' | 'assessor';

export interface UserOrganization {
  id: string;
  user_id: string;
  org_id: string;
  role: UserOrgRole;
  title: string | null;
  start_date: Date | null;
  end_date: Date | null;
  sponsorship_active: boolean;
  sponsorship_scope: Record<string, unknown> | null;
  created_at: Date;
}
