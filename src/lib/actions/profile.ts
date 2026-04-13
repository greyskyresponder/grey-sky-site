'use server';

// TODO: test — happy path: authenticated user updates profile, revalidates /dashboard/profile
// TODO: test — error path: unauthenticated request returns error
// TODO: test — error path: invalid payload (bad phone format) returns validation error
// TODO: test — avatar upload: file > 2MB rejected, wrong MIME rejected, valid upload succeeds
// TODO: test — getMyProfile: returns full UserProfile with all related data
// TODO: test — updateBasicInfo: validates and updates user fields
// TODO: test — addCommunity/updateCommunity/removeCommunity: CRUD on user_communities
// TODO: test — addServiceOrg/setPrimaryOrg/removeServiceOrg: CRUD on user_service_orgs
// TODO: test — addQualification: auto-sets is_active=false for expired credentials
// TODO: test — updateAffinities: replaces all affinities, triggers completeness recalc

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import {
  profileUpdateSchema,
  basicInfoSchema,
  serviceIdentitySchema,
  communitySchema,
  serviceOrgSchema,
  teamSchema,
  qualificationSchema,
  languageSchema,
  affinitiesSchema,
} from '@/lib/validators/profile';
import { updateProfile, uploadAvatar } from '@/lib/queries/profile';
import type { UserProfile } from '@/lib/types/profile';

// ── Helpers ──

async function getAuthUserId(): Promise<string | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id ?? null;
}

function triggerCompletenessRecalc(supabase: Awaited<ReturnType<typeof createClient>>, userId: string) {
  return supabase.from('users').update({ profile_updated_at: new Date().toISOString() }).eq('id', userId);
}

// ── Legacy actions (used by existing basic profile edit form) ──

export async function updateProfileAction(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const raw = {
    firstName: formData.get('firstName') as string,
    lastName: formData.get('lastName') as string,
    phone: (formData.get('phone') as string) || null,
    locationCity: (formData.get('locationCity') as string) || null,
    locationState: (formData.get('locationState') as string) || null,
    locationCountry: (formData.get('locationCountry') as string) || null,
    bio: (formData.get('bio') as string) || null,
    affinityIds: JSON.parse((formData.get('affinityIds') as string) || '[]'),
  };

  const validation = profileUpdateSchema.safeParse(raw);
  if (!validation.success) {
    return { error: validation.error.issues[0].message };
  }

  const result = await updateProfile(supabase, user.id, validation.data);
  if (result.error) return { error: result.error };

  revalidatePath('/dashboard/profile');
  return { error: null };
}

export async function uploadAvatarAction(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated', url: null };

  const file = formData.get('avatar') as File;
  if (!file || file.size === 0) return { error: 'No file provided', url: null };
  if (file.size > 2 * 1024 * 1024) return { error: 'File must be under 2 MB', url: null };

  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.type)) return { error: 'File must be JPEG, PNG, or WebP', url: null };

  const result = await uploadAvatar(supabase, user.id, file);
  if (result.error) return { error: result.error, url: null };

  revalidatePath('/dashboard/profile');
  return { error: null, url: result.url };
}

// ── DOC-202 Expansion actions ──

export async function getMyProfile(): Promise<{ profile: UserProfile | null; error: string | null }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { profile: null, error: 'Not authenticated' };

  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single();

  if (userError || !userData) return { profile: null, error: 'Profile not found' };

  const [communities, serviceOrgs, teams, qualifications, languages, affinityRows] = await Promise.all([
    supabase.from('user_communities').select('*').eq('user_id', user.id).order('is_current', { ascending: false }).order('start_year', { ascending: false, nullsFirst: true }),
    supabase.from('user_service_orgs').select('*').eq('user_id', user.id).order('is_primary', { ascending: false }).order('is_current', { ascending: false }),
    supabase.from('user_teams').select('*, rtlt_team_types(name), organizations(name)').eq('user_id', user.id).order('is_current', { ascending: false }),
    supabase.from('user_qualifications').select('*').eq('user_id', user.id).order('is_active', { ascending: false }).order('expiration_date', { ascending: false, nullsFirst: true }),
    supabase.from('user_languages').select('*').eq('user_id', user.id).order('language'),
    supabase.from('user_affinities').select('affinity_id, affinities(category, value, description)').eq('user_id', user.id),
  ]);

  const mappedTeams = (teams.data ?? []).map((t: Record<string, unknown>) => {
    const teamType = t.rtlt_team_types as Record<string, unknown> | null;
    const org = t.organizations as Record<string, unknown> | null;
    return {
      id: t.id as string,
      team_name: t.team_name as string,
      team_type_id: t.team_type_id as string | null,
      team_type_name: (teamType?.name as string) ?? undefined,
      organization_id: t.organization_id as string | null,
      organization_name: (org?.name as string) ?? undefined,
      position_on_team: t.position_on_team as string | null,
      rtlt_position_slug: t.rtlt_position_slug as string | null,
      start_year: t.start_year as number | null,
      end_year: t.end_year as number | null,
      is_current: t.is_current as boolean,
    };
  });

  const mappedAffinities = (affinityRows.data ?? []).map((r: Record<string, unknown>) => {
    const aff = r.affinities as Record<string, unknown> | null;
    return {
      affinity_id: r.affinity_id as string,
      category: (aff?.category as string) ?? 'hazard_type',
      value: (aff?.value as string) ?? '',
      description: (aff?.description as string | null) ?? null,
    };
  });

  const profile: UserProfile = {
    id: userData.id,
    email: userData.email,
    first_name: userData.first_name,
    last_name: userData.last_name,
    preferred_name: userData.preferred_name ?? null,
    phone: userData.phone,
    date_of_birth: userData.date_of_birth ?? null,
    location_city: userData.location_city,
    location_state: userData.location_state,
    location_country: userData.location_country,
    bio: userData.bio,
    avatar_url: userData.avatar_url,
    service_start_year: userData.service_start_year ?? null,
    primary_discipline: userData.primary_discipline ?? null,
    secondary_disciplines: userData.secondary_disciplines ?? null,
    service_statement: userData.service_statement ?? null,
    years_of_service_computed: userData.years_of_service_computed ?? null,
    profile_completeness: userData.profile_completeness ?? 0,
    membership_status: userData.membership_status ?? 'none',
    membership_expires_at: userData.membership_expires_at ?? null,
    role: userData.role ?? 'member',
    created_at: userData.created_at,
    profile_updated_at: userData.profile_updated_at ?? null,
    communities: (communities.data ?? []) as UserProfile['communities'],
    service_orgs: (serviceOrgs.data ?? []) as UserProfile['service_orgs'],
    teams: mappedTeams,
    qualifications: (qualifications.data ?? []) as UserProfile['qualifications'],
    languages: (languages.data ?? []) as UserProfile['languages'],
    affinities: mappedAffinities as UserProfile['affinities'],
  };

  return { profile, error: null };
}

// ── Basic Info ──

export async function updateBasicInfo(data: unknown) {
  const userId = await getAuthUserId();
  if (!userId) return { error: 'Not authenticated' };

  const parsed = basicInfoSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const supabase = await createClient();
  const { error } = await supabase.from('users').update({
    first_name: parsed.data.first_name,
    last_name: parsed.data.last_name,
    preferred_name: parsed.data.preferred_name || null,
    phone: parsed.data.phone || null,
    date_of_birth: parsed.data.date_of_birth || null,
    location_city: parsed.data.location_city || null,
    location_state: parsed.data.location_state || null,
    location_country: parsed.data.location_country || 'USA',
    profile_updated_at: new Date().toISOString(),
  }).eq('id', userId);

  if (error) return { error: error.message };
  revalidatePath('/dashboard/profile');
  return { error: null };
}

// ── Service Identity ──

export async function updateServiceIdentity(data: unknown) {
  const userId = await getAuthUserId();
  if (!userId) return { error: 'Not authenticated' };

  const parsed = serviceIdentitySchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const supabase = await createClient();
  const { error } = await supabase.from('users').update({
    primary_discipline: parsed.data.primary_discipline || null,
    secondary_disciplines: parsed.data.secondary_disciplines ?? null,
    service_start_year: parsed.data.service_start_year ?? null,
    service_statement: parsed.data.service_statement || null,
    profile_updated_at: new Date().toISOString(),
  }).eq('id', userId);

  if (error) return { error: error.message };
  revalidatePath('/dashboard/profile');
  return { error: null };
}

// ── Communities ──

export async function addCommunity(data: unknown) {
  const userId = await getAuthUserId();
  if (!userId) return { error: 'Not authenticated' };

  const parsed = communitySchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const supabase = await createClient();
  const { error } = await supabase.from('user_communities').insert({
    user_id: userId,
    community_name: parsed.data.community_name,
    state: parsed.data.state || null,
    country: parsed.data.country,
    relationship: parsed.data.relationship,
    start_year: parsed.data.start_year ?? null,
    end_year: parsed.data.end_year ?? null,
    is_current: parsed.data.is_current,
    notes: parsed.data.notes || null,
  });

  if (error) return { error: error.message };
  await triggerCompletenessRecalc(supabase, userId);
  revalidatePath('/dashboard/profile');
  return { error: null };
}

export async function updateCommunity(id: string, data: unknown) {
  const userId = await getAuthUserId();
  if (!userId) return { error: 'Not authenticated' };

  const parsed = communitySchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const supabase = await createClient();
  const { error } = await supabase.from('user_communities').update({
    community_name: parsed.data.community_name,
    state: parsed.data.state || null,
    country: parsed.data.country,
    relationship: parsed.data.relationship,
    start_year: parsed.data.start_year ?? null,
    end_year: parsed.data.end_year ?? null,
    is_current: parsed.data.is_current,
    notes: parsed.data.notes || null,
  }).eq('id', id).eq('user_id', userId);

  if (error) return { error: error.message };
  await triggerCompletenessRecalc(supabase, userId);
  revalidatePath('/dashboard/profile');
  return { error: null };
}

export async function removeCommunity(id: string) {
  const userId = await getAuthUserId();
  if (!userId) return { error: 'Not authenticated' };

  const supabase = await createClient();
  const { error } = await supabase.from('user_communities').delete().eq('id', id).eq('user_id', userId);

  if (error) return { error: error.message };
  await triggerCompletenessRecalc(supabase, userId);
  revalidatePath('/dashboard/profile');
  return { error: null };
}

// ── Service Organizations ──

export async function addServiceOrg(data: unknown) {
  const userId = await getAuthUserId();
  if (!userId) return { error: 'Not authenticated' };

  const parsed = serviceOrgSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const supabase = await createClient();
  const { error } = await supabase.from('user_service_orgs').insert({
    user_id: userId,
    organization_name: parsed.data.organization_name,
    organization_id: parsed.data.organization_id ?? null,
    organization_type: parsed.data.organization_type || null,
    role_title: parsed.data.role_title || null,
    start_year: parsed.data.start_year ?? null,
    end_year: parsed.data.end_year ?? null,
    is_current: parsed.data.is_current,
    is_primary: parsed.data.is_primary,
  });

  if (error) return { error: error.message };
  await triggerCompletenessRecalc(supabase, userId);
  revalidatePath('/dashboard/profile');
  return { error: null };
}

export async function updateServiceOrg(id: string, data: unknown) {
  const userId = await getAuthUserId();
  if (!userId) return { error: 'Not authenticated' };

  const parsed = serviceOrgSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const supabase = await createClient();
  const { error } = await supabase.from('user_service_orgs').update({
    organization_name: parsed.data.organization_name,
    organization_id: parsed.data.organization_id ?? null,
    organization_type: parsed.data.organization_type || null,
    role_title: parsed.data.role_title || null,
    start_year: parsed.data.start_year ?? null,
    end_year: parsed.data.end_year ?? null,
    is_current: parsed.data.is_current,
    is_primary: parsed.data.is_primary,
  }).eq('id', id).eq('user_id', userId);

  if (error) return { error: error.message };
  await triggerCompletenessRecalc(supabase, userId);
  revalidatePath('/dashboard/profile');
  return { error: null };
}

export async function setPrimaryOrg(id: string) {
  const userId = await getAuthUserId();
  if (!userId) return { error: 'Not authenticated' };

  const supabase = await createClient();
  // Unset all is_primary for this user
  await supabase.from('user_service_orgs').update({ is_primary: false }).eq('user_id', userId);
  // Set target
  const { error } = await supabase.from('user_service_orgs').update({ is_primary: true }).eq('id', id).eq('user_id', userId);

  if (error) return { error: error.message };
  revalidatePath('/dashboard/profile');
  return { error: null };
}

export async function removeServiceOrg(id: string) {
  const userId = await getAuthUserId();
  if (!userId) return { error: 'Not authenticated' };

  const supabase = await createClient();
  const { error } = await supabase.from('user_service_orgs').delete().eq('id', id).eq('user_id', userId);

  if (error) return { error: error.message };
  await triggerCompletenessRecalc(supabase, userId);
  revalidatePath('/dashboard/profile');
  return { error: null };
}

// ── Teams ──

export async function addTeam(data: unknown) {
  const userId = await getAuthUserId();
  if (!userId) return { error: 'Not authenticated' };

  const parsed = teamSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const supabase = await createClient();
  const { error } = await supabase.from('user_teams').insert({
    user_id: userId,
    team_name: parsed.data.team_name,
    team_type_id: parsed.data.team_type_id ?? null,
    organization_id: parsed.data.organization_id ?? null,
    position_on_team: parsed.data.position_on_team || null,
    rtlt_position_slug: parsed.data.rtlt_position_slug || null,
    start_year: parsed.data.start_year ?? null,
    end_year: parsed.data.end_year ?? null,
    is_current: parsed.data.is_current,
  });

  if (error) return { error: error.message };
  await triggerCompletenessRecalc(supabase, userId);
  revalidatePath('/dashboard/profile');
  return { error: null };
}

export async function updateTeam(id: string, data: unknown) {
  const userId = await getAuthUserId();
  if (!userId) return { error: 'Not authenticated' };

  const parsed = teamSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const supabase = await createClient();
  const { error } = await supabase.from('user_teams').update({
    team_name: parsed.data.team_name,
    team_type_id: parsed.data.team_type_id ?? null,
    organization_id: parsed.data.organization_id ?? null,
    position_on_team: parsed.data.position_on_team || null,
    rtlt_position_slug: parsed.data.rtlt_position_slug || null,
    start_year: parsed.data.start_year ?? null,
    end_year: parsed.data.end_year ?? null,
    is_current: parsed.data.is_current,
  }).eq('id', id).eq('user_id', userId);

  if (error) return { error: error.message };
  await triggerCompletenessRecalc(supabase, userId);
  revalidatePath('/dashboard/profile');
  return { error: null };
}

export async function removeTeam(id: string) {
  const userId = await getAuthUserId();
  if (!userId) return { error: 'Not authenticated' };

  const supabase = await createClient();
  const { error } = await supabase.from('user_teams').delete().eq('id', id).eq('user_id', userId);

  if (error) return { error: error.message };
  await triggerCompletenessRecalc(supabase, userId);
  revalidatePath('/dashboard/profile');
  return { error: null };
}

// ── Qualifications ──

export async function addQualification(data: unknown) {
  const userId = await getAuthUserId();
  if (!userId) return { error: 'Not authenticated' };

  const parsed = qualificationSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const isActive = parsed.data.expiration_date
    ? new Date(parsed.data.expiration_date) >= new Date()
    : parsed.data.is_active;

  const supabase = await createClient();
  const { error } = await supabase.from('user_qualifications').insert({
    user_id: userId,
    qualification_name: parsed.data.qualification_name,
    issuing_authority: parsed.data.issuing_authority || null,
    credential_number: parsed.data.credential_number || null,
    issued_date: parsed.data.issued_date || null,
    expiration_date: parsed.data.expiration_date || null,
    is_active: isActive,
    category: parsed.data.category ?? null,
    verification_status: parsed.data.verification_status,
  });

  if (error) return { error: error.message };
  await triggerCompletenessRecalc(supabase, userId);
  revalidatePath('/dashboard/profile');
  return { error: null };
}

export async function updateQualification(id: string, data: unknown) {
  const userId = await getAuthUserId();
  if (!userId) return { error: 'Not authenticated' };

  const parsed = qualificationSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const isActive = parsed.data.expiration_date
    ? new Date(parsed.data.expiration_date) >= new Date()
    : parsed.data.is_active;

  const supabase = await createClient();
  const { error } = await supabase.from('user_qualifications').update({
    qualification_name: parsed.data.qualification_name,
    issuing_authority: parsed.data.issuing_authority || null,
    credential_number: parsed.data.credential_number || null,
    issued_date: parsed.data.issued_date || null,
    expiration_date: parsed.data.expiration_date || null,
    is_active: isActive,
    category: parsed.data.category ?? null,
    verification_status: parsed.data.verification_status,
  }).eq('id', id).eq('user_id', userId);

  if (error) return { error: error.message };
  await triggerCompletenessRecalc(supabase, userId);
  revalidatePath('/dashboard/profile');
  return { error: null };
}

export async function removeQualification(id: string) {
  const userId = await getAuthUserId();
  if (!userId) return { error: 'Not authenticated' };

  const supabase = await createClient();
  const { error } = await supabase.from('user_qualifications').delete().eq('id', id).eq('user_id', userId);

  if (error) return { error: error.message };
  await triggerCompletenessRecalc(supabase, userId);
  revalidatePath('/dashboard/profile');
  return { error: null };
}

// ── Languages ──

export async function addLanguage(data: unknown) {
  const userId = await getAuthUserId();
  if (!userId) return { error: 'Not authenticated' };

  const parsed = languageSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const supabase = await createClient();
  const { error } = await supabase.from('user_languages').insert({
    user_id: userId,
    language: parsed.data.language,
    proficiency: parsed.data.proficiency,
  });

  if (error) return { error: error.message };
  await triggerCompletenessRecalc(supabase, userId);
  revalidatePath('/dashboard/profile');
  return { error: null };
}

export async function removeLanguage(id: string) {
  const userId = await getAuthUserId();
  if (!userId) return { error: 'Not authenticated' };

  const supabase = await createClient();
  const { error } = await supabase.from('user_languages').delete().eq('id', id).eq('user_id', userId);

  if (error) return { error: error.message };
  await triggerCompletenessRecalc(supabase, userId);
  revalidatePath('/dashboard/profile');
  return { error: null };
}

// ── Affinities ──

export async function updateAffinities(affinityIds: unknown) {
  const userId = await getAuthUserId();
  if (!userId) return { error: 'Not authenticated' };

  const parsed = affinitiesSchema.safeParse(affinityIds);
  if (!parsed.success) return { error: 'Invalid affinity selection' };

  const supabase = await createClient();
  // Delete all existing
  await supabase.from('user_affinities').delete().eq('user_id', userId);

  // Insert new set
  if (parsed.data.length > 0) {
    const rows = parsed.data.map((affinityId) => ({
      user_id: userId,
      affinity_id: affinityId,
    }));
    const { error } = await supabase.from('user_affinities').insert(rows);
    if (error) return { error: error.message };
  }

  await triggerCompletenessRecalc(supabase, userId);
  revalidatePath('/dashboard/profile');
  return { error: null };
}
