'use client';

import { useCallback, useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { MfaEnroll } from './MfaEnroll';

type FactorSummary = { id: string; status: string };

export function MfaSettings() {
  const [factors, setFactors] = useState<FactorSummary[] | null>(null);
  const [enrolling, setEnrolling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [disabling, setDisabling] = useState(false);

  const refresh = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase.auth.mfa.listFactors();
    setFactors(
      data?.totp?.map((f) => ({ id: f.id, status: f.status })) ?? [],
    );
  }, []);

  useEffect(() => {
    // Initial load — fetch MFA factors on mount
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void refresh();
  }, [refresh]);

  async function disableFactor(factorId: string) {
    setError(null);
    setDisabling(true);
    const supabase = createClient();
    const { error: unenrollError } = await supabase.auth.mfa.unenroll({
      factorId,
    });
    setDisabling(false);
    if (unenrollError) {
      setError('Could not disable two-factor authentication.');
      return;
    }
    await refresh();
  }

  if (factors === null) {
    return (
      <p className="text-sm text-[var(--gs-steel)]">
        Loading security settings...
      </p>
    );
  }

  const verified = factors.filter((f) => f.status === 'verified');
  const enabled = verified.length > 0;

  if (enrolling) {
    return (
      <MfaEnroll
        onDone={async () => {
          setEnrolling(false);
          await refresh();
        }}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between rounded-lg border border-[var(--gs-cloud)] bg-[var(--gs-white)] px-4 py-3">
        <div>
          <p className="text-sm font-medium text-[var(--gs-navy)]">
            Multi-factor authentication
          </p>
          <p className="text-xs text-[var(--gs-steel)]">
            {enabled ? 'Enabled' : 'Not enabled'}
          </p>
        </div>
        {enabled ? (
          <button
            type="button"
            onClick={() => disableFactor(verified[0].id)}
            disabled={disabling}
            className="px-3 py-1.5 text-sm text-[var(--gs-alert)] border border-[var(--gs-alert)] rounded hover:bg-[var(--gs-alert)] hover:text-white disabled:opacity-50"
          >
            {disabling ? 'Disabling...' : 'Disable'}
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setEnrolling(true)}
            className="px-3 py-1.5 text-sm bg-[var(--gs-navy)] text-white rounded hover:bg-[var(--gs-gold)] hover:text-[var(--gs-navy)]"
          >
            Enable
          </button>
        )}
      </div>
      {error && <p className="text-sm text-[var(--gs-alert)]">{error}</p>}
    </div>
  );
}
