// GSR-DOC-900: Lightweight anomaly detection.
// Alert-only. ATLAS (DOC-300) will add automated response.

import { createClient } from '@/lib/supabase/server';

export type AnomalyType =
  | 'rapid_login_failures'
  | 'unusual_location'
  | 'rapid_coin_spend'
  | 'bulk_document_download'
  | 'validation_flood'
  | 'admin_action_outside_hours'
  | 'credential_enumeration';

type EventTracker = {
  timestamps: number[];
};

const eventLog = new Map<string, EventTracker>();

function record(key: string, windowMs: number): number {
  const now = Date.now();
  const tracker = eventLog.get(key) ?? { timestamps: [] };
  tracker.timestamps = tracker.timestamps.filter((t) => now - t <= windowMs);
  tracker.timestamps.push(now);
  eventLog.set(key, tracker);
  return tracker.timestamps.length;
}

export async function logAnomaly(
  type: AnomalyType,
  context: Record<string, unknown>,
  actorId?: string,
): Promise<void> {
  try {
    const supabase = await createClient();
    await supabase.from('audit_log').insert({
      actor_id: actorId ?? null,
      actor_type: actorId ? 'user' : 'system',
      action: 'security_anomaly',
      entity_type: 'security',
      entity_id: null,
      details_json: { anomaly_type: type, ...context },
    });
  } catch {
    // Fail-open: anomaly logging must never block a request.
  }
}

export async function checkLoginAnomaly(
  email: string,
  ip: string,
): Promise<AnomalyType | null> {
  const count = record(`login_fail:${email}:${ip}`, 5 * 60 * 1000);
  if (count > 3) return 'rapid_login_failures';
  return null;
}

export async function checkCoinAnomaly(
  userId: string,
): Promise<AnomalyType | null> {
  const count = record(`coin_spend:${userId}`, 60 * 1000);
  if (count > 10) return 'rapid_coin_spend';
  return null;
}

export async function checkDocumentAccessAnomaly(
  userId: string,
): Promise<AnomalyType | null> {
  const count = record(`doc_access:${userId}`, 5 * 60 * 1000);
  if (count > 20) return 'bulk_document_download';
  return null;
}

export async function checkValidationAnomaly(
  ip: string,
): Promise<AnomalyType | null> {
  const count = record(`validate:${ip}`, 60 * 60 * 1000);
  if (count > 10) return 'validation_flood';
  return null;
}
