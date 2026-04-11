'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { US_STATES } from '@/lib/constants/states';
import { updateProfileAction, uploadAvatarAction } from '@/lib/actions/profile';
import type { MemberProfile, UserAffinityDetail } from '@/lib/types/profile';
import type { Affinity } from '@/lib/types/taxonomy';
import { AffinitySelector } from './AffinitySelector';
import { AvatarUpload } from './AvatarUpload';

const inputClass =
  'w-full rounded-md border border-[var(--gs-cloud)] px-3 py-2 text-sm text-[var(--gs-navy)] focus:border-[var(--gs-gold)] focus:ring-1 focus:ring-[var(--gs-gold)] focus:outline-none';
const labelClass = 'block text-sm font-medium text-[var(--gs-steel)] mb-1';

interface Props {
  profile: MemberProfile;
  allAffinities: Affinity[];
}

export function ProfileEditForm({ profile, allAffinities }: Props) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [bio, setBio] = useState(profile.bio ?? '');
  const [selectedAffinities, setSelectedAffinities] = useState<string[]>(
    profile.affinities.map((a: UserAffinityDetail) => a.affinityId)
  );

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    formData.set('bio', bio);
    formData.set('affinityIds', JSON.stringify(selectedAffinities));

    const result = await updateProfileAction(formData);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    } else {
      router.push('/dashboard/profile');
      router.refresh();
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-[var(--gs-alert)] rounded p-3 text-sm">
          {error}
        </div>
      )}

      {/* Avatar */}
      <div className="bg-white rounded-lg shadow-sm border border-[var(--gs-cloud)] p-6">
        <h3 className="text-lg font-semibold text-[var(--gs-navy)] mb-4">Profile Photo</h3>
        <AvatarUpload
          currentUrl={profile.avatarUrl}
          firstName={profile.firstName}
          lastName={profile.lastName}
        />
      </div>

      {/* Personal Info */}
      <div className="bg-white rounded-lg shadow-sm border border-[var(--gs-cloud)] p-6">
        <h3 className="text-lg font-semibold text-[var(--gs-navy)] mb-4">Personal Information</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="firstName" className={labelClass}>First name</label>
            <input
              id="firstName"
              name="firstName"
              type="text"
              defaultValue={profile.firstName}
              className={inputClass}
              required
            />
          </div>
          <div>
            <label htmlFor="lastName" className={labelClass}>Last name</label>
            <input
              id="lastName"
              name="lastName"
              type="text"
              defaultValue={profile.lastName}
              className={inputClass}
              required
            />
          </div>
        </div>

        <div className="mt-4">
          <label htmlFor="email" className={labelClass}>Email</label>
          <input
            id="email"
            type="email"
            value={profile.email}
            disabled
            aria-describedby="email-hint"
            className={`${inputClass} bg-gray-50 text-[var(--gs-steel)] cursor-not-allowed`}
          />
          <p id="email-hint" className="text-xs text-[var(--gs-steel)] mt-1">
            Email is managed through your account settings.
          </p>
        </div>

        <div className="mt-4">
          <label htmlFor="phone" className={labelClass}>Phone (E.164 format)</label>
          <input
            id="phone"
            name="phone"
            type="tel"
            defaultValue={profile.phone ?? ''}
            placeholder="+15551234567"
            className={inputClass}
          />
        </div>
      </div>

      {/* Location */}
      <div className="bg-white rounded-lg shadow-sm border border-[var(--gs-cloud)] p-6">
        <h3 className="text-lg font-semibold text-[var(--gs-navy)] mb-4">Location</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="locationCity" className={labelClass}>City</label>
            <input
              id="locationCity"
              name="locationCity"
              type="text"
              defaultValue={profile.locationCity ?? ''}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="locationState" className={labelClass}>State</label>
            <select
              id="locationState"
              name="locationState"
              defaultValue={profile.locationState ?? ''}
              className={inputClass}
            >
              <option value="">Select state</option>
              {US_STATES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="mt-4">
          <label htmlFor="locationCountry" className={labelClass}>Country</label>
          <input
            id="locationCountry"
            name="locationCountry"
            type="text"
            defaultValue={profile.locationCountry ?? 'US'}
            className={inputClass}
          />
        </div>
      </div>

      {/* Bio */}
      <div className="bg-white rounded-lg shadow-sm border border-[var(--gs-cloud)] p-6">
        <h3 className="text-lg font-semibold text-[var(--gs-navy)] mb-4">About You</h3>
        <textarea
          id="bio"
          aria-label="About you"
          value={bio}
          onChange={(e) => setBio(e.target.value.slice(0, 500))}
          rows={4}
          placeholder="Tell us about your experience in emergency management. What drives you to serve?"
          className={inputClass}
        />
        <p className="text-xs text-[var(--gs-steel)] mt-1 text-right">
          {bio.length}/500
        </p>
      </div>

      {/* Affinities */}
      <div className="bg-white rounded-lg shadow-sm border border-[var(--gs-cloud)] p-6">
        <h3 className="text-lg font-semibold text-[var(--gs-navy)] mb-1">Your Connections</h3>
        <p className="text-sm text-[var(--gs-steel)] mb-4">
          The hazards, specialties, and sectors that define your experience.
        </p>
        <AffinitySelector
          allAffinities={allAffinities}
          selected={selectedAffinities}
          onChange={setSelectedAffinities}
        />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={loading}
          className="bg-[var(--gs-navy)] text-white hover:opacity-90 px-6 py-2.5 rounded-md text-sm font-medium disabled:opacity-50 transition-opacity"
        >
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
        <button
          type="button"
          onClick={() => router.push('/dashboard/profile')}
          className="border border-[var(--gs-cloud)] text-[var(--gs-steel)] hover:bg-[var(--gs-white)] px-6 py-2.5 rounded-md text-sm font-medium transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
