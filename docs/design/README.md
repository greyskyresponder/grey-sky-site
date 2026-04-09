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
| Doc ID | Title | Source |
|--------|-------|--------|
| GSR-REF-EXEC-FRAMEWORK | Executive Framework | Roy E. Dunn (Feb 2026) |
| GSR-REF-AGENT-ARCHITECTURE | Agent Team Architecture | Roy E. Dunn (Mar 2026) |
| GSR-REF-EXECUTIVE-SUMMARY | Executive Summary | Roy E. Dunn (Feb 2026) |
| GSR-REF-OPENCLAW-IMPLEMENTATION | OpenClaw Implementation Guide | Roy E. Dunn (Mar 2026) |

### Reference Data
| File | Records | Description |
|------|---------|-------------|
| references/FEMA_RTLT_NQS_Database.json | 625 | Full FEMA RTLT database — 328 position qualifications, 162 resource typing definitions, 115 PTBs, 20 skillsets |
| references/RTLT-TAXONOMY.md | — | Discipline taxonomy reference |

## Conventions
- **Doc IDs:** GSR-DOC-NNN for buildable specs, GSR-REF-XXX for reference docs
- **Frontmatter required** on all GSR-DOC files (see GSR-DOC-TEMPLATE.md)
- **One doc per buildable unit** — scoped to what one Claude Code session can execute and verify
- **blocks_on** references other GSR-DOC IDs, not vague descriptions
- **Acceptance criteria** must be testable — "page renders" not "page looks good"
