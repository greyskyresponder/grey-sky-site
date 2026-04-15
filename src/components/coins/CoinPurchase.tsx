'use client';

import { useState, useTransition } from 'react';
import { PURCHASE_PACKAGES, formatCoinAmount } from '@/lib/coins/products';
import { createCoinPurchaseCheckout } from '@/lib/stripe/actions';

interface CoinPurchaseProps {
  userId: string;
}

export default function CoinPurchase({ userId }: CoinPurchaseProps) {
  const [pendingCode, setPendingCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handlePurchase(code: string) {
    setError(null);
    setPendingCode(code);
    startTransition(async () => {
      const result = await createCoinPurchaseCheckout(userId, code);
      if (result.error || !result.url) {
        setError(result.error ?? 'Could not start checkout. Try again.');
        setPendingCode(null);
        return;
      }
      window.location.href = result.url;
    });
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-[#0A1628]">Add Sky Coins</h2>
        <p className="text-sm text-gray-500 mt-1">
          Invest in your professional development. Sky Coins fund certifications,
          credentialing reviews, and professional products.
        </p>
      </div>

      {error && (
        <div
          role="alert"
          className="mb-4 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800"
        >
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {PURCHASE_PACKAGES.map((pkg) => {
          const loading = isPending && pendingCode === pkg.code;
          const disabled = isPending;
          return (
            <div
              key={pkg.code}
              className="bg-white rounded-lg border border-gray-200 p-5 flex flex-col"
            >
              <div className="flex items-center gap-2 mb-3">
                <span
                  className="w-6 h-6 rounded-full bg-[#C5933A] flex items-center justify-center flex-shrink-0"
                  aria-hidden="true"
                >
                  <span className="text-[9px] font-bold text-[#0A1628]">SC</span>
                </span>
                <span className="text-lg font-bold text-[#0A1628]">
                  {pkg.coins.toLocaleString()}
                </span>
              </div>
              <p className="text-sm text-gray-500 mb-1">{formatCoinAmount(pkg.coins)}</p>
              <p className="text-xl font-semibold text-[#0A1628] mb-4">
                ${pkg.priceUsd.toLocaleString()}
              </p>
              <div className="mt-auto">
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => handlePurchase(pkg.code)}
                  className="w-full px-4 py-2.5 bg-[#0A1628] text-white text-sm font-semibold rounded hover:bg-[#1a2638] disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
                  aria-label={`Add ${formatCoinAmount(pkg.coins)} to your balance for $${pkg.priceUsd}`}
                >
                  {loading ? 'Redirecting…' : 'Add to Balance'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <p className="mt-6 text-xs text-gray-400 text-center">
        Sky Coins are non-refundable and non-transferable. $1 USD = 10 Sky Coins.
      </p>
    </div>
  );
}
