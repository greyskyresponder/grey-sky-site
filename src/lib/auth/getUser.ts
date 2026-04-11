import { createClient } from '@/lib/supabase/server';
import type { User as AuthUser } from '@supabase/supabase-js';
import type { User } from '@/lib/types/users';

export type AuthSession = {
  user: AuthUser;
  profile: User;
};

export async function getUser(): Promise<AuthSession | null> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single();

  if (!profile) {
    return null;
  }

  return { user, profile: profile as User };
}
