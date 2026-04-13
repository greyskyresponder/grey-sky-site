// TODO: test — form renders with initial values, submit calls updateBasicInfo, error display
'use client';

import { useState } from 'react';
import { updateBasicInfo } from '@/lib/actions/profile';
import { US_STATES } from '@/lib/constants/states';
import type { UserProfile } from '@/lib/types/profile';

const inputClass = 'w-full rounded-md border border-[var(--gs-cloud)] px-3 py-2 text-sm text-[var(--gs-navy)] focus:border-[var(--gs-gold)] focus:ring-1 focus:ring-[var(--gs-gold)] focus:outline-none';
const labelClass = 'block text-sm font-medium text-[var(--gs-steel)] mb-1';

export default function BasicInfoForm({ profile }: { profile: UserProfile }) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    const form = new FormData(e.currentTarget);
    const result = await updateBasicInfo({
      first_name: form.get('first_name') as string,
      last_name: form.get('last_name') as string,
      preferred_name: (form.get('preferred_name') as string) || '',
      phone: (form.get('phone') as string) || '',
      date_of_birth: (form.get('date_of_birth') as string) || '',
      location_city: (form.get('location_city') as string) || '',
      location_state: (form.get('location_state') as string) || '',
      location_country: (form.get('location_country') as string) || 'USA',
    });

    setSaving(false);
    if (result.error) setError(result.error);
    else setSuccess(true);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <p className="text-sm text-[var(--gs-alert)] bg-red-50 border border-red-200 rounded p-2">{error}</p>}
      {success && <p className="text-sm text-[var(--gs-success)] bg-green-50 border border-green-200 rounded p-2">Saved</p>}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="first_name" className={labelClass}>First Name <span className="text-red-500">*</span></label>
          <input id="first_name" name="first_name" type="text" required defaultValue={profile.first_name ?? ''} className={inputClass} />
        </div>
        <div>
          <label htmlFor="last_name" className={labelClass}>Last Name <span className="text-red-500">*</span></label>
          <input id="last_name" name="last_name" type="text" required defaultValue={profile.last_name ?? ''} className={inputClass} />
        </div>
      </div>

      <div>
        <label htmlFor="preferred_name" className={labelClass}>Preferred Name</label>
        <input id="preferred_name" name="preferred_name" type="text" defaultValue={profile.preferred_name ?? ''} placeholder="How you'd like to be addressed" className={inputClass} />
      </div>

      <div>
        <label htmlFor="phone" className={labelClass}>Phone (E.164 format)</label>
        <input id="phone" name="phone" type="tel" defaultValue={profile.phone ?? ''} placeholder="+15551234567" className={inputClass} />
      </div>

      <div>
        <label htmlFor="date_of_birth" className={labelClass}>Date of Birth</label>
        <input id="date_of_birth" name="date_of_birth" type="date" defaultValue={profile.date_of_birth ?? ''} className={inputClass} />
        <p className="text-xs text-[var(--gs-steel)] mt-1">Never displayed on your profile. Used for verification only.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="location_city" className={labelClass}>City</label>
          <input id="location_city" name="location_city" type="text" defaultValue={profile.location_city ?? ''} className={inputClass} />
        </div>
        <div>
          <label htmlFor="location_state" className={labelClass}>State</label>
          <select id="location_state" name="location_state" defaultValue={profile.location_state ?? ''} className={inputClass}>
            <option value="">Select state</option>
            {US_STATES.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="location_country" className={labelClass}>Country</label>
        <input id="location_country" name="location_country" type="text" defaultValue={profile.location_country ?? 'USA'} className={inputClass} />
      </div>

      <button type="submit" disabled={saving} className="px-5 py-2 text-sm font-semibold bg-[var(--gs-gold)] text-[var(--gs-navy)] rounded-lg hover:bg-[var(--gs-gold)]/90 transition-colors disabled:opacity-50">
        {saving ? 'Saving...' : 'Save Basic Info'}
      </button>
    </form>
  );
}
