// TODO: test — unauthenticated access redirects to /login?redirect=/dashboard
// TODO: test — authenticated access renders DashboardLayoutClient with correct user props
import { redirect } from 'next/navigation';
import { getUser } from '@/lib/auth/getUser';
import { getBalance } from '@/lib/coins/actions';
import DashboardLayoutClient from './DashboardLayoutClient';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getUser();

  if (!session) {
    redirect('/login?redirect=/dashboard');
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

  const coinBalance = await getBalance(session.user.id);

  return (
    <DashboardLayoutClient
      sidebarUser={sidebarUser}
      coinBalance={coinBalance.balance}
      coinsFrozen={coinBalance.frozen}
    >
      {children}
    </DashboardLayoutClient>
  );
}
