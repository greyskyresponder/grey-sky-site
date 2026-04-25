---
od_id: OD-11
title: "ATLAS Hosting — VPS Provider Selection"
status: open
decided_by: Roy E. Dunn
decided_on:
unblocks:
  - GSR-DOC-300
related:
  - OD-12
---

# OD-11: ATLAS Hosting — VPS Provider Selection

## Context

Phase 3 stands up ATLAS — the multi-agent operational layer that runs on top of the platform. ATLAS is envisioned as a long-running process (or set of processes) that performs autonomous and semi-autonomous work: enriching deployment records against FEMA disaster declarations, processing uploaded documents, dispatching agents, monitoring queues, sending operational notifications via Telegram, and orchestrating the nine-agent team described in GSR-REF-002.

The platform itself runs on Azure Static Web Apps. ATLAS does not. ATLAS needs a different host because:

- ATLAS is a long-running daemon, not a web request handler. SWA is request-based.
- ATLAS uses OpenClaw, which expects a Linux-style filesystem and persistent process state.
- ATLAS may run scheduled jobs, cron-like work, and stateful queues.
- ATLAS may be reached via Telegram bot (inbound messages) and outbound HTTP (FEMA API, document AI services, the Supabase database).

This decision is **which provider hosts the ATLAS VPS.** It is the gating decision for Phase 3 because design choices (deployment scripting, observability, networking, secret management) all flow from the answer.

## Options

### Option 1 — DigitalOcean (Recommended)

A standard cloud VPS provider. DigitalOcean droplets, App Platform (if a more managed surface is preferred later), and Spaces (S3-compatible object storage if needed).

- **Pro:** simplest operational model. SSH into a Linux box, install OpenClaw, run.
- **Pro:** transparent pricing. A 2-vCPU / 4 GB droplet is ~$24/month. Predictable.
- **Pro:** strong community resources, well-documented.
- **Pro:** fast provisioning, generous bandwidth allowances.
- **Con:** Roy and Longview are not currently in the DigitalOcean ecosystem. New account, billing, identity to manage.
- **Con:** less integrated with Azure (where the platform lives) than Azure-native alternatives. Cross-cloud egress costs and latency are minor but real.

### Option 2 — Linode (now Akamai Cloud)

Same general shape as DigitalOcean. Akamai-owned, recently rebranded.

- **Pro:** comparable pricing to DigitalOcean, sometimes slightly better at higher tiers.
- **Pro:** Akamai's CDN/edge integration may matter later if ATLAS surfaces public endpoints.
- **Con:** Akamai's product direction post-acquisition is not as predictable as it once was. Some long-time Linode users have raised concerns.
- **Con:** smaller community than DigitalOcean.

### Option 3 — Azure VM in the same subscription as greysky.dev

Run ATLAS on an Azure Virtual Machine in the same subscription that hosts the SWA deployment. Standard Linux VM, ~$30–$50/month for comparable specs.

- **Pro:** single cloud account, single billing surface, consolidated identity (Entra ID).
- **Pro:** intra-Azure traffic to the Supabase-hosted database is faster (assuming Supabase is in the same Azure region — confirm).
- **Pro:** Azure-native tooling: Key Vault for secrets, Monitor for observability.
- **Con:** Azure VMs are more expensive than DO/Linode at equivalent specs.
- **Con:** Azure operational surface is more complex than DO. Setting up an Azure VM with proper networking, NSG rules, and deployment automation is a real project.
- **Con:** runs counter to the explicit choice in CLAUDE.md to keep the platform on SWA only and avoid Azure-specific lock-in beyond what's necessary.

### Option 4 — Mac Mini in Roy's office (referenced in Phase 3 docs)

The QUEUE references "Mac Mini deployment" for ATLAS. This is on-prem hosting at a physical Mac Mini Roy controls.

- **Pro:** zero recurring cost beyond the Mac itself.
- **Pro:** maximum operational control. Roy physically possesses the machine.
- **Pro:** Apple Silicon is fast and energy-efficient.
- **Con:** residential or office internet is not a server-grade environment. Power outages, ISP outages, dynamic IPs, NAT, all become operational concerns.
- **Con:** physical security of a single point of failure. If something happens to that machine (theft, hardware failure, building issue), ATLAS is down until restored.
- **Con:** scaling beyond one Mac requires either replacing it or moving to cloud anyway. The migration tax is real.
- **Con:** Telegram bot inbound traffic, FEMA API outbound traffic, and database connections all routed through residential/office internet — practical and reliability concerns for a "trusted responder ecosystem" backbone.

### Option 5 — Hybrid: Mac Mini for development; cloud VPS for production

Use the Mac Mini for ATLAS development, testing, and operator-controlled experimentation. Deploy production ATLAS to a cloud VPS (DigitalOcean per Option 1). The Mac Mini stays in the loop as a redundant standby or as a controlled-environment testbed.

- **Pro:** captures the "Roy's Mac Mini" ergonomics for development without making it a production dependency.
- **Pro:** standard production reliability profile.
- **Con:** more infrastructure to maintain.

## Recommendation

**Option 1 (DigitalOcean) for production, with Option 5 in mind as the operating model.** DigitalOcean is the cleanest production choice given the platform's constraints. The Mac Mini referenced in Phase 3 docs is plausibly a development environment; treating it as such, while running production on DO, gives the right reliability profile.

Reasons against Option 3 (Azure VM): the operational complexity tax is high for a single VM use case, and CLAUDE.md's intent to avoid Azure-specific lock-in beyond SWA hosting argues for keeping ATLAS portable.

Reasons against Option 4 (Mac Mini in production): residential/office hosting is below the reliability bar for a credentialing platform's operational backbone. ATLAS will be enriching legal-attestation records, dispatching emails, and orchestrating decisions that affect responder credentials. A single-point-of-failure Mac with dynamic IP is the wrong infrastructure choice for that.

Reasons preferring DigitalOcean over Linode: predictability of product direction. Both are technically equivalent; DO has the edge on stability of strategic direction post-Akamai-acquisition uncertainty for Linode.

Concrete sizing recommendation:

- Production VPS: 2 vCPU, 4 GB RAM, 80 GB SSD, 4 TB bandwidth — $24/month
- Region: NYC3 or SFO3 (proximity to Azure US East/West, where SWA likely deploys)
- Operating system: Ubuntu 24.04 LTS
- Backups: enabled ($4.80/month add-on)
- Monitoring: enabled (free)
- Reserved IP: yes (for stable Telegram webhook URL)

Estimated production hosting: ~$30/month. Trivial against the operational value.

## Downstream Impact

Resolving in favor of Option 1 (DigitalOcean) unblocks:

- **GSR-DOC-300** — ATLAS Architecture + Deployment: deployment scripts target DigitalOcean droplet provisioning (Terraform or doctl scripts); networking notes specify reserved IP and firewall rules
- **GSR-DOC-301** — Agent Configuration: OpenClaw configs deploy to the DO droplet; secret management uses 1Password CLI or Doppler against the droplet
- **GSR-DOC-302** — FEMA Enrichment: cron schedule lives on the droplet
- **GSR-DOC-303** — Document AI: same

## Operational Prerequisites

- Set up DigitalOcean account under Longview Solutions Group billing
- Generate API token for infrastructure scripts
- Decide on domain pattern (atlas.greysky.dev pointing to droplet IP? operator.greysky.dev?)
- SSH key management policy (per-operator keys, or a single bastion key with SSO?)

## Decision

> **To be filled in by Roy E. Dunn.** Recommended option above; record the chosen option, date, and any modifying notes here. Update the `status` and `decided_on` fields in frontmatter when this is set.
