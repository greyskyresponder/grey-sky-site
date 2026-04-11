import type { DeploymentRecordStatus } from '@/lib/types/enums';

const config: Record<DeploymentRecordStatus, { label: string; description: string; className: string }> = {
  draft: {
    label: 'Draft',
    description: 'Not yet submitted. You can still edit this record.',
    className: 'bg-gray-100 text-gray-700',
  },
  submitted: {
    label: 'Submitted',
    description: 'Submitted to your service record.',
    className: 'bg-[var(--gs-gold)]/10 text-[var(--gs-gold-dark)]',
  },
  verified: {
    label: 'Verified',
    description: 'Confirmed through independent verification.',
    className: 'bg-green-100 text-green-700',
  },
};

export function RecordStatusBadge({
  status,
  showDescription = false,
}: {
  status: DeploymentRecordStatus;
  showDescription?: boolean;
}) {
  const { label, description, className } = config[status];

  return (
    <div>
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${className}`}
      >
        {label}
      </span>
      {showDescription && (
        <p className="text-xs text-[var(--gs-steel)] mt-1">{description}</p>
      )}
    </div>
  );
}
