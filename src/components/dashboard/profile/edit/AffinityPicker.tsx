// TODO: test — fetches all affinities, grouped checkboxes, save replaces all
'use client';

import { useState } from 'react';
import { updateAffinities } from '@/lib/actions/profile';
import type { Affinity } from '@/lib/types/taxonomy';

const categoryLabels: Record<string, string> = {
  hazard_type: 'Hazard Types',
  functional_specialty: 'Functional Specialties',
  sector_experience: 'Sector Experience',
  srt_discipline: 'SRT Disciplines',
};

export default function AffinityPicker({
  allAffinities,
  selectedIds: initial,
}: {
  allAffinities: Affinity[];
  selectedIds: string[];
}) {
  const [selected, setSelected] = useState<string[]>(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

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
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
    setSuccess(false);
  }

  async function handleSave() {
    setSaving(true); setError(null); setSuccess(false);
    const result = await updateAffinities(selected);
    setSaving(false);
    if (result.error) setError(result.error);
    else setSuccess(true);
  }

  return (
    <div className="space-y-4">
      {error && <p className="text-sm text-[var(--gs-alert)] bg-red-50 border border-red-200 rounded p-2">{error}</p>}
      {success && <p className="text-sm text-[var(--gs-success)] bg-green-50 border border-green-200 rounded p-2">Saved</p>}

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

      <button
        type="button"
        onClick={handleSave}
        disabled={saving}
        className="px-5 py-2 text-sm font-semibold bg-[var(--gs-gold)] text-[var(--gs-navy)] rounded-lg hover:bg-[var(--gs-gold)]/90 transition-colors disabled:opacity-50"
      >
        {saving ? 'Saving...' : 'Save Affinities'}
      </button>
    </div>
  );
}
