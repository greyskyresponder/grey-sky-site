---
od_id: OD-04
title: "Self-Assessment Form Architecture — Universal vs. Team-Type-Specific"
status: open
decided_by: Roy E. Dunn
decided_on:
unblocks:
  - GSR-DOC-602
  - GSR-DOC-603
---

# OD-04: Self-Assessment Form — Universal vs. Team-Type-Specific

## Context

Phase 6 (Organization Sponsorship + Team Credentialing) generalizes the Florida SRT-CAP self-assessment methodology — an 11-section structured collection — so any state, county, municipality, or private organization can sponsor team credentialing through the platform. The 11 sections cover deployment tables, AAR/IP, SOPs, staffing, equipment, capabilities, training, and exercises.

The structural question: **does the platform present one universal form to every team, or does it present a different form (or different sections) per RTLT team type?**

The 13 Florida SRT disciplines are the initial set. The FEMA RTLT defines 152 team types — every one of them is in scope long-term. Some sections (deployment tables, AAR/IP, SOPs) are universal across team types. Others (staffing rosters, equipment manifests, capability matrices) are team-type-specific in their structure and field set.

This decision shapes DOC-602 (Self-Assessment — Send + Collect) and DOC-603 (Self-Assessment Form UI). It also shapes how the data model stores responses — uniform table schema vs. polymorphic per team type.

## Options

### Option 1 — Single universal form with conditional sections (Recommended)

Present every team the same 11 sections. Sections 1–3, 7–11 (general organization, doctrine, training, exercises) are identical for all team types. Sections 4–6 (staffing, equipment, capabilities) are RTLT-driven: the form pulls the position list, equipment list, and capability matrix from the RTLT team-type definition (already seeded as 152 records) and renders the appropriate fields dynamically.

- **Pro:** one schema, one form, one assessor experience. Adding a new team type requires no platform code change — just RTLT data.
- **Pro:** consistent reporting and dashboards across team types. Cross-team comparisons are possible because the structure is uniform at the section level.
- **Pro:** easier to maintain and extend.
- **Con:** the dynamic Sections 4–6 require careful UI design to feel coherent rather than cobbled-together. Edge cases (team types with unusual position lists) may need RTLT data overrides.

### Option 2 — Team-type-specific form variants

Maintain a registry of form variants. The Florida SRT-13 get one variant. National USAR teams get another. Hazmat teams get another. Each variant has its own section ordering, field set, and validation rules.

- **Pro:** each team type gets a tailored experience. Specialty terminology and section order match what assessors in that discipline already use.
- **Con:** combinatorial maintenance burden. 152 RTLT team types × evolving doctrine = a permanent backlog. Adding a new discipline becomes a platform engineering task.
- **Con:** cross-team comparison and aggregate reporting become much harder.
- **Con:** assessor training cost rises — every variant is a different form.

### Option 3 — Hybrid: universal core with per-team-type plugin sections

The 8 universal sections are fixed. Each team type can declare 1–3 additional optional sections defined in its RTLT record. Common case is no plugin; specialty teams add what they need.

- **Pro:** captures the 80% benefit of universality with the 20% safety valve of customization.
- **Con:** more design and engineering effort up front than Option 1. The plugin definition surface is itself a small platform inside the platform.

## Recommendation

**Option 1.** It scales to all 152 RTLT team types without a per-type code change, it produces uniform data for downstream reporting, and the dynamic Sections 4–6 leverage data we already have in the RTLT seed set. The risk that some team types feel "shoehorned" is real but addressable through good UI design and iteration; it is far smaller than the maintenance debt of Option 2.

The Florida SRT-13 launch can validate the approach — if Option 1 produces clean assessments across the diversity of those 13 disciplines (search and rescue, hazmat, swift water, structural collapse, communications, etc.), it will hold for the broader RTLT.

## Downstream Impact

Resolving in favor of Option 1 unblocks:

- **GSR-DOC-602** — Team Self-Assessment, Send + Collect: schema is a single `tc_self_assessments` row with 11 `tc_sa_sections` rows, dynamic content driven by RTLT lookup
- **GSR-DOC-603** — Team Self-Assessment Form UI: single form component with section-level conditional rendering; RTLT-driven fields pull from `rtlt_team_types` seed data
- **GSR-DOC-605** and **GSR-DOC-606** — Assessor Reports inherit the same assumption (see OD-05)
- Any future Phase 6 doc that touches the self-assessment data model

If Option 2 or 3 is chosen instead, all of the above need re-scoping before authoring.

## Decision

> **To be filled in by Roy E. Dunn.** Recommended option above; record the chosen option, date, and any modifying notes here. Update the `status` and `decided_on` fields in frontmatter when this is set.
