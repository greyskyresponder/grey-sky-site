---
od_id: OD-05
title: "Assessor Report Architecture — Universal vs. Team-Type-Specific"
status: open
decided_by: Roy E. Dunn
decided_on:
unblocks:
  - GSR-DOC-605
  - GSR-DOC-606
---

# OD-05: Assessor Report — Universal vs. Team-Type-Specific

## Context

Parallel decision to OD-04. After a team self-assessment is collected, an assessor (Longview personnel or partner-organization equivalent) writes a field report and a final report. These are the agency-deliverable documents — the artifacts the sponsoring organization receives at engagement closeout.

The structural question for the assessor reports is the same as for the self-assessment form: **one report template covering all RTLT team types, or per-team-type variants?**

The reports include a Summary Table, Readiness Determination, per-section scoring (0–3 or Y/N), observations and recommendations, RTLT typing ratings, confirmations, and signatures. The deliverable is consequential: it is what the sponsoring organization presents to its leadership and to the resource-typing authority. It must be defensible.

## Options

### Option 1 — Universal report template tied to OD-04 universal form (Recommended if OD-04 = Option 1)

If the self-assessment is a single universal form, the assessor report mirrors that structure: 11 scored sections, a uniform Summary Table, a single Readiness Determination scale, RTLT typing rating against the team type's RTLT-defined typing levels.

- **Pro:** consistency end-to-end. The assessment a team submits has a one-to-one structural match with the report it receives. Cross-team-type comparisons are possible.
- **Pro:** one report template to maintain.
- **Pro:** the RTLT typing rating can be data-driven — pull the team type's typing definition from the RTLT seed and score against it.
- **Con:** specialty disciplines (e.g. hazmat with its tier-specific equipment thresholds) may want to expose discipline-specific findings that a universal template doesn't surface.

### Option 2 — Per-team-type report variants

Each team type gets a tailored report template. Florida USAR Type 3 has its own template; Florida Type 2 SAR has another; Hazmat tiers have their own. This is the current Longview field practice — the SRT-CAP report Longview produces today is Florida-discipline-specific.

- **Pro:** each report reads natively to assessors and sponsoring agencies who already know the discipline's terminology and structure.
- **Pro:** retains the existing Longview field practice without forcing a refactor of how assessors write.
- **Con:** maintenance burden scales with team-type count.
- **Con:** cross-team aggregate reporting (e.g. "show me all USAR teams credentialed this year and their typing levels") becomes hard.
- **Con:** assessor training cost rises.

### Option 3 — Hybrid: universal report shell with discipline-specific findings appendix

The Summary Table, Readiness Determination, and section scoring use a universal structure. The assessor can append a discipline-specific findings document (free-form Markdown rendered as a PDF appendix). This captures the safety valve without the full Option 2 cost.

- **Pro:** structured data is uniform; narrative is flexible.
- **Pro:** preserves the agency-deliverable feel of Option 2 with most of Option 1's structural benefits.
- **Con:** the unstructured appendix complicates downstream data analysis (the unstructured part is unstructured).

## Recommendation

**Option 1, paired with OD-04 = Option 1.** The structural symmetry between assessment and report matters for credibility and downstream reporting. Option 3 is a defensible fallback if pilot engagements with the Florida SRT-13 reveal the universal report misses material discipline-specific findings. Start with Option 1; promote to Option 3 only if pilot data demands it.

If OD-04 lands on Option 2 (team-type-specific forms), this decision automatically becomes Option 2 — the report must match the assessment.

## Downstream Impact

Resolving in favor of Option 1 unblocks:

- **GSR-DOC-605** — Assessor Report, Field Report: single template, scored sections aligned with the universal self-assessment structure
- **GSR-DOC-606** — Assessor Report, Final Report: single template, Summary Table + Readiness Determination + RTLT typing rating, all uniform across team types
- **GSR-DOC-607** — Team Credentialing Outcome: outcome data model can assume uniform report structure
- **GSR-DOC-612** — Organization Dashboard Readiness + Reports view: aggregate reporting becomes possible

## Coupling to OD-04

This decision is structurally coupled to OD-04. Resolving them together is recommended. Independent resolution risks an asymmetric design where the form is universal but the report isn't, or vice versa — both costly outcomes.

## Decision

> **To be filled in by Roy E. Dunn.** Recommended option above; record the chosen option, date, and any modifying notes here. Update the `status` and `decided_on` fields in frontmatter when this is set.
