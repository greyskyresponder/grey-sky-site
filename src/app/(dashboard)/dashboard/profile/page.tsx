import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getUser } from '@/lib/auth/getUser';
import { getMyProfile } from '@/lib/actions/profile';
import ProfileView from '@/components/dashboard/profile/ProfileView';

export default async function ProfilePage() {
  const session = await getUser();
  if (!session) redirect('/login');

  const { profile } = await getMyProfile();
  if (!profile) redirect('/dashboard');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-[var(--gs-navy)]">My Service Profile</h1>
        <Link
          href="/dashboard/profile/edit"
          className="bg-[var(--gs-navy)] text-white hover:opacity-90 px-4 py-2 rounded-md text-sm font-medium transition-opacity"
        >
          Update Profile
        </Link>
      </div>

      <ProfileView profile={profile} />
    </div>
  );
}
