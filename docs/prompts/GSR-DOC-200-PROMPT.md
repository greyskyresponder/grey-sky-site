# GSR-DOC-200 — Authentication Build Prompt

> **Usage:** Single prompt for Claude Code terminal. Paste the entire block below.
> **Prerequisites:** Phase 0 foundation complete (DOC-002/003/004 committed). Supabase running locally. DOC-200 added to project knowledge.

---

```
Read CLAUDE.md first, then read GSR-DOC-200-AUTH.md completely. This session builds the authentication system.

## Context

Phase 0 is complete: 24 tables, 8 migrations, seed data, scaffolding all committed. The Supabase client stubs at src/lib/supabase/{client,server,middleware,admin}.ts already exist. The middleware at src/middleware.ts already exists with basic session refresh and unauthenticated redirect logic. The (auth) route group exists with placeholder pages.

OD-01 (MFA) is resolved: defer. Build the toggle, not the provider.
OD-02 (Stripe Identity) is resolved: defer to Phase 5. Open registration with email + password.

The auth sync trigger in Migration 7 automatically creates a public.users row when auth.users gets an INSERT. Registration does NOT insert into public.users directly — the trigger handles it. The trigger reads first_name and last_name from raw_user_meta_data.

## What to build — in this order:

### Step 1: Zod Validation Schemas

Create src/lib/validators/auth.ts with four schemas:

- registrationSchema: email (string, email, max 255), password (string, min 12, max 128), confirm_password (string), first_name (string, min 1, max 100, trimmed), last_name (string, min 1, max 100, trimmed), phone (string, max 30, optional), location_state (string, length 2, optional). Refine: password must equal confirm_password.
- loginSchema: email (string, email), password (string, min 1)
- resetPasswordSchema: email (string, email)
- updatePasswordSchema: password (string, min 12, max 128), confirm_password (string). Refine: must match.

Export all schemas and their inferred types.

### Step 2: Auth Callback Route Handler

Create src/app/auth/callback/route.ts:

- GET handler that reads the `code` query parameter
- Creates Supabase server client
- Calls supabase.auth.exchangeCodeForSession(code)
- On success: redirect to /dashboard
- On failure: redirect to /login?error=auth_callback_failed
- This is a Route Handler (route.ts), NOT a page component

### Step 3: Server-Side Auth Utilities

Create src/lib/auth/getUser.ts:
- Async function that creates a Supabase server client
- Calls auth.getUser() to get the authenticated user
- If authenticated, queries public.users for the full profile
- Returns { user: AuthUser, profile: User } or null

Create src/lib/auth/actions.ts:
- signOut Server Action: creates server client, calls auth.signOut(), redirects to /

### Step 4: Client-Side Auth Hook

Create src/hooks/useUser.ts:
- Creates Supabase browser client
- Uses useEffect to get initial session and subscribe to auth state changes via onAuthStateChange
- When authenticated, fetches the public.users profile for the current user
- Returns { user, profile, loading, error, signOut }
- signOut calls supabase.auth.signOut() then uses router.push('/') or router.refresh()

### Step 5: Auth Layout

Create src/app/(auth)/layout.tsx:
- Grey Sky branded auth layout
- Desktop: split panel — left side is Command Navy (#0A1628) background with Grey Sky logo (use text placeholder if no logo file exists) and tagline "Verified credibility for emergency responders", right side is the form
- Mobile: full-width with logo/tagline above form, white background
- Centered card design for the form area
- Use Tailwind CSS with the brand CSS custom properties from CLAUDE.md

### Step 6: Registration Page

Create src/app/(auth)/register/actions.ts:
- signUp Server Action
- Validates input with registrationSchema from validators/auth.ts
- Creates Supabase server client
- Calls supabase.auth.signUp({ email, password, options: { data: { first_name, last_name } } })
- If user also provided phone or location_state: after successful signup, update public.users with those fields using the admin client (the trigger only sets first_name, last_name, email)
- Returns { success: true } or { error: string }

Create src/app/(auth)/register/register-form.tsx (Client Component):
- Form with all fields from DOC-200 Section 4.1
- State dropdown: all 50 US states + DC + PR, VI, GU, AS, MP (use a constant array)
- Client-side Zod validation on submit, show field-level errors
- Calls the signUp server action
- On success: show "Check your email to confirm your account" message OR redirect to /dashboard (depending on whether email confirmation is enabled — check by looking at the response)
- Loading state on submit button
- Password strength indicator (visual only — just show if >= 12 chars)

Create src/app/(auth)/register/page.tsx:
- Server Component shell that renders the RegisterForm
- Page metadata: title "Create Account — Grey Sky Responder Society"

### Step 7: Login Page

Create src/app/(auth)/login/actions.ts:
- signIn Server Action
- Validates input with loginSchema
- Creates Supabase server client
- Calls supabase.auth.signInWithPassword({ email, password })
- On success: redirect to the `redirect` param from URL search params, or /dashboard
- Returns { error: "Invalid email or password" } on failure (generic message, never reveal which field)

Create src/app/(auth)/login/login-form.tsx (Client Component):
- Email and password fields
- Client-side validation
- Calls signIn server action
- Shows error message on failure
- Links: "Don't have an account? Create one" → /register
- Links: "Forgot your password?" → /reset-password

Create src/app/(auth)/login/page.tsx:
- Server Component shell
- Reads searchParams for `redirect` and `error` query params
- If error=auth_callback_failed, show a toast/alert
- Page metadata: title "Sign In — Grey Sky Responder Society"

### Step 8: Password Reset Page

Create src/app/(auth)/reset-password/actions.ts:
- resetPassword Server Action: validates email, calls auth.resetPasswordForEmail()
- updatePassword Server Action: validates new password, calls auth.updateUser({ password })

Create src/app/(auth)/reset-password/page.tsx:
- Two states based on URL: if no hash/token params, show the "enter your email" form. If arriving from a reset link, show the "enter new password" form.
- On email submit: show "Check your email for reset instructions"
- On password update: redirect to /dashboard

### Step 9: Middleware Updates

Update src/lib/supabase/middleware.ts to add role-based enforcement:

- After getting the user session, if the path starts with /admin: query public.users for the user's role. If role is not 'platform_admin', redirect to /dashboard.
- If the path starts with /agency: query public.users for the user's role. If role is not 'org_admin' and not 'platform_admin', redirect to /dashboard.
- Use the admin client for these role queries (they need to bypass RLS since the middleware doesn't have an authenticated Supabase session context).

IMPORTANT: Do NOT use the admin client for the role check. Instead, use the already-authenticated server client from the middleware (it has the user's session). Query public.users WHERE id = user.id — the RLS policy users_select_own allows this. The user can always read their own row.

### Step 10: Shared Components

Create src/components/auth/submit-button.tsx:
- Reusable form submit button with loading spinner
- Uses useFormStatus from react-dom
- Shows "Creating account..." / "Signing in..." etc. while pending
- Disabled while pending
- Styled: Command Navy background, white text, Signal Gold on hover

Commit each logical unit:
1. feat: auth validation schemas and utilities (DOC-200)
2. feat: registration page with Supabase Auth signup (DOC-200)
3. feat: login page with session management (DOC-200)
4. feat: password reset flow (DOC-200)
5. feat: role-based middleware enforcement (DOC-200)

Push each commit to main.

## Verification

After all commits:
- [ ] npm run build passes with zero errors
- [ ] /register page renders with all form fields
- [ ] /login page renders with email + password fields
- [ ] /reset-password page renders
- [ ] /auth/callback route handler exists
- [ ] src/lib/validators/auth.ts exports 4 Zod schemas
- [ ] src/lib/auth/getUser.ts exports server-side user fetcher
- [ ] src/hooks/useUser.ts exports client-side auth hook
- [ ] Middleware redirects /dashboard to /login when not authenticated
- [ ] Middleware redirects /admin to /dashboard for non-platform_admin users
- [ ] All auth pages use Grey Sky branding (Command Navy, Signal Gold, Inter font)
- [ ] No Vercel-specific code

## Do NOT build
- MFA enrollment/enforcement (DOC-900)
- Stripe Identity verification (Phase 5)
- Email templates (DOC-405)
- Rate limiting on login (DOC-900)
- CAPTCHA (DOC-900)
- Profile editing (DOC-202)
```
