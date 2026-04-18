import { notFound } from "next/navigation";
import Link from "next/link";
import { getPositionBySlug } from "@/lib/rtlt";
import { JoinCTA } from "@/components/public/JoinCTA";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import type { Metadata } from "next";

type Props = {
  params: Promise<{ slug: string }>;
};

// On-demand rendering — removed generateStaticParams() to avoid
// pre-rendering 625 position pages (2,500 files / 60 MB) which
// caused Azure SWA warm-up timeouts during deployment.
// Pages render instantly on first request from static JSON data.
export const dynamicParams = true;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const position = getPositionBySlug(slug);
  if (!position) return {};
  return {
    title: `${position.title} | Grey Sky Responder Society`,
    description: position.description.slice(0, 160),
  };
}

export default async function PositionDetailPage({ params }: Props) {
  const { slug } = await params;
  const position = getPositionBySlug(slug);
  if (!position) notFound();

  return (
    <main>
      <Header />

      <section className="bg-[var(--gs-navy)] pt-28 pb-16 px-4">
        <div className="max-w-4xl mx-auto">
          <Link
            href="/positions"
            className="inline-flex items-center gap-2 text-[var(--gs-silver)] hover:text-white text-sm mb-8 transition-colors"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            All Positions
          </Link>

          {position.category && (
            <p className="text-[var(--gs-gold)] text-sm font-semibold uppercase tracking-widest mb-3">
              {position.category}
            </p>
          )}
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            {position.title}
          </h1>
          <div className="flex flex-wrap gap-2">
            {position.record_type && (
              <span className="bg-white/10 text-white/90 text-sm px-3 py-1 rounded">
                {position.record_type}
              </span>
            )}
            {position.type_levels.map((t) => (
              <span
                key={t}
                className="bg-[var(--gs-gold)]/20 text-[var(--gs-gold)] text-sm px-3 py-1 rounded"
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-4 py-12">
        <div className="mb-12">
          <h2 className="text-xl font-semibold text-[var(--gs-navy)] mb-4">
            About This Position
          </h2>
          <p className="text-[var(--gs-steel)] leading-relaxed">
            {position.description}
          </p>
        </div>

        {position.training && (
          <div className="mb-12">
            <h2 className="text-xl font-semibold text-[var(--gs-navy)] mb-4">
              Training Requirements
            </h2>
            <p className="text-[var(--gs-steel)] leading-relaxed whitespace-pre-line">
              {position.training
                .replace(/([a-z])([A-Z])/g, "$1 $2")
                .replace(/\s{2,}/g, " ")
                .slice(0, 1500)}
            </p>
          </div>
        )}

        {position.experience && (
          <div className="mb-12">
            <h2 className="text-xl font-semibold text-[var(--gs-navy)] mb-4">
              Experience
            </h2>
            <p className="text-[var(--gs-steel)] leading-relaxed whitespace-pre-line">
              {position.experience
                .replace(/([a-z])([A-Z])/g, "$1 $2")
                .replace(/\s{2,}/g, " ")
                .slice(0, 1500)}
            </p>
          </div>
        )}

        <div className="bg-[var(--gs-white)] border border-[var(--gs-cloud)] rounded-lg p-6">
          <p className="text-sm text-[var(--gs-steel)] mb-1">
            FEMA RTLT Standard
          </p>
          <p className="font-medium text-[var(--gs-navy)]">
            {position.title}
          </p>
          <p className="text-sm text-[var(--gs-steel)] mt-2">
            ID: {position.id}
          </p>
        </div>
      </section>

      <JoinCTA
        heading="Do you serve in this role?"
        subtext="Grey Sky documents and verifies your service against the FEMA standard. Start your record today."
      />

      <Footer />
    </main>
  );
}
