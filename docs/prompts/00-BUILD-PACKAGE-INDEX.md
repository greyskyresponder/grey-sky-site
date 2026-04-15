# Grey Sky Responder Society — Build Package

**Generated:** 2026-04-14
**Purpose:** Separate build prompts for parallel Claude Code terminals
**Source:** Architecture Agent (Claude App), derived from CLAUDE-APP-STATUS-UPDATE-2026-04-13

---

## Current State (as of 2026-04-13)

| Metric | Value |
|--------|-------|
| Commits | 51 |
| Source files | 165+ TS/TSX |
| Migrations | 11 |
| Build | ✅ Clean — zero errors |

### What's Done

| Phase | Status |
|-------|--------|
| Phase 0 — Foundation (7 docs) | ✅ ALL COMPLETE |
| Phase 1 — Public Site (8 docs) | ✅ Substantially complete (DOC-101 blocked, DOC-102 ready, DOC-105 deferred) |
| Phase 2 — Member Portal (9 docs) | 🔶 6 of 9 complete (DOC-200–204, 206 done) |

### What's In This Package

Five self-contained build files, each designed for a separate Claude Code terminal. They can run in parallel where noted.

| File | Doc ID | Description | Can Parallel? |
|------|--------|-------------|---------------|
| `01-BUILD-DOC-102.md` | GSR-DOC-102 | Organizations + Agencies public page | ✅ Yes — no DB, no dependencies |
| `02-BUILD-DOC-205.md` | GSR-DOC-205 | Sky Coins economy — DB, types, UI | ✅ Yes — new tables, no conflicts |
| `03-BUILD-DOC-900.md` | GSR-DOC-900 | Security hardening — MFA, CSP, rate limiting | ⚠️ After DOC-205 migration (migration ordering) |
| `04-BUILD-DOC-207.md` | GSR-DOC-207 | Stripe integration — membership + coin purchases | ⛔ After DOC-205 (needs coin tables) |
| `05-BUILD-DOC-101.md` | GSR-DOC-101 | Membership page copy update | ⛔ After DOC-205 (needs coin pricing) |

### Recommended Execution Order

**Wave 1 (parallel):**
- Terminal A: `01-BUILD-DOC-102.md` — Organizations page (static, no DB)
- Terminal B: `02-BUILD-DOC-205.md` — Sky Coins economy (new migration + UI)

**Wave 2 (after Wave 1 merges):**
- Terminal C: `03-BUILD-DOC-900.md` — Security hardening (migration after DOC-205)

**Wave 3 (after DOC-205 confirmed):**
- Terminal D: `04-BUILD-DOC-207.md` — Stripe integration
- Terminal E: `05-BUILD-DOC-101.md` — Membership page copy refresh

### Not In This Package (and why)

| Doc | Reason |
|-----|--------|
| DOC-208 (Certification Pathways) | No design doc written yet. Needs architecture session. |
| DOC-105 (Contact Page) | Low priority. mailto in footer is sufficient for now. |
| DOC-400/401 (Validation Workflow) | Phase 4. Needs DOC-205 built first. Design doc not written. |

### Open Decision Points Resolved in This Package

| ID | Decision | Resolved In |
|----|----------|-------------|
| OD-03 | Sky Coins: $1 = 10 coins, $100 membership = 1,000 coins | DOC-205 |
| OD-08 | Cert renewal: 3yr. Credential renewal: 2yr. | DOC-205 |
| OD-15 | Five-tier product catalog with pricing | DOC-205 |

---

*Hand each numbered file to a separate Claude Code terminal. Each file is self-contained — Claude Code needs only the file and access to the repo.*
