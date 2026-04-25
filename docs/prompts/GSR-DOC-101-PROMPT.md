# BUILD: GSR-DOC-101 — Membership Page Copy Alignment

| Field | Value |
|-------|-------|
| Doc ID | GSR-DOC-101 |
| Phase | 1 — Public Site |
| Priority | High |
| Dependencies | GSR-DOC-205 (Sky Coins) — **needs pricing finalized** |
| Parallel Safe | ⛔ No — needs DOC-205 decisions confirmed in code |

---

## Context

Read `CLAUDE.md` at the repo root before starting. The membership page at `/membership` already exists and is live. This build updates the copy and structure to align with the resolved Sky Coins economy from DOC-205.

**Resolved decisions (from DOC-205):**
- $1 = 10 Sky Coins
- $100 annual membership = 1,000 Sky Coins
- Five-tier product catalog with specific pricing
- Coins do not expire while membership is active
- Coins freeze on lapsed membership (not forfeited)
- Certification: $400–$500 (4,000–5,000 coins)
- Credentialing: $1,000–$3,000 (10,000–30,000 coins)
- Free tier: response reports, document uploads, historical deployments
- Low-cost tier: validation (10 coins), evaluation (15 coins)

**Language rules (strict):** Use "service" / "serving" — NEVER "career." Frame through professional development and recognition, not resume-building.

---

## What You Are Building

An update to the existing `/membership` page that:
1. Clearly explains what $100/year gets you (1,000 Sky Coins + platform access)
2. Shows the five-tier value breakdown so members understand what their coins buy
3. Demonstrates that most active professional development is covered by the annual membership
4. Frames certification and credentialing as premium investments for members who want to go further
5. Adds a clear join CTA (link to `/join` or Stripe checkout if DOC-207 is built)

**What you are NOT changing:**
- Page route (stays at `/membership`)
- Page layout structure (stays within existing public site layout)
- Header/footer (no nav changes)

---

## Step 1: Update Page

Modify `src/app/(public)/membership/page.tsx`:

Update metadata description to: "Join the Grey Sky Responder Society. $100/year includes 1,000 Sky Coins for professional development, record building, and peer validation."

### Section 1: Hero
- Headline: "Invest in Your Service Record"
- Subhead: "Grey Sky membership gives you the tools, the recognition, and the community to build a verified record of the work you do. $100 a year. Everything you need to get started."
- Background: Command Navy, consistent with other public pages

### Section 2: What You Get
Clear breakdown of what $100/year includes:

**Platform Access**
- Secure member dashboard (your command post)
- Complete service profile with 8 sections
- Unlimited response report creation
- Document library for certificates, licenses, and training records
- Incident registry with ICS 209-aligned records
- Connection to 37 affinity categories (incidents, agencies, disciplines)

**1,000 Sky Coins**
- The internal currency of Grey Sky
- 1,000 coins = $100 value
- Use for validation requests, evaluation requests, and professional products
- Coins don't expire while your membership is active

### Section 3: What Your Coins Buy (Five-Tier Value Display)

Display as a visual tier breakdown (cards or accordion):

**Tier 1 — Record Building (Free / Included)**
- Response reports — document every deployment
- Document uploads — store certificates, licenses, training records
- Historical deployments — add your full service history
- "Building your record costs nothing. That's by design."

**Tier 2 — Professional Network (10–15 coins each)**
- 360° validation request — ask a colleague to verify your service (10 coins)
- ICS 225 performance evaluation — request a supervisor evaluation (15 coins)
- Validators and evaluators earn coins back when they respond
- "Your 1,000 coins cover 65+ validation requests or the equivalent."

**Tier 3 — Certification ($400–$500 / 4,000–5,000 coins)**
- Staff-level certification: 4,000 coins ($400)
- Command-level certification: 5,000 coins ($500)
- Administrative review of your verified record against NQS requirements
- 3-year renewal cycle
- "Most members pursuing certification will need to add coins. That's the investment in official recognition."

**Tier 4 — Credentialing ($1,000–$3,000 / 10,000–30,000 coins)**
- Standard credential: 10,000 coins ($1,000)
- Senior credential: 20,000 coins ($2,000)
- Command credential: 30,000 coins ($3,000)
- Expert peer review by a Qualification Review Board
- 2-year renewal cycle
- "Credentialing is the highest level of professional verification in emergency management. It means qualified experts reviewed your record and confirmed your capability."

**Tier 5 — Professional Products (25–75 coins each)**
- Verified response reports, printed certificates, verification letters
- Service history exports, professional profile summaries
- Digital badges for sharing certifications
- "Small investments in the tangible products of your professional standing."

### Section 4: The Math
Simple illustration showing annual value:

"With your 1,000 Sky Coins, a typical active member can:"
- Build unlimited response reports (free)
- Upload all supporting documents (free)
- Request 20+ peer validations (200 coins)
- Request 10+ supervisor evaluations (150 coins)
- Export service history (25 coins)
- Generate a professional summary (50 coins)
- Purchase 4 verified response reports (200 coins)
- **Total: 625 coins — and you still have 375 left.**

"For most members, $100 covers a full year of active professional development."

### Section 5: For Organizations
Brief callout linking to the organizations page:

"Agencies and organizations can sponsor memberships for their responders. Bulk sponsorship, readiness dashboards, and team credentialing — all through the same platform."

Link: "Learn about organization sponsorship →" → `/organizations`

### Section 6: Join CTA
- "Join Grey Sky Responder Society" — large CTA button
- Links to `/join` (existing onboarding funnel)
- Below button: "$100/year · 1,000 Sky Coins · Cancel anytime"

---

## Step 2: Component Updates

If the existing page uses reusable components from `src/components/marketing/`, update those components to accept the new content. If the page is a single file with inline content, update inline.

Create `src/components/marketing/TierCard.tsx` if it doesn't exist:
- Props: `{ tier: string, title: string, priceRange: string, items: string[], note: string, variant: 'free' | 'low' | 'medium' | 'premium' | 'products' }`
- Variant colors:
  - `free`: green accent
  - `low`: Signal Gold accent
  - `medium`: Command Navy accent
  - `premium`: Command Navy background, white text
  - `products`: light gray

---

## Step 3: Business Rules

1. **No hard sell.** The page explains value, not urgency. Responders are professionals making a professional investment.
2. **Frame through service.** "Invest in your service record" — not "advance your career."
3. **Be honest about what costs extra.** Certification and credentialing require additional coins. Say so clearly. Don't hide it.
4. **No comparison to other platforms.** Grey Sky is the first of its kind. Don't position against competitors.
5. **Coins terminology:** Always "Sky Coins" — never "points" or "credits."

---

## Step 4: Verify

- `npm run build` passes with zero errors
- `/membership` renders all six sections
- Pricing aligns exactly with DOC-205 product catalog
- Tier display shows correct coin costs and USD equivalents
- "The Math" section adds up correctly
- Link to `/organizations` works
- Join CTA links to `/join`
- Mobile responsive — tiers stack cleanly
- Language rules followed: "service" not "career" throughout
- Brand consistency: Command Navy, Signal Gold, Ops White

## Commit Message

```
GSR-DOC-101: membership page copy alignment — Sky Coins tiers, pricing, value breakdown
```
