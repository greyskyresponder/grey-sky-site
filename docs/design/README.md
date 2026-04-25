# Grey Sky Responder — Design Doc Registry

## Workflow
1. **Draft** — Roy + Claude App define the design doc
2. **Review** — ATLAS validates against platform spec, flags gaps
3. **Approved** — Ready for build (status: approved, blocks_on: [])
4. **In-Build** — ATLAS generates prompt, Claude Code executes
5. **Complete** — Verified against acceptance criteria, pushed

## Phase Map

| Phase | Scope | Status |
|-------|-------|--------|
| 0 | Platform Reference Spec | ✅ Approved |
| 1 | Marketing Pages (RTLT, Story, Community) | ✅ Complete (2026-04-09) |
| 2 | Backend Foundation + Schema + Seeds | ✅ Complete (2026-04-09) |
| 3 | Auth + Member Dashboard | Pending |
| 4 | Agency Dashboard + SRT-CAP Workflow | Pending |
| 5 | Admin Tools + Security Hardening | Pending |

## Documents

### Specifications
| Doc ID | Title | Phase | Status |
|--------|-------|-------|--------|
| GSR-DOC-000 | Platform Reference Specification | 0 | approved |
| GSR-DOC-001 | Backend Foundation | 2 | complete |

### Reference Documents (non-buildable)
| Doc ID | Title | Filename | Source |
|--------|-------|----------|--------|
| GSR-REF-001 | Executive Framework | `GSR-REF-001-EXECUTIVE-FRAMEWORK.md` | Roy E. Dunn (Feb 2026) |
| GSR-REF-002 | Agent Team Architecture | `GSR-REF-002-AGENT-ARCHITECTURE.md` | Roy E. Dunn (Mar 2026) |
| GSR-REF-003 | Executive Summary | `GSR-REF-003-EXECUTIVE-SUMMARY.md` | Roy E. Dunn (Feb 2026) |
| GSR-REF-004 | Implementation Guide | `GSR-REF-004-IMPLEMENTATION-GUIDE.md` | Roy E. Dunn (Mar 2026) |

### Reference Data
| File | Records | Description |
|------|---------|-------------|
| references/FEMA_RTLT_NQS_Database.json | 625 | Full FEMA RTLT database — 328 position qualifications, 162 resource typing definitions, 115 PTBs, 20 skillsets |
| references/RTLT-TAXONOMY.md | — | Discipline taxonomy reference |

## Conventions
- **Canonical reference:** [`NAMING-CONVENTIONS.md`](./NAMING-CONVENTIONS.md) is the single source of truth for filenames, folders, and structural rules. Read it before adding or renaming any doc.
- **Doc IDs:** `GSR-DOC-NNN-FEATURE-NAME.md` for buildable specs, `GSR-REF-NNN-TOPIC.md` for reference docs.
- **Frontmatter required** on all GSR-DOC and GSR-REF files (see `GSR-DOC-TEMPLATE.md`).
- **One doc per buildable unit** — multi-numbered filenames are forbidden. Each doc is scoped to what one Claude Code session can execute and verify.
- **No version suffixes** — supersede by archiving older versions to `docs/journal/` with `SUPERSEDED-` prefix.
- **blocks_on** references other GSR-DOC IDs, not vague descriptions.
- **Acceptance criteria** must be testable — "page renders" not "page looks good".
- **Folder layout:** `docs/design/` (specs + refs), `docs/prompts/` (Claude Code build prompts), `docs/journal/` (status snapshots, archive), `docs/agents/` (agent operating docs).
