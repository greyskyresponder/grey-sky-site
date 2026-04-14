// TODO: Tests needed — returns null when unauthenticated, returns AuthSession when valid, handles missing profile
import { createClient } from '@/lib/supabase/server';
import type { User as AuthUser } from '@supabase/supabase-js';
import type { User } from '@/lib/types/users';

export type AuthSession = {
  user: AuthUser;
  profile: User;
};

/** Result when auth succeeds but the public.users profile row is missing. */
export type AuthNoProfile = {
  user: AuthUser;
  profile: null;
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

/**
 * Like getUser() but distinguishes "not authenticated" from "authenticated
 * but missing profile row". This prevents redirect loops when the public.users
 * trigger hasn't fired or the profile query fails.
 */
export async function getUserOrPartial(): Promise<AuthSession | AuthNoProfile | null> {
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
    return { user, profile: null };
  }

  return { user, profile: profile as User };
}
