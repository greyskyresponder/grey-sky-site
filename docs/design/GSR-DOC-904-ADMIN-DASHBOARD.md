---
doc_id: GSR-DOC-904
title: "Admin Dashboard — Platform Management"
phase: 9
status: complete
blocks_on:
  - GSR-DOC-200
  - GSR-DOC-002
priority: high
author: Roy E. Dunn
created: 2026-04-24
updated: 2026-04-24
backfilled: true
notes: Backfilled retroactively on 2026-04-24. The admin surface shipped in commits 8277441–24939e3 (April 2026) without a formal authored design doc — this doc closes that pipeline gap and documents the live behavior so subsequent admin work has a spec to reference. Status is complete because the feature is live; future expansions get their own DOC-9XX or DOC-9XX revisions.
---

# GSR-DOC-904: Admin Dashboard — Platform Management

| Field | Value |
|-------|-------|
| Phase | 9 |
| Status | complete (backfilled) |
| Blocks on | GSR-DOC-200 ✅, GSR-DOC-002 ✅ |
| Priority | high |

## Purpose

The admin dashboard is the platform's operational command surface. It is where Roy and any future platform operators monitor membership health, oversee validation activity, manage user records, audit credentialing decisions, and answer the questions that come up when running a credentialing platform under real-world conditions.

This is not a customer-facing surface and it is not an analytics dashboard. It is operational tooling for the small team that runs the platform. Every feature on this surface exists because someone running the platform needs it to do their job — not because it makes a good demo.

This doc captures the live behavior of the admin dashboard as it shipped. Future expansion of admin tooling either updates this doc or supersedes it with a new GSR-DOC-9XX entry.

## Data Entities

The admin dashboard reads across most of the platform's tables. No admin-specific tables exist — the surface is composed entirely of read views and update operations against existing data.

### Read sources

- `users` — member directory, role assignments, membership status
- `coin_accounts`, `coin_transactions`, `coin_pending_balances`, `sky_points_ledger` — financial activity
- `validation_requests`, `evaluation_requests` — verification queue
- `audit_log` — tamper-evident operational history (Phase 0)
- `deployment_records`, `incidents`, `positions`, `organizations`, `affinities` — supporting context

### Write surfaces

- `users.role` — admin-managed role transitions (member ↔ org_admin ↔ assessor ↔ platform_admin)
- `users.membership_status`, `users.membership_expires_at` — admin-managed membership overrides
- `validation_requests.status` — admin decision overrides on the validation queue
- `evaluation_requests` (verifications) — admin decision overrides

All admin writes are recorded to `audit_log` via the existing hash-chain trigger; the operator's user ID, the action, the before/after state, and a timestamp are all captured.

### Query layer

Admin queries are encapsulated in `src/lib/queries/admin.ts`. Functions include:

- `getAdminOverview()` — KPI tile data (active members, new signups 7d/30d, MRR cents, active subscriptions, pending validations, pending evaluations)
- `listUsers(filters, page)` — paginated user list with filters
- `getUserById(id)` — full user detail with associations
- `listValidations(filters, page)` — paginated validation queue
- `getValidationById(id)` — full validation detail
- `listVerifications(filters, page)` — paginated verification queue
- `getVerificationById(id)` — full verification detail
- `getMembershipOverview()` — membership summary statistics
- `listAuditLog(filters, page)` — paginated audit log with filters

## Structure

### Routes

```
src/app/(admin)/admin/page.tsx                          — Platform Overview (home)
src/app/(admin)/admin/users/page.tsx                    — User list (filterable, paginated)
src/app/(admin)/admin/users/[id]/page.tsx               — User detail + admin actions
src/app/(admin)/admin/memberships/page.tsx              — Membership overview
src/app/(admin)/admin/validations/page.tsx              — Validation queue
src/app/(admin)/admin/validations/[id]/page.tsx         — Validation detail + decision workflow
src/app/(admin)/admin/verifications/page.tsx            — Verification queue
src/app/(admin)/admin/verifications/[id]/page.tsx       — Verification detail
src/app/(admin)/admin/audit/page.tsx                    — Audit log with filters
```

### Layout shell

```
src/app/(admin)/layout.tsx                              — Server-rendered auth gate
src/app/(admin)/AdminLayoutClient.tsx                   — Client-rendered shell (sidebar + header)
src/app/(admin)/admin/error.tsx                         — Section-level error boundary
src/app/(admin)/admin/loading.tsx                       — Section-level loading skeleton
```

### Components

```
src/components/admin/
  AdminHeader.tsx              — Top bar with user badge, logout, current-section title
  AdminSidebar.tsx             — Vertical nav: overview, users, memberships, validations, verifications, audit
  AdminNavLinks.tsx            — Nav link rendering with active-state highlighting
  AdminPageHeader.tsx          — Per-page title + description block
  AdminStatCard.tsx            — KPI tile (value, subtitle, icon, tone, optional href)
  AuditFilters.tsx             — Audit log filter controls (action, actor, entity, date range)
  AuditLogList.tsx             — Tamper-evident audit log row renderer with hash chain indicator
  FilterTabs.tsx               — Status-tab filter pattern reused across queue pages
  Pagination.tsx               — Page navigation
  StatusPill.tsx               — Badge component (tones: warn, success, alert, neutral)
  UserFilters.tsx              — User list filter controls (membership status, role, search)
  UserMembershipForm.tsx       — Admin override form for user membership status / expiration
  UserRoleForm.tsx             — Admin override form for user role transitions
  ValidationActionForm.tsx     — Admin decision form on validation queue items
  VerificationActions.tsx      — Admin actions on verification detail
```

## Business Rules

1. **Auth boundary.** The admin section is protected by two layers. (a) Middleware enforces that the request user has `role = 'platform_admin'`; non-admin requests are redirected to `/dashboard?error=insufficient_permissions`. (b) The server-side `(admin)/layout.tsx` re-checks the role as defense-in-depth and redirects again if the role is missing.

2. **Session edge case.** If a user is authenticated but their profile cannot be loaded (race condition with profile creation or RLS misconfiguration), the layout renders a graceful "Admin Session Unavailable" state with a sign-out path, instead of crashing.

3. **No client-side admin actions.** Every state-changing admin operation (role change, membership override, validation decision, verification override) is a server action. The client form posts data; the server action validates the actor's role, performs the database write, and writes to `audit_log` as the same transaction.

4. **Audit log immutability.** Admin operations append to `audit_log`. The hash-chain trigger from Phase 0 ensures any post-hoc modification is detectable. Admins cannot delete audit log entries — there is no UI for that operation, and the policy denies it at the database level.

5. **Read-only by default.** The vast majority of admin surfaces are read-only views. Write surfaces (role change, membership override, validation/verification decisions) are explicit forms with confirmation steps.

6. **Filtered-list contract.** Every queue and list page accepts the same filter pattern: query params for filter state, server-side rendering against those params, default-page-1 pagination at 25 per page. Filters reset to defaults on navigation away from the page (filters do not persist across sessions).

7. **Decision recording on validation/verification queues.** When an admin overrides a validation or verification status, the decision is recorded with: actor user ID, original status, new status, optional rationale text, and a timestamp. The original token-based response (if any) is preserved — the admin override layers on top of, not in place of, the recorded validator/evaluator response.

8. **Currency formatting.** Monetary values are stored as integer cents and rendered as `en-US` USD without fractional cents (`$1,234`, not `$1,234.56`). Maintains precision; readable for operators.

9. **Pagination cap.** `page` query param is clamped to 1–1000 to prevent abuse via crafted URLs. Per-page is fixed at 25 across all admin lists.

10. **Force-dynamic rendering.** Admin pages are marked `export const dynamic = 'force-dynamic'` to prevent any caching of operator-visible data. The admin surface is small-traffic and correctness matters more than performance.

## Copy Direction

- Section titles use operational language: "Platform Overview", "User Management", "Validation Queue", "Audit Log" — not "Customers" or "Tickets" or anything customer-platform-derivative
- KPI tiles use plain noun phrases: "Active members", "Monthly recurring revenue", "Pending verifications" — not "MRR" or vague abstractions
- Status pills use operational tones: warn (amber, things to attend to), success (green, things resolved positively), alert (red, things resolved negatively or in failure), neutral (gray, expired or inactive)
- Confirmation language for write operations is precise: "Override membership status from `expired` to `active` until [date]?" — not "Are you sure?"
- Empty states tell the operator what's happening: "No pending validations. The queue is clear." — not "Nothing to show"

## Acceptance Criteria

All criteria are satisfied by the live deployment as of 2026-04-24. This is a backfilled doc; the criteria below are documented to allow future regression testing.

1. `/admin` requires authentication; non-admin users are redirected away
2. `/admin` home renders KPI tiles with live data from `getAdminOverview()`
3. `/admin/users` lists users with filters for role, membership status, and text search; paginated at 25
4. `/admin/users/[id]` shows user detail; admin can change role and membership status; both actions record audit log entries
5. `/admin/memberships` renders membership summary statistics
6. `/admin/validations` lists validation requests with status-tab filters; paginated
7. `/admin/validations/[id]` shows full request detail and provides a decision override form
8. `/admin/verifications` lists verification requests with filters; paginated
9. `/admin/verifications/[id]` shows full request detail with admin actions
10. `/admin/audit` lists audit log entries with filters for action, actor, entity, date range; paginated
11. Every admin write produces a corresponding `audit_log` entry with actor, action, before/after, timestamp
12. Hash chain on `audit_log` is intact across the full table (verifiable by existing chain-verification routine)
13. Section error and loading boundaries render gracefully on slow queries or backend failures
14. `npm run build` passes
15. `npx tsc --noEmit` passes

## Agent Lenses

- **Baseplate** (data/schema): No new tables. The surface is a composition of reads and writes against existing schema. Audit log is the single most important table for this surface — its hash chain is the trust substrate for every admin action.

- **Meridian** (doctrine): Admin terminology aligns with operational/credentialing language, not consumer SaaS conventions. "Platform admin" not "super user". "Validation queue" not "ticket queue". The surface respects that this is a credentialing system: admin overrides exist but are recorded permanently, and the underlying validator/evaluator response is preserved beneath any admin action.

- **Lookout** (UX): The admin operator under stress (responding to a paid-customer escalation, investigating a contested credentialing decision, debugging a webhook failure) needs information density and direct paths to action. Sidebar nav is always visible. KPI tiles double as nav targets. Filter tabs are visible at the top of every queue. Confirmation dialogs are precise about what will change and what will be recorded.

- **Threshold** (security): Two-layer auth enforcement (middleware + layout). All writes are server actions with role re-check. Audit log captures every write. Hash chain detects post-hoc tampering. No admin role escalation possible from the UI — role transitions are admin-to-admin operations and the actor's role is verified server-side at every step. PII visibility is limited to platform_admin role; no other role sees admin surfaces.

## Future Expansion (out of scope for this backfill)

The following expansions are anticipated and should be authored as new design docs when prioritized:

- **Bulk operations** — currently admin actions are per-record. Mass invitations, mass membership extensions, etc. have no UI.
- **Saved searches and reports** — operators currently re-apply filters each session.
- **Notification routing for operational alerts** — when a webhook fails permanently, when audit log chain verification reports an inconsistency, when MRR drops sharply — these alerts should route to an operator channel. Out of scope for DOC-904; pairs with DOC-906 (Backup, Recovery + IR) and the Notification Service (DOC-405).
- **Org admin dashboard surface** — the agency-side dashboard (Phase 6) is conceptually separate from the platform-admin surface. Phase 6 docs (600+) cover it.

## Backfill Note

This document was authored 2026-04-24 to retroactively cover an admin surface that shipped without a formal design doc. The build occurred in commits 8277441 (admin home), 7c1c424 (user management), af52b90 (membership overview), 07a1107 (validation queue + decision workflow), 24939e3 (audit log with filters). The current doc reflects the state of those commits and any subsequent fixes through 2026-04-24.

Future admin work should follow the design-doc pipeline: spec first, build second, status update third. This backfill is a one-time gap closure, not a precedent.
