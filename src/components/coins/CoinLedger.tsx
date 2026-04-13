'use client';

import { useState } from 'react';
import type { CoinLedgerEntry, CoinTransactionType } from '@/lib/types/economy';

type CoinLedgerProps = {
  transactions: CoinLedgerEntry[];
  total: number;
  page: number;
  limit: number;
};

const TYPE_LABELS: Record<CoinTransactionType, string> = {
  membership_grant: 'Membership',
  purchase: 'Purchase',
  spend: 'Spend',
  earn_validation: 'Earned (Validation)',
  earn_evaluation: 'Earned (Evaluation)',
  earn_qrb_review: 'Earned (QRB Review)',
  refund: 'Refund',
  admin_adjustment: 'Admin Adjustment',
  pending_transfer: 'Pending Transfer',
  freeze: 'Freeze',
  unfreeze: 'Unfreeze',
};

const FILTER_OPTIONS: { label: string; value: CoinTransactionType | '' }[] = [
  { label: 'All Transactions', value: '' },
  { label: 'Membership', value: 'membership_grant' },
  { label: 'Purchases', value: 'purchase' },
  { label: 'Spends', value: 'spend' },
  { label: 'Earned (Validation)', value: 'earn_validation' },
  { label: 'Earned (Evaluation)', value: 'earn_evaluation' },
  { label: 'Earned (QRB)', value: 'earn_qrb_review' },
  { label: 'Refunds', value: 'refund' },
];

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function CoinLedger({ transactions, total, page, limit }: CoinLedgerProps) {
  const [filter, setFilter] = useState<string>('');
  const totalPages = Math.ceil(total / limit);

  const filtered = filter
    ? transactions.filter((t) => t.type === filter)
    : transactions;

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h2 className="text-lg font-semibold text-[#0A1628]">Transaction History</h2>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="text-sm border border-gray-200 rounded px-3 py-1.5 text-gray-700 bg-white"
          aria-label="Filter transactions by type"
        >
          {FILTER_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="px-6 py-12 text-center text-sm text-gray-400">
          No transactions yet. Your Sky Coins activity will appear here.
        </div>
      ) : (
        <div className="divide-y divide-gray-50">
          {filtered.map((tx) => (
            <div key={tx.id} className="px-6 py-3 flex items-center gap-4">
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900 truncate">{tx.description}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {formatDate(tx.createdAt)} &middot; {TYPE_LABELS[tx.type] ?? tx.type}
                </p>
              </div>
              <div className="text-right flex-shrink-0">
                <p
                  className={`text-sm font-semibold ${
                    tx.amount > 0 ? 'text-green-600' : 'text-red-500'
                  }`}
                >
                  {tx.amount > 0 ? '+' : ''}
                  {tx.amount.toLocaleString()}
                </p>
                <p className="text-[10px] text-gray-400">
                  bal: {tx.balanceAfter.toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination info */}
      {totalPages > 1 && (
        <div className="px-6 py-3 border-t border-gray-100 text-xs text-gray-400 text-center">
          Page {page} of {totalPages} &middot; {total} transactions
        </div>
      )}
    </div>
  );
}
