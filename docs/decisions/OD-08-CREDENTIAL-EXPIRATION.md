---
od_id: OD-08
title: "Credential Expiration Period"
status: open
decided_by: Roy E. Dunn
decided_on:
unblocks:
  - GSR-DOC-503
---

# OD-08: Credential Expiration Period

## Context

Issued credentials have a useful life. The question is **how long that life is and whether it is the same across all disciplines.** This shapes DOC-503 (Credential Renewal + Expiration) and the renewal workflow, including notification cadence, lapsed-credential handling, and the renewal QRB pathway.

The choice has doctrinal weight. Setting expiration too short creates renewal churn that erodes member confidence. Setting it too long erodes the credibility of the credential itself — a "credential" valid for a decade carries less weight than one renewed against current standards.

## Reference Models

- **NREMT (National Registry of EMTs):** 2 years. Recertification requires continuing education hours.
- **NIMS / ICS qualifications via NQS:** 5 years for most position qualifications, with periodic refresher training.
- **FEMA RTLT typing definitions:** team typing is reassessed at engagement, not on a fixed clock — typing remains valid until next assessment, typically 3 years.
- **ABEM (American Board of Emergency Medicine):** 10 years.
- **Florida SRT-CAP:** 3-year credentialing cycle in current Longview practice.

The platform sits between individual qualifications (NQS-style, ~5 years) and team typing (RTLT-style, ~3 years). Different stakeholders carry different expectations.

## Options

### Option 1 — Uniform 2-year expiration across all credentials

Every credential expires 2 years from issuance. Renewal requires updated deployment records, fresh validations on at least one deployment within the renewal cycle, and (for higher-tier credentials) at least one fresh evaluation.

- **Pro:** simple. Members understand it. Operations track one calendar.
- **Pro:** keeps credentials current — anyone holding an active Grey Sky credential has shown ongoing service in the last 24 months.
- **Con:** renewal volume is high. At scale, this is meaningful operational load on the QRB.
- **Con:** some disciplines have legitimately longer competency cycles. A senior EOC practitioner whose deployments are sparse but consequential may not produce enough evidence on a 2-year clock without artificial padding.

### Option 2 — Uniform 3-year expiration (Recommended)

Every credential expires 3 years from issuance. Mirrors the Florida SRT-CAP cycle Longview already operates. Renewal requirements scale with credential tier.

- **Pro:** matches existing Longview field practice. Members already familiar with SRT-CAP recognize the cycle.
- **Pro:** reasonable balance between currency and renewal load.
- **Pro:** enough time to accumulate substantive deployment history at any tier.
- **Con:** a 3-year-old credential is pre-Helene, pre-most-recent-doctrine-update. Some stakeholders will find that loose.

### Option 3 — Discipline-specific cycles

Each discipline sets its own cycle based on operational tempo and doctrine refresh:
- High-tempo disciplines (USAR, hazmat, swift water): 2 years
- Steady-state disciplines (EOC, planning, finance): 3 years
- Specialized / low-volume disciplines (legal, medical advisor): 5 years

- **Pro:** matches discipline reality. A swift water rescue technician whose deployments are seasonal needs to demonstrate currency more often than an EOC planner whose role is steady-state.
- **Pro:** signals doctrinal seriousness — the platform has thought about each discipline's tempo.
- **Con:** complexity. Members holding multiple credentials track multiple expiration calendars. Operations track 3+ renewal pipelines.
- **Con:** justifying the assignment of each discipline to a tier is a doctrinal exercise that itself takes time.

### Option 4 — 5-year cycle with annual continuing-service attestation

Credentials valid for 5 years, but holders submit an annual lightweight attestation (one new deployment record, one validation, brief refresher training acknowledgment). Failure to submit annual attestation moves the credential to "inactive" until reactivated.

- **Pro:** long primary cycle reduces full-renewal load.
- **Pro:** annual touchpoint keeps the relationship live and the data current.
- **Con:** two-tier system is more complex to communicate.
- **Con:** annual attestation can become a rubber-stamp ritual unless designed carefully.

## Recommendation

**Option 2 (uniform 3-year cycle).** It matches existing Longview SRT-CAP practice, which means it carries operational credibility from day one. It balances currency and load. It is simple enough to communicate without an explainer.

Option 3 is the right end-state and worth revisiting in 24 months once volume and discipline mix are visible. But starting with Option 3 means publishing a tiered model that may need adjustment — better to start uniform and refine with data.

Lapsed-credential treatment (regardless of cycle): a credential that expires has a 90-day grace period during which the holder can renew with standard evidence. After 90 days, renewal requires a full QRB review. After 365 days, the credential is treated as expired and reissuance requires the full original certification pathway, not renewal.

## Notification Cadence (regardless of cycle)

- 90 days before expiration: first email to credential holder
- 60 days before: reminder
- 30 days before: reminder
- Day of expiration: notice that grace period has begun
- 30 days into grace period: reminder
- End of grace period: notice that full QRB renewal is now required

Sponsoring organizations get parallel notifications for any sponsored member's approaching expirations.

## Downstream Impact

Resolving this decision unblocks:

- **GSR-DOC-503** — Credential Renewal + Expiration: data model includes `credential_expires_at`, renewal workflow logic, notification triggers
- **GSR-DOC-405** — Notification Service templates for the 5 notification points above
- **GSR-DOC-501** — Certification Review + Issuance: issuance sets `credential_expires_at = now() + interval`

## Decision

> **To be filled in by Roy E. Dunn.** Recommended option above; record the chosen option, date, and any modifying notes here. Update the `status` and `decided_on` fields in frontmatter when this is set.
