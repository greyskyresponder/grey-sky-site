---
doc_id: GSR-DOC-901
title: "Security Patch — password_hash Removal, RLS Tightening, Admin Client Fix"
phase: 9
status: draft
blocks_on: []
priority: critical
author: Architecture Agent (Claude App)
created: 2026-04-15
updated: 2026-04-15
notes: >
  Audit-driven security patch. Three discrete fixes that share a single migration
  and a single Claude Code session. All three are pre-launch blockers.
  Estimated build time: 90 minutes.
---

# GSR-DOC-901: Security Patch — password_hash Removal, RLS Tightening, Admin Client Fix

| Field | Value |
|-------|-------|
| Phase | 9 (Cross-Cutting) |
| Status | draft |
| Blocks on | none |
| Priority | critical |

---

## Purpose

A deep code audit (April 15, 2026) identified three security issues that must be resolved before any controlled launch or real-money Stripe transactions. Each is a discrete fix; they are bundled into one doc because they share a migration file and can be completed in a single Claude Code session.

**Fix 1 — Drop `password_hash` from `public.users`**
The `public.users` table contains a `password_hash TEXT NOT NULL` column. The auth sync trigger inserts an empty string with a comment noting that passwords are managed by Supabase Auth in the `auth.users` table. The column is dead weight — Supabase Auth owns password storage in `auth.users`. Even though the column only contains empty strings, its existence is a liability in any security audit: it signals that the application stores passwords in a public-schema table. The column is also exposed in `src/lib/types/users.ts` as a TypeScript type field, which means application code structurally expects it to exist.

**Fix 2 — Tighten validation/evaluation RLS policies**
The `validation_requests` and `evaluation_requests` tables have overly permissive RLS policies. The `_select_by_token` policies use `USING (true)` — meaning any authenticated or anonymous user can SELECT all rows. The `_update_by_token` policies use `USING (true) WITH CHECK (status = 'pending')` — meaning anyone can UPDATE any pending row. The intent is clearly token-based public access for external validators/evaluators who follow a link, but the policies don't actually verify the token. Until DOC-400/401 builds the full workflow, these tables should be locked down to owner + admin only, with a token-verification function ready for Phase 4.

**Fix 3 — Replace `createAdminClient()` in dashboard page**
The dashboard home page at `src/app/(dashboard)/dashboard/page.tsx` uses `createAdminClient()` (which instantiates a Supabase client with the `service_role` key) to fetch dashboard statistics. The service role bypasses all RLS. If any user-supplied input reaches those queries — even indirectly through a joined table or filter — it creates an RLS bypass vulnerability. The dashboard should use the authenticated user's session client so RLS applies naturally. For any cross-table aggregation that requires elevated access, a scoped `SECURITY DEFINER` Postgres function should be used instead.

**What this does NOT build:**
- Full validation/evaluation workflow (DOC-400 through DOC-403)
- MFA, CSP, or other DOC-900 security hardening
- Test suites (DOC-902)

---

## Data Entities

### Migration Changes

**Drop `password_hash` column:**
```sql
ALTER TABLE public.users DROP COLUMN IF EXISTS password_hash;
```

**Update auth sync trigger** (if it references `password_hash` in the INSERT):
```sql
-- The existing trigger on auth.users INSERT that creates a public.users row
-- must be updated to remove the password_hash column from its INSERT statement.
-- Find the trigger function (likely named handle_new_user or sync_auth_user)
-- and rewrite it without the password_hash reference.
```

**Replace permissive RLS policies on validation_requests:**
```sql
-- DROP the overly permissive policies
DROP POLICY IF EXISTS validation_select_by_token ON validation_requests;
DROP POLICY IF EXISTS validation_update_by_token ON validation_requests;

-- Owner can see their own validation requests (as requestor)
CREATE POLICY validation_select_owner ON validation_requests
  FOR SELECT TO authenticated
  USING (requestor_id = auth.uid());

-- Admin can see all
CREATE POLICY validation_select_admin ON validation_requests
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'platform_admin'));

-- Token-based public access via SECURITY DEFINER function (for Phase 4)
-- Anonymous users will call this function, not query the table directly
CREATE OR REPLACE FUNCTION get_validation_by_token(p_token UUID)
RETURNS SETOF validation_requests
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT * FROM validation_requests
  WHERE token = p_token
    AND status = 'pending'
    AND expires_at > now();
$$;

-- Token-based update via SECURITY DEFINER function (for Phase 4)
CREATE OR REPLACE FUNCTION submit_validation_response(
  p_token UUID,
  p_status TEXT,
  p_response_text TEXT DEFAULT NULL,
  p_attestation_accepted BOOLEAN DEFAULT FALSE
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_request validation_requests;
BEGIN
  SELECT * INTO v_request
  FROM validation_requests
  WHERE token = p_token
    AND status = 'pending'
    AND expires_at > now()
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;

  IF p_status NOT IN ('confirmed', 'denied') THEN
    RETURN FALSE;
  END IF;

  UPDATE validation_requests SET
    status = p_status::text,
    response_text = p_response_text,
    attestation_accepted = p_attestation_accepted,
    responded_at = now()
  WHERE id = v_request.id;

  RETURN TRUE;
END;
$$;

-- Revoke direct anonymous access — all anon interaction goes through functions
REVOKE ALL ON validation_requests FROM anon;
```

**Replace permissive RLS policies on evaluation_requests:**
```sql
-- DROP the overly permissive policies
DROP POLICY IF EXISTS evaluation_select_by_token ON evaluation_requests;
DROP POLICY IF EXISTS evaluation_update_by_token ON evaluation_requests;

-- Owner can see their own evaluation requests (as requestor)
CREATE POLICY evaluation_select_owner ON evaluation_requests
  FOR SELECT TO authenticated
  USING (requestor_id = auth.uid());

-- Admin can see all
CREATE POLICY evaluation_select_admin ON evaluation_requests
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'platform_admin'));

-- Token-based public access via SECURITY DEFINER function (for Phase 4)
CREATE OR REPLACE FUNCTION get_evaluation_by_token(p_token UUID)
RETURNS SETOF evaluation_requests
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT * FROM evaluation_requests
  WHERE token = p_token
    AND status = 'pending'
    AND expires_at > now();
$$;

-- Token-based update via SECURITY DEFINER function (for Phase 4)
CREATE OR REPLACE FUNCTION submit_evaluation_response(
  p_token UUID,
  p_status TEXT,
  p_rating_leadership INTEGER DEFAULT NULL,
  p_rating_tactical INTEGER DEFAULT NULL,
  p_rating_communication INTEGER DEFAULT NULL,
  p_rating_planning INTEGER DEFAULT NULL,
  p_rating_technical INTEGER DEFAULT NULL,
  p_overall_rating NUMERIC DEFAULT NULL,
  p_commentary TEXT DEFAULT NULL,
  p_attestation_accepted BOOLEAN DEFAULT FALSE
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_request evaluation_requests;
BEGIN
  SELECT * INTO v_request
  FROM evaluation_requests
  WHERE token = p_token
    AND status = 'pending'
    AND expires_at > now()
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;

  IF p_status NOT IN ('completed', 'denied') THEN
    RETURN FALSE;
  END IF;

  -- Validate ratings are 1-5 if completing
  IF p_status = 'completed' THEN
    IF p_rating_leadership IS NULL OR p_rating_leadership < 1 OR p_rating_leadership > 5
      OR p_rating_tactical IS NULL OR p_rating_tactical < 1 OR p_rating_tactical > 5
      OR p_rating_communication IS NULL OR p_rating_communication < 1 OR p_rating_communication > 5
      OR p_rating_planning IS NULL OR p_rating_planning < 1 OR p_rating_planning > 5
      OR p_rating_technical IS NULL OR p_rating_technical < 1 OR p_rating_technical > 5
    THEN
      RETURN FALSE;
    END IF;
  END IF;

  UPDATE evaluation_requests SET
    status = p_status::text,
    rating_leadership = p_rating_leadership,
    rating_tactical = p_rating_tactical,
    rating_communication = p_rating_communication,
    rating_planning = p_rating_planning,
    rating_technical = p_rating_technical,
    overall_rating = p_overall_rating,
    commentary = p_commentary,
    attestation_accepted = p_attestation_accepted,
    responded_at = now()
  WHERE id = v_request.id;

  RETURN TRUE;
END;
$$;

-- Revoke direct anonymous access
REVOKE ALL ON evaluation_requests FROM anon;
```

**Dashboard stats function (replaces admin client usage):**
```sql
-- Scoped SECURITY DEFINER function that returns only what the authenticated user should see
CREATE OR REPLACE FUNCTION get_dashboard_stats(p_user_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result JSON;
BEGIN
  -- Verify the caller is requesting their own stats
  IF p_user_id != auth.uid() THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  SELECT json_build_object(
    'deployment_count', (SELECT count(*) FROM deployment_records WHERE user_id = p_user_id),
    'incident_count', (SELECT count(DISTINCT incident_id) FROM deployment_records WHERE user_id = p_user_id),
    'document_count', (SELECT count(*) FROM documents WHERE user_id = p_user_id),
    'pending_validations', (SELECT count(*) FROM validation_requests WHERE requestor_id = p_user_id AND status = 'pending'),
    'pending_evaluations', (SELECT count(*) FROM evaluation_requests WHERE requestor_id = p_user_id AND status = 'pending'),
    'profile_completeness', (SELECT profile_completeness FROM users WHERE id = p_user_id),
    'membership_status', (SELECT membership_status FROM users WHERE id = p_user_id),
    'membership_expires_at', (SELECT membership_expires_at FROM users WHERE id = p_user_id)
  ) INTO v_result;

  RETURN v_result;
END;
$$;
```

---

## Structure

### New Files

```
supabase/migrations/20260415000001_security_patch.sql   — All three fixes in one migration
src/lib/supabase/dashboard-stats.ts                      — Typed wrapper for get_dashboard_stats() RPC call
```

### Modified Files

```
src/app/(dashboard)/dashboard/page.tsx                   — Replace createAdminClient() with session client + RPC
src/lib/types/users.ts                                   — Remove password_hash field
src/lib/validators/users.ts                              — Remove password_hash from any Zod schema (if present)
```

---

## Business Rules

1. **`password_hash` must not exist in public schema.** Supabase Auth owns password storage. The column, the TypeScript type field, and any references in validators or actions must all be removed. The auth sync trigger must be updated to not reference this column.

2. **Validation/evaluation tables are locked down to owner + admin until Phase 4.** No anonymous or arbitrary authenticated access. The `SECURITY DEFINER` functions provide the token-verification pathway that DOC-400/401 will use. These functions validate: (a) token matches a row, (b) row status is `pending`, (c) row has not expired. The function signatures are designed to be consumed directly by the Phase 4 public forms.

3. **Dashboard page must not use service_role.** All dashboard queries must use the authenticated user's session client, which respects RLS. The `get_dashboard_stats()` function runs as `SECURITY DEFINER` but is scoped to return only the calling user's own aggregate counts. It verifies `p_user_id = auth.uid()` before executing.

4. **No data loss.** The `password_hash` column only contains empty strings — this is a schema cleanup, not a data migration. The validation/evaluation data (if any rows exist) is preserved; only the access policies change.

---

## Copy Direction

No user-facing copy changes. This is an infrastructure security patch.

---

## Acceptance Criteria

1. `password_hash` column does not exist on `public.users` table after migration
2. `password_hash` does not appear in `src/lib/types/users.ts` or any other TypeScript type file
3. `password_hash` does not appear in any Zod validator
4. Auth sync trigger (the function that creates `public.users` rows on registration) works correctly without `password_hash`
5. New user registration still creates a `public.users` row with all required fields
6. `validation_requests` table: anonymous users cannot SELECT any rows directly
7. `validation_requests` table: anonymous users cannot UPDATE any rows directly
8. `get_validation_by_token('valid-token')` returns the matching pending, non-expired row
9. `get_validation_by_token('invalid-token')` returns empty set
10. `submit_validation_response()` updates only the row matching the token, only if pending and not expired
11. `evaluation_requests` table: same restrictions as validation (items 6-10 equivalent)
12. `submit_evaluation_response()` validates all five ratings are 1-5 when status is 'completed'
13. Dashboard page at `/dashboard` does NOT import or call `createAdminClient()`
14. Dashboard page uses the authenticated session client for all data fetching
15. `get_dashboard_stats()` returns correct counts for the authenticated user
16. `get_dashboard_stats()` raises an exception if called with a user_id that doesn't match `auth.uid()`
17. `npm run build` passes with zero errors

---

## Agent Lenses

### Baseplate (data/schema)
- `password_hash` removal is a clean DROP — no foreign keys, no indexes, no dependent views. The `NOT NULL` constraint means the auth sync trigger must be updated in the same migration or it will fail on the next registration.
- `SECURITY DEFINER` functions use `SET search_path = public` to prevent search_path injection.
- `FOR UPDATE` row lock in the token functions prevents race conditions on concurrent validation submissions.
- The dashboard stats function returns a single JSON object — one round trip, no N+1 queries.

### Meridian (doctrine)
- Token-based validation access is the standard pattern for external attestation in credentialing systems. The function signatures match what DOC-400/401 will consume.
- Validation and evaluation are legal attestation instruments. The RLS tightening ensures these records cannot be read or modified by unauthorized parties.

### Lookout (UX)
- No user-facing changes. Dashboard will render identically — the data source changes from admin client to session client + RPC, but the output is the same.

### Threshold (security)
- **password_hash removal:** Eliminates a false signal in security audits and removes a column that could become a target if the application were ever misconfigured to write to it.
- **RLS tightening:** Closes an open SELECT/UPDATE on sensitive attestation data. The `SECURITY DEFINER` functions are the controlled access path — they validate tokens, check expiry, and enforce status transitions.
- **Admin client removal:** Restores RLS as the trust boundary on the most-visited authenticated page. The SECURITY DEFINER function is scoped to a single user's aggregates — no cross-user data leakage possible.

---

## Claude Code Prompt

You are applying a security patch to the Grey Sky Responder Society portal. This is a Next.js 16 + Supabase (PostgreSQL) application.

### What You Are Fixing

Three security issues identified in audit:
1. Drop `password_hash` column from `public.users` and remove from TypeScript types
2. Replace overly permissive RLS on `validation_requests` and `evaluation_requests` with owner+admin policies and token-verification SECURITY DEFINER functions
3. Replace `createAdminClient()` usage in the dashboard page with session client + a scoped SECURITY DEFINER function

### Prerequisites

The following already exist:
- `public.users` table with `password_hash TEXT NOT NULL` column (contains only empty strings)
- Auth sync trigger that creates `public.users` rows on registration (references `password_hash`)
- `validation_requests` and `evaluation_requests` tables with RLS enabled but overly permissive `_by_token` policies
- Dashboard page at `src/app/(dashboard)/dashboard/page.tsx` that imports and uses `createAdminClient()`
- `src/lib/supabase/admin.ts` exports `createAdminClient()`
- `src/lib/types/users.ts` includes `password_hash` in the User interface
- Brand: Command Navy `#0A1628`, Signal Gold `#C5933A`, Ops White `#F5F5F5`

### Step 1: Migration

Create `supabase/migrations/20260415000001_security_patch.sql`:

**Part A — Drop password_hash:**
1. `ALTER TABLE public.users DROP COLUMN IF EXISTS password_hash;`
2. Find the existing auth sync trigger function (likely `handle_new_user()` or similar — check existing migrations in `supabase/migrations/` to find the function name). Rewrite it with `CREATE OR REPLACE FUNCTION` removing the `password_hash` reference from the INSERT statement. Keep all other columns exactly as they are. The function should still insert a row into `public.users` on every `auth.users` INSERT, just without `password_hash`.

**Part B — Tighten validation/evaluation RLS:**
1. Drop the four permissive policies:
   - `DROP POLICY IF EXISTS validation_select_by_token ON validation_requests;`
   - `DROP POLICY IF EXISTS validation_update_by_token ON validation_requests;`
   - `DROP POLICY IF EXISTS evaluation_select_by_token ON evaluation_requests;`
   - `DROP POLICY IF EXISTS evaluation_update_by_token ON evaluation_requests;`

2. Create owner + admin SELECT policies for both tables:
   ```sql
   CREATE POLICY validation_select_owner ON validation_requests
     FOR SELECT TO authenticated
     USING (requestor_id = auth.uid());

   CREATE POLICY validation_select_admin ON validation_requests
     FOR SELECT TO authenticated
     USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'platform_admin'));
   ```
   (Same pattern for evaluation_requests)

3. Create four SECURITY DEFINER functions for token-based access:
   - `get_validation_by_token(p_token UUID)` — returns matching pending, non-expired row
   - `submit_validation_response(p_token UUID, p_status TEXT, p_response_text TEXT, p_attestation_accepted BOOLEAN)` — updates the row matching token, validates status is 'confirmed' or 'denied', uses FOR UPDATE lock
   - `get_evaluation_by_token(p_token UUID)` — same pattern
   - `submit_evaluation_response(p_token UUID, p_status TEXT, p_rating_leadership INT, p_rating_tactical INT, p_rating_communication INT, p_rating_planning INT, p_rating_technical INT, p_overall_rating NUMERIC, p_commentary TEXT, p_attestation_accepted BOOLEAN)` — validates all ratings are 1-5 when status is 'completed', uses FOR UPDATE lock

   All functions: `SECURITY DEFINER`, `SET search_path = public`, return FALSE on not found or invalid input.

4. Revoke direct anonymous access:
   ```sql
   REVOKE ALL ON validation_requests FROM anon;
   REVOKE ALL ON evaluation_requests FROM anon;
   ```

**Part C — Dashboard stats function:**
```sql
CREATE OR REPLACE FUNCTION get_dashboard_stats(p_user_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result JSON;
BEGIN
  IF p_user_id != auth.uid() THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  SELECT json_build_object(
    'deployment_count', (SELECT count(*) FROM deployment_records WHERE user_id = p_user_id),
    'incident_count', (SELECT count(DISTINCT incident_id) FROM deployment_records WHERE user_id = p_user_id),
    'document_count', (SELECT count(*) FROM documents WHERE user_id = p_user_id),
    'pending_validations', (SELECT count(*) FROM validation_requests WHERE requestor_id = p_user_id AND status = 'pending'),
    'pending_evaluations', (SELECT count(*) FROM evaluation_requests WHERE requestor_id = p_user_id AND status = 'pending'),
    'profile_completeness', (SELECT profile_completeness FROM users WHERE id = p_user_id),
    'membership_status', (SELECT membership_status FROM users WHERE id = p_user_id),
    'membership_expires_at', (SELECT membership_expires_at FROM users WHERE id = p_user_id)
  ) INTO v_result;

  RETURN v_result;
END;
$$;
```

### Step 2: Update TypeScript Types

Edit `src/lib/types/users.ts`:
- Remove `password_hash` from the `User` interface (or whatever the main user type is named)
- Remove `password_hash` from any related types, partial types, or insert types
- Search the entire `src/lib/types/` directory for any other reference to `password_hash` and remove

### Step 3: Update Validators

Check `src/lib/validators/users.ts` and `src/lib/validators/auth.ts`:
- Remove `password_hash` from any Zod schemas that include it
- If `password_hash` appears in registration or profile update schemas, remove it

### Step 4: Create Dashboard Stats Wrapper

Create `src/lib/supabase/dashboard-stats.ts`:
```typescript
import { createServerSupabaseClient } from './server';

export interface DashboardStats {
  deployment_count: number;
  incident_count: number;
  document_count: number;
  pending_validations: number;
  pending_evaluations: number;
  profile_completeness: number;
  membership_status: 'active' | 'expired' | 'none';
  membership_expires_at: string | null;
}

export async function getDashboardStats(userId: string): Promise<DashboardStats> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.rpc('get_dashboard_stats', { p_user_id: userId });

  if (error) {
    console.error('Dashboard stats error:', error);
    return {
      deployment_count: 0,
      incident_count: 0,
      document_count: 0,
      pending_validations: 0,
      pending_evaluations: 0,
      profile_completeness: 0,
      membership_status: 'none',
      membership_expires_at: null,
    };
  }

  return data as DashboardStats;
}
```

### Step 5: Update Dashboard Page

Edit `src/app/(dashboard)/dashboard/page.tsx`:
1. Remove the import of `createAdminClient` (from `src/lib/supabase/admin.ts` or wherever it's imported)
2. Import `getDashboardStats` from `src/lib/supabase/dashboard-stats`
3. Import `getUser` (or whatever the existing auth helper is) from `src/lib/auth/getUser`
4. Replace all `createAdminClient()` query calls with `getDashboardStats(user.id)`
5. Update the component to destructure stats from the returned object
6. Keep the existing UI components (StatusGrid, StatCard, WelcomeBar, RecentActivity, QuickActionPanel) — only the data source changes

**Important:** Do NOT remove `createAdminClient` from `src/lib/supabase/admin.ts` — other admin pages may legitimately use it. Only remove it from the dashboard page.

### Step 6: Search for Other Admin Client Usage

Run `grep -rn "createAdminClient" src/app/` to find any other pages using the admin client outside of admin routes. If found in any `(dashboard)` route (non-admin), flag it in the completion report but do not fix — scope of this doc is the dashboard home page only.

### Step 7: Verify

1. `npm run build` must pass with zero errors
2. `grep -rn "password_hash" src/` returns zero results
3. Check that the auth sync trigger function has been updated (read the migration to confirm)
4. Verify the four SECURITY DEFINER functions exist in the migration
5. Verify that `src/app/(dashboard)/dashboard/page.tsx` does not import `createAdminClient`
6. Verify that `src/lib/supabase/dashboard-stats.ts` exists and exports `getDashboardStats`

### Commit Message

`GSR-DOC-901: security patch — drop password_hash, tighten validation/evaluation RLS, replace admin client in dashboard`
