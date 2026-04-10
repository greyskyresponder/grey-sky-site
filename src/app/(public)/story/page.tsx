import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WaitlistForm from "@/components/WaitlistForm";

export const metadata: Metadata = {
  title: "Tell Your Story | Grey Sky Responder Society",
  description:
    "Document your service as a disaster professional. Training, deployments, certifications — your professional story, verified and recognized.",
};

const lifecycle = [
  {
    stage: "Entry",
    desc: "Begin your professional journey. Establish your baseline qualifications and declare your discipline focus.",
  },
  {
    stage: "Training",
    desc: "Complete FEMA Independent Study courses, instructor-led training, and position-specific requirements.",
  },
  {
    stage: "Qualification",
    desc: "Demonstrate competency through Position Task Books, evaluations, and supervised field work.",
  },
  {
    stage: "Certification",
    desc: "Earn formal recognition that you meet FEMA RTLT standards for your position and type level.",
  },
  {
    stage: "Credentialing",
    desc: "Receive verified, portable credentials confirming you are qualified, current, and deployment-ready.",
  },
  {
    stage: "Deployment",
    desc: "Respond to real-world incidents. Your deployment history becomes part of your permanent professional record.",
  },
  {
    stage: "Revalidation",
    desc: "Maintain your credentials through continuing education, recertification, and ongoing operational experience.",
  },
];

export default function StoryPage() {
  return (
    <main>
      <Header />

      {/* Hero */}
      <section className="bg-[var(--gs-navy)] pt-28 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-[var(--gs-gold)] font-semibold text-sm uppercase tracking-[0.2em] mb-4">
            Your Professional Identity
          </p>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-6 leading-tight">
            You&apos;ve done things most people{" "}
            <span className="text-[var(--gs-gold)]">can&apos;t imagine.</span>
            <br />
            Let&apos;s make sure that&apos;s documented.
          </h1>
          <p className="text-lg text-[var(--gs-silver)] max-w-2xl mx-auto leading-relaxed">
            Your training records aren&apos;t just paperwork. Your deployment history isn&apos;t just a list. Your certifications
            aren&apos;t just checkboxes. They&apos;re the chapters of a professional life spent serving when it matters most.
          </p>
        </div>
      </section>

      {/* The Concept */}
      <section className="py-16 bg-[var(--gs-white)]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-[var(--gs-navy)] mb-6">
              Your Service Is a Story Worth Telling
            </h2>
            <div className="space-y-4 text-lg text-[var(--gs-steel)] leading-relaxed">
              <p>
                Most disaster professionals have their qualifications scattered across dozens of systems — agency databases,
                paper certificates, LMS platforms that no longer exist, and supervisors who&apos;ve retired.
                When you need to prove what you can do, you&apos;re assembling a puzzle from memory.
              </p>
              <p>
                Grey Sky changes that. One persistent professional profile that documents every course completed,
                every deployment served, every certification earned, and every credential validated.
                Your record of service, in one place, verified and portable.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Lifecycle */}
      <section className="py-16 bg-[var(--gs-navy)]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-[var(--gs-gold)] font-semibold text-sm uppercase tracking-wider mb-3">The Professional Lifecycle</p>
            <h2 className="text-2xl sm:text-3xl font-bold text-white">
              From Entry to Revalidation
            </h2>
          </div>
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-6 top-0 bottom-0 w-px bg-[var(--gs-gold)]/20 hidden sm:block" />
            <div className="space-y-6">
              {lifecycle.map((item, i) => (
                <div key={item.stage} className="relative flex gap-6 items-start">
                  <div className="relative z-10 flex-shrink-0 w-12 h-12 rounded-full bg-[var(--gs-slate)] border-2 border-[var(--gs-gold)]/40 flex items-center justify-center">
                    <span className="text-[var(--gs-gold)] font-bold text-sm">{i + 1}</span>
                  </div>
                  <div className="pt-2">
                    <h3 className="text-white font-semibold text-lg">{item.stage}</h3>
                    <p className="text-[var(--gs-silver)] text-sm mt-1 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
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
            Your Professional Home
          </h2>
          <p className="text-[var(--gs-silver)] text-lg mb-8 leading-relaxed">
            Grey Sky is building the platform where your story of service lives — persistent, verified, and
            recognized. Be among the first to claim your professional identity.
          </p>
          <WaitlistForm />
          <p className="text-[var(--gs-steel)] text-sm mt-6">
            <Link href="/membership" className="text-[var(--gs-gold)] hover:text-[var(--gs-gold-light)] transition-colors">
              Learn about membership
            </Link>
          </p>
        </div>
      </section>

      <Footer />
    </main>
  );
}
