'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

type EnrollState =
  | { stage: 'idle' }
  | { stage: 'enrolling' }
  | {
      stage: 'verify';
      factorId: string;
      qrCode: string;
      secret: string;
      uri: string;
    }
  | { stage: 'backup'; backupCodes: string[] };

function generateBackupCodes(): string[] {
  const codes: string[] = [];
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  for (let i = 0; i < 10; i += 1) {
    let code = '';
    for (let c = 0; c < 10; c += 1) {
      code += chars[Math.floor(Math.random() * chars.length)];
    }
    codes.push(`${code.slice(0, 5)}-${code.slice(5)}`);
  }
  return codes;
}

function downloadCodes(codes: string[]) {
  const body =
    'Grey Sky Responder Society — backup codes\n' +
    'Each code can only be used once. Store these in a safe place.\n\n' +
    codes.join('\n');
  const blob = new Blob([body], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'greysky-backup-codes.txt';
  a.click();
  URL.revokeObjectURL(url);
}

export function MfaEnroll({ onDone }: { onDone?: () => void }) {
  const [state, setState] = useState<EnrollState>({ stage: 'idle' });
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function startEnroll() {
    setError(null);
    setState({ stage: 'enrolling' });
    const supabase = createClient();
    const { data, error: enrollError } = await supabase.auth.mfa.enroll({
      factorType: 'totp',
    });
    if (enrollError || !data) {
      setError('Could not start MFA enrollment. Please try again.');
      setState({ stage: 'idle' });
      return;
    }
    setState({
      stage: 'verify',
      factorId: data.id,
      qrCode: data.totp.qr_code,
      secret: data.totp.secret,
      uri: data.totp.uri,
    });
  }

  async function verifyEnroll() {
    if (state.stage !== 'verify') return;
    setError(null);
    setSubmitting(true);
    const supabase = createClient();
    const { data: challenge, error: challengeError } =
      await supabase.auth.mfa.challenge({ factorId: state.factorId });
    if (challengeError || !challenge) {
      setError('Verification failed. Please try again.');
      setSubmitting(false);
      return;
    }
    const { error: verifyError } = await supabase.auth.mfa.verify({
      factorId: state.factorId,
      challengeId: challenge.id,
      code: code.trim(),
    });
    if (verifyError) {
      setError('Invalid code. Please try again.');
      setSubmitting(false);
      return;
    }
    setSubmitting(false);
    setState({ stage: 'backup', backupCodes: generateBackupCodes() });
  }

  if (state.stage === 'idle' || state.stage === 'enrolling') {
    return (
      <div className="space-y-4">
        <p className="text-sm text-[var(--gs-steel)]">
          Protect your account with two-factor authentication. You&apos;ll need
          an authenticator app like Google Authenticator or Authy.
        </p>
        <button
          type="button"
          onClick={startEnroll}
          disabled={state.stage === 'enrolling'}
          className="px-4 py-2 bg-[var(--gs-navy)] text-white font-semibold rounded transition-colors hover:bg-[var(--gs-gold)] hover:text-[var(--gs-navy)] disabled:opacity-50"
        >
          {state.stage === 'enrolling'
            ? 'Starting...'
            : 'Enable Two-Factor Authentication'}
        </button>
        {error && (
          <p className="text-sm text-[var(--gs-alert)]">{error}</p>
        )}
      </div>
    );
  }

  if (state.stage === 'verify') {
    return (
      <div className="space-y-4">
        <p className="text-sm text-[var(--gs-steel)]">
          Scan the QR code with your authenticator app, then enter the 6-digit
          code to confirm.
        </p>
        <div className="flex items-start gap-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={state.qrCode}
            alt="MFA QR code"
            width={180}
            height={180}
            className="rounded border border-[var(--gs-cloud)] bg-white p-2"
          />
          <div className="text-xs text-[var(--gs-steel)] space-y-1">
            <p className="font-medium text-[var(--gs-navy)]">
              Or enter the secret manually:
            </p>
            <code className="block font-mono break-all text-[var(--gs-navy)]">
              {state.secret}
            </code>
          </div>
        </div>
        <div>
          <label
            htmlFor="mfa-code"
            className="block text-sm font-medium text-[var(--gs-steel)] mb-1.5"
          >
            6-digit code
          </label>
          <input
            id="mfa-code"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
            className="w-40 px-3 py-2.5 border border-[var(--gs-cloud)] rounded text-[var(--gs-navy)] focus:outline-none focus:ring-2 focus:ring-[var(--gs-gold)] bg-white"
            placeholder="000000"
          />
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={verifyEnroll}
            disabled={submitting || code.length !== 6}
            className="px-4 py-2 bg-[var(--gs-navy)] text-white font-semibold rounded transition-colors hover:bg-[var(--gs-gold)] hover:text-[var(--gs-navy)] disabled:opacity-50"
          >
            {submitting ? 'Verifying...' : 'Verify'}
          </button>
          <button
            type="button"
            onClick={() => setState({ stage: 'idle' })}
            className="px-4 py-2 text-[var(--gs-steel)] hover:text-[var(--gs-navy)]"
          >
            Cancel
          </button>
        </div>
        {error && (
          <p className="text-sm text-[var(--gs-alert)]">{error}</p>
        )}
      </div>
    );
  }

  // stage === 'backup'
  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-medium text-[var(--gs-navy)]">
          Two-factor authentication enabled.
        </p>
        <p className="text-sm text-[var(--gs-steel)]">
          Save these backup codes in a safe place. Each code can only be used
          once. If you lose access to your authenticator app, use a backup code
          to sign in.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-2 rounded border border-[var(--gs-cloud)] bg-[var(--gs-white)] p-4 font-mono text-sm text-[var(--gs-navy)]">
        {state.backupCodes.map((c) => (
          <div key={c}>{c}</div>
        ))}
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => downloadCodes(state.backupCodes)}
          className="px-4 py-2 bg-[var(--gs-navy)] text-white font-semibold rounded hover:bg-[var(--gs-gold)] hover:text-[var(--gs-navy)]"
        >
          Download codes
        </button>
        <button
          type="button"
          onClick={() => onDone?.()}
          className="px-4 py-2 text-[var(--gs-steel)] hover:text-[var(--gs-navy)]"
        >
          Done
        </button>
      </div>
    </div>
  );
}
