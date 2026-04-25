---
doc_id: NAMING-CONVENTIONS
title: Documentation Naming and Structure Conventions
classification: INTERNAL — DEVELOPMENT REFERENCE
status: active
author: Roy E. Dunn
created: 2026-04-24
updated: 2026-04-24
notes: Canonical authority for filenames, folder layout, and structural conventions across all Grey Sky design, reference, prompt, and journal documentation. ATLAS, OpenClaw, Claude App, and Claude Code all follow this. Updates require explicit owner approval.
---

# Documentation Naming and Structure Conventions

## Why this exists

Every doc in this repo is read by humans, agents, or build tooling. Inconsistent filenames break agent triage, hide intent, and create silent collisions in the build queue. This document is the rule of record. Anything inconsistent with it is wrong.

---

## Folder Layout

```
docs/
├── design/                  Design specs and reference docs (the build authority)
├── prompts/                 Self-contained Claude Code build prompts
├── journal/                 Dated status snapshots, rolling logs, archive manifests
├── agents/                  Agent role definitions and operating discipline
├── NAMING-CONVENTIONS.md    Pointer to docs/design/NAMING-CONVENTIONS.md
├── STRIPE-SETUP.md          Operational setup notes (uncategorized ops)
└── LIFELINES-SCOPE.md       Scope doc for a specific initiative (uncategorized ops)
```

`docs/design/` is the only folder Claude Code reads as authoritative spec.
`docs/prompts/` is the only folder ATLAS pulls execution prompts from.
`docs/journal/` is append-only history. Nothing in journal/ drives a build.
`docs/agents/` defines how each agent (Claude App, Claude Code, ATLAS) operates.

---

## Filename Patterns

### Design Specifications — `docs/design/`

```
GSR-DOC-NNN-FEATURE-NAME.md
```

- `NNN` is the canonical doc ID per `GSR-DOC-QUEUE.md`.
- `FEATURE-NAME` is the single-line title in HYPHEN-UPPER-CASE. No spaces, no underscores, no lowercase.
- Each doc covers exactly one buildable unit. No multi-numbered filenames (e.g., never `GSR-DOC-202-203-*.md`).
- No version suffixes (e.g., never `GSR-DOC-NNN-*-2.md`). If a doc is superseded, archive the older version to `docs/journal/` with a `SUPERSEDED-` prefix.

Examples:
- `GSR-DOC-100-PUBLIC-SITE-HOME.md`
- `GSR-DOC-202-MEMBER-PROFILE.md`
- `GSR-DOC-400-VALIDATION-REQUEST.md`

### Reference Documents — `docs/design/`

```
GSR-REF-NNN-TOPIC.md
```

- `NNN` is the canonical reference ID per `GSR-DOC-QUEUE.md` § Reference Documents.
- Reference docs are non-buildable. They inform decisions but never drive a Claude Code session.

Examples:
- `GSR-REF-001-EXECUTIVE-FRAMEWORK.md`
- `GSR-REF-002-AGENT-ARCHITECTURE.md`
- `GSR-REF-003-EXECUTIVE-SUMMARY.md`
- `GSR-REF-004-IMPLEMENTATION-GUIDE.md`

### Build Prompts — `docs/prompts/`

```
GSR-DOC-NNN-PROMPT.md
```

- One prompt file per design doc.
- The prompt file is a self-contained execution package — Claude Code does not read other docs to interpret it.
- If a build covers multiple consecutive doc IDs by intent (rare), name the file by the lead doc only and reference the others inside: `GSR-DOC-400-PROMPT.md` covers 400 and references 401 inline. Do not put multiple IDs in the filename.

Examples:
- `GSR-DOC-200-PROMPT.md`
- `GSR-DOC-202-PROMPT.md`
- `GSR-DOC-400-PROMPT.md`

### Build Packages (multi-prompt bundles) — `docs/prompts/`

```
PACKAGE-YYYY-MM-DD-NAME.md
```

- A package is a coordinator file referencing multiple `GSR-DOC-NNN-PROMPT.md` files for a specific build round.
- `YYYY-MM-DD` is the date the package was published.

Examples:
- `PACKAGE-2026-04-13-INDEX.md`
- `PACKAGE-2026-04-15-CONCURRENT-BUILD.md`

### Journal Entries — `docs/journal/`

Status snapshots:
```
STATUS-YYYY-MM-DD.md
STATUS-YYYY-MM-DD-{SOURCE}.md   (when multiple snapshots exist for the same date)
```

- `{SOURCE}` is one of `CLAUDE-APP`, `CLAUDE-CODE`, `ATLAS`, or another labeled author when needed to disambiguate.

Rolling logs (no date in filename):
```
BUILD-JOURNAL.md
BUILD-STATUS.md
```

Archive manifests:
```
ARCHIVE-MANIFEST-YYYY-MM-DD.md
SUPERSEDED-OLD-FILENAME.md
```

### Agent Operating Docs — `docs/agents/`

```
AGENT-NAME-ROLE.md
```

Examples:
- `CLAUDE-APP-ARCHITECT.md`
- `CLAUDE-APP-ONBOARDING.md`
- `CLAUDE-CODE-DISCIPLINE.md`

---

## Required Frontmatter

Every `GSR-DOC-NNN-*.md` and `GSR-REF-NNN-*.md` MUST start with YAML frontmatter:

```yaml
---
doc_id: GSR-DOC-NNN
title: "Short Descriptive Title"
phase: 0-9
status: draft | review | approved | in-build | complete | superseded
blocks_on:
  - GSR-DOC-XXX
priority: critical | high | normal | low
author: Roy E. Dunn
created: YYYY-MM-DD
updated: YYYY-MM-DD
notes: Optional one-paragraph context.
---
```

`GSR-DOC-NNN-PROMPT.md` files do not require frontmatter but must reference the design doc ID at the top.

---

## Doc ID Number Ranges (per `GSR-DOC-QUEUE.md`)

| Range | Scope |
|-------|-------|
| 000 | Platform Reference Specification |
| 001–099 | Phase 0: Foundation, infrastructure |
| 100–199 | Phase 1: Public Site |
| 200–299 | Phase 2: Member Portal + Payments |
| 300–399 | Phase 3: ATLAS Deployment + AI Layer |
| 400–499 | Phase 4: Validation / Evaluation Workflow |
| 500–599 | Phase 5: Certification + Credentialing |
| 600–699 | Phase 6: Organization Sponsorship + Team Credentialing |
| 900–999 | Phase 9: Cross-cutting (security, DevOps, observability) |

`GSR-DOC-QUEUE.md` is the registry. A number is reserved the moment it appears in QUEUE. Authors must consult QUEUE before introducing a new number.

---

## Hard Rules

1. **One doc per buildable unit.** Each `GSR-DOC-NNN-*.md` is one Claude Code session's worth of work. Multi-numbered filenames are forbidden.
2. **No version suffixes.** Replacing a doc means archiving the old one with `SUPERSEDED-` prefix in `docs/journal/`, not appending `-2`.
3. **HYPHEN-UPPER-CASE only.** No underscores. No mixed case. No spaces.
4. **Filename matches `doc_id` in frontmatter.** If frontmatter says `doc_id: GSR-DOC-202` then the filename starts with `GSR-DOC-202-`.
5. **No prompt files in `docs/design/`.** No design specs in `docs/prompts/`.
6. **Status files are dated.** `STATUS-YYYY-MM-DD.md` format. Rolling logs (`BUILD-JOURNAL.md`, `BUILD-STATUS.md`) are the only exceptions.
7. **Renaming uses `git mv`.** Preserves history. Never copy-then-delete.

---

## Owner Approval Required

Changes to this document, to filename patterns, or to folder layout require explicit approval from Roy E. Dunn. Agents do not modify these conventions without it.
