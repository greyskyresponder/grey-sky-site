import type { MemberProfile } from '@/lib/types/profile';

const statusColors: Record<string, string> = {
  active: 'bg-green-100 text-green-700',
  expired: 'bg-red-100 text-red-700',
  none: 'bg-gray-100 text-gray-700',
};

export function ProfileHeader({ profile }: { profile: MemberProfile }) {
  const initials = `${profile.firstName[0] ?? ''}${profile.lastName[0] ?? ''}`.toUpperCase();
  const location = [profile.locationCity, profile.locationState, profile.locationCountry]
    .filter(Boolean)
    .join(', ');

  return (
    <div className="bg-white rounded-lg shadow-sm border border-[var(--gs-cloud)] p-6">
      <div className="flex items-start gap-5">
        {profile.avatarUrl ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={profile.avatarUrl}
            alt=""
            className="w-20 h-20 rounded-full object-cover border-2 border-[var(--gs-cloud)]"
          />
        ) : (
          <div className="w-20 h-20 rounded-full bg-[var(--gs-navy)] flex items-center justify-center text-white text-xl font-bold">
            {initials}
          </div>
        )}
        <div className="flex-1">
          <h2 className="text-xl font-bold text-[var(--gs-navy)]">
            {profile.firstName} {profile.lastName}
          </h2>
          <p className="text-sm text-[var(--gs-steel)]">{profile.email}</p>
          {location && (
            <p className="text-sm text-[var(--gs-steel)] mt-1">{location}</p>
          )}
          <div className="flex items-center gap-2 mt-3">
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[profile.membershipStatus] ?? statusColors.none}`}
            >
              {profile.membershipStatus === 'active'
                ? 'Active Member'
                : profile.membershipStatus === 'expired'
                  ? 'Membership Expired'
                  : 'Pending'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
