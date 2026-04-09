import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WaitlistForm from "@/components/WaitlistForm";
import { disciplines } from "@/lib/disciplines";

type Props = {
  params: Promise<{ discipline: string }>;
};

export async function generateStaticParams() {
  return disciplines.map((d) => ({ discipline: d.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { discipline: slug } = await params;
  const d = disciplines.find((d) => d.slug === slug);
  if (!d) return {};
  return {
    title: `${d.name} (${d.abbr}) | Grey Sky Responder Society`,
    description: `${d.description} FEMA RTLT-aligned credentialing for ${d.name} responders.`,
  };
}

export default async function DisciplinePage({ params }: Props) {
  const { discipline: slug } = await params;
  const d = disciplines.find((d) => d.slug === slug);
  if (!d) notFound();

  return (
    <main>
      <Header />

      <section className="bg-[var(--gs-navy)] pt-28 pb-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Link
            href="/standards"
            className="inline-flex items-center gap-2 text-[var(--gs-silver)] hover:text-white text-sm mb-8 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            All Standards
          </Link>
          <span className="text-5xl block mb-4">{d.icon}</span>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">{d.name}</h1>
          <span className="text-[var(--gs-gold)] font-semibold text-sm uppercase tracking-wider">{d.abbr}</span>
          <p className="text-lg text-[var(--gs-silver)] leading-relaxed mt-6 max-w-xl mx-auto">
            {d.description}
          </p>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-b from-[var(--gs-slate)] to-[var(--gs-navy)]">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-block px-4 py-1.5 rounded-full bg-[var(--gs-gold)]/10 border border-[var(--gs-gold)]/30 mb-6">
            <span className="text-[var(--gs-gold)] text-sm font-semibold">Coming Soon</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
            {d.abbr} Credentialing Pathways
          </h2>
          <p className="text-[var(--gs-silver)] text-lg mb-8 leading-relaxed">
            FEMA RTLT-aligned certification and credentialing for {d.name} professionals
            is coming to Grey Sky. Join the waitlist to be notified when this discipline launches.
          </p>
          <WaitlistForm />
        </div>
      </section>

      <Footer />
    </main>
  );
}
