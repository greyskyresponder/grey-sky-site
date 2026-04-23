// TODO: test — unauthenticated access redirects to /login?redirect=/dashboard
// TODO: test — authenticated access renders DashboardLayoutClient with correct user props
import { redirect } from 'next/navigation';
import { getUserOrPartial } from '@/lib/auth/getUser';
import { getBalance } from '@/lib/coins/actions';
import DashboardLayoutClient from './DashboardLayoutClient';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getUserOrPartial();

  // Not authenticated at all — redirect to login
  if (!session) {
    redirect('/login?redirect=/dashboard');
  }

  // Authenticated but profile row missing (trigger not applied, RLS issue, etc.)
  // Show a fallback instead of redirecting to /login (which would cause a redirect loop)
  if (!session.profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--gs-cloud,#F4F5F7)]">
        <div className="max-w-md w-full p-8 bg-white rounded-lg shadow-sm text-center">
          <h1 className="text-xl font-semibold text-[var(--gs-navy,#0A1628)] mb-4">
            Account Setup In Progress
          </h1>
          <p className="text-[var(--gs-steel,#6B7280)] mb-6">
            Your account was created but your profile is still being set up.
            Please try refreshing in a moment. If this persists, contact support.
          </p>
          <a
            href="/dashboard"
            className="inline-block px-6 py-2.5 bg-[var(--gs-navy,#0A1628)] text-white font-semibold rounded transition-colors hover:bg-[var(--gs-gold,#C5933A)] hover:text-[var(--gs-navy,#0A1628)]"
          >
            Retry
          </a>
        </div>
      </div>
    );
  }

  const { profile } = session;

  const displayName =
    [profile.first_name, profile.last_name].filter(Boolean).join(' ') ||
    session.user.email?.split('@')[0] ||
    'Responder';

  const sidebarUser = {
    displayName,
    avatarUrl: profile.avatar_url,
    membershipStatus: profile.membership_status,
    membershipExpiresAt: profile.membership_expires_at,
    email: session.user.email || '',
  };

  let coinBalance = 0;
  let coinsFrozen = false;
  try {
    const balance = await getBalance(session.user.id);
    coinBalance = balance.balance;
    coinsFrozen = balance.frozen;
  } catch (err) {
    console.warn('[dashboard] coin balance unavailable, defaulting to 0:', err);
  }

  return (
    <DashboardLayoutClient
      sidebarUser={sidebarUser}
      coinBalance={coinBalance}
      coinsFrozen={coinsFrozen}
    >
      {children}
    </DashboardLayoutClient>
  );
}
