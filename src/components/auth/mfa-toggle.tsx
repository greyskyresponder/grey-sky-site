'use client';

import Link from 'next/link';

export function MfaToggle() {
  return (
    <Link
      href="/dashboard/settings/security"
      className="flex items-center justify-between rounded-lg border border-[var(--gs-cloud)] bg-[var(--gs-white)] px-4 py-3 hover:border-[var(--gs-gold)] transition-colors"
    >
      <div>
        <p className="text-sm font-medium text-[var(--gs-navy)]">
          Multi-factor authentication
        </p>
        <p className="text-xs text-[var(--gs-steel)]">
          Manage two-factor authentication
        </p>
      </div>
      <span className="text-sm text-[var(--gs-gold)] font-medium">
        Manage →
      </span>
    </Link>
  );
}
