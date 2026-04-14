export function AgencyCtaSection() {
  return (
    <section className="py-20 bg-gradient-to-b from-[var(--gs-slate)] to-[var(--gs-navy)]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <p className="text-[var(--gs-gold)] font-semibold text-xs uppercase tracking-[0.2em] mb-3">
          Engage
        </p>
        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
          Start the Conversation
        </h2>
        <p className="text-lg text-[var(--gs-silver)] leading-relaxed max-w-2xl mx-auto mb-10">
          Whether you&apos;re sponsoring individual responders or credentialing an entire specialty
          team, the first step is a conversation about what readiness looks like for your agency.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="mailto:info@greysky.org?subject=Organization%20Sponsorship%20Inquiry"
            className="inline-flex items-center justify-center px-8 py-3.5 bg-[var(--gs-gold)] text-[var(--gs-navy)] font-semibold rounded-lg hover:bg-[var(--gs-gold-light)] transition-colors"
          >
            Start Sponsoring Your Team
          </a>
          <a
            href="mailto:info@greysky.org?subject=Team%20Credentialing%20Inquiry"
            className="inline-flex items-center justify-center px-8 py-3.5 border border-[var(--gs-gold)] text-white font-semibold rounded-lg hover:bg-white/5 transition-colors"
          >
            Schedule a Readiness Conversation
          </a>
        </div>
      </div>
    </section>
  );
}
