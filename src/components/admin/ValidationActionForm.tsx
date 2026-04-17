'use client';

import { useState, useTransition, type FormEvent } from 'react';
import { setValidationStatus } from '@/lib/actions/admin';

type Decision = 'confirmed' | 'denied' | 'expired';

export default function ValidationActionForm({
  validationId,
}: {
  validationId: string;
}) {
  const [decision, setDecision] = useState<Decision>('confirmed');
  const [reason, setReason] = useState('');
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<
    { type: 'idle' } | { type: 'error'; message: string } | { type: 'success' }
  >({ type: 'idle' });

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (reason.trim().length < 5) {
      setResult({ type: 'error', message: 'Reason must be at least 5 characters.' });
      return;
    }
    startTransition(async () => {
      const r = await setValidationStatus({
        validationId,
        status: decision,
        reason: reason.trim(),
      });
      if ('error' in r) {
        setResult({ type: 'error', message: r.error });
        return;
      }
      setResult({ type: 'success' });
      setReason('');
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-3"
      aria-label="Resolve validation request"
    >
      <div>
        <label
          htmlFor="admin-validation-decision"
          className="block text-xs font-medium text-gray-600 mb-1"
        >
          Decision
        </label>
        <select
          id="admin-validation-decision"
          value={decision}
          onChange={(e) => setDecision(e.target.value as Decision)}
          disabled={isPending}
          className="w-full px-2 py-2 border border-gray-200 rounded text-sm bg-white disabled:opacity-60"
        >
          <option value="confirmed">Approve — mark confirmed</option>
          <option value="denied">Reject — mark denied</option>
          <option value="expired">Expire — close out stale request</option>
        </select>
      </div>
      <div>
        <label
          htmlFor="admin-validation-reason"
          className="block text-xs font-medium text-gray-600 mb-1"
        >
          Reason (required, recorded in audit log)
        </label>
        <textarea
          id="admin-validation-reason"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          maxLength={500}
          rows={3}
          disabled={isPending}
          className="w-full px-2 py-2 border border-gray-200 rounded text-sm disabled:opacity-60"
          placeholder="e.g. Validator responded by email — attaching transcript GSR-V-0081"
        />
      </div>

      {result.type === 'error' && (
        <p className="text-xs text-red-700 bg-red-50 border border-red-200 rounded p-2">
          {result.message}
        </p>
      )}
      {result.type === 'success' && (
        <p className="text-xs text-green-800 bg-green-50 border border-green-200 rounded p-2">
          Validation updated.
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="px-4 py-2 bg-[#0A1628] text-white text-sm font-semibold rounded hover:bg-[#C5933A] hover:text-[#0A1628] transition-colors disabled:opacity-60"
      >
        {isPending ? 'Saving…' : 'Submit decision'}
      </button>
    </form>
  );
}
