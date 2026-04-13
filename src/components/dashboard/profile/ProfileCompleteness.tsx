// TODO: test — ring renders at 0%, 50%, 100% with correct colors
// TODO: test — section checklist shows correct complete/incomplete states
// TODO: test — "Next" link points to first incomplete section
'use client';

import type { UserProfile, ProfileSection } from '@/lib/types/profile';

function getProfileSections(profile: UserProfile): ProfileSection[] {
  return [
    { key: 'basic-info', label: 'Basic Info', weight: 15, complete: !!(profile.first_name && profile.last_name && profile.location_state) },
    { key: 'service-identity', label: 'Service Identity', weight: 20, complete: !!(profile.primary_discipline && profile.service_start_year) },
    { key: 'service-statement', label: 'Service Statement', weight: 10, complete: !!(profile.service_statement && profile.service_statement.length >= 50) },
    { key: 'communities', label: 'Communities', weight: 15, complete: profile.communities.some((c) => c.is_current) },
    { key: 'organizations', label: 'Organizations', weight: 15, complete: profile.service_orgs.length > 0 },
    { key: 'teams', label: 'Teams', weight: 10, complete: profile.teams.length > 0 },
    { key: 'qualifications', label: 'Qualifications', weight: 10, complete: profile.qualifications.length > 0 },
    { key: 'affinities', label: 'Affinities', weight: 5, complete: profile.affinities.length >= 3 },
  ];
}

export default function ProfileCompleteness({ profile }: { profile: UserProfile }) {
  const sections = getProfileSections(profile);
  const score = profile.profile_completeness;
  const isComplete = score >= 100;
  const nextIncomplete = sections.find((s) => !s.complete);

  const size = 80;
  const strokeWidth = 6;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="flex items-start gap-6">
      {/* SVG Ring */}
      <div className="flex-shrink-0">
        <svg width={size} height={size} className="transform -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="var(--gs-cloud)"
            strokeWidth={strokeWidth}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={isComplete ? 'var(--gs-gold)' : 'var(--gs-gold)'}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-500"
          />
        </svg>
        <p className="text-center text-sm font-bold text-[var(--gs-navy)] -mt-[52px]">
          {score}%
        </p>
      </div>

      {/* Checklist */}
      <div className="flex-1 min-w-0">
        {isComplete ? (
          <p className="text-sm font-semibold text-[var(--gs-gold)]">Profile Complete</p>
        ) : (
          <p className="text-xs text-[var(--gs-steel)] mb-2">
            {nextIncomplete && (
              <a
                href={`/dashboard/profile/edit#${nextIncomplete.key}`}
                className="text-[var(--gs-gold)] hover:underline"
              >
                Next: {nextIncomplete.label} &rarr;
              </a>
            )}
          </p>
        )}
        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
          {sections.map((section) => (
            <div key={section.key} className="flex items-center gap-1.5 text-xs">
              <span className={section.complete ? 'text-[var(--gs-success)]' : 'text-[var(--gs-cloud)]'}>
                {section.complete ? '✓' : '○'}
              </span>
              <span className={section.complete ? 'text-[var(--gs-navy)]' : 'text-[var(--gs-steel)]'}>
                {section.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
