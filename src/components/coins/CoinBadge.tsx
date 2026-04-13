'use client';

import Link from 'next/link';

type CoinBadgeProps = {
  balance: number;
  frozen?: boolean;
};

export default function CoinBadge({ balance, frozen }: CoinBadgeProps) {
  return (
    <Link
      href="/dashboard/coins"
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/15 transition-colors"
      aria-label={`${balance.toLocaleString()} Sky Coins${frozen ? ' (frozen)' : ''}`}
    >
      {/* Sky Coin icon */}
      <span
        className="w-4 h-4 rounded-full bg-[#C5933A] flex items-center justify-center flex-shrink-0"
        aria-hidden="true"
      >
        <span className="text-[8px] font-bold text-[#0A1628] leading-none">SC</span>
      </span>
      <span className={`text-xs font-semibold ${frozen ? 'text-gray-400' : 'text-[#C5933A]'}`}>
        {balance.toLocaleString()}
      </span>
      {frozen && (
        <span className="text-[10px] text-gray-400" aria-label="Coins frozen">
          &#x2744;
        </span>
      )}
    </Link>
  );
}
