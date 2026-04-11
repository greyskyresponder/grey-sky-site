'use client';

import type { Affinity } from '@/lib/types/taxonomy';

const categoryLabels: Record<string, string> = {
  hazard_type: 'Hazard Types',
  functional_specialty: 'Functional Specialties',
  sector_experience: 'Sector Experience',
  srt_discipline: 'SRT Disciplines',
};

interface Props {
  allAffinities: Affinity[];
  selected: string[];
  onChange: (ids: string[]) => void;
}

export function AffinitySelector({ allAffinities, selected, onChange }: Props) {
  const grouped = allAffinities.reduce(
    (acc, a) => {
      const cat = a.category;
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(a);
      return acc;
    },
    {} as Record<string, Affinity[]>
  );

  function toggle(id: string) {
    onChange(
      selected.includes(id)
        ? selected.filter((s) => s !== id)
        : [...selected, id]
    );
  }

  return (
    <div className="space-y-5">
      {Object.entries(grouped).map(([category, items]) => (
        <div key={category}>
          <p className="text-xs font-medium text-[var(--gs-steel)] uppercase tracking-wider mb-2">
            {categoryLabels[category] ?? category}
          </p>
          <div className="flex flex-wrap gap-2">
            {items
              .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
              .map((item) => {
                const isSelected = selected.includes(item.id);
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => toggle(item.id)}
                    className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                      isSelected
                        ? 'bg-[var(--gs-gold)] text-[var(--gs-navy)]'
                        : 'bg-[var(--gs-cloud)]/50 text-[var(--gs-steel)] hover:bg-[var(--gs-cloud)]'
                    }`}
                  >
                    {item.value}
                  </button>
                );
              })}
          </div>
        </div>
      ))}
    </div>
  );
}
