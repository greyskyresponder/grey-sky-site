---
od_id: OD-12
title: "OpenClaw Configuration Structure for ATLAS Deployment"
status: open
decided_by: Roy E. Dunn
decided_on:
unblocks:
  - GSR-DOC-301
related:
  - OD-11
---

# OD-12: OpenClaw Configuration Structure

## Context

Phase 3's ATLAS deployment runs on the OpenClaw framework. OpenClaw is the orchestration substrate that hosts the nine-agent team described in `GSR-REF-002-AGENT-ARCHITECTURE.md` (Ridgeline, Baseplate, Forge, Meridian, Threshold, Lookout, Bridgepoint, Proof, Garrison).

Roy has prior experience configuring OpenClaw for other workloads. Several configuration patterns are established in his existing setups but have not yet been transcribed into the Grey Sky build documentation. The decision here is **how to structure the OpenClaw configuration for this deployment** — specifically, which patterns to carry over, which to adapt, and which to formalize.

This decision is partially blocked on Roy sharing his existing patterns. The QUEUE has flagged this as "Roy to share existing patterns." This memo's job is to specify the shape of the artifact Roy needs to produce so the design work can proceed.

## What This Decision Actually Is

Three sub-decisions wrapped together:

1. **Configuration topology.** Single config file vs. modular per-agent configs vs. layered (base + per-environment overlays).
2. **Secret management.** Where do API keys, database credentials, and signing secrets live — environment variables, 1Password CLI, Doppler, HashiCorp Vault, or OpenClaw's native mechanism?
3. **Deployment lifecycle.** How do config changes get from a development machine to the production VPS — git push, rsync, OpenClaw's update channel, or something else?

## Options for Each Sub-Decision

### Sub-decision 1 — Configuration Topology

**A. Single monolithic config file** (`atlas.openclaw.yaml`). All nine agents, their inter-agent wiring, and runtime parameters in one file.
- Pro: simple to reason about; one file to read.
- Con: scales poorly. Diffs are noisy when only one agent changes.

**B. Modular per-agent configs** (`agents/ridgeline.yaml`, `agents/baseplate.yaml`, etc.) plus a top-level orchestration file that imports them.
- Pro: per-agent diffs are clean; agent owners can iterate without stepping on each other.
- Con: more files to navigate.

**C. Layered: base config + environment overlays** (`base/`, `overlays/dev/`, `overlays/prod/`).
- Pro: production and development cleanly diverge where needed (e.g., dev runs against a staging Supabase project, prod against production).
- Con: overlay merging logic adds a layer of cognitive load.

**Recommendation:** B + C combined. Per-agent base configs, with environment overlays for the small set of parameters that differ between dev and prod. The OpenClaw documentation should already describe how it expects its configs structured; defer to its conventions where they exist.

### Sub-decision 2 — Secret Management

**A. Plain environment variables** loaded from a `.env` file on the VPS.
- Pro: simplest. Works with every framework.
- Con: secrets-in-files is the lowest tier of secret management. A backup, snapshot, or operator with shell access leaks everything.

**B. Doppler (or similar dedicated secrets manager)** with the Doppler CLI on the VPS pulling secrets at process start.
- Pro: secrets never live in files. Rotation is trivial. Audit log per access.
- Pro: works well for a single-VPS deployment.
- Con: vendor dependency. ~$7/seat/month.

**C. 1Password CLI** with `op run --` wrapping the OpenClaw start command.
- Pro: Roy may already use 1Password for personal/Longview secrets; consolidates surface.
- Pro: similar properties to Doppler.
- Con: requires interactive auth on first run; service-account flow is workable but adds complexity.

**D. HashiCorp Vault**.
- Pro: most powerful; full audit, policy, dynamic secrets.
- Con: significant operational overhead. Overkill for one VPS.

**Recommendation:** B (Doppler) or C (1Password) — pick whichever Longview already uses. If neither, B. Avoid A as the long-term answer; it is acceptable only as a v0 placeholder.

### Sub-decision 3 — Deployment Lifecycle

**A. Git pull on the VPS, restart agents.** Operator SSHs in, `git pull`, `openclaw restart`. Manual.
- Pro: simple. Auditable via git log.
- Con: manual. No rollback path beyond `git checkout` previous SHA.

**B. GitHub Actions deploy job triggered on push to main.** Same SSH+pull mechanic but automated.
- Pro: hands-off after merge. Audit trail in GitHub.
- Con: requires an SSH key in GitHub Secrets; needs care.

**C. OpenClaw's native update channel** (if it provides one).
- Pro: framework-native is preferable to grafted-on automation.
- Con: depends on OpenClaw capability — Roy to confirm.

**Recommendation:** A for v0, B for v1 once the deployment is stable and the team grows. C if OpenClaw provides a clean path.

## What Roy Needs to Provide

To resolve this fully, Roy should share:

1. **One existing OpenClaw configuration repository** he considers exemplary. Doesn't need to be Grey Sky-related; any clean OpenClaw deployment will do.
2. **The secret management approach already used at Longview.** Doppler? 1Password Business? Just `.env`? Knowing this anchors sub-decision 2.
3. **Any deployment scripts or operator runbooks** that Longview already operates by — even if informal. These shape sub-decision 3.

With those three artifacts, OD-12 can resolve cleanly. Without them, the design proceeds against assumptions that may or may not match Roy's existing operational conventions.

## Pragmatic Default (if Roy cannot provide artifacts in time)

If Phase 3 needs to start before Roy can share his OpenClaw patterns:

- **Topology:** Modular per-agent (Sub-decision 1, Option B). Add overlays only if needed.
- **Secrets:** Doppler. Free tier for the small number of secrets involved.
- **Deployment:** Manual git pull (Sub-decision 3, Option A). Upgrade to GitHub Actions in a follow-on iteration.

This default is reversible. Migrating to Roy's preferred pattern later is a one-time refactor, not a permanent commitment.

## Downstream Impact

Resolving this decision unblocks:

- **GSR-DOC-301** — Agent Configuration: actual OpenClaw configs for the nine agents, secret references, deployment instructions
- **GSR-DOC-300** — ATLAS Architecture: deployment scripts and operator runbook
- All subsequent Phase 3 docs (DOC-302, 303) inherit the chosen patterns

## Decision

> **To be filled in by Roy E. Dunn.** Three sub-decisions to record:
>
> 1. **Topology:** \_\_\_\_\_\_
> 2. **Secrets:** \_\_\_\_\_\_
> 3. **Deployment lifecycle:** \_\_\_\_\_\_
>
> Or: "share existing pattern repo at <link>" and let the design work derive these from inspection.
>
> Update the `status` and `decided_on` fields in frontmatter when this is set.
