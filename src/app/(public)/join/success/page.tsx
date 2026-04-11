"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function JoinSuccessPage() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => router.push("/dashboard"), 3000);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen bg-[var(--gs-navy)] flex items-center justify-center px-4">
      <div className="text-center text-white max-w-md">
        <div className="w-16 h-16 rounded-full bg-[var(--gs-gold)] flex items-center justify-center mx-auto mb-6">
          <svg
            className="w-8 h-8 text-[var(--gs-navy)]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={3}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h1 className="text-3xl font-bold mb-4">Welcome to Grey Sky.</h1>
        <p className="text-[var(--gs-silver)] text-lg mb-4">
          Your account is created. Your record starts now.
        </p>
        <p className="text-[var(--gs-steel)] text-sm">
          Taking you to your dashboard&hellip;
        </p>
      </div>
    </div>
  );
}
