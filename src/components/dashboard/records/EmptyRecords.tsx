import Link from 'next/link';
import { FileText } from 'lucide-react';

export function EmptyRecords() {
  return (
    <div className="text-center py-16">
      <FileText className="w-12 h-12 text-[var(--gs-cloud)] mx-auto mb-4" />
      <h3 className="text-lg font-semibold text-[var(--gs-navy)] mb-2">
        Your service record starts here.
      </h3>
      <p className="text-sm text-[var(--gs-steel)] max-w-md mx-auto mb-6">
        Every deployment you record becomes part of your verified professional history.
        Start with what you remember — you can add details and request verifications later.
      </p>
      <Link
        href="/dashboard/records/new"
        className="inline-flex items-center gap-2 bg-[var(--gs-navy)] text-white px-5 py-2.5 rounded-md text-sm font-medium hover:opacity-90 transition-opacity"
      >
        Record a Deployment
      </Link>
    </div>
  );
}
