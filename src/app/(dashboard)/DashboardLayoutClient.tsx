'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import DashboardSidebar from '@/components/dashboard/DashboardSidebar';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import MobileBottomNav from '@/components/dashboard/MobileBottomNav';
import type { MembershipStatus } from '@/lib/types/enums';

type SidebarUser = {
  displayName: string;
  avatarUrl: string | null;
  membershipStatus: MembershipStatus;
  membershipExpiresAt: string | null;
  email: string;
};

const pageTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/dashboard/records': 'Response Reports',
  '/dashboard/profile': 'Profile',
  '/dashboard/coins': 'Sky Coins',
  '/dashboard/documents': 'Documents',
  '/dashboard/certifications': 'Certifications',
};

export default function DashboardLayoutClient({
  sidebarUser,
  coinBalance,
  coinsFrozen,
  children,
}: {
  sidebarUser: SidebarUser;
  coinBalance?: number;
  coinsFrozen?: boolean;
  children: React.ReactNode;
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const pageTitle =
    pageTitles[pathname] ||
    Object.entries(pageTitles).find(([route]) =>
      pathname.startsWith(route) && route !== '/dashboard'
    )?.[1] ||
    'Dashboard';

  return (
    <div className="min-h-screen bg-[#F5F5F5] flex">
      <DashboardSidebar
        user={sidebarUser}
        mobileOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <DashboardHeader
          pageTitle={pageTitle}
          onMobileMenuToggle={() => setMobileMenuOpen(true)}
          coinBalance={coinBalance}
          coinsFrozen={coinsFrozen}
        />

        <main className="flex-1 p-4 lg:p-6 pb-20 lg:pb-6">
          {children}
        </main>
      </div>

      <MobileBottomNav />
    </div>
  );
}
