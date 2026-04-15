---
doc_id: GSR-DOC-902
title: "Testing Foundation — Vitest Setup + Critical Path Test Suites"
phase: 9
status: draft
blocks_on: []
priority: critical
author: Architecture Agent (Claude App)
created: 2026-04-15
updated: 2026-04-15
notes: >
  Audit-driven. Zero tests exist across 40+ TODO markers.
  This doc installs the test framework and writes the first test suites
  covering the three highest-risk code paths: auth actions, coin economy
  functions, and the Stripe webhook handler.
  Estimated build time: 3-4 hours.
---

# GSR-DOC-902: Testing Foundation — Vitest Setup + Critical Path Test Suites

| Field | Value |
|-------|-------|
| Phase | 9 (Cross-Cutting) |
| Status | draft |
| Blocks on | none |
| Priority | critical |

---

## Purpose

The codebase has 40+ `// TODO: test` markers and zero implemented tests. No test framework is configured — no Vitest, no Jest, no Playwright in the dependency tree. For a platform that will handle real money (Stripe), legal attestations (validation/evaluation forms), and PII (responder profiles), this is a pre-launch blocker.

This doc establishes the testing foundation and writes the first critical-path test suites. It does not achieve 100% coverage — it targets the three code paths where a bug causes the most damage:

1. **Auth actions** — Registration, login, password reset, session handling. A bug here means unauthorized access or locked-out users.
2. **Coin economy functions** — `spend_coins()`, `credit_coins()`, balance calculations, frozen account enforcement. A bug here means financial discrepancy — members lose coins or get free coins.
3. **Stripe webhook handler** — Event signature verification, idempotent processing, membership status mapping, coin grant logic, 11-month renewal guard. A bug here means payment processing failures, double-grants, or lost revenue.

**What this doc builds:**
- Vitest configuration for Next.js 16 + TypeScript 5 + React 19
- Test utilities: Supabase client mocking, auth context helpers, Stripe event factories
- Auth action test suite (unit tests)
- Coin economy test suite (unit tests for server actions + integration patterns for database functions)
- Stripe webhook test suite (unit tests with mocked Stripe signature verification)
- CI integration: add test step to GitHub Actions workflow

**What this doc does NOT build:**
- E2E tests (Playwright — future doc)
- Component/UI tests (React Testing Library — future doc)
- Load/performance tests
- Database integration tests requiring a live Supabase instance (those require a test environment — future doc)

**Why unit tests first:**
The audit identified specific code paths with financial and security impact. Unit tests with mocked dependencies can be written now, run in CI, and catch regressions immediately. Integration tests against a live database require a test Supabase project and seed data pipeline — that's a separate infrastructure decision.

---

## Data Entities

No database changes. This doc creates test files only.

---

## Structure

### New Files

```
vitest.config.ts                                        — Vitest configuration
src/test/setup.ts                                       — Global test setup (env vars, mocks)
src/test/utils/supabase-mock.ts                         — Supabase client mock factory
src/test/utils/auth-helpers.ts                          — Auth context helpers for tests
src/test/utils/stripe-helpers.ts                        — Stripe event/webhook factories
src/test/utils/coin-helpers.ts                          — Coin economy test data factories

src/lib/auth/__tests__/actions.test.ts                  — Auth server actions tests
src/lib/actions/__tests__/coins.test.ts                 — Coin economy server actions tests
src/app/api/stripe/webhook/__tests__/route.test.ts      — Stripe webhook handler tests
```

### Modified Files

```
package.json                                             — Add vitest, @testing-library/react, test scripts
tsconfig.json                                            — Add test path aliases if needed
.github/workflows/ci.yml                                 — Add test step after lint + type-check
```

---

## Business Rules

1. **Tests must not require external services.** All Supabase calls are mocked. All Stripe calls are mocked. Tests run offline, in CI, with zero infrastructure dependencies.

2. **Tests must run in CI before build.** The GitHub Actions workflow adds `npm run test` after lint and type-check, before build. A failing test blocks the build.

3. **Test naming convention:** `describe('[ModuleName]')` → `it('should [behavior]')`. Test files live adjacent to the code they test in `__tests__/` directories.

4. **Mock boundaries:** Supabase client methods (`.from()`, `.rpc()`, `.auth.*`) are mocked at the import level. Server actions are tested as functions with mocked dependencies. The Stripe webhook handler is tested by constructing mock `Request` objects with valid/invalid payloads.

5. **No snapshot tests.** Every assertion is explicit. Snapshot tests are brittle for server-side logic.

6. **Coverage thresholds are NOT enforced in this doc.** The goal is to establish the framework and write the first critical suites. Coverage enforcement comes in a follow-up doc after more suites are written.

---

## Copy Direction

No user-facing copy. Test files only.

---

## Acceptance Criteria

1. `npm run test` executes Vitest and passes all test suites
2. `vitest.config.ts` is configured for Next.js 16 + TypeScript 5 (path aliases resolve, React JSX transform works)
3. Auth test suite covers: registration validation, login with valid/invalid credentials, password reset flow, session refresh, rate limit behavior
4. Coin economy test suite covers: spend with sufficient balance succeeds, spend with insufficient balance fails, spend on frozen account fails, credit updates balance correctly, product lookup returns correct pricing, zero-amount transactions are rejected
5. Stripe webhook test suite covers: valid signature passes verification, invalid signature is rejected, duplicate event ID is handled idempotently, checkout.session.completed grants coins, invoice.payment_succeeded with 11-month guard, subscription status mapping (active, past_due, canceled, unpaid), customer.subscription.updated freezes/unfreezes coin account
6. All test utilities (supabase-mock, auth-helpers, stripe-helpers, coin-helpers) are importable and documented with JSDoc comments
7. GitHub Actions CI workflow includes `npm run test` step that runs after lint and type-check
8. `npm run build` still passes with zero errors (tests don't break the build configuration)
9. No `// TODO: test` markers remain in the files that have been covered by test suites (auth actions, coin actions, stripe webhook)
10. Test files follow the project's existing TypeScript and linting configuration

---

## Agent Lenses

### Baseplate (data/schema)
- No schema changes. Mock factories produce typed test data matching the existing TypeScript interfaces from `src/lib/types/`.
- Supabase mock returns typed responses that match the real client's return shape (`{ data, error }`).

### Meridian (doctrine)
- N/A — tests verify technical behavior, not doctrine alignment.

### Lookout (UX)
- N/A — no UI components in this doc.

### Threshold (security)
- Auth tests verify that invalid credentials return generic error messages (no user enumeration).
- Stripe webhook tests verify signature verification — the first line of defense against spoofed webhook payloads.
- Coin tests verify that frozen accounts cannot spend — a critical business rule for lapsed memberships.
- No real secrets or credentials appear in test files. All API keys, webhook secrets, and tokens in tests are obviously fake (`sk_test_fake_key_for_testing`).

---

## Claude Code Prompt

You are setting up the testing foundation for the Grey Sky Responder Society portal. This is a Next.js 16 + Supabase + TypeScript 5 application.

### What You Are Building

1. Vitest configuration for the existing Next.js 16 project
2. Test utility modules (Supabase mock, auth helpers, Stripe helpers, coin helpers)
3. Three critical-path test suites: auth actions, coin economy, Stripe webhook
4. CI integration (GitHub Actions test step)

### Prerequisites

The following already exist:
- Next.js 16.1.6 application with App Router, React 19, TypeScript 5
- `src/lib/auth/actions.ts` — server actions for registration, login, password reset
- `src/lib/actions/coins.ts` — server actions for coin balance, spend, credit, product lookup (or wherever coin server actions live — check the actual file paths)
- `src/app/api/stripe/webhook/route.ts` — Stripe webhook handler (or similar path — check `src/app/api/`)
- `src/lib/types/` — TypeScript interfaces for User, CoinAccount, CoinTransaction, etc.
- `src/lib/validators/` — Zod schemas for auth, coins, etc.
- `src/lib/supabase/client.ts` and `src/lib/supabase/admin.ts` — Supabase client factories
- `.github/workflows/` — CI workflow file(s)
- `tsconfig.json` with path aliases (`@/` → `src/`)
- `package.json` with existing scripts: `dev`, `build`, `lint`

### Step 1: Install Dependencies

```bash
npm install -D vitest @vitejs/plugin-react @testing-library/react @testing-library/jest-dom jsdom
```

Do NOT install Jest — we are using Vitest exclusively.

### Step 2: Vitest Configuration

Create `vitest.config.ts` at project root:

```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/__tests__/**/*.test.{ts,tsx}', 'src/**/*.test.{ts,tsx}'],
    exclude: ['node_modules', '.next', 'out'],
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

### Step 3: Test Setup

Create `src/test/setup.ts`:

```typescript
import '@testing-library/jest-dom';

// Mock environment variables used by the application
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test-project.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRlc3QiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTcwMDAwMDAwMCwiZXhwIjoxNzAwMDAwMDAwfQ.fake-test-key';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRlc3QiLCJyb2xlIjoic2VydmljZV9yb2xlIiwiaWF0IjoxNzAwMDAwMDAwLCJleHAiOjE3MDAwMDAwMDB9.fake-service-key';
process.env.STRIPE_SECRET_KEY = 'sk_test_fake_key_for_testing_only';
process.env.STRIPE_WEBHOOK_SECRET = 'whsec_fake_webhook_secret_for_testing';
process.env.NEXT_PUBLIC_SITE_URL = 'http://localhost:3000';
```

### Step 4: Supabase Mock Factory

Create `src/test/utils/supabase-mock.ts`:

```typescript
/**
 * Factory for creating mocked Supabase clients in tests.
 *
 * Usage:
 *   const { client, mockFrom, mockRpc, mockAuth } = createMockSupabaseClient();
 *   mockFrom('users').select.mockResolvedValue({ data: [mockUser], error: null });
 *   mockRpc('get_dashboard_stats').mockResolvedValue({ data: mockStats, error: null });
 */

import { vi } from 'vitest';

export function createMockSupabaseClient() {
  const mockChain = {
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    neq: vi.fn().mockReturnThis(),
    gt: vi.fn().mockReturnThis(),
    lt: vi.fn().mockReturnThis(),
    gte: vi.fn().mockReturnThis(),
    lte: vi.fn().mockReturnThis(),
    in: vi.fn().mockReturnThis(),
    is: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    range: vi.fn().mockReturnThis(),
    single: vi.fn().mockReturnThis(),
    maybeSingle: vi.fn().mockReturnThis(),
    then: vi.fn(),
  };

  // Make the chain resolve by default
  const defaultResolution = { data: null, error: null };
  Object.keys(mockChain).forEach((key) => {
    if (key !== 'then') {
      (mockChain as Record<string, ReturnType<typeof vi.fn>>)[key].mockReturnValue(
        Object.assign(Promise.resolve(defaultResolution), mockChain)
      );
    }
  });

  const fromMocks = new Map<string, typeof mockChain>();

  const mockFrom = (table: string) => {
    if (!fromMocks.has(table)) {
      fromMocks.set(table, { ...mockChain });
    }
    return fromMocks.get(table)!;
  };

  const rpcMocks = new Map<string, ReturnType<typeof vi.fn>>();

  const mockRpc = (fn: string) => {
    if (!rpcMocks.has(fn)) {
      rpcMocks.set(fn, vi.fn().mockResolvedValue({ data: null, error: null }));
    }
    return rpcMocks.get(fn)!;
  };

  const mockAuth = {
    signUp: vi.fn().mockResolvedValue({ data: { user: null, session: null }, error: null }),
    signInWithPassword: vi.fn().mockResolvedValue({ data: { user: null, session: null }, error: null }),
    signOut: vi.fn().mockResolvedValue({ error: null }),
    resetPasswordForEmail: vi.fn().mockResolvedValue({ data: {}, error: null }),
    getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
    getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
    mfa: {
      enroll: vi.fn(),
      challenge: vi.fn(),
      verify: vi.fn(),
      getAuthenticatorAssuranceLevel: vi.fn(),
    },
  };

  const client = {
    from: vi.fn((table: string) => mockFrom(table)),
    rpc: vi.fn((fn: string, params?: Record<string, unknown>) => mockRpc(fn)(params)),
    auth: mockAuth,
    storage: {
      from: vi.fn().mockReturnValue({
        upload: vi.fn().mockResolvedValue({ data: { path: 'test/path' }, error: null }),
        download: vi.fn().mockResolvedValue({ data: new Blob(), error: null }),
        remove: vi.fn().mockResolvedValue({ data: [], error: null }),
        createSignedUrl: vi.fn().mockResolvedValue({ data: { signedUrl: 'https://test.url' }, error: null }),
      }),
    },
  };

  return { client, mockFrom, mockRpc, mockAuth };
}
```

### Step 5: Auth Test Helpers

Create `src/test/utils/auth-helpers.ts`:

```typescript
/**
 * Auth context helpers for testing server actions that require authentication.
 */

import { vi } from 'vitest';

export const mockUser = {
  id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  email: 'test@greysky.dev',
  first_name: 'Test',
  last_name: 'Responder',
  role: 'member' as const,
  membership_status: 'active' as const,
  status: 'active' as const,
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
};

export const mockAdminUser = {
  ...mockUser,
  id: 'admin-uuid-1234-5678-abcdef012345',
  email: 'admin@greysky.dev',
  role: 'platform_admin' as const,
};

/**
 * Mock the getUser helper to return a specific user for testing server actions.
 */
export function mockAuthContext(user = mockUser) {
  return vi.fn().mockResolvedValue(user);
}

/**
 * Mock the getUser helper to simulate an unauthenticated request.
 */
export function mockUnauthenticated() {
  return vi.fn().mockResolvedValue(null);
}
```

### Step 6: Stripe Test Helpers

Create `src/test/utils/stripe-helpers.ts`:

```typescript
/**
 * Stripe event and webhook factories for testing the webhook handler.
 */

import { vi } from 'vitest';
import crypto from 'crypto';

const FAKE_WEBHOOK_SECRET = 'whsec_fake_webhook_secret_for_testing';

/**
 * Create a mock Stripe event object.
 */
export function createStripeEvent(type: string, data: Record<string, unknown>, id?: string) {
  return {
    id: id || `evt_test_${crypto.randomUUID().replace(/-/g, '').slice(0, 24)}`,
    type,
    data: { object: data },
    created: Math.floor(Date.now() / 1000),
    livemode: false,
    api_version: '2024-12-18.acacia',
  };
}

/**
 * Create a mock checkout.session.completed event for membership purchase.
 */
export function createCheckoutEvent(overrides: Record<string, unknown> = {}) {
  return createStripeEvent('checkout.session.completed', {
    id: 'cs_test_session_id',
    mode: 'subscription',
    customer: 'cus_test_customer',
    subscription: 'sub_test_subscription',
    client_reference_id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    metadata: { user_id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', product_type: 'membership' },
    ...overrides,
  });
}

/**
 * Create a mock invoice.payment_succeeded event for renewal.
 */
export function createRenewalEvent(overrides: Record<string, unknown> = {}) {
  return createStripeEvent('invoice.payment_succeeded', {
    id: 'in_test_invoice',
    customer: 'cus_test_customer',
    subscription: 'sub_test_subscription',
    billing_reason: 'subscription_cycle',
    ...overrides,
  });
}

/**
 * Create a mock customer.subscription.updated event.
 */
export function createSubscriptionUpdateEvent(status: string, overrides: Record<string, unknown> = {}) {
  return createStripeEvent('customer.subscription.updated', {
    id: 'sub_test_subscription',
    customer: 'cus_test_customer',
    status,
    ...overrides,
  });
}

/**
 * Build a mock Request object simulating a Stripe webhook POST.
 * Does NOT use a real Stripe signature — tests should mock the verification function.
 */
export function buildWebhookRequest(event: ReturnType<typeof createStripeEvent>): Request {
  const body = JSON.stringify(event);
  const timestamp = Math.floor(Date.now() / 1000);
  const signature = `t=${timestamp},v1=fake_signature_for_testing`;

  return new Request('http://localhost:3000/api/stripe/webhook', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'stripe-signature': signature,
    },
    body,
  });
}
```

### Step 7: Coin Test Helpers

Create `src/test/utils/coin-helpers.ts`:

```typescript
/**
 * Coin economy test data factories.
 */

export const mockCoinAccount = {
  id: 'coin-account-uuid-1234',
  user_id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  balance: 1000,
  lifetime_earned: 1000,
  lifetime_spent: 0,
  frozen: false,
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
};

export const mockFrozenAccount = {
  ...mockCoinAccount,
  id: 'frozen-account-uuid-5678',
  frozen: true,
};

export const mockProduct = {
  id: 'product-uuid-validation-request',
  code: 'validation_request',
  name: 'Validation Request',
  description: 'Request a 360-degree validation',
  tier: 2,
  cost_coins: 100,
  earn_coins: 0,
  category: 'network',
  is_active: true,
  requires_staff_action: false,
  metadata: {},
};

export const mockExpensiveProduct = {
  ...mockProduct,
  id: 'product-uuid-cert-standard',
  code: 'certification_standard',
  name: 'Certification — Standard',
  cost_coins: 5000,
  tier: 3,
  category: 'certification',
};

export function createMockTransaction(overrides: Record<string, unknown> = {}) {
  return {
    id: `txn-${Math.random().toString(36).slice(2, 10)}`,
    account_id: mockCoinAccount.id,
    type: 'membership_grant',
    amount: 1000,
    balance_after: 1000,
    product_code: null,
    reference_id: null,
    reference_type: null,
    description: 'Annual membership — 1,000 Sky Coins',
    metadata: {},
    created_at: new Date().toISOString(),
    created_by: null,
    ...overrides,
  };
}
```

### Step 8: Auth Actions Test Suite

Create `src/lib/auth/__tests__/actions.test.ts`:

Write tests for the auth server actions. Before writing, read `src/lib/auth/actions.ts` to understand the actual function signatures and dependencies. Then test:

**Registration tests:**
- `it('should reject registration with invalid email format')`
- `it('should reject registration with password shorter than 12 characters')`
- `it('should reject registration with password longer than 128 characters')`
- `it('should call supabase.auth.signUp with valid credentials')`
- `it('should return error message on duplicate email')`

**Login tests:**
- `it('should call supabase.auth.signInWithPassword with credentials')`
- `it('should return generic error on invalid credentials')` — verify the error message is "Invalid email or password" and does NOT differentiate between "user not found" and "wrong password"
- `it('should redirect to dashboard on successful login')`
- `it('should reject redirect URLs that are not relative paths')` — the open redirect fix

**Password reset tests:**
- `it('should call supabase.auth.resetPasswordForEmail')`
- `it('should return success even if email does not exist')` — prevents user enumeration

Mock the Supabase client at the module level using `vi.mock()`. Mock `next/navigation` for redirect assertions. Import the actual action functions and test them.

### Step 9: Coin Economy Test Suite

Create `src/lib/actions/__tests__/coins.test.ts`:

Read the actual coin server actions file to understand function signatures. Then test:

**Balance tests:**
- `it('should return balance for authenticated user')`
- `it('should return default values when account does not exist')`

**Spend tests:**
- `it('should succeed when balance is sufficient')`
- `it('should fail when balance is insufficient')` — verify error message includes the shortfall amount
- `it('should fail when account is frozen')` — verify error message mentions inactive membership
- `it('should reject zero or negative amounts')`
- `it('should look up product price at transaction time, not page load')`

**Credit tests:**
- `it('should add coins and update balance')`
- `it('should update lifetime_earned')`
- `it('should reject zero or negative credit amounts')`

**Product catalog tests:**
- `it('should return active products only')`
- `it('should filter products by category')`

### Step 10: Stripe Webhook Test Suite

Create `src/app/api/stripe/webhook/__tests__/route.test.ts`:

Read the actual webhook route handler to understand its structure. Then test:

**Signature verification:**
- `it('should return 400 when stripe-signature header is missing')`
- `it('should return 400 when signature verification fails')`

**Idempotency:**
- `it('should return 200 and skip processing for duplicate event IDs')`

**checkout.session.completed:**
- `it('should activate membership on checkout completion')`
- `it('should grant 1000 Sky Coins on membership purchase')`
- `it('should create coin account if one does not exist')`

**invoice.payment_succeeded (renewal):**
- `it('should grant coins on renewal')`
- `it('should NOT grant coins if last grant was within 11 months')` — the 11-month guard

**customer.subscription.updated:**
- `it('should map active status to active membership')`
- `it('should map past_due status to active membership')` — grace period
- `it('should map canceled status to expired membership')`
- `it('should map unpaid status to expired membership')`
- `it('should freeze coin account when membership expires')`
- `it('should unfreeze coin account when membership reactivates')`

**Error handling:**
- `it('should return 200 for unhandled event types')` — webhook should acknowledge unhandled events to prevent Stripe retries
- `it('should log errors but return 200 to prevent Stripe retry storms')`

Mock Stripe's `constructEvent()` at the module level. Mock the Supabase admin client for database operations within the handler.

### Step 11: Package.json Scripts

Add to `package.json` scripts:

```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage"
  }
}
```

### Step 12: CI Integration

Edit the GitHub Actions CI workflow (`.github/workflows/ci.yml` or similar):

Add a test step AFTER lint and type-check, BEFORE build:

```yaml
      - name: Run tests
        run: npm run test
```

The test step should fail the pipeline if any test fails.

### Step 13: Clean Up TODO Markers

In the files you've just covered with tests, search for `// TODO: test` comments and remove them. Only remove TODOs in files where you've actually written corresponding tests. Do not remove TODOs in files that are not covered by this doc.

### Step 14: Verify

1. `npm run test` executes and all tests pass
2. `npm run build` still passes with zero errors
3. `vitest.config.ts` exists at project root
4. `src/test/setup.ts` exists and sets mock environment variables
5. All four test utility modules exist in `src/test/utils/`
6. Three test suites exist: auth, coins, stripe webhook
7. CI workflow includes the test step
8. No `// TODO: test` comments remain in auth actions, coin actions, or stripe webhook handler files

### Commit Message

`GSR-DOC-902: testing foundation — vitest config, test utils, auth + coins + stripe webhook suites`
