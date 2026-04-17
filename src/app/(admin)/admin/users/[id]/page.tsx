// TODO: test — unknown user id renders not-found state
// TODO: test — platform_admin viewing self gets guardrail on role demotion
// TODO: test — role form + membership form render with current values
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck, KeyRound } from 'lucide-react';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import StatusPill from '@/components/admin/StatusPill';
import AuditLogList from '@/components/admin/AuditLogList';
import UserRoleForm from '@/components/admin/UserRoleForm';
import UserMembershipForm from '@/components/admin/UserMembershipForm';
import { getUserDetail, getUserAuditHistory } from '@/lib/queries/admin';
import { getUser } from '@/lib/auth/getUser';

export const dynamic = 'force-dynamic';

function formatDateTime(iso: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export default async function AdminUserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [detail, audit, session] = await Promise.all([
    getUserDetail(id),
    getUserAuditHistory(id),
    getUser(),
  ]);

  if (!detail) notFound();

  const displayName =
    [detail.first_name, detail.last_name].filter(Boolean).join(' ') || '—';
  const currentUserIsSelf = session?.user.id === detail.id;

  return (
    <div>
      <Link
        href="/admin/users"
        className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-[#0A1628] mb-4"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to users
      </Link>

      <AdminPageHeader
        title={displayName}
        description={detail.email}
        actions={
          <div className="flex items-center gap-2">
            <StatusPill
              label={detail.role.replace('_', ' ')}
              tone={detail.role === 'platform_admin' ? 'info' : 'neutral'}
            />
            <StatusPill
              label={detail.membership_status}
              tone={
                detail.membership_status === 'active'
                  ? 'success'
                  : detail.membership_status === 'expired'
                  ? 'warn'
                  : 'neutral'
              }
            />
            <StatusPill
              label={detail.status}
              tone={detail.status === 'active' ? 'success' : 'alert'}
            />
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <section className="bg-white rounded-lg border border-gray-200 p-4">
            <h2 className="text-sm font-semibold text-[#0A1628] mb-3">Profile</h2>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div>
                <dt className="text-xs text-gray-500">Account id</dt>
                <dd className="text-gray-800 font-mono text-xs break-all">
                  {detail.id}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-gray-500">Joined</dt>
                <dd className="text-gray-800">{formatDateTime(detail.created_at)}</dd>
              </div>
              <div>
                <dt className="text-xs text-gray-500">Phone</dt>
                <dd className="text-gray-800">{detail.phone ?? '—'}</dd>
              </div>
              <div>
                <dt className="text-xs text-gray-500">Location</dt>
                <dd className="text-gray-800">
                  {[detail.location_city, detail.location_state]
                    .filter(Boolean)
                    .join(', ') || '—'}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-gray-500 flex items-center gap-1">
                  <KeyRound className="w-3.5 h-3.5" /> MFA
                </dt>
                <dd className="text-gray-800">
                  {detail.mfa_enabled ? 'Enabled' : 'Not enabled'}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-gray-500 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Stripe status
                </dt>
                <dd className="text-gray-800">
                  {detail.stripe_subscription_status ?? '—'}
                </dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-xs text-gray-500">Stripe customer</dt>
                <dd className="text-gray-800 font-mono text-xs break-all">
                  {detail.stripe_customer_id ?? '—'}
                </dd>
              </div>
              {detail.bio && (
                <div className="sm:col-span-2">
                  <dt className="text-xs text-gray-500">Bio</dt>
                  <dd className="text-gray-800 whitespace-pre-wrap">{detail.bio}</dd>
                </div>
              )}
            </dl>
          </section>

          <section className="bg-white rounded-lg border border-gray-200">
            <div className="px-4 py-3 border-b border-gray-100">
              <h2 className="text-sm font-semibold text-[#0A1628]">
                Audit history for this account
              </h2>
            </div>
            <AuditLogList entries={audit} />
          </section>
        </div>

        <aside className="space-y-4">
          <section className="bg-white rounded-lg border border-gray-200 p-4">
            <h2 className="text-sm font-semibold text-[#0A1628] mb-3">Role</h2>
            <UserRoleForm
              userId={detail.id}
              currentRole={detail.role}
              currentUserIsSelf={currentUserIsSelf}
            />
          </section>

          <section className="bg-white rounded-lg border border-gray-200 p-4">
            <h2 className="text-sm font-semibold text-[#0A1628] mb-3">Membership</h2>
            <UserMembershipForm
              userId={detail.id}
              currentStatus={detail.membership_status}
              currentExpiresAt={detail.membership_expires_at}
            />
          </section>
        </aside>
      </div>
    </div>
  );
}
