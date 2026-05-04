# GSR-DOC-208 — Claude Code Dispatch Package

**Tier:** Full
**Doc:** `docs/design/GSR-DOC-208-STRIPE-INTEGRATION.md`
**Status:** approved (locked by Roy 2026-05-02)
**Blocks on:** GSR-DOC-205 (Sky Coins economy) — satisfied
**Working directory:** `/Users/roydunn/.openclaw/workspace/grey-sky-site`
**Branch:** `main` (current HEAD: `71a83bc`)

---

## Pre-Flight

Before launching Claude Code, confirm:

- [ ] Working tree is clean (`git status` shows nothing)
- [ ] On `main`, in sync with `origin/main`
- [ ] Stripe test-mode credentials available (or willing to defer to env-stub for build)
- [ ] Local Supabase instance running (or staging access for migration verification)
- [ ] Existing scaffold present:
  - `src/app/api/stripe/webhook/route.ts`
  - `src/lib/types/stripe.ts`
  - `src/app/api/stripe/webhook/__tests__/route.test.ts`

---

## Launch Command

From repo root:

```bash
cd /Users/roydunn/.openclaw/workspace/grey-sky-site
claude
```

Then paste the launch prompt below as your first message.

---

## Launch Prompt (paste verbatim into Claude Code)

```
You are executing GSR-DOC-208 — Stripe Integration — as a Full tier build session
under the Grey Sky dispatch protocol.

Mandatory reads BEFORE writing any code:
1. docs/agents/CLAUDE-CODE-DISCIPLINE.md     (self-review gate, investigation
                                              protocol, safety guardrails,
                                              completion report format)
2. docs/design/GSR-DOC-208-STRIPE-INTEGRATION.md   (the full design doc — your
                                                   authoritative spec)
3. docs/design/GSR-DOC-205-SKY-COINS-ECONOMY.md    (blocks-on dependency —
                                                   ledger functions and
                                                   idempotency model)

Authoritative build instructions live in the "## Claude Code Prompt" section of
GSR-DOC-208 (around line 573). Follow that section step by step. Do not
parallelize within the build sequence.

Stack guardrails:
- Hosting is Azure Static Web Apps. Do NOT introduce Vercel-specific features,
  configs, or dependencies.
- TypeScript strict. No `any`. Zod schemas at API boundaries.
- Supabase RLS must remain enforced; INSERT/UPDATE/DELETE on Stripe tables is
  service-role-only via the webhook handler.
- Stripe API version is pinned: `2024-12-18.acacia`. Do not auto-upgrade.
- npm only. Pin major versions. No `latest`.

Required deliverables at session end:
1. Database migrations applied cleanly to a local Supabase instance (or staging
   if local is unavailable). Provide the verification output.
2. Webhook handler covers: customer.subscription.created/updated/deleted,
   invoice.paid, invoice.payment_failed, checkout.session.completed (coin pack).
3. Idempotency: every coin grant from a Stripe event passes
   `idempotency_key = stripe_event_id` to `grant_coins`. Replay-safe.
4. PCI scope: zero card data ever touches the server. Stripe Checkout +
   Customer Portal only.
5. Tests: existing `route.test.ts` continues to pass; new tests added for new
   handlers. `npm test` is green.
6. `npm run build` is green. `npm run lint` is green.
7. Final Completion Report (format defined in CLAUDE-CODE-DISCIPLINE.md) with
   Verification Evidence — actual command output, not claims.

Investigation protocol applies:
- 3-strike rule: if a single problem isn't solved after three attempts, stop
  and ask. Do not flail.
- When a fix doesn't work, hypothesize WHY before retrying.

Safety:
- Do not run destructive migrations against production Supabase. Local or
  staging only. If unsure, ask.
- Do not commit secrets. `.env.example` only — never `.env`.
- Do not push to `main` directly. Stage commits; ATLAS will review and merge.

Begin by reading the three mandatory files in order, then summarize back to me:
(a) what the discipline doc requires, (b) the DOC-208 build sequence in your
own words, (c) the DOC-205 functions/signatures you'll need to inspect or
extend. Wait for my "go" before writing code.
```

---

## ATLAS Post-Session Review (Two-Stage Gate)

When Claude Code finishes and provides the Completion Report, ATLAS runs:

### Stage 1 — Spec Compliance Review
- [ ] Verification Evidence present (real command output, not claims)
- [ ] Migrations applied cleanly (migration log shown)
- [ ] All required webhook events handled
- [ ] Idempotency key flow demonstrable
- [ ] Tests added for new handlers
- [ ] `npm run build` green (output shown)
- [ ] `npm run lint` green (output shown)
- [ ] `npm test` green (output shown, full suite)
- [ ] Acceptance criteria from DOC-208 ticked off

If any gap → send back to Claude Code with specific fix list. Re-review.

### Stage 2 — Code Quality Review (only after Stage 1 passes)
Run agent lenses on changed files:
- **Baseplate** — foundations, naming, module boundaries
- **Meridian** — doctrine and stack compliance (Azure SWA, no Vercel, no `any`)
- **Lookout** — security: RLS, secrets handling, webhook signature verification, PCI scope
- **Threshold** — UX: copy direction adherence, error messaging, grace-period banner

Categorize findings: Critical / Important / Suggestion.

If Critical → back to Claude Code. If Important → fix or queue with rationale.
If only Suggestions → merge with notes.

### After Both Stages
- Commit the build (clean message referencing DOC-208)
- Push to GitHub `main`
- Pull through to SENTINEL
- Test deploy on Azure SWA preview / staging
- Verify against acceptance criteria in real environment
- Re-test after deploy
- Report results to Roy with: deploy URL, test summary, any deferred items

---

## Test & Deploy Plan (after build merges)

| Stage | Action | Verify |
|---|---|---|
| Local | `npm run build && npm test` | Green |
| Staging | Deploy to staging Azure SWA | Build artifact deploys |
| Stripe test webhook | Trigger from Stripe dashboard | Event lands in `stripe_events` table |
| Test purchase | Buy 100-coin pack with `4242 4242 4242 4242` | Coins land in member ledger via webhook |
| Test subscription | Subscribe annual membership with same card | `verified_active` flips true |
| Idempotency | Replay the same webhook twice | Second insert blocked by `processed_idempotency_keys` |
| RLS | Try SELECT from another user's row as a member | Denied |
| Failure path | Use card `4000 0000 0000 0341` (declines after attach) | `invoice.payment_failed` handled, grace banner appears |

Only after all green → cut to production Stripe live keys (separate ATLAS-led decision, not part of this build).

---

## Deferred / Out of Scope

- Live Stripe keys (test mode only for this build)
- Tax handling beyond Stripe automatic tax flag
- Org-level billing (DOC-613, Phase 6)
- Coin gifting / transfers between members
- Refund flow UI (admin only via Stripe dashboard for now)

---

## Document History

- 2026-05-04 — Authored by ATLAS as the dispatch package for the post-Vercel-scrub build cycle. Roy approved DOC-208 dispatch and the QUEUE refresh in the same session.
