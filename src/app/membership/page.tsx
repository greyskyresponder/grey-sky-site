import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WaitlistForm from "@/components/WaitlistForm";

export const metadata: Metadata = {
  title: "Membership | Grey Sky Responder Society",
  description:
    "Community Membership at $100/year = 100 Sky Coins. Use Sky Coins for certifications, credentialing, training, and community features.",
};

const skyCoinsUses = [
  {
    title: "Certification Assessments",
    desc: "Use Sky Coins to complete FEMA RTLT-aligned certification assessments across any of the 17+ discipline categories.",
    icon: "📋",
  },
  {
    title: "Credentialing Applications & Renewals",
    desc: "Submit credentialing applications, renew existing credentials, and maintain your deployment-ready status.",
    icon: "🏅",
  },
  {
    title: "Training Course Access",
    desc: "Unlock instructor-led training modules, scenario-based exercises, and continuing education courses.",
    icon: "📚",
  },
  {
    title: "Profile Enhancements",
    desc: "Upgrade your professional profile with verified deployment records, supervisor validations, and portfolio features.",
    icon: "👤",
  },
  {
    title: "Community Features",
    desc: "Access exclusive content, affinity-based stories, and member-only resources within the Grey Sky community.",
    icon: "🤝",
  },
];

export default function MembershipPage() {
  return (
    <main>
      <Header />

      {/* Hero */}
      <section className="bg-[var(--gs-navy)] pt-28 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-[var(--gs-gold)] font-semibold text-sm uppercase tracking-[0.2em] mb-4">
            Membership
          </p>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-6">
            Own Your Professional{" "}
            <span className="text-[var(--gs-gold)]">Identity</span>
          </h1>
          <p className="text-lg text-[var(--gs-silver)] max-w-2xl mx-auto leading-relaxed">
            One membership. Your entire record of service documented, verified, and recognized.
          </p>
        </div>
      </section>

      {/* Sky Coins Model */}
      <section className="py-16 bg-[var(--gs-white)]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-xl mx-auto">
            <div className="rounded-xl border-2 border-[var(--gs-gold)] bg-white p-8 shadow-lg">
              <div className="text-center mb-8">
                <p className="text-[var(--gs-gold)] font-semibold text-sm uppercase tracking-wider mb-2">
                  Community Membership
                </p>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-5xl font-bold text-[var(--gs-navy)]">$100</span>
                  <span className="text-[var(--gs-steel)]">/year</span>
                </div>
                <div className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--gs-gold)]/10 border border-[var(--gs-gold)]/30">
                  <span className="text-[var(--gs-gold)] font-bold text-lg">100</span>
                  <span className="text-[var(--gs-gold)] font-semibold text-sm">Sky Coins included</span>
                </div>
              </div>

              <div className="space-y-3 mb-8">
                {[
                  "Persistent professional profile across agencies and jurisdictions",
                  "100 Sky Coins to use on certifications, training, and credentialing",
                  "Secure storage and verification of all training and deployment records",
                  "FEMA RTLT-aligned pathways across 17+ discipline categories",
                  "Community access and affinity-based content",
                  "Continuing education tracking and revalidation support",
                ].map((feature) => (
                  <div key={feature} className="flex items-start gap-3">
                    <svg
                      className="w-5 h-5 text-[var(--gs-gold)] mt-0.5 flex-shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-sm text-[var(--gs-steel)]">{feature}</span>
                  </div>
                ))}
              </div>
              <div className="text-center">
                <span className="inline-block px-4 py-1.5 rounded-full bg-[var(--gs-gold)]/10 border border-[var(--gs-gold)]/30 text-[var(--gs-gold)] text-sm font-semibold">
                  Coming Soon
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What Are Sky Coins */}
      <section className="py-16 bg-[var(--gs-navy)]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-[var(--gs-gold)] font-semibold text-sm uppercase tracking-wider mb-3">
              Sky Coins
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
              Your Internal Currency for Professional Development
            </h2>
            <p className="text-[var(--gs-silver)] text-lg max-w-2xl mx-auto leading-relaxed">
              Sky Coins are Grey Sky&apos;s internal currency. Use them to access certifications,
              credentialing, training, and community features — all within your membership.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {skyCoinsUses.map((item) => (
              <div key={item.title} className="p-5 rounded-lg bg-[var(--gs-slate)]/50 border border-[var(--gs-steel)]/20">
                <span className="text-2xl block mb-3">{item.icon}</span>
                <h3 className="text-white font-semibold mb-2">{item.title}</h3>
                <p className="text-[var(--gs-silver)] text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Agency / Organization */}
      <section className="py-16 bg-[var(--gs-white)]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center">
            <p className="text-[var(--gs-gold)] font-semibold text-sm uppercase tracking-wider mb-3">
              For Agencies & Organizations
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold text-[var(--gs-navy)] mb-4">
              Sponsor Your Workforce
            </h2>
            <p className="text-[var(--gs-steel)] text-lg leading-relaxed mb-6">
              Agency and organization pricing is based on what you want to sponsor — certification,
              credentialing, or training for your people. Federal, state, and local agencies receive
              profiles and dashboards tailored to their jurisdiction level.
            </p>
            <div className="grid sm:grid-cols-2 gap-4 text-left mb-8">
              {[
                "Sponsor certifications and credentialing for your team",
                "Jurisdiction-specific dashboards (federal, state, local)",
                "Workforce readiness tracking and qualification verification",
                "Standardized FEMA-aligned reporting",
              ].map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-[var(--gs-gold)] mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-[var(--gs-steel)] text-sm">{item}</span>
                </div>
              ))}
            </div>
            <div className="p-4 rounded-lg bg-[var(--gs-cloud)]/50 border border-[var(--gs-cloud)] mb-8">
              <p className="text-sm text-[var(--gs-navy)] font-medium">
                Responder privacy is sovereign. Agencies only see what the responder consents to,
                scoped to what the agency sponsors.
              </p>
            </div>
            <a
              href="mailto:info@greysky.org"
              className="inline-block px-8 py-3.5 border border-[var(--gs-gold)] text-[var(--gs-gold)] font-semibold rounded-lg hover:bg-[var(--gs-gold)] hover:text-[var(--gs-navy)] transition-colors"
            >
              Contact Us for Agency Pricing
            </a>
          </div>
        </div>
      </section>

      {/* Waitlist */}
      <section className="py-20 bg-gradient-to-b from-[var(--gs-slate)] to-[var(--gs-navy)]">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-block px-4 py-1.5 rounded-full bg-[var(--gs-gold)]/10 border border-[var(--gs-gold)]/30 mb-6">
            <span className="text-[var(--gs-gold)] text-sm font-semibold">Coming Soon</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
            Be First In Line
          </h2>
          <p className="text-[var(--gs-silver)] text-lg mb-8 leading-relaxed">
            Membership registration opens soon. Join the waitlist and we&apos;ll notify you when
            you can start building your professional profile.
          </p>
          <WaitlistForm />
        </div>
      </section>

      <Footer />
    </main>
  );
}
