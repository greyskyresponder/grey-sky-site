'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  FileText,
  User,
  Coins,
  FolderOpen,
  Award,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Response Reports', href: '/dashboard/records', icon: FileText },
  { label: 'Profile', href: '/dashboard/profile', icon: User },
  { label: 'Sky Points', href: '/dashboard/points', icon: Coins },
  { label: 'Documents', href: '/dashboard/documents', icon: FolderOpen },
  { label: 'Certifications', href: '/dashboard/certifications', icon: Award },
];

export { navItems };

export default function NavLinks() {
  const pathname = usePathname();

  return (
    <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto" role="navigation" aria-label="Dashboard navigation">
      {navItems.map((item) => {
        const active =
          item.href === '/dashboard'
            ? pathname === '/dashboard'
            : pathname.startsWith(item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-3 py-2.5 rounded text-sm font-medium transition-colors ${
              active
                ? 'border-l-2 border-[#C5933A] bg-[#C5933A]/10 text-[#C5933A] ml-0'
                : 'text-gray-300 hover:text-white hover:bg-white/5'
            }`}
            aria-current={active ? 'page' : undefined}
          >
            <Icon className="w-5 h-5 flex-shrink-0" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
