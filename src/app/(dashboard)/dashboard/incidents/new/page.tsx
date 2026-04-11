import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import IncidentCreateForm from '@/components/incidents/IncidentCreateForm';

export const metadata = {
  title: 'Log New Incident | Grey Sky Responder',
};

export default function NewIncidentPage() {
  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/dashboard/incidents"
          className="inline-flex items-center gap-1 text-sm text-[var(--gs-steel)] hover:text-[var(--gs-navy)] transition-colors mb-3"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Incidents
        </Link>
        <h1 className="text-xl font-bold text-[var(--gs-navy)]">Log New Incident</h1>
        <p className="text-sm text-[var(--gs-steel)] mt-0.5">
          Record an incident so you can attach deployment records to it.
        </p>
      </div>

      <IncidentCreateForm />
    </div>
  );
}
