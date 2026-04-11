'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { loginSchema } from '@/lib/validators/auth';

export async function signIn(formData: FormData, redirectTo?: string) {
  const raw = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  };

  const result = loginSchema.safeParse(raw);
  if (!result.success) {
    return { error: result.error.issues[0].message };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email: result.data.email,
    password: result.data.password,
  });

  if (error) {
    return { error: 'Invalid email or password' };
  }

  redirect(redirectTo || '/dashboard');
}
