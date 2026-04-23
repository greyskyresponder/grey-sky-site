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
          <div
            className="text-4xl font-semibold text-white tracking-[0.22em] uppercase mb-4"
            style={{ fontFamily: 'var(--gs-font-heading)' }}
          >
            Grey Sky
          </div>
          <div
            className="text-sm text-[var(--gs-silver)] tracking-[0.3em] uppercase mb-8"
            style={{ fontFamily: 'var(--gs-font-heading)' }}
          >
            Responder Society
          </div>
          <p className="text-[var(--gs-silver)] text-lg leading-relaxed">
            Verified credibility for emergency responders
          </p>
        </div>
      </div>

      {/* Mobile header */}
      <div className="lg:hidden bg-[var(--gs-navy)] px-6 py-8 text-center">
        <div
          className="text-2xl font-semibold text-white tracking-[0.22em] uppercase mb-1"
          style={{ fontFamily: 'var(--gs-font-heading)' }}
        >
          Grey Sky
        </div>
        <div
          className="text-xs text-[var(--gs-silver)] tracking-[0.3em] uppercase mb-2"
          style={{ fontFamily: 'var(--gs-font-heading)' }}
        >
          Responder Society
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
