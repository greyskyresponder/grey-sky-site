'use client';

import Link from 'next/link';
import { LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import UserBadge from './UserBadge';
import NavLinks from './NavLinks';
import type { MembershipStatus } from '@/lib/types/enums';

type DashboardSidebarProps = {
  user: {
    displayName: string;
    avatarUrl: string | null;
    membershipStatus: MembershipStatus;
    membershipExpiresAt: string | null;
    email: string;
  };
  mobileOpen: boolean;
  onClose: () => void;
};

export default function DashboardSidebar({
  user,
  mobileOpen,
  onClose,
}: DashboardSidebarProps) {
  const router = useRouter();
  const supabase = createClient();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  }

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-[280px] bg-[#0A1628] transform transition-transform lg:translate-x-0 lg:static lg:z-auto flex flex-col ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-label="Main sidebar"
      >
        {/* Brand header */}
        <div className="px-6 py-5 border-b border-white/10">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-[#C5933A] flex items-center justify-center flex-shrink-0">
              <svg
                className="w-5 h-5 text-[#0A1628]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
            </div>
            <div>
              <span className="text-sm font-bold text-white tracking-tight">
                Grey Sky
              </span>
              <span className="block text-[10px] text-gray-400 uppercase tracking-widest">
                Responder Portal
              </span>
            </div>
          </Link>
        </div>

        {/* User badge */}
        <div className="border-b border-white/10">
          <UserBadge
            displayName={user.displayName}
            avatarUrl={user.avatarUrl}
            membershipStatus={user.membershipStatus}
            membershipExpiresAt={user.membershipExpiresAt}
          />
        </div>

        {/* Navigation */}
        <NavLinks />

        {/* Footer */}
        <div className="px-4 py-4 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-400 hover:text-white hover:bg-white/5 rounded transition-colors"
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
