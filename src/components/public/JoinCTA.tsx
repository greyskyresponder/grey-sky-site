import Link from "next/link";

interface JoinCTAProps {
  heading?: string;
  subtext?: string;
}

export function JoinCTA({
  heading = "Your service deserves a record.",
  subtext = "Every responder has a moment that defines them. Tell us yours. It's how we start building your record.",
}: JoinCTAProps) {
  return (
    <section className="bg-[var(--gs-navy)] text-white py-16 px-4">
      <div className="max-w-2xl mx-auto text-center">
        <h2 className="text-2xl sm:text-3xl font-bold mb-4">{heading}</h2>
        <p className="text-[var(--gs-silver)] mb-8 text-lg">{subtext}</p>
        <Link
          href="/join"
          className="inline-block bg-[var(--gs-gold)] text-[var(--gs-navy)] font-semibold px-8 py-4 rounded-lg hover:bg-[var(--gs-gold-light)] transition-colors text-lg"
        >
          Tell Your Story
        </Link>
      </div>
    </section>
  );
}
