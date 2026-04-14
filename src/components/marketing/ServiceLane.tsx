import Link from "next/link";

interface ServiceLaneProps {
  eyebrow: string;
  headline: string;
  body: string;
  points: string[];
  ctaText: string;
  ctaHref: string;
  variant: "primary" | "secondary";
}

export function ServiceLane({
  eyebrow,
  headline,
  body,
  points,
  ctaText,
  ctaHref,
  variant,
}: ServiceLaneProps) {
  const isPrimary = variant === "primary";

  const containerClass = isPrimary
    ? "bg-[var(--gs-navy)] text-white border border-[var(--gs-gold)]/30"
    : "bg-white text-[var(--gs-navy)] border-2 border-[var(--gs-gold)]";

  const eyebrowClass = isPrimary ? "text-[var(--gs-gold)]" : "text-[var(--gs-gold-dark)]";
  const bodyClass = isPrimary ? "text-[var(--gs-silver)]" : "text-[var(--gs-steel)]";
  const bulletIconClass = isPrimary ? "text-[var(--gs-gold)]" : "text-[var(--gs-gold-dark)]";
  const ctaClass = isPrimary
    ? "bg-[var(--gs-gold)] text-[var(--gs-navy)] hover:bg-[var(--gs-gold-light)]"
    : "bg-[var(--gs-navy)] text-white hover:bg-[var(--gs-slate)]";

  return (
    <div className={`flex flex-col rounded-xl p-8 ${containerClass}`}>
      <p className={`font-semibold text-xs uppercase tracking-[0.2em] mb-3 ${eyebrowClass}`}>
        {eyebrow}
      </p>
      <h3 className="text-2xl sm:text-3xl font-bold leading-tight mb-4">{headline}</h3>
      <p className={`leading-relaxed mb-6 ${bodyClass}`}>{body}</p>
      <ul className="space-y-3 mb-8 flex-1">
        {points.map((point) => (
          <li key={point} className="flex items-start gap-3 text-sm leading-relaxed">
            <svg
              className={`w-5 h-5 shrink-0 mt-0.5 ${bulletIconClass}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>{point}</span>
          </li>
        ))}
      </ul>
      <Link
        href={ctaHref}
        className={`inline-flex items-center justify-center px-6 py-3 rounded-lg font-semibold text-sm transition-colors ${ctaClass}`}
      >
        {ctaText}
      </Link>
    </div>
  );
}
