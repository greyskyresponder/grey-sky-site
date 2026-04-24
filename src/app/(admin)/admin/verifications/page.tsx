import Link from 'next/link';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import StatusPill from '@/components/admin/StatusPill';
import FilterTabs from '@/components/admin/FilterTabs';
import Pagination from '@/components/admin/Pagination';
import { getVerificationQueue } from '@/lib/actions/requirements';
import { fulfillmentStatuses } from '@/lib/validators/requirements';
import type { FulfillmentStatus } from '@/lib/types/requirements';

export const dynamic = 'force-dynamic';

const PER_PAGE = 25;
const TAB_SET = new Set<FulfillmentStatus>(fulfillmentStatuses);

function parseStatus(v: string | undefined): FulfillmentStatus {
  if (v && TAB_SET.has(v as FulfillmentStatus)) return v as FulfillmentStatus;
  return 'pending';
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

function statusTone(s: FulfillmentStatus): 'warn' | 'success' | 'alert' | 'neutral' {
  switch (s) {
    case 'pending':
      return 'warn';
    case 'verified':
      return 'success';
    case 'rejected':
      return 'alert';
    case 'expired':
    case 'unfulfilled':
    default:
      return 'neutral';
  }
}

export default async function AdminVerificationsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const toStr = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

  const status = parseStatus(toStr(sp.status));
  const page = parsePage(toStr(sp.page));

  const { data: rows, total, error } = await getVerificationQueue({
    status,
    page,
    per_page: PER_PAGE,
  });

  return (
    <div>
      <AdminPageHeader
        title="Verification queue"
        description="Uploaded documents awaiting staff verification against specific RTLT requirement slots."
      />

      {error && (
        <div className="mb-4 px-4 py-3 rounded bg-red-50 text-red-800 text-sm">{error}</div>
      )}

      <div className="mb-4">
        <FilterTabs
          basePath="/admin/verifications"
          paramName="status"
          active={status}
          tabs={[
            { label: 'Pending', value: 'pending' },
            { label: 'Verified', value: 'verified' },
            { label: 'Rejected', value: 'rejected' },
            { label: 'Expired', value: 'expired' },
          ]}
        />
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {rows.length === 0 ? (
          <div className="px-6 py-16 text-center text-sm text-gray-500">
            No fulfillments match this filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100 text-xs uppercase tracking-wide text-gray-500">
                <tr>
                  <th scope="col" className="text-left px-4 py-2 font-medium">Status</th>
                  <th scope="col" className="text-left px-4 py-2 font-medium">Responder</th>
                  <th scope="col" className="text-left px-4 py-2 font-medium">Requirement</th>
                  <th scope="col" className="text-left px-4 py-2 font-medium">Position</th>
                  <th scope="col" className="text-left px-4 py-2 font-medium">Document</th>
                  <th scope="col" className="text-left px-4 py-2 font-medium">Submitted</th>
                  <th scope="col" className="text-right px-4 py-2 font-medium">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {rows.map((row) => (
                  <tr key={row.fulfillment.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <StatusPill
                        label={row.fulfillment.status}
                        tone={statusTone(row.fulfillment.status)}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-[#0A1628] font-medium">
                        {row.user.first_name} {row.user.last_name}
                      </p>
                      <p className="text-xs text-gray-500 truncate">{row.user.email}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-gray-800">
                        {row.requirement.code && (
                          <span className="text-xs font-mono text-[#C5933A] mr-1">
                            {row.requirement.code}
                          </span>
                        )}
                        {row.requirement.title}
                      </p>
                      <p className="text-xs text-gray-500 capitalize">
                        {row.requirement.requirement_type}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-gray-800">{row.position.title}</p>
                      {row.position.rtlt_code && (
                        <p className="text-xs text-gray-400">RTLT {row.position.rtlt_code}</p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-600 truncate max-w-[200px]">
                      {row.document_name ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-gray-700 tabular-nums">
                      {formatDate(row.fulfillment.created_at)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/admin/verifications/${row.fulfillment.id}`}
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
          basePath="/admin/verifications"
          params={{ status: status === 'pending' ? undefined : status }}
          page={page}
          total={total}
          perPage={PER_PAGE}
        />
      </div>
    </div>
  );
}
