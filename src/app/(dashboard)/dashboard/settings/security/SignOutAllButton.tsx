'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export function SignOutAllButton() {
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  async function signOutAll() {
    setBusy(true);
    const supabase = createClient();
    await supabase.auth.signOut({ scope: 'global' });
    router.push('/login');
  }

  return (
    <button
      type="button"
      onClick={signOutAll}
      disabled={busy}
      className="px-4 py-2 border border-[var(--gs-alert)] text-[var(--gs-alert)] rounded hover:bg-[var(--gs-alert)] hover:text-white disabled:opacity-50"
    >
      {busy ? 'Signing out...' : 'Sign out all devices'}
    </button>
  );
}
