'use client';

import { useState, useTransition, type FormEvent } from 'react';
import { updateUserRole } from '@/lib/actions/admin';

type Role = 'member' | 'org_admin' | 'assessor' | 'platform_admin';

const roleOptions: { label: string; value: Role }[] = [
  { label: 'Member', value: 'member' },
  { label: 'Org admin', value: 'org_admin' },
  { label: 'Assessor', value: 'assessor' },
  { label: 'Platform admin', value: 'platform_admin' },
];

export default function UserRoleForm({
  userId,
  currentRole,
  currentUserIsSelf,
}: {
  userId: string;
  currentRole: Role;
  currentUserIsSelf: boolean;
}) {
  const [role, setRole] = useState<Role>(currentRole);
  const [reason, setReason] = useState('');
  const [confirm, setConfirm] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<
    { type: 'idle' } | { type: 'error'; message: string } | { type: 'success' }
  >({ type: 'idle' });

  const dirty = role !== currentRole;

  function handleSubmit(e: FormEvent) {
    e.preventDefault();

    if (!dirty) {
      setStatus({ type: 'error', message: 'Select a different role to apply a change.' });
      return;
    }
    if (reason.trim().length < 5) {
      setStatus({ type: 'error', message: 'Reason must be at least 5 characters.' });
      return;
    }
    if (!confirm) {
      setStatus({ type: 'error', message: 'Please confirm the role change.' });
      return;
    }

    startTransition(async () => {
      const result = await updateUserRole({ userId, role, reason: reason.trim() });
      if ('error' in result) {
        setStatus({ type: 'error', message: result.error });
        return;
      }
      setStatus({ type: 'success' });
      setReason('');
      setConfirm(false);
    });
  }

  const willDemoteSelf =
    currentUserIsSelf && currentRole === 'platform_admin' && role !== 'platform_admin';

  return (
    <form onSubmit={handleSubmit} className="space-y-3" aria-label="Change user role">
      <div>
        <label
          htmlFor="admin-role-select"
          className="block text-xs font-medium text-gray-600 mb-1"
        >
          Role
        </label>
        <select
          id="admin-role-select"
          value={role}
          onChange={(e) => setRole(e.target.value as Role)}
          disabled={isPending}
          className="w-full px-2 py-2 border border-gray-200 rounded text-sm bg-white disabled:opacity-60"
        >
          {roleOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label
          htmlFor="admin-role-reason"
          className="block text-xs font-medium text-gray-600 mb-1"
        >
          Reason (required, recorded in audit log)
        </label>
        <textarea
          id="admin-role-reason"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          maxLength={500}
          rows={3}
          disabled={isPending || !dirty}
          className="w-full px-2 py-2 border border-gray-200 rounded text-sm disabled:opacity-60"
          placeholder="e.g. Verified assessor credentials — onboarding request GSR-1234"
        />
      </div>

      <label className="flex items-start gap-2 text-xs text-gray-600">
        <input
          type="checkbox"
          checked={confirm}
          onChange={(e) => setConfirm(e.target.checked)}
          disabled={isPending || !dirty}
          className="mt-0.5"
        />
        <span>
          I confirm this role change and understand it will be written to the audit log.
        </span>
      </label>

      {willDemoteSelf && (
        <p className="text-xs text-red-700 bg-red-50 border border-red-200 rounded p-2">
          You are about to remove your own platform admin role. This action is blocked.
        </p>
      )}

      {status.type === 'error' && (
        <p className="text-xs text-red-700 bg-red-50 border border-red-200 rounded p-2">
          {status.message}
        </p>
      )}
      {status.type === 'success' && (
        <p className="text-xs text-green-800 bg-green-50 border border-green-200 rounded p-2">
          Role updated.
        </p>
      )}

      <button
        type="submit"
        disabled={isPending || !dirty || willDemoteSelf}
        className="px-4 py-2 bg-[#0A1628] text-white text-sm font-semibold rounded hover:bg-[#C5933A] hover:text-[#0A1628] transition-colors disabled:opacity-60"
      >
        {isPending ? 'Saving…' : 'Apply role change'}
      </button>
    </form>
  );
}
