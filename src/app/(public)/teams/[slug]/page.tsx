import { notFound } from "next/navigation";
import Link from "next/link";
import { getAllTeams, getTeamBySlug } from "@/lib/teams";
import { getPositionsByCategory } from "@/lib/rtlt";
import { JoinCTA } from "@/components/public/JoinCTA";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import type { Metadata } from "next";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return getAllTeams().map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const team = getTeamBySlug(slug);
  if (!team) return {};
  return {
    title: `${team.title} | Grey Sky Responder Society`,
    description: team.description,
  };
}

export default async function TeamDetailPage({ params }: Props) {
  const { slug } = await params;
  const team = getTeamBySlug(slug);
  if (!team) notFound();

  const grouped = getPositionsByCategory();
  const positions = grouped[team.title] ?? [];

  return (
    <main>
      <Header />

      <section className="bg-[var(--gs-navy)] pt-28 pb-16 px-4">
        <div className="max-w-4xl mx-auto">
          <Link
            href="/teams"
            className="inline-flex items-center gap-2 text-[var(--gs-silver)] hover:text-white text-sm mb-8 transition-colors"
            aria-label="Back to all teams"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            All Teams
          </Link>

          <p className="text-[var(--gs-gold)] text-sm font-semibold uppercase tracking-widest mb-3">
            FEMA RTLT Resource Category
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            {team.title}
          </h1>
          <p className="text-[var(--gs-silver)] text-lg">
            {team.description}
          </p>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 py-12">
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-[var(--gs-navy)] mb-2">
            Positions in This Category
          </h2>
          <p className="text-[var(--gs-steel)] text-sm">
            {positions.length} RTLT position{positions.length !== 1 ? "s" : ""} typed under {team.title}.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {positions.map((pos) => (
            <Link
              key={pos.slug}
              href={`/positions/${pos.slug}`}
              className="group border border-[var(--gs-cloud)] rounded-lg p-4 bg-white hover:border-[var(--gs-gold)]/40 hover:shadow-lg transition-all"
            >
              <p className="font-semibold text-[var(--gs-navy)] mb-1 group-hover:text-[var(--gs-gold)] transition-colors">
                {pos.title}
              </p>
              {pos.record_type && (
                <span className="inline-block text-xs bg-[var(--gs-cloud)]/50 text-[var(--gs-steel)] px-2 py-0.5 rounded">
                  {pos.record_type}
                </span>
              )}
              {pos.type_levels.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {pos.type_levels.map((t) => (
                    <span
                      key={t}
                      className="text-xs bg-[var(--gs-gold)]/10 text-[var(--gs-gold-dark,#9a7430)] px-2 py-0.5 rounded"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              )}
            </Link>
          ))}
        </div>
      </section>

      {/* // TODO: test — verify all 20 team detail pages render with correct position lists */}

      <JoinCTA
        heading="Part of this team type?"
        subtext="Grey Sky documents and verifies your team's capabilities against the FEMA standard."
      />

      <Footer />
    </main>
  );
}
