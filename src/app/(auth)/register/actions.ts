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

  const GENERIC_ERROR = 'Unable to create account. Please try again.';

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { first_name, last_name },
    },
  });

  if (error) {
    return { error: GENERIC_ERROR };
  }

  // Supabase returns an empty identities array when the email is already in use.
  // Respond identically to the fresh-signup path so attackers cannot enumerate users.
  if (data.user?.identities?.length === 0) {
    return { success: true, confirmEmail: true };
  }

  if (data.user && (phone || location_state)) {
    const admin = createAdminClient();
    const updates: Record<string, string> = {};
    if (phone) updates.phone = phone;
    if (location_state) updates.location_state = location_state;

    await admin.from('users').update(updates).eq('id', data.user.id);
  }

  if (data.session) {
    return { success: true, redirect: '/dashboard' };
  }

  return { success: true, confirmEmail: true };
}
