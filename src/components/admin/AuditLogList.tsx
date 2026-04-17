import type { AuditLogEntry } from '@/lib/types/audit';

type AuditLogListProps = {
  entries: AuditLogEntry[];
  compact?: boolean;
};

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function actionLabel(action: string): string {
  return action
    .replace(/^admin\./, '')
    .replace(/_/g, ' ')
    .replace(/\./g, ' · ');
}

export default function AuditLogList({ entries, compact }: AuditLogListProps) {
  if (entries.length === 0) {
    return (
      <div className="px-6 py-10 text-center text-sm text-gray-400">
        No audit activity yet.
      </div>
    );
  }

  return (
    <ul className="divide-y divide-gray-100" aria-label="Audit log entries">
      {entries.map((entry) => (
        <li key={entry.id} className="px-4 py-3 sm:px-6">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-[#0A1628] truncate">
                {actionLabel(entry.action)}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                {entry.entity_type}
                {entry.entity_id ? ` · ${entry.entity_id.slice(0, 8)}…` : ''}
                {entry.actor_type === 'admin' ? ' · admin' : ''}
                {entry.actor_type === 'system' ? ' · system' : ''}
              </p>
              {!compact && entry.details_json && (
                <pre className="mt-2 p-2 rounded bg-gray-50 border border-gray-100 text-[11px] text-gray-600 overflow-x-auto whitespace-pre-wrap break-words">
                  {JSON.stringify(entry.details_json, null, 2)}
                </pre>
              )}
            </div>
            <time
              dateTime={entry.created_at}
              className="text-xs text-gray-400 flex-shrink-0 tabular-nums"
            >
              {formatDateTime(entry.created_at)}
            </time>
          </div>
        </li>
      ))}
    </ul>
  );
}
