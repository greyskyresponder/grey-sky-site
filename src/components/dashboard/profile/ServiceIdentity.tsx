// TODO: test — renders discipline label from disciplines.ts, fallback to raw slug
// TODO: test — renders secondary disciplines as tags
// TODO: test — renders service statement as blockquote
// TODO: test — empty state when no discipline set
import { disciplines } from '@/lib/disciplines';
import type { UserProfile } from '@/lib/types/profile';

function getDisciplineLabel(slug: string | null): string | null {
  if (!slug) return null;
  const d = disciplines.find((d) => d.slug === slug || d.name === slug);
  return d?.name ?? slug;
}

export default function ServiceIdentity({ profile }: { profile: UserProfile }) {
  const primaryLabel = getDisciplineLabel(profile.primary_discipline);
  const secondaryLabels = (profile.secondary_disciplines ?? []).map(
    (s) => getDisciplineLabel(s) ?? s
  );

  if (!primaryLabel && !profile.service_start_year && !profile.service_statement) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-[var(--gs-cloud)] p-6">
        <h3 className="text-lg font-semibold text-[var(--gs-navy)] mb-2">Your Service</h3>
        <p className="text-sm text-[var(--gs-steel)]">
          What you do and how long you&apos;ve been doing it. Every year counts.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-[var(--gs-cloud)] p-6">
      <h3 className="text-lg font-semibold text-[var(--gs-navy)] mb-4">Your Service</h3>

      {primaryLabel && (
        <div className="mb-3">
          <p className="text-xs font-medium text-[var(--gs-steel)] uppercase tracking-wider mb-1">Primary Discipline</p>
          <p className="text-sm font-semibold text-[var(--gs-navy)]">{primaryLabel}</p>
        </div>
      )}

      {secondaryLabels.length > 0 && (
        <div className="mb-3">
          <p className="text-xs font-medium text-[var(--gs-steel)] uppercase tracking-wider mb-1">Additional Disciplines</p>
          <div className="flex flex-wrap gap-1.5">
            {secondaryLabels.map((label) => (
              <span key={label} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-[var(--gs-cloud)]/50 text-[var(--gs-navy)]">
                {label}
              </span>
            ))}
          </div>
        </div>
      )}

      {profile.service_start_year && (
        <div className="mb-3">
          <p className="text-xs font-medium text-[var(--gs-steel)] uppercase tracking-wider mb-1">Years of Service</p>
          <p className="text-sm text-[var(--gs-navy)]">
            Since {profile.service_start_year}
            {profile.years_of_service_computed != null && (
              <span className="text-[var(--gs-steel)]"> &middot; {profile.years_of_service_computed} years</span>
            )}
          </p>
        </div>
      )}

      {profile.service_statement && (
        <div className="mt-4 border-l-2 border-[var(--gs-gold)] pl-4">
          <p className="text-sm text-[var(--gs-navy)] italic leading-relaxed">
            &ldquo;{profile.service_statement}&rdquo;
          </p>
        </div>
      )}
    </div>
  );
}
