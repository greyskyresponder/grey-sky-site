---
od_id: OD-07
title: "Qualification Review Board — Composition, Selection, and Quorum"
status: open
decided_by: Roy E. Dunn
decided_on:
unblocks:
  - GSR-DOC-404
---

# OD-07: Qualification Review Board (QRB) Composition

## Context

The QRB is the human review layer for credentialing decisions. Validations and evaluations build the evidence; the QRB decides whether the evidence supports issuing a credential. This is the credibility gate that distinguishes Grey Sky from a self-attestation system.

The decision is **who serves on the QRB, how they are selected, and what quorum and decision rules govern their work.** This is a doctrine-defining choice. It sets the legitimacy bar for every credential the platform ever issues.

This decision shapes DOC-404 (QRB workflow) and indirectly every downstream credential. It is also the most consequential decision on the open list — wrong composition undermines the credentialing pathway permanently.

## Options

### Option 1 — Discipline-specific QRB panels (Recommended)

The QRB is not a single body. It is a roster of qualified reviewers, organized by discipline (the 17 RTLT discipline categories). For each credentialing decision, the platform assembles a panel of 3 reviewers from the relevant discipline pool (or 5 for higher-tier credentials). Reviewers are nominated by Longview, vetted against an experience threshold (e.g. ICS Type 1 or 2 in the discipline, plus deployment record), and rotate to avoid burnout.

- **Composition rule:** 3 reviewers per panel for standard credentials (NIMS Type 4–5 equivalents); 5 for higher-tier (Type 1–3 equivalents).
- **Selection:** discipline pool maintained by Longview; new reviewers nominated by existing panelists or Longview leadership; vetted against experience threshold; appointed for 2-year terms with renewal possible.
- **Quorum:** majority of the panel must vote (2 of 3, 3 of 5). Tie-breaker for even-sized panels handled by Longview leadership.
- **Decision:** majority vote (2 of 3, 3 of 5) approves the credential. Dissenting reviewers may attach written rationale; the rationale becomes part of the candidate's permanent record (visible to the candidate, not public).

- **Pro:** discipline expertise drives the decision. A USAR credential is reviewed by USAR practitioners; a hazmat credential by hazmat practitioners. This matches how every defensible credentialing body operates (NREMT, ABEM, etc.).
- **Pro:** scales as the discipline mix grows. New discipline = new panel pool, no platform-level redesign.
- **Pro:** rotational burden is sustainable.
- **Con:** requires building and maintaining the reviewer roster as a real operational program. Vetting, onboarding, term tracking — that's ongoing work.
- **Con:** small disciplines may have shallow pools, raising conflict-of-interest concerns (everyone knows everyone).

### Option 2 — Single multidisciplinary QRB

A single 7- to 9-member QRB reviews all credentialing decisions across all disciplines. Members represent breadth (one each from USAR, hazmat, EOC, ICS general, etc.). Quorum is 5; decision is majority.

- **Pro:** simpler operationally — one body, one schedule, one set of bylaws.
- **Con:** the single body cannot have deep expertise in all 17 disciplines. Decisions outside a member's discipline depend on their general judgment, not specialty knowledge.
- **Con:** scales poorly as volume grows. A single 9-person body cannot review 50 credentialing decisions per week.
- **Con:** does not match how peer credentialing bodies are structured anywhere.

### Option 3 — Founding QRB chaired by Longview leadership, transitioning to Option 1

Initially (first 12–18 months), the QRB is small — 3–5 senior practitioners selected by Longview, chaired by Roy or his designate. As volume grows and reviewer pools deepen, transition to Option 1's discipline-specific structure.

- **Pro:** workable from day one with no recruiting drag.
- **Pro:** maintains tight quality control during the formative period when the credentialing standards themselves are stabilizing.
- **Con:** founding body looks insular to outside observers ("Longview-controlled credential"). Mitigated by transparent transition plan to Option 1 and by visible composition criteria.
- **Con:** transition timing is a future decision, not a closed one.

## Recommendation

**Option 3, with explicit Option 1 as the target end-state.** Standing up Option 1 from day one would block the credentialing pathway for 12+ months while reviewer pools are recruited. Option 2 is a permanent compromise that doesn't match credentialing-body practice. Option 3 captures the pragmatism of starting small with the legitimacy of converging on the right model.

Concretely:

- **Months 0–18:** Founding QRB of 5 members. Roy chairs. Members selected for cross-discipline credibility (a senior USAR commander, a hazmat AHJ, a senior EOC practitioner, an ICS general staff veteran, and one academic/doctrine voice). Quorum 3, decision majority.
- **Month 12 review point:** assess credential volume, discipline distribution, reviewer fatigue. Begin recruiting discipline-specific pools.
- **Month 18 target:** transition to Option 1's discipline-specific panels. Founding QRB members may continue as panelists in their disciplines.

The transition should be public — a published QRB charter that names the founding members, names the transition criteria, and is updated as panels stand up.

## Conflict-of-Interest Rules (apply to all options)

- A reviewer cannot serve on a panel reviewing their own credential, their own organization's members, or anyone they have served with on a deployment within the past 24 months.
- Validators and evaluators of a candidate's deployment records cannot serve on the candidate's QRB panel.
- Reviewers must disclose any other relationship with the candidate before the panel convenes.
- Conflict-flagged reviewers are replaced from the discipline pool.

## Downstream Impact

Resolving this decision unblocks:

- **GSR-DOC-404** — QRB workflow: data model for `qrb_reviewers`, `qrb_panels`, `qrb_panel_members`, `qrb_decisions`; UI for panel assignment, voting, decision recording, dissent capture
- **GSR-DOC-501** — Certification Review + Issuance: the issuance step depends on a QRB decision being recorded
- **GSR-DOC-503** — Credential Renewal + Expiration: renewal may also route through the QRB depending on lapse duration

## Operational Prerequisites

- QRB charter document (out of platform scope; lives as a Longview governance artifact)
- Reviewer onboarding agreement (NDA, code of conduct, compensation if any)
- Compensation policy: are reviewers paid per panel? Honorarium? Volunteer? Affects recruitment.

## Decision

> **To be filled in by Roy E. Dunn.** Recommended option above; record the chosen option, date, and any modifying notes here. Update the `status` and `decided_on` fields in frontmatter when this is set.
