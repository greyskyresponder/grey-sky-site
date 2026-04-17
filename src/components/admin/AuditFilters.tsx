'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useTransition, type FormEvent } from 'react';

type AuditFiltersProps = {
  actions: string[];
  entityTypes: string[];
};

export default function AuditFilters({
  actions,
  entityTypes,
}: AuditFiltersProps) {
  const router = useRouter();
  const params = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [actor, setActor] = useState(params.get('actor_id') ?? '');
  const [action, setAction] = useState(params.get('action') ?? '');
  const [entity, setEntity] = useState(params.get('entity_type') ?? '');
  const [from, setFrom] = useState(params.get('from') ?? '');
  const [to, setTo] = useState(params.get('to') ?? '');

  function apply() {
    const search = new URLSearchParams();
    if (actor.trim()) search.set('actor_id', actor.trim());
    if (action) search.set('action', action);
    if (entity) search.set('entity_type', entity);
    if (from) search.set('from', from);
    if (to) search.set('to', to);
    const qs = search.toString();
    startTransition(() => {
      router.push(qs ? `/admin/audit?${qs}` : '/admin/audit');
    });
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    apply();
  }

  function handleClear() {
    setActor('');
    setAction('');
    setEntity('');
    setFrom('');
    setTo('');
    startTransition(() => {
      router.push('/admin/audit');
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-lg border border-gray-200 p-4 mb-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 items-end"
      aria-label="Filter audit log"
    >
      <div className="lg:col-span-2">
        <label
          htmlFor="audit-actor"
          className="block text-xs font-medium text-gray-600 mb-1"
        >
          Actor id
        </label>
        <input
          id="audit-actor"
          type="text"
          value={actor}
          onChange={(e) => setActor(e.target.value)}
          placeholder="UUID"
          className="w-full px-2 py-2 border border-gray-200 rounded text-sm font-mono"
        />
      </div>
      <div>
        <label
          htmlFor="audit-action"
          className="block text-xs font-medium text-gray-600 mb-1"
        >
          Action
        </label>
        <select
          id="audit-action"
          value={action}
          onChange={(e) => setAction(e.target.value)}
          className="w-full px-2 py-2 border border-gray-200 rounded text-sm bg-white"
        >
          <option value="">All</option>
          {actions.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label
          htmlFor="audit-entity"
          className="block text-xs font-medium text-gray-600 mb-1"
        >
          Entity type
        </label>
        <select
          id="audit-entity"
          value={entity}
          onChange={(e) => setEntity(e.target.value)}
          className="w-full px-2 py-2 border border-gray-200 rounded text-sm bg-white"
        >
          <option value="">All</option>
          {entityTypes.map((e) => (
            <option key={e} value={e}>
              {e}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label
          htmlFor="audit-from"
          className="block text-xs font-medium text-gray-600 mb-1"
        >
          From
        </label>
        <input
          id="audit-from"
          type="date"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
          className="w-full px-2 py-2 border border-gray-200 rounded text-sm"
        />
      </div>
      <div>
        <label
          htmlFor="audit-to"
          className="block text-xs font-medium text-gray-600 mb-1"
        >
          To
        </label>
        <input
          id="audit-to"
          type="date"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          className="w-full px-2 py-2 border border-gray-200 rounded text-sm"
        />
      </div>

      <div className="sm:col-span-2 lg:col-span-6 flex items-center gap-2">
        <button
          type="submit"
          disabled={isPending}
          className="px-4 py-2 bg-[#0A1628] text-white text-sm font-semibold rounded hover:bg-[#C5933A] hover:text-[#0A1628] transition-colors disabled:opacity-60"
        >
          Apply filters
        </button>
        <button
          type="button"
          onClick={handleClear}
          disabled={isPending}
          className="px-4 py-2 border border-gray-200 text-gray-600 text-sm font-semibold rounded hover:bg-gray-50 transition-colors disabled:opacity-60"
        >
          Clear
        </button>
      </div>
    </form>
  );
}
