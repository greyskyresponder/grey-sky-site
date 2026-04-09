import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WaitlistForm from "@/components/WaitlistForm";

export const metadata: Metadata = {
  title: "Community | Grey Sky Responder Society",
  description:
    "Grey Sky creates content that connects disaster professionals through shared incidents, disciplines, agencies, and communities served.",
};

const affinities = [
  {
    category: "Shared Incidents",
    desc: "We tell the stories of the people who were there — the operations, the challenges, the bonds forged under pressure.",
    examples: ["Hurricane Helene", "Surfside Collapse", "Maui Wildfires", "Hurricane Ian"],
    color: "var(--gs-gold)",
  },
  {
    category: "Communities Served",
    desc: "Content that highlights the jurisdictions, regions, and populations where disaster professionals have made a difference.",
    examples: ["Leon County, FL", "Harris County, TX", "LA County, CA", "King County, WA"],
    color: "var(--gs-accent)",
  },
  {
    category: "Agencies & Organizations",
    desc: "Stories from the teams and agencies that define disaster response — the culture, the missions, the people behind the work.",
    examples: ["FL Division of Emergency Mgmt", "TX Task Force 1", "FEMA Region IV", "CAL FIRE"],
    color: "var(--gs-gold)",
  },
  {
    category: "Discipline Specialties",
    desc: "Deep dives into the specialized disciplines that make up disaster operations — the training, the deployments, the expertise.",
    examples: ["US&R Structural Collapse", "HazMat Level A Entry", "Type 3 IMT", "sUAS Mapping"],
    color: "var(--gs-accent)",
  },
];

export default function CommunityPage() {
  return (
    <main>
      <Header />

      {/* Hero */}
      <section className="bg-[var(--gs-navy)] pt-28 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-[var(--gs-gold)] font-semibold text-sm uppercase tracking-[0.2em] mb-4">
            The Society
          </p>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-6">
            We Tell the Stories That{" "}
            <span className="text-[var(--gs-gold)]">Connect You.</span>
          </h1>
          <p className="text-lg text-[var(--gs-silver)] max-w-2xl mx-auto leading-relaxed">
            The disaster response community is bound by shared experiences that most people will never understand.
            Grey Sky creates content that brings professionals together — through the incidents they&apos;ve served,
            the disciplines they practice, and the communities they protect.
          </p>
        </div>
      </section>

      {/* How We Connect You */}
      <section className="py-16 bg-[var(--gs-white)]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-[var(--gs-navy)] mb-4">
              Content That Brings You Together
            </h2>
            <p className="text-[var(--gs-steel)] text-lg max-w-2xl mx-auto">
              Grey Sky creates editorial content around the affinities that define the disaster response
              community — telling stories that no one else is telling.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 gap-6">
            {affinities.map((a) => (
              <div key={a.category} className="p-6 rounded-lg border border-[var(--gs-cloud)] bg-white">
                <h3 className="font-semibold text-[var(--gs-navy)] text-lg mb-2">{a.category}</h3>
                <p className="text-[var(--gs-steel)] text-sm mb-4">{a.desc}</p>
                <div className="flex flex-wrap gap-2">
                  {a.examples.map((ex) => (
                    <span
                      key={ex}
                      className="px-3 py-1 rounded-full text-xs font-medium border"
                      style={{
                        borderColor: `${a.color}40`,
                        color: a.color,
                        backgroundColor: `${a.color}08`,
                      }}
                    >
                      {ex}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What This Looks Like */}
      <section className="py-16 bg-[var(--gs-navy)]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
              Stories From the Field
            </h2>
            <p className="text-[var(--gs-silver)] text-lg max-w-xl mx-auto">
              Grey Sky produces content that gives disaster professionals the recognition and visibility they deserve.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              "After-action narratives from major incidents",
              "Profiles of disciplines and the people who serve in them",
              "Agency spotlights and team histories",
              "Deployment stories told by the professionals who lived them",
              "Discipline deep-dives on training, standards, and operational realities",
              "Community features highlighting jurisdictions and the people who protect them",
            ].map((item) => (
              <div
                key={item}
                className="p-4 rounded-lg bg-[var(--gs-slate)]/50 border border-[var(--gs-steel)]/20"
              >
                <span className="text-sm text-[var(--gs-silver)] leading-relaxed">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Coming Soon */}
      <section className="py-20 bg-gradient-to-b from-[var(--gs-slate)] to-[var(--gs-navy)]">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-block px-4 py-1.5 rounded-full bg-[var(--gs-gold)]/10 border border-[var(--gs-gold)]/30 mb-6">
            <span className="text-[var(--gs-gold)] text-sm font-semibold">Coming Soon</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
            The Stories Are Coming
          </h2>
          <p className="text-[var(--gs-silver)] text-lg mb-8 leading-relaxed">
            Grey Sky&apos;s community content is launching soon. Join the waitlist to be part of the
            society that finally gives disaster professionals the recognition they deserve.
          </p>
          <WaitlistForm />
        </div>
      </section>

      <Footer />
    </main>
  );
}
