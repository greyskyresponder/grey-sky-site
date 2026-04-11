'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';

export function RecordsFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value && value !== 'all') {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      params.delete('page');
      router.push(`/dashboard/records?${params.toString()}`);
    },
    [router, searchParams]
  );

  const selectClass =
    'rounded-md border border-[var(--gs-cloud)] px-3 py-1.5 text-sm text-[var(--gs-navy)] focus:border-[var(--gs-gold)] focus:ring-1 focus:ring-[var(--gs-gold)] focus:outline-none';

  return (
    <div className="flex flex-wrap items-center gap-3">
      <select
        value={searchParams.get('status') ?? 'all'}
        onChange={(e) => updateParam('status', e.target.value)}
        className={selectClass}
      >
        <option value="all">All statuses</option>
        <option value="draft">Draft</option>
        <option value="submitted">Submitted</option>
        <option value="verified">Verified</option>
      </select>

      <select
        value={searchParams.get('tier') ?? 'all'}
        onChange={(e) => updateParam('tier', e.target.value)}
        className={selectClass}
      >
        <option value="all">All tiers</option>
        <option value="self_certified">Self-Reported</option>
        <option value="validated_360">Peer Verified</option>
        <option value="evaluated_ics225">Formally Evaluated</option>
      </select>

      <input
        type="date"
        value={searchParams.get('from') ?? ''}
        onChange={(e) => updateParam('from', e.target.value)}
        placeholder="From date"
        className={selectClass}
      />

      <input
        type="date"
        value={searchParams.get('to') ?? ''}
        onChange={(e) => updateParam('to', e.target.value)}
        placeholder="To date"
        className={selectClass}
      />
    </div>
  );
}
