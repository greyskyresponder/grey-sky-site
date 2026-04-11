import type { Incident } from '@/lib/types/incidents';

interface StatItem {
  label: string;
  value: string;
}

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
}

function formatCost(n: number): string {
  if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  return `$${n.toLocaleString()}`;
}

export default function IncidentImpactSummary({ incident }: { incident: Incident }) {
  const stats: StatItem[] = [];

  if (incident.population_affected) {
    stats.push({ label: 'People Affected', value: formatNumber(incident.population_affected) });
  }
  if (incident.peak_responders) {
    stats.push({ label: 'Peak Responders', value: formatNumber(incident.peak_responders) });
  }
  if (incident.evacuations) {
    stats.push({ label: 'Evacuated', value: formatNumber(incident.evacuations) });
  }
  if (incident.fatalities_civilian || incident.fatalities_responder) {
    const total = (incident.fatalities_civilian ?? 0) + (incident.fatalities_responder ?? 0);
    stats.push({ label: 'Fatalities', value: total.toString() });
  }
  if (incident.structures_destroyed) {
    stats.push({ label: 'Structures Destroyed', value: formatNumber(incident.structures_destroyed) });
  }
  if (incident.structures_damaged) {
    stats.push({ label: 'Structures Damaged', value: formatNumber(incident.structures_damaged) });
  }
  if (incident.estimated_cost) {
    stats.push({ label: 'Estimated Cost', value: formatCost(incident.estimated_cost) });
  }
  if (incident.deployment_count > 0) {
    stats.push({ label: 'Grey Sky Deployments', value: incident.deployment_count.toString() });
  }
  if (incident.responder_count > 0) {
    stats.push({ label: 'Grey Sky Members', value: incident.responder_count.toString() });
  }

  if (stats.length === 0) return null;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="p-4 rounded-lg bg-[var(--gs-navy)] text-center"
        >
          <p className="text-2xl font-bold text-[var(--gs-gold)]">{stat.value}</p>
          <p className="text-xs text-gray-300 mt-1">{stat.label}</p>
        </div>
      ))}
    </div>
  );
}
