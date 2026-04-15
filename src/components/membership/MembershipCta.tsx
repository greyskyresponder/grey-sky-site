'use client';

import { useState, useTransition } from 'react';
import {
  createMembershipCheckout,
  createCustomerPortalSession,
} from '@/lib/stripe/actions';
import type { MembershipInfo } from '@/lib/types/stripe';

interface MembershipCtaProps {
  userId: string;
  membership: MembershipInfo;
}

function formatDate(iso: string | null): string {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export default function MembershipCta({ userId, membership }: MembershipCtaProps) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleCheckout() {
    setError(null);
    startTransition(async () => {
      const result = await createMembershipCheckout(userId);
      if (result.error || !result.url) {
        setError(result.error ?? 'Could not start checkout. Try again.');
        return;
      }
      window.location.href = result.url;
    });
  }

  function handlePortal() {
    setError(null);
    startTransition(async () => {
      const result = await createCustomerPortalSession(userId);
      if (result.error || !result.url) {
        setError(result.error ?? 'Could not open billing portal. Try again.');
        return;
      }
      window.location.href = result.url;
    });
  }

  const buttonClass =
    'px-4 py-2.5 bg-[#C5933A] text-[#0A1628] text-sm font-semibold rounded hover:bg-[#b3852f] disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors';

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5">
      <h3 className="text-lg font-semibold text-[#0A1628]">Grey Sky Membership</h3>

      {membership.isActive ? (
        <>
          <p className="mt-2 text-sm text-gray-600">
            Your membership is active through{' '}
            <span className="font-medium text-[#0A1628]">
              {formatDate(membership.expiresAt)}
            </span>
            .
          </p>
          <button
            type="button"
            onClick={handlePortal}
            disabled={isPending}
            className={`${buttonClass} mt-4`}
          >
            {isPending ? 'Opening…' : 'Manage Membership'}
          </button>
        </>
      ) : membership.status === 'expired' ? (
        <>
          <p className="mt-2 text-sm text-gray-600">
            Your membership has lapsed. Renew to restore your Sky Coins balance and
            continue using member benefits.
          </p>
          <button
            type="button"
            onClick={handleCheckout}
            disabled={isPending}
            className={`${buttonClass} mt-4`}
          >
            {isPending ? 'Redirecting…' : 'Renew Membership — $100/year'}
          </button>
        </>
      ) : (
        <>
          <p className="mt-2 text-sm text-gray-600">
            Join Grey Sky for $100/year. Includes 1,000 Sky Coins on each renewal,
            access to credentialing tools, and member-only resources.
          </p>
          <button
            type="button"
            onClick={handleCheckout}
            disabled={isPending}
            className={`${buttonClass} mt-4`}
          >
            {isPending ? 'Redirecting…' : 'Join Grey Sky — $100/year'}
          </button>
        </>
      )}

      {error && (
        <p role="alert" className="mt-3 text-sm text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}
