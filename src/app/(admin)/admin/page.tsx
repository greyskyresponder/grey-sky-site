// TODO: test — renders overview tiles with live counts
// TODO: test — renders recent audit entries
// TODO: test — handles query failure (returns zeros, does not crash)
import Link from 'next/link';
import {
  Users,
  UserPlus,
  Wallet,
  ShieldCheck,
  ClipboardList,
  ScrollText,
} from 'lucide-react';
import { getAdminOverview } from '@/lib/queries/admin';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import AdminStatCard from '@/components/admin/AdminStatCard';
import AuditLogList from '@/components/admin/AuditLogList';

export const dynamic = 'force-dynamic';

function formatUsd(cents: number): string {
  return (cents / 100).toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  });
}

export default async function AdminHome() {
  const overview = await getAdminOverview();

  const pendingTotal = overview.pendingValidations + overview.pendingEvaluations;

  return (
    <div>
      <AdminPageHeader
        title="Platform Overview"
        description="Operational snapshot of membership, verification activity, and recent admin actions."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <AdminStatCard
          title="Active members"
          value={overview.activeMembers.toLocaleString()}
          subtitle={`${overview.totalMembers.toLocaleString()} total accounts`}
          href="/admin/users?membership_status=active"
          icon={Users}
          tone="success"
        />
        <AdminStatCard
          title="New signups (7d)"
          value={overview.newSignups7d.toLocaleString()}
          subtitle={`${overview.newSignups30d.toLocaleString()} in last 30 days`}
          href="/admin/users"
          icon={UserPlus}
        />
        <AdminStatCard
          title="Monthly recurring revenue"
          value={formatUsd(overview.mrrCents)}
          subtitle={`${overview.activeSubscriptions.toLocaleString()} active subscriptions`}
          href="/admin/memberships"
          icon={Wallet}
        />
        <AdminStatCard
          title="Pending verifications"
          value={pendingTotal.toLocaleString()}
          subtitle={`${overview.pendingValidations} validations · ${overview.pendingEvaluations} evaluations`}
          href="/admin/validations?status=pending"
          icon={ShieldCheck}
          tone={pendingTotal > 0 ? 'alert' : 'default'}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
        <Link
          href="/admin/users"
          className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow flex items-start gap-3"
        >
          <div className="w-9 h-9 rounded bg-[#0A1628] text-white flex items-center justify-center flex-shrink-0">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <p className="text-sm font-semibold text-[#0A1628]">Users</p>
            <p className="text-xs text-gray-500 mt-0.5">
              Search, filter, and manage member accounts.
            </p>
          </div>
        </Link>
        <Link
          href="/admin/validations?status=pending"
          className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow flex items-start gap-3"
        >
          <div className="w-9 h-9 rounded bg-[#0A1628] text-white flex items-center justify-center flex-shrink-0">
            <ClipboardList className="w-4 h-4" />
          </div>
          <div>
            <p className="text-sm font-semibold text-[#0A1628]">Validation queue</p>
            <p className="text-xs text-gray-500 mt-0.5">
              Review pending peer validations awaiting response.
            </p>
          </div>
        </Link>
        <Link
          href="/admin/audit"
          className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow flex items-start gap-3"
        >
          <div className="w-9 h-9 rounded bg-[#0A1628] text-white flex items-center justify-center flex-shrink-0">
            <ScrollText className="w-4 h-4" />
          </div>
          <div>
            <p className="text-sm font-semibold text-[#0A1628]">Audit log</p>
            <p className="text-xs text-gray-500 mt-0.5">
              Every admin action, chain-hashed and searchable.
            </p>
          </div>
        </Link>
      </div>

      <section className="bg-white rounded-lg border border-gray-200">
        <header className="px-4 sm:px-6 py-3 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-[#0A1628]">Recent activity</h2>
          <Link
            href="/admin/audit"
            className="text-xs text-[#C5933A] hover:text-[#0A1628] transition-colors"
          >
            View full log →
          </Link>
        </header>
        <AuditLogList entries={overview.recentAudit} compact />
      </section>
    </div>
  );
}
