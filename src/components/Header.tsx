"use client";
import { useState } from "react";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 w-full bg-[var(--gs-navy)]/95 backdrop-blur-sm z-50 border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-[var(--gs-accent)] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">GS</span>
            </div>
            <div>
              <span className="text-white font-bold text-lg tracking-tight">
                Grey Sky
              </span>
              <span className="text-[var(--gs-silver)] text-sm block leading-none">
                Responder Society
              </span>
            </div>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#why" className="text-[var(--gs-silver)] hover:text-white transition text-sm font-medium">
              Why Credential
            </a>
            <a href="#disciplines" className="text-[var(--gs-silver)] hover:text-white transition text-sm font-medium">
              Disciplines
            </a>
            <a href="#membership" className="text-[var(--gs-silver)] hover:text-white transition text-sm font-medium">
              Membership
            </a>
            <a href="#about" className="text-[var(--gs-silver)] hover:text-white transition text-sm font-medium">
              About
            </a>
            <a
              href="#join"
              className="bg-[var(--gs-accent)] hover:bg-[var(--gs-accent-dark)] text-white px-5 py-2 rounded-lg text-sm font-semibold transition"
            >
              Join Now
            </a>
          </nav>

          {/* Mobile menu button */}
          <button
            className="md:hidden text-white"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Nav */}
        {menuOpen && (
          <div className="md:hidden pb-4 space-y-2">
            <a href="#why" className="block text-[var(--gs-silver)] hover:text-white py-2 text-sm">Why Credential</a>
            <a href="#disciplines" className="block text-[var(--gs-silver)] hover:text-white py-2 text-sm">Disciplines</a>
            <a href="#membership" className="block text-[var(--gs-silver)] hover:text-white py-2 text-sm">Membership</a>
            <a href="#about" className="block text-[var(--gs-silver)] hover:text-white py-2 text-sm">About</a>
            <a href="#join" className="block bg-[var(--gs-accent)] text-white text-center py-2 rounded-lg text-sm font-semibold mt-2">Join Now</a>
          </div>
        )}
      </div>
    </header>
  );
}
