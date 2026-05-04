'use client';

import { useCallback, useEffect, useRef, useState, useTransition } from 'react';
import { Search, X } from 'lucide-react';
import {
  addPursuit,
  listPositionFacets,
  searchPositions,
} from '@/lib/actions/requirements';
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
  const [discipline, setDiscipline] = useState('');
  const [category, setCategory] = useState('');
  const [results, setResults] = useState<PositionRow[]>([]);
  const [facets, setFacets] = useState<{
    disciplines: string[];
    categories: string[];
  }>({ disciplines: [], categories: [] });
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [adding, startAdding] = useTransition();
  const prevOpenRef = useRef(open);

  useEffect(() => {
    if (!open) return;
    const handle = setTimeout(async () => {
      setIsSearching(true);
      setError(null);
      const { data, error: err } = await searchPositions({
        query,
        discipline: discipline || undefined,
        resource_category: category || undefined,
        limit: 40,
      });
      if (err) setError(err);
      else setResults(data);
      setIsSearching(false);
    }, 200);
    return () => clearTimeout(handle);
  }, [query, discipline, category, open]);

  // Load facets once when the modal first opens.
  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    (async () => {
      const { disciplines, categories } = await listPositionFacets();
      if (cancelled) return;
      setFacets({ disciplines, categories });
    })();
    return () => {
      cancelled = true;
    };
  }, [open]);

  // Reset form state when modal transitions from open → closed
  const handleClose = useCallback(() => {
    setQuery('');
    setDiscipline('');
    setCategory('');
    setResults([]);
    setError(null);
    onClose();
  }, [onClose]);

  // Track open state transitions via ref (no setState in effect)
  useEffect(() => {
    prevOpenRef.current = open;
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
      handleClose();
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
            onClick={handleClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 rounded"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-5 py-3 border-b border-gray-200 space-y-2">
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
          <div className="flex flex-wrap gap-2">
            <label className="flex-1 min-w-[180px]">
              <span className="sr-only">Filter by discipline</span>
              <select
                value={discipline}
                onChange={(e) => setDiscipline(e.target.value)}
                className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[var(--gs-gold,#C5933A)]"
              >
                <option value="">All disciplines</option>
                {facets.disciplines.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex-1 min-w-[180px]">
              <span className="sr-only">Filter by resource category</span>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[var(--gs-gold,#C5933A)]"
              >
                <option value="">All categories</option>
                {facets.categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>
            {(discipline || category) && (
              <button
                type="button"
                onClick={() => {
                  setDiscipline('');
                  setCategory('');
                }}
                className="px-2 py-1 text-xs text-[var(--gs-steel,#6B7280)] hover:text-[var(--gs-navy,#0A1628)]"
              >
                Clear filters
              </button>
            )}
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
