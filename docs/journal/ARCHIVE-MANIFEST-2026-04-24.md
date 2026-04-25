---
doc_id: ARCHIVE-MANIFEST-2026-04-24
title: "Documentation Naming Normalization — Rename Map"
classification: INTERNAL — DEVELOPMENT REFERENCE
status: complete
author: Roy E. Dunn
date: 2026-04-24
notes: Full audit trail of the 2026-04-24 documentation naming and structure normalization. Every move, rename, split, and archive recorded for future reference and OpenClaw reconciliation. Filename conventions established are documented in docs/design/NAMING-CONVENTIONS.md.
---

# Archive Manifest — 2026-04-24 Naming Normalization

## Purpose

On 2026-04-24, all documentation in this repository was normalized against a single canonical naming convention (`docs/design/NAMING-CONVENTIONS.md`). This manifest is the complete record of what changed.

OpenClaw, ATLAS, Claude App, and Claude Code can all use this manifest to resolve any reference to an old filename.

## Triggering Decisions

Roy E. Dunn directed the normalization with four decisions:
1. **Multi-numbered design docs** (e.g., `GSR-DOC-202-203-*.md`): split into single-numbered files, one buildable unit per file.
2. **Prompt naming**: canonical pattern is `GSR-DOC-NNN-PROMPT.md`, one per design doc.
3. **Status files**: relocated to `docs/journal/` with pattern `STATUS-YYYY-MM-DD.md`.
4. **Execution scope**: applied directly on `main` (no feature branch).

## Authority

The canonical rules are in `docs/design/NAMING-CONVENTIONS.md`. This manifest documents the one-time migration. Going forward, all filenames must conform to NAMING-CONVENTIONS.md.

---

## 1. Folder Structure Changes

| Action | Folder |
|--------|--------|
| Created | `docs/journal/` — dated status snapshots, rolling logs, archive manifests, superseded docs |
| Created | `docs/agents/` — agent role definitions and operating discipline |
| Unchanged | `docs/design/` — design specs and reference docs |
| Unchanged | `docs/prompts/` — Claude Code build prompts |

---

## 2. Folder Fixes (Files in Wrong Location)

| Old Path | New Path | Reason |
|----------|----------|--------|
| `docs/design/GSR-DOC-200-PROMPT.md` | `docs/prompts/GSR-DOC-200-PROMPT.md` | Prompt files belong in `prompts/`, not `design/` |
| `docs/design/GSR-DOC-202-EXPANSION-BUILD-PROMPT.md` | `docs/prompts/GSR-DOC-202-PROMPT.md` | Prompt file relocated and renamed to canonical pattern |
| `docs/prompts/GSR-DOC-901-SECURITY-PATCH.md` | `docs/design/GSR-DOC-901-SECURITY-PATCH.md` | Full design doc with frontmatter — belongs in `design/` |
| `docs/prompts/GSR-DOC-902-TESTING-FOUNDATION.md` | `docs/design/GSR-DOC-902-TESTING-FOUNDATION.md` | Full design doc with frontmatter — belongs in `design/` |

---

## 3. GSR-REF Filename Normalization

All reference docs renumbered to match `GSR-DOC-QUEUE.md` IDs.

| Old Path | New Path |
|----------|----------|
| `docs/GREY_SKY_EXECUTIVE_FRAMEWORK.md` | `docs/design/GSR-REF-001-EXECUTIVE-FRAMEWORK.md` |
| `docs/design/GSR-REF-AGENT-ARCHITECTURE.md` | `docs/design/GSR-REF-002-AGENT-ARCHITECTURE.md` |
| `docs/design/GSR-REF-EXECUTIVE-SUMMARY.md` | `docs/design/GSR-REF-003-EXECUTIVE-SUMMARY.md` |
| `docs/design/GSR-REF-OPENCLAW-IMPLEMENTATION.md` | `docs/design/GSR-REF-004-IMPLEMENTATION-GUIDE.md` |

---

## 4. Status / Journal Migration

All status snapshots normalized to `docs/journal/STATUS-YYYY-MM-DD.md`. Rolling logs moved to `docs/journal/` with original names preserved.

| Old Path | New Path |
|----------|----------|
| `docs/PROJECT-STATUS.md` | `docs/journal/STATUS-2026-04-11.md` |
| `docs/CLAUDE-APP-STATUS-UPDATE-2026-04-13.md` | `docs/journal/STATUS-2026-04-13.md` |
| `docs/prompts/CLAUDE-APP-STATUS-2026-04-14.md` | `docs/journal/STATUS-2026-04-14-CLAUDE-APP.md` |
| `docs/prompts/CLAUDE-APP-STATUS-2026-04-15.md` | `docs/journal/STATUS-2026-04-15.md` |
| `docs/prompts/CLAUDE-APP-STATUS-2026-04-16.md` | `docs/journal/STATUS-2026-04-16.md` |
| `docs/BUILD-JOURNAL.md` | `docs/journal/BUILD-JOURNAL.md` |
| `docs/BUILD-STATUS.md` | `docs/journal/BUILD-STATUS.md` |

`STATUS-2026-04-14-CLAUDE-APP.md` retains the source suffix because two snapshots exist for that date (the other is `BUILD-STATUS.md`, which is a rolling log not a dated snapshot).

---

## 5. Agent Operating Docs Migration

Three persistent operating-discipline docs moved out of `prompts/` into a dedicated `agents/` folder.

| Old Path | New Path |
|----------|----------|
| `docs/prompts/CLAUDE-APP-ONBOARDING.md` | `docs/agents/CLAUDE-APP-ONBOARDING.md` |
| `docs/prompts/CLAUDE-APP-ARCHITECT.md` | `docs/agents/CLAUDE-APP-ARCHITECT.md` |
| `docs/prompts/CLAUDE-CODE-DISCIPLINE.md` | `docs/agents/CLAUDE-CODE-DISCIPLINE.md` |

These are not build prompts. They are guardrail/role-definition documents.

---

## 6. Prompt File Normalization

The two competing prompt-naming systems (`GSR-DOC-NNN-PROMPT.md` and `NN-BUILD-DOC-NNN.md`) consolidated to the canonical `GSR-DOC-NNN-PROMPT.md` pattern. Build packages renamed to `PACKAGE-YYYY-MM-DD-*.md` based on git-add date.

| Old Path | New Path |
|----------|----------|
| `docs/prompts/01-BUILD-DOC-102.md` | `docs/prompts/GSR-DOC-102-PROMPT.md` |
| `docs/prompts/02-BUILD-DOC-205.md` | `docs/prompts/GSR-DOC-205-PROMPT.md` |
| `docs/prompts/03-BUILD-DOC-900.md` | `docs/prompts/GSR-DOC-900-PROMPT.md` |
| `docs/prompts/04-BUILD-DOC-207.md` | `docs/prompts/GSR-DOC-207-PROMPT.md` |
| `docs/prompts/05-BUILD-DOC-101.md` | `docs/prompts/GSR-DOC-101-PROMPT.md` |
| `docs/prompts/06-BUILD-DOC-400-403.md` | `docs/prompts/GSR-DOC-400-PROMPT.md` |
| `docs/prompts/00-BUILD-PACKAGE-INDEX.md` | `docs/prompts/PACKAGE-2026-04-15-INDEX.md` |
| `docs/prompts/CONCURRENT-BUILD-ROUND-2.md` | `docs/prompts/PACKAGE-2026-04-14-CONCURRENT-BUILD-ROUND-2.md` |

`GSR-DOC-400-PROMPT.md` covers both DOC-400 and DOC-401 (and references DOC-402/403); naming reflects the lead doc only per NAMING-CONVENTIONS.md. The body of the prompt was updated to reference the new split design doc filenames.

---

## 7. Design Doc Splits (Multi-Numbered Files Resolved)

Three combined design docs were split into six single-numbered files. Each new file carries fresh frontmatter dated 2026-04-24 noting the split. Combined Claude Code prompts are preserved at the prompt-side and reference the new split design docs.

### 7.1 — `GSR-DOC-202-203-PROFILE-DEPLOYMENTS.md`

| Old Path | New Path |
|----------|----------|
| `docs/design/GSR-DOC-202-203-PROFILE-DEPLOYMENTS.md` | DELETED — split into the two below |
| (Member Profile content) | `docs/design/GSR-DOC-202-MEMBER-PROFILE.md` |
| (Deployment Records content + ICS 222 mapping) | `docs/design/GSR-DOC-203-DEPLOYMENT-RECORDS.md` |

A pre-existing `GSR-DOC-202-MEMBER-PROFILE.md` (status: planned-expansion, dated 2026-04-11) was archived first to preserve the older draft:

| Old Path | New Path |
|----------|----------|
| `docs/design/GSR-DOC-202-MEMBER-PROFILE.md` (Apr 11 draft) | `docs/journal/SUPERSEDED-GSR-DOC-202-MEMBER-PROFILE-PRE-EXPANSION.md` |

### 7.2 — `GSR-DOC-400-401-VALIDATION.md`

| Old Path | New Path |
|----------|----------|
| `docs/design/GSR-DOC-400-401-VALIDATION.md` | DELETED — split into the two below |
| (Member-side request flow) | `docs/design/GSR-DOC-400-VALIDATION-REQUEST.md` |
| (Public response form `/validate/[token]`) | `docs/design/GSR-DOC-401-VALIDATION-RESPONSE.md` |

### 7.3 — `GSR-DOC-402-403-EVALUATION.md`

| Old Path | New Path |
|----------|----------|
| `docs/design/GSR-DOC-402-403-EVALUATION.md` | DELETED — split into the two below |
| (Member-side request flow) | `docs/design/GSR-DOC-402-EVALUATION-REQUEST.md` |
| (Public response form `/evaluate/[token]`) | `docs/design/GSR-DOC-403-EVALUATION-RESPONSE.md` |

---

## 8. Numbering Collisions Resolved

### 8.1 — `GSR-DOC-005`

Collision: both `GSR-DOC-005-ENV-CONFIG.md` and `GSR-DOC-005-PUBLIC-SITE.md` existed. QUEUE assigns 005 to Environment Configuration.

Resolution: `GSR-DOC-005-PUBLIC-SITE.md` was the predecessor design doc that drove the Phase 1 build. The Phase 1 build is now represented by GSR-DOC-100 through GSR-DOC-107. The 005 file was archived as superseded.

| Old Path | New Path |
|----------|----------|
| `docs/design/GSR-DOC-005-PUBLIC-SITE.md` | `docs/journal/SUPERSEDED-GSR-DOC-005-PUBLIC-SITE.md` |
| `docs/design/GSR-DOC-005-ENV-CONFIG.md` | unchanged (canonical 005) |

### 8.2 — `GSR-DOC-206`

Collision: `GSR-DOC-206-DOCUMENT-LIBRARY.md` (status: draft) and `GSR-DOC-206-DOCUMENT-LIBRARY-2.md` (status: approved, with frontmatter, dated 2026-04-13). Two competing versions of the same doc. The `-2` suffix violates NAMING-CONVENTIONS.md.

Resolution: the approved version (`-2`) is canonical. The older draft archived.

| Old Path | New Path |
|----------|----------|
| `docs/design/GSR-DOC-206-DOCUMENT-LIBRARY.md` (older draft) | `docs/journal/SUPERSEDED-GSR-DOC-206-DOCUMENT-LIBRARY-DRAFT.md` |
| `docs/design/GSR-DOC-206-DOCUMENT-LIBRARY-2.md` | `docs/design/GSR-DOC-206-DOCUMENT-LIBRARY.md` |

---

## 9. Phase 9 Numbering Note

The QUEUE originally listed planned doc IDs:
- `GSR-DOC-901` — Audit Logging + Tamper Evidence
- `GSR-DOC-902` — Input Validation — Zod Schemas

But authored files claimed the same numbers for different topics:
- `GSR-DOC-901-SECURITY-PATCH.md` (real, drafted 2026-04-15)
- `GSR-DOC-902-TESTING-FOUNDATION.md` (real, drafted 2026-04-15)

Resolution (in `GSR-DOC-QUEUE.md`):
- The real authored files keep their numbers (901 = Security Patch, 902 = Testing Foundation).
- The previously planned topics renumbered:
  - Audit Logging + Tamper Evidence → **GSR-DOC-908** (not yet authored)
  - Input Validation — Zod Schemas → **GSR-DOC-909** (not yet authored)
- QUEUE entries annotated with "(Renumbered from 901/902 on 2026-04-24)" notes.

---

## 10. New Documents Created

| Path | Purpose |
|------|---------|
| `docs/design/NAMING-CONVENTIONS.md` | Canonical authority for all filename, folder, and structural rules |
| `docs/journal/ARCHIVE-MANIFEST-2026-04-24.md` | This document |

---

## 11. Cross-Reference Updates

The following live (non-historical) files had stale path references updated to point at the new locations:

| File | Updated References |
|------|---------------------|
| `CLAUDE.md` (project root) | Reference data section, design doc pipeline section |
| `docs/design/README.md` | Reference Documents table, Conventions section |
| `docs/design/GSR-DOC-QUEUE.md` | Phase 2 entries (202, 203), Phase 4 entries (400-403), Phase 9 entries (900-909) |
| `docs/prompts/GSR-DOC-400-PROMPT.md` | Design doc paths, reference file paths |
| `docs/prompts/PACKAGE-2026-04-15-INDEX.md` | Source attribution, build file table, execution order |

Historical journal documents (`docs/journal/STATUS-*.md`, `docs/journal/BUILD-*.md`) were **not edited** — they are dated snapshots and editing them would falsify the historical record. References inside those files to old paths remain as written.

---

## 12. Files Deleted

The following combined design docs were removed in favor of their split successors:

- `docs/design/GSR-DOC-202-203-PROFILE-DEPLOYMENTS.md`
- `docs/design/GSR-DOC-400-401-VALIDATION.md`
- `docs/design/GSR-DOC-402-403-EVALUATION.md`

Pre-deletion copies are preserved in the repository's git history. Anyone needing the original combined content can `git show <commit>:docs/design/<filename>` to retrieve it.

---

## 13. Summary Counts

| Action | Count |
|--------|-------|
| Files moved (folder fixes) | 4 |
| Files renamed (REF normalization) | 4 |
| Files moved + renamed (status to journal) | 7 |
| Files moved (agents) | 3 |
| Prompt files renamed | 8 |
| Design docs split (combined → individual) | 3 → 6 |
| Files archived (superseded) | 4 |
| New documents created | 2 |
| Cross-reference files updated | 5 |

**Total filesystem changes:** 41 paths affected.

---

## 14. Going Forward

All filenames now conform to `docs/design/NAMING-CONVENTIONS.md`. Any new doc must follow the patterns there. Any rename requires an update to this folder's archive manifest pattern (`ARCHIVE-MANIFEST-YYYY-MM-DD.md`).

ATLAS scans `GSR-DOC-QUEUE.md` for build readiness. Claude Code reads `CLAUDE.md` first, then `NAMING-CONVENTIONS.md`, then the assigned design doc. OpenClaw orchestrates from `docs/prompts/GSR-DOC-NNN-PROMPT.md` files.

The next builds proceed against the new structure.
