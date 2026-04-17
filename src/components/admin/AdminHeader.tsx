'use client';

import { Menu } from 'lucide-react';
import Link from 'next/link';

type AdminHeaderProps = {
  pageTitle: string;
  onMobileMenuToggle: () => void;
};

export default function AdminHeader({
  pageTitle,
  onMobileMenuToggle,
}: AdminHeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-4 lg:px-6">
      <button
        onClick={onMobileMenuToggle}
        className="lg:hidden text-gray-500 hover:text-gray-700"
        aria-label="Open admin navigation menu"
      >
        <Menu className="w-6 h-6" />
      </button>

      <div className="hidden lg:flex items-center gap-2 text-sm text-gray-500">
        <Link href="/admin" className="hover:text-gray-700">
          Admin
        </Link>
        {pageTitle !== 'Dashboard' && (
          <>
            <span>/</span>
            <span className="text-gray-900 font-medium">{pageTitle}</span>
          </>
        )}
      </div>

      <h1 className="lg:hidden flex-1 text-center text-sm font-semibold text-gray-900">
        {pageTitle}
      </h1>

      <div className="flex-1 hidden lg:block" />

      <div className="flex items-center gap-3">
        <Link
          href="/dashboard"
          className="text-sm text-gray-500 hover:text-gray-700 transition-colors hidden sm:inline"
        >
          Responder Portal
        </Link>
      </div>
    </header>
  );
}
