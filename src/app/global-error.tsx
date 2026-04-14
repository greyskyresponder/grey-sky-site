'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body style={{ fontFamily: 'system-ui, sans-serif', padding: '2rem' }}>
        <h1 style={{ color: '#c0392b' }}>Something went wrong</h1>
        <pre style={{ whiteSpace: 'pre-wrap', color: '#555', fontSize: '0.875rem' }}>
          {error.message}
        </pre>
        {error.digest && (
          <p style={{ color: '#888', fontSize: '0.75rem' }}>Digest: {error.digest}</p>
        )}
        <button
          onClick={reset}
          style={{
            marginTop: '1rem',
            padding: '0.5rem 1rem',
            background: '#0A1628',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Try again
        </button>
      </body>
    </html>
  );
}
