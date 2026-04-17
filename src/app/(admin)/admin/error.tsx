'use client';

import { useEffect } from 'react';

export default function AdminHomeError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[admin/home] render error', error);
  }, [error]);

  return (
    <div className="max-w-xl mx-auto mt-12 bg-white rounded-lg border border-red-200 p-6 text-center">
      <h1 className="text-lg font-semibold text-[#0A1628]">
        Something went wrong loading the admin dashboard
      </h1>
      <p className="mt-2 text-sm text-gray-600">
        {error.message || 'An unexpected error occurred.'}
      </p>
      <button
        onClick={reset}
        className="mt-4 inline-block px-4 py-2 bg-[#0A1628] text-white text-sm font-semibold rounded hover:bg-[#C5933A] hover:text-[#0A1628] transition-colors"
      >
        Try again
      </button>
    </div>
  );
}
