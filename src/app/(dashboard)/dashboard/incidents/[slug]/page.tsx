import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { getIncidentBySlug } from '@/lib/actions/incidents';
import IncidentDetail from '@/components/incidents/IncidentDetail';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { incident } = await getIncidentBySlug(slug);
  if (!incident) return { title: 'Incident Not Found' };
  return { title: `${incident.name} | Grey Sky Responder` };
}

export default async function IncidentDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { incident, updates } = await getIncidentBySlug(slug);

  if (!incident) notFound();

  return (
    <div className="space-y-6">
      <Link
        href="/dashboard/incidents"
        className="inline-flex items-center gap-1 text-sm text-[var(--gs-steel)] hover:text-[var(--gs-navy)] transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
        Back to Incidents
      </Link>

      <IncidentDetail incident={incident} updates={updates} />
    </div>
  );
}
