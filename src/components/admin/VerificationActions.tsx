'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Check, X } from 'lucide-react';
import { verifyFulfillment, rejectFulfillment } from '@/lib/actions/requirements';

export default function VerificationActions({
  fulfillmentId,
  defaultExpiresAt,
}: {
  fulfillmentId: string;
  defaultExpiresAt?: string | null;
}) {
  const router = useRouter();
  const [mode, setMode] = useState<'idle' | 'verify' | 'reject'>('idle');
  const [expiresAt, setExpiresAt] = useState(defaultExpiresAt ?? '');
  const [notes, setNotes] = useState('');
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleVerify() {
    setError(null);
    startTransition(async () => {
      const res = await verifyFulfillment({
        fulfillment_id: fulfillmentId,
        expires_at: expiresAt || '',
        notes: notes || '',
      });
      if (res.error) {
        setError(res.error);
        return;
      }
      router.push('/admin/verifications');
      router.refresh();
    });
  }

  function handleReject() {
    setError(null);
    if (!reason.trim()) {
      setError('Rejection reason is required.');
      return;
    }
    startTransition(async () => {
      const res = await rejectFulfillment({
        fulfillment_id: fulfillmentId,
        reason: reason.trim(),
      });
      if (res.error) {
        setError(res.error);
        return;
      }
      router.push('/admin/verifications');
      router.refresh();
    });
  }

  if (mode === 'idle') {
    return (
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setMode('verify')}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
        >
          <Check className="w-4 h-4" />
          Verify
        </button>
        <button
          type="button"
          onClick={() => setMode('reject')}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
        >
          <X className="w-4 h-4" />
          Reject
        </button>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 rounded-lg border border-gray-200 p-4 space-y-3">
      {error && (
        <div className="px-3 py-2 rounded bg-red-50 text-red-800 text-sm">{error}</div>
      )}

      {mode === 'verify' ? (
        <>
          <h3 className="text-sm font-semibold text-[#0A1628]">Verify this submission</h3>
          <label className="block">
            <span className="text-xs font-semibold text-[#0A1628] uppercase tracking-wide">
              Expires on (optional)
            </span>
            <input
              type="date"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-[#C5933A]"
            />
            <span className="block mt-1 text-xs text-gray-500">
              For certs that expire (EMT, HazMat Tech). Leave blank if it doesn&apos;t expire.
            </span>
          </label>
          <label className="block">
            <span className="text-xs font-semibold text-[#0A1628] uppercase tracking-wide">
              Verifier notes (optional)
            </span>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-[#C5933A]"
              placeholder="Equivalency note, renewal reference, etc."
            />
          </label>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleVerify}
              disabled={isPending}
              className="inline-flex items-center gap-1 px-4 py-2 text-sm font-semibold bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 transition-colors"
            >
              <Check className="w-4 h-4" />
              {isPending ? 'Saving…' : 'Confirm Verification'}
            </button>
            <button
              type="button"
              onClick={() => setMode('idle')}
              className="px-3 py-2 text-sm text-gray-600 hover:text-[#0A1628]"
            >
              Cancel
            </button>
          </div>
        </>
      ) : (
        <>
          <h3 className="text-sm font-semibold text-[#0A1628]">Reject this submission</h3>
          <label className="block">
            <span className="text-xs font-semibold text-[#0A1628] uppercase tracking-wide">
              Reason (required)
            </span>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-[#C5933A]"
              placeholder="What was wrong? The responder will see this."
            />
          </label>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleReject}
              disabled={isPending}
              className="inline-flex items-center gap-1 px-4 py-2 text-sm font-semibold bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 transition-colors"
            >
              <X className="w-4 h-4" />
              {isPending ? 'Saving…' : 'Confirm Rejection'}
            </button>
            <button
              type="button"
              onClick={() => setMode('idle')}
              className="px-3 py-2 text-sm text-gray-600 hover:text-[#0A1628]"
            >
              Cancel
            </button>
          </div>
        </>
      )}
    </div>
  );
}
