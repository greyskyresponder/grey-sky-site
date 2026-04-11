// TODO: test — happy path: getProfile returns full profile with orgs + affinities + stats
// TODO: test — error path: getProfile for non-existent user returns null
// TODO: test — updateProfile: updates user fields + syncs affinities
// TODO: test — uploadAvatar: uploads to storage, updates avatar_url
import type { SupabaseClient } from '@supabase/supabase-js';
import type { MemberProfile, ProfileUpdatePayload } from '@/lib/types/profile';

export async function getProfile(
  supabase: SupabaseClient,
  userId: string
): Promise<MemberProfile | null> {
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (userError || !user) return null;

  // Fetch org affiliations with org details
  const { data: orgRows } = await supabase
    .from('user_organizations')
    .select('id, org_id, role, title, start_date, end_date, is_primary, organizations(name, type)')
    .eq('user_id', userId);

  // Fetch affinities
  const { data: affinityRows } = await supabase
    .from('user_affinities')
    .select('affinity_id, affinities(category, value)')
    .eq('user_id', userId);

  // Compute stats
  const { count: totalDeployments } = await supabase
    .from('deployment_records')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .in('status', ['submitted', 'verified']);

  const { count: verifiedDeployments } = await supabase
    .from('deployment_records')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('status', 'verified');

  const { data: hoursData } = await supabase
    .from('deployment_records')
    .select('hours')
    .eq('user_id', userId)
    .in('status', ['submitted', 'verified']);

  const totalHours = (hoursData ?? []).reduce((sum, r) => sum + (r.hours ?? 0), 0);

  const { count: certificationsEarned } = await supabase
    .from('user_certifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('status', 'certified');

  const organizations = (orgRows ?? []).map((row: Record<string, unknown>) => {
    const org = row.organizations as Record<string, unknown> | null;
    return {
      id: row.id as string,
      orgId: row.org_id as string,
      orgName: (org?.name as string) ?? '',
      orgType: (org?.type as string) ?? '',
      role: row.role as string,
      title: row.title as string | null,
      startDate: row.start_date as string | null,
      endDate: row.end_date as string | null,
      isPrimary: (row.is_primary as boolean) ?? false,
    };
  });

  const affinities = (affinityRows ?? []).map((row: Record<string, unknown>) => {
    const aff = row.affinities as Record<string, unknown> | null;
    return {
      affinityId: row.affinity_id as string,
      category: (aff?.category as string) ?? 'hazard_type',
      value: (aff?.value as string) ?? '',
    };
  });

  return {
    id: user.id,
    email: user.email,
    firstName: user.first_name ?? '',
    lastName: user.last_name ?? '',
    phone: user.phone,
    locationCity: user.location_city,
    locationState: user.location_state,
    locationCountry: user.location_country,
    bio: user.bio,
    avatarUrl: user.avatar_url,
    role: user.role ?? 'member',
    membershipStatus: user.membership_status,
    membershipExpiresAt: user.membership_expires_at,
    createdAt: user.created_at,
    organizations,
    affinities,
    stats: {
      totalDeployments: totalDeployments ?? 0,
      verifiedDeployments: verifiedDeployments ?? 0,
      totalHours,
      certificationsEarned: certificationsEarned ?? 0,
    },
  } as MemberProfile;
}

export async function updateProfile(
  supabase: SupabaseClient,
  userId: string,
  payload: ProfileUpdatePayload
): Promise<{ error: string | null }> {
  // Update user row
  const { error: updateError } = await supabase
    .from('users')
    .update({
      first_name: payload.firstName,
      last_name: payload.lastName,
      phone: payload.phone || null,
      location_city: payload.locationCity || null,
      location_state: payload.locationState || null,
      location_country: payload.locationCountry || null,
      bio: payload.bio || null,
    })
    .eq('id', userId);

  if (updateError) return { error: updateError.message };

  // Replace affinities: delete all, insert new set
  await supabase.from('user_affinities').delete().eq('user_id', userId);

  if (payload.affinityIds.length > 0) {
    const rows = payload.affinityIds.map((affinityId) => ({
      user_id: userId,
      affinity_id: affinityId,
    }));
    const { error: affinityError } = await supabase
      .from('user_affinities')
      .insert(rows);
    if (affinityError) return { error: affinityError.message };
  }

  return { error: null };
}

export async function uploadAvatar(
  supabase: SupabaseClient,
  userId: string,
  file: File
): Promise<{ url: string | null; error: string | null }> {
  const ext = file.name.split('.').pop() ?? 'jpg';
  const path = `${userId}/avatar.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(path, file, { upsert: true, contentType: file.type });

  if (uploadError) return { url: null, error: uploadError.message };

  const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(path);
  const publicUrl = urlData.publicUrl;

  const { error: updateError } = await supabase
    .from('users')
    .update({ avatar_url: publicUrl })
    .eq('id', userId);

  if (updateError) return { url: null, error: updateError.message };

  return { url: publicUrl, error: null };
}
