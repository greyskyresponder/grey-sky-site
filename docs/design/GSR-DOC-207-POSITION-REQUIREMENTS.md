---
doc_id: GSR-DOC-207
title: "Position Requirements — RTLT-Driven Document Slots & Verification"
phase: 2
status: approved
blocks_on:
  - GSR-DOC-206
priority: critical
author: ATLAS
created: 2026-04-24
updated: 2026-04-24
notes: >
  Replaces the generic document upload model with position-specific requirement
  slots seeded from the full FEMA RTLT database. Each training course,
  certification, fitness level, and PTB becomes a named slot that a responder
  uploads against. Staff verifies each document. Completion status auto-computed.
---

# GSR-DOC-207: Position Requirements — RTLT-Driven Document Slots & Verification

| Field | Value |
|-------|-------|
| Phase | 2 |
| Status | approved |
| Blocks on | GSR-DOC-206 (Document Library) |
| Priority | critical |

---

## Purpose

Today, a responder uploads documents into a generic library and manually tags them. Staff has no way to know what's missing, what's expired, or whether a specific upload actually satisfies a specific requirement. The responder doesn't know what they need. Staff can't verify what they don't expect.

This doc replaces that model with **position-driven requirement slots**. When a responder selects a position they're pursuing (e.g., Incident Commander Type 3), the system already knows — from FEMA's own RTLT data — exactly what training, certifications, fitness documentation, and task book completions are required. Each requirement becomes a named slot. The responder uploads against that slot. Staff reviews and verifies each document. The system auto-computes completion percentage.

**This is what makes Grey Sky a credentialing platform instead of a file cabinet.**

**This doc builds:**
- `position_requirements` table — one row per requirement per position, seeded from RTLT
- `user_requirement_fulfillments` table — links a user's document to a specific requirement slot with staff verification
- Seed script that loads all 321 RTLT positions × their specific requirements (courses, certs, fitness, PTB)
- Position requirements checklist UI — "what I need" view for responders
- Staff verification UI — review uploaded documents per slot, approve/reject
- Completion percentage computation on user profiles
- Updated document upload flow — upload against a specific requirement slot

**What it does NOT build:**
- AI document verification (DOC-303 — ATLAS reads certificates and auto-fills metadata)
- Certification pathway auto-progression (DOC-208 — when all requirements met, trigger cert review)
- Organization dashboard views (DOC-609+ — agency sees aggregate readiness)
- PTB task-level tracking (future — individual task sign-offs within a PTB)

**Why it matters:**
This is the core of the Grey Sky value proposition. FEMA defines the standard. Grey Sky presents the standard as a structured checklist. The responder fills the slots. Staff verifies. The profile shows real, verified qualification status — not self-reported claims. This is what agencies will pay for: verified readiness data on their people.

---

## Data Entities

### New Enum Types

```sql
-- Requirement category — what kind of evidence is needed
CREATE TYPE requirement_type_enum AS ENUM (
  'course',          -- Training course completion (IS-700, ICS-300, etc.)
  'certification',   -- Professional cert or license (EMT, HazMat Tech, etc.)
  'fitness',         -- Physical fitness documentation (Arduous, Moderate, Light)
  'ptb',             -- Position Task Book completion documentation
  'experience',      -- Experience requirement (deployments, years of service)
  'other'            -- Catch-all for edge cases
);

-- Staff verification status for each fulfilled slot
CREATE TYPE fulfillment_status_enum AS ENUM (
  'unfulfilled',     -- No document uploaded yet (default state)
  'pending',         -- Document uploaded, awaiting staff review
  'verified',        -- Staff confirmed: document is valid and current
  'rejected',        -- Staff rejected: invalid, wrong document, or insufficient
  'expired'          -- Was verified, but document/cert has since expired
);
```

### Table: `position_requirements`

One row per requirement per position. Seeded from RTLT data. This is the **master checklist** — what FEMA says you need.

```sql
CREATE TABLE position_requirements (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  position_id       UUID NOT NULL REFERENCES positions(id) ON DELETE CASCADE,
  requirement_type  requirement_type_enum NOT NULL,
  code              TEXT,              -- Course code (IS-700, ICS-300), cert name, etc.
  title             TEXT NOT NULL,     -- Human-readable label
  description       TEXT,              -- Full text from RTLT (tooltip/detail)
  document_category document_category_enum,  -- Expected upload category (certificate, training_record, etc.)
  is_required       BOOLEAN NOT NULL DEFAULT true,
  sort_order        INTEGER NOT NULL DEFAULT 0,
  group_label       TEXT,              -- Grouping: "Core ICS Courses", "Specialty Training", etc.
  rtlt_source       TEXT,              -- Provenance: which RTLT field this came from
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE position_requirements
  IS 'FEMA RTLT-derived requirements for each position. One row per requirement per position. Seeded from RTLT database.';

CREATE INDEX idx_position_requirements_position ON position_requirements(position_id);
CREATE INDEX idx_position_requirements_type ON position_requirements(requirement_type);
CREATE INDEX idx_position_requirements_code ON position_requirements(code) WHERE code IS NOT NULL;
```

### Table: `user_requirement_fulfillments`

Links a user's uploaded document to a specific requirement slot. Staff reviews and verifies.

```sql
CREATE TABLE user_requirement_fulfillments (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  requirement_id    UUID NOT NULL REFERENCES position_requirements(id) ON DELETE CASCADE,
  document_id       UUID REFERENCES documents(id) ON DELETE SET NULL,
  status            fulfillment_status_enum NOT NULL DEFAULT 'unfulfilled',
  verified_by       UUID REFERENCES users(id) ON DELETE SET NULL,
  verified_at       TIMESTAMPTZ,
  rejection_reason  TEXT,
  notes             TEXT,
  document_date     DATE,          -- Date on the certificate/document
  expires_at        TIMESTAMPTZ,   -- When this fulfillment expires (cert/course expiry)
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, requirement_id)
);

COMMENT ON TABLE user_requirement_fulfillments
  IS 'Tracks each user''s progress against position requirements. One fulfillment per requirement per user.';

CREATE INDEX idx_fulfillments_user ON user_requirement_fulfillments(user_id);
CREATE INDEX idx_fulfillments_requirement ON user_requirement_fulfillments(requirement_id);
CREATE INDEX idx_fulfillments_status ON user_requirement_fulfillments(status);
CREATE INDEX idx_fulfillments_document ON user_requirement_fulfillments(document_id) WHERE document_id IS NOT NULL;
CREATE INDEX idx_fulfillments_verified_by ON user_requirement_fulfillments(verified_by) WHERE verified_by IS NOT NULL;
CREATE INDEX idx_fulfillments_expires ON user_requirement_fulfillments(expires_at) WHERE expires_at IS NOT NULL;
```

### Table: `user_position_pursuits`

Tracks which positions a user is actively pursuing. This determines which requirement checklists they see.

```sql
CREATE TABLE user_position_pursuits (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  position_id   UUID NOT NULL REFERENCES positions(id) ON DELETE CASCADE,
  priority      INTEGER NOT NULL DEFAULT 0,  -- User can rank their positions
  started_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  notes         TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, position_id)
);

COMMENT ON TABLE user_position_pursuits
  IS 'Positions a user is actively pursuing. Drives which requirement checklists appear in their dashboard.';

CREATE INDEX idx_pursuits_user ON user_position_pursuits(user_id);
CREATE INDEX idx_pursuits_position ON user_position_pursuits(position_id);
```

### RLS Policies

```sql
-- position_requirements: public read (anyone can see what's required)
ALTER TABLE position_requirements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view position requirements"
  ON position_requirements FOR SELECT USING (true);
CREATE POLICY "Admins manage position requirements"
  ON position_requirements FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('platform_admin', 'staff'))
  );

-- user_requirement_fulfillments: user sees own, staff sees all
ALTER TABLE user_requirement_fulfillments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own fulfillments"
  ON user_requirement_fulfillments FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users manage own fulfillments"
  ON user_requirement_fulfillments FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users update own fulfillments"
  ON user_requirement_fulfillments FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Staff view all fulfillments"
  ON user_requirement_fulfillments FOR SELECT USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('platform_admin', 'staff'))
  );
CREATE POLICY "Staff update fulfillments"
  ON user_requirement_fulfillments FOR UPDATE USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('platform_admin', 'staff'))
  );

-- user_position_pursuits: user sees/manages own
ALTER TABLE user_position_pursuits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own pursuits"
  ON user_position_pursuits FOR ALL USING (user_id = auth.uid());
CREATE POLICY "Staff view all pursuits"
  ON user_position_pursuits FOR SELECT USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('platform_admin', 'staff'))
  );
```

---

## Seed Data Architecture

### Source Data

| File | Records | What it provides |
|------|---------|------------------|
| `positions_db.json` | 321 positions | Course codes, training text, certifications, fitness levels, experience, education |
| `training_courses_db.json` | 146 courses | Course code → title mapping, which positions require each course |
| `ptb_db.json` | 111 PTBs | Position Task Book requirements per position |
| `ptb_pq_map.json` | 37 mappings | PTB → Position Qualification cross-reference |

### Seed Logic

For each RTLT position in `positions_db.json`:

1. **Match or create** a `positions` row (by `rtlt_code` / FEMA ID)
2. **For each course code** in `course_codes[]`:
   - Look up title from `training_courses_db.json`
   - Insert `position_requirements` row: `type=course`, `code=IS-700`, `title=IS-700: NIMS Introduction`
   - Set `document_category=training_record` or `certificate`
   - Set `group_label` based on course prefix (IS=Independent Study, ICS=ICS Courses, E/L=EMI Resident, etc.)
3. **For each certification** in `certifications[]` (excluding "Not Specified"):
   - Insert `position_requirements` row: `type=certification`, `title=<cert name>`
   - Set `document_category=certification`
4. **For fitness_level** (if not empty/None):
   - Insert one `position_requirements` row: `type=fitness`, `title=Physical Fitness: <level>`
   - Set `document_category=other` (fitness test result / medical clearance)
5. **For PTB** (if position has a matching PTB in `ptb_pq_map.json`):
   - Insert `position_requirements` row: `type=ptb`, `title=Position Task Book: <PTB name>`
   - Set `document_category=task_book`
6. **For experience** entries (parsed from `experience[]`):
   - Insert `position_requirements` row: `type=experience`
   - These are informational — may not require a document upload, but staff can use them for verification context

### Multi-Type Positions

Many RTLT positions span Type 1–4 with cumulative requirements ("Same as Type 3, PLUS:"). The seed handles this by:

- Creating separate `positions` rows per type level (already done in existing seed)
- Resolving cumulative text: Type 3 requirements include Type 4; Type 2 includes Type 3 + extras
- Each type-level position gets its own complete set of requirements (no inheritance at query time)

### Requirement Counts (Estimated)

| Requirement Type | Est. Total Rows |
|-----------------|-----------------|
| Courses | ~2,800 (321 positions × ~8.7 avg courses) |
| Certifications | ~400 (197 positions with certs) |
| Fitness | ~321 (one per position) |
| PTBs | ~37 (positions with mapped PTBs) |
| Experience | ~600 (informational) |
| **Total** | **~4,200 requirement slots** |

---

## Structure

### New Files

```
-- Migration
supabase/migrations/20260424000001_position_requirements.sql

-- Seed script
backend/src/seeds/002_position_requirements.ts

-- Types
src/lib/types/requirements.ts

-- Server actions
src/lib/actions/requirements.ts

-- Validators
src/lib/validators/requirements.ts

-- API routes
src/app/api/positions/[id]/requirements/route.ts
src/app/api/requirements/fulfillments/route.ts
src/app/api/requirements/fulfillments/[id]/verify/route.ts

-- UI: Responder views
src/app/(dashboard)/dashboard/qualifications/page.tsx            -- "My Qualifications" overview
src/app/(dashboard)/dashboard/qualifications/[positionId]/page.tsx -- Requirements checklist for one position
src/components/qualifications/PositionPursuitCard.tsx             -- Card showing position + completion %
src/components/qualifications/RequirementChecklist.tsx            -- List of requirement slots
src/components/qualifications/RequirementSlot.tsx                 -- Single slot: status + upload button
src/components/qualifications/RequirementUploadModal.tsx          -- Upload against a specific slot
src/components/qualifications/AddPositionModal.tsx                -- Search/select positions to pursue
src/components/qualifications/CompletionBar.tsx                   -- Visual completion percentage

-- UI: Staff verification views
src/app/(dashboard)/dashboard/admin/verifications/page.tsx        -- Queue of pending fulfillments
src/app/(dashboard)/dashboard/admin/verifications/[id]/page.tsx   -- Review a specific fulfillment
src/components/admin/VerificationQueue.tsx
src/components/admin/VerificationDetail.tsx
src/components/admin/VerificationActions.tsx                      -- Verify/Reject buttons + notes
```

### Modified Files

```
src/lib/types/index.ts                    -- Add requirements exports
src/lib/types/enums.ts                    -- Add requirement_type, fulfillment_status enums
src/components/dashboard/Sidebar.tsx      -- Add "Qualifications" nav link
src/components/dashboard/MobileNav.tsx    -- Add "Qualifications" nav link
src/components/profile/ProfileSummary.tsx -- Show qualification completion stats
backend/src/seeds/001_positions.ts        -- Update to use RTLT data for requirements_json
```

---

## Business Rules

1. **Requirement slots are system-defined.** Responders cannot create, edit, or delete requirement slots. They are seeded from RTLT data and managed by staff/admin only.

2. **One fulfillment per requirement per user.** A user can upload one document against a requirement slot. To replace it, they upload a new document (which moves the old fulfillment to a "superseded" state or deletes it).

3. **Staff verification is required.** An uploaded document moves the fulfillment to `pending`. It stays pending until a staff member reviews and marks it `verified` or `rejected`. Self-verification is not possible.

4. **Completion percentage counts only verified slots.** Formula: `verified_required_count / total_required_count × 100`. Pending and rejected don't count. Optional requirements are excluded from the percentage but shown in the UI.

5. **Expiration tracking.** Staff can set an `expires_at` date when verifying (e.g., EMT cert expires in 2 years). A daily cron or webhook flips `verified` → `expired` when the date passes. The responder sees the slot turn amber/red and can upload a renewal.

6. **Cross-position reuse.** If IS-700 is required for both IC Type 3 and Operations Section Chief Type 3, and the user uploads IS-700 once, the system creates fulfillment rows for BOTH requirements pointing to the same document. One upload, multiple slots fulfilled.

7. **Position pursuit is user-initiated.** The system doesn't auto-assign positions. A responder chooses which positions they're working toward. They can add/remove positions at any time.

8. **Experience requirements are informational.** Experience slots (e.g., "3 years supervisory experience") may not require a document upload. They serve as a checklist item and context for QRB review. Staff can mark them verified based on deployment records in the system.

9. **PTB requirements link to the PTB database.** When a PTB slot exists, the detail view can show competencies/behaviors/tasks from `ptb_db.json` as a reference — "here's what this PTB covers." The actual fulfillment is a signed/completed PTB document upload.

10. **Existing generic documents still work.** The generic document library (DOC-206) remains. Requirements-driven upload is an additional pathway, not a replacement. A responder can still upload miscellaneous documents that don't map to a requirement slot.

---

## Copy Direction

**"Qualifications" not "Requirements."** The nav link and page title say "Qualifications" — it's what you're building toward, not bureaucratic compliance.

**Position card:** Show position title, NIMS type badge (Type 1/2/3/4), discipline, and a completion bar. "7 of 12 requirements verified — 58%"

**Requirement slot states:**
- ☐ (empty) — "Upload" button, gray
- 🔄 (pending) — "Under Review" badge, gold/amber
- ✅ (verified) — "Verified" badge, green, with date
- ❌ (rejected) — "Rejected" badge, red, with reason and "Re-upload" button
- ⚠️ (expired) — "Expired" badge, amber, with "Upload Renewal" button

**Empty state:** "You haven't selected any positions yet. Browse the FEMA position catalog to choose positions you're working toward."

**Staff verification queue:** Show responder name, position, requirement title, document preview, and Verify/Reject buttons. Keep it fast — staff should be able to process 20+ verifications in a sitting.

---

## Acceptance Criteria

1. Migration creates `position_requirements`, `user_requirement_fulfillments`, and `user_position_pursuits` tables with all enums, indexes, and RLS policies
2. Seed script loads all 321 RTLT positions with their specific course, certification, fitness, and PTB requirements into `position_requirements`
3. Seed produces ~4,000+ requirement rows covering all RTLT positions
4. "Qualifications" page shows the user's pursued positions with completion percentages
5. Position detail page shows the full requirements checklist with slot statuses
6. Clicking "Upload" on a requirement slot opens the upload modal pre-tagged to that requirement
7. Uploaded documents create a `user_requirement_fulfillments` row with status `pending`
8. Cross-position reuse: uploading IS-700 once fulfills IS-700 slots across all pursued positions
9. Staff verification queue shows all `pending` fulfillments with document preview
10. Staff can verify (with optional expiry date) or reject (with required reason) each fulfillment
11. Completion percentage on profile updates in real-time based on verified count
12. RLS enforces: users see own fulfillments, staff sees all, anyone can read position_requirements
13. Dashboard sidebar includes "Qualifications" link
14. `npm run build` passes with zero errors

---

## Open Questions

1. **Should we show ALL 321 positions in the browse/search, or filter to active/common ones?** Recommendation: show all, but allow filtering by discipline/category. Let the RTLT catalog be the catalog.

2. **Course equivalency.** RTLT says "or equivalent" for many courses. Do we allow staff to mark a different course as satisfying a requirement? Recommendation: yes, via a notes field on the fulfillment. Staff can verify a non-exact-match document with a note explaining the equivalency.

3. **Experience verification without documents.** Some experience requirements ("3 years supervisory") can be inferred from deployment records in the system. Should we auto-check these? Recommendation: future enhancement. For now, staff manually verifies based on system data.

---

## Agent Lenses

### Baseplate (data/schema)
- `position_requirements` is append-mostly — seeded from RTLT, rarely modified after initial load
- `user_requirement_fulfillments` UNIQUE constraint on (user_id, requirement_id) prevents duplicate uploads per slot
- Cross-position reuse requires a query: "find all requirements with this code for this user's pursued positions" — indexed on `code`
- ~4,200 requirement rows × ~100 users = ~420K fulfillment rows at scale. Well within Postgres comfort zone.

### Meridian (doctrine)
- Requirement structure aligns 1:1 with FEMA RTLT Position Qualification data
- Course codes match FEMA EMI catalog exactly (IS-700, ICS-300, E/L 0950, etc.)
- Does NOT impose Grey Sky requirements beyond FEMA — this is FEMA's standard, presented clearly

### Lookout (UX)
- Checklist UI is the killer feature. It makes the invisible visible: "here's exactly what you need, here's where you are"
- Completion percentage is motivational — gamification without gimmicks
- Upload must be frictionless: click slot → drop file → done. No re-tagging, no category selection — the slot already knows what it expects
- Staff queue must be fast: document preview + verify/reject. No unnecessary steps.

### Threshold (security)
- RLS: users cannot see other users' fulfillments. Staff can see all for review.
- Fulfillment status can only be changed to `verified`/`rejected` by staff (role check in server action)
- Document access follows existing DOC-206 RLS — user owns their documents, staff can view for verification
- No public API for requirement fulfillments — all mutations through authenticated server actions

---

## Claude Code Prompt

You are building the RTLT Position Requirements system for the Grey Sky Responder Society portal. This is a Next.js 16 + Supabase (Postgres + Storage) application.

### What You Are Building

A position-driven qualification tracking system: database migration, RTLT seed script, TypeScript types, server actions, responder-facing qualification checklist UI, and staff verification queue.

### Prerequisites

- DOC-206 Document Library is implemented (document upload, storage, RLS)
- Positions table exists with RTLT position data seeded
- RTLT reference data available at:
  - `references/rtlt/positions_db.json` (321 positions with course_codes, certifications, fitness, etc.)
  - `references/rtlt/training_courses_db.json` (146 courses, code → title + description)
  - `references/rtlt/ptb_db.json` (111 PTBs)
  - `references/rtlt/ptb_pq_map.json` (37 PTB ↔ position mappings)

### Key Constraint

**Existing schema is authoritative.** Read the existing migrations before writing new ones. Use existing enum types where they exist. Extend, don't duplicate.

### Build Order

1. Migration: enums + tables + indexes + RLS
2. TypeScript types and Zod validators
3. Seed script (loads RTLT data into position_requirements)
4. Server actions (CRUD fulfillments, staff verify/reject)
5. API routes
6. Responder UI: Qualifications page + checklist + upload modal
7. Staff UI: Verification queue
8. Dashboard integration (sidebar link, profile stats)

### Reference

- Design doc: `docs/design/GSR-DOC-207-POSITION-REQUIREMENTS.md` (this doc)
- Existing migrations: `supabase/migrations/` (read all before writing new migration)
- Existing types: `src/lib/types/` (follow patterns)
- Existing server actions: `src/lib/actions/` (follow patterns)
- Brand: Command Navy `#0A1628`, Signal Gold `#C5933A`
- CSS vars: `--gs-navy`, `--gs-gold`, `--gs-steel`, `--gs-cloud`, `--gs-bone`
