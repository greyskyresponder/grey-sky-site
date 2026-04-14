// GSR-DOC-900: Audit log hash chain verification.
// The `compute_audit_hash` trigger writes entry_hash on every INSERT; this
// helper recomputes the chain client-side and reports tamper evidence.

import { createHash } from 'node:crypto';

type AuditEntry = {
  id: string;
  actor_id: string | null;
  action: string;
  entity_type: string | null;
  entity_id: string | null;
  created_at: string;
  previous_hash: string | null;
  entry_hash: string | null;
};

export type VerifyResult =
  | { ok: true; entriesChecked: number }
  | { ok: false; entriesChecked: number; brokenAt: string; reason: string };

export function verifyAuditChain(entries: AuditEntry[]): VerifyResult {
  const ordered = [...entries].sort(
    (a, b) =>
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
  );

  let expectedPrev = 'GENESIS';
  let checked = 0;

  for (const entry of ordered) {
    const expectedHash = createHash('sha256')
      .update(
        [
          expectedPrev,
          entry.actor_id ?? 'system',
          entry.action,
          entry.entity_type ?? '',
          entry.entity_id ?? '',
          entry.created_at,
        ].join('|'),
        'utf8',
      )
      .digest('hex');

    if (entry.previous_hash !== expectedPrev) {
      return {
        ok: false,
        entriesChecked: checked,
        brokenAt: entry.id,
        reason: 'previous_hash mismatch',
      };
    }
    if (entry.entry_hash !== expectedHash) {
      return {
        ok: false,
        entriesChecked: checked,
        brokenAt: entry.id,
        reason: 'entry_hash mismatch',
      };
    }

    expectedPrev = expectedHash;
    checked += 1;
  }

  return { ok: true, entriesChecked: checked };
}
