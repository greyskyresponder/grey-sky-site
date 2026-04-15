interface TierCardProps {
  tier: string;
  title: string;
  priceRange: string;
  items: string[];
  note: string;
  variant: "free" | "low" | "medium" | "premium" | "products";
}

const variantStyles: Record<
  TierCardProps["variant"],
  {
    container: string;
    eyebrow: string;
    title: string;
    price: string;
    item: string;
    bullet: string;
    note: string;
  }
> = {
  free: {
    container: "bg-white border-2 border-[var(--gs-success)]/60",
    eyebrow: "text-[var(--gs-success)]",
    title: "text-[var(--gs-navy)]",
    price: "text-[var(--gs-success)]",
    item: "text-[var(--gs-steel)]",
    bullet: "text-[var(--gs-success)]",
    note: "text-[var(--gs-navy)]",
  },
  low: {
    container: "bg-white border-2 border-[var(--gs-gold)]",
    eyebrow: "text-[var(--gs-gold)]",
    title: "text-[var(--gs-navy)]",
    price: "text-[var(--gs-gold)]",
    item: "text-[var(--gs-steel)]",
    bullet: "text-[var(--gs-gold)]",
    note: "text-[var(--gs-navy)]",
  },
  medium: {
    container: "bg-white border-2 border-[var(--gs-navy)]",
    eyebrow: "text-[var(--gs-navy)]",
    title: "text-[var(--gs-navy)]",
    price: "text-[var(--gs-navy)]",
    item: "text-[var(--gs-steel)]",
    bullet: "text-[var(--gs-navy)]",
    note: "text-[var(--gs-navy)]",
  },
  premium: {
    container: "bg-[var(--gs-navy)] border-2 border-[var(--gs-gold)] text-white",
    eyebrow: "text-[var(--gs-gold)]",
    title: "text-white",
    price: "text-[var(--gs-gold)]",
    item: "text-[var(--gs-silver)]",
    bullet: "text-[var(--gs-gold)]",
    note: "text-[var(--gs-silver)]",
  },
  products: {
    container: "bg-[var(--gs-cloud)] border-2 border-[var(--gs-silver)]",
    eyebrow: "text-[var(--gs-steel)]",
    title: "text-[var(--gs-navy)]",
    price: "text-[var(--gs-steel)]",
    item: "text-[var(--gs-steel)]",
    bullet: "text-[var(--gs-steel)]",
    note: "text-[var(--gs-navy)]",
  },
};

export function TierCard({ tier, title, priceRange, items, note, variant }: TierCardProps) {
  const s = variantStyles[variant];

  return (
    <div className={`flex flex-col rounded-xl p-6 sm:p-8 ${s.container}`}>
      <p className={`font-semibold text-xs uppercase tracking-[0.2em] mb-2 ${s.eyebrow}`}>
        {tier}
      </p>
      <h3 className={`text-xl sm:text-2xl font-bold leading-tight mb-2 ${s.title}`}>
        {title}
      </h3>
      <p className={`text-sm font-semibold mb-5 ${s.price}`}>{priceRange}</p>
      <ul className="space-y-2.5 mb-5 flex-1">
        {items.map((item) => (
          <li key={item} className={`flex items-start gap-3 text-sm leading-relaxed ${s.item}`}>
            <svg
              className={`w-4 h-4 shrink-0 mt-1 ${s.bullet}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>{item}</span>
          </li>
        ))}
      </ul>
      <p className={`text-sm italic leading-relaxed ${s.note}`}>{note}</p>
    </div>
  );
}
