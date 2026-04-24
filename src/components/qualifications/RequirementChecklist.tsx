'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { RequirementSlotView } from '@/lib/types/requirements';
import RequirementSlot from './RequirementSlot';
import RequirementUploadModal from './RequirementUploadModal';

type Group = {
  label: string;
  items: RequirementSlotView[];
};

function groupByLabel(slots: RequirementSlotView[]): Group[] {
  const map = new Map<string, RequirementSlotView[]>();
  for (const s of slots) {
    const label = s.requirement.group_label ?? 'Requirements';
    const list = map.get(label) ?? [];
    list.push(s);
    map.set(label, list);
  }
  // Stable order: put required groups before optional (experience).
  const groupOrder = [
    'Independent Study (IS)',
    'ICS Courses',
    'EMI Resident & Field-Deliverable',
    'Other Training',
    'Position Task Book',
    'Certifications & Licenses',
    'Fitness',
    'Experience',
    'Requirements',
  ];
  return Array.from(map.entries())
    .sort(([a], [b]) => {
      const ai = groupOrder.indexOf(a);
      const bi = groupOrder.indexOf(b);
      const aRank = ai === -1 ? groupOrder.length : ai;
      const bRank = bi === -1 ? groupOrder.length : bi;
      return aRank - bRank;
    })
    .map(([label, items]) => ({ label, items }));
}

export default function RequirementChecklist({
  slots,
}: {
  slots: RequirementSlotView[];
}) {
  const router = useRouter();
  const [activeSlot, setActiveSlot] = useState<RequirementSlotView | null>(null);
  const groups = useMemo(() => groupByLabel(slots), [slots]);

  if (slots.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
        <p className="text-sm text-[var(--gs-steel,#6B7280)]">
          This position has no requirements yet. It may be outside the current FEMA RTLT catalog.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {groups.map((g) => (
        <section key={g.label}>
          <h3 className="text-xs font-semibold text-[var(--gs-steel,#6B7280)] uppercase tracking-wide mb-2">
            {g.label}
          </h3>
          <div className="space-y-2">
            {g.items.map((s) => (
              <RequirementSlot
                key={s.requirement.id}
                slot={s}
                onUploadClick={setActiveSlot}
              />
            ))}
          </div>
        </section>
      ))}

      <RequirementUploadModal
        slot={activeSlot}
        onClose={() => setActiveSlot(null)}
        onAttached={() => router.refresh()}
      />
    </div>
  );
}
