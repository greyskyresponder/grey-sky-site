---
od_id: OD-06
title: "Organization Billing — Invoicing Mechanism for Direct Fee Only Track"
status: open
decided_by: Roy E. Dunn
decided_on:
unblocks:
  - GSR-DOC-613
---

# OD-06: Organization Billing — Direct Fee Only Track

## Context

Phase 6 sponsorship has two billing tracks:

1. **Sky Coin eligible** — organizations purchase Sky Coins (or pay membership-equivalent fees) and consume them across sponsored members. Already built into DOC-205 Sky Coins economy.
2. **Direct Fee Only** — organizations contract with Longview Solutions Group for credentialing services on a direct-fee basis: per-engagement, per-team, per-assessor-day, or annual retainer. Sky Coins do not apply.

Direct Fee Only is the dominant model for state and federal contracts where coin-based purchasing is unfamiliar or procurement-incompatible. The platform must capture the engagement, generate an invoice, and track payment status. The question is **how invoicing is mechanized.**

This decision shapes DOC-613 (Organization Billing — Dual Track) and informs the Phase 6 admin tooling required to operate it.

## Options

### Option 1 — Stripe Invoicing API (Recommended)

Use Stripe's first-party invoicing product. The platform creates an invoice via API, attaches line items, sends to the customer's billing email, and tracks status via webhook (sent → viewed → paid → past due). Customers can pay via card, ACH, or wire transfer (Stripe-supported methods).

- **Pro:** single payment provider across the platform. Stripe is already wired (DOC-205 Sky Coins, membership). One reconciliation surface.
- **Pro:** PCI compliance, payment method handling, dunning, and reminder emails are managed by Stripe.
- **Pro:** Stripe Invoicing supports custom branding (logo, colors, From email). Footers can include Longview's mailing address and tax IDs.
- **Pro:** webhook-driven status updates land in the same `stripe_events` table already provisioned.
- **Con:** Stripe's invoice template is functional but visually constrained. Some agencies expect a specific letterhead format or PO number layout.
- **Con:** Stripe Invoicing fees are 0.5% per paid invoice (capped) — material at engagement-scale dollar amounts.

### Option 2 — Generated PDF invoice + manual reconciliation

The platform generates a PDF invoice on demand (using the same docx/pdf pipeline pattern), emails it to the agency contact, and the team manually marks paid in the admin UI when the wire arrives or the AP department remits. Stripe is not used for these invoices.

- **Pro:** full control over invoice format. Looks like a Longview-branded invoice, not a Stripe invoice.
- **Pro:** no Stripe fees on these transactions.
- **Pro:** matches the procurement workflow many state and federal agencies already use (PO → invoice → wire).
- **Con:** manual reconciliation. Someone has to mark each invoice paid. Easy to lose track at scale.
- **Con:** no automated dunning or reminders without building them.
- **Con:** payment method is whatever the agency's AP department supports (typically wire or ACH). No card payment option.

### Option 3 — Hybrid: Stripe Invoicing default, PDF override per engagement

Default new engagements to Stripe Invoicing (Option 1). Allow per-engagement override to PDF/manual (Option 2) for agencies that require it. Track both in the same `engagement_invoices` table; the row records which mechanism was used.

- **Pro:** captures the typical case (Option 1) cheaply while accommodating the procurement-driven exceptions (Option 2).
- **Con:** two paths to maintain. Operational complexity slightly higher than either single path.

## Recommendation

**Option 3.** The platform should default to Stripe Invoicing for new engagements — it's the cleanest operational path and consolidates payment infrastructure. But Direct Fee Only is specifically the path for procurement-driven customers, and some of them will require a PO-driven PDF invoice. Allowing per-engagement override avoids losing the deal because of mechanism rigidity.

Pilot pricing pattern: charge the Stripe fee as a separate line item on Stripe-invoiced engagements ("Payment processing fee — 0.5% per Stripe terms"); waive it on PDF/wire engagements. Customers self-select.

## Downstream Impact

Resolving in favor of Option 3 unblocks:

- **GSR-DOC-613** — Organization Billing, Dual Track: data model includes `engagement_invoices` table with `mechanism` enum (`stripe` | `pdf_manual`); admin tooling supports both paths; webhook integration extends `stripe_events` handling
- **Phase 6 admin tooling** — invoice list, status, manual-mark-paid action, invoice regeneration (for PDF path)
- Intersects with **GSR-DOC-405** — invoice-related notifications (sent, paid, overdue) flow through the notification service

## Operational Prerequisites

- Tax handling: confirm Longview's tax-collection obligations across states where engagements occur. Stripe Tax may be enabled on Stripe-invoiced transactions; PDF invoices need manual tax line items. Consult tax advisor before resolving.
- W-9 / vendor onboarding: state and federal agencies typically require Longview to be set up as a vendor in their AP system before they can pay. Out-of-band operational task; not platform scope.
- Invoice numbering: pick a scheme (`LSG-YYYY-NNNN` or similar) and apply consistently across both mechanisms.

## Decision

> **To be filled in by Roy E. Dunn.** Recommended option above; record the chosen option, date, and any modifying notes here. Update the `status` and `decided_on` fields in frontmatter when this is set.
