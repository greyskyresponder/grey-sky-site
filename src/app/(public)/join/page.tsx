import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { OnboardingForm } from "@/components/public/OnboardingForm";

export const metadata: Metadata = {
  title: "Tell Your Story | Grey Sky Responder Society",
  description:
    "Your service matters. Join Grey Sky and start building your verified professional record.",
};

export default function JoinPage() {
  return (
    <main>
      <Header />

      <section className="bg-[var(--gs-navy)] pt-28 pb-16 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-[var(--gs-gold)] font-semibold text-sm uppercase tracking-[0.2em] mb-4">
            Your Professional Identity
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Tell Your Story
          </h1>
          <p className="text-[var(--gs-silver)] text-lg leading-relaxed">
            Your service matters. Your experience is real. Grey Sky helps you
            document and verify it — starting with the moment that brought you
            here.
          </p>
        </div>
      </section>

      <div className="max-w-2xl mx-auto px-4 py-12">
        <OnboardingForm />
      </div>

      <Footer />
    </main>
  );
}
