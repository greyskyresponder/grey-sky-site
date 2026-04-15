import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { TierCard } from "@/components/marketing/TierCard";

export const metadata: Metadata = {
  title: "Membership | Grey Sky Responder Society",
  description:
    "Join the Grey Sky Responder Society. $100/year includes 1,000 Sky Coins for professional development, record building, and peer validation.",
};

const platformAccess = [
  "Secure member dashboard (your command post)",
  "Complete service profile with 8 sections",
  "Unlimited response report creation",
  "Document library for certificates, licenses, and training records",
  "Incident registry with ICS 209-aligned records",
  "Connection to 37 affinity categories (incidents, agencies, disciplines)",
];

const skyCoinsIncluded = [
  "The internal currency of Grey Sky",
  "1,000 coins = $100 value",
  "Use for validation requests, evaluation requests, and professional products",
  "Coins don't expire while your membership is active",
];

const mathLines = [
  { label: "Build unlimited response reports", cost: "free" },
  { label: "Upload all supporting documents", cost: "free" },
  { label: "Request 20+ peer validations", cost: "200 coins" },
  { label: "Request 10+ supervisor evaluations", cost: "150 coins" },
  { label: "Export service history", cost: "25 coins" },
  { label: "Generate a professional summary", cost: "50 coins" },
  { label: "Purchase 4 verified response reports", cost: "200 coins" },
];

export default function MembershipPage() {
  return (
    <main>
      <Header />

      {/* Section 1: Hero */}
      <section className="bg-[var(--gs-navy)] pt-28 pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-[var(--gs-gold)] font-semibold text-sm uppercase tracking-[0.2em] mb-4">
            Membership
          </p>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-6">
            Invest in Your <span className="text-[var(--gs-gold)]">Service Record</span>
          </h1>
          <p className="text-lg text-[var(--gs-silver)] max-w-2xl mx-auto leading-relaxed">
            Grey Sky membership gives you the tools, the recognition, and the community to build a
            verified record of the work you do. $100 a year. Everything you need to get started.
          </p>
        </div>
      </section>

      {/* Section 2: What You Get */}
      <section className="py-20 bg-[var(--gs-white)]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-[var(--gs-gold)] font-semibold text-sm uppercase tracking-wider mb-3">
              What You Get
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-[var(--gs-navy)]">
              $100 a Year. Here&apos;s What&apos;s Included.
            </h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="rounded-xl border-2 border-[var(--gs-navy)]/10 bg-white p-8">
              <p className="text-[var(--gs-navy)] font-semibold text-xs uppercase tracking-[0.2em] mb-3">
                Platform Access
              </p>
              <ul className="space-y-3">
                {platformAccess.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <svg
                      className="w-5 h-5 text-[var(--gs-navy)] mt-0.5 shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-sm text-[var(--gs-steel)] leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-xl border-2 border-[var(--gs-gold)] bg-white p-8">
              <p className="text-[var(--gs-gold)] font-semibold text-xs uppercase tracking-[0.2em] mb-3">
                1,000 Sky Coins
              </p>
              <ul className="space-y-3">
                {skyCoinsIncluded.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <svg
                      className="w-5 h-5 text-[var(--gs-gold)] mt-0.5 shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-sm text-[var(--gs-steel)] leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: What Your Coins Buy (Five-Tier Value Display) */}
      <section className="py-20 bg-[var(--gs-cloud)]/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-[var(--gs-gold)] font-semibold text-sm uppercase tracking-wider mb-3">
              What Your Coins Buy
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-[var(--gs-navy)] mb-4">
              Five Tiers of Value
            </h2>
            <p className="text-[var(--gs-steel)] text-lg max-w-2xl mx-auto leading-relaxed">
              From free record building to premium credentialing, every tier is designed around the
              work you actually do.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <TierCard
              tier="Tier 1"
              title="Record Building"
              priceRange="Free / Included"
              items={[
                "Response reports — document every deployment",
                "Document uploads — store certificates, licenses, training records",
                "Historical deployments — add your full service history",
              ]}
              note="Building your record costs nothing. That's by design."
              variant="free"
            />
            <TierCard
              tier="Tier 2"
              title="Professional Network"
              priceRange="10–15 coins each"
              items={[
                "360° validation request — ask a colleague to verify your service (10 coins)",
                "ICS 225 performance evaluation — request a supervisor evaluation (15 coins)",
                "Validators and evaluators earn coins back when they respond",
              ]}
              note="Your 1,000 coins cover 65+ validation requests or the equivalent."
              variant="low"
            />
            <TierCard
              tier="Tier 3"
              title="Certification"
              priceRange="$400–$500 / 4,000–5,000 coins"
              items={[
                "Staff-level certification: 4,000 coins ($400)",
                "Command-level certification: 5,000 coins ($500)",
                "Administrative review of your verified record against NQS requirements",
                "3-year renewal cycle",
              ]}
              note="Most members pursuing certification will need to add coins. That's the investment in official recognition."
              variant="medium"
            />
            <TierCard
              tier="Tier 4"
              title="Credentialing"
              priceRange="$1,000–$3,000 / 10,000–30,000 coins"
              items={[
                "Standard credential: 10,000 coins ($1,000)",
                "Senior credential: 20,000 coins ($2,000)",
                "Command credential: 30,000 coins ($3,000)",
                "Expert peer review by a Qualification Review Board",
                "2-year renewal cycle",
              ]}
              note="Credentialing is the highest level of professional verification in emergency management. It means qualified experts reviewed your record and confirmed your capability."
              variant="premium"
            />
            <TierCard
              tier="Tier 5"
              title="Professional Products"
              priceRange="25–75 coins each"
              items={[
                "Verified response reports, printed certificates, verification letters",
                "Service history exports, professional profile summaries",
                "Digital badges for sharing certifications",
              ]}
              note="Small investments in the tangible products of your professional standing."
              variant="products"
            />
          </div>
        </div>
      </section>

      {/* Section 4: The Math */}
      <section className="py-20 bg-[var(--gs-white)]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <p className="text-[var(--gs-gold)] font-semibold text-sm uppercase tracking-wider mb-3">
              The Math
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-[var(--gs-navy)] mb-4">
              What a Year Looks Like
            </h2>
            <p className="text-[var(--gs-steel)] text-lg leading-relaxed">
              With your 1,000 Sky Coins, a typical active member can:
            </p>
          </div>
          <div className="rounded-xl border-2 border-[var(--gs-navy)]/10 bg-white p-6 sm:p-8 shadow-sm">
            <ul className="divide-y divide-[var(--gs-cloud)]">
              {mathLines.map((line) => (
                <li
                  key={line.label}
                  className="flex items-center justify-between gap-4 py-3 text-sm sm:text-base"
                >
                  <span className="text-[var(--gs-steel)]">{line.label}</span>
                  <span className="font-semibold text-[var(--gs-navy)] shrink-0">{line.cost}</span>
                </li>
              ))}
              <li className="flex items-center justify-between gap-4 pt-4 mt-2 border-t-2 border-[var(--gs-navy)]">
                <span className="font-bold text-[var(--gs-navy)]">Total</span>
                <span className="font-bold text-[var(--gs-navy)]">
                  625 coins — 375 left over
                </span>
              </li>
            </ul>
          </div>
          <p className="text-center text-[var(--gs-navy)] text-lg font-semibold mt-8 leading-relaxed">
            For most members, $100 covers a full year of active professional development.
          </p>
        </div>
      </section>

      {/* Section 5: For Organizations */}
      <section className="py-16 bg-[var(--gs-cloud)]/30">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-xl border-2 border-[var(--gs-navy)]/10 bg-white p-8 sm:p-10">
            <p className="text-[var(--gs-gold)] font-semibold text-xs uppercase tracking-[0.2em] mb-3">
              For Organizations
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold text-[var(--gs-navy)] mb-4">
              Sponsoring a Team?
            </h2>
            <p className="text-[var(--gs-steel)] text-lg leading-relaxed mb-6">
              Agencies and organizations can sponsor memberships for their responders. Bulk
              sponsorship, readiness dashboards, and team credentialing — all through the same
              platform.
            </p>
            <Link
              href="/organizations"
              className="inline-flex items-center gap-2 text-[var(--gs-navy)] font-semibold hover:text-[var(--gs-gold)] transition-colors"
            >
              Learn about organization sponsorship
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Section 6: Join CTA */}
      <section className="py-20 bg-[var(--gs-navy)]">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-8 leading-tight">
            Join Grey Sky Responder Society
          </h2>
          <Link
            href="/join"
            className="inline-flex items-center justify-center px-10 py-4 rounded-lg bg-[var(--gs-gold)] text-[var(--gs-navy)] font-bold text-lg hover:bg-[var(--gs-gold-light)] transition-colors"
          >
            Join Grey Sky Responder Society
          </Link>
          <p className="text-[var(--gs-silver)] text-sm mt-5">
            $100/year · 1,000 Sky Coins · Cancel anytime
          </p>
        </div>
      </section>

      <Footer />
    </main>
  );
}
