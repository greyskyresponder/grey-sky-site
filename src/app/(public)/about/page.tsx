import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "About | Grey Sky Responder Society",
  description:
    "Grey Sky Responder Society — professional development and credentialing for disaster responders. A Longview Solutions Group initiative.",
};

const stats = [
  { value: "220+", label: "Professionals Deployed" },
  { value: "17+", label: "Discipline Categories" },
  { value: "Hours", label: "Not Days — Response Time" },
  { value: "FEMA", label: "RTLT / NQS Aligned" },
];

export default function AboutPage() {
  return (
    <main>
      <Header />

      {/* Hero */}
      <section className="bg-[var(--gs-navy)] pt-28 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-[var(--gs-gold)] font-semibold text-sm uppercase tracking-[0.2em] mb-4">
            About Grey Sky
          </p>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-6">
            Public Servants in the{" "}
            <span className="text-[var(--gs-gold)]">Private Sector</span>
          </h1>
          <p className="text-lg text-[var(--gs-silver)] max-w-2xl mx-auto leading-relaxed">
            Grey Sky was built by people who have done the work — deployed to disasters, managed incidents,
            and seen firsthand what happens when qualifications can&apos;t be verified and records don&apos;t travel.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="py-16 bg-[var(--gs-white)]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-[var(--gs-navy)] mb-6">Our Mission</h2>
          <div className="space-y-4 text-lg text-[var(--gs-steel)] leading-relaxed">
            <p>
              Grey Sky Responder Society exists to professionalize the disaster response workforce through
              verified, service-long professional development. We bring structure, credibility, and continuity
              to a field that has historically relied on fragmented records, informal validation, and
              inconsistent standards across jurisdictions.
            </p>
            <p>
              Our platform is anchored to FEMA&apos;s Resource Typing Library Tool as the minimum professional
              baseline. We don&apos;t replace government qualification systems — we extend and operationalize them,
              transforming static frameworks into a dynamic, portable professional identity that follows
              the responder across incidents, jurisdictions, employers, and stages of service.
            </p>
          </div>
        </div>
      </section>

      {/* Longview */}
      <section className="py-16 bg-[var(--gs-navy)]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-[var(--gs-gold)] font-semibold text-sm uppercase tracking-wider mb-3">
                Built By Operators
              </p>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6">
                Longview Solutions Group
              </h2>
              <div className="space-y-4 text-[var(--gs-silver)] leading-relaxed">
                <p>
                  Grey Sky is an initiative of Longview Solutions Group — a company founded by disaster
                  response professionals who have spent their lives serving at the intersection of emergency
                  management, technology, and operational execution.
                </p>
                <p>
                  When hurricanes made landfall in Florida, Longview deployed over 220 professionals
                  across multiple disciplines in a response measured in hours, not days. That operational
                  reality — the urgent need for verified, deployable professionals — is what drives
                  everything Grey Sky builds.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {stats.map((s) => (
                <div key={s.label} className="p-5 rounded-lg bg-[var(--gs-slate)]/50 border border-[var(--gs-steel)]/20 text-center">
                  <div className="text-2xl font-bold text-[var(--gs-gold)]">{s.value}</div>
                  <div className="text-xs text-[var(--gs-silver)] mt-1">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* The Why */}
      <section className="py-16 bg-[var(--gs-white)]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-[var(--gs-navy)] mb-6">
            Why This Matters
          </h2>
          <div className="space-y-4 text-lg text-[var(--gs-steel)] leading-relaxed">
            <p>
              The disaster response workforce operates in one of the most critical environments in the
              nation, yet lacks a unified system for verifying qualifications, documenting experience,
              and maintaining professional standards across agencies and states.
            </p>
            <p>
              FEMA provides doctrine and qualification frameworks. But there remains a gap between
              defined standards and verified execution. Grey Sky fills that gap by creating a structured,
              evidence-based system of record — one that is trusted, auditable, and scalable.
            </p>
            <p className="font-medium text-[var(--gs-navy)]">
              A future where no responder&apos;s qualifications are uncertain. No deployment relies on
              assumptions. Every role is filled by a verified, qualified, and current professional.
            </p>
          </div>
        </div>
      </section>

      {/* Ethos */}
      <section className="py-16 bg-[var(--gs-navy)]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <blockquote className="text-xl sm:text-2xl text-white font-medium italic mb-6 leading-relaxed">
            &ldquo;This is not a training platform alone. It is not a credential registry alone.
            It is the infrastructure for a professionalized disaster response workforce.&rdquo;
          </blockquote>
          <div className="w-12 h-px bg-[var(--gs-gold)] mx-auto mb-6" />
          <Link
            href="/join"
            className="inline-block px-8 py-3.5 bg-[var(--gs-gold)] text-[var(--gs-navy)] font-semibold rounded-lg hover:bg-[var(--gs-gold-light)] transition-colors"
          >
            Tell Your Story
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}
