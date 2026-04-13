import type { MembershipStatus, AffinityCategory, UserOrgRole } from './enums';

// ── Legacy interfaces (still used by existing basic profile components) ──

export interface MemberProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  locationCity: string | null;
  locationState: string | null;
  locationCountry: string | null;
  bio: string | null;
  avatarUrl: string | null;
  role: string;
  membershipStatus: MembershipStatus;
  membershipExpiresAt: string | null;
  createdAt: string;
  organizations: UserOrganizationDetail[];
  affinities: UserAffinityDetail[];
  stats: ProfileStats;
}

export interface UserOrganizationDetail {
  id: string;
  orgId: string;
  orgName: string;
  orgType: string;
  role: UserOrgRole;
  title: string | null;
  startDate: string | null;
  endDate: string | null;
  isPrimary: boolean;
}

export interface UserAffinityDetail {
  affinityId: string;
  category: AffinityCategory;
  value: string;
}

export interface ProfileStats {
  totalDeployments: number;
  verifiedDeployments: number;
  totalHours: number;
  certificationsEarned: number;
}

export interface ProfileUpdatePayload {
  firstName: string;
  lastName: string;
  phone: string | null;
  locationCity: string | null;
  locationState: string | null;
  locationCountry: string | null;
  bio: string | null;
  affinityIds: string[];
}

// ── DOC-202 Expansion interfaces ──

export interface UserProfile {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  preferred_name: string | null;
  phone: string | null;
  date_of_birth: string | null;
  location_city: string | null;
  location_state: string | null;
  location_country: string | null;
  bio: string | null;
  avatar_url: string | null;
  service_start_year: number | null;
  primary_discipline: string | null;
  secondary_disciplines: string[] | null;
  service_statement: string | null;
  years_of_service_computed: number | null;
  profile_completeness: number;
  membership_status: 'active' | 'expired' | 'none';
  membership_expires_at: string | null;
  role: 'member' | 'org_admin' | 'assessor' | 'platform_admin';
  created_at: string;
  profile_updated_at: string | null;
  communities: UserCommunity[];
  service_orgs: UserServiceOrg[];
  teams: UserTeam[];
  qualifications: UserQualification[];
  languages: UserLanguage[];
  affinities: UserAffinity[];
}

export interface UserCommunity {
  id: string;
  community_name: string;
  state: string | null;
  country: string;
  relationship: 'home_base' | 'deployed_to' | 'assigned_to' | 'mutual_aid';
  start_year: number | null;
  end_year: number | null;
  is_current: boolean;
  notes: string | null;
}

export interface UserServiceOrg {
  id: string;
  organization_id: string | null;
  organization_name: string;
  organization_type: string | null;
  role_title: string | null;
  start_year: number | null;
  end_year: number | null;
  is_current: boolean;
  is_primary: boolean;
}

export interface UserTeam {
  id: string;
  team_name: string;
  team_type_id: string | null;
  team_type_name?: string;
  organization_id: string | null;
  organization_name?: string;
  position_on_team: string | null;
  rtlt_position_slug: string | null;
  rtlt_position_title?: string;
  start_year: number | null;
  end_year: number | null;
  is_current: boolean;
}

export interface UserQualification {
  id: string;
  qualification_name: string;
  issuing_authority: string | null;
  credential_number: string | null;
  issued_date: string | null;
  expiration_date: string | null;
  is_active: boolean;
  document_id: string | null;
  verification_status: 'self_reported' | 'document_linked' | 'staff_verified';
  category: string | null;
}

export interface UserLanguage {
  id: string;
  language: string;
  proficiency: 'native' | 'fluent' | 'conversational' | 'basic';
}

export interface UserAffinity {
  affinity_id: string;
  category: 'hazard_type' | 'functional_specialty' | 'sector_experience';
  value: string;
  description: string | null;
}

export interface ProfileSection {
  key: string;
  label: string;
  weight: number;
  complete: boolean;
}
