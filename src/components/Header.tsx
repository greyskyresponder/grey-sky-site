"use client";

import { useState } from "react";
import Link from "next/link";

const navLinks = [
  { href: "/standards", label: "Standards" },
  { href: "/story", label: "Tell Your Story" },
  { href: "/community", label: "Community" },
  { href: "/membership", label: "Membership" },
  { href: "/about", label: "About" },
];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[var(--gs-navy)]/95 backdrop-blur-md border-b border-[var(--gs-steel)]/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded bg-[var(--gs-gold)] flex items-center justify-center">
              <span className="text-[var(--gs-navy)] font-bold text-sm">GS</span>
            </div>
            <div className="hidden sm:block">
              <span className="text-white font-semibold text-sm tracking-wide">
                Grey Sky Responder
              </span>
              <span className="text-[var(--gs-silver)] text-xs block -mt-0.5">Society</span>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-3 py-2 text-sm text-[var(--gs-silver)] hover:text-white transition-colors rounded-md hover:bg-white/5"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/#waitlist"
              className="ml-3 px-4 py-2 text-sm font-semibold bg-[var(--gs-gold)] text-[var(--gs-navy)] rounded-lg hover:bg-[var(--gs-gold-light)] transition-colors"
            >
              Join the Waitlist
            </Link>
          </nav>

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="lg:hidden p-2 text-[var(--gs-silver)] hover:text-white"
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="lg:hidden bg-[var(--gs-navy)] border-t border-[var(--gs-steel)]/20">
          <div className="px-4 py-3 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="block px-3 py-2 text-sm text-[var(--gs-silver)] hover:text-white hover:bg-white/5 rounded-md"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/#waitlist"
              onClick={() => setMenuOpen(false)}
              className="block mt-2 px-4 py-2 text-sm font-semibold bg-[var(--gs-gold)] text-[var(--gs-navy)] rounded-lg text-center hover:bg-[var(--gs-gold-light)] transition-colors"
            >
              Join the Waitlist
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
