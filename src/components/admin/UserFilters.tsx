'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useTransition, type FormEvent } from 'react';
import { Search } from 'lucide-react';

const roleOptions: { label: string; value: string }[] = [
  { label: 'All roles', value: 'all' },
  { label: 'Member', value: 'member' },
  { label: 'Org admin', value: 'org_admin' },
  { label: 'Assessor', value: 'assessor' },
  { label: 'Platform admin', value: 'platform_admin' },
];

const membershipOptions: { label: string; value: string }[] = [
  { label: 'All memberships', value: 'all' },
  { label: 'Active', value: 'active' },
  { label: 'Expired', value: 'expired' },
  { label: 'None', value: 'none' },
];

export default function UserFilters() {
  const router = useRouter();
  const params = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [q, setQ] = useState(params.get('q') ?? '');
  const [role, setRole] = useState(params.get('role') ?? 'all');
  const [membership, setMembership] = useState(
    params.get('membership_status') ?? 'all',
  );

  function applyFilters(next: { q: string; role: string; membership: string }) {
    const search = new URLSearchParams();
    if (next.q.trim()) search.set('q', next.q.trim());
    if (next.role && next.role !== 'all') search.set('role', next.role);
    if (next.membership && next.membership !== 'all')
      search.set('membership_status', next.membership);
    const qs = search.toString();
    startTransition(() => {
      router.push(qs ? `/admin/users?${qs}` : '/admin/users');
    });
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    applyFilters({ q, role, membership });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-lg border border-gray-200 p-4 mb-4 flex flex-col sm:flex-row gap-3 items-stretch sm:items-end"
      aria-label="Filter users"
    >
      <div className="flex-1 min-w-0">
        <label
          htmlFor="admin-user-search"
          className="block text-xs font-medium text-gray-600 mb-1"
        >
          Search
        </label>
        <div className="relative">
          <Search
            className="absolute left-2.5 top-2.5 w-4 h-4 text-gray-400"
            aria-hidden="true"
          />
          <input
            id="admin-user-search"
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Name or email"
            className="w-full pl-8 pr-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-[#C5933A]"
          />
        </div>
      </div>
      <div className="sm:w-40">
        <label
          htmlFor="admin-user-role"
          className="block text-xs font-medium text-gray-600 mb-1"
        >
          Role
        </label>
        <select
          id="admin-user-role"
          value={role}
          onChange={(e) => {
            setRole(e.target.value);
            applyFilters({ q, role: e.target.value, membership });
          }}
          className="w-full px-2 py-2 border border-gray-200 rounded text-sm bg-white"
        >
          {roleOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
      <div className="sm:w-44">
        <label
          htmlFor="admin-user-membership"
          className="block text-xs font-medium text-gray-600 mb-1"
        >
          Membership
        </label>
        <select
          id="admin-user-membership"
          value={membership}
          onChange={(e) => {
            setMembership(e.target.value);
            applyFilters({ q, role, membership: e.target.value });
          }}
          className="w-full px-2 py-2 border border-gray-200 rounded text-sm bg-white"
        >
          {membershipOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
      <button
        type="submit"
        disabled={isPending}
        className="px-4 py-2 bg-[#0A1628] text-white text-sm font-semibold rounded hover:bg-[#C5933A] hover:text-[#0A1628] transition-colors disabled:opacity-60"
      >
        Apply
      </button>
    </form>
  );
}
