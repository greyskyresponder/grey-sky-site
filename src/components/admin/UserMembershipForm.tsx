'use client';

import { useState, useTransition, type FormEvent } from 'react';
import { updateMembership } from '@/lib/actions/admin';

type MembershipStatus = 'active' | 'expired' | 'none';

const options: { label: string; value: MembershipStatus }[] = [
  { label: 'Active', value: 'active' },
  { label: 'Expired', value: 'expired' },
  { label: 'None', value: 'none' },
];

function toDatetimeLocal(iso: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function UserMembershipForm({
  userId,
  currentStatus,
  currentExpiresAt,
}: {
  userId: string;
  currentStatus: MembershipStatus;
  currentExpiresAt: string | null;
}) {
  const [status, setStatus] = useState<MembershipStatus>(currentStatus);
  const [expiresAt, setExpiresAt] = useState<string>(
    toDatetimeLocal(currentExpiresAt),
  );
  const [reason, setReason] = useState('');
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<
    { type: 'idle' } | { type: 'error'; message: string } | { type: 'success' }
  >({ type: 'idle' });

  const dirty =
    status !== currentStatus ||
    expiresAt !== toDatetimeLocal(currentExpiresAt);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!dirty) {
      setResult({ type: 'error', message: 'Nothing to update.' });
      return;
    }
    if (reason.trim().length < 5) {
      setResult({ type: 'error', message: 'Reason must be at least 5 characters.' });
      return;
    }

    const payload = {
      userId,
      membershipStatus: status,
      membershipExpiresAt: expiresAt
        ? new Date(expiresAt).toISOString()
        : null,
      reason: reason.trim(),
    };

    startTransition(async () => {
      const r = await updateMembership(payload);
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
      aria-label="Adjust user membership"
    >
      <div>
        <label
          htmlFor="admin-membership-status"
          className="block text-xs font-medium text-gray-600 mb-1"
        >
          Membership status
        </label>
        <select
          id="admin-membership-status"
          value={status}
          onChange={(e) => setStatus(e.target.value as MembershipStatus)}
          disabled={isPending}
          className="w-full px-2 py-2 border border-gray-200 rounded text-sm bg-white disabled:opacity-60"
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label
          htmlFor="admin-membership-expires"
          className="block text-xs font-medium text-gray-600 mb-1"
        >
          Expires at (local time)
        </label>
        <input
          id="admin-membership-expires"
          type="datetime-local"
          value={expiresAt}
          onChange={(e) => setExpiresAt(e.target.value)}
          disabled={isPending}
          className="w-full px-2 py-2 border border-gray-200 rounded text-sm disabled:opacity-60"
        />
        <p className="text-[11px] text-gray-400 mt-1">
          Clear to remove expiry. Stripe remains the source of truth for paid memberships.
        </p>
      </div>
      <div>
        <label
          htmlFor="admin-membership-reason"
          className="block text-xs font-medium text-gray-600 mb-1"
        >
          Reason
        </label>
        <textarea
          id="admin-membership-reason"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          maxLength={500}
          rows={2}
          disabled={isPending || !dirty}
          className="w-full px-2 py-2 border border-gray-200 rounded text-sm disabled:opacity-60"
          placeholder="e.g. Comped for 12 months — contract GSR-ORG-42"
        />
      </div>

      {result.type === 'error' && (
        <p className="text-xs text-red-700 bg-red-50 border border-red-200 rounded p-2">
          {result.message}
        </p>
      )}
      {result.type === 'success' && (
        <p className="text-xs text-green-800 bg-green-50 border border-green-200 rounded p-2">
          Membership updated.
        </p>
      )}

      <button
        type="submit"
        disabled={isPending || !dirty}
        className="px-4 py-2 bg-[#0A1628] text-white text-sm font-semibold rounded hover:bg-[#C5933A] hover:text-[#0A1628] transition-colors disabled:opacity-60"
      >
        {isPending ? 'Saving…' : 'Apply membership change'}
      </button>
    </form>
  );
}
