---
doc_id: GSR-DOC-200
title: Authentication — Registration, Login, Session Management
phase: 2
status: complete
blocks_on: []
priority: critical
author: Roy E. Dunn
created: 2026-04-10
updated: 2026-05-07
notes: >
  OD-01 RESOLVED: MFA deferred. Build toggle only, enforcement in DOC-900.
  OD-02 RESOLVED: Stripe Identity deferred to Phase 5 credentialing. Registration is open (email + password).
  Validation/evaluation integrity handled via tokenized email + phone OTP + legal attestation (DOC-401/DOC-403).
---

# Grey Sky Responder Society — Authentication

> **Role:** This document specifies the complete authentication system: Supabase Auth integration, registration, login, session management, auth callback, protected route enforcement, and Zod validation. This is the gate to every authenticated feature in the platform.
>
> **Upstream:** GSR-DOC-002 (Database Schema — users table, auth sync trigger), GSR-DOC-004 (Scaffolding — Supabase client stubs, middleware)
> **Downstream:** GSR-DOC-201 (Dashboard Layout), GSR-DOC-202 (Profile), GSR-DOC-609 (Agency Dashboard), GSR-DOC-904 (Admin)

---

## 1. Resolved Decision Points

| ID | Decision | Resolution |
|----|----------|------------|
| OD-01 | MFA provider | **Deferred.** `mfa_enabled` boolean exists on users table. UI toggle built in this doc. Actual TOTP enrollment deferred to DOC-900 (Security Hardening). Supabase Auth has built-in TOTP — no external provider needed. |
| OD-02 | Stripe Identity at registration | **Deferred to Phase 5.** Registration is open: email + password. Identity verification (government ID) required only at credentialing tier ($300–$500). Validation/evaluation integrity enforced via tokenized email + phone OTP (Twilio Verify) + legal attestation — built in DOC-401/DOC-403. |

---

## 2. Auth Architecture

**Provider:** Supabase Auth (GoTrue). Replaces NextAuth.js from DOC-000.

**Flow:**
1. User submits registration form → Supabase `auth.signUp()` with `user_metadata` containing first_name, last_name
2. Supabase creates `auth.users` row → database trigger (`on_auth_user_created` from Migration 7) creates `public.users` row with matching UUID
3. Supabase sends confirmation email (configurable — disabled in local dev via `supabase/config.toml`)
4. User clicks confirmation link → redirected to `/auth/callback` → exchanged for session
5. Session cookie set via `@supabase/ssr` middleware on every request

**Session management:** Server-side cookie-based via `@supabase/ssr`. No client-side JWT storage. The middleware in `src/middleware.ts` (already created in DOC-004) refreshes the session on every request.

**No separate backend.** All auth operations go through Supabase client libraries. Server Actions handle form submissions.

---

## 3. Data Entities

**Reads from:**
- `public.users` — profile data after auth sync

**Writes to:**
- `auth.users` — via Supabase Auth API (signUp, signInWithPassword)
- `public.users` — via database trigger (automatic on auth.users INSERT)

**Registration metadata passed to trigger:**
```typescript
{
  data: {
    first_name: string,
    last_name: string,
    // role defaults to 'member' in trigger
  }
}
```

---

## 4. Pages

### 4.1 Registration — `/register`

**Route:** `src/app/(auth)/register/page.tsx`

**Fields:**
- First name (required, 1–100 chars)
- Last name (required, 1–100 chars)
- Email (required, valid email, max 255)
- Password (required, min 12 chars)
- Confirm password (must match)
- State (optional, 2-char US state code dropdown — all 50 states + DC + territories)
- Phone (optional, for future use)

**Behavior:**
- Client-side validation with Zod before submission
- Calls Supabase `auth.signUp()` with email, password, and `options.data` containing first_name, last_name
- On success: redirect to `/auth/callback` or show "check your email" message (depending on email confirmation setting)
- On error: display error inline (email already registered, weak password, etc.)
- No CAPTCHA for now — add in DOC-900 if abuse detected

**Design:**
- Grey Sky branded: Command Navy background on left panel (desktop) with logo and tagline, form on right
- Mobile: full-width form with logo above
- Link to login page: "Already have an account? Sign in"
- Footer: Longview Solutions Group LLC attribution

### 4.2 Login — `/login`

**Route:** `src/app/(auth)/login/page.tsx`

**Fields:**
- Email (required)
- Password (required)

**Behavior:**
- Client-side validation with Zod
- Calls Supabase `auth.signInWithPassword()`
- On success: redirect to `searchParams.redirect` or `/dashboard`
- On error: display "Invalid email or password" (generic — do not reveal which field is wrong)
- MFA toggle placeholder: if `mfa_enabled` is true on user profile, show "MFA required" state (non-functional until DOC-900)

**Design:**
- Same split-panel layout as registration
- Link to registration: "Don't have an account? Create one"
- Link to password reset: "Forgot your password?" (uses Supabase `auth.resetPasswordForEmail()`)

### 4.3 Auth Callback — `/auth/callback`

**Route:** `src/app/auth/callback/route.ts` (Route Handler, NOT a page)

**Behavior:**
- Receives the `code` query parameter from Supabase email confirmation or OAuth
- Exchanges code for session via `supabase.auth.exchangeCodeForSession(code)`
- Redirects to `/dashboard` on success
- Redirects to `/login?error=auth_callback_failed` on failure

### 4.4 Password Reset — `/reset-password`

**Route:** `src/app/(auth)/reset-password/page.tsx`

**Two states:**
1. **Request form:** Email field → calls `auth.resetPasswordForEmail()` → shows "Check your email" message
2. **Update form:** Shown when user arrives via reset link with token. New password + confirm → calls `auth.updateUser({ password })` → redirects to `/dashboard`

---

## 5. Server Actions

### 5.1 `signUp`
```
Location: src/app/(auth)/register/actions.ts
Input: { email, password, first_name, last_name, phone?, location_state? }
Validation: Zod schema (see Section 7)
Action: createClient (server) → auth.signUp() with metadata
Return: { success: true } or { error: string }
```

### 5.2 `signIn`
```
Location: src/app/(auth)/login/actions.ts
Input: { email, password }
Validation: Zod schema
Action: createClient (server) → auth.signInWithPassword()
Return: redirect to /dashboard or { error: string }
```

### 5.3 `signOut`
```
Location: src/lib/auth/actions.ts
Input: none
Action: createClient (server) → auth.signOut()
Return: redirect to /
```

### 5.4 `resetPassword`
```
Location: src/app/(auth)/reset-password/actions.ts
Input: { email }
Action: createClient (server) → auth.resetPasswordForEmail()
Return: { success: true }
```

### 5.5 `updatePassword`
```
Location: src/app/(auth)/reset-password/actions.ts
Input: { password }
Action: createClient (server) → auth.updateUser({ password })
Return: redirect to /dashboard
```

---

## 6. Middleware Updates

The middleware at `src/middleware.ts` and `src/lib/supabase/middleware.ts` already exist from DOC-004. This build updates them to:

1. **Refresh session** on every request (already implemented)
2. **Redirect unauthenticated users** away from protected routes (already implemented for /dashboard, /agency, /admin)
3. **Add role-based enforcement:**
   - `/admin/*` — requires `platform_admin` role. Fetch user from `public.users` in middleware, check role, redirect to `/dashboard` if insufficient.
   - `/agency/*` — requires `org_admin` or `platform_admin` role. Same pattern.
   - `/dashboard/*` — requires any authenticated user. Already handled.

**Important:** Role checks query `public.users` table. The RLS helper functions (`public.user_role()`, `public.is_platform_admin()`) are in the database but middleware uses a direct query for the role check since middleware runs before RLS context is established.

---

## 7. Zod Validation Schemas

Create in `src/lib/validators/auth.ts`:

```typescript
// Registration
{
  email: z.string().email().max(255),
  password: z.string().min(12).max(128),
  confirm_password: z.string(),
  first_name: z.string().min(1).max(100).trim(),
  last_name: z.string().min(1).max(100).trim(),
  phone: z.string().max(30).optional(),
  location_state: z.string().length(2).optional(),
}
// + refine: password === confirm_password

// Login
{
  email: z.string().email(),
  password: z.string().min(1),
}

// Password reset request
{
  email: z.string().email(),
}

// Password update
{
  password: z.string().min(12).max(128),
  confirm_password: z.string(),
}
// + refine: password === confirm_password
```

---

## 8. Auth Utility Hook

Create `src/hooks/useUser.ts`:

```typescript
// Client-side hook that:
// 1. Gets current session from Supabase client
// 2. Fetches public.users profile for the authenticated user
// 3. Returns { user, profile, loading, error }
// 4. Re-fetches on auth state change
```

Create `src/lib/auth/getUser.ts`:

```typescript
// Server-side utility that:
// 1. Creates Supabase server client
// 2. Gets session via auth.getUser()
// 3. If authenticated, fetches public.users profile
// 4. Returns { user, profile } or null
// Used by Server Components and Server Actions
```

---

## 9. Business Rules

1. **Email uniqueness:** Enforced by Supabase Auth AND by the UNIQUE constraint on `public.users.email`.
2. **Password minimum:** 12 characters. No complexity regex — length is the primary defense per NIST 800-63B.
3. **Auth sync:** The database trigger handles `public.users` row creation. Application code does NOT insert into `public.users` directly during registration.
4. **Role assignment:** All new users get `role = 'member'`. Role changes happen via platform admin action only (DOC-904).
5. **Session duration:** Supabase default JWT expiry (3600 seconds / 1 hour), with automatic refresh via middleware.
6. **Email confirmation:** Disabled in local dev (`supabase/config.toml` → `enable_confirmations = false`). Enabled in production.
7. **MFA:** `mfa_enabled` field exists but MFA is not enforced. Toggle shown in UI as disabled/coming soon.

---

## 10. Component Structure

```
src/app/(auth)/
  register/
    page.tsx              — Registration page (Server Component shell)
    register-form.tsx     — Registration form (Client Component — uses Supabase client)
    actions.ts            — Server Actions: signUp
  login/
    page.tsx              — Login page (Server Component shell)
    login-form.tsx        — Login form (Client Component)
    actions.ts            — Server Actions: signIn
  reset-password/
    page.tsx              — Password reset page
    actions.ts            — Server Actions: resetPassword, updatePassword
  layout.tsx              — Auth layout: centered card, Grey Sky branding

src/app/auth/
  callback/
    route.ts              — Auth callback Route Handler (code → session exchange)

src/lib/auth/
  actions.ts              — Shared auth actions: signOut
  getUser.ts              — Server-side user fetcher

src/lib/validators/
  auth.ts                 — Zod schemas for registration, login, password reset

src/hooks/
  useUser.ts              — Client-side auth + profile hook

src/components/auth/
  auth-layout.tsx         — Split-panel branded layout
  submit-button.tsx       — Form submit button with loading state
```

---

## 11. Acceptance Criteria

- [x] Registration form collects first name, last name, email, password, confirm password, optional state, optional phone
- [x] Registration calls Supabase auth.signUp with metadata — does NOT insert into public.users directly
- [x] Auth sync trigger creates public.users row automatically on registration
- [x] Login form authenticates via Supabase auth.signInWithPassword
- [x] Login redirects to `?redirect` param or `/dashboard` on success
- [x] Auth callback route at `/auth/callback` exchanges code for session
- [x] Password reset sends email via Supabase, update form sets new password
- [x] Middleware redirects unauthenticated users from /dashboard/*, /agency/*, /admin/*
- [x] Middleware checks role for /admin/* (platform_admin) and /agency/* (org_admin)
- [x] Zod schemas validate all form inputs on client and server
- [x] useUser hook provides current user + profile to client components
- [x] getUser utility provides same for server components
- [x] signOut action clears session and redirects to /
- [x] All pages use Grey Sky brand styling (Command Navy, Signal Gold, Inter font)
- [x] Mobile responsive on all auth pages
- [x] npm run build passes with zero errors
- [x] No Vercel-specific code

---

## 12. Open Questions

None — OD-01 and OD-02 resolved. This doc is ready to build.
