'use client';

export function MfaToggle() {
  return (
    <div className="flex items-center justify-between rounded-lg border border-[var(--gs-cloud)] bg-[var(--gs-white)] px-4 py-3 opacity-60">
      <div>
        <p className="text-sm font-medium text-[var(--gs-navy)]">
          Multi-factor authentication
        </p>
        <p className="text-xs text-[var(--gs-steel)]">Coming soon</p>
      </div>
      <button
        type="button"
        disabled
        aria-label="Multi-factor authentication (coming soon)"
        className="relative inline-flex h-6 w-11 shrink-0 cursor-not-allowed rounded-full border-2 border-transparent bg-[var(--gs-cloud)] transition-colors"
      >
        <span
          aria-hidden="true"
          className="pointer-events-none inline-block h-5 w-5 translate-x-0 rounded-full bg-white shadow ring-0 transition-transform"
        />
      </button>
    </div>
  );
}
