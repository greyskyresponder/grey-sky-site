type CompletionBarProps = {
  percent: number;
  verified: number;
  total: number;
  pending?: number;
  rejected?: number;
  expired?: number;
};

export default function CompletionBar({
  percent,
  verified,
  total,
  pending = 0,
  rejected = 0,
  expired = 0,
}: CompletionBarProps) {
  const clamped = Math.max(0, Math.min(100, percent));
  const status =
    total === 0
      ? 'No required items'
      : `${verified} of ${total} required verified — ${clamped}%`;

  return (
    <div>
      <div className="flex items-center justify-between text-xs text-[var(--gs-steel,#6B7280)] mb-1">
        <span className="font-medium">{status}</span>
        {(pending > 0 || rejected > 0 || expired > 0) && (
          <span className="flex items-center gap-2">
            {pending > 0 && <span className="text-[var(--gs-gold,#C5933A)]">{pending} pending</span>}
            {rejected > 0 && <span className="text-red-600">{rejected} rejected</span>}
            {expired > 0 && <span className="text-amber-600">{expired} expired</span>}
          </span>
        )}
      </div>
      <div
        className="h-2 w-full bg-gray-200 rounded-full overflow-hidden"
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className="h-full bg-[var(--gs-gold,#C5933A)] transition-all"
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}
