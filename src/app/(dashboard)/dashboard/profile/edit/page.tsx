import { redirect } from 'next/navigation';
import { getUser } from '@/lib/auth/getUser';
import { getProfile } from '@/lib/queries/profile';
import { createClient } from '@/lib/supabase/server';
import { ProfileEditForm } from '@/components/dashboard/profile/ProfileEditForm';
import type { Affinity } from '@/lib/types/taxonomy';

export default async function ProfileEditPage() {
  const session = await getUser();
  if (!session) redirect('/login');

  const supabase = await createClient();
  const profile = await getProfile(supabase, session.user.id);

  if (!profile) redirect('/dashboard');

  // Fetch all affinities for the selector
  const { data: affinities } = await supabase
    .from('affinities')
    .select('*')
    .order('category')
    .order('sort_order');

  return (
    <div>
      <h1 className="text-xl font-bold text-[var(--gs-navy)] mb-6">Update Profile</h1>
      <ProfileEditForm
        profile={profile}
        allAffinities={(affinities ?? []) as Affinity[]}
      />
    </div>
  );
}
