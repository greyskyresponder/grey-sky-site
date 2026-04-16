'use client';

import { useState } from 'react';
import { submitEvaluationResponse } from '@/lib/evaluation/actions';
import { RATING_AREAS, RATING_LABELS } from '@/lib/evaluation/schemas';
import type { EvaluationTokenView } from '@/lib/evaluation/actions';

const ATTESTATION_TEXT =
  'I attest that this evaluation reflects my honest professional assessment based on direct observation during the deployment described above. I understand that this evaluation may be used in professional credentialing processes.';

type RatingKey = (typeof RATING_AREAS)[number]['key'];
type Mode = 'rate' | 'decline';

function formatDateRange(start: string | null, end: string | null): string {
  if (!start) return 'Dates not provided';
  const s = new Date(start).toLocaleDateString();
  const e = end ? new Date(end).toLocaleDateString() : 'Present';
  return `${s} – ${e}`;
}

function buttonColor(v: number, selected: boolean): string {
  if (!selected) return 'bg-white text-[var(--gs-navy)] border-[var(--gs-cloud)] hover:bg-gray-50';
  if (v >= 5) return 'bg-emerald-600 text-white border-emerald-600';
  if (v >= 4) return 'bg-emerald-400 text-white border-emerald-400';
  if (v >= 3) return 'bg-amber-400 text-[var(--gs-navy)] border-amber-400';
  if (v >= 2) return 'bg-orange-500 text-white border-orange-500';
  return 'bg-red-500 text-white border-red-500';
}

export function EvaluationResponseForm({
  token,
  view,
}: {
  token: string;
  view: EvaluationTokenView;
}) {
  const [mode, setMode] = useState<Mode>('rate');
  const [ratings, setRatings] = useState<Record<RatingKey, number | null>>({
    ratingLeadership: null,
    ratingTactical: null,
    ratingCommunication: null,
    ratingPlanning: null,
    ratingTechnical: null,
  });
  const [commentary, setCommentary] = useState('');
  const [attestation, setAttestation] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const allRated = Object.values(ratings).every((v) => v !== null);
  const canSubmit = mode === 'decline' || (allRated && attestation);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const res =
      mode === 'decline'
        ? await submitEvaluationResponse({
            token,
            status: 'denied',
            commentary: commentary.trim() || undefined,
          })
        : await submitEvaluationResponse({
            token,
            status: 'completed',
            ratingLeadership: ratings.ratingLeadership!,
            ratingTactical: ratings.ratingTactical!,
            ratingCommunication: ratings.ratingCommunication!,
            ratingPlanning: ratings.ratingPlanning!,
            ratingTechnical: ratings.ratingTechnical!,
            commentary: commentary.trim() || undefined,
            attestationAccepted: true,
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
        <p className="text-sm text-[var(--gs-steel)]">Your evaluation has been recorded.</p>
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

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setMode('rate')}
          className={`px-3 py-1.5 rounded-md text-sm font-medium border ${
            mode === 'rate'
              ? 'bg-[var(--gs-navy)] text-white border-[var(--gs-navy)]'
              : 'bg-white text-[var(--gs-steel)] border-[var(--gs-cloud)]'
          }`}
        >
          Provide evaluation
        </button>
        <button
          type="button"
          onClick={() => setMode('decline')}
          className={`px-3 py-1.5 rounded-md text-sm font-medium border ${
            mode === 'decline'
              ? 'bg-[var(--gs-navy)] text-white border-[var(--gs-navy)]'
              : 'bg-white text-[var(--gs-steel)] border-[var(--gs-cloud)]'
          }`}
        >
          I am unable to evaluate
        </button>
      </div>

      {mode === 'rate' && (
        <>
          <section className="bg-white rounded-lg border border-[var(--gs-cloud)] p-5 space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-[var(--gs-navy)]">Performance Ratings</h3>
              <p className="text-xs text-[var(--gs-steel)]">Rate each area from 1 (Unsatisfactory) to 5 (Outstanding).</p>
            </div>

            <details className="text-xs text-[var(--gs-steel)] bg-gray-50 rounded p-2">
              <summary className="cursor-pointer font-medium">Rating scale</summary>
              <ul className="mt-2 space-y-1">
                {RATING_LABELS.map((r) => (
                  <li key={r.value}>
                    <span className="font-semibold text-[var(--gs-navy)]">{r.value}</span> —{' '}
                    <span className="font-medium">{r.label}</span>: {r.description}
                  </li>
                ))}
              </ul>
            </details>

            <div className="space-y-4">
              {RATING_AREAS.map((area) => (
                <div key={area.key}>
                  <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between mb-1">
                    <div>
                      <span className="text-sm font-semibold text-[var(--gs-navy)]">{area.label}</span>
                      <span className="text-xs text-[var(--gs-steel)] ml-2">{area.description}</span>
                    </div>
                  </div>
                  <div
                    role="radiogroup"
                    aria-label={`${area.label} rating`}
                    className="grid grid-cols-5 gap-1"
                  >
                    {[1, 2, 3, 4, 5].map((v) => {
                      const selected = ratings[area.key] === v;
                      return (
                        <button
                          key={v}
                          type="button"
                          role="radio"
                          aria-checked={selected}
                          onClick={() =>
                            setRatings((prev) => ({ ...prev, [area.key]: v }))
                          }
                          className={`h-10 rounded-md border text-sm font-semibold transition-colors ${buttonColor(v, selected)}`}
                        >
                          {v}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <div>
            <label htmlFor="eval-commentary" className="block text-sm font-medium text-[var(--gs-steel)] mb-1">
              Commentary (recommended)
            </label>
            <textarea
              id="eval-commentary"
              rows={5}
              value={commentary}
              onChange={(e) => setCommentary(e.target.value)}
              placeholder="Narrative assessment, strengths, areas for growth, specific examples"
              className="w-full rounded-md border border-[var(--gs-cloud)] px-3 py-2 text-sm text-[var(--gs-navy)] focus:border-[var(--gs-gold)] focus:ring-1 focus:ring-[var(--gs-gold)] focus:outline-none"
            />
          </div>

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
        </>
      )}

      {mode === 'decline' && (
        <div>
          <label htmlFor="decline-reason" className="block text-sm font-medium text-[var(--gs-steel)] mb-1">
            Reason (optional)
          </label>
          <textarea
            id="decline-reason"
            rows={4}
            value={commentary}
            onChange={(e) => setCommentary(e.target.value)}
            className="w-full rounded-md border border-[var(--gs-cloud)] px-3 py-2 text-sm text-[var(--gs-navy)] focus:border-[var(--gs-gold)] focus:ring-1 focus:ring-[var(--gs-gold)] focus:outline-none"
          />
        </div>
      )}

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
        {submitting ? 'Submitting…' : mode === 'decline' ? 'Submit Decline' : 'Submit Evaluation'}
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
