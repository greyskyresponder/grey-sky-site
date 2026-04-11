import type { Incident, IncidentUpdate } from '@/lib/types/incidents';
import IncidentImpactSummary from './IncidentImpactSummary';
import IncidentTimeline from './IncidentTimeline';

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

const verificationLabels: Record<string, string> = {
  unverified: 'Unverified',
  staff_verified: 'Verified',
  fema_matched: 'FEMA Matched',
  authoritative: 'Authoritative',
};

const verificationColors: Record<string, string> = {
  unverified: 'bg-gray-100 text-gray-600',
  staff_verified: 'bg-green-100 text-green-700',
  fema_matched: 'bg-blue-100 text-blue-700',
  authoritative: 'bg-[var(--gs-gold)]/20 text-[var(--gs-gold)]',
};

const statusLabels: Record<string, string> = {
  active: 'Active',
  closed: 'Closed',
  historical: 'Historical',
  draft: 'Draft',
};

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

export default function IncidentDetail({
  incident,
  updates,
}: {
  incident: Incident;
  updates: IncidentUpdate[];
}) {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <span className="inline-flex px-2.5 py-0.5 text-xs font-medium rounded bg-red-100 text-red-800">
            {typeLabels[incident.incident_type] ?? incident.incident_type}
          </span>
          {incident.incident_subtype && (
            <span className="inline-flex px-2.5 py-0.5 text-xs font-medium rounded bg-gray-100 text-gray-700">
              {incident.incident_subtype}
            </span>
          )}
          <span className={`inline-flex px-2.5 py-0.5 text-xs font-medium rounded ${verificationColors[incident.verification_status]}`}>
            {verificationLabels[incident.verification_status]}
          </span>
          <span className="inline-flex px-2.5 py-0.5 text-xs font-medium rounded bg-gray-100 text-gray-600">
            {statusLabels[incident.status] ?? incident.status}
          </span>
        </div>
        <h1 className="text-2xl font-bold text-[var(--gs-navy)]">{incident.name}</h1>
        <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-[var(--gs-steel)]">
          <span>{incident.location_state}{incident.location_county ? `, ${incident.location_county}` : ''}{incident.location_city ? `, ${incident.location_city}` : ''}</span>
          <span>&middot;</span>
          <span>
            {formatDate(incident.incident_start_date)}
            {incident.incident_end_date ? ` — ${formatDate(incident.incident_end_date)}` : ' — Ongoing'}
          </span>
          {incident.duration_days && (
            <>
              <span>&middot;</span>
              <span>{incident.duration_days} days</span>
            </>
          )}
        </div>
        {incident.fema_disaster_number && (
          <p className="mt-1 text-xs text-[var(--gs-steel)]">
            FEMA Disaster #{incident.fema_disaster_number}
            {incident.fema_declaration_string ? ` (${incident.fema_declaration_string})` : ''}
          </p>
        )}
      </div>

      {/* Description */}
      {incident.description && (
        <div>
          <p className="text-sm text-[var(--gs-navy)] leading-relaxed">{incident.description}</p>
        </div>
      )}

      {/* Narrative */}
      {incident.narrative_summary && (
        <section>
          <h2 className="text-lg font-semibold text-[var(--gs-navy)] mb-3">The Story</h2>
          <p className="text-sm text-[var(--gs-navy)] leading-relaxed whitespace-pre-line">{incident.narrative_summary}</p>
        </section>
      )}

      {/* Impact */}
      <section>
        <h2 className="text-lg font-semibold text-[var(--gs-navy)] mb-3">Impact</h2>
        <IncidentImpactSummary incident={incident} />
        {incident.damage_summary && (
          <p className="text-sm text-[var(--gs-steel)] mt-3 leading-relaxed">{incident.damage_summary}</p>
        )}
      </section>

      {/* Timeline */}
      {updates.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-[var(--gs-navy)] mb-3">Timeline</h2>
          <IncidentTimeline updates={updates} />
        </section>
      )}

      {/* Disciplines & Sectors */}
      {(incident.disciplines_involved?.length || incident.sectors_involved?.length) && (
        <section>
          <h2 className="text-lg font-semibold text-[var(--gs-navy)] mb-3">Response Community</h2>
          {incident.disciplines_involved && incident.disciplines_involved.length > 0 && (
            <div className="mb-3">
              <h3 className="text-xs font-medium text-[var(--gs-steel)] uppercase tracking-wide mb-2">Disciplines Involved</h3>
              <div className="flex flex-wrap gap-2">
                {incident.disciplines_involved.map((d) => (
                  <span key={d} className="px-2.5 py-1 text-xs font-medium bg-[var(--gs-navy)]/5 text-[var(--gs-navy)] rounded">
                    {d.replace(/_/g, ' ')}
                  </span>
                ))}
              </div>
            </div>
          )}
          {incident.sectors_involved && incident.sectors_involved.length > 0 && (
            <div>
              <h3 className="text-xs font-medium text-[var(--gs-steel)] uppercase tracking-wide mb-2">Sectors</h3>
              <div className="flex flex-wrap gap-2">
                {incident.sectors_involved.map((s) => (
                  <span key={s} className="px-2.5 py-1 text-xs font-medium bg-[var(--gs-navy)]/5 text-[var(--gs-navy)] rounded">
                    {s.replace(/_/g, ' ')}
                  </span>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      {/* Lessons Learned */}
      {incident.lessons_learned && (
        <section>
          <h2 className="text-lg font-semibold text-[var(--gs-navy)] mb-3">Lessons Learned</h2>
          <p className="text-sm text-[var(--gs-navy)] leading-relaxed whitespace-pre-line">{incident.lessons_learned}</p>
        </section>
      )}

      {/* Significance */}
      {incident.significance && (
        <section>
          <h2 className="text-lg font-semibold text-[var(--gs-navy)] mb-3">Significance</h2>
          <p className="text-sm text-[var(--gs-navy)] leading-relaxed whitespace-pre-line">{incident.significance}</p>
        </section>
      )}

      {/* External Links */}
      {incident.external_links && incident.external_links.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-[var(--gs-navy)] mb-3">Resources</h2>
          <ul className="space-y-2">
            {incident.external_links.map((link, idx) => (
              <li key={idx}>
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
                >
                  {link.title}
                </a>
                {link.source && (
                  <span className="text-xs text-[var(--gs-steel)] ml-2">({link.source})</span>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
