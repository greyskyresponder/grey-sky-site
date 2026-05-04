import { Sparkles, ExternalLink } from 'lucide-react';
import { recommendEmiCourses } from '@/lib/actions/requirements';

export default async function EmiCourseRecommendations({
  positionId,
}: {
  positionId: string;
}) {
  const { recommendations, error } = await recommendEmiCourses(positionId);

  if (error) return null;
  if (recommendations.length === 0) {
    return (
      <section className="bg-[var(--gs-navy,#0A1628)] text-white rounded-lg p-4">
        <header className="flex items-center gap-2 text-sm font-semibold">
          <Sparkles className="w-4 h-4 text-[var(--gs-gold,#C5933A)]" />
          AI Assist — Course Plan
        </header>
        <p className="text-xs text-white/70 mt-2">
          No outstanding course requirements. The training side of this checklist is in good shape.
        </p>
      </section>
    );
  }

  const top = recommendations.slice(0, 6);

  return (
    <section className="bg-[var(--gs-navy,#0A1628)] text-white rounded-lg p-4">
      <header className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[var(--gs-gold,#C5933A)]" />
          <h3 className="text-sm font-semibold">AI Assist — Suggested EMI Courses</h3>
        </div>
        <span className="text-[10px] uppercase tracking-wide text-white/60">
          {recommendations.length} gap{recommendations.length === 1 ? '' : 's'}
        </span>
      </header>
      <p className="text-xs text-white/70 mt-1">
        Based on the requirements still missing on this position. Independent Study courses
        are free and self-paced through FEMA EMI.
      </p>

      <ul className="mt-3 divide-y divide-white/10">
        {top.map((rec) => (
          <li
            key={rec.requirement_id}
            className="py-2.5 flex items-start justify-between gap-3"
          >
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                {rec.code && (
                  <span className="text-[11px] font-mono text-[var(--gs-gold,#C5933A)] font-semibold">
                    {rec.code}
                  </span>
                )}
                <p className="text-sm font-medium">{rec.title}</p>
              </div>
              <p className="text-xs text-white/60 mt-0.5">{rec.rationale}</p>
            </div>
            {rec.emi_url && (
              <a
                href={rec.emi_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold bg-[var(--gs-gold,#C5933A)] text-[var(--gs-navy,#0A1628)] rounded hover:bg-[var(--gs-gold,#C5933A)]/90 transition-colors whitespace-nowrap"
              >
                Open on EMI
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </li>
        ))}
      </ul>

      {recommendations.length > top.length && (
        <p className="mt-2 text-[11px] text-white/50">
          + {recommendations.length - top.length} more on the checklist below.
        </p>
      )}
    </section>
  );
}
