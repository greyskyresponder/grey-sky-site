import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getAllPositions } from "@/lib/rtlt";
import { JoinCTA } from "@/components/public/JoinCTA";
import PositionsGrid from "@/components/public/PositionsGrid";

export const metadata: Metadata = {
  title: "RTLT Positions | Grey Sky Responder Society",
  description:
    "Browse all FEMA Resource Typing Library Tool positions — the national standard for emergency management roles.",
};

export default function PositionsPage() {
  const positions = getAllPositions();
  const total = positions.length;

  // Extract unique categories sorted alphabetically for the filter
  const categories = [
    ...new Set(positions.map((p) => p.category).filter(Boolean)),
  ].sort();

  // Serialize only the fields the client component needs
  const clientPositions = positions.map((p) => ({
    slug: p.slug,
    title: p.title,
    category: p.category,
    record_type: p.record_type,
    type_levels: p.type_levels,
  }));

  return (
    <main>
      <Header />

      <section className="bg-[var(--gs-navy)] pt-28 pb-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-[var(--gs-gold)] font-semibold text-sm uppercase tracking-[0.2em] mb-4">
            FEMA Resource Typing Library Tool
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            RTLT Positions
          </h1>
          <p className="text-[var(--gs-silver)] text-lg max-w-2xl mx-auto">
            {total} entries from the FEMA Resource Typing Library Tool —
            the national standard for emergency management roles.
          </p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 py-12">
        <PositionsGrid positions={clientPositions} categories={categories} />
      </section>

      <JoinCTA
        heading="Serve in one of these roles?"
        subtext="Start building your verified record today."
      />

      <Footer />
    </main>
  );
}
