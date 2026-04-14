import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getUser } from '@/lib/auth/getUser';
import { MfaSettings } from '@/components/auth/MfaSettings';
import { SignOutAllButton } from './SignOutAllButton';

export const metadata: Metadata = {
  title: 'Security Settings — Grey Sky Responder Society',
};

export default async function SecuritySettingsPage() {
  const session = await getUser();
  if (!session) redirect('/login?redirect=/dashboard/settings/security');

  return (
    <div className="max-w-2xl space-y-8">
      <header>
        <h1 className="text-2xl font-semibold text-[var(--gs-navy)]">
          Security Settings
        </h1>
        <p className="text-sm text-[var(--gs-steel)] mt-1">
          Manage two-factor authentication and active sessions.
        </p>
      </header>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-[var(--gs-navy)]">
          Two-factor authentication
        </h2>
        <MfaSettings />
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-[var(--gs-navy)]">
          Active sessions
        </h2>
        <p className="text-sm text-[var(--gs-steel)]">
          Sign out of every device. You&apos;ll need to sign in again on each
          one.
        </p>
        <SignOutAllButton />
      </section>
    </div>
  );
}
