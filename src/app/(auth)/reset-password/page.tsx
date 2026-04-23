'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Suspense } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
  resetPasswordSchema,
  updatePasswordSchema,
} from '@/lib/validators/auth';

const inputClass =
  'w-full px-3 py-2.5 border border-[var(--gs-cloud)] rounded text-[var(--gs-navy)] placeholder-[var(--gs-silver)] focus:outline-none focus:ring-2 focus:ring-[var(--gs-gold)] focus:border-transparent bg-white';
const labelClass =
  'block text-sm font-medium text-[var(--gs-steel)] mb-1.5';

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  // Supabase sends a code param when arriving from a reset link
  const hasCode = searchParams.has('code');

  if (hasCode) {
    return <UpdatePasswordForm />;
  }

  return <RequestResetForm />;
}

function RequestResetForm() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setFieldErrors({});
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const raw = { email: form.get('email') as string };

    const validation = resetPasswordSchema.safeParse(raw);
    if (!validation.success) {
      const errors: Record<string, string> = {};
      for (const err of validation.error.issues) {
        errors[err.path[0] as string] = err.message;
      }
      setFieldErrors(errors);
      setLoading(false);
      return;
    }

    const supabase = createClient();
    const appUrl =
      process.env.NEXT_PUBLIC_APP_URL ??
      (typeof window !== 'undefined' ? window.location.origin : '');

    // Never differentiate between "email exists" and "email doesn't exist" — this
    // endpoint must respond identically in all cases to prevent user enumeration.
    await supabase.auth.resetPasswordForEmail(validation.data.email, {
      redirectTo: `${appUrl}/reset-password`,
    });

    setSuccess(true);
    setLoading(false);
  }

  if (success) {
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
          If an account exists with that email, we sent password reset
          instructions.
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
      <h1 className="text-2xl font-semibold text-[var(--gs-navy)] mb-2">
        Reset Password
      </h1>
      <p className="text-[var(--gs-steel)] mb-6">
        Enter your email address and we&apos;ll send you a link to reset your
        password.
      </p>

      {error && (
        <div className="mb-4 p-3 rounded bg-red-50 border border-red-200 text-[var(--gs-alert)] text-sm">
          {error}
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

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 px-4 bg-[var(--gs-navy)] text-white font-semibold rounded transition-colors hover:bg-[var(--gs-gold)] hover:text-[var(--gs-navy)] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Sending...' : 'Send Reset Link'}
        </button>
      </form>

      <div className="mt-6 text-center">
        <Link
          href="/login"
          className="text-sm text-[var(--gs-steel)] hover:text-[var(--gs-navy)]"
        >
          Back to sign in
        </Link>
      </div>
    </>
  );
}

function UpdatePasswordForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setFieldErrors({});
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const raw = {
      password: form.get('password') as string,
      confirm_password: form.get('confirm_password') as string,
    };

    const validation = updatePasswordSchema.safeParse(raw);
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
    const { error: updateError } = await supabase.auth.updateUser({
      password: validation.data.password,
    });

    if (updateError) {
      setError(updateError.message);
      setLoading(false);
      return;
    }

    router.push('/dashboard');
    router.refresh();
  }

  return (
    <>
      <h1 className="text-2xl font-semibold text-[var(--gs-navy)] mb-2">
        Set New Password
      </h1>
      <p className="text-[var(--gs-steel)] mb-6">
        Enter your new password below.
      </p>

      {error && (
        <div className="mb-4 p-3 rounded bg-red-50 border border-red-200 text-[var(--gs-alert)] text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="password" className={labelClass}>
            New Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            className={inputClass}
            placeholder="Minimum 12 characters"
          />
          {fieldErrors.password && (
            <p className="text-xs text-[var(--gs-alert)] mt-1">
              {fieldErrors.password}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="confirm_password" className={labelClass}>
            Confirm New Password
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
            <p className="text-xs text-[var(--gs-alert)] mt-1">
              {fieldErrors.confirm_password}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 px-4 bg-[var(--gs-navy)] text-white font-semibold rounded transition-colors hover:bg-[var(--gs-gold)] hover:text-[var(--gs-navy)] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Updating...' : 'Update Password'}
        </button>
      </form>
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordContent />
    </Suspense>
  );
}
