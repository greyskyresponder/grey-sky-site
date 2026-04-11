import { Suspense } from 'react';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { searchIncidents } from '@/lib/actions/incidents';
import IncidentSearch from '@/components/incidents/IncidentSearch';

export const metadata = {
  title: 'Incident Registry | Grey Sky Responder',
};

export default async function IncidentsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const { data, total } = await searchIncidents({
    query: params.query,
    incident_type: params.incident_type,
    location_state: params.location_state,
    page: params.page ? Number(params.page) : 1,
    per_page: 20,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[var(--gs-navy)]">Incident Registry</h1>
          <p className="text-sm text-[var(--gs-steel)] mt-0.5">
            Search existing incidents or log a new one
          </p>
        </div>
        <Link
          href="/dashboard/incidents/new"
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-[var(--gs-gold)] text-[var(--gs-navy)] rounded-lg hover:bg-[var(--gs-gold)]/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Log Incident
        </Link>
      </div>

      <Suspense fallback={<div className="py-8 text-center text-sm text-[var(--gs-steel)]">Loading...</div>}>
        <IncidentSearch initialResults={data} initialTotal={total} />
      </Suspense>
    </div>
  );
}
