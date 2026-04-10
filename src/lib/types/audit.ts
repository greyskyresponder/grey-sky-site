// Group G: Audit

import type { ActorType } from './enums';

/** audit_log — 8 columns */
export interface AuditLogEntry {
  id: string;
  actor_id: string | null;
  actor_type: ActorType;
  action: string;
  entity_type: string;
  entity_id: string | null;
  details_json: Record<string, unknown> | null;
  ip_address: string | null;
  created_at: string;
}
