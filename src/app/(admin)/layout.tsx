// TODO: test — non-platform_admin redirected by middleware, layout never renders
// TODO: test — authenticated platform_admin renders AdminLayoutClient with profile props
// TODO: test — missing profile renders fallback instead of crashing
import { redirect } from 'next/navigation';
import { getUserOrPartial } from '@/lib/auth/getUser';
import AdminLayoutClient from './AdminLayoutClient';

export const metadata = {
  title: 'Admin — Grey Sky Responder Society',
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getUserOrPartial();

  if (!session) {
    redirect('/login?redirect=/admin');
  }

  if (!session.profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F5F5]">
        <div className="max-w-md w-full p-8 bg-white rounded-lg shadow-sm text-center">
          <h1 className="text-xl font-semibold text-[#0A1628] mb-4">
            Admin Session Unavailable
          </h1>
          <p className="text-gray-600 mb-6">
            Your account is authenticated, but your admin profile could not be
            loaded. Please sign out and sign back in.
          </p>
          <a
            href="/dashboard"
            className="inline-block px-6 py-2.5 bg-[#0A1628] text-white font-semibold rounded transition-colors hover:bg-[#C5933A] hover:text-[#0A1628]"
          >
            Return to Portal
          </a>
        </div>
      </div>
    );
  }

  // Middleware already enforces platform_admin; this is a defense-in-depth check.
  // The `role` column is not in the current User type, so we read it loosely.
  const role = (session.profile as unknown as { role?: string }).role;
  if (role !== 'platform_admin') {
    redirect('/dashboard?error=insufficient_permissions');
  }

  const displayName =
    [session.profile.first_name, session.profile.last_name]
      .filter(Boolean)
      .join(' ') ||
    session.user.email?.split('@')[0] ||
    'Administrator';

  const email = session.user.email ?? session.profile.email ?? '';

  return (
    <AdminLayoutClient displayName={displayName} email={email}>
      {children}
    </AdminLayoutClient>
  );
}
