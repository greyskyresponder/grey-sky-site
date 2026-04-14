// GSR-DOC-900: Security headers + CSP builder.

// Flip to false after the CSP validation period.
export const REPORT_ONLY = true;

const CSP_DIRECTIVES: Record<string, string[]> = {
  'default-src': ["'self'"],
  'script-src': ["'self'", "'unsafe-inline'"],
  'style-src': ["'self'", "'unsafe-inline'"],
  'img-src': ["'self'", 'data:', 'blob:', '*.supabase.co'],
  'font-src': ["'self'", 'fonts.gstatic.com'],
  'connect-src': ["'self'", '*.supabase.co', 'api.stripe.com'],
  'frame-src': ["'none'"],
  'object-src': ["'none'"],
  'base-uri': ["'self'"],
  'form-action': ["'self'"],
  'frame-ancestors': ["'none'"],
  'upgrade-insecure-requests': [],
};

export function getSecurityHeaders(): Record<string, string> {
  return {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '0',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    'Strict-Transport-Security':
      'max-age=63072000; includeSubDomains; preload',
  };
}

export function getCspHeader(reportOnly: boolean = REPORT_ONLY): {
  name: string;
  value: string;
} {
  const value = Object.entries(CSP_DIRECTIVES)
    .map(([directive, sources]) =>
      sources.length > 0 ? `${directive} ${sources.join(' ')}` : directive,
    )
    .join('; ');

  return {
    name: reportOnly
      ? 'Content-Security-Policy-Report-Only'
      : 'Content-Security-Policy',
    value,
  };
}

export function applySecurityHeaders(headers: Headers): void {
  const secHeaders = getSecurityHeaders();
  for (const [name, value] of Object.entries(secHeaders)) {
    headers.set(name, value);
  }
  const csp = getCspHeader();
  headers.set(csp.name, csp.value);
}
