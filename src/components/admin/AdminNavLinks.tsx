'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  CreditCard,
  ShieldCheck,
  ScrollText,
  ClipboardCheck,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { label: 'Users', href: '/admin/users', icon: Users },
  { label: 'Memberships', href: '/admin/memberships', icon: CreditCard },
  { label: 'Validations', href: '/admin/validations', icon: ShieldCheck },
  { label: 'Verifications', href: '/admin/verifications', icon: ClipboardCheck },
  { label: 'Audit Log', href: '/admin/audit', icon: ScrollText },
];

export { navItems };

export default function AdminNavLinks() {
  const pathname = usePathname();

  return (
    <nav
      className="flex-1 px-3 py-4 space-y-1 overflow-y-auto"
      role="navigation"
      aria-label="Admin navigation"
    >
      {navItems.map((item) => {
        const active =
          item.href === '/admin'
            ? pathname === '/admin'
            : pathname.startsWith(item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-3 py-2.5 rounded text-sm font-medium transition-colors ${
              active
                ? 'border-l-2 border-[#C5933A] bg-[#C5933A]/10 text-[#C5933A]'
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
