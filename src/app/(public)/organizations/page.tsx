import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ServiceLane } from "@/components/marketing/ServiceLane";
import { ReferenceClient } from "@/components/marketing/ReferenceClient";
import { AgencyCtaSection } from "@/components/marketing/AgencyCtaSection";

export const metadata: Metadata = {
  title: "For Organizations + Agencies | Grey Sky Responder Society",
  description:
    "Sponsor your responders and credential your specialty response teams with Grey Sky.",
};

const processSteps = [
  {
    title: "Contract",
    description:
      "Agency engages Longview for team assessment. Scope defined by discipline and team count.",
  },
  {
    title: "Self-Assessment",
    description:
      "Teams complete an 11-section self-assessment documenting deployment history, personnel, equipment, capabilities, training, and exercises.",
  },
  {
    title: "Onsite Assessment",
    description:
      "Qualified assessors conduct field evaluation. Equipment verified. Capabilities observed. Records reviewed.",
  },
  {
    title: "Field Report",
    description:
      "Per-section scoring (0–3), observations, and actionable recommendations delivered to the team.",
  },
  {
    title: "Final Report",
    description:
      "Readiness determination with RTLT typing level assignment. Delivered to the sponsoring agency.",
  },
  {
    title: "Credentialing",
    description:
      "Team receives credentialing outcome. Individual members earn Grey Sky certifications for assessed positions.",
  },
];

const srtDisciplines = [
  { name: "Urban Search & Rescue", abbr: "US&R", icon: "🏗️" },
  { name: "Swiftwater / Flood Rescue", abbr: "SWFRT", icon: "🌊" },
  { name: "Hazardous Materials", abbr: "HazMat", icon: "☢️" },
  { name: "SWAT", abbr: "SWAT", icon: "🛡️" },
  { name: "Bomb Squad", abbr: "EOD", icon: "💥" },
  { name: "Waterborne SAR", abbr: "WSAR", icon: "⚓" },
  { name: "Land SAR", abbr: "LSAR", icon: "🏔️" },
  { name: "Small Unmanned Aircraft Systems", abbr: "sUAS", icon: "🛸" },
  { name: "Rotary Wing SAR", abbr: "RWSAR", icon: "🚁" },
  { name: "Animal Rescue / SAR", abbr: "AR-SAR", icon: "🐾" },
  { name: "Incident Management Teams", abbr: "IMT", icon: "📡" },
  { name: "EOC Management Support Teams", abbr: "EOC", icon: "🏢" },
  { name: "Public Safety Dive Teams", abbr: "PSDT", icon: "🤿" },
];

const whyGreySky = [
  {
    title: "Built on Standards",
    body: "Every assessment, certification, and credential is grounded in the FEMA Resource Typing Library Tool and National Qualification System. Grey Sky doesn't invent standards — we make them operational.",
  },
  {
    title: "Verified, Not Self-Reported",
    body: "Responder qualifications are validated through 360-degree attestation, ICS 225-modeled evaluations, and expert peer review. No self-attestation. No honor system.",
  },
  {
    title: "Practitioner-Led",
    body: "Longview Solutions Group is led by emergency management professionals who have served in the field. Our assessors have led incident management teams and directed specialty response operations.",
  },
];

export default function OrganizationsPage() {
  return (
    <main>
      <Header />

      {/* Hero */}
      <section className="relative bg-[var(--gs-navy)] overflow-hidden pt-32 pb-20 sm:pt-40 sm:pb-28">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 -left-32 w-96 h-96 rounded-full bg-[var(--gs-gold)]/5 blur-3xl" />
          <div className="absolute bottom-1/4 -right-32 w-96 h-96 rounded-full bg-[var(--gs-accent)]/5 blur-3xl" />
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage:
                "linear-gradient(var(--gs-silver) 1px, transparent 1px), linear-gradient(90deg, var(--gs-silver) 1px, transparent 1px)",
              backgroundSize: "48px 48px",
            }}
          />
        </div>
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-[var(--gs-gold)] font-semibold text-sm uppercase tracking-[0.2em] mb-6">
            For Organizations + Agencies
          </p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
            Your Teams.{" "}
            <span className="text-[var(--gs-gold)]">Verified Ready.</span>
          </h1>
          <p className="text-lg sm:text-xl text-[var(--gs-silver)] max-w-3xl mx-auto leading-relaxed">
            Grey Sky Responder Society partners with state, county, and local agencies to credential
            specialty response teams and sponsor individual responder professional development —
            built on FEMA RTLT standards, delivered by practitioners who have led the work.
          </p>
        </div>
      </section>

      {/* Section 1: Two Service Lanes */}
      <section className="py-20 bg-[var(--gs-white)]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-[var(--gs-gold-dark)] font-semibold text-xs uppercase tracking-[0.2em] mb-3">
              Two Service Lanes
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-[var(--gs-navy)] mb-4">
              Sponsor People. Credential Teams.
            </h2>
            <p className="text-lg text-[var(--gs-steel)] max-w-2xl mx-auto">
              Two distinct services — each built around the same core mission: verified readiness
              for the workforce that shows up when it matters.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ServiceLane
              variant="primary"
              eyebrow="Lane A — Sponsor Your Responders"
              headline="Individual Member Sponsorship"
              body="Organizations sponsor their responders' Grey Sky memberships. Sponsored members build verified service records, earn certifications, and pursue credentials — all tracked through the platform. The sponsoring agency sees certification status and readiness for sponsored disciplines only. No access to private records, deployment details, or personal documents."
              points={[
                "$100/year per sponsored member (includes 1,000 Sky Coins)",
                "Consent-based visibility — responders control what agencies see",
                "Certification tracking across all FEMA RTLT positions",
                "Readiness dashboards by discipline and team",
                "Bulk sponsorship with organizational coin pools",
              ]}
              ctaText="Start Sponsoring Your Team"
              ctaHref="mailto:info@greysky.org?subject=Organization%20Sponsorship%20Inquiry"
            />
            <ServiceLane
              variant="secondary"
              eyebrow="Lane B — Team Credentialing"
              headline="Specialty Response Team Assessment + Credentialing"
              body="Longview Solutions Group delivers the SRT-CAP (Specialty Response Team Capabilities Assessment Program) — a structured methodology that evaluates team readiness across 11 operational areas, assigns FEMA RTLT typing levels, and credentials individual team members. Currently under contract with the Florida Division of Emergency Management across 13 SRT disciplines statewide."
              points={[
                "Structured self-assessment collection (11 sections)",
                "Onsite expert assessment by qualified assessors",
                "Detailed field reports with per-section scoring and recommendations",
                "Final readiness determination with RTLT typing levels",
                "Individual team member certifications through the engagement",
                "Readiness dashboards and gap analysis",
              ]}
              ctaText="Schedule a Readiness Conversation"
              ctaHref="mailto:info@greysky.org?subject=Team%20Credentialing%20Inquiry"
            />
          </div>
        </div>
      </section>

      {/* Section 2: SRT-CAP Process */}
      <section className="py-20 bg-gradient-to-b from-[var(--gs-navy)] to-[var(--gs-slate)]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-[var(--gs-gold)] font-semibold text-xs uppercase tracking-[0.2em] mb-3">
              The SRT-CAP Process
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              A Structured Methodology, Not Ad-Hoc Consulting
            </h2>
            <p className="text-lg text-[var(--gs-silver)] max-w-2xl mx-auto">
              Six phases from contract to credentialing. Every engagement follows the same
              evidence-based workflow.
            </p>
          </div>

          {/* Horizontal step flow on lg+, vertical stack on mobile */}
          <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 lg:gap-2">
            {processSteps.map((step, index) => (
              <li
                key={step.title}
                className="relative flex flex-col items-center text-center"
              >
                {/* Connector line — between steps on lg+ */}
                {index > 0 && (
                  <span
                    aria-hidden="true"
                    className="hidden lg:block absolute top-6 right-1/2 w-full h-0.5 bg-[var(--gs-gold)]/30 -translate-y-1/2"
                  />
                )}
                <div className="relative w-12 h-12 rounded-full bg-[var(--gs-gold)] flex items-center justify-center shrink-0 mb-4 ring-4 ring-[var(--gs-navy)]">
                  <span className="text-[var(--gs-navy)] font-bold text-lg">{index + 1}</span>
                </div>
                <h3 className="text-white font-semibold text-base lg:text-sm mb-2">
                  {step.title}
                </h3>
                <p className="text-[var(--gs-silver)] text-xs leading-relaxed px-2">
                  {step.description}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Section 3: 13 SRT Disciplines */}
      <section className="py-20 bg-[var(--gs-white)]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-[var(--gs-gold-dark)] font-semibold text-xs uppercase tracking-[0.2em] mb-3">
              Scope of Coverage
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-[var(--gs-navy)] mb-4">
              The 13 SRT Disciplines
            </h2>
            <p className="text-lg text-[var(--gs-steel)] max-w-2xl mx-auto">
              The specialty response team types currently credentialed under the Florida SRT-CAP program.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {srtDisciplines.map((d, i) => (
              <div
                key={d.abbr}
                className="flex items-center gap-4 p-4 rounded-lg bg-white border border-[var(--gs-cloud)] hover:border-[var(--gs-gold)]/40 transition-colors"
              >
                <div className="w-10 h-10 rounded-md bg-[var(--gs-navy)] flex items-center justify-center shrink-0">
                  <span className="text-[var(--gs-gold)] font-bold text-sm">{i + 1}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[var(--gs-navy)] font-semibold text-sm leading-tight">
                    {d.name}
                  </div>
                  <div className="text-[var(--gs-steel)] text-xs uppercase tracking-wider mt-0.5">
                    {d.abbr}
                  </div>
                </div>
                <div className="text-2xl shrink-0" aria-hidden="true">
                  {d.icon}
                </div>
              </div>
            ))}
          </div>

          <p className="text-center text-[var(--gs-steel)] text-sm italic mt-10 max-w-3xl mx-auto">
            Grey Sky supports credentialing for ALL team types defined in the FEMA Resource Typing
            Library Tool — not limited to the 13 Florida SRT disciplines listed above.
          </p>
        </div>
      </section>

      {/* Section 4: Reference Client (Florida FDEM) */}
      <ReferenceClient />

      {/* Section 5: Why Grey Sky */}
      <section className="py-20 bg-[var(--gs-white)]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-[var(--gs-gold-dark)] font-semibold text-xs uppercase tracking-[0.2em] mb-3">
              Why Grey Sky
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-[var(--gs-navy)] mb-4">
              Standards You Already Follow
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {whyGreySky.map((feature) => (
              <div
                key={feature.title}
                className="p-6 rounded-xl border border-[var(--gs-cloud)] bg-white"
              >
                <h3 className="text-[var(--gs-navy)] font-bold text-lg mb-3">{feature.title}</h3>
                <p className="text-[var(--gs-steel)] text-sm leading-relaxed">{feature.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 6: CTA */}
      <AgencyCtaSection />

      <Footer />
    </main>
  );
}
