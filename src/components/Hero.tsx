export default function Hero() {
  return (
    <section className="relative bg-[var(--gs-navy)] pt-32 pb-20 overflow-hidden">
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--gs-navy)] via-[var(--gs-slate)] to-[var(--gs-navy)]" />
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 right-20 w-96 h-96 bg-[var(--gs-accent)] rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-10 w-64 h-64 bg-[var(--gs-gold)] rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-[var(--gs-accent)]/20 border border-[var(--gs-accent)]/30 mb-6">
            <span className="text-[var(--gs-accent)] text-sm font-medium">
              Verified roster placement in ~10 days
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-6">
            Credentialed in Days.<br />
            <span className="text-[var(--gs-gold)]">Deployable on Day One.</span>
          </h1>

          <p className="text-xl text-[var(--gs-silver)] mb-8 max-w-2xl leading-relaxed">
            Grey Sky Responder Society is the verification home for serious disaster responders.
            We document your deployment history, validate supervisor references, and publish your
            readiness so emergency managers know exactly who is stepping off the transport.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <a
              href="#membership"
              className="bg-[var(--gs-accent)] hover:bg-[var(--gs-accent-dark)] text-white px-8 py-4 rounded-lg text-lg font-semibold transition text-center shadow-lg shadow-[var(--gs-accent)]/25"
            >
              Start Credentialing Today →
            </a>
            <a
              href="#disciplines"
              className="border border-white/20 hover:border-white/40 text-white px-8 py-4 rounded-lg text-lg font-medium transition text-center"
            >
              View Disciplines & Standards
            </a>
          </div>

          {/* Trust indicators */}
          <div className="mt-12 grid gap-6 sm:grid-cols-3 text-[var(--gs-silver)] text-sm">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-[var(--gs-success)] mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <div>
                <p className="font-semibold text-white">Supervisor-verified history</p>
                <p>Real deployments logged and confirmed before you show up on a roster.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-[var(--gs-success)] mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <div>
                <p className="font-semibold text-white">12 disciplines, FEMA NQS aligned</p>
                <p>Every credential maps to RTLT resource typing so agencies can trust the badge.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-[var(--gs-success)] mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <div>
                <p className="font-semibold text-white">Priority deployment network</p>
                <p>Rostered with agencies who demand doctrine-ready responders, not warm bodies.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
