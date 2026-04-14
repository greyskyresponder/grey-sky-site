---
doc_id: GSR-DOC-900
title: "Security Hardening"
phase: 9
status: approved
blocks_on:
  - GSR-DOC-004
priority: critical
author: Architecture Agent (Claude App)
created: 2026-04-13
updated: 2026-04-13
notes: >
  Nation-state threat model. This platform holds PII, legal attestations,
  deployment histories, and credentialing data for professionals who deploy
  to national-security-level incidents. The verified responder registry is
  a high-value intelligence target.
---

# GSR-DOC-900: Security Hardening

| Field | Value |
|-------|-------|
| Phase | 9 (Cross-Cutting) |
| Status | approved |
| Blocks on | GSR-DOC-004 (Scaffolding) ✅ |
| Priority | critical |

---

## Purpose

This platform holds PII, legal attestations, deployment histories, and credentialing data for professionals who deploy to national-security-level incidents. The verified responder registry is a high-value intelligence target. Security design assumes state-sponsored adversaries, not opportunistic attackers.

**This doc builds:**
- MFA enrollment via Supabase Auth TOTP (completing the DOC-200 deferred placeholder)
- Content Security Policy (CSP) headers
- CORS lockdown
- CSRF protection
- Rate limiting on auth endpoints and API routes
- Input sanitization defense-in-depth layer
- Security headers via Next.js middleware
- Session security hardening
- Anomaly detection foundation (login patterns, coin transactions)
- Attack surface inventory and mitigation checklist
- Audit log integrity verification

**What it does NOT build:**
- Stripe Identity verification (deferred to Phase 5, per OD-02)
- Full intrusion detection system (requires ATLAS — DOC-300)
- Penetration testing (external engagement, not a build doc)
- SOC 2 compliance documentation (governance, not code)

**Why it matters:**
A compromised responder registry could enable credential forgery, identity theft against deployed personnel, social engineering of emergency management agencies, or disruption of disaster response coordination. The attack surface includes: responder PII, deployment locations (operational security), supervisor contact information, legal attestation records, and credential verification endpoints. Every feature built without security hardening is technical debt measured in risk, not hours.

---

## Threat Model

### Adversary Profiles

| Adversary | Capability | Objective | Likelihood |
|-----------|-----------|-----------|-----------|
| Nation-state APT | Full spectrum | Intelligence on deployed personnel, credential forgery, response disruption | Medium |
| Organized crime | Social engineering, phishing | Identity theft, credential fraud for employment | High |
| Disgruntled insider | Legitimate access, knowledge of systems | Data exfiltration, record manipulation | Medium |
| Opportunistic attacker | Automated scanning, known exploits | Data harvesting, ransomware | High |

### Critical Assets

| Asset | Classification | Impact if Compromised |
|-------|---------------|----------------------|
| Responder PII (name, email, phone, location) | SENSITIVE | Identity theft, operational security breach |
| Deployment records (where, when, what role) | SENSITIVE | OPSEC — reveals response patterns and personnel movements |
| Legal attestations (validation/evaluation forms) | RESTRICTED | Attestation forgery undermines entire trust model |
| Credential verification data | RESTRICTED | Credential forgery enables unqualified personnel in critical roles |
| Sky Coins ledger | INTERNAL | Financial manipulation, service denial |
| Supervisor contact information | SENSITIVE | Social engineering vector into emergency management agencies |
| Session tokens | RESTRICTED | Account takeover |
| Audit logs | RESTRICTED | Evidence tampering |

---

## Security Controls

### 1. MFA Enrollment (TOTP)

Complete the DOC-200 deferred MFA placeholder. Use Supabase Auth built-in TOTP support.

**Implementation:**
- Supabase Auth supports TOTP via `supabase.auth.mfa.enroll()`, `challenge()`, `verify()`
- Dashboard settings page: MFA enrollment flow with QR code display
- Backup codes generated on enrollment (10 codes, one-time use)
- MFA required for: platform_admin role (enforced), recommended for all members
- MFA challenge on login when enrolled
- MFA challenge on sensitive actions: password change, email change, document deletion

**Database:**
```sql
-- Supabase Auth handles MFA storage internally via auth.mfa_factors and auth.mfa_challenges
-- No additional tables needed
-- Update the existing MFA toggle component to use real Supabase MFA APIs
```

**UI Components:**
- `src/components/auth/MfaEnroll.tsx` — QR code display, verification code input, backup codes download
- `src/components/auth/MfaChallenge.tsx` — TOTP code input during login or sensitive actions
- `src/components/auth/MfaSettings.tsx` — Enable/disable, view backup codes, regenerate
- Update `src/components/auth/mfa-toggle.tsx` — Replace placeholder with real enrollment trigger

### 2. Content Security Policy (CSP)

**Implementation via Next.js middleware:**

```typescript
// Applied in src/middleware.ts
const cspDirectives = {
  'default-src': ["'self'"],
  'script-src': ["'self'", "'unsafe-inline'"],  // unsafe-inline needed for Next.js hydration
  'style-src': ["'self'", "'unsafe-inline'"],    // Tailwind requires inline styles
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
```

**CSP Report-Only mode first** — deploy with `Content-Security-Policy-Report-Only` header for 2 weeks to identify violations before enforcing.

### 3. Security Headers

All responses include these headers via Next.js middleware:

```typescript
const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '0',  // Modern browsers — rely on CSP instead
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
};
```

### 4. CORS Configuration

```typescript
// src/middleware.ts — CORS handling
const allowedOrigins = [
  process.env.NEXT_PUBLIC_SITE_URL,           // greysky.dev
  process.env.NEXT_PUBLIC_VERIFICATION_URL,   // greyskyresponder.net (when active)
];

// API routes only respond to allowed origins
// No wildcard origins in production
// Credentials: true (for Supabase Auth cookies)
// Methods: GET, POST, PUT, DELETE, OPTIONS
// Max-Age: 86400 (24 hours)
```

### 5. Rate Limiting

**Implementation:** Use an in-memory rate limiter for Azure Static Web Apps (no Redis dependency at this stage). Upgrade to Redis-backed when traffic justifies.

```typescript
// src/lib/security/rate-limiter.ts
// Token bucket algorithm with IP + user ID composite key

const RATE_LIMITS = {
  // Auth endpoints — strict
  'auth/login':       { windowMs: 15 * 60 * 1000, max: 5 },    // 5 per 15 min per IP
  'auth/register':    { windowMs: 60 * 60 * 1000, max: 3 },    // 3 per hour per IP
  'auth/reset':       { windowMs: 60 * 60 * 1000, max: 3 },    // 3 per hour per IP

  // API endpoints — moderate
  'api/default':      { windowMs: 60 * 1000, max: 100 },       // 100 per minute per user
  'api/upload':       { windowMs: 60 * 1000, max: 10 },        // 10 uploads per minute
  'api/coins/spend':  { windowMs: 60 * 1000, max: 20 },        // 20 transactions per minute

  // Public endpoints — lenient
  'public/verify':    { windowMs: 60 * 1000, max: 30 },        // 30 per minute per IP
  'public/validate':  { windowMs: 60 * 1000, max: 10 },        // 10 per minute per IP
};
```

**Response on limit exceeded:** HTTP 429 with `Retry-After` header. Body: `{ error: 'Too many requests. Please try again later.' }`. Do NOT leak remaining attempts count.

### 6. Session Security

**Supabase Auth session hardening:**

```typescript
// src/lib/supabase/client.ts — client configuration
const supabase = createClient(url, anonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce',  // Proof Key for Code Exchange — prevents auth code interception
  },
});
```

**Additional session controls:**
- Session duration: 1 hour access token, 7 day refresh token (Supabase defaults)
- Refresh token rotation: enabled (each refresh invalidates the previous token)
- Session validation on every protected route via middleware
- Logout clears all sessions (not just current device) for security-critical actions

### 7. Input Sanitization (Defense-in-Depth)

Zod validation is the primary gate. This adds a secondary layer.

```typescript
// src/lib/security/sanitize.ts

// Strip HTML from all text inputs (defense-in-depth — Zod should catch, this backstops)
export function sanitizeTextInput(input: string): string {
  return input
    .replace(/<[^>]*>/g, '')          // Strip HTML tags
    .replace(/javascript:/gi, '')     // Strip javascript: URIs
    .replace(/on\w+\s*=/gi, '')       // Strip event handlers
    .trim();
}

// Validate and sanitize filenames
export function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-zA-Z0-9._-]/g, '_')  // Replace special chars
    .replace(/\.{2,}/g, '.')             // No path traversal
    .substring(0, 255);                  // Length limit
}
```

Applied via middleware on all POST/PUT request bodies before they reach route handlers.

### 8. Anomaly Detection Foundation

Not a full IDS — a lightweight pattern monitor that logs suspicious activity for manual review.

```typescript
// src/lib/security/anomaly.ts

export type AnomalyType =
  | 'rapid_login_failures'         // >3 failed logins in 5 minutes
  | 'unusual_location'             // Login from new country (requires GeoIP — deferred)
  | 'rapid_coin_spend'             // >10 coin transactions in 1 minute
  | 'bulk_document_download'       // >20 document accesses in 5 minutes
  | 'validation_flood'             // >10 validation requests in 1 hour
  | 'admin_action_outside_hours'   // Admin actions between 12am-6am ET
  | 'credential_enumeration';      // Sequential user ID probing on verify endpoint

// Anomalies are logged to audit_log with action = 'security_anomaly'
// No automated blocking at this stage — alert only
// ATLAS (DOC-300) will add automated response
```

**Database:**
```sql
-- Extend audit_log usage — no new tables needed
-- Anomalies logged as: action = 'security_anomaly', details_json includes anomaly_type, context
-- Query for anomalies:
CREATE INDEX IF NOT EXISTS idx_audit_log_security ON audit_log(action) WHERE action = 'security_anomaly';
```

### 9. Audit Log Integrity

The `audit_log` table is append-only (enforced by existing trigger from DOC-002). Add integrity verification:

```sql
-- Add hash chain column for tamper evidence
ALTER TABLE audit_log ADD COLUMN IF NOT EXISTS previous_hash TEXT;
ALTER TABLE audit_log ADD COLUMN IF NOT EXISTS entry_hash TEXT;

-- Hash function: SHA-256 of (previous_hash + actor_id + action + entity_type + entity_id + created_at)
-- Computed by database trigger on INSERT
CREATE OR REPLACE FUNCTION compute_audit_hash()
RETURNS TRIGGER AS $$
DECLARE
  v_previous_hash TEXT;
BEGIN
  -- Get the hash of the most recent entry
  SELECT entry_hash INTO v_previous_hash
  FROM audit_log
  ORDER BY created_at DESC, id DESC
  LIMIT 1;

  IF v_previous_hash IS NULL THEN
    v_previous_hash := 'GENESIS';
  END IF;

  NEW.previous_hash := v_previous_hash;
  NEW.entry_hash := encode(
    sha256(
      convert_to(
        v_previous_hash || '|' ||
        COALESCE(NEW.actor_id::text, 'system') || '|' ||
        NEW.action || '|' ||
        COALESCE(NEW.entity_type, '') || '|' ||
        COALESCE(NEW.entity_id::text, '') || '|' ||
        NEW.created_at::text,
        'UTF8'
      )
    ),
    'hex'
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER audit_log_hash_chain
  BEFORE INSERT ON audit_log
  FOR EACH ROW
  EXECUTE FUNCTION compute_audit_hash();
```

### 10. Middleware Integration

All security controls are integrated via Next.js middleware:

```typescript
// src/middleware.ts — updated structure
//
// 1. Security headers (all responses)
// 2. CSP header (all responses)
// 3. CORS validation (API routes)
// 4. Rate limiting (auth + API routes)
// 5. Session validation (protected routes)
// 6. Role enforcement (admin/org routes)
// 7. MFA challenge check (sensitive routes, if enrolled)
```

---

## Structure

### New Files

```
src/lib/security/rate-limiter.ts       — Token bucket rate limiter
src/lib/security/headers.ts            — Security headers + CSP builder
src/lib/security/sanitize.ts           — Input sanitization helpers
src/lib/security/anomaly.ts            — Anomaly detection + logging
src/lib/security/audit.ts              — Audit log integrity verification helper
src/components/auth/MfaEnroll.tsx       — MFA enrollment with QR code
src/components/auth/MfaChallenge.tsx    — TOTP code input
src/components/auth/MfaSettings.tsx     — MFA management in dashboard settings
src/app/(dashboard)/dashboard/settings/security/page.tsx — Security settings (MFA, sessions)
supabase/migrations/20260413000003_security_hardening.sql — Audit hash chain, anomaly index
```

### Modified Files

```
src/middleware.ts                       — Add security headers, CSP, CORS, rate limiting
src/components/auth/mfa-toggle.tsx      — Replace placeholder with real MFA enrollment trigger
src/lib/supabase/client.ts             — Add PKCE flow type
src/app/(auth)/login/page.tsx          — Add MFA challenge step
```

---

## Business Rules

1. **MFA is required for platform_admin.** Admin users who have not enrolled in MFA are redirected to enrollment on every login. They cannot access admin routes without MFA.

2. **MFA is recommended for all members.** Dashboard shows a persistent (dismissible) banner encouraging MFA enrollment. Not enforced.

3. **MFA challenge on sensitive actions.** Even if the user has a valid session, these actions require a fresh MFA challenge: password change, email change, bulk document deletion (>5), admin role changes. If MFA is not enrolled, these actions proceed without challenge.

4. **Rate limits are per-IP for unauthenticated endpoints and per-user for authenticated endpoints.** Composite key prevents both IP-level brute force and account-level abuse.

5. **CSP starts in report-only mode.** Set `Content-Security-Policy-Report-Only` for the first deployment. After 2 weeks with no false positives, switch to enforcing `Content-Security-Policy`.

6. **Anomaly detection is alert-only.** No automated blocking. Anomalies are logged to `audit_log` with `action = 'security_anomaly'`. ATLAS (DOC-300) will add automated response when deployed.

7. **Audit log hash chain is append-only.** The `compute_audit_hash` trigger runs on every INSERT. The chain can be verified by any party with read access by recomputing hashes sequentially and comparing.

8. **No security information in error responses.** Auth failures return generic messages: "Invalid email or password" (never "user not found" vs "wrong password"). Rate limit responses do not leak remaining attempt counts. API errors do not expose stack traces or internal state.

9. **CORS is strict.** Only `greysky.dev` and `greyskyresponder.net` (when active) are allowed origins. No wildcard. No localhost in production.

10. **HSTS preload.** The `Strict-Transport-Security` header includes `preload` directive. Submit to HSTS preload list after launch.

---

## Copy Direction

**MFA enrollment:** "Protect your account with two-factor authentication. You'll need an authenticator app like Google Authenticator or Authy." Direct, practical, no fear-based language.

**MFA challenge:** "Enter the 6-digit code from your authenticator app." Simple instruction.

**Backup codes:** "Save these backup codes in a safe place. Each code can only be used once. If you lose access to your authenticator app, use a backup code to sign in."

**Rate limit error:** "Too many requests. Please try again in a few minutes." No countdown, no remaining attempts.

**Auth errors:** "Invalid email or password." Never differentiate between "user not found" and "wrong password."

---

## Acceptance Criteria

1. MFA enrollment works end-to-end: QR code display → authenticator app scan → verification code → enrollment confirmed → backup codes displayed
2. MFA challenge appears on login for enrolled users and is validated correctly
3. MFA is enforced for platform_admin role — cannot bypass
4. CSP header is present on all responses (report-only mode initially)
5. Security headers (X-Content-Type-Options, X-Frame-Options, HSTS, Referrer-Policy, Permissions-Policy) present on all responses
6. CORS rejects requests from non-allowed origins on API routes
7. Rate limiting triggers on auth endpoints after threshold (5 login attempts / 15 min)
8. Rate limiting returns 429 with Retry-After header, no information leakage
9. Input sanitization strips HTML from text inputs as defense-in-depth
10. Anomaly detection logs suspicious patterns to audit_log
11. Audit log hash chain computes on every INSERT and can be verified by sequential recomputation
12. Auth error messages are generic — no user enumeration possible
13. Security settings page at `/dashboard/settings/security` allows MFA enrollment/management
14. `npm run build` passes with zero errors

---

## Agent Lenses

### Baseplate (data/schema)
- Audit log hash chain uses SHA-256 with previous hash concatenation — standard tamper-evidence pattern
- No new tables — extends existing `audit_log` with hash columns
- Rate limiter uses in-memory store — appropriate for single-instance Azure SWA deployment, upgrade to Redis when scaling

### Meridian (doctrine)
- Threat model is calibrated to the actual asset classification — not generic "web app security"
- MFA aligns with NIST SP 800-63B Level 2 assurance (memorized secret + TOTP)
- Audit log integrity supports the legal attestation chain — tampered logs undermine the entire trust model

### Lookout (UX)
- MFA enrollment is a guided flow, not a settings toggle buried in preferences
- Security should not create friction for legitimate users — rate limits are generous for normal use
- Error messages are helpful without being informative to attackers
- Backup codes are downloadable as a text file — practical for responders who may not have password managers

### Threshold (security)
- Defense-in-depth: RLS (database) + middleware (application) + CSP (browser) + rate limiting (network)
- No single point of failure in the auth chain
- Hash chain on audit log provides tamper evidence without requiring external infrastructure
- PKCE flow prevents auth code interception attacks
- Generic error messages prevent user enumeration

---

## Claude Code Prompt

You are building security hardening for the Grey Sky Responder Society portal. This is a Next.js 16 + Supabase application.

### What You Are Building

MFA enrollment with Supabase Auth TOTP, security headers (CSP, HSTS, X-Frame-Options, etc.), CORS lockdown, rate limiting on auth and API routes, input sanitization, anomaly detection logging, and audit log hash chain integrity.

### Prerequisites

The following already exist:
- Supabase Auth with login/register/reset at `src/lib/auth/actions.ts`
- Middleware at `src/middleware.ts` with route protection and role enforcement
- MFA placeholder toggle at `src/components/auth/mfa-toggle.tsx`
- Audit log table in `supabase/migrations/20260409000003_core_tables.sql` with append-only trigger
- Dashboard settings area accessible from sidebar
- Brand: Command Navy `#0A1628`, Signal Gold `#C5933A`, Ops White `#F5F5F5`

### Step 1: Migration

Create `supabase/migrations/20260413000003_security_hardening.sql`:
1. Add `previous_hash TEXT` and `entry_hash TEXT` columns to `audit_log`
2. Create `compute_audit_hash()` function as specified — SHA-256 chain with previous hash
3. Create `audit_log_hash_chain` BEFORE INSERT trigger
4. Create index `idx_audit_log_security` on `audit_log(action) WHERE action = 'security_anomaly'`

### Step 2: Security Headers

Create `src/lib/security/headers.ts`:
- `getSecurityHeaders(): Record<string, string>` — returns all security headers
- `getCspHeader(reportOnly: boolean): string` — builds CSP directive string
- CSP directives as specified: self for most, unsafe-inline for script/style (Next.js requirement), Supabase and Stripe domains for connect-src
- Export `REPORT_ONLY = true` constant — flip to `false` after validation period

### Step 3: Rate Limiter

Create `src/lib/security/rate-limiter.ts`:
- In-memory token bucket implementation
- `RateLimiter` class with `check(key: string, limit: RateLimit): { allowed: boolean, retryAfter?: number }`
- Cleanup stale entries every 5 minutes
- Rate limit configs as specified in the Security Controls section
- Export `rateLimiter` singleton instance

### Step 4: Input Sanitization

Create `src/lib/security/sanitize.ts`:
- `sanitizeTextInput(input: string): string` — strips HTML, javascript: URIs, event handlers
- `sanitizeFilename(filename: string): string` — allows only safe characters, prevents path traversal
- `sanitizeObject(obj: Record<string, unknown>): Record<string, unknown>` — recursively sanitizes all string values

### Step 5: Anomaly Detection

Create `src/lib/security/anomaly.ts`:
- `AnomalyType` enum as specified
- `logAnomaly(type: AnomalyType, context: Record<string, unknown>, actorId?: string): Promise<void>` — writes to audit_log
- `checkLoginAnomaly(email: string, ip: string): Promise<AnomalyType | null>` — checks recent login failures
- `checkCoinAnomaly(userId: string): Promise<AnomalyType | null>` — checks rapid spend patterns
- In-memory tracking of recent events for pattern detection

### Step 6: Middleware Update

Update `src/middleware.ts` to integrate all security controls:
1. Apply security headers to ALL responses (first thing in middleware)
2. Apply CSP header to ALL responses
3. Check CORS on API routes — reject non-allowed origins with 403
4. Apply rate limiting on auth routes (`/login`, `/register`, `/reset-password`) and API routes
5. Existing session validation and role enforcement (unchanged)
6. Add MFA challenge check: if user has MFA enrolled and is accessing sensitive routes, verify MFA factor

Order matters — headers first, then CORS, then rate limit, then auth, then role, then MFA.

### Step 7: MFA Components

**MfaEnroll** (`src/components/auth/MfaEnroll.tsx`):
- Call `supabase.auth.mfa.enroll({ factorType: 'totp' })` to get QR code URI
- Display QR code using a QR code library (install `qrcode.react` or generate SVG)
- Input field for 6-digit verification code
- On verification success: display 10 backup codes, prompt to download as text file
- Error handling for invalid codes

**MfaChallenge** (`src/components/auth/MfaChallenge.tsx`):
- Input for 6-digit TOTP code
- "Use a backup code" link that switches to backup code input
- Call `supabase.auth.mfa.challenge()` then `supabase.auth.mfa.verify()` flow
- Error handling with generic message

**MfaSettings** (`src/components/auth/MfaSettings.tsx`):
- Shows MFA status (enabled/disabled)
- "Enable Two-Factor Authentication" button → triggers MfaEnroll flow
- If enabled: "Disable" button (requires current TOTP code to disable)
- Link to regenerate backup codes (requires current TOTP code)

Update `src/components/auth/mfa-toggle.tsx`:
- Replace the disabled placeholder with a button that navigates to `/dashboard/settings/security`
- Or inline the MfaSettings component if the toggle is used in a settings context

### Step 8: Login Flow Update

Update `src/app/(auth)/login/page.tsx`:
- After successful email/password authentication, check if user has MFA enrolled
- Use `supabase.auth.mfa.getAuthenticatorAssuranceLevel()` to determine if MFA challenge is needed
- If `currentLevel === 'aal1'` and `nextLevel === 'aal2'`, show MfaChallenge component
- On MFA verification success, redirect to dashboard
- On MFA failure, show error and allow retry

### Step 9: Security Settings Page

Create `src/app/(dashboard)/dashboard/settings/security/page.tsx`:
- Server component, auth-gated
- Renders MfaSettings component
- Shows active sessions (if Supabase exposes this — otherwise placeholder)
- "Sign out all devices" button
- Page title: "Security Settings"

### Step 10: Supabase Client Update

Update `src/lib/supabase/client.ts`:
- Add `flowType: 'pkce'` to auth configuration
- Verify `autoRefreshToken: true` and `persistSession: true` are set

### Step 11: Verify

- `npm run build` must pass with zero errors
- Verify security headers present on all responses (check with browser dev tools)
- Verify CSP header present (report-only mode)
- Verify rate limiting triggers on repeated login attempts
- Verify MFA enrollment flow: QR code → verify → backup codes
- Verify MFA challenge on login for enrolled users
- Verify CORS rejects requests from non-allowed origins
- Verify audit log hash chain: insert a few entries, verify hashes are sequential and computable
- Verify auth error messages are generic (no user enumeration)

### Commit Message

`GSR-DOC-900: security hardening — MFA, CSP, CORS, rate limiting, audit hash chain`
