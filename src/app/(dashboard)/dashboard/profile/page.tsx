import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getUser } from '@/lib/auth/getUser';
import { getProfile } from '@/lib/queries/profile';
import { createClient } from '@/lib/supabase/server';
import { ProfileHeader } from '@/components/dashboard/profile/ProfileHeader';
import { ProfileDetails } from '@/components/dashboard/profile/ProfileDetails';
import { ProfileAffinities } from '@/components/dashboard/profile/ProfileAffinities';
import { ProfileStats } from '@/components/dashboard/profile/ProfileStats';

export default async function ProfilePage() {
  const session = await getUser();
  if (!session) redirect('/login');

  const supabase = await createClient();
  const profile = await getProfile(supabase, session.user.id);

  if (!profile) redirect('/dashboard');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-[var(--gs-navy)]">Your Service Profile</h1>
        <Link
          href="/dashboard/profile/edit"
          className="bg-[var(--gs-navy)] text-white hover:opacity-90 px-4 py-2 rounded-md text-sm font-medium transition-opacity"
        >
          Update Profile
        </Link>
      </div>

      <ProfileHeader profile={profile} />
      <ProfileStats stats={profile.stats} />
      <ProfileDetails profile={profile} />
      <ProfileAffinities affinities={profile.affinities} />
    </div>
  );
}
