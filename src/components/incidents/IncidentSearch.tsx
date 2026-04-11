// TODO: Add tests — debounced search triggers, filter changes reset to page 1, pagination controls, empty state, loading state
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Search, Plus } from 'lucide-react';
import { searchIncidents } from '@/lib/actions/incidents';
import IncidentSearchResult from './IncidentSearchResult';
import type { IncidentSummary } from '@/lib/types/incidents';

const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS',
  'KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY',
  'NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV',
  'WI','WY','DC','PR','VI','GU','AS','MP',
];

const INCIDENT_TYPES = [
  { value: 'natural_disaster', label: 'Natural Disaster' },
  { value: 'technological', label: 'Technological' },
  { value: 'human_caused', label: 'Human-Caused' },
  { value: 'biological', label: 'Biological' },
  { value: 'planned_event', label: 'Planned Event' },
  { value: 'exercise', label: 'Exercise' },
  { value: 'training', label: 'Training' },
  { value: 'steady_state', label: 'Steady State' },
];

export default function IncidentSearch({
  initialResults,
  initialTotal,
}: {
  initialResults: IncidentSummary[];
  initialTotal: number;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [query, setQuery] = useState(searchParams.get('query') ?? '');
  const [incidentType, setIncidentType] = useState(searchParams.get('incident_type') ?? '');
  const [state, setState] = useState(searchParams.get('location_state') ?? '');
  const [results, setResults] = useState<IncidentSummary[]>(initialResults);
  const [total, setTotal] = useState(initialTotal);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(Number(searchParams.get('page') ?? '1'));

  const doSearch = useCallback(async (searchQuery: string, type: string, st: string, p: number) => {
    setLoading(true);
    const params: Record<string, string | number | undefined> = {
      query: searchQuery || undefined,
      incident_type: type || undefined,
      location_state: st || undefined,
      page: p,
      per_page: 20,
    };
    const { data, total: t } = await searchIncidents(params);
    setResults(data);
    setTotal(t);
    setLoading(false);
  }, []);

  // Debounced search on query change
  useEffect(() => {
    const timer = setTimeout(() => {
      doSearch(query, incidentType, state, 1);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [query, incidentType, state, doSearch]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    doSearch(query, incidentType, state, newPage);
  };

  const totalPages = Math.ceil(total / 20);

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--gs-steel)]" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search incidents by name..."
          aria-label="Search incidents by name"
          className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-[var(--gs-cloud)] text-sm text-[var(--gs-navy)] focus:border-[var(--gs-gold)] focus:outline-none focus:ring-1 focus:ring-[var(--gs-gold)]"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <select
          value={incidentType}
          onChange={(e) => setIncidentType(e.target.value)}
          aria-label="Filter by incident type"
          className="rounded-md border border-[var(--gs-cloud)] px-3 py-2 text-sm text-[var(--gs-navy)] focus:border-[var(--gs-gold)] focus:outline-none"
        >
          <option value="">All Types</option>
          {INCIDENT_TYPES.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>

        <select
          value={state}
          onChange={(e) => setState(e.target.value)}
          aria-label="Filter by state"
          className="rounded-md border border-[var(--gs-cloud)] px-3 py-2 text-sm text-[var(--gs-navy)] focus:border-[var(--gs-gold)] focus:outline-none"
        >
          <option value="">All States</option>
          {US_STATES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {/* Results */}
      <div className="space-y-2">
        {loading && (
          <div className="py-8 text-center text-sm text-[var(--gs-steel)]">Searching...</div>
        )}
        {!loading && results.length === 0 && (
          <div className="py-8 text-center">
            <p className="text-sm text-[var(--gs-steel)]">No incidents found.</p>
            <Link
              href="/dashboard/incidents/new"
              className="inline-flex items-center gap-2 mt-3 px-4 py-2 text-sm font-medium bg-[var(--gs-gold)] text-[var(--gs-navy)] rounded-lg hover:bg-[var(--gs-gold)]/90 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Log New Incident
            </Link>
          </div>
        )}
        {!loading && results.map((incident) => (
          <IncidentSearchResult key={incident.id} incident={incident} />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-[var(--gs-cloud)]">
          <span className="text-xs text-[var(--gs-steel)]">
            {total} incident{total !== 1 ? 's' : ''} found
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => handlePageChange(page - 1)}
              disabled={page <= 1}
              className="px-3 py-1.5 text-xs font-medium rounded border border-[var(--gs-cloud)] text-[var(--gs-navy)] hover:bg-[var(--gs-cloud)]/50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="px-3 py-1.5 text-xs text-[var(--gs-steel)]">
              {page} / {totalPages}
            </span>
            <button
              onClick={() => handlePageChange(page + 1)}
              disabled={page >= totalPages}
              className="px-3 py-1.5 text-xs font-medium rounded border border-[var(--gs-cloud)] text-[var(--gs-navy)] hover:bg-[var(--gs-cloud)]/50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
