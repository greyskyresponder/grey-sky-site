import Link from 'next/link';
import type { DeploymentRecordDetail } from '@/lib/types/deployment-views';
import { RecordVerificationBadge } from './RecordVerificationBadge';
import { RecordStatusBadge } from './RecordStatusBadge';

export function RecordCard({ record }: { record: DeploymentRecordDetail }) {
  const positionTitle =
    record.position?.title ?? record.positionFreeText ?? 'Unknown Position';
  const incidentName = record.incident?.name ?? 'No incident linked';
  const dateRange = record.endDate
    ? `${new Date(record.startDate).toLocaleDateString()} \u2013 ${new Date(record.endDate).toLocaleDateString()}`
    : `${new Date(record.startDate).toLocaleDateString()} \u2013 Present`;

  return (
    <Link
      href={`/dashboard/records/${record.id}`}
      className="block bg-white rounded-lg shadow-sm border border-[var(--gs-cloud)] p-4 hover:border-[var(--gs-gold)]/40 hover:shadow transition-all"
    >
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-semibold text-[var(--gs-navy)] text-sm">{positionTitle}</h3>
        <div className="flex items-center gap-2 flex-shrink-0">
          <RecordVerificationBadge tier={record.verificationTier} />
          <RecordStatusBadge status={record.status} />
        </div>
      </div>
      <p className="text-sm text-[var(--gs-steel)]">{incidentName}</p>
      <div className="flex items-center gap-4 mt-2 text-xs text-[var(--gs-steel)]">
        <span>{dateRange}</span>
        {record.hours && <span>{record.hours}h</span>}
        {record.organization && <span>{record.organization.name}</span>}
      </div>
    </Link>
  );
}
