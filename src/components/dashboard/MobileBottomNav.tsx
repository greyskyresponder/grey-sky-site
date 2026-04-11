'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  FileText,
  User,
  Coins,
  Award,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

type BottomNavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

// Top 5 items for mobile bottom nav (Documents moves to hamburger menu)
const bottomNavItems: BottomNavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Reports', href: '/dashboard/records', icon: FileText },
  { label: 'Profile', href: '/dashboard/profile', icon: User },
  { label: 'Points', href: '/dashboard/points', icon: Coins },
  { label: 'Certs', href: '/dashboard/certifications', icon: Award },
];

export default function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-gray-200 lg:hidden"
      role="navigation"
      aria-label="Mobile navigation"
    >
      <div className="flex items-center justify-around h-16">
        {bottomNavItems.map((item) => {
          const active =
            item.href === '/dashboard'
              ? pathname === '/dashboard'
              : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-1 flex-1 h-full transition-colors ${
                active ? 'text-[#C5933A]' : 'text-gray-400'
              }`}
              aria-current={active ? 'page' : undefined}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
