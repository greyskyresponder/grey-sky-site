// TODO: test — renders org cards with primary star
// TODO: test — empty state renders with correct copy
import type { UserServiceOrg } from '@/lib/types/profile';

export default function OrganizationsSection({ orgs }: { orgs: UserServiceOrg[] }) {
  if (orgs.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-[var(--gs-cloud)] p-6">
        <h3 className="text-lg font-semibold text-[var(--gs-navy)] mb-2">Who You&apos;ve Served With</h3>
        <p className="text-sm text-[var(--gs-steel)]">
          The agencies and organizations that shaped your service. Add them here.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-[var(--gs-cloud)] p-6">
      <h3 className="text-lg font-semibold text-[var(--gs-navy)] mb-4">Who You&apos;ve Served With</h3>
      <div className="space-y-3">
        {orgs.map((org) => (
          <div key={org.id} className="flex items-start justify-between border border-[var(--gs-cloud)] rounded-lg p-3">
            <div className="min-w-0">
              <p className="font-medium text-sm text-[var(--gs-navy)]">
                {org.is_primary && <span className="text-[var(--gs-gold)] mr-1">★</span>}
                {org.organization_name}
              </p>
              <div className="flex flex-wrap items-center gap-2 mt-1">
                {org.organization_type && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-[var(--gs-cloud)]/50 text-[var(--gs-steel)]">
                    {org.organization_type}
                  </span>
                )}
                {org.role_title && (
                  <span className="text-xs text-[var(--gs-steel)]">{org.role_title}</span>
                )}
                {org.is_current && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                    Current
                  </span>
                )}
              </div>
            </div>
            <div className="text-right text-xs text-[var(--gs-steel)] flex-shrink-0 ml-4">
              {org.start_year && (
                <p>{org.start_year}{org.end_year ? ` – ${org.end_year}` : ' – present'}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
