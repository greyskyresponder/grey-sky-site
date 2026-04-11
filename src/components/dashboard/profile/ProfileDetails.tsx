import type { MemberProfile } from '@/lib/types/profile';

export function ProfileDetails({ profile }: { profile: MemberProfile }) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-[var(--gs-cloud)] p-6">
      {/* Bio */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-[var(--gs-navy)] mb-2">About</h3>
        <p className="text-[var(--gs-steel)] text-sm leading-relaxed">
          {profile.bio || 'No bio added yet.'}
        </p>
      </div>

      {/* Contact */}
      {profile.phone && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-[var(--gs-navy)] mb-2">Contact</h3>
          <p className="text-sm text-[var(--gs-steel)]">{profile.phone}</p>
        </div>
      )}

      {/* Organizations */}
      <div>
        <h3 className="text-lg font-semibold text-[var(--gs-navy)] mb-2">
          Organizations You Serve With
        </h3>
        {profile.organizations.length === 0 ? (
          <p className="text-sm text-[var(--gs-steel)]">
            No organization affiliations yet.
          </p>
        ) : (
          <div className="space-y-3">
            {profile.organizations.map((org) => (
              <div
                key={org.id}
                className="flex items-start justify-between border border-[var(--gs-cloud)] rounded p-3"
              >
                <div>
                  <p className="font-medium text-[var(--gs-navy)] text-sm">
                    {org.orgName}
                    {org.isPrimary && (
                      <span className="ml-2 text-xs text-[var(--gs-gold)]">Primary</span>
                    )}
                  </p>
                  {org.title && (
                    <p className="text-xs text-[var(--gs-steel)]">{org.title}</p>
                  )}
                  <p className="text-xs text-[var(--gs-steel)] capitalize">{org.role}</p>
                </div>
                {org.startDate && (
                  <p className="text-xs text-[var(--gs-steel)]">
                    Since {new Date(org.startDate).toLocaleDateString()}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
