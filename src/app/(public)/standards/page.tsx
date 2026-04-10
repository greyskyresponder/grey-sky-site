import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { disciplines } from "@/lib/disciplines";

export const metadata: Metadata = {
  title: "Standards | Grey Sky Responder Society",
  description:
    "FEMA Resource Typing Library Tool (RTLT) standards — 612 entries across 17+ discipline categories with verified, portable credentialing.",
};

export default function StandardsPage() {
  return (
    <main>
      <Header />

      {/* Hero */}
      <section className="bg-[var(--gs-navy)] pt-28 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-[var(--gs-gold)] font-semibold text-sm uppercase tracking-[0.2em] mb-4">
            The Foundation
          </p>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-6">
            FEMA RTLT Standards
          </h1>
          <p className="text-lg text-[var(--gs-silver)] leading-relaxed max-w-2xl mx-auto">
            The Resource Typing Library Tool is the national framework that defines what every disaster
            response role requires. Grey Sky builds certification pathways for every position, team,
            and resource type FEMA defines — all 612 entries.
          </p>
        </div>
      </section>

      {/* What is RTLT */}
      <section className="py-16 bg-[var(--gs-white)]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-[var(--gs-navy)] mb-6">
            What is FEMA RTLT?
          </h2>
          <div className="space-y-4 text-[var(--gs-steel)] text-lg leading-relaxed">
            <p>
              When a disaster strikes and mutual aid is requested, the receiving jurisdiction needs to know
              exactly what they&apos;re getting. A &ldquo;search and rescue team&rdquo; could mean wildly different things
              depending on who sent it. FEMA&apos;s Resource Typing Library Tool solves this by defining, in precise
              detail, what every response role requires.
            </p>
            <p>
              For each position in each discipline, RTLT specifies the required training courses, certifications,
              physical fitness standards, and experience levels. It&apos;s the common language that lets a Type 1
              HazMat Technician from Florida deploy seamlessly alongside one from California — because they were
              qualified against the same standard.
            </p>
            <p>
              The RTLT contains 612 entries across four types: Resource Typing Definitions, Position
              Qualifications, Position Task Books, and EOC Skillsets — spanning every discipline involved
              in disaster operations.
            </p>
          </div>
        </div>
      </section>

      {/* RTLT by the Numbers */}
      <section className="py-16 bg-[var(--gs-navy)]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-8">
            RTLT by the Numbers
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
            {[
              { value: "612", label: "Total Entries" },
              { value: "300+", label: "Position Qualifications" },
              { value: "150+", label: "Resource Typing Definitions" },
              { value: "100+", label: "Position Task Books" },
            ].map((stat) => (
              <div key={stat.label} className="p-5 rounded-lg bg-[var(--gs-slate)]/50 border border-[var(--gs-steel)]/20 text-center">
                <div className="text-2xl font-bold text-[var(--gs-gold)]">{stat.value}</div>
                <div className="text-xs text-[var(--gs-silver)] mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              {
                title: "Portable",
                desc: "Your qualifications follow you across agencies, states, and employers. No more rebuilding your record every time you move.",
              },
              {
                title: "Verified",
                desc: "Not just a certificate on a wall. RTLT-aligned credentials are backed by documented training, experience, and validation.",
              },
              {
                title: "Recognized",
                desc: "A nationally defined standard means your qualifications are understood and trusted across every jurisdiction in the country.",
              },
            ].map((item) => (
              <div key={item.title} className="p-6 rounded-lg bg-[var(--gs-slate)]/50 border border-[var(--gs-steel)]/20">
                <h3 className="text-[var(--gs-gold)] font-semibold text-lg mb-2">{item.title}</h3>
                <p className="text-[var(--gs-silver)] text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 17+ Disciplines */}
      <section className="py-16 bg-[var(--gs-white)]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-[var(--gs-gold)] font-semibold text-sm uppercase tracking-wider mb-3">
              FEMA RTLT Aligned
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold text-[var(--gs-navy)] mb-4">
              17+ Discipline Categories
            </h2>
            <p className="text-[var(--gs-steel)] text-lg max-w-2xl mx-auto">
              Grey Sky covers the entire FEMA RTLT database. Each discipline represents a specialized
              community of professionals with distinct training requirements and operational environments.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {disciplines.map((d) => (
              <Link
                key={d.slug}
                href={`/standards/${d.slug}`}
                className="group p-6 rounded-lg border border-[var(--gs-cloud)] bg-white hover:border-[var(--gs-gold)]/40 hover:shadow-lg transition-all"
              >
                <div className="flex items-start gap-4">
                  <span className="text-3xl flex-shrink-0">{d.icon}</span>
                  <div>
                    <h3 className="font-semibold text-[var(--gs-navy)] group-hover:text-[var(--gs-gold)] transition-colors mb-1">
                      {d.name}
                    </h3>
                    <span className="text-xs text-[var(--gs-steel)] font-medium">{d.abbr}</span>
                    <p className="text-sm text-[var(--gs-steel)] mt-2 leading-relaxed">
                      {d.description}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How Grey Sky Operationalizes RTLT */}
      <section className="py-16 bg-[var(--gs-navy)]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6">
            How Grey Sky Operationalizes RTLT
          </h2>
          <blockquote className="text-xl text-[var(--gs-gold)] font-medium italic mb-8 max-w-2xl mx-auto">
            &ldquo;FEMA defines the standard. Grey Sky ensures it is verified, maintained, and operationalized.&rdquo;
          </blockquote>
          <div className="grid sm:grid-cols-2 gap-6 text-left max-w-2xl mx-auto">
            {[
              { title: "Completed", desc: "Every required course, exercise, and evaluation is tracked and documented." },
              { title: "Documented", desc: "Training records, deployment history, and supervisor validations in one place." },
              { title: "Validated", desc: "Third-party review processes confirm qualifications meet FEMA standards." },
              { title: "Maintained", desc: "Ongoing revalidation ensures credentials stay current and deployment-ready." },
            ].map((item) => (
              <div key={item.title} className="flex items-start gap-3">
                <svg className="w-5 h-5 text-[var(--gs-gold)] mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <div>
                  <h3 className="text-white font-semibold">{item.title}</h3>
                  <p className="text-[var(--gs-silver)] text-sm">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-10">
            <Link
              href="/#waitlist"
              className="inline-block px-8 py-3.5 bg-[var(--gs-gold)] text-[var(--gs-navy)] font-semibold rounded-lg hover:bg-[var(--gs-gold-light)] transition-colors"
            >
              Join the Waitlist
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
