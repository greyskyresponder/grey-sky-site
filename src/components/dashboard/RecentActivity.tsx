import { FileText, Coins, ArrowUpRight, ArrowDownRight } from 'lucide-react';

type LedgerEntry = {
  id: string;
  transaction_type: string;
  amount: number;
  description: string | null;
  created_at: string;
};

type DeploymentRecord = {
  id: string;
  verification_tier: string;
  created_at: string;
  start_date?: string;
  positions?: { title: string }[] | { title: string } | null;
};

type RecentActivityProps = {
  recentLedger: LedgerEntry[];
  recentRecords: DeploymentRecord[];
};

type ActivityItem = {
  id: string;
  type: 'ledger' | 'record';
  description: string;
  timestamp: string;
  positive?: boolean;
};

function relativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

function tierLabel(tier: string): string {
  switch (tier) {
    case 'self_certified':
      return 'Self-Certified';
    case 'validated_360':
      return 'Validated';
    case 'evaluated_ics225':
      return 'Evaluated';
    default:
      return tier;
  }
}

export default function RecentActivity({
  recentLedger,
  recentRecords,
}: RecentActivityProps) {
  const items: ActivityItem[] = [];

  for (const entry of recentLedger) {
    items.push({
      id: `ledger-${entry.id}`,
      type: 'ledger',
      description:
        entry.description ||
        `${entry.amount > 0 ? '+' : ''}${entry.amount} Sky Points`,
      timestamp: entry.created_at,
      positive: entry.amount > 0,
    });
  }

  for (const record of recentRecords) {
    const pos = record.positions;
    const posTitle = Array.isArray(pos)
      ? pos[0]?.title || 'Response Report'
      : pos?.title || 'Response Report';
    items.push({
      id: `record-${record.id}`,
      type: 'record',
      description: `${posTitle} — ${tierLabel(record.verification_tier)}`,
      timestamp: record.created_at,
    });
  }

  // Sort by timestamp descending, take first 5
  items.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
  const display = items.slice(0, 5);

  if (display.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-[#0A1628] mb-4">
          Recent Activity
        </h2>
        <p className="text-sm text-gray-500">
          No activity yet. Your service matters — start by filing your first
          Response Report.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
      <h2 className="text-lg font-semibold text-[#0A1628] mb-4">
        Recent Activity
      </h2>
      <ul className="space-y-3" role="list">
        {display.map((item) => (
          <li key={item.id} className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
              {item.type === 'ledger' ? (
                item.positive ? (
                  <ArrowDownRight className="w-4 h-4 text-green-600" />
                ) : (
                  <ArrowUpRight className="w-4 h-4 text-gray-500" />
                )
              ) : (
                <FileText className="w-4 h-4 text-[#C5933A]" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-900 truncate">
                {item.description}
              </p>
              <p className="text-xs text-gray-400">
                {relativeTime(item.timestamp)}
              </p>
            </div>
            {item.type === 'ledger' && (
              <Coins className="w-4 h-4 text-gray-300 flex-shrink-0" />
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
