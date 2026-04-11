import type { IncidentUpdate } from '@/lib/types/incidents';

const updateTypeColors: Record<string, string> = {
  declaration: 'bg-blue-500',
  escalation: 'bg-red-500',
  milestone: 'bg-[var(--gs-gold)]',
  operational: 'bg-green-500',
  demobilization: 'bg-purple-500',
  editorial: 'bg-gray-500',
  correction: 'bg-orange-500',
};

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function IncidentTimeline({ updates }: { updates: IncidentUpdate[] }) {
  if (updates.length === 0) return null;

  return (
    <div className="space-y-0">
      {updates.map((update, idx) => (
        <div key={update.id} className="relative flex gap-4 pb-6 last:pb-0">
          {/* Vertical line */}
          {idx < updates.length - 1 && (
            <div className="absolute left-[7px] top-4 bottom-0 w-px bg-[var(--gs-cloud)]" />
          )}
          {/* Dot */}
          <div className={`relative w-3.5 h-3.5 rounded-full mt-1 flex-shrink-0 ${updateTypeColors[update.update_type] ?? 'bg-gray-400'}`} />
          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-2">
              <span className="text-xs text-[var(--gs-steel)]">{formatDate(update.update_date)}</span>
              {update.source && (
                <span className="text-xs text-[var(--gs-steel)]">&middot; {update.source}</span>
              )}
            </div>
            <h4 className="text-sm font-medium text-[var(--gs-navy)] mt-0.5">{update.title}</h4>
            {update.body && (
              <p className="text-sm text-[var(--gs-steel)] mt-1 leading-relaxed">{update.body}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
