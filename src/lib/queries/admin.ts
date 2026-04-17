// Admin queries — all reads for the /admin panel.
// Only callable from server components / server actions. Uses the admin
// (service-role) client since these reads intentionally bypass RLS.
//
// TODO: test — getAdminOverview returns zeros when tables empty
// TODO: test — listUsers filters by role, status, search; pages correctly
// TODO: test — getUserDetail returns null for unknown id; includes audit
// TODO: test — listMemberships groups counts correctly
// TODO: test — listValidations filters by status; paginates
// TODO: test — listAuditLog filters by actor, action, entity_type, date range
import { createAdminClient } from '@/lib/supabase/admin';
import type { AuditLogEntry } from '@/lib/types/audit';

type Role = 'member' | 'org_admin' | 'assessor' | 'platform_admin';
type MembershipStatus = 'active' | 'expired' | 'none';

const MS_DAY = 24 * 60 * 60 * 1000;

function isoDaysAgo(days: number): string {
  return new Date(Date.now() - days * MS_DAY).toISOString();
}

// ── Dashboard overview ────────────────────────────────────

export interface AdminOverview {
  activeMembers: number;
  totalMembers: number;
  newSignups7d: number;
  newSignups30d: number;
  mrrCents: number;
  activeSubscriptions: number;
  pendingValidations: number;
  pendingEvaluations: number;
  recentAudit: AuditLogEntry[];
}

async function safeCount(
  promise: PromiseLike<{ count: number | null; error: unknown }>,
): Promise<number> {
  try {
    const { count, error } = await promise;
    if (error) return 0;
    return count ?? 0;
  } catch {
    return 0;
  }
}

export async function getAdminOverview(): Promise<AdminOverview> {
  const supabase = createAdminClient();
  const since7 = isoDaysAgo(7);
  const since30 = isoDaysAgo(30);

  const [
    activeMembers,
    totalMembers,
    newSignups7d,
    newSignups30d,
    pendingValidations,
    pendingEvaluations,
    activeSubscriptions,
    recentAuditRes,
  ] = await Promise.all([
    safeCount(
      supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('membership_status', 'active'),
    ),
    safeCount(supabase.from('users').select('*', { count: 'exact', head: true })),
    safeCount(
      supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', since7),
    ),
    safeCount(
      supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', since30),
    ),
    safeCount(
      supabase
        .from('validation_requests')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending'),
    ),
    safeCount(
      supabase
        .from('evaluation_requests')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending'),
    ),
    safeCount(
      supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('stripe_subscription_status', 'active'),
    ),
    supabase
      .from('audit_log')
      .select('id, actor_id, actor_type, action, entity_type, entity_id, details_json, ip_address, created_at')
      .order('created_at', { ascending: false })
      .limit(10),
  ]);

  const recentAudit: AuditLogEntry[] =
    (recentAuditRes.data as AuditLogEntry[] | null) ?? [];

  // MRR approximation: active members * $49 (platform membership price).
  // Stripe is authoritative; this is a local estimate for the dashboard card.
  const MEMBERSHIP_CENTS = 4900;
  const mrrCents = activeSubscriptions * MEMBERSHIP_CENTS;

  return {
    activeMembers,
    totalMembers,
    newSignups7d,
    newSignups30d,
    mrrCents,
    activeSubscriptions,
    pendingValidations,
    pendingEvaluations,
    recentAudit,
  };
}

// ── Users ─────────────────────────────────────────────────

export interface AdminUserRow {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  role: Role;
  membership_status: MembershipStatus;
  status: 'active' | 'suspended' | 'deactivated';
  created_at: string;
}

export interface ListUsersFilters {
  search?: string;
  role?: Role | 'all';
  membershipStatus?: MembershipStatus | 'all';
  page: number;
  perPage: number;
}

export async function listUsers(
  filters: ListUsersFilters,
): Promise<{ rows: AdminUserRow[]; total: number }> {
  const supabase = createAdminClient();
  const from = (filters.page - 1) * filters.perPage;
  const to = from + filters.perPage - 1;

  let query = supabase
    .from('users')
    .select(
      'id, email, first_name, last_name, role, membership_status, status, created_at',
      { count: 'exact' },
    )
    .order('created_at', { ascending: false })
    .range(from, to);

  if (filters.role && filters.role !== 'all') {
    query = query.eq('role', filters.role);
  }
  if (filters.membershipStatus && filters.membershipStatus !== 'all') {
    query = query.eq('membership_status', filters.membershipStatus);
  }
  if (filters.search && filters.search.trim().length > 0) {
    const needle = filters.search.trim().replace(/[%,]/g, '');
    query = query.or(
      `email.ilike.%${needle}%,first_name.ilike.%${needle}%,last_name.ilike.%${needle}%`,
    );
  }

  const { data, count, error } = await query;
  if (error) {
    console.error('[admin.listUsers]', error);
    return { rows: [], total: 0 };
  }
  return { rows: (data ?? []) as AdminUserRow[], total: count ?? 0 };
}

export interface AdminUserDetail {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  location_city: string | null;
  location_state: string | null;
  bio: string | null;
  role: Role;
  membership_status: MembershipStatus;
  membership_expires_at: string | null;
  membership_started_at: string | null;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  stripe_subscription_status: string | null;
  status: 'active' | 'suspended' | 'deactivated';
  created_at: string;
  mfa_enabled: boolean;
}

export async function getUserDetail(
  userId: string,
): Promise<AdminUserDetail | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('users')
    .select(
      'id, email, first_name, last_name, phone, location_city, location_state, bio, role, membership_status, membership_expires_at, membership_started_at, stripe_customer_id, stripe_subscription_id, stripe_subscription_status, status, created_at, mfa_enabled',
    )
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    console.error('[admin.getUserDetail]', error);
    return null;
  }
  return (data as AdminUserDetail | null) ?? null;
}

export async function getUserAuditHistory(
  userId: string,
  limit: number = 25,
): Promise<AuditLogEntry[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('audit_log')
    .select(
      'id, actor_id, actor_type, action, entity_type, entity_id, details_json, ip_address, created_at',
    )
    .or(`actor_id.eq.${userId},entity_id.eq.${userId}`)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('[admin.getUserAuditHistory]', error);
    return [];
  }
  return (data ?? []) as AuditLogEntry[];
}

// ── Memberships ────────────────────────────────────────────

export interface MembershipOverview {
  active: number;
  expired: number;
  none: number;
  activeSubscriptions: number;
  pastDue: number;
  canceled: number;
  recentChanges: {
    id: string;
    email: string;
    first_name: string | null;
    last_name: string | null;
    membership_status: MembershipStatus;
    stripe_subscription_status: string | null;
    membership_started_at: string | null;
    membership_expires_at: string | null;
    updated_at: string;
  }[];
}

export async function getMembershipOverview(): Promise<MembershipOverview> {
  const supabase = createAdminClient();

  const [
    active,
    expired,
    none,
    activeSubs,
    pastDue,
    canceled,
    recentChangesRes,
  ] = await Promise.all([
    safeCount(
      supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('membership_status', 'active'),
    ),
    safeCount(
      supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('membership_status', 'expired'),
    ),
    safeCount(
      supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('membership_status', 'none'),
    ),
    safeCount(
      supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('stripe_subscription_status', 'active'),
    ),
    safeCount(
      supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('stripe_subscription_status', 'past_due'),
    ),
    safeCount(
      supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('stripe_subscription_status', 'canceled'),
    ),
    supabase
      .from('users')
      .select(
        'id, email, first_name, last_name, membership_status, stripe_subscription_status, membership_started_at, membership_expires_at, updated_at',
      )
      .not('membership_started_at', 'is', null)
      .order('updated_at', { ascending: false })
      .limit(15),
  ]);

  const recentChanges =
    (recentChangesRes.data as MembershipOverview['recentChanges'] | null) ?? [];

  return {
    active,
    expired,
    none,
    activeSubscriptions: activeSubs,
    pastDue,
    canceled,
    recentChanges,
  };
}

// ── Validations ───────────────────────────────────────────

export type ValidationStatus = 'pending' | 'confirmed' | 'denied' | 'expired';

export interface AdminValidationRow {
  id: string;
  status: ValidationStatus;
  validator_email: string;
  validator_name: string | null;
  created_at: string;
  expires_at: string;
  responded_at: string | null;
  response_text: string | null;
  deployment_record_id: string;
  requestor_id: string;
  requestor_email: string | null;
  requestor_name: string | null;
}

export interface ListValidationsFilters {
  status?: ValidationStatus | 'all';
  page: number;
  perPage: number;
}

export async function listValidations(
  filters: ListValidationsFilters,
): Promise<{ rows: AdminValidationRow[]; total: number }> {
  const supabase = createAdminClient();
  const from = (filters.page - 1) * filters.perPage;
  const to = from + filters.perPage - 1;

  let query = supabase
    .from('validation_requests')
    .select(
      'id, status, validator_email, validator_name, created_at, expires_at, responded_at, response_text, deployment_record_id, requestor_id, users:requestor_id(email, first_name, last_name)',
      { count: 'exact' },
    )
    .order('created_at', { ascending: false })
    .range(from, to);

  if (filters.status && filters.status !== 'all') {
    query = query.eq('status', filters.status);
  }

  const { data, count, error } = await query;
  if (error) {
    console.error('[admin.listValidations]', error);
    return { rows: [], total: 0 };
  }

  const rows: AdminValidationRow[] = (data ?? []).map((row) => {
    const r = row as Record<string, unknown>;
    const joined = r.users as
      | { email: string | null; first_name: string | null; last_name: string | null }
      | null;
    return {
      id: r.id as string,
      status: r.status as ValidationStatus,
      validator_email: r.validator_email as string,
      validator_name: (r.validator_name as string | null) ?? null,
      created_at: r.created_at as string,
      expires_at: r.expires_at as string,
      responded_at: (r.responded_at as string | null) ?? null,
      response_text: (r.response_text as string | null) ?? null,
      deployment_record_id: r.deployment_record_id as string,
      requestor_id: r.requestor_id as string,
      requestor_email: joined?.email ?? null,
      requestor_name:
        joined
          ? [joined.first_name, joined.last_name].filter(Boolean).join(' ') || null
          : null,
    };
  });

  return { rows, total: count ?? 0 };
}

export async function getValidationDetail(
  id: string,
): Promise<AdminValidationRow | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('validation_requests')
    .select(
      'id, status, validator_email, validator_name, created_at, expires_at, responded_at, response_text, deployment_record_id, requestor_id, users:requestor_id(email, first_name, last_name)',
    )
    .eq('id', id)
    .maybeSingle();

  if (error || !data) return null;

  const r = data as Record<string, unknown>;
  const joined = r.users as
    | { email: string | null; first_name: string | null; last_name: string | null }
    | null;

  return {
    id: r.id as string,
    status: r.status as ValidationStatus,
    validator_email: r.validator_email as string,
    validator_name: (r.validator_name as string | null) ?? null,
    created_at: r.created_at as string,
    expires_at: r.expires_at as string,
    responded_at: (r.responded_at as string | null) ?? null,
    response_text: (r.response_text as string | null) ?? null,
    deployment_record_id: r.deployment_record_id as string,
    requestor_id: r.requestor_id as string,
    requestor_email: joined?.email ?? null,
    requestor_name:
      joined
        ? [joined.first_name, joined.last_name].filter(Boolean).join(' ') || null
        : null,
  };
}

// ── Audit log ─────────────────────────────────────────────

export interface ListAuditFilters {
  actorId?: string;
  action?: string;
  entityType?: string;
  dateFrom?: string;
  dateTo?: string;
  page: number;
  perPage: number;
}

export async function listAuditLog(
  filters: ListAuditFilters,
): Promise<{ rows: AuditLogEntry[]; total: number }> {
  const supabase = createAdminClient();
  const from = (filters.page - 1) * filters.perPage;
  const to = from + filters.perPage - 1;

  let query = supabase
    .from('audit_log')
    .select(
      'id, actor_id, actor_type, action, entity_type, entity_id, details_json, ip_address, created_at',
      { count: 'exact' },
    )
    .order('created_at', { ascending: false })
    .range(from, to);

  if (filters.actorId) query = query.eq('actor_id', filters.actorId);
  if (filters.action) query = query.eq('action', filters.action);
  if (filters.entityType) query = query.eq('entity_type', filters.entityType);
  if (filters.dateFrom) query = query.gte('created_at', filters.dateFrom);
  if (filters.dateTo) query = query.lte('created_at', filters.dateTo);

  const { data, count, error } = await query;
  if (error) {
    console.error('[admin.listAuditLog]', error);
    return { rows: [], total: 0 };
  }
  return { rows: (data ?? []) as AuditLogEntry[], total: count ?? 0 };
}

export async function getAuditFilterOptions(): Promise<{
  actions: string[];
  entityTypes: string[];
}> {
  const supabase = createAdminClient();
  // Pull a recent window of distinct values. Full enumeration is unnecessary
  // for a filter drop-down; ~500 recent rows covers the common set.
  const { data } = await supabase
    .from('audit_log')
    .select('action, entity_type')
    .order('created_at', { ascending: false })
    .limit(500);

  const actions = new Set<string>();
  const entityTypes = new Set<string>();
  for (const row of data ?? []) {
    const r = row as { action?: string | null; entity_type?: string | null };
    if (r.action) actions.add(r.action);
    if (r.entity_type) entityTypes.add(r.entity_type);
  }

  return {
    actions: Array.from(actions).sort(),
    entityTypes: Array.from(entityTypes).sort(),
  };
}
