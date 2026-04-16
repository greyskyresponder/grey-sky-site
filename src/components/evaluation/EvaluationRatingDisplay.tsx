interface Props {
  ratings: {
    leadership: number | null;
    tactical: number | null;
    communication: number | null;
    planning: number | null;
    technical: number | null;
    overall: number | null;
  };
  commentary?: string | null;
}

const AREAS: { key: keyof Props['ratings']; label: string }[] = [
  { key: 'leadership', label: 'Leadership' },
  { key: 'tactical', label: 'Tactical' },
  { key: 'communication', label: 'Communication' },
  { key: 'planning', label: 'Planning' },
  { key: 'technical', label: 'Technical' },
];

function colorFor(rating: number | null): string {
  if (rating === null) return 'bg-gray-200';
  if (rating >= 5) return 'bg-emerald-500';
  if (rating >= 4) return 'bg-emerald-400';
  if (rating >= 3) return 'bg-amber-400';
  if (rating >= 2) return 'bg-orange-500';
  return 'bg-red-500';
}

export function EvaluationRatingDisplay({ ratings, commentary }: Props) {
  return (
    <div className="space-y-4">
      {ratings.overall !== null && (
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold text-[var(--gs-navy)]">
            {ratings.overall.toFixed(2)}
          </span>
          <span className="text-sm text-[var(--gs-steel)]">overall rating (1–5)</span>
        </div>
      )}

      <dl className="space-y-2">
        {AREAS.map(({ key, label }) => {
          const value = ratings[key] as number | null;
          const pct = value ? (value / 5) * 100 : 0;
          return (
            <div key={key} className="flex items-center gap-3">
              <dt className="w-32 text-sm text-[var(--gs-steel)]">{label}</dt>
              <div className="flex-1 h-2 bg-gray-100 rounded overflow-hidden">
                <div
                  className={`h-full ${colorFor(value)}`}
                  style={{ width: `${pct}%` }}
                  aria-label={value !== null ? `${value} of 5` : 'Not rated'}
                />
              </div>
              <dd className="w-10 text-right text-sm font-medium text-[var(--gs-navy)]">
                {value ?? '—'}
              </dd>
            </div>
          );
        })}
      </dl>

      {commentary && (
        <div className="pt-2 border-t border-[var(--gs-cloud)]">
          <p className="text-xs text-[var(--gs-steel)] mb-1">Evaluator commentary</p>
          <p className="text-sm text-[var(--gs-navy)] whitespace-pre-line">{commentary}</p>
        </div>
      )}
    </div>
  );
}
