# Grey Sky Responder Society — Claude App Build Report

**Date:** April 16, 2026
**HEAD:** `25f8caa` (main, 67 commits)
**CI/CD:** ✅ Both CI and Deploy to Azure passing
**Live URL:** https://greysky.dev
**Stack:** Next.js 16.1.6 · React 19.2.3 · Tailwind CSS 4 · TypeScript 5 · Supabase Postgres 17.6 · Azure Static Web Apps (East US 2)

---

## Current State: ~85% Internal Testing Ready

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
- **NEW:** Validation + evaluation request buttons on submitted records
- **NEW:** Validation history section with status badges
- **NEW:** Evaluation history section with ICS-225 rating display

**Incidents (DOC-204)**
- Create, list, detail pages
- Public and member views

**Sky Coins Economy (DOC-205)**
- Balance view + ledger history
- `spend_coins()` and `credit_coins()` with `FOR UPDATE` row locking
- 28 coin products seeded (includes `validation_request` at 10 coins, `evaluation_request` at 20 coins)
- Purchase page (UI done, needs Stripe products for coin packs)

**Document Library (DOC-206)**
- Upload, list, view, signed URL download
- Category + avatar support (DOC-206 v2)

**Stripe Membership (DOC-207)**
- Webhook handler: `checkout.session.completed`, `invoice.payment_succeeded`, `customer.subscription.updated`, `customer.subscription.deleted`
- Idempotency via `stripe_events` table
- Membership activation → 1,000 Sky Coins grant on purchase/renewal
- `getOrCreateStripeCustomer()` with Supabase persistence
- Customer portal action for subscription management
- MembershipCta component with checkout flow
- Test-mode keys configured (`.env.local` + Azure SWA + GitHub Secrets)
- Webhook endpoint registered: `https://greysky.dev/api/stripe/webhook`
- Product: Grey Sky Annual Membership ($100/yr) — `price_1TMaT84Z6KHKmKNGCojBj4rN`

**Validation Flow (DOC-400 + DOC-401)** ✅ BUILT
- **Request:** `requestValidation()` server action — Zod-validated, membership gated, duplicate guard, spends 10 Sky Coins
- **Dashboard modal:** `RequestValidationModal` — email + name + relationship context fields
- **Public page:** `/validate/[token]` — deployment summary, confirm/deny decision, attestation checkbox, comments field
- **Submission:** `submitValidationResponse()` — calls `submit_validation_response()` SECURITY DEFINER function
- **Status tracking:** `ValidationStatusBadge` (pending/confirmed/denied/expired), `ValidationSummary` list on record detail
- **Token security:** `get_validation_token_view()` SECURITY DEFINER function joins deployment + user + incident, returns only sanitized fields, filters expired/used tokens
- **Email:** Deferred — console logs token URL in non-production

**Evaluation Flow (DOC-402 + DOC-403)** ✅ BUILT
- **Request:** `requestEvaluation()` server action — Zod-validated, membership gated, duplicate guard, spends 20 Sky Coins
- **Dashboard modal:** `RequestEvaluationModal` — email + name + evaluator role fields
- **Public page:** `/evaluate/[token]` — ICS-225 style 5-area performance rating form
- **Rating areas:** Leadership, Tactical, Communication, Planning, Technical (each 1–5 scale)
- **Rating scale:** Outstanding (5), Superior (4), Satisfactory (3), Needs Improvement (2), Unsatisfactory (1)
- **Overall rating:** Computed average (1.00–5.00)
- **Submission:** `submitEvaluationResponse()` — calls `submit_evaluation_response()` SECURITY DEFINER function
- **Status tracking:** `EvaluationStatusBadge` (pending/completed/denied/expired), `EvaluationRatingDisplay` with colored bar chart + commentary
- **Decline flow:** Evaluator can decline without ratings, optional reason field
- **Attestation:** Required for completed evaluations; ICS-225 professional assessment language
- **Token security:** `get_evaluation_token_view()` SECURITY DEFINER function (same pattern as validation)
- **Email:** Deferred — console logs token URL in non-production

**Public Marketing Pages (DOC-005, DOC-101, DOC-102)**
- Home, About, Membership, Join/Tell Your Story, Community
- Teams (20 teams) with detail pages
- Standards (17 SRT disciplines) with FEMA RTLT detail pages
- Positions index (625 entries) with detail pages
- Organizations index

**Security (DOC-900, DOC-901, DOC-902)**
- RLS on all 36 tables
- Token-based access via SECURITY DEFINER functions (no open RLS for validation/evaluation)
- CSP headers, rate limiting, input sanitization
- MFA enforcement on `/admin` prefix

**Testing (DOC-902)**
- Vitest configured with 46 tests across 3 suites
  - Auth actions: 17 tests
  - Coin economy: 13 tests
  - Stripe webhook: 16 tests
- CI runs lint + type-check + test + build on every push

---

## Migrations

**19 migrations total.** The following need to be applied to production Supabase:

| Migration | Purpose | Status |
|-----------|---------|--------|
| `20260414000005_stripe_membership.sql` | Stripe events table, membership columns on users | Pending |
| `20260415000001_coin_economy_reconcile.sql` | Coin economy reconciliation, product seeding | Pending |
| `20260415000002_security_patch.sql` | SECURITY DEFINER functions for validation + evaluation submit | Pending |
| `20260415000003_token_view_functions.sql` | Token view functions (deployment summary joins) for `/validate` and `/evaluate` pages | **NEW — Pending** |

**⚠️ All four must be applied before validation/evaluation flows work in production.**

---

## File Inventory — Validation + Evaluation (16 changed files, +1,577 lines)

### Server Actions + Schemas
```
src/lib/validation/actions.ts           — requestValidation, getValidationByToken, submitValidationResponse, getDeploymentValidations
src/lib/validation/schemas.ts           — requestValidationSchema, submitValidationSchema (Zod)
src/lib/evaluation/actions.ts           — requestEvaluation, getEvaluationByToken, submitEvaluationResponse, getDeploymentEvaluations
src/lib/evaluation/schemas.ts           — requestEvaluationSchema, submitEvaluationSchema (discriminated union), RATING_AREAS, RATING_LABELS
```

### Components
```
src/components/validation/RequestValidationModal.tsx     — modal form (email, name, context)
src/components/validation/ValidationResponseForm.tsx     — public token form (confirm/deny + attestation)
src/components/validation/ValidationStatusBadge.tsx      — pending/confirmed/denied/expired badge

src/components/evaluation/RequestEvaluationModal.tsx     — modal form (email, name, role)
src/components/evaluation/EvaluationResponseForm.tsx     — public token form (5 ratings + commentary + attestation)
src/components/evaluation/EvaluationRatingDisplay.tsx    — bar chart display of ratings + overall score
src/components/evaluation/EvaluationStatusBadge.tsx      — pending/completed/denied/expired badge
```

### Pages
```
src/app/validate/[token]/page.tsx                                — public validation page (server component, calls getValidationByToken)
src/app/evaluate/[token]/page.tsx                                — public evaluation page (server component, calls getEvaluationByToken)
src/app/(dashboard)/dashboard/records/[id]/page.tsx              — updated: fetches validations + evaluations, passes to RecordDetail
src/components/dashboard/records/RecordDetail.tsx                 — updated: request buttons, validation history, evaluation history + ratings
```

### Database
```
supabase/migrations/20260415000003_token_view_functions.sql      — get_validation_token_view, get_evaluation_token_view (SECURITY DEFINER)
```

---

## Key Types (for reference)

### ValidationTokenView (returned by get_validation_token_view)
```typescript
{
  request: { id, status, validator_email, validator_name, expires_at, responded_at }
  deployment: { id, start_date, end_date, position_title, agency }
  member: { first_name, last_name }
  incident: { id, name, type, state } | null
}
```

### EvaluationTokenView (returned by get_evaluation_token_view)
```typescript
{
  request: { id, status, evaluator_email, evaluator_name, expires_at, responded_at }
  deployment: { id, start_date, end_date, position_title, agency }
  member: { first_name, last_name }
  incident: { id, name, type, state } | null
}
```

### ValidationSummary (returned by getDeploymentValidations)
```typescript
{
  id, status, validatorName, validatorEmail, respondedAt, createdAt, expiresAt, responseText
}
```

### EvaluationSummary (returned by getDeploymentEvaluations)
```typescript
{
  id, status, evaluatorName, evaluatorEmail, respondedAt, createdAt, expiresAt,
  ratings: { leadership, tactical, communication, planning, technical, overall },
  commentary
}
```

---

## DB Functions (existing, ready to use)

| Function | Grants | Purpose |
|----------|--------|---------|
| `get_validation_by_token(UUID)` | anon, authenticated | Returns pending non-expired validation request (migration 002) |
| `submit_validation_response(UUID, TEXT, TEXT, BOOLEAN)` | anon, authenticated | Updates validation status/response (migration 002) |
| `get_evaluation_by_token(UUID)` | anon, authenticated | Returns pending non-expired evaluation request (migration 002) |
| `submit_evaluation_response(UUID, TEXT, INT×5, NUMERIC, TEXT, BOOLEAN)` | anon, authenticated | Updates evaluation with ratings (migration 002) |
| `get_validation_token_view(UUID)` | anon, authenticated | Joined deployment summary for validation page (migration 003) |
| `get_evaluation_token_view(UUID)` | anon, authenticated | Joined deployment summary for evaluation page (migration 003) |

---

## Coin Product Codes

| Code | Cost | Used By |
|------|------|---------|
| `validation_request` | 10 | `requestValidation()` |
| `evaluation_request` | 20 | `requestEvaluation()` |

---

## Architecture Patterns (for new builds)

**Server action pattern:**
```typescript
// See src/lib/validation/actions.ts or src/lib/evaluation/actions.ts
export async function requestX(input: XInput): Promise<{ success: true; token: string } | { error: string }> {
  const parsed = schema.safeParse(input);     // 1. Validate
  const session = await getUser();             // 2. Auth check
  // 3. Membership check
  // 4. Ownership check (query deployment_records)
  // 5. Duplicate guard (check existing pending)
  // 6. Coin spend
  // 7. Insert record
  // 8. Return token
}
```

**Component pattern:**
```typescript
// Modals: see RequestValidationModal.tsx / RequestEvaluationModal.tsx
// Public forms: see ValidationResponseForm.tsx / EvaluationResponseForm.tsx
// Status badges: see ValidationStatusBadge.tsx / EvaluationStatusBadge.tsx
```

**Design system:**
- Navy: `var(--gs-navy)` / `#0A1628`
- Gold: `var(--gs-gold)` / `#C4A14A`
- Steel: `var(--gs-steel)` (secondary text)
- Cloud: `var(--gs-cloud)` (borders)
- Components: Tailwind CSS 4 utility classes, no component library

---

## ⚠️ Known Gaps (Not Code Blockers)

| Item | What's needed | Effort |
|------|--------------|--------|
| Supabase email templates | Configure verification + password reset email templates in Supabase Dashboard | 15 min |
| Transactional email for validation/evaluation tokens | Send email with token URL to validator/evaluator (currently console.log in dev) | 2-4h |
| Coin purchase packs | Create Stripe products for coin pack tiers (if selling coins separately from membership) | 15 min |
| Rate limiter upgrade | Replace in-memory with Redis/Upstash — resets on every deployment | 1-2h |

---

## 🔴 Next Build Priorities

### Priority 1: Drop `password_hash` from `public.users` (Security)
- Remove column from table + TypeScript User type
- Quick migration + type update

### Priority 2: Replace `createAdminClient()` in Dashboard (Security)
- Dashboard pages using admin client should use session client or scoped SECURITY DEFINER functions
- Audit `src/` for `createAdminClient` usage and migrate each call

### Priority 3: Stripe Webhook + Coin Economy Integration Tests (DOC-902)
- Stand up integration tests before taking real payments
- Test `checkout.session.completed` → membership activated → 1,000 coins credited
- Test coin spend failure when balance insufficient

### Priority 4: Admin Dashboard (DOC-904 — not yet authored)
- User management, membership overview, coin economy stats, platform health
- Stub page exists

### Priority 5: Agency/Org Dashboard (DOC-609 — not yet authored)
- Organization creates account → sponsors team members → manages team credentialing
- Phase 6 scope

### Priority 6: WatchOffice Public Feed + Lifelines Routes (Marketing)
- WatchOffice: ATLAS already produces data, needs public render page
- Lifelines: community identity layer, 7 FEMA Community Lifelines + Water Systems

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

## Discipline Protocol

Every Claude Code session must follow `docs/prompts/CLAUDE-CODE-DISCIPLINE.md`:
1. **Security (Threshold)** — No exposed secrets, no PII leakage, auth boundaries enforced, RLS respected
2. **Doctrine (Meridian)** — NIMS/ICS terminology, professional language
3. **UX (Lookout)** — Accessible, clear error states, mobile-responsive
4. **Error Handling** — Every async op wrapped, user-facing errors are clear
5. **Test Coverage** — At minimum `// TODO: test` comments; preferred: Vitest tests

**Hard rules:** No `rm -rf`, no `DROP TABLE`, no `git push --force`, no `git reset --hard`. No exceptions without explicit user approval.
