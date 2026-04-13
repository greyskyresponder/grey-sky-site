import Link from 'next/link';
import type { CoinBalance as CoinBalanceType } from '@/lib/types/economy';
import { formatCoinAmount, coinsToUsd } from '@/lib/coins/products';

type CoinBalanceProps = {
  balance: CoinBalanceType;
};

export default function CoinBalance({ balance }: CoinBalanceProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      {balance.frozen && (
        <div className="mb-4 px-4 py-3 bg-amber-50 border border-amber-200 rounded-md text-sm text-amber-800">
          Your Sky Coins are on hold while your membership is inactive.{' '}
          <Link href="/dashboard/membership" className="font-medium underline hover:text-amber-900">
            Renew your membership
          </Link>{' '}
          to resume using your balance.
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-end gap-6">
        {/* Main balance */}
        <div className="flex-1">
          <p className="text-sm text-gray-500 mb-1">Your Sky Coins</p>
          <div className="flex items-baseline gap-2">
            <span
              className="w-8 h-8 rounded-full bg-[#C5933A] flex items-center justify-center flex-shrink-0"
              aria-hidden="true"
            >
              <span className="text-xs font-bold text-[#0A1628]">SC</span>
            </span>
            <span className="text-3xl font-bold text-[#0A1628]">
              {balance.balance.toLocaleString()}
            </span>
            <span className="text-sm text-gray-400">
              ({coinsToUsd(balance.balance)})
            </span>
          </div>
        </div>

        {/* Add coins CTA */}
        <Link
          href="/dashboard/coins/purchase"
          className="inline-flex items-center justify-center px-5 py-2.5 bg-[#C5933A] hover:bg-[#b0832f] text-white text-sm font-semibold rounded transition-colors"
        >
          Add Coins
        </Link>
      </div>

      {/* Lifetime stats */}
      <div className="mt-6 pt-4 border-t border-gray-100 grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs text-gray-400 mb-0.5">Lifetime Earned</p>
          <p className="text-sm font-semibold text-green-600">
            +{formatCoinAmount(balance.lifetimeEarned)}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-400 mb-0.5">Lifetime Spent</p>
          <p className="text-sm font-semibold text-gray-600">
            {formatCoinAmount(balance.lifetimeSpent)}
          </p>
        </div>
      </div>
    </div>
  );
}
