# GSR-DOC-201: Member Dashboard — Layout + Navigation

| Field | Value |
|-------|-------|
| Phase | 2 |
| Status | draft |
| Blocks on | DOC-200 |
| Priority | critical |

---

## Purpose

Build the authenticated member dashboard shell — the layout, navigation, and home page that every logged-in responder sees. This is the container for all member features: deployment records, profile, Sky Points, documents, and certifications. The dashboard home surfaces the responder's current status at a glance so they can decide what to do next without digging through menus.

This is the first thing a responder sees after login. It needs to feel like a command post — clear, structured, operational — not a consumer SaaS dashboard. These are people who work in ICS structures. They understand hierarchy and status boards.

---

## Data Entities

This doc reads from existing entities (no new tables):

- **users** — display_name, role, membership_status, membership_expires_at, sky_points_balance, avatar_url
- **deployment_records** — count, most recent, verification_tier distribution
- **user_certifications** — active certification count, in-progress count
- **sky_points_ledger** — recent transactions (last 5)

All data fetched server-side via Supabase service role client, scoped to authenticated user.

---

## Structure

### Routes

```
src/app/(dashboard)/
├── layout.tsx              # Dashboard shell: sidebar + header + content area
├── page.tsx                # Dashboard home: /dashboard
└── loading.tsx             # Skeleton loader for dashboard sections
```

### Component Tree

```
(dashboard)/layout.tsx
├── DashboardSidebar        # Desktop: fixed left sidebar. Mobile: hidden.
│   ├── UserBadge           # Avatar, name, role badge
│   ├── NavLinks            # Section navigation
│   └── SidebarFooter       # Longview attribution, logout
├── DashboardHeader         # Mobile: top bar with hamburger + title. Desktop: breadcrumb bar.
│   ├── MobileMenuToggle    # Hamburger → opens sidebar as overlay
│   ├── PageTitle           # Current section name
│   └── QuickActions        # Notification bell (placeholder), user menu
├── MobileBottomNav         # Mobile only: fixed bottom tab bar
└── {children}              # Page content

(dashboard)/page.tsx
├── WelcomeBar              # "Welcome back, [name]" + membership badge
├── StatusGrid              # 4-card grid: records, verifications, points, certs
│   ├── StatCard            # Reusable card component
│   └── ...
├── RecentActivity          # Last 5 activity items (records, validations, points)
└── QuickActionPanel        # Primary CTAs: New Report, Request Validation
```

### Navigation Items (Sidebar + Mobile Bottom Nav)

| Label | Route | Icon | Description |
|-------|-------|------|-------------|
| Dashboard | /dashboard | LayoutDashboard | Home — status overview |
| Response Reports | /dashboard/records | FileText | ICS 222 deployment records |
| Profile | /dashboard/profile | User | View and edit profile |
| Sky Points | /dashboard/points | Coins | Balance, history, purchase |
| Documents | /dashboard/documents | FolderOpen | Uploaded documents library |
| Certifications | /dashboard/certifications | Award | Pathways and progress |

Mobile bottom nav shows the top 5 items. "Documents" moves into the hamburger menu on mobile.

### Component Files

```
src/components/dashboard/
├── DashboardSidebar.tsx
├── DashboardHeader.tsx
├── MobileBottomNav.tsx
├── UserBadge.tsx
├── NavLinks.tsx
├── WelcomeBar.tsx
├── StatusGrid.tsx
├── StatCard.tsx
├── RecentActivity.tsx
└── QuickActionPanel.tsx
```

---

## Business Rules

1. **Auth gate.** The `(dashboard)/layout.tsx` calls `getUser()` (from DOC-200). If no authenticated user, redirect to `/auth/login?redirect=/dashboard`. This is enforced at the layout level — all child routes inherit the check.

2. **Data loading.** Dashboard home data is fetched server-side in `page.tsx` using the Supabase service role client scoped to the user's ID. This means:
   - Total deployment records count + most recent record date
   - Verification tier breakdown: count of self_certified, validated, evaluated records
   - Sky Points current balance (from `users.sky_points_balance`)
   - Active certifications count (status = 'certified' and not expired)
   - In-progress certifications count
   - Last 5 sky_points_ledger entries for recent activity
   - Last 3 deployment_records for recent activity

3. **Status cards show actionable numbers.** Each StatCard links to its detail page. The verification card shows a progress indicator (e.g., "3 of 12 records validated") to motivate engagement.

4. **Quick actions reflect user state.** If the user has zero deployment records, the primary CTA is "File Your First Response Report" (not generic "New Record"). If they have records but no validations, the CTA shifts to "Request Your First Validation."

5. **Sidebar collapses on mobile.** Desktop: fixed 280px sidebar. Mobile: sidebar hidden, accessible via hamburger menu as a slide-over overlay. Mobile bottom nav provides the top 5 navigation targets.

6. **Active route highlighting.** Current page is visually indicated in both sidebar and bottom nav using Signal Gold highlight on the active item.

7. **Membership badge.** The UserBadge shows membership status: "Active" (green), "Expiring" (amber, within 30 days of expiration), "Expired" (red), "Pending" (grey, registered but not yet paid).

---

## Copy Direction

**Tone:** Operational, warm, service-oriented. This is a responder's command post, not a social media feed.

**Welcome message:** "Welcome back, [display_name]" — simple, direct. No "Hey there!" or corporate enthusiasm.

**Empty states:** When a section has no data, use language that connects to mission. "You haven't filed any Response Reports yet. Your service matters — start by documenting your most recent deployment." NOT "Get started by adding your first record!"

**Navigation labels:** Use operational language. "Response Reports" not "Deployment Records." "Sky Points" not "Credits." "Certifications" not "Badges."

**Status language:** "Verified" not "Confirmed." "Pending Review" not "Processing." "Service Record" not "Activity Log."

---

## Acceptance Criteria

1. Navigating to `/dashboard` while unauthenticated redirects to `/auth/login?redirect=/dashboard`
2. Navigating to `/dashboard` while authenticated shows the dashboard shell with sidebar (desktop) and bottom nav (mobile)
3. Dashboard home page displays 4 status cards: Response Reports count, Verification Progress, Sky Points balance, Certifications status
4. Each status card links to its corresponding detail page
5. Recent Activity section shows the last 5 combined activity items
6. Quick Action panel shows context-aware CTAs based on user state
7. Sidebar shows UserBadge with avatar, name, and membership status badge
8. All 6 navigation items are present in the sidebar
9. Mobile bottom nav shows 5 items, collapses "Documents" into hamburger menu
10. Active route is highlighted with Signal Gold (#C5933A)
11. Clicking any nav item navigates to the correct route
12. Grey Sky brand colors applied: Command Navy (#0A1628) sidebar background, Ops White (#F5F5F5) content background, Signal Gold (#C5933A) accents
13. `npm run build` passes
14. Page renders with no layout shift or flash of unstyled content

---

## Agent Lenses

- **Baseplate** (data/schema): No schema changes. All queries read from existing tables via service role client scoped to `auth.uid()`. No new indexes needed — user-scoped queries hit existing PK/FK indexes.
- **Meridian** (doctrine): Navigation uses "Response Reports" aligned with ICS 222 terminology. "Certifications" aligns with NQS credentialing language. No FEMA/NIMS terms are misused.
- **Lookout** (UX): Dashboard home is a glanceable status board — 4 cards, recent activity, 2 CTAs. A responder checking in between deployments can assess their status in 3 seconds. Mobile-first responsive design. Sidebar collapses cleanly. Bottom nav provides thumb-reachable navigation.
- **Threshold** (security): All data fetched server-side with user scope. No client-side data fetching that could expose other users' data. Auth check at layout level — no child route can bypass it. No PII exposed in URL params.

---

## Claude Code Prompt

```
Read CLAUDE.md and GSR-DOC-000-PLATFORM-SPEC.md first.

You are building GSR-DOC-201: Member Dashboard Layout + Navigation for the Grey Sky Responder Society platform.

PREREQUISITES:
- DOC-200 (Authentication) must be complete. The following must exist:
  - src/lib/supabase/server.ts (createServerClient)
  - src/lib/supabase/client.ts (createBrowserClient)
  - src/lib/auth/getUser.ts (server-side auth check)
  - src/lib/auth/useUser.ts (client-side hook)
  - src/middleware.ts (role-based route protection)

BRAND TOKENS (from Tailwind config or CSS custom properties):
- Command Navy: #0A1628
- Signal Gold: #C5933A
- Ops White: #F5F5F5
- Font: Inter (sans-serif)

CREATE THESE FILES:

1. src/app/(dashboard)/layout.tsx
   - Server component
   - Call getUser() — if no user, redirect('/auth/login?redirect=/dashboard')
   - Render: DashboardSidebar (hidden on mobile), DashboardHeader, MobileBottomNav, {children}
   - Sidebar: fixed left, 280px wide, Command Navy background
   - Content area: Ops White background, padding, scrollable
   - Import Inter font from next/font/google

2. src/app/(dashboard)/page.tsx
   - Server component
   - Fetch user data from Supabase using service role client scoped to authenticated user:
     * User record (display_name, membership_status, membership_expires_at, sky_points_balance, avatar_url)
     * Deployment records count
     * Deployment records by verification_tier (count per tier)
     * Active certifications count (status='certified', expires_at > now or null)
     * In-progress certifications count (status='in_progress')
     * Last 5 sky_points_ledger entries
     * Last 3 deployment_records (ordered by deployment_start desc)
   - Render: WelcomeBar, StatusGrid (4 StatCards), RecentActivity, QuickActionPanel

3. src/app/(dashboard)/loading.tsx
   - Skeleton loader: 4 pulsing card placeholders + activity list skeleton

4. src/components/dashboard/DashboardSidebar.tsx
   - Client component (needs state for mobile toggle)
   - Props: user (display_name, avatar_url, membership_status, membership_expires_at), currentPath
   - Sections: UserBadge at top, NavLinks in middle, SidebarFooter at bottom
   - Hidden on screens < 1024px (lg breakpoint)
   - When mobile menu is open, renders as slide-over overlay with backdrop

5. src/components/dashboard/DashboardHeader.tsx
   - Client component
   - Props: pageTitle, onMobileMenuToggle
   - Desktop (>= lg): breadcrumb bar with page title
   - Mobile (< lg): top bar with hamburger button, centered page title

6. src/components/dashboard/MobileBottomNav.tsx
   - Client component
   - Props: currentPath
   - Fixed bottom, visible only on screens < 1024px
   - 5 tabs: Dashboard, Response Reports, Profile, Sky Points, Certifications
   - Active tab highlighted with Signal Gold
   - Icons from lucide-react: LayoutDashboard, FileText, User, Coins, Award

7. src/components/dashboard/UserBadge.tsx
   - Server component
   - Props: displayName, avatarUrl, membershipStatus, membershipExpiresAt
   - Avatar (40px circle, fallback to initials on navy bg), name, membership badge
   - Badge colors: active=green, expiring=amber (within 30 days), expired=red, pending=grey

8. src/components/dashboard/NavLinks.tsx
   - Client component
   - Props: currentPath
   - 6 nav items: Dashboard (/dashboard, LayoutDashboard), Response Reports (/dashboard/records, FileText), Profile (/dashboard/profile, User), Sky Points (/dashboard/points, Coins), Documents (/dashboard/documents, FolderOpen), Certifications (/dashboard/certifications, Award)
   - Active item: Signal Gold left border + Gold text
   - Inactive: Ops White text, hover: slight highlight
   - Use Next.js Link component

9. src/components/dashboard/WelcomeBar.tsx
   - Server component
   - Props: displayName, membershipStatus
   - "Welcome back, {displayName}" in Command Navy heading
   - Membership status badge inline

10. src/components/dashboard/StatusGrid.tsx
    - Server component
    - Props: recordsCount, verificationBreakdown ({self_certified, validated, evaluated}), skyPointsBalance, certsActive, certsInProgress
    - 4-column grid (2 on mobile): Response Reports, Verification Progress, Sky Points, Certifications
    - Each card is a StatCard component

11. src/components/dashboard/StatCard.tsx
    - Server component
    - Props: title, value (string|number), subtitle, href, icon (LucideIcon), accent? (color)
    - Card with subtle shadow, white background, rounded corners
    - Entire card is a link (href)
    - Icon in Signal Gold

12. src/components/dashboard/RecentActivity.tsx
    - Server component
    - Props: recentLedger (last 5 sky_points_ledger entries), recentRecords (last 3 deployment_records)
    - Merged and sorted by date, display as timeline list
    - Each item: icon, description, timestamp (relative: "2 hours ago", "3 days ago")

13. src/components/dashboard/QuickActionPanel.tsx
    - Server component
    - Props: hasRecords (boolean), hasValidations (boolean)
    - If no records: primary CTA "File Your First Response Report" linking to /dashboard/records/new
    - If records but no validations: primary CTA "Request Your First Validation" linking to first record
    - Default: two buttons — "New Response Report" + "Request Validation"
    - Buttons use Signal Gold background with Command Navy text

INSTALL IF NEEDED:
- lucide-react (icon library)

VERIFY:
- npm run build passes
- Navigate to /dashboard without auth → redirects to /auth/login
- Navigate to /dashboard with auth → shows dashboard with sidebar and status cards
- Resize to mobile → sidebar collapses, bottom nav appears
- All 6 nav links navigate correctly
- Brand colors applied consistently

COMMITS (in order):
1. "feat: dashboard layout shell — sidebar, header, mobile nav (DOC-201)"
2. "feat: dashboard home — status cards, recent activity, quick actions (DOC-201)"
```
