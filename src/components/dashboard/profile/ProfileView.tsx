// TODO: test — renders all profile sections
// TODO: test — each section has edit pencil link
// TODO: test — date_of_birth is NOT displayed
import Link from 'next/link';
import { Pencil } from 'lucide-react';
import type { UserProfile } from '@/lib/types/profile';
import ProfileCompleteness from './ProfileCompleteness';
import ServiceIdentity from './ServiceIdentity';
import CommunitiesSection from './CommunitiesSection';
import OrganizationsSection from './OrganizationsSection';
import TeamsSection from './TeamsSection';
import QualificationsSection from './QualificationsSection';
import LanguagesSection from './LanguagesSection';
import { ProfileAffinities } from './ProfileAffinities';

function SectionHeader({ label, anchor }: { label: string; anchor: string }) {
  return (
    <div className="flex items-center justify-between mb-0">
      <div />
      <Link
        href={`/dashboard/profile/edit#${anchor}`}
        className="inline-flex items-center gap-1 text-xs text-[var(--gs-steel)] hover:text-[var(--gs-navy)] transition-colors"
        aria-label={`Edit ${label}`}
      >
        <Pencil className="w-3 h-3" />
        Edit
      </Link>
    </div>
  );
}

export default function ProfileView({ profile }: { profile: UserProfile }) {
  const displayName = profile.preferred_name || [profile.first_name, profile.last_name].filter(Boolean).join(' ') || 'Grey Sky Member';
  const location = [profile.location_city, profile.location_state, profile.location_country].filter(Boolean).join(', ');
  const initials = `${(profile.first_name ?? '')[0] ?? ''}${(profile.last_name ?? '')[0] ?? ''}`.toUpperCase();

  const membershipStatusLabel = profile.membership_status === 'active'
    ? 'Active Member'
    : profile.membership_status === 'expired'
      ? 'Membership Expired'
      : 'Pending';

  const statusColors: Record<string, string> = {
    active: 'bg-green-100 text-green-700',
    expired: 'bg-red-100 text-red-700',
    none: 'bg-gray-100 text-gray-700',
  };

  // Map affinities for the legacy ProfileAffinities component
  const affinityDetails = profile.affinities.map((a) => ({
    affinityId: a.affinity_id,
    category: a.category as 'hazard_type' | 'functional_specialty' | 'sector_experience',
    value: a.value,
  }));

  return (
    <div className="space-y-6">
      {/* Header with avatar, name, completeness */}
      <div className="bg-white rounded-lg shadow-sm border border-[var(--gs-cloud)] p-6">
        <div className="flex items-start gap-5">
          {profile.avatar_url ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={profile.avatar_url}
              alt=""
              className="w-20 h-20 rounded-full object-cover border-2 border-[var(--gs-cloud)]"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-[var(--gs-navy)] flex items-center justify-center text-white text-xl font-bold">
              {initials || '?'}
            </div>
          )}
          <div className="flex-1">
            <h2 className="text-xl font-bold text-[var(--gs-navy)]">{displayName}</h2>
            <p className="text-sm text-[var(--gs-steel)]">{profile.email}</p>
            {location && <p className="text-sm text-[var(--gs-steel)] mt-0.5">{location}</p>}
            <div className="flex items-center gap-2 mt-2">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[profile.membership_status] ?? statusColors.none}`}>
                {membershipStatusLabel}
              </span>
              {profile.years_of_service_computed != null && profile.service_start_year && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[var(--gs-navy)]/10 text-[var(--gs-navy)]">
                  Since {profile.service_start_year} &middot; {profile.years_of_service_computed} years
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="mt-5 pt-5 border-t border-[var(--gs-cloud)]">
          <ProfileCompleteness profile={profile} />
        </div>
      </div>

      {/* Bio */}
      {profile.bio && (
        <div className="bg-white rounded-lg shadow-sm border border-[var(--gs-cloud)] p-6">
          <SectionHeader label="About" anchor="basic-info" />
          <h3 className="text-lg font-semibold text-[var(--gs-navy)] mb-2">About</h3>
          <p className="text-sm text-[var(--gs-steel)] leading-relaxed">{profile.bio}</p>
        </div>
      )}

      {/* Service Identity */}
      <div>
        <SectionHeader label="Service Identity" anchor="service-identity" />
        <ServiceIdentity profile={profile} />
      </div>

      {/* Communities */}
      <div>
        <SectionHeader label="Communities" anchor="communities" />
        <CommunitiesSection communities={profile.communities} />
      </div>

      {/* Organizations */}
      <div>
        <SectionHeader label="Organizations" anchor="organizations" />
        <OrganizationsSection orgs={profile.service_orgs} />
      </div>

      {/* Teams */}
      <div>
        <SectionHeader label="Teams" anchor="teams" />
        <TeamsSection teams={profile.teams} />
      </div>

      {/* Qualifications */}
      <div>
        <SectionHeader label="Qualifications" anchor="qualifications" />
        <QualificationsSection qualifications={profile.qualifications} />
      </div>

      {/* Languages */}
      <div>
        <SectionHeader label="Languages" anchor="languages" />
        <LanguagesSection languages={profile.languages} />
      </div>

      {/* Affinities */}
      <div>
        <SectionHeader label="Affinities" anchor="affinities" />
        <ProfileAffinities affinities={affinityDetails} />
      </div>
    </div>
  );
}
