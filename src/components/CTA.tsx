export default function CTA() {
  return (
    <section
      id="join"
      className="py-20 bg-gradient-to-br from-[var(--gs-accent-dark)] to-[var(--gs-navy)]"
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <p className="uppercase tracking-[0.3em] text-xs text-[var(--gs-gold)] mb-4">
          Trust • Verify • Deploy
        </p>
        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
          Submit Your Packet Tonight. Get a Decision in ~10 Days.
        </h2>
        <p className="text-lg text-blue-100 mb-8 max-w-2xl mx-auto">
          Membership unlocks peer-reviewed credentialing, roster placement across 12 disciplines,
          Grey Sky Travel logistics, and a permanent record of your experience. No fluff—just the
          credibility agencies expect when they call Longview.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="#membership"
            className="bg-white text-[var(--gs-navy)] px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition shadow-lg"
          >
            Start Membership →
          </a>
          <a
            href="mailto:info@greyskyresponder.com"
            className="border-2 border-white/30 text-white px-8 py-4 rounded-lg text-lg font-medium hover:border-white/60 transition"
          >
            Talk with a Credential Steward
          </a>
        </div>

        <p className="mt-8 text-blue-200 text-sm">
          Prefer to brief live? Email
          {" "}
          <a href="mailto:info@greyskyresponder.com" className="underline hover:text-white">
            info@greyskyresponder.com
          </a>
          {" "}
          and we&apos;ll schedule within 24 hours.
        </p>
      </div>
    </section>
  );
}
