'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { registrationSchema } from '@/lib/validators/auth';
import { createClient } from '@/lib/supabase/client';

const US_STATES = [
  { value: 'AL', label: 'Alabama' },
  { value: 'AK', label: 'Alaska' },
  { value: 'AZ', label: 'Arizona' },
  { value: 'AR', label: 'Arkansas' },
  { value: 'CA', label: 'California' },
  { value: 'CO', label: 'Colorado' },
  { value: 'CT', label: 'Connecticut' },
  { value: 'DE', label: 'Delaware' },
  { value: 'FL', label: 'Florida' },
  { value: 'GA', label: 'Georgia' },
  { value: 'HI', label: 'Hawaii' },
  { value: 'ID', label: 'Idaho' },
  { value: 'IL', label: 'Illinois' },
  { value: 'IN', label: 'Indiana' },
  { value: 'IA', label: 'Iowa' },
  { value: 'KS', label: 'Kansas' },
  { value: 'KY', label: 'Kentucky' },
  { value: 'LA', label: 'Louisiana' },
  { value: 'ME', label: 'Maine' },
  { value: 'MD', label: 'Maryland' },
  { value: 'MA', label: 'Massachusetts' },
  { value: 'MI', label: 'Michigan' },
  { value: 'MN', label: 'Minnesota' },
  { value: 'MS', label: 'Mississippi' },
  { value: 'MO', label: 'Missouri' },
  { value: 'MT', label: 'Montana' },
  { value: 'NE', label: 'Nebraska' },
  { value: 'NV', label: 'Nevada' },
  { value: 'NH', label: 'New Hampshire' },
  { value: 'NJ', label: 'New Jersey' },
  { value: 'NM', label: 'New Mexico' },
  { value: 'NY', label: 'New York' },
  { value: 'NC', label: 'North Carolina' },
  { value: 'ND', label: 'North Dakota' },
  { value: 'OH', label: 'Ohio' },
  { value: 'OK', label: 'Oklahoma' },
  { value: 'OR', label: 'Oregon' },
  { value: 'PA', label: 'Pennsylvania' },
  { value: 'RI', label: 'Rhode Island' },
  { value: 'SC', label: 'South Carolina' },
  { value: 'SD', label: 'South Dakota' },
  { value: 'TN', label: 'Tennessee' },
  { value: 'TX', label: 'Texas' },
  { value: 'UT', label: 'Utah' },
  { value: 'VT', label: 'Vermont' },
  { value: 'VA', label: 'Virginia' },
  { value: 'WA', label: 'Washington' },
  { value: 'WV', label: 'West Virginia' },
  { value: 'WI', label: 'Wisconsin' },
  { value: 'WY', label: 'Wyoming' },
  { value: 'DC', label: 'District of Columbia' },
  { value: 'PR', label: 'Puerto Rico' },
  { value: 'VI', label: 'U.S. Virgin Islands' },
  { value: 'GU', label: 'Guam' },
  { value: 'AS', label: 'American Samoa' },
  { value: 'MP', label: 'Northern Mariana Islands' },
] as const;

const inputClass =
  'w-full px-3 py-2.5 border border-[var(--gs-cloud)] rounded text-[var(--gs-navy)] placeholder-[var(--gs-silver)] focus:outline-none focus:ring-2 focus:ring-[var(--gs-gold)] focus:border-transparent bg-white';
const labelClass =
  'block text-sm font-medium text-[var(--gs-steel)] mb-1.5';
const errorClass = 'text-xs text-[var(--gs-alert)] mt-1';

export default function RegisterForm() {
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [confirmEmail, setConfirmEmail] = useState(false);
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState('');
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFieldErrors({});
    setServerError(null);
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const raw = {
      email: form.get('email') as string,
      password: form.get('password') as string,
      confirm_password: form.get('confirm_password') as string,
      first_name: form.get('first_name') as string,
      last_name: form.get('last_name') as string,
      phone: (form.get('phone') as string) || undefined,
      location_state: (form.get('location_state') as string) || undefined,
    };

    // Client-side validation
    const validation = registrationSchema.safeParse(raw);
    if (!validation.success) {
      const errors: Record<string, string> = {};
      for (const err of validation.error.issues) {
        const field = err.path[0] as string;
        if (!errors[field]) {
          errors[field] = err.message;
        }
      }
      setFieldErrors(errors);
      setLoading(false);
      return;
    }

    const { email, password, first_name, last_name } = validation.data;
    // TODO: phone and location_state require admin client (service role key)
    // to write to the users table. Restore server-side handling when the
    // Azure SWA server runtime is fixed.

    const GENERIC_ERROR = 'Unable to create account. Please try again.';

    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { first_name, last_name },
      },
    });

    if (error) {
      setServerError(GENERIC_ERROR);
      setLoading(false);
      return;
    }

    // Supabase returns an empty identities array when the email is already in use.
    // Respond identically to the fresh-signup path so attackers cannot enumerate users.
    if (data.user?.identities?.length === 0) {
      setConfirmEmail(true);
      setLoading(false);
      return;
    }

    if (data.session) {
      router.push('/dashboard');
      router.refresh();
      return;
    }

    setConfirmEmail(true);
    setLoading(false);
  }

  if (confirmEmail) {
    return (
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--gs-gold)]/10 flex items-center justify-center">
          <svg
            className="w-8 h-8 text-[var(--gs-gold)]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-[var(--gs-navy)] mb-2">
          Check your email
        </h2>
        <p className="text-[var(--gs-steel)] mb-6">
          We sent a confirmation link to your email address. Click the link to
          activate your account.
        </p>
        <Link
          href="/login"
          className="text-[var(--gs-gold)] hover:text-[var(--gs-gold-dark)] font-medium"
        >
          Return to sign in
        </Link>
      </div>
    );
  }

  return (
    <>
      <h1 className="text-2xl font-semibold text-[var(--gs-navy)] mb-6">
        Create Account
      </h1>

      {serverError && (
        <div className="mb-4 p-3 rounded bg-red-50 border border-red-200 text-[var(--gs-alert)] text-sm">
          {serverError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="first_name" className={labelClass}>
              First Name
            </label>
            <input
              id="first_name"
              name="first_name"
              type="text"
              required
              className={inputClass}
              placeholder="Alex"
            />
            {fieldErrors.first_name && (
              <p className={errorClass}>{fieldErrors.first_name}</p>
            )}
          </div>
          <div>
            <label htmlFor="last_name" className={labelClass}>
              Last Name
            </label>
            <input
              id="last_name"
              name="last_name"
              type="text"
              required
              className={inputClass}
              placeholder="Mercer"
            />
            {fieldErrors.last_name && (
              <p className={errorClass}>{fieldErrors.last_name}</p>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="email" className={labelClass}>
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className={inputClass}
            placeholder="operator@agency.gov"
          />
          {fieldErrors.email && (
            <p className={errorClass}>{fieldErrors.email}</p>
          )}
        </div>

        <div>
          <label htmlFor="password" className={labelClass}>
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputClass}
            placeholder="Minimum 12 characters"
          />
          {fieldErrors.password && (
            <p className={errorClass}>{fieldErrors.password}</p>
          )}
          {/* Password strength indicator */}
          <div className="mt-2 flex gap-1">
            <div
              className={`h-1 flex-1 rounded ${
                password.length >= 1 ? 'bg-[var(--gs-alert)]' : 'bg-[var(--gs-cloud)]'
              }`}
            />
            <div
              className={`h-1 flex-1 rounded ${
                password.length >= 8 ? 'bg-[var(--gs-gold)]' : 'bg-[var(--gs-cloud)]'
              }`}
            />
            <div
              className={`h-1 flex-1 rounded ${
                password.length >= 12 ? 'bg-[var(--gs-success)]' : 'bg-[var(--gs-cloud)]'
              }`}
            />
          </div>
          <p className="text-xs text-[var(--gs-silver)] mt-1">
            {password.length >= 12
              ? 'Strong — meets minimum length'
              : `${12 - password.length} more character${12 - password.length !== 1 ? 's' : ''} needed`}
          </p>
        </div>

        <div>
          <label htmlFor="confirm_password" className={labelClass}>
            Confirm Password
          </label>
          <input
            id="confirm_password"
            name="confirm_password"
            type="password"
            required
            className={inputClass}
            placeholder="Re-enter password"
          />
          {fieldErrors.confirm_password && (
            <p className={errorClass}>{fieldErrors.confirm_password}</p>
          )}
        </div>

        <div>
          <label htmlFor="location_state" className={labelClass}>
            State <span className="text-[var(--gs-silver)]">(optional)</span>
          </label>
          <select
            id="location_state"
            name="location_state"
            className={inputClass}
            defaultValue=""
          >
            <option value="">Select state</option>
            {US_STATES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
          {fieldErrors.location_state && (
            <p className={errorClass}>{fieldErrors.location_state}</p>
          )}
        </div>

        <div>
          <label htmlFor="phone" className={labelClass}>
            Phone <span className="text-[var(--gs-silver)]">(optional)</span>
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            className={inputClass}
            placeholder="+1 (555) 000-0000"
          />
          {fieldErrors.phone && (
            <p className={errorClass}>{fieldErrors.phone}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 px-4 bg-[var(--gs-navy)] text-white font-semibold rounded transition-colors hover:bg-[var(--gs-gold)] hover:text-[var(--gs-navy)] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="inline-flex items-center gap-2">
              <svg
                className="animate-spin h-4 w-4"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              Creating account...
            </span>
          ) : (
            'Create Account'
          )}
        </button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-[var(--gs-steel)]">
          Already have an account?{' '}
          <Link
            href="/login"
            className="text-[var(--gs-gold)] hover:text-[var(--gs-gold-dark)] font-medium"
          >
            Sign in
          </Link>
        </p>
      </div>
    </>
  );
}
