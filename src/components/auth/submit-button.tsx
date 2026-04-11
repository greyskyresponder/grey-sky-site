'use client';

import { useFormStatus } from 'react-dom';

export function SubmitButton({
  children,
  pendingText,
}: {
  children: React.ReactNode;
  pendingText: string;
}) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full py-2.5 px-4 bg-[var(--gs-navy)] text-white font-semibold rounded transition-colors hover:bg-[var(--gs-gold)] hover:text-[var(--gs-navy)] disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {pending ? (
        <span className="inline-flex items-center gap-2">
          <svg
            className="animate-spin h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
          {pendingText}
        </span>
      ) : (
        children
      )}
    </button>
  );
}
