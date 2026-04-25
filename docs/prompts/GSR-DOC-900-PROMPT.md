# BUILD: GSR-DOC-900 — Security Hardening

| Field | Value |
|-------|-------|
| Doc ID | GSR-DOC-900 |
| Phase | 9 — Cross-Cutting |
| Priority | Critical |
| Dependencies | GSR-DOC-004 (Scaffolding) ✅ |
| Parallel Safe | ⚠️ Run AFTER DOC-205 migration merges (migration file ordering) |

---

## Context

Read `CLAUDE.md` at the repo root before starting. This is a Next.js 16 + Supabase application. Brand colors: Command Navy `#0A1628`, Signal Gold `#C5933A`, Ops White `#F5F5F5`.

**Threat model:** This platform holds PII, legal attestations, deployment histories, and credentialing data for professionals who deploy to national-security-level incidents. Security design assumes state-sponsored adversaries, not opportunistic attackers.

---

## What You Are Building

MFA enrollment with Supabase Auth TOTP, security headers (CSP, HSTS, X-Frame-Options, etc.), CORS lockdown, rate limiting on auth and API routes, input sanitization, anomaly detection logging, and audit log hash chain integrity.

## Prerequisites (already exist)

- Supabase Auth with login/register/reset at `src/lib/auth/actions.ts`
- Middleware at `src/middleware.ts` with route protection and role enforcement
- MFA placeholder toggle at `src/components/auth/mfa-toggle.tsx`
- Audit log table in `supabase/migrations/20260409000003_core_tables.sql` with append-only trigger
- Dashboard settings area accessible from sidebar
- Brand: Command Navy `#0A1628`, Signal Gold `#C5933A`, Ops White `#F5F5F5`

---

## Step 1: Migration

Create `supabase/migrations/20260413000003_security_hardening.sql`:

```sql
-- Add hash chain columns to audit_log
ALTER TABLE audit_log ADD COLUMN previous_hash TEXT;
ALTER TABLE audit_log ADD COLUMN entry_hash TEXT;

-- Hash chain computation function
CREATE OR REPLACE FUNCTION compute_audit_hash()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_previous_hash TEXT;
  v_payload TEXT;
BEGIN
  -- Get the most recent hash
  SELECT entry_hash INTO v_previous_hash
  FROM audit_log
  ORDER BY created_at DESC, id DESC
  LIMIT 1;

  IF v_previous_hash IS NULL THEN
    v_previous_hash := 'GENESIS';
  END IF;

  NEW.previous_hash := v_previous_hash;

  -- Build payload: previous_hash + action + actor_id + target_type + target_id + timestamp
  v_payload := v_previous_hash || '|'
    || COALESCE(NEW.action, '') || '|'
    || COALESCE(NEW.actor_id::TEXT, '') || '|'
    || COALESCE(NEW.target_type, '') || '|'
    || COALESCE(NEW.target_id::TEXT, '') || '|'
    || NEW.created_at::TEXT;

  NEW.entry_hash := encode(digest(v_payload, 'sha256'), 'hex');

  RETURN NEW;
END;
$$;

CREATE TRIGGER audit_log_hash_chain
  BEFORE INSERT ON audit_log
  FOR EACH ROW
  EXECUTE FUNCTION compute_audit_hash();

-- Security anomaly index
CREATE INDEX idx_audit_log_security
  ON audit_log(action)
  WHERE action = 'security_anomaly';
```

**Note:** This requires the `pgcrypto` extension which should already exist from Phase 0 migrations. If not, add `CREATE EXTENSION IF NOT EXISTS pgcrypto;` at the top.

---

## Step 2: Security Headers

Create `src/lib/security/headers.ts`:

```typescript
export const REPORT_ONLY = true; // Flip to false after validation period

export function getSecurityHeaders(): Record<string, string> {
  return {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '0', // Disabled — CSP replaces this
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=(self), payment=(self)',
  };
}

export function getCspHeader(reportOnly: boolean = REPORT_ONLY): string {
  const directives = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // Next.js requires unsafe-inline/eval
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: blob: https://*.supabase.co",
    "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.stripe.com",
    "frame-src 'self' https://js.stripe.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ];

  return directives.join('; ');
}
```

The header name should be `Content-Security-Policy-Report-Only` when `reportOnly` is true, `Content-Security-Policy` when false.

---

## Step 3: Rate Limiter

Create `src/lib/security/rate-limiter.ts`:

- In-memory token bucket implementation
- `RateLimiter` class with `check(key: string, config: RateLimitConfig): { allowed: boolean, retryAfter?: number }`
- Cleanup stale entries every 5 minutes
- Rate limit configs:
  - Auth login: 5 attempts per 15 minutes per IP
  - Auth register: 3 attempts per hour per IP
  - Auth reset: 3 attempts per hour per IP
  - API general: 100 requests per minute per user
  - Coin transactions: 10 per minute per user
- Export `rateLimiter` singleton instance

---

## Step 4: Input Sanitization

Create `src/lib/security/sanitize.ts`:

```typescript
export function sanitizeTextInput(input: string): string {
  // Strip HTML tags
  let clean = input.replace(/<[^>]*>/g, '');
  // Strip javascript: URIs
  clean = clean.replace(/javascript:/gi, '');
  // Strip event handlers
  clean = clean.replace(/on\w+\s*=/gi, '');
  return clean.trim();
}

export function sanitizeFilename(filename: string): string {
  // Allow only alphanumeric, dash, underscore, dot
  return filename
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/\.{2,}/g, '.') // prevent path traversal
    .substring(0, 255);
}

export function sanitizeObject(obj: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      result[key] = sanitizeTextInput(value);
    } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      result[key] = sanitizeObject(value as Record<string, unknown>);
    } else {
      result[key] = value;
    }
  }
  return result;
}
```

---

## Step 5: Anomaly Detection

Create `src/lib/security/anomaly.ts`:

- `AnomalyType` enum: `rapid_login_failure`, `impossible_travel`, `credential_stuffing`, `rapid_coin_spend`, `unusual_api_pattern`, `session_anomaly`
- `logAnomaly(type: AnomalyType, context: Record<string, unknown>, actorId?: string): Promise<void>` — writes to `audit_log` with action `security_anomaly`
- `checkLoginAnomaly(email: string, ip: string): Promise<AnomalyType | null>` — checks recent login failures (5+ in 15 min → `rapid_login_failure`)
- `checkCoinAnomaly(userId: string): Promise<AnomalyType | null>` — checks rapid spend patterns (10+ transactions in 1 min → `rapid_coin_spend`)
- In-memory tracking maps with TTL cleanup

---

## Step 6: Middleware Update

Update `src/middleware.ts` — integrate all security controls. **Order matters:**

1. Apply security headers to ALL responses (first)
2. Apply CSP header to ALL responses
3. Check CORS on API routes — reject non-allowed origins with 403
4. Apply rate limiting on auth routes (`/login`, `/register`, `/reset-password`) and API routes
5. Existing session validation and role enforcement (unchanged)
6. Add MFA challenge check: if user has MFA enrolled and accessing sensitive routes, verify MFA factor

Allowed CORS origins: `greysky.dev`, `www.greysky.dev`, `localhost:3000` (dev only based on env).

---

## Step 7: MFA Components

**MfaEnroll** (`src/components/auth/MfaEnroll.tsx`):
- Client component (`'use client'`)
- Call `supabase.auth.mfa.enroll({ factorType: 'totp' })` to get QR URI
- Display QR code (install `qrcode.react` or generate inline SVG)
- Input field for 6-digit verification code
- On success: display 10 backup codes, "Download Backup Codes" button (plain text file)
- Error handling for invalid codes

**MfaChallenge** (`src/components/auth/MfaChallenge.tsx`):
- Client component
- Input for 6-digit TOTP code
- "Use a backup code" link → switches to backup code input
- Call `supabase.auth.mfa.challenge()` then `supabase.auth.mfa.verify()`
- Generic error message on failure

**MfaSettings** (`src/components/auth/MfaSettings.tsx`):
- Shows MFA status (enabled/disabled)
- "Enable Two-Factor Authentication" button → triggers MfaEnroll flow
- If enabled: "Disable" button (requires current TOTP code)
- Link to regenerate backup codes (requires current TOTP code)

Update `src/components/auth/mfa-toggle.tsx`:
- Replace disabled placeholder with button navigating to `/dashboard/settings/security`

---

## Step 8: Login Flow Update

Update `src/app/(auth)/login/page.tsx`:
- After successful email/password auth, check MFA enrollment
- Use `supabase.auth.mfa.getAuthenticatorAssuranceLevel()`
- If `currentLevel === 'aal1'` and `nextLevel === 'aal2'` → show MfaChallenge component
- On MFA success → redirect to dashboard
- On MFA failure → error with retry

---

## Step 9: Security Settings Page

Create `src/app/(dashboard)/dashboard/settings/security/page.tsx`:
- Server component, auth-gated
- Renders MfaSettings component
- "Sign out all devices" button
- Page title: "Security Settings"

---

## Step 10: Supabase Client Update

Update `src/lib/supabase/client.ts`:
- Add `flowType: 'pkce'` to auth configuration
- Verify `autoRefreshToken: true` and `persistSession: true` are set

---

## Step 11: Auth Error Messages

Review all auth error messages in `src/lib/auth/actions.ts` and login/register pages:
- Login failure: "Invalid email or password." (never differentiate user-not-found vs wrong-password)
- Registration: "Unable to create account. Please try again." (never reveal if email exists)
- Reset password: "If an account exists with that email, you'll receive reset instructions." (never confirm existence)

---

## Step 12: Verify

- `npm run build` passes with zero errors
- Security headers present on all responses (browser dev tools → Network → Response Headers)
- CSP header present (report-only mode)
- Rate limiting triggers on repeated login attempts (5+ in 15 min)
- MFA enrollment: QR code → verify → backup codes
- MFA challenge on login for enrolled users
- CORS rejects from non-allowed origins
- Audit log hash chain: insert entries, verify sequential hashes
- Auth error messages are generic — no user enumeration

## Commit Message

```
GSR-DOC-900: security hardening — MFA, CSP, CORS, rate limiting, audit hash chain
```
