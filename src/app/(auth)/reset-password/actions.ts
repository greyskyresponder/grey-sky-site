'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { resetPasswordSchema, updatePasswordSchema } from '@/lib/validators/auth';

export async function resetPassword(formData: FormData) {
  const raw = { email: formData.get('email') as string };

  const result = resetPasswordSchema.safeParse(raw);
  if (!result.success) {
    return { error: result.error.issues[0].message };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.resetPasswordForEmail(result.data.email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/reset-password`,
  });

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}

export async function updatePassword(formData: FormData) {
  const raw = {
    password: formData.get('password') as string,
    confirm_password: formData.get('confirm_password') as string,
  };

  const result = updatePasswordSchema.safeParse(raw);
  if (!result.success) {
    return { error: result.error.issues[0].message };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.updateUser({
    password: result.data.password,
  });

  if (error) {
    return { error: error.message };
  }

  redirect('/dashboard');
}
