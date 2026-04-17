// TODO: test — empty state, paginated state, search filter applied
// TODO: test — unauthorized user is redirected by middleware before reaching this page
import Link from 'next/link';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import UserFilters from '@/components/admin/UserFilters';
import StatusPill from '@/components/admin/StatusPill';
import Pagination from '@/components/admin/Pagination';
import { listUsers } from '@/lib/queries/admin';

type Role = 'member' | 'org_admin' | 'assessor' | 'platform_admin';
type MembershipStatus = 'active' | 'expired' | 'none';

export const dynamic = 'force-dynamic';

const PER_PAGE = 25;

function parseRole(v: string | undefined): Role | 'all' {
  const allowed: Role[] = ['member', 'org_admin', 'assessor', 'platform_admin'];
  if (v && (allowed as string[]).includes(v)) return v as Role;
  return 'all';
}

function parseMembership(v: string | undefined): MembershipStatus | 'all' {
  const allowed: MembershipStatus[] = ['active', 'expired', 'none'];
  if (v && (allowed as string[]).includes(v)) return v as MembershipStatus;
  return 'all';
}

function parsePage(v: string | undefined): number {
  const n = Number(v ?? 1);
  if (!Number.isFinite(n) || n < 1) return 1;
  return Math.min(1000, Math.floor(n));
}

function roleLabel(role: Role): string {
  switch (role) {
    case 'platform_admin':
      return 'Platform admin';
    case 'org_admin':
      return 'Org admin';
    case 'assessor':
      return 'Assessor';
    default:
      return 'Member';
  }
}

function membershipTone(status: MembershipStatus): 'success' | 'warn' | 'neutral' {
  if (status === 'active') return 'success';
  if (status === 'expired') return 'warn';
  return 'neutral';
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const toStr = (v: string | string[] | undefined): string | undefined =>
    Array.isArray(v) ? v[0] : v;

  const q = toStr(sp.q);
  const role = parseRole(toStr(sp.role));
  const membershipStatus = parseMembership(toStr(sp.membership_status));
  const page = parsePage(toStr(sp.page));

  const { rows, total } = await listUsers({
    search: q,
    role,
    membershipStatus,
    page,
    perPage: PER_PAGE,
  });

  return (
    <div>
      <AdminPageHeader
        title="Users"
        description="All platform accounts. Use filters to narrow by role or membership status."
      />

      <UserFilters />

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {rows.length === 0 ? (
          <div className="px-6 py-16 text-center text-sm text-gray-500">
            No users match the current filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100 text-xs uppercase tracking-wide text-gray-500">
                <tr>
                  <th scope="col" className="text-left px-4 py-2 font-medium">
                    Name
                  </th>
                  <th scope="col" className="text-left px-4 py-2 font-medium">
                    Email
                  </th>
                  <th scope="col" className="text-left px-4 py-2 font-medium">
                    Role
                  </th>
                  <th scope="col" className="text-left px-4 py-2 font-medium">
                    Membership
                  </th>
                  <th scope="col" className="text-left px-4 py-2 font-medium">
                    Joined
                  </th>
                  <th scope="col" className="text-right px-4 py-2 font-medium">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {rows.map((row) => {
                  const name =
                    [row.first_name, row.last_name].filter(Boolean).join(' ') ||
                    '—';
                  return (
                    <tr key={row.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-[#0A1628] font-medium">
                        <Link
                          href={`/admin/users/${row.id}`}
                          className="hover:text-[#C5933A]"
                        >
                          {name}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-gray-700 truncate max-w-xs">
                        {row.email}
                      </td>
                      <td className="px-4 py-3">
                        <StatusPill
                          label={roleLabel(row.role)}
                          tone={row.role === 'platform_admin' ? 'info' : 'neutral'}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <StatusPill
                          label={row.membership_status}
                          tone={membershipTone(row.membership_status)}
                        />
                      </td>
                      <td className="px-4 py-3 text-gray-500 tabular-nums">
                        {formatDate(row.created_at)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          href={`/admin/users/${row.id}`}
                          className="text-xs text-[#C5933A] hover:text-[#0A1628] transition-colors"
                        >
                          View →
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <Pagination
          basePath="/admin/users"
          params={{
            q,
            role: role === 'all' ? undefined : role,
            membership_status:
              membershipStatus === 'all' ? undefined : membershipStatus,
          }}
          page={page}
          total={total}
          perPage={PER_PAGE}
        />
      </div>
    </div>
  );
}
