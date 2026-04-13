// TODO: test — renders community cards with badges
// TODO: test — relationship badge colors match spec
// TODO: test — empty state renders with correct copy
import type { UserCommunity } from '@/lib/types/profile';

const relationshipBadge: Record<string, { label: string; className: string }> = {
  home_base: { label: 'Home Base', className: 'bg-[var(--gs-navy)]/10 text-[var(--gs-navy)]' },
  deployed_to: { label: 'Deployed To', className: 'bg-[var(--gs-gold)]/10 text-[var(--gs-gold)]' },
  assigned_to: { label: 'Assigned To', className: 'bg-[var(--gs-steel)]/20 text-[var(--gs-steel)]' },
  mutual_aid: { label: 'Mutual Aid', className: 'bg-green-100 text-green-700' },
};

export default function CommunitiesSection({ communities }: { communities: UserCommunity[] }) {
  if (communities.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-[var(--gs-cloud)] p-6">
        <h3 className="text-lg font-semibold text-[var(--gs-navy)] mb-2">Where You&apos;ve Served</h3>
        <p className="text-sm text-[var(--gs-steel)]">
          You haven&apos;t added any communities yet. The places you&apos;ve protected — they matter. Add them when you&apos;re ready.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-[var(--gs-cloud)] p-6">
      <h3 className="text-lg font-semibold text-[var(--gs-navy)] mb-4">Where You&apos;ve Served</h3>
      <div className="space-y-3">
        {communities.map((c) => {
          const badge = relationshipBadge[c.relationship] ?? relationshipBadge.assigned_to;
          return (
            <div key={c.id} className="flex items-start justify-between border border-[var(--gs-cloud)] rounded-lg p-3">
              <div className="min-w-0">
                <p className="font-medium text-sm text-[var(--gs-navy)]">
                  {c.community_name}
                  {c.state && <span className="text-[var(--gs-steel)]">, {c.state}</span>}
                </p>
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${badge.className}`}>
                    {badge.label}
                  </span>
                  {c.is_current && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                      Current
                    </span>
                  )}
                </div>
              </div>
              <div className="text-right text-xs text-[var(--gs-steel)] flex-shrink-0 ml-4">
                {c.start_year && (
                  <p>{c.start_year}{c.end_year ? ` – ${c.end_year}` : ' – present'}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
