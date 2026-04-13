// TODO: test — primary discipline dropdown from disciplines.ts, secondary multi-select, char counter
'use client';

import { useState } from 'react';
import { updateServiceIdentity } from '@/lib/actions/profile';
import { disciplines } from '@/lib/disciplines';
import type { UserProfile } from '@/lib/types/profile';

const inputClass = 'w-full rounded-md border border-[var(--gs-cloud)] px-3 py-2 text-sm text-[var(--gs-navy)] focus:border-[var(--gs-gold)] focus:ring-1 focus:ring-[var(--gs-gold)] focus:outline-none';
const labelClass = 'block text-sm font-medium text-[var(--gs-steel)] mb-1';

export default function ServiceIdentityForm({ profile }: { profile: UserProfile }) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [statement, setStatement] = useState(profile.service_statement ?? '');
  const [secondaryDisciplines, setSecondaryDisciplines] = useState<string[]>(
    profile.secondary_disciplines ?? []
  );

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    const form = new FormData(e.currentTarget);
    const yearStr = form.get('service_start_year') as string;

    const result = await updateServiceIdentity({
      primary_discipline: (form.get('primary_discipline') as string) || '',
      secondary_disciplines: secondaryDisciplines,
      service_start_year: yearStr ? parseInt(yearStr, 10) : null,
      service_statement: statement || '',
    });

    setSaving(false);
    if (result.error) setError(result.error);
    else setSuccess(true);
  }

  function toggleSecondary(slug: string) {
    setSecondaryDisciplines((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <p className="text-sm text-[var(--gs-alert)] bg-red-50 border border-red-200 rounded p-2">{error}</p>}
      {success && <p className="text-sm text-[var(--gs-success)] bg-green-50 border border-green-200 rounded p-2">Saved</p>}

      <div>
        <label htmlFor="primary_discipline" className={labelClass}>Primary Discipline</label>
        <select id="primary_discipline" name="primary_discipline" defaultValue={profile.primary_discipline ?? ''} className={inputClass}>
          <option value="">Select discipline...</option>
          {disciplines.map((d) => (
            <option key={d.slug} value={d.slug}>{d.name}</option>
          ))}
        </select>
      </div>

      <div>
        <p className={labelClass}>Additional Disciplines</p>
        <div className="flex flex-wrap gap-2">
          {disciplines.map((d) => {
            const selected = secondaryDisciplines.includes(d.slug);
            return (
              <button
                key={d.slug}
                type="button"
                onClick={() => toggleSecondary(d.slug)}
                className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                  selected
                    ? 'bg-[var(--gs-gold)] text-[var(--gs-navy)]'
                    : 'bg-[var(--gs-cloud)]/50 text-[var(--gs-steel)] hover:bg-[var(--gs-cloud)]'
                }`}
              >
                {d.abbr}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <label htmlFor="service_start_year" className={labelClass}>Year You Started Serving</label>
        <input
          id="service_start_year"
          name="service_start_year"
          type="number"
          min={1950}
          max={new Date().getFullYear()}
          defaultValue={profile.service_start_year ?? ''}
          placeholder="e.g., 2008"
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="service_statement" className={labelClass}>Service Statement</label>
        <textarea
          id="service_statement"
          aria-label="Service statement"
          value={statement}
          onChange={(e) => setStatement(e.target.value.slice(0, 500))}
          rows={3}
          placeholder="Why do you serve? What drives you? (min 50 characters for profile completeness)"
          className={inputClass}
        />
        <p className="text-xs text-[var(--gs-steel)] mt-1 text-right">{statement.length}/500</p>
      </div>

      <button type="submit" disabled={saving} className="px-5 py-2 text-sm font-semibold bg-[var(--gs-gold)] text-[var(--gs-navy)] rounded-lg hover:bg-[var(--gs-gold)]/90 transition-colors disabled:opacity-50">
        {saving ? 'Saving...' : 'Save Service Identity'}
      </button>
    </form>
  );
}
