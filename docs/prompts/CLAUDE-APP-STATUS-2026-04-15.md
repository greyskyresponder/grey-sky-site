# Grey Sky Responder Society — Claude App Build Report

**Date:** April 15, 2026
**HEAD:** `730b706` (main, 64 commits)
**CI/CD:** ✅ Both CI and Deploy to Azure passing
**Live URL:** https://greysky.dev
**Stack:** Next.js 16.1.6 · React 19.2.3 · Tailwind CSS 4 · TypeScript 5 · Supabase Postgres 17.6 · Azure Static Web Apps (East US 2)

---

## Current State: ~75% Internal Testing Ready

### ✅ Complete & Deployed

**Auth (DOC-200)**
- Register, login, password reset, signout — all server actions
- MFA settings page (TOTP enrollment/unenroll)
- Rate limiting on all auth endpoints (in-memory, resets on deploy)

**Dashboard (DOC-201)**
- Home page with stats via `get_dashboard_stats()` SECURITY DEFINER function
- Sidebar navigation, membership CTA, quick actions
- Session-based client (no admin client in dashboard)

**Member Profile (DOC-202)**
- View + edit with 8 sections (bio, contact, certifications, etc.)
- Affinity selection (37 affinities)
- Photo upload
- Profile completeness tracking

**Deployment Records (DOC-203)**
- Full CRUD: create, view, list, edit
- Position lookup against 625 FEMA RTLT entries
- Incident linking
- Record detail page with timeline

**Incidents (DOC-204)**
- Create, list, detail pages
- Public and member views

**Sky Coins Economy (DOC-205)**
- Balance view + ledger history
- `spend_coins()` and `credit_coins()` with `FOR UPDATE` row locking
- 28 coin products seeded
- Purchase page (UI done, needs Stripe products for coin packs)

**Document Library (DOC-206)**
- Upload, list, view, signed URL download
- Category + avatar support (DOC-206 v2)

**Stripe Membership (DOC-207)**
- ✅ Webhook handler: `checkout.session.completed`, `invoice.payment_succeeded`, `customer.subscription.updated`, `customer.subscription.deleted`
- ✅ Idempotency via `stripe_events` table
- ✅ Membership activation → 1,000 Sky Coins grant on purchase/renewal
- ✅ `getOrCreateStripeCustomer()` with Supabase persistence
- ✅ Customer portal action for subscription management
- ✅ MembershipCta component with checkout flow
- ✅ Test-mode keys configured (`.env.local` + Azure SWA + GitHub Secrets)
- ✅ Webhook endpoint registered: `https://greysky.dev/api/stripe/webhook`
- ✅ Product created: Grey Sky Annual Membership ($100/yr) — `price_1TMaT84Z6KHKmKNGCojBj4rN`

**Public Marketing Pages (DOC-005, DOC-101, DOC-102)**
- Home, About, Membership, Join/Tell Your Story, Community
- Teams (20 teams) with detail pages
- Standards (17 SRT disciplines) with FEMA RTLT detail pages
- Positions index (625 entries) with detail pages
- Organizations index

**Security (DOC-900, DOC-901)**
- RLS on all 36 tables
- `password_hash` removed from `public.users`
- Token-based access via SECURITY DEFINER functions (no open RLS)
- CSP headers, rate limiting, input sanitization
- MFA enforcement on `/admin` prefix

**Testing (DOC-902)**
- Vitest configured with 46 tests across 3 suites
  - Auth actions: 17 tests
  - Coin economy: 13 tests
  - Stripe webhook: 16 tests
- CI runs lint + type-check + test + build on every push

---

### ⚠️ Needs Config / Polish (Not Code Blockers)

| Item | What's needed | Effort |
|------|--------------|--------|
| Supabase email templates | Configure verification + password reset email templates in Supabase Dashboard | 15 min |
| Coin purchase packs | Create Stripe products for coin pack tiers (if selling coins separately from membership) | 15 min |
| Standards index page | Has content but may need layout polish — currently marked pending | Quick |

---

### 🔴 Stubs — Next Build Priorities

#### Priority 1: Validation Flow (DOC-400 + DOC-401)

**What:** Member spends 10 Sky Coins → sends validation request to a peer → peer receives email with token link → peer fills out attestation form at `/validate/[token]` → response recorded.

**DB schema:** ✅ READY
```sql
-- validation_requests table exists with:
-- id, deployment_record_id, requestor_id, validator_email, validator_name,
-- validator_user_id, status (pending|confirmed|denied|expired), response_text,
-- attestation_text, attestation_accepted, responded_at, token (UUID unique),
-- expires_at (30 days), created_at
-- Enum: validation_request_status_enum
```

**SECURITY DEFINER functions:** ✅ READY (in migration `20260415000002_security_patch.sql`)
- `get_validation_by_token(p_token UUID)` → returns pending, non-expired request
- `submit_validation_response(p_token, p_status, p_response_text, p_attestation_accepted)` → validates and updates

**RLS:** ✅ Locked — anon/authenticated access ONLY through SECURITY DEFINER functions (no direct table access by token)

**Coin spend:** ✅ `spendCoins()` action exists with product code lookup

**What needs building:**
1. **Server action:** `requestValidation(deploymentRecordId, validatorEmail, validatorName)` — spends 10 coins, creates row, returns token
2. **Dashboard UI:** "Request Validation" button on deployment record detail page → modal/form for validator email + name
3. **Public form:** `/validate/[token]/page.tsx` — calls `get_validation_by_token()`, shows deployment details (sanitized), attestation form, legal text, confirm/deny
4. **Form submission:** calls `submit_validation_response()` via server action
5. **Status tracking:** Show validation status on deployment record detail (pending/confirmed/denied/expired)
6. **Email (defer):** Transactional email to validator with token link (can stub with console log for now)

---

#### Priority 2: Evaluation Flow (DOC-402 + DOC-403)

**What:** Member spends 20 Sky Coins → sends evaluation request to supervisor → supervisor fills ICS-225 style form at `/evaluate/[token]` → 5 performance ratings + commentary recorded.

**DB schema:** ✅ READY
```sql
-- evaluation_requests table exists with:
-- id, deployment_record_id, requestor_id, evaluator_email, evaluator_name,
-- evaluator_user_id, status (pending|completed|denied|expired),
-- rating_leadership (1-5), rating_tactical (1-5), rating_communication (1-5),
-- rating_planning (1-5), rating_technical (1-5), overall_rating (computed avg),
-- commentary, attestation_text, attestation_accepted, responded_at,
-- token (UUID unique), expires_at (30 days), created_at
-- Enum: evaluation_request_status_enum
```

**SECURITY DEFINER functions:** ✅ READY
- `get_evaluation_by_token(p_token UUID)` → returns pending, non-expired request
- `submit_evaluation_response(p_token, p_status, ratings×5, overall, commentary, attestation)` → validates all ratings 1-5, computes overall, updates

**What needs building:**
1. **Server action:** `requestEvaluation(deploymentRecordId, evaluatorEmail, evaluatorName)` — spends 20 coins, creates row, returns token
2. **Dashboard UI:** "Request Evaluation" button on deployment record detail → modal for evaluator email + name
3. **Public form:** `/evaluate/[token]/page.tsx` — shows deployment context, 5 rating sliders (Leadership, Tactical, Communication, Planning, Technical), commentary textarea, attestation checkbox
4. **Form submission:** calls `submit_evaluation_response()` via server action
5. **Status tracking:** Show evaluation status + ratings on deployment record detail
6. **Email (defer):** Same as validation — console log for now

---

#### Priority 3: Admin Dashboard (DOC-904 — not yet authored)

**Current state:** Stub page
**What it needs:** User management, membership overview, coin economy stats, platform health. Defer until validation/evaluation are built.

#### Priority 4: Agency/Org Dashboard (DOC-609 — not yet authored)

**Current state:** Stub page
**What it needs:** Organization creates account → sponsors team members → manages team credentialing. Defer to Phase 6.

#### Priority 5: Public Credential Verification (DOC-502 — draft)

**Current state:** Stub page
**What it needs:** Public page where anyone can verify a responder's credentials by name or ID. Depends on Phase 5 (certification issuance).

---

## Architecture Reference

**Key files for validation/evaluation build:**
```
src/app/validate/[token]/page.tsx          ← stub, replace
src/app/evaluate/[token]/page.tsx          ← stub, replace
src/lib/coins/actions.ts                   ← spendCoins() exists
src/components/dashboard/records/RecordDetail.tsx  ← add request buttons
supabase/migrations/20260409000003_core_tables.sql ← table definitions
supabase/migrations/20260415000002_security_patch.sql ← SECURITY DEFINER functions
```

**Patterns to follow:**
- Server actions pattern: see `src/lib/stripe/actions.ts` or `src/lib/coins/actions.ts`
- Form pattern: see `src/components/dashboard/records/RecordForm.tsx`
- Public page pattern: see `src/app/(public)/join/page.tsx`
- Coin spend: `spendCoins(userId, productCode, referenceId, referenceType, description)`
- Auth guard: `const session = await getUser(); if (!session) redirect('/login');`

**Coin product codes to use:**
- Validation: look up product where code matches validation (or create if not seeded)
- Evaluation: same — check `coin_products` table for existing codes

**Design system:**
- Navy: `var(--gs-navy)` / `#0A1628`
- Gold: `var(--gs-gold)` / `#C4A14A`
- Silver: `var(--gs-silver)`
- Components: Tailwind CSS 4 utility classes, no component library

**Testing requirement:**
- At minimum: `// TODO: test` comments on all new server actions
- Preferred: Vitest tests following `src/lib/auth/__tests__/actions.test.ts` pattern
- Self-review gate (5 checks) per `CLAUDE-CODE-DISCIPLINE.md`

---

## Migrations Status

**18 migrations exist.** Last 3 need to be applied to production Supabase:
1. `20260414000005_stripe_membership.sql`
2. `20260415000001_coin_economy_reconcile.sql`
3. `20260415000002_security_patch.sql`

**Do NOT create new migrations for validation/evaluation** — tables and functions already exist. Only create a migration if you need to add columns or modify existing schema.

---

## Environment

```
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_... (set)
STRIPE_SECRET_KEY=sk_test_... (set)
STRIPE_WEBHOOK_SECRET=whsec_... (set)
STRIPE_MEMBERSHIP_PRICE_ID=price_1TMaT84Z6KHKmKNGCojBj4rN
ENABLE_STRIPE_LIVE=false
```

---

## Recommended Build Order

1. **Validation flow** (DOC-400 + DOC-401) — highest user-facing value, schema 100% ready
2. **Evaluation flow** (DOC-402 + DOC-403) — same pattern, add ratings UI
3. **Apply remaining migrations** to production Supabase
4. **Email templates** — Supabase Dashboard config for auth emails
5. **Admin dashboard** — Phase 3 scope

**Tier:** FULL — new user-facing feature with public forms, server actions, coin economy integration, and security considerations.

**Discipline protocol:** `docs/prompts/CLAUDE-CODE-DISCIPLINE.md` — mandatory.
