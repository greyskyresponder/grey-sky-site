'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, X } from 'lucide-react';
import { searchIncidents } from '@/lib/actions/incidents';
import type { IncidentSummary } from '@/lib/types/incidents';

const typeLabels: Record<string, string> = {
  natural_disaster: 'Natural Disaster',
  technological: 'Technological',
  human_caused: 'Human-Caused',
  biological: 'Biological',
  planned_event: 'Planned Event',
  exercise: 'Exercise',
  training: 'Training',
  steady_state: 'Steady State',
  disaster: 'Disaster',
};

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

export default function IncidentSelector({
  onSelect,
  onClear,
}: {
  selectedId?: string | null;
  onSelect: (incident: IncidentSummary) => void;
  onClear: () => void;
}) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<IncidentSummary[]>([]);
  const [selected, setSelected] = useState<IncidentSummary | null>(null);
  const [showResults, setShowResults] = useState(false);

  const doSearch = useCallback(async (q: string) => {
    if (!q.trim()) {
      setResults([]);
      return;
    }
    const { data } = await searchIncidents({ query: q, per_page: 8 });
    setResults(data);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => doSearch(query), 300);
    return () => clearTimeout(timer);
  }, [query, doSearch]);

  const handleSelect = (incident: IncidentSummary) => {
    setSelected(incident);
    setShowResults(false);
    setQuery('');
    onSelect(incident);
  };

  const handleClear = () => {
    setSelected(null);
    onClear();
  };

  if (selected) {
    return (
      <div className="flex items-center justify-between p-3 border border-[var(--gs-gold)] rounded-lg bg-[var(--gs-gold)]/5">
        <div className="min-w-0">
          <p className="text-sm font-medium text-[var(--gs-navy)] truncate">{selected.name}</p>
          <p className="text-xs text-[var(--gs-steel)]">
            {typeLabels[selected.incident_type] ?? selected.incident_type} &middot; {selected.location_state} &middot; {formatDate(selected.incident_start_date)}
          </p>
        </div>
        <button
          type="button"
          onClick={handleClear}
          className="p-1 text-[var(--gs-steel)] hover:text-[var(--gs-navy)]"
          aria-label="Clear selection"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--gs-steel)]" />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowResults(true);
          }}
          onFocus={() => setShowResults(true)}
          placeholder="Search for an incident..."
          aria-label="Search for an incident"
          className="w-full pl-10 pr-4 py-2 rounded-md border border-[var(--gs-cloud)] text-sm text-[var(--gs-navy)] focus:border-[var(--gs-gold)] focus:outline-none focus:ring-1 focus:ring-[var(--gs-gold)]"
        />
      </div>

      {showResults && results.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-[var(--gs-cloud)] rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {results.map((incident) => (
            <button
              key={incident.id}
              type="button"
              onClick={() => handleSelect(incident)}
              className="w-full text-left px-3 py-2.5 hover:bg-[var(--gs-gold)]/5 border-b border-[var(--gs-cloud)] last:border-0"
            >
              <p className="text-sm font-medium text-[var(--gs-navy)] truncate">{incident.name}</p>
              <p className="text-xs text-[var(--gs-steel)]">
                {typeLabels[incident.incident_type] ?? incident.incident_type} &middot; {incident.location_state} &middot; {formatDate(incident.incident_start_date)}
              </p>
            </button>
          ))}
        </div>
      )}

      {showResults && query.trim() && results.length === 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-[var(--gs-cloud)] rounded-lg shadow-lg p-3">
          <p className="text-xs text-[var(--gs-steel)]">No incidents found for &ldquo;{query}&rdquo;</p>
        </div>
      )}
    </div>
  );
}
