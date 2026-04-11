import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getAllTeams } from "@/lib/teams";
import { JoinCTA } from "@/components/public/JoinCTA";

export const metadata: Metadata = {
  title: "Resource Categories | Grey Sky Responder Society",
  description:
    "All 20 FEMA RTLT resource categories. Grey Sky credentials specialty response teams aligned to the national standard.",
};

export default function TeamsPage() {
  const teams = getAllTeams();

  return (
    <main>
      <Header />

      <section className="bg-[var(--gs-navy)] pt-28 pb-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-[var(--gs-gold)] font-semibold text-sm uppercase tracking-[0.2em] mb-4">
            FEMA RTLT Aligned
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Resource Categories
          </h1>
          <p className="text-[var(--gs-silver)] text-lg max-w-2xl mx-auto">
            {teams.length} FEMA RTLT resource categories — the national standard
            for typing emergency management teams and positions.
          </p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {teams.map((team) => (
            <Link
              key={team.slug}
              href={`/teams/${team.slug}`}
              className="group border border-[var(--gs-cloud)] rounded-lg p-6 bg-white hover:border-[var(--gs-gold)]/40 hover:shadow-lg transition-all"
            >
              <h2 className="font-bold text-[var(--gs-navy)] text-lg mb-2 group-hover:text-[var(--gs-gold)] transition-colors">
                {team.title}
              </h2>
              <p className="text-[var(--gs-steel)] text-sm leading-relaxed mb-3">
                {team.description}
              </p>
              <p className="text-xs text-[var(--gs-gold)] font-semibold">
                {team.positionCount} position{team.positionCount !== 1 ? "s" : ""}
              </p>
            </Link>
          ))}
        </div>
      </section>

      <JoinCTA
        heading="Your team deserves recognition."
        subtext="Grey Sky credentialing starts with verified standards."
      />

      <Footer />
    </main>
  );
}
