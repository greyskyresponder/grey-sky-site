"use client";

import { useState } from "react";

export default function WaitlistForm({ className = "" }: { className?: string }) {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (email) {
      setSubmitted(true);
      setEmail("");
    }
  }

  if (submitted) {
    return (
      <div className={`text-center ${className}`}>
        <div className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[var(--gs-gold)]/10 border border-[var(--gs-gold)]/30">
          <svg className="w-5 h-5 text-[var(--gs-gold)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span className="text-[var(--gs-gold)] font-medium">You&apos;re on the list. We&apos;ll be in touch.</span>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={`flex flex-col sm:flex-row gap-3 max-w-md mx-auto ${className}`}>
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="your.email@agency.gov"
        className="flex-1 px-4 py-3 rounded-lg border border-[var(--gs-steel)]/30 bg-white/10 text-white placeholder:text-[var(--gs-silver)] focus:outline-none focus:ring-2 focus:ring-[var(--gs-gold)]/50 focus:border-[var(--gs-gold)]"
      />
      <button
        type="submit"
        className="px-6 py-3 rounded-lg bg-[var(--gs-gold)] text-[var(--gs-navy)] font-semibold hover:bg-[var(--gs-gold-light)] transition-colors whitespace-nowrap"
      >
        Join the Waitlist
      </button>
    </form>
  );
}
