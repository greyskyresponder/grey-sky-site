'use client';

import Link from 'next/link';
import { LogOut, ShieldAlert } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import AdminNavLinks from './AdminNavLinks';

type AdminSidebarProps = {
  displayName: string;
  email: string;
  mobileOpen: boolean;
  onClose: () => void;
};

export default function AdminSidebar({
  displayName,
  email,
  mobileOpen,
  onClose,
}: AdminSidebarProps) {
  const router = useRouter();
  const supabase = createClient();

  async function handleLogout() {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error('[admin.signOut] failed', err);
    }
    router.push('/');
    router.refresh();
  }

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-[280px] bg-[#0A1628] transform transition-transform lg:translate-x-0 lg:static lg:z-auto flex flex-col ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-label="Admin sidebar"
      >
        {/* Brand + admin badge */}
        <div className="px-6 py-5 border-b border-white/10">
          <Link href="/admin" className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-[#C5933A] flex items-center justify-center flex-shrink-0">
              <ShieldAlert className="w-5 h-5 text-[#0A1628]" aria-hidden="true" />
            </div>
            <div>
              <span className="text-sm font-bold text-white tracking-tight">
                Grey Sky
              </span>
              <span className="block text-[10px] text-[#C5933A] uppercase tracking-widest">
                Platform Admin
              </span>
            </div>
          </Link>
        </div>

        {/* Admin identity */}
        <div className="px-6 py-4 border-b border-white/10">
          <p className="text-sm font-medium text-white truncate">{displayName}</p>
          <p className="text-xs text-gray-400 truncate">{email}</p>
          <span className="inline-block mt-2 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide rounded bg-[#C5933A]/20 text-[#C5933A]">
            Platform Admin
          </span>
        </div>

        <AdminNavLinks />

        <div className="px-4 py-4 border-t border-white/10">
          <Link
            href="/dashboard"
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-400 hover:text-white hover:bg-white/5 rounded transition-colors"
          >
            Responder Portal
          </Link>
          <button
            onClick={handleLogout}
            className="mt-1 w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-400 hover:text-white hover:bg-white/5 rounded transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
          <p className="mt-3 px-3 text-[10px] text-gray-600">
            Longview Solutions Group LLC
          </p>
        </div>
      </aside>
    </>
  );
}
