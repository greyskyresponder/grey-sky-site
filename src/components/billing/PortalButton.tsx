'use client';

// GSR-DOC-208: Client button that opens the Stripe Billing Portal.
import { useState } from 'react';

interface PortalButtonProps {
  className?: string;
  children?: React.ReactNode;
}

export default function PortalButton({ className, children }: PortalButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function openPortal() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/billing/portal', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({}),
      });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) {
        setError(data.error ?? 'Could not open billing portal.');
        return;
      }
      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not open billing portal.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="inline-flex flex-col gap-1">
      <button
        type="button"
        onClick={openPortal}
        disabled={loading}
        className={
          className ??
          'bg-[var(--gs-navy)] text-white hover:opacity-90 disabled:opacity-50 px-4 py-2 rounded-md text-sm font-medium transition-opacity'
        }
      >
        {loading ? 'Opening…' : (children ?? 'Manage Billing')}
      </button>
      {error ? <p className="text-xs text-red-600">{error}</p> : null}
    </div>
  );
}
