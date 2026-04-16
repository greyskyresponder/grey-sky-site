type Status = 'pending' | 'completed' | 'denied' | 'expired';

const STYLES: Record<Status, { label: string; className: string }> = {
  pending: { label: 'Pending', className: 'bg-amber-50 text-amber-800 border-amber-200' },
  completed: { label: 'Completed', className: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
  denied: { label: 'Declined', className: 'bg-red-50 text-red-800 border-red-200' },
  expired: { label: 'Expired', className: 'bg-gray-50 text-gray-600 border-gray-200' },
};

export function EvaluationStatusBadge({ status }: { status: Status }) {
  const s = STYLES[status] ?? STYLES.pending;
  return (
    <span
      className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium ${s.className}`}
    >
      {s.label}
    </span>
  );
}
