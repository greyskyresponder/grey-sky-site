// TODO: test — default filter (all) paginates and shows mixed statuses
// TODO: test — status=pending narrows rows correctly
// TODO: test — empty filter state shows friendly message
import Link from 'next/link';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import StatusPill from '@/components/admin/StatusPill';
import FilterTabs from '@/components/admin/FilterTabs';
import Pagination from '@/components/admin/Pagination';
import { listValidations, type ValidationStatus } from '@/lib/queries/admin';

export const dynamic = 'force-dynamic';

const PER_PAGE = 25;

const TAB_VALUES = new Set(['all', 'pending', 'confirmed', 'denied', 'expired']);

function parseStatus(v: string | undefined): ValidationStatus | 'all' {
  if (v && TAB_VALUES.has(v)) return v as ValidationStatus | 'all';
  return 'all';
}

function parsePage(v: string | undefined): number {
  const n = Number(v ?? 1);
  if (!Number.isFinite(n) || n < 1) return 1;
  return Math.min(1000, Math.floor(n));
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function statusTone(s: ValidationStatus): 'warn' | 'success' | 'alert' | 'neutral' {
  switch (s) {
    case 'pending':
      return 'warn';
    case 'confirmed':
      return 'success';
    case 'denied':
      return 'alert';
    case 'expired':
      return 'neutral';
  }
}

export default async function AdminValidationsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const toStr = (v: string | string[] | undefined) =>
    Array.isArray(v) ? v[0] : v;

  const status = parseStatus(toStr(sp.status));
  const page = parsePage(toStr(sp.page));

  const { rows, total } = await listValidations({
    status,
    page,
    perPage: PER_PAGE,
  });

  return (
    <div>
      <AdminPageHeader
        title="Validation queue"
        description="Peer validation requests issued against deployment records. Pending requests await validator response."
      />

      <div className="mb-4">
        <FilterTabs
          basePath="/admin/validations"
          paramName="status"
          active={status}
          tabs={[
            { label: 'All', value: 'all' },
            { label: 'Pending', value: 'pending' },
            { label: 'Confirmed', value: 'confirmed' },
            { label: 'Denied', value: 'denied' },
            { label: 'Expired', value: 'expired' },
          ]}
        />
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {rows.length === 0 ? (
          <div className="px-6 py-16 text-center text-sm text-gray-500">
            No validation requests match this filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100 text-xs uppercase tracking-wide text-gray-500">
                <tr>
                  <th scope="col" className="text-left px-4 py-2 font-medium">
                    Status
                  </th>
                  <th scope="col" className="text-left px-4 py-2 font-medium">
                    Requestor
                  </th>
                  <th scope="col" className="text-left px-4 py-2 font-medium">
                    Validator
                  </th>
                  <th scope="col" className="text-left px-4 py-2 font-medium">
                    Created
                  </th>
                  <th scope="col" className="text-left px-4 py-2 font-medium">
                    Expires
                  </th>
                  <th scope="col" className="text-right px-4 py-2 font-medium">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {rows.map((row) => (
                  <tr key={row.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <StatusPill label={row.status} tone={statusTone(row.status)} />
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/users/${row.requestor_id}`}
                        className="text-[#0A1628] font-medium hover:text-[#C5933A]"
                      >
                        {row.requestor_name || row.requestor_email || 'Unknown'}
                      </Link>
                      {row.requestor_email && (
                        <p className="text-xs text-gray-500 truncate">
                          {row.requestor_email}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-gray-800">
                        {row.validator_name || '—'}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {row.validator_email}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-gray-700 tabular-nums">
                      {formatDate(row.created_at)}
                    </td>
                    <td className="px-4 py-3 text-gray-500 tabular-nums">
                      {formatDate(row.expires_at)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/admin/validations/${row.id}`}
                        className="text-xs text-[#C5933A] hover:text-[#0A1628] transition-colors"
                      >
                        Review →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <Pagination
          basePath="/admin/validations"
          params={{ status: status === 'all' ? undefined : status }}
          page={page}
          total={total}
          perPage={PER_PAGE}
        />
      </div>
    </div>
  );
}
