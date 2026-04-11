import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Grey Sky Responder Society',
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left panel — brand panel (desktop only) */}
      <div className="hidden lg:flex lg:w-1/2 bg-[var(--gs-navy)] flex-col items-center justify-center p-12">
        <div className="max-w-md text-center">
          {/* Logo placeholder */}
          <div className="inline-flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded bg-[var(--gs-gold)] flex items-center justify-center">
              <svg
                className="w-7 h-7 text-[var(--gs-navy)]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
            </div>
            <span className="text-2xl font-bold text-white tracking-tight">
              Grey Sky
            </span>
          </div>
          <h2 className="text-xl font-semibold text-white mb-4">
            Responder Society
          </h2>
          <p className="text-[var(--gs-silver)] text-lg leading-relaxed">
            Verified credibility for emergency responders
          </p>
        </div>
      </div>

      {/* Mobile header */}
      <div className="lg:hidden bg-[var(--gs-navy)] px-6 py-8 text-center">
        <div className="inline-flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded bg-[var(--gs-gold)] flex items-center justify-center">
            <svg
              className="w-6 h-6 text-[var(--gs-navy)]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
          </div>
          <span className="text-xl font-bold text-white tracking-tight">
            Grey Sky
          </span>
        </div>
        <p className="text-sm text-[var(--gs-silver)]">
          Verified credibility for emergency responders
        </p>
      </div>

      {/* Right panel — form area */}
      <div className="flex-1 flex items-center justify-center bg-white px-6 py-12">
        <div className="w-full max-w-md">
          {children}
          <p className="mt-8 text-center text-xs text-[var(--gs-steel)]">
            &copy; {new Date().getFullYear()} Longview Solutions Group LLC
          </p>
        </div>
      </div>
    </div>
  );
}
