export type ActorType = 'user' | 'system' | 'admin';

export interface AuditLogEntry {
  id: string;
  actor_id: string | null;
  actor_type: ActorType;
  action: string;
  entity_type: string | null;
  entity_id: string | null;
  details_json: Record<string, unknown> | null;
  ip_address: string | null;
  created_at: Date;
}
