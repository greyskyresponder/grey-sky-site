import type { MembershipStatus, AffinityCategory, UserOrgRole } from './enums';

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
