'use client';

import Link from 'next/link';
import { useTransition } from 'react';
import { Trash2, ChevronRight } from 'lucide-react';
import { removePursuit } from '@/lib/actions/requirements';
import type { PursuitSummary } from '@/lib/types/requirements';
import CompletionBar from './CompletionBar';

function formatNimsType(nt: string | null): string {
  if (!nt) return '';
  const n = nt.replace('type', '');
  return `Type ${n}`;
}

export default function PositionPursuitCard({ pursuit }: { pursuit: PursuitSummary }) {
  const [isPending, startTransition] = useTransition();

  function handleRemove() {
    if (!confirm(`Remove "${pursuit.position.title}" from your pursued positions? Uploaded documents will stay in your library.`)) {
      return;
    }
    startTransition(async () => {
      await removePursuit(pursuit.position.id);
    });
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <Link
          href={`/dashboard/qualifications/${pursuit.position.id}`}
          className="flex-1 min-w-0 group"
        >
          <h3 className="text-sm font-semibold text-[var(--gs-navy,#0A1628)] group-hover:text-[var(--gs-gold,#C5933A)] transition-colors">
            {pursuit.position.title}
          </h3>
          <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-[var(--gs-steel,#6B7280)]">
            {pursuit.position.nims_type && (
              <span className="px-2 py-0.5 rounded bg-[var(--gs-navy,#0A1628)] text-white font-medium">
                {formatNimsType(pursuit.position.nims_type)}
              </span>
            )}
            {pursuit.position.discipline && <span>{pursuit.position.discipline}</span>}
            {pursuit.position.rtlt_code && (
              <span className="text-[11px] text-gray-400">RTLT {pursuit.position.rtlt_code}</span>
            )}
          </div>
        </Link>
        <button
          type="button"
          onClick={handleRemove}
          disabled={isPending}
          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
          aria-label={`Remove ${pursuit.position.title} from your pursued positions`}
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <CompletionBar
        percent={pursuit.completion_percent}
        verified={pursuit.verified_required}
        total={pursuit.total_required}
        pending={pursuit.pending_required}
        rejected={pursuit.rejected_required}
        expired={pursuit.expired_required}
      />

      <Link
        href={`/dashboard/qualifications/${pursuit.position.id}`}
        className="inline-flex items-center justify-between text-sm font-medium text-[var(--gs-navy,#0A1628)] hover:text-[var(--gs-gold,#C5933A)] transition-colors"
      >
        Open checklist
        <ChevronRight className="w-4 h-4" />
      </Link>
    </div>
  );
}
