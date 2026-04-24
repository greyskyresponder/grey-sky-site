'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Plus } from 'lucide-react';
import type { PursuitSummary } from '@/lib/types/requirements';
import PositionPursuitCard from './PositionPursuitCard';
import AddPositionModal from './AddPositionModal';

export default function PursuitGrid({ pursuits }: { pursuits: PursuitSummary[] }) {
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end">
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-[var(--gs-gold,#C5933A)] text-[var(--gs-navy,#0A1628)] rounded-lg hover:bg-[var(--gs-gold,#C5933A)]/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add a Position
        </button>
      </div>

      {pursuits.length === 0 ? (
        <div className="bg-white rounded-lg border border-dashed border-gray-300 p-10 text-center">
          <h3 className="text-base font-semibold text-[var(--gs-navy,#0A1628)]">
            You haven&apos;t selected any positions yet
          </h3>
          <p className="mt-2 text-sm text-[var(--gs-steel,#6B7280)] max-w-md mx-auto">
            Browse the FEMA position catalog to choose roles you&apos;re working toward. Each position brings its own requirement checklist.
          </p>
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-[var(--gs-gold,#C5933A)] text-[var(--gs-navy,#0A1628)] rounded-lg hover:bg-[var(--gs-gold,#C5933A)]/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Browse Positions
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {pursuits.map((p) => (
            <PositionPursuitCard key={p.pursuit.id} pursuit={p} />
          ))}
        </div>
      )}

      <AddPositionModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onAdded={() => router.refresh()}
      />
    </div>
  );
}
