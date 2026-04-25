---
od_id: OD-09
title: "Public Credential Verification Portal Domain"
status: open
decided_by: Roy E. Dunn
decided_on:
unblocks:
  - GSR-DOC-502
related:
  - OD-13
---

# OD-09: Public Verification Portal Domain

## Context

When Grey Sky issues credentials, third parties (sponsoring agencies, hiring authorities, partner organizations) need a way to verify a credential's authenticity. The reference model is NREMT's verification portal — anyone can enter a registry number and confirm that the holder is currently certified, without the holder's involvement and without exposing PII.

The platform must publish a public verification surface. The question is **what domain it lives on.**

The candidate domains and their current status:

- `greysky.dev` — primary platform domain, currently live, hosting the member portal and public site
- `greyskyresponder.com` — owned, expires October 2026 (OD-13). Currently does not resolve to a Grey Sky surface.
- `greyskyresponder.net` — referenced in QUEUE as a candidate but ownership status not confirmed

## Options

### Option 1 — verify.greysky.dev subdomain (Recommended)

Use a subdomain of the production platform. The verification portal is a separate surface (no auth, minimal data exposure) but lives within the same registered domain.

- **Pro:** no additional domain registration or DNS to manage. Live in days.
- **Pro:** clear visual continuity — verifiers understand they are on a Grey Sky property.
- **Pro:** shares wildcard certificate, security headers, and infrastructure with the main platform.
- **Pro:** SEO and trust signals accumulate to a single registered domain.
- **Con:** less brandable than a dedicated `.org` or `.com`. Some agencies may instinctively trust a `.org` more for credentialing.
- **Con:** ties verification availability to the same infrastructure as the rest of the platform — if greysky.dev is down, verification is down.

### Option 2 — greyskyresponder.com (revive the dormant domain)

Activate the existing `.com` domain. Point it to a verification-only deployment. Renew at October 2026 expiration (OD-13).

- **Pro:** uses an asset already paid for.
- **Pro:** `.com` carries broader recognition than `.dev`.
- **Pro:** physical separation between verification and member-portal infrastructure can be a credibility signal ("the verification system is independent of the membership system").
- **Con:** OD-13 (renewal) is unresolved. Tying long-lived credential verification URLs to a domain that may not be renewed is a serious risk. Once issued credentials reference the URL, lapsing the domain breaks every credential's verification path.
- **Con:** infrastructure to set up and maintain (DNS, certs, deployment).

### Option 3 — greyskyresponder.net

Use the `.net` variant. Same operational shape as Option 2, different TLD.

- **Pro:** `.net` was conceived for network-infrastructure use; carries some appropriate connotation for a verification system.
- **Con:** ownership status is not confirmed in the QUEUE. Acquisition may or may not be straightforward.
- **Con:** same long-lived URL risk as Option 2 if not committed to renewal.
- **Con:** least-recognized of the three TLDs.

### Option 4 — Defer verification portal until a dedicated `.org` is acquired

Do not ship a verification portal in Phase 5. Acquire `greyskyresponder.org` (or similar) as a future platform asset; build verification on it when ready.

- **Pro:** `.org` is the conventional TLD for credentialing bodies (NREMT.org, ABEM.org, AABB.org).
- **Con:** delays Phase 5 completion. Without a verification path, the credentialing pathway is incomplete — issued credentials cannot be externally verified.
- **Con:** acquisition may be blocked by squatters; may be costly.

## Recommendation

**Option 1 (verify.greysky.dev) for v1, with Option 4 (acquire .org) as the long-term plan.**

Verification URLs are long-lived — they get printed on credentials, embedded in agency vendor portals, referenced in resumes. Picking a domain that may not be renewed (Option 2 or 3 without OD-13 resolution) is a permanent commitment to renewing it. Picking `verify.greysky.dev` is reversible: if a future `.org` is acquired, credentials can be reissued or the subdomain can `301` permanent-redirect to the new domain.

Concretely:

- v1 verification portal: `https://verify.greysky.dev/[credentialId]`
- Acquisition of `greyskyresponder.org` (or evaluate alternatives) is a separate parallel track. Budget for it in the next Longview operational planning cycle.
- When `.org` is acquired and ready, plan a coordinated migration: 301 permanent redirect from verify.greysky.dev/* to org.greyskyresponder.org/*. Existing printed credentials continue to work via the redirect.

This sequence preserves Phase 5 momentum while leaving the door open for the more conventional credentialing-body domain in the future.

## Coupling to OD-13

OD-13 (greyskyresponder.com renewal in October 2026) becomes a smaller decision under this recommendation. The `.com` becomes a domain the platform does not depend on operationally. Renewal can be evaluated on its merits (asset value, defensive registration, future use) rather than as an emergency to keep verification working.

## Downstream Impact

Resolving in favor of Option 1 unblocks:

- **GSR-DOC-502** — Credential Verification Portal: deployment target is verify.greysky.dev; URL pattern is greysky.dev/[credentialId]
- **GSR-DOC-501** — Certification Review + Issuance: issued credential records include `verification_url` field populated with the verify.greysky.dev path
- **GSR-DOC-503** — Credential Renewal + Expiration: renewal does not change the verification URL; same credential ID persists across renewals

## Decision

> **To be filled in by Roy E. Dunn.** Recommended option above; record the chosen option, date, and any modifying notes here. Update the `status` and `decided_on` fields in frontmatter when this is set.
