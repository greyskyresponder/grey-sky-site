export function ReferenceClient() {
  return (
    <section
      className="relative bg-[var(--gs-navy)] border-y-2 border-[var(--gs-gold)]"
      aria-labelledby="reference-client-heading"
    >
      <div className="absolute inset-0 opacity-[0.04] pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(var(--gs-silver) 1px, transparent 1px), linear-gradient(90deg, var(--gs-silver) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
      </div>
      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 text-center">
        <p className="text-[var(--gs-gold)] font-semibold text-xs uppercase tracking-[0.2em] mb-4">
          Reference Client
        </p>
        <h2
          id="reference-client-heading"
          className="text-3xl sm:text-4xl font-bold text-white mb-6"
        >
          Florida Division of Emergency Management
        </h2>
        <p className="text-lg text-[var(--gs-silver)] leading-relaxed max-w-3xl mx-auto mb-8">
          Currently delivering statewide SRT-CAP assessments across 13 specialty response team
          disciplines under contract with the Florida Division of Emergency Management. Longview
          Solutions Group has assessed teams, credentialed responders, and delivered actionable
          readiness reports to county and state leadership.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto">
          <div className="rounded-lg border border-[var(--gs-steel)]/40 bg-[var(--gs-slate)]/40 px-4 py-5">
            <div className="text-3xl font-bold text-[var(--gs-gold)]">13</div>
            <div className="text-xs uppercase tracking-wider text-[var(--gs-silver)] mt-1">
              SRT Disciplines
            </div>
          </div>
          <div className="rounded-lg border border-[var(--gs-steel)]/40 bg-[var(--gs-slate)]/40 px-4 py-5">
            <div className="text-3xl font-bold text-[var(--gs-gold)]">Statewide</div>
            <div className="text-xs uppercase tracking-wider text-[var(--gs-silver)] mt-1">
              Coverage
            </div>
          </div>
          <div className="rounded-lg border border-[var(--gs-steel)]/40 bg-[var(--gs-slate)]/40 px-4 py-5">
            <div className="text-3xl font-bold text-[var(--gs-gold)]">FEMA RTLT</div>
            <div className="text-xs uppercase tracking-wider text-[var(--gs-silver)] mt-1">
              Standards
            </div>
          </div>
        </div>
        <p className="text-[var(--gs-steel)] text-xs mt-8 italic">
          State of Florida and FDEM names referenced as factual contracting party. No endorsement implied.
        </p>
      </div>
    </section>
  );
}
