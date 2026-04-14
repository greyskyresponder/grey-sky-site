'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

type Mode = 'totp' | 'backup';

export function MfaChallenge({
  onSuccess,
}: {
  onSuccess: () => void;
}) {
  const [mode, setMode] = useState<Mode>('totp');
  const [code, setCode] = useState('');
  const [factorId, setFactorId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.mfa.listFactors().then(({ data }) => {
      const totp = data?.totp?.[0];
      if (totp) setFactorId(totp.id);
    });
  }, []);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!factorId) return;
    setError(null);
    setSubmitting(true);

    const supabase = createClient();
    const { data: challenge, error: challengeError } =
      await supabase.auth.mfa.challenge({ factorId });
    if (challengeError || !challenge) {
      setError('Verification failed. Please try again.');
      setSubmitting(false);
      return;
    }
    const { error: verifyError } = await supabase.auth.mfa.verify({
      factorId,
      challengeId: challenge.id,
      code: code.trim(),
    });
    if (verifyError) {
      setError('Verification failed. Please try again.');
      setSubmitting(false);
      return;
    }
    setSubmitting(false);
    onSuccess();
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <h2 className="text-xl font-semibold text-[var(--gs-navy)]">
        Two-factor authentication
      </h2>
      <p className="text-sm text-[var(--gs-steel)]">
        {mode === 'totp'
          ? 'Enter the 6-digit code from your authenticator app.'
          : 'Enter one of your backup codes.'}
      </p>
      <input
        inputMode={mode === 'totp' ? 'numeric' : 'text'}
        autoComplete="one-time-code"
        maxLength={mode === 'totp' ? 6 : 11}
        value={code}
        onChange={(e) =>
          setCode(
            mode === 'totp'
              ? e.target.value.replace(/\D/g, '')
              : e.target.value.toUpperCase(),
          )
        }
        className="w-full px-3 py-2.5 border border-[var(--gs-cloud)] rounded text-[var(--gs-navy)] focus:outline-none focus:ring-2 focus:ring-[var(--gs-gold)] bg-white"
        placeholder={mode === 'totp' ? '000000' : 'XXXXX-XXXXX'}
      />
      {error && <p className="text-sm text-[var(--gs-alert)]">{error}</p>}
      <button
        type="submit"
        disabled={submitting || !factorId || code.length < 6}
        className="w-full py-2.5 px-4 bg-[var(--gs-navy)] text-white font-semibold rounded hover:bg-[var(--gs-gold)] hover:text-[var(--gs-navy)] disabled:opacity-50"
      >
        {submitting ? 'Verifying...' : 'Verify'}
      </button>
      <button
        type="button"
        onClick={() => {
          setMode(mode === 'totp' ? 'backup' : 'totp');
          setCode('');
          setError(null);
        }}
        className="text-sm text-[var(--gs-steel)] hover:text-[var(--gs-navy)]"
      >
        {mode === 'totp'
          ? 'Use a backup code'
          : 'Use your authenticator app'}
      </button>
    </form>
  );
}
