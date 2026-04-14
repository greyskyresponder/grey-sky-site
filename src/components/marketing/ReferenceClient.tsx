export function ReferenceClient() {
  return (
    <section className="bg-[var(--gs-navy)] border-y-2 border-[var(--gs-gold)]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <p className="text-[var(--gs-gold)] font-semibold text-xs uppercase tracking-[0.2em] mb-4">
          Reference Client
        </p>
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6">
          Florida Division of Emergency Management
        </h2>
        <p className="text-lg text-[var(--gs-silver)] leading-relaxed mb-8">
          Currently delivering statewide SRT-CAP assessments across 13 specialty response team
          disciplines under contract with the Florida Division of Emergency Management.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto">
          <div className="p-4 rounded-lg bg-[var(--gs-slate)]/50 border border-[var(--gs-steel)]/30">
            <div className="text-3xl font-bold text-[var(--gs-gold)]">13</div>
            <div className="text-sm text-[var(--gs-silver)] mt-1">SRT Disciplines</div>
          </div>
          <div className="p-4 rounded-lg bg-[var(--gs-slate)]/50 border border-[var(--gs-steel)]/30">
            <div className="text-3xl font-bold text-[var(--gs-gold)]">50+</div>
            <div className="text-sm text-[var(--gs-silver)] mt-1">Teams Assessed</div>
          </div>
          <div className="p-4 rounded-lg bg-[var(--gs-slate)]/50 border border-[var(--gs-steel)]/30">
            <div className="text-3xl font-bold text-[var(--gs-gold)]">500+</div>
            <div className="text-sm text-[var(--gs-silver)] mt-1">Responders Credentialed</div>
          </div>
        </div>
        <p className="text-[var(--gs-steel)] text-xs mt-6 italic">
          Delivered by Longview Solutions Group.
        </p>
      </div>
    </section>
  );
}
