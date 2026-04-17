// TODO: test — renders active/expired/none counts correctly
// TODO: test — recent changes list links to each user's detail page
// TODO: test — Stripe dashboard link renders even when customer id is missing
import Link from 'next/link';
import {
  CheckCircle2,
  XCircle,
  CreditCard,
  AlertTriangle,
  Users,
  ExternalLink,
} from 'lucide-react';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import AdminStatCard from '@/components/admin/AdminStatCard';
import StatusPill from '@/components/admin/StatusPill';
import { getMembershipOverview } from '@/lib/queries/admin';

export const dynamic = 'force-dynamic';

function formatDate(iso: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function stripeTone(
  status: string | null,
): 'success' | 'warn' | 'alert' | 'neutral' {
  switch (status) {
    case 'active':
      return 'success';
    case 'past_due':
      return 'warn';
    case 'canceled':
    case 'unpaid':
      return 'alert';
    default:
      return 'neutral';
  }
}

export default async function AdminMembershipsPage() {
  const overview = await getMembershipOverview();

  return (
    <div>
      <AdminPageHeader
        title="Memberships"
        description="Membership state across the platform, with recent changes and Stripe linkage."
        actions={
          <a
            href="https://dashboard.stripe.com/subscriptions"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 px-3 py-2 bg-[#0A1628] text-white text-sm font-semibold rounded hover:bg-[#C5933A] hover:text-[#0A1628] transition-colors"
          >
            Stripe subscriptions
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <AdminStatCard
          title="Active memberships"
          value={overview.active.toLocaleString()}
          subtitle={`${overview.activeSubscriptions.toLocaleString()} with active Stripe subscription`}
          href="/admin/users?membership_status=active"
          icon={CheckCircle2}
          tone="success"
        />
        <AdminStatCard
          title="Expired memberships"
          value={overview.expired.toLocaleString()}
          subtitle="May need renewal outreach"
          href="/admin/users?membership_status=expired"
          icon={XCircle}
          tone="alert"
        />
        <AdminStatCard
          title="No membership"
          value={overview.none.toLocaleString()}
          subtitle="Registered accounts without a paid membership"
          href="/admin/users?membership_status=none"
          icon={Users}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <AdminStatCard
          title="Stripe active"
          value={overview.activeSubscriptions.toLocaleString()}
          icon={CreditCard}
          tone="success"
        />
        <AdminStatCard
          title="Stripe past due"
          value={overview.pastDue.toLocaleString()}
          icon={AlertTriangle}
          tone="alert"
        />
        <AdminStatCard
          title="Stripe canceled"
          value={overview.canceled.toLocaleString()}
          icon={XCircle}
        />
      </div>

      <section className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <header className="px-4 sm:px-6 py-3 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-[#0A1628]">
            Recent membership changes
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Most recently updated accounts that have a membership start date on
            file.
          </p>
        </header>
        {overview.recentChanges.length === 0 ? (
          <div className="px-6 py-12 text-center text-sm text-gray-500">
            No recent membership activity.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100 text-xs uppercase tracking-wide text-gray-500">
                <tr>
                  <th scope="col" className="text-left px-4 py-2 font-medium">
                    Member
                  </th>
                  <th scope="col" className="text-left px-4 py-2 font-medium">
                    Status
                  </th>
                  <th scope="col" className="text-left px-4 py-2 font-medium">
                    Stripe
                  </th>
                  <th scope="col" className="text-left px-4 py-2 font-medium">
                    Started
                  </th>
                  <th scope="col" className="text-left px-4 py-2 font-medium">
                    Expires
                  </th>
                  <th scope="col" className="text-left px-4 py-2 font-medium">
                    Updated
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {overview.recentChanges.map((row) => {
                  const name =
                    [row.first_name, row.last_name].filter(Boolean).join(' ') ||
                    row.email;
                  return (
                    <tr key={row.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <Link
                          href={`/admin/users/${row.id}`}
                          className="text-[#0A1628] font-medium hover:text-[#C5933A]"
                        >
                          {name}
                        </Link>
                        <p className="text-xs text-gray-500 truncate">{row.email}</p>
                      </td>
                      <td className="px-4 py-3">
                        <StatusPill
                          label={row.membership_status}
                          tone={
                            row.membership_status === 'active'
                              ? 'success'
                              : row.membership_status === 'expired'
                              ? 'warn'
                              : 'neutral'
                          }
                        />
                      </td>
                      <td className="px-4 py-3">
                        {row.stripe_subscription_status ? (
                          <StatusPill
                            label={row.stripe_subscription_status}
                            tone={stripeTone(row.stripe_subscription_status)}
                          />
                        ) : (
                          <span className="text-xs text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-700 tabular-nums">
                        {formatDate(row.membership_started_at)}
                      </td>
                      <td className="px-4 py-3 text-gray-700 tabular-nums">
                        {formatDate(row.membership_expires_at)}
                      </td>
                      <td className="px-4 py-3 text-gray-500 tabular-nums">
                        {formatDate(row.updated_at)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
