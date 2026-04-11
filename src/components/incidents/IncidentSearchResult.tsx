'use client';

import Link from 'next/link';
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

const typeColors: Record<string, string> = {
  natural_disaster: 'bg-red-100 text-red-800',
  technological: 'bg-orange-100 text-orange-800',
  human_caused: 'bg-purple-100 text-purple-800',
  biological: 'bg-green-100 text-green-800',
  planned_event: 'bg-blue-100 text-blue-800',
  exercise: 'bg-cyan-100 text-cyan-800',
  training: 'bg-teal-100 text-teal-800',
  steady_state: 'bg-gray-100 text-gray-800',
  disaster: 'bg-red-100 text-red-800',
};

const verificationColors: Record<string, string> = {
  unverified: 'bg-gray-100 text-gray-600',
  staff_verified: 'bg-green-100 text-green-700',
  fema_matched: 'bg-blue-100 text-blue-700',
  authoritative: 'bg-[var(--gs-gold)]/20 text-[var(--gs-gold)]',
};

const verificationLabels: Record<string, string> = {
  unverified: 'Unverified',
  staff_verified: 'Verified',
  fema_matched: 'FEMA Matched',
  authoritative: 'Authoritative',
};

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function IncidentSearchResult({
  incident,
  basePath = '/dashboard/incidents',
}: {
  incident: IncidentSummary;
  basePath?: string;
}) {
  return (
    <Link
      href={`${basePath}/${incident.slug}`}
      className="block p-4 border border-[var(--gs-cloud)] rounded-lg hover:border-[var(--gs-gold)] hover:bg-[var(--gs-gold)]/5 transition-colors"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-[var(--gs-navy)] truncate">
            {incident.name}
          </h3>
          <div className="flex flex-wrap items-center gap-2 mt-1.5">
            <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded ${typeColors[incident.incident_type] ?? typeColors.disaster}`}>
              {typeLabels[incident.incident_type] ?? incident.incident_type}
            </span>
            <span className="text-xs text-[var(--gs-steel)]">
              {incident.location_state}
              {incident.location_county ? `, ${incident.location_county}` : ''}
            </span>
            <span className="text-xs text-[var(--gs-steel)]">
              {formatDate(incident.incident_start_date)}
              {incident.incident_end_date ? ` — ${formatDate(incident.incident_end_date)}` : ''}
            </span>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
          <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded ${verificationColors[incident.verification_status]}`}>
            {verificationLabels[incident.verification_status]}
          </span>
          {incident.deployment_count > 0 && (
            <span className="text-xs text-[var(--gs-steel)]">
              {incident.deployment_count} deployment{incident.deployment_count !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
