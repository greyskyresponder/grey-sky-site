'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';

const pageTitles: Record<string, string> = {
  '/admin': 'Dashboard',
  '/admin/users': 'Users',
  '/admin/memberships': 'Memberships',
  '/admin/validations': 'Validations',
  '/admin/audit': 'Audit Log',
};

export default function AdminLayoutClient({
  displayName,
  email,
  children,
}: {
  displayName: string;
  email: string;
  children: React.ReactNode;
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const pageTitle =
    pageTitles[pathname] ||
    Object.entries(pageTitles).find(
      ([route]) => pathname.startsWith(route) && route !== '/admin',
    )?.[1] ||
    'Dashboard';

  return (
    <div className="min-h-screen bg-[#F5F5F5] flex">
      <AdminSidebar
        displayName={displayName}
        email={email}
        mobileOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader
          pageTitle={pageTitle}
          onMobileMenuToggle={() => setMobileMenuOpen(true)}
        />

        <main className="flex-1 p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
