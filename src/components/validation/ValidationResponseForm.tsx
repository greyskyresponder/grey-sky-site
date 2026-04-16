'use client';

import { useState } from 'react';
import { submitValidationResponse } from '@/lib/validation/actions';
import type { ValidationTokenView } from '@/lib/validation/actions';

const ATTESTATION_TEXT =
  'I attest that the information I have provided is true and accurate to the best of my knowledge. I understand that this attestation may be used in professional credentialing processes.';

function formatDateRange(start: string | null, end: string | null): string {
  if (!start) return 'Dates not provided';
  const s = new Date(start).toLocaleDateString();
  const e = end ? new Date(end).toLocaleDateString() : 'Present';
  return `${s} – ${e}`;
}

type Decision = 'confirmed' | 'denied' | null;

export function ValidationResponseForm({
  token,
  view,
}: {
  token: string;
  view: ValidationTokenView;
}) {
  const [decision, setDecision] = useState<Decision>(null);
  const [responseText, setResponseText] = useState('');
  const [attestation, setAttestation] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const canSubmit =
    decision === 'denied' || (decision === 'confirmed' && attestation);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!decision) return;
    setError(null);
    setSubmitting(true);
    const res = await submitValidationResponse({
      token,
      status: decision,
      responseText: responseText.trim() || undefined,
      attestationAccepted: decision === 'confirmed' ? attestation : false,
    });
    if ('error' in res) {
      setError(res.error);
      setSubmitting(false);
      return;
    }
    setSuccess(true);
  }

  if (success) {
    return (
      <div className="bg-white rounded-lg border border-[var(--gs-cloud)] p-8 text-center">
        <h2 className="text-xl font-semibold text-[var(--gs-navy)] mb-2">Thank you</h2>
        <p className="text-sm text-[var(--gs-steel)]">Your response has been recorded.</p>
      </div>
    );
  }

  const memberName = [view.member.first_name, view.member.last_name].filter(Boolean).join(' ');

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <section className="bg-white rounded-lg border border-[var(--gs-cloud)] p-5 space-y-3">
        <h2 className="text-lg font-semibold text-[var(--gs-navy)]">Deployment Summary</h2>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <Field label="Member" value={memberName || 'Unknown'} />
          <Field label="Position / Role" value={view.deployment.position_title ?? 'Not specified'} />
          <Field label="Incident" value={view.incident?.name ?? 'Not specified'} />
          <Field
            label="Dates"
            value={formatDateRange(view.deployment.start_date, view.deployment.end_date)}
          />
          {view.deployment.agency && <Field label="Agency" value={view.deployment.agency} />}
          {view.incident?.state && <Field label="Location" value={view.incident.state} />}
        </dl>
      </section>

      <section className="bg-white rounded-lg border border-[var(--gs-cloud)] p-5 space-y-4">
        <p className="text-sm font-semibold text-[var(--gs-navy)]">
          Can you confirm that this person served in this role during this deployment?
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <DecisionButton
            selected={decision === 'confirmed'}
            onClick={() => setDecision('confirmed')}
            tone="confirm"
            label="Confirm"
            sub="Yes, I can attest to this deployment"
          />
          <DecisionButton
            selected={decision === 'denied'}
            onClick={() => setDecision('denied')}
            tone="deny"
            label="Decline"
            sub="I cannot confirm this deployment"
          />
        </div>

        <div>
          <label htmlFor="response-text" className="block text-sm font-medium text-[var(--gs-steel)] mb-1">
            Comments (optional)
          </label>
          <textarea
            id="response-text"
            rows={4}
            value={responseText}
            onChange={(e) => setResponseText(e.target.value)}
            className="w-full rounded-md border border-[var(--gs-cloud)] px-3 py-2 text-sm text-[var(--gs-navy)] focus:border-[var(--gs-gold)] focus:ring-1 focus:ring-[var(--gs-gold)] focus:outline-none"
          />
        </div>

        {decision === 'confirmed' && (
          <label className="flex items-start gap-2 text-sm text-[var(--gs-navy)]">
            <input
              type="checkbox"
              checked={attestation}
              onChange={(e) => setAttestation(e.target.checked)}
              className="mt-0.5"
              required
            />
            <span>{ATTESTATION_TEXT}</span>
          </label>
        )}
      </section>

      {error && (
        <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded px-3 py-2">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={!canSubmit || submitting}
        className="bg-[var(--gs-gold)] text-[var(--gs-navy)] px-6 py-3 rounded-md text-sm font-semibold disabled:opacity-50 w-full sm:w-auto"
      >
        {submitting ? 'Submitting…' : 'Submit Response'}
      </button>
    </form>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[var(--gs-steel)] text-xs">{label}</dt>
      <dd className="text-[var(--gs-navy)] font-medium">{value}</dd>
    </div>
  );
}

function DecisionButton({
  selected,
  onClick,
  tone,
  label,
  sub,
}: {
  selected: boolean;
  onClick: () => void;
  tone: 'confirm' | 'deny';
  label: string;
  sub: string;
}) {
  const base = 'rounded-md border px-4 py-3 text-left transition-colors';
  const toneClass =
    tone === 'confirm'
      ? selected
        ? 'bg-emerald-50 border-emerald-400 text-emerald-900'
        : 'bg-white border-[var(--gs-cloud)] hover:border-emerald-300'
      : selected
        ? 'bg-red-50 border-red-400 text-red-900'
        : 'bg-white border-[var(--gs-cloud)] hover:border-red-300';
  return (
    <button type="button" onClick={onClick} className={`${base} ${toneClass}`}>
      <div className="text-sm font-semibold">{label}</div>
      <div className="text-xs opacity-80">{sub}</div>
    </button>
  );
}
