'use client';

import { Menu, Bell } from 'lucide-react';
import Link from 'next/link';

type DashboardHeaderProps = {
  pageTitle: string;
  onMobileMenuToggle: () => void;
};

export default function DashboardHeader({
  pageTitle,
  onMobileMenuToggle,
}: DashboardHeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-4 lg:px-6">
      {/* Mobile hamburger */}
      <button
        onClick={onMobileMenuToggle}
        className="lg:hidden text-gray-500 hover:text-gray-700"
        aria-label="Open navigation menu"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Desktop breadcrumb / title */}
      <div className="hidden lg:flex items-center gap-2 text-sm text-gray-500">
        <Link href="/dashboard" className="hover:text-gray-700">
          Dashboard
        </Link>
        {pageTitle !== 'Dashboard' && (
          <>
            <span>/</span>
            <span className="text-gray-900 font-medium">{pageTitle}</span>
          </>
        )}
      </div>

      {/* Mobile centered title */}
      <h1 className="lg:hidden flex-1 text-center text-sm font-semibold text-gray-900">
        {pageTitle}
      </h1>

      <div className="flex-1 hidden lg:block" />

      {/* Quick actions */}
      <div className="flex items-center gap-3">
        {/* Notification bell — placeholder */}
        <button
          className="relative text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Notifications"
        >
          <Bell className="w-5 h-5" />
        </button>
        <Link
          href="/"
          className="text-sm text-gray-500 hover:text-gray-700 transition-colors hidden sm:inline"
        >
          Back to Site
        </Link>
      </div>
    </header>
  );
}
