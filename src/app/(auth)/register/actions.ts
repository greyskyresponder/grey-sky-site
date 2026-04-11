// TODO: Tests needed — successful signup, duplicate email, validation errors, optional field updates
'use server';

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { registrationSchema } from '@/lib/validators/auth';

export async function signUp(formData: FormData) {
  const raw = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
    confirm_password: formData.get('confirm_password') as string,
    first_name: formData.get('first_name') as string,
    last_name: formData.get('last_name') as string,
    phone: (formData.get('phone') as string) || undefined,
    location_state: (formData.get('location_state') as string) || undefined,
  };

  const result = registrationSchema.safeParse(raw);
  if (!result.success) {
    const firstError = result.error.issues[0];
    return { error: firstError.message };
  }

  const { email, password, first_name, last_name, phone, location_state } =
    result.data;

  const supabase = await createClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { first_name, last_name },
    },
  });

  if (error) {
    return { error: error.message };
  }

  // If phone or location_state provided, update public.users via admin client
  // (the trigger only sets first_name, last_name, email)
  if (data.user && (phone || location_state)) {
    const admin = createAdminClient();
    const updates: Record<string, string> = {};
    if (phone) updates.phone = phone;
    if (location_state) updates.location_state = location_state;

    await admin.from('users').update(updates).eq('id', data.user.id);
  }

  // Check if email confirmation is required
  if (data.user?.identities?.length === 0) {
    return { error: 'An account with this email already exists' };
  }

  if (data.session) {
    // Email confirmation disabled — user is signed in immediately
    return { success: true, redirect: '/dashboard' };
  }

  // Email confirmation enabled — user needs to check email
  return { success: true, confirmEmail: true };
}
