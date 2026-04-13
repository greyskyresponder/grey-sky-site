import { redirect } from 'next/navigation';
import { getUser } from '@/lib/auth/getUser';
import { getMyProfile } from '@/lib/actions/profile';
import { createClient } from '@/lib/supabase/server';
import type { Affinity } from '@/lib/types/taxonomy';
import ProfileEditPage from '@/components/dashboard/profile/edit/ProfileEditPage';

export default async function EditProfilePage() {
  const session = await getUser();
  if (!session) redirect('/login');

  const { profile } = await getMyProfile();
  if (!profile) redirect('/dashboard');

  const supabase = await createClient();

  // Fetch all affinities and team types in parallel
  const [affinitiesResult, teamTypesResult] = await Promise.all([
    supabase.from('affinities').select('*').order('category').order('sort_order'),
    supabase.from('rtlt_team_types').select('id, name').order('name'),
  ]);

  return (
    <div>
      <h1 className="text-xl font-bold text-[var(--gs-navy)] mb-6">Edit Profile</h1>
      <ProfileEditPage
        profile={profile}
        allAffinities={(affinitiesResult.data ?? []) as Affinity[]}
        teamTypes={(teamTypesResult.data ?? []) as { id: string; name: string }[]}
      />
    </div>
  );
}
