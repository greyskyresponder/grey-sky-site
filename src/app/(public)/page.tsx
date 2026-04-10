import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WaitlistForm from "@/components/WaitlistForm";
import { disciplines } from "@/lib/disciplines";

export default function Home() {
  return (
    <main>
      <Header />

      {/* Hero */}
      <section className="relative min-h-screen flex items-center bg-[var(--gs-navy)] overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 -left-32 w-96 h-96 rounded-full bg-[var(--gs-gold)]/5 blur-3xl" />
          <div className="absolute bottom-1/4 -right-32 w-96 h-96 rounded-full bg-[var(--gs-accent)]/5 blur-3xl" />
        </div>
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 text-center">
          <p className="text-[var(--gs-gold)] font-semibold text-sm uppercase tracking-[0.2em] mb-6">
            Grey Sky Responder Society
          </p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
            Your service. Your story.{" "}
            <span className="text-[var(--gs-gold)]">Recognized.</span>
          </h1>
          <p className="text-lg sm:text-xl text-[var(--gs-silver)] max-w-2xl mx-auto mb-10 leading-relaxed">
            You&apos;ve spent years training, deploying, and leading in the most demanding environments on earth.
            Grey Sky ensures that experience is documented, verified, and recognized — wherever your service takes you.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/#waitlist"
              className="px-8 py-3.5 bg-[var(--gs-gold)] text-[var(--gs-navy)] font-semibold rounded-lg hover:bg-[var(--gs-gold-light)] transition-colors"
            >
              Join the Waitlist
            </Link>
            <Link
              href="/standards"
              className="px-8 py-3.5 border border-[var(--gs-steel)] text-white font-medium rounded-lg hover:bg-white/5 transition-colors"
            >
              Explore the Standards
            </Link>
          </div>
        </div>
      </section>

      {/* The Challenge — Problem Statement */}
      <section className="py-20 bg-gradient-to-b from-[var(--gs-navy)] to-[var(--gs-slate)]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-[var(--gs-gold)] font-semibold text-sm uppercase tracking-wider mb-3">The Challenge</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
              A Workforce Without a Professional Home
            </h2>
          </div>

          <div className="space-y-8 max-w-3xl mx-auto">
            <div className="border-l-2 border-[var(--gs-gold)]/40 pl-6">
              <p className="text-lg text-white font-medium mb-2">There is no unifying approach to professional development in disaster management.</p>
              <p className="text-[var(--gs-silver)] leading-relaxed">
                As of 2026, emergency management is still in its infancy — not clearly defined within the broader
                national concept of operations. There is no professional licensing board, no unified registry,
                no consistent path from entry to mastery.
              </p>
            </div>

            <div className="border-l-2 border-[var(--gs-gold)]/40 pl-6">
              <p className="text-lg text-white font-medium mb-2">Most disaster professionals cannot explain what they do.</p>
              <p className="text-[var(--gs-silver)] leading-relaxed">
                Ask a responder to describe their work to their children, and they struggle. People ask
                &ldquo;are you a first responder?&rdquo; — but there is no clear identity or branding for the
                hundreds of other roles necessary to support a major incident. Shelter managers. Logistics chiefs.
                GIS analysts. Damage assessors. Fatality management teams. They all serve — but none have a name
                the public recognizes.
              </p>
            </div>

            <div className="border-l-2 border-[var(--gs-gold)]/40 pl-6">
              <p className="text-lg text-white font-medium mb-2">No recognition. No identity. No professional home.</p>
              <p className="text-[var(--gs-silver)] leading-relaxed">
                Emergency management professionals lack the recognition, identity, and structured development
                that every other critical profession takes for granted. Qualifications are fragmented across
                dozens of systems. Records don&apos;t travel. Experience goes undocumented.
              </p>
            </div>

            <div className="mt-10 p-6 rounded-xl bg-[var(--gs-gold)]/10 border border-[var(--gs-gold)]/30">
              <p className="text-[var(--gs-gold)] font-semibold text-lg mb-2">Grey Sky solves this.</p>
              <p className="text-white leading-relaxed">
                Grey Sky gives disaster professionals their identity, their community, and their path forward.
                One persistent professional profile. Verified credentials. A society of peers who understand the work.
                This is the professional home that emergency management has been missing.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* What is FEMA RTLT? */}
      <section className="py-20 bg-[var(--gs-white)]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <p className="text-[var(--gs-gold)] font-semibold text-sm uppercase tracking-wider mb-3">The Foundation</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-[var(--gs-navy)] mb-4">
              What is FEMA RTLT?
            </h2>
          </div>
          <p className="text-lg text-[var(--gs-steel)] text-center leading-relaxed mb-6">
            The Resource Typing Library Tool is FEMA&apos;s framework for defining what every disaster response role requires —
            the training, the experience, the certifications. It&apos;s the national standard for knowing who is qualified to do what
            when lives are on the line.
          </p>
          <p className="text-lg text-[var(--gs-steel)] text-center leading-relaxed mb-8">
            Grey Sky uses RTLT as the minimum baseline for all credentials. FEMA defines the standard.
            We ensure it is <span className="text-[var(--gs-navy)] font-semibold">verified, maintained, and operationalized</span>.
          </p>
          <div className="text-center">
            <Link
              href="/standards"
              className="inline-flex items-center gap-2 text-[var(--gs-gold)] font-semibold hover:text-[var(--gs-gold-dark)] transition-colors"
            >
              Learn more about the standards
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Tell Your Story */}
      <section className="py-20 bg-[var(--gs-navy)]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-[var(--gs-gold)] font-semibold text-sm uppercase tracking-wider mb-3">Your Professional Identity</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">Tell Your Story</h2>
          <p className="text-lg text-[var(--gs-silver)] leading-relaxed mb-6 max-w-2xl mx-auto">
            Your training records, deployment history, and certifications aren&apos;t just paperwork —
            they&apos;re the chapters of a life of service most people can&apos;t imagine. Grey Sky gives you a single, persistent
            professional identity that follows you across agencies, jurisdictions, and years of serving.
          </p>
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            {["Entry", "Training", "Qualification", "Certification", "Credentialing", "Deployment", "Revalidation"].map((stage, i) => (
              <div key={stage} className="flex items-center gap-2">
                <span className="px-3 py-1.5 rounded-full text-sm font-medium bg-[var(--gs-slate)] text-[var(--gs-gold)] border border-[var(--gs-gold)]/20">
                  {stage}
                </span>
                {i < 6 && <span className="text-[var(--gs-steel)]">&rarr;</span>}
              </div>
            ))}
          </div>
          <Link
            href="/story"
            className="inline-flex items-center gap-2 text-[var(--gs-gold)] font-semibold hover:text-[var(--gs-gold-light)] transition-colors"
          >
            Learn how it works
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </section>

      {/* The Society */}
      <section className="py-20 bg-[var(--gs-white)]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-[var(--gs-gold)] font-semibold text-sm uppercase tracking-wider mb-3">More Than a Registry</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-[var(--gs-navy)] mb-6">The Society</h2>
          <p className="text-lg text-[var(--gs-steel)] leading-relaxed max-w-2xl mx-auto mb-10">
            Grey Sky isn&apos;t just a platform — it&apos;s a professional community. We tell the stories that connect
            disaster professionals through shared incidents, agencies, specialties, and the communities they serve.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
            {[
              { label: "612+", sub: "RTLT Positions" },
              { label: "17+", sub: "Discipline Categories" },
              { label: "FEMA", sub: "RTLT Aligned" },
              { label: "NQS", sub: "Standards Based" },
            ].map((stat) => (
              <div key={stat.sub} className="p-4 rounded-lg bg-[var(--gs-cloud)]/50 border border-[var(--gs-cloud)]">
                <div className="text-2xl font-bold text-[var(--gs-gold)]">{stat.label}</div>
                <div className="text-sm text-[var(--gs-steel)]">{stat.sub}</div>
              </div>
            ))}
          </div>
          <Link
            href="/community"
            className="inline-flex items-center gap-2 text-[var(--gs-gold)] font-semibold hover:text-[var(--gs-gold-dark)] transition-colors"
          >
            Explore the community
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </section>

      {/* Disciplines Preview */}
      <section className="py-20 bg-[var(--gs-navy)]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-[var(--gs-gold)] font-semibold text-sm uppercase tracking-wider mb-3">FEMA RTLT Aligned</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-white">17+ Discipline Categories</h2>
            <p className="text-[var(--gs-silver)] text-lg mt-4 max-w-2xl mx-auto">
              Grey Sky covers the entire FEMA RTLT database — 612 entries across every discipline in disaster operations.
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {disciplines.map((d) => (
              <Link
                key={d.slug}
                href={`/standards/${d.slug}`}
                className="group p-4 rounded-lg bg-[var(--gs-slate)]/50 border border-[var(--gs-steel)]/20 hover:border-[var(--gs-gold)]/40 transition-all"
              >
                <span className="text-2xl block mb-2">{d.icon}</span>
                <span className="text-white font-medium text-sm group-hover:text-[var(--gs-gold)] transition-colors">
                  {d.name}
                </span>
                <span className="block text-[var(--gs-steel)] text-xs mt-0.5">{d.abbr}</span>
              </Link>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link
              href="/standards"
              className="inline-flex items-center gap-2 text-[var(--gs-gold)] font-semibold hover:text-[var(--gs-gold-light)] transition-colors"
            >
              View all standards
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Coming Soon / Waitlist */}
      <section id="waitlist" className="py-20 bg-gradient-to-b from-[var(--gs-slate)] to-[var(--gs-navy)]">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-[var(--gs-gold)] font-semibold text-sm uppercase tracking-wider mb-3">Coming Soon</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Be First In Line
          </h2>
          <p className="text-[var(--gs-silver)] text-lg mb-8 leading-relaxed">
            Grey Sky Responder Society is launching soon. Join the waitlist to be among the first
            to claim your professional identity.
          </p>
          <WaitlistForm />
        </div>
      </section>

      <Footer />
    </main>
  );
}
