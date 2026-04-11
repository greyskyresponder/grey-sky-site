import type { UserAffinityDetail } from '@/lib/types/profile';

const categoryLabels: Record<string, string> = {
  hazard_type: 'Hazard Types',
  functional_specialty: 'Functional Specialties',
  sector_experience: 'Sector Experience',
  srt_discipline: 'SRT Disciplines',
};

export function ProfileAffinities({ affinities }: { affinities: UserAffinityDetail[] }) {
  const grouped = affinities.reduce(
    (acc, a) => {
      const cat = a.category;
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(a);
      return acc;
    },
    {} as Record<string, UserAffinityDetail[]>
  );

  return (
    <div className="bg-white rounded-lg shadow-sm border border-[var(--gs-cloud)] p-6">
      <h3 className="text-lg font-semibold text-[var(--gs-navy)] mb-1">Your Connections</h3>
      <p className="text-sm text-[var(--gs-steel)] mb-4">
        The hazards, specialties, and sectors that define your experience.
      </p>
      {affinities.length === 0 ? (
        <p className="text-sm text-[var(--gs-steel)]">
          No connections selected yet. Update your profile to add them.
        </p>
      ) : (
        <div className="space-y-4">
          {Object.entries(grouped).map(([category, items]) => (
            <div key={category}>
              <p className="text-xs font-medium text-[var(--gs-steel)] uppercase tracking-wider mb-2">
                {categoryLabels[category] ?? category}
              </p>
              <div className="flex flex-wrap gap-2">
                {items.map((item) => (
                  <span
                    key={item.affinityId}
                    className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-[var(--gs-gold)]/10 text-[var(--gs-gold-dark)]"
                  >
                    {item.value}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
