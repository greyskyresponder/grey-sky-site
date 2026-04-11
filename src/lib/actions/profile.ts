'use server';

// TODO: test — happy path: authenticated user updates profile, revalidates /dashboard/profile
// TODO: test — error path: unauthenticated request returns error
// TODO: test — error path: invalid payload (bad phone format) returns validation error
// TODO: test — avatar upload: file > 2MB rejected, wrong MIME rejected, valid upload succeeds

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { profileUpdateSchema } from '@/lib/validators/profile';
import { updateProfile, uploadAvatar } from '@/lib/queries/profile';

export async function updateProfileAction(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

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
    const firstError = validation.error.issues[0];
    return { error: firstError.message };
  }

  const result = await updateProfile(supabase, user.id, validation.data);
  if (result.error) return { error: result.error };

  revalidatePath('/dashboard/profile');
  return { error: null };
}

export async function uploadAvatarAction(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: 'Not authenticated', url: null };

  const file = formData.get('avatar') as File;
  if (!file || file.size === 0) return { error: 'No file provided', url: null };

  if (file.size > 2 * 1024 * 1024) {
    return { error: 'File must be under 2 MB', url: null };
  }

  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    return { error: 'File must be JPEG, PNG, or WebP', url: null };
  }

  const result = await uploadAvatar(supabase, user.id, file);
  if (result.error) return { error: result.error, url: null };

  revalidatePath('/dashboard/profile');
  return { error: null, url: result.url };
}
