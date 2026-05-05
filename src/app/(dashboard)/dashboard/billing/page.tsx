// GSR-DOC-208: Billing dashboard \u2014 membership status, grace period banner,
// invoice history, and a button to open the Stripe Billing Portal.
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getUser } from '@/lib/auth/getUser';
import { listInvoicesForUser } from '@/lib/stripe/invoices';
import { getMembershipInfo } from '@/lib/stripe/membership';
import PortalButton from '@/components/billing/PortalButton';
import InvoiceList from '@/components/billing/InvoiceList';

export const dynamic = 'force-dynamic';

function formatDate(iso: string | null): string {
  if (!iso) return '\u2014';
  try {
    return new Date(iso).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return '\u2014';
  }
}

export default async function BillingPage() {
  const session = await getUser();
  if (!session) redirect('/login');

  const { profile } = session;

  // Membership summary block
  const membership = getMembershipInfo({
    membership_status: profile.membership_status,
    stripe_subscription_status: profile.stripe_subscription_status,
    membership_started_at: profile.membership_started_at,
    membership_expires_at: profile.membership_expires_at,
  });

  // Grace period banner state
  const inGrace =
    Boolean(profile.grace_period_ends_at) &&
    new Date(profile.grace_period_ends_at as string) > new Date();
  const spendingBlocked = profile.spending_blocked === true;

  // Invoice history (best-effort \u2014 don't fail the page if Stripe table query errors)
  let invoices: Awaited<ReturnType<typeof listInvoicesForUser>> = [];
  let invoicesError: string | null = null;
  try {
    invoices = await listInvoicesForUser(profile.id, 24);
  } catch (err) {
    invoicesError = err instanceof Error ? err.message : 'Could not load invoices.';
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-[var(--gs-navy)]">Billing &amp; Payments</h1>
        {profile.stripe_customer_id ? <PortalButton /> : null}
      </div>

      {/* Grace period banner */}
      {inGrace ? (
        <div className="rounded-md border-l-4 border-amber-500 bg-amber-50 p-4">
          <p className="font-medium text-amber-900">
            We had trouble processing your latest payment.
          </p>
          <p className="mt-1 text-sm text-amber-800">
            Your verification access stays active through{' '}
            <strong>{formatDate(profile.grace_period_ends_at)}</strong>. Update
            your payment method in the Billing Portal to avoid interruption.
            {spendingBlocked ? ' Sky Coin purchases are paused until payment is resolved.' : ''}
          </p>
        </div>
      ) : null}

      {/* Spending blocked but no active grace \u2014 typically post-cancellation */}
      {!inGrace && spendingBlocked ? (
        <div className="rounded-md border-l-4 border-red-500 bg-red-50 p-4">
          <p className="font-medium text-red-900">Sky Coin spending is paused.</p>
          <p className="mt-1 text-sm text-red-800">
            Your membership is no longer active. Renew to restore full access.
          </p>
        </div>
      ) : null}

      {/* Membership summary */}
      <section className="rounded-md border border-gray-200 bg-white p-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-600">
          Membership
        </h2>
        <dl className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <dt className="text-xs text-gray-500">Status</dt>
            <dd className="text-sm text-gray-900">
              {membership.isActive ? 'Active' : membership.status === 'expired' ? 'Expired' : 'None'}
              {membership.stripeStatus ? ` (${membership.stripeStatus})` : ''}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-gray-500">Renews / Expires</dt>
            <dd className="text-sm text-gray-900">{formatDate(membership.expiresAt)}</dd>
          </div>
          <div>
            <dt className="text-xs text-gray-500">Member Since</dt>
            <dd className="text-sm text-gray-900">{formatDate(membership.startedAt)}</dd>
          </div>
          <div>
            <dt className="text-xs text-gray-500">Verified Active</dt>
            <dd className="text-sm text-gray-900">
              {profile.verified_active ? 'Yes' : 'No'}
              {profile.verified_active_until
                ? ` \u00b7 through ${formatDate(profile.verified_active_until)}`
                : ''}
            </dd>
          </div>
        </dl>
        {!membership.isActive ? (
          <div className="mt-4">
            <Link
              href="/dashboard/membership"
              className="inline-flex items-center rounded-md bg-[var(--gs-navy)] px-4 py-2 text-sm font-medium text-white hover:opacity-90"
            >
              {membership.status === 'expired' ? 'Renew Membership' : 'Start Membership'}
            </Link>
          </div>
        ) : null}
      </section>

      {/* Invoices */}
      <section className="rounded-md border border-gray-200 bg-white p-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-600">
          Invoice History
        </h2>
        <div className="mt-3">
          {invoicesError ? (
            <p className="text-sm text-red-700">{invoicesError}</p>
          ) : (
            <InvoiceList invoices={invoices} />
          )}
        </div>
      </section>
    </div>
  );
}
