'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { requestValidation } from '@/lib/validation/actions';

const inputClass =
  'w-full rounded-md border border-[var(--gs-cloud)] px-3 py-2 text-sm text-[var(--gs-navy)] focus:border-[var(--gs-gold)] focus:ring-1 focus:ring-[var(--gs-gold)] focus:outline-none';
const labelClass = 'block text-sm font-medium text-[var(--gs-steel)] mb-1';

interface Props {
  deploymentRecordId: string;
  onClose: () => void;
}

export function RequestValidationModal({ deploymentRecordId, onClose }: Props) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [context, setContext] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const res = await requestValidation({
      deploymentRecordId,
      validatorEmail: email.trim(),
      validatorName: name.trim(),
      relationshipContext: context.trim() || undefined,
    });
    if ('error' in res) {
      setError(res.error);
      setSubmitting(false);
      return;
    }
    onClose();
    router.refresh();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <h3 className="text-lg font-semibold text-[var(--gs-navy)] mb-1">
          Request Validation
        </h3>
        <p className="text-xs text-[var(--gs-steel)] mb-4">
          Costs 10 Sky Coins. A single-use link is emailed to the validator and expires in 30 days.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="validator-email" className={labelClass}>
              Validator email
            </label>
            <input
              id="validator-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="validator-name" className={labelClass}>
              Validator name
            </label>
            <input
              id="validator-name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="validator-context" className={labelClass}>
              Relationship context (optional)
            </label>
            <textarea
              id="validator-context"
              rows={3}
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder="e.g. We served together at Helene as Section Chiefs"
              className={inputClass}
            />
          </div>

          {error && (
            <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded px-3 py-2">
              {error}
            </p>
          )}

          <div className="flex items-center gap-3 justify-end pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="border border-[var(--gs-cloud)] text-[var(--gs-steel)] px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="bg-[var(--gs-gold)] text-[var(--gs-navy)] px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50"
            >
              {submitting ? 'Sending…' : 'Send Request (10 Coins)'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
