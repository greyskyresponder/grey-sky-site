'use client';

import { useEffect, useState, useTransition } from 'react';
import { Search, X } from 'lucide-react';
import { addPursuit, searchPositions } from '@/lib/actions/requirements';
import type { NimsType } from '@/lib/types/enums';

type PositionRow = {
  id: string;
  title: string;
  rtlt_code: string | null;
  nims_type: NimsType | null;
  discipline: string | null;
  resource_category: string | null;
};

function formatNimsType(nt: NimsType | null): string {
  if (!nt) return '';
  return `Type ${nt.replace('type', '')}`;
}

export default function AddPositionModal({
  open,
  onClose,
  onAdded,
}: {
  open: boolean;
  onClose: () => void;
  onAdded: () => void;
}) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<PositionRow[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [adding, startAdding] = useTransition();

  useEffect(() => {
    if (!open) return;
    const handle = setTimeout(async () => {
      setIsSearching(true);
      setError(null);
      const { data, error: err } = await searchPositions(query, 40);
      if (err) setError(err);
      else setResults(data);
      setIsSearching(false);
    }, 200);
    return () => clearTimeout(handle);
  }, [query, open]);

  useEffect(() => {
    if (!open) {
      setQuery('');
      setResults([]);
      setError(null);
    }
  }, [open]);

  if (!open) return null;

  function handleAdd(positionId: string) {
    startAdding(async () => {
      const res = await addPursuit({ position_id: positionId });
      if (res.error) {
        setError(res.error);
        return;
      }
      onAdded();
      onClose();
    });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 p-4 pt-[10vh]"
      role="dialog"
      aria-modal="true"
      aria-label="Add a position to pursue"
    >
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl flex flex-col max-h-[80vh]">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <div>
            <h2 className="text-base font-semibold text-[var(--gs-navy,#0A1628)]">
              Add a position
            </h2>
            <p className="text-xs text-[var(--gs-steel,#6B7280)] mt-0.5">
              Pick a FEMA RTLT position you&apos;re working toward. Its full requirement checklist will appear in your dashboard.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 rounded"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-5 py-3 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by title, RTLT code, or discipline"
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-[var(--gs-gold,#C5933A)]"
              autoFocus
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-3">
          {error && (
            <div className="mb-3 px-3 py-2 rounded bg-red-50 text-red-800 text-sm">{error}</div>
          )}

          {isSearching && results.length === 0 && (
            <p className="text-sm text-[var(--gs-steel,#6B7280)]">Searching…</p>
          )}
          {!isSearching && results.length === 0 && (
            <p className="text-sm text-[var(--gs-steel,#6B7280)]">No positions match your search.</p>
          )}

          <ul className="divide-y divide-gray-100">
            {results.map((pos) => (
              <li key={pos.id} className="py-2 flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-[var(--gs-navy,#0A1628)]">{pos.title}</p>
                  <div className="flex flex-wrap gap-2 mt-0.5 text-xs text-[var(--gs-steel,#6B7280)]">
                    {pos.nims_type && (
                      <span className="px-1.5 py-0.5 bg-[var(--gs-navy,#0A1628)] text-white rounded">
                        {formatNimsType(pos.nims_type)}
                      </span>
                    )}
                    {pos.discipline && <span>{pos.discipline}</span>}
                    {pos.resource_category && pos.resource_category !== pos.discipline && (
                      <span>· {pos.resource_category}</span>
                    )}
                    {pos.rtlt_code && <span className="text-[11px] text-gray-400">RTLT {pos.rtlt_code}</span>}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleAdd(pos.id)}
                  disabled={adding}
                  className="px-3 py-1.5 text-xs font-semibold bg-[var(--gs-gold,#C5933A)] text-[var(--gs-navy,#0A1628)] rounded hover:bg-[var(--gs-gold,#C5933A)]/90 disabled:opacity-50 transition-colors"
                >
                  Add
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
