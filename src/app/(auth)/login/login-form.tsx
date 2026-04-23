'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { loginSchema } from '@/lib/validators/auth';
import { MfaChallenge } from '@/components/auth/MfaChallenge';
import { createClient } from '@/lib/supabase/client';

const inputClass =
  'w-full px-3 py-2.5 border border-[var(--gs-cloud)] rounded text-[var(--gs-navy)] placeholder-[var(--gs-silver)] focus:outline-none focus:ring-2 focus:ring-[var(--gs-gold)] focus:border-transparent bg-white';
const labelClass =
  'block text-sm font-medium text-[var(--gs-steel)] mb-1.5';

export default function LoginForm() {
  const router = useRouter();
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [mfaRedirectTo, setMfaRedirectTo] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') ?? undefined;
  const callbackError = searchParams.get('error');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFieldErrors({});
    setServerError(null);
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const raw = {
      email: form.get('email') as string,
      password: form.get('password') as string,
    };

    const validation = loginSchema.safeParse(raw);
    if (!validation.success) {
      const errors: Record<string, string> = {};
      for (const err of validation.error.issues) {
        const field = err.path[0] as string;
        if (!errors[field]) errors[field] = err.message;
      }
      setFieldErrors(errors);
      setLoading(false);
      return;
    }

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: validation.data.email,
      password: validation.data.password,
    });

    if (error) {
      setServerError('Invalid email or password');
      setLoading(false);
      return;
    }

    const safeRedirect =
      redirectTo && redirectTo.startsWith('/') && !redirectTo.startsWith('//')
        ? redirectTo
        : '/dashboard';

    const { data: aal } =
      await supabase.auth.mfa.getAuthenticatorAssuranceLevel();

    if (aal && aal.nextLevel === 'aal2' && aal.currentLevel !== 'aal2') {
      setMfaRedirectTo(safeRedirect);
      setLoading(false);
      return;
    }

    router.push(safeRedirect);
    router.refresh();
  }

  if (mfaRedirectTo) {
    return (
      <MfaChallenge
        onSuccess={() => {
          router.replace(mfaRedirectTo);
          router.refresh();
        }}
      />
    );
  }

  return (
    <>
      <h1 className="text-2xl font-semibold text-[var(--gs-navy)] mb-6">
        Sign In
      </h1>

      {callbackError === 'auth_callback_failed' && (
        <div className="mb-4 p-3 rounded bg-red-50 border border-red-200 text-[var(--gs-alert)] text-sm">
          Authentication failed. Please try signing in again.
        </div>
      )}

      {serverError && (
        <div className="mb-4 p-3 rounded bg-red-50 border border-red-200 text-[var(--gs-alert)] text-sm">
          {serverError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
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
            <p className="text-xs text-[var(--gs-alert)] mt-1">
              {fieldErrors.email}
            </p>
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
            className={inputClass}
            placeholder="Enter your password"
          />
          {fieldErrors.password && (
            <p className="text-xs text-[var(--gs-alert)] mt-1">
              {fieldErrors.password}
            </p>
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
              Signing in...
            </span>
          ) : (
            'Sign In'
          )}
        </button>
      </form>

      <div className="mt-6 space-y-3 text-center">
        <p className="text-sm text-[var(--gs-steel)]">
          Don&apos;t have an account?{' '}
          <Link
            href="/register"
            className="text-[var(--gs-gold)] hover:text-[var(--gs-gold-dark)] font-medium"
          >
            Create one
          </Link>
        </p>
        <p className="text-sm">
          <Link
            href="/reset-password"
            className="text-[var(--gs-steel)] hover:text-[var(--gs-navy)]"
          >
            Forgot your password?
          </Link>
        </p>
      </div>
    </>
  );
}
