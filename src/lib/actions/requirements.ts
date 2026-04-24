'use server';

// GSR-DOC-207: Server actions for position requirements + fulfillments.
//
// Core operations:
//   - listMyPursuits()                 -> PursuitSummary[]
//   - addPursuit(position_id)          -> add a position to the user's checklist
//   - removePursuit(position_id)       -> remove
//   - getPositionRequirements(positionId) -> requirement slots with user fulfillment overlay
//   - attachDocumentToRequirement()    -> user uploads-against-slot (pending)
//                                         also reuses the doc across other pursued positions
//   - detachDocument(fulfillment_id)   -> clears the attached document, back to unfulfilled
//   - verifyFulfillment() (staff)      -> status=verified (optional expires_at)
//   - rejectFulfillment() (staff)      -> status=rejected + reason
//   - getVerificationQueue()   (staff) -> pending fulfillments across all users
//
// TODO: test — listMyPursuits returns zero-state for new users
// TODO: test — attachDocumentToRequirement cross-fulfills same course across positions
// TODO: test — verifyFulfillment fails for non-staff callers
// TODO: test — rejectFulfillment requires reason
// TODO: test — getPositionRequirements returns all slots grouped by group_label

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import {
  addPursuitSchema,
  attachDocumentSchema,
  detachDocumentSchema,
  verifyFulfillmentSchema,
  rejectFulfillmentSchema,
  verificationQueueFilterSchema,
} from '@/lib/validators/requirements';
import type {
  PositionRequirement,
  UserRequirementFulfillment,
  RequirementSlotView,
  PursuitSummary,
  VerificationQueueEntry,
  FulfillmentStatus,
} from '@/lib/types/requirements';
import type { NimsType } from '@/lib/types/enums';

async function getAuthUserId(): Promise<string | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.id ?? null;
}

async function getAuthUserRole(): Promise<string | null> {
  const userId = await getAuthUserId();
  if (!userId) return null;
  const supabase = await createClient();
  const { data } = await supabase.from('users').select('role').eq('id', userId).single();
  return (data?.role as string | undefined) ?? null;
}

function isStaffRole(role: string | null): boolean {
  return role === 'platform_admin' || role === 'staff';
}

// ── Pursuits ──────────────────────────────────────────────

export async function listMyPursuits(): Promise<{
  data: PursuitSummary[];
  error: string | null;
}> {
  const userId = await getAuthUserId();
  if (!userId) return { data: [], error: 'Not authenticated' };

  const supabase = await createClient();

  const { data: pursuits, error: pursuitErr } = await supabase
    .from('user_position_pursuits')
    .select('id, user_id, position_id, priority, started_at, notes, created_at, positions(id, title, rtlt_code, nims_type, discipline, resource_category)')
    .eq('user_id', userId)
    .order('priority', { ascending: false })
    .order('started_at', { ascending: false });

  if (pursuitErr) return { data: [], error: pursuitErr.message };
  if (!pursuits || pursuits.length === 0) return { data: [], error: null };

  const positionIds = pursuits.map((p) => p.position_id);

  // Load required requirement counts per pursued position.
  const { data: reqs } = await supabase
    .from('position_requirements')
    .select('id, position_id, is_required')
    .in('position_id', positionIds);

  // Load user fulfillments for those requirements.
  const requirementIds = (reqs ?? []).map((r) => r.id as string);
  const { data: fulfillments } = requirementIds.length
    ? await supabase
        .from('user_requirement_fulfillments')
        .select('requirement_id, status')
        .eq('user_id', userId)
        .in('requirement_id', requirementIds)
    : { data: [] };

  const statusByReq = new Map<string, FulfillmentStatus>();
  for (const f of fulfillments ?? []) {
    statusByReq.set(f.requirement_id as string, f.status as FulfillmentStatus);
  }

  const reqsByPosition = new Map<string, Array<{ id: string; is_required: boolean }>>();
  for (const r of reqs ?? []) {
    const list = reqsByPosition.get(r.position_id as string) ?? [];
    list.push({ id: r.id as string, is_required: r.is_required as boolean });
    reqsByPosition.set(r.position_id as string, list);
  }

  const out: PursuitSummary[] = pursuits.map((row) => {
    const pos = row.positions as unknown as {
      id: string;
      title: string;
      rtlt_code: string | null;
      nims_type: NimsType | null;
      discipline: string | null;
      resource_category: string | null;
    };
    const reqList = reqsByPosition.get(row.position_id as string) ?? [];
    let totalReq = 0;
    let verified = 0;
    let pending = 0;
    let rejected = 0;
    let expired = 0;
    for (const r of reqList) {
      if (!r.is_required) continue;
      totalReq++;
      const st = statusByReq.get(r.id);
      if (st === 'verified') verified++;
      else if (st === 'pending') pending++;
      else if (st === 'rejected') rejected++;
      else if (st === 'expired') expired++;
    }
    const pct = totalReq === 0 ? 0 : Math.round((verified / totalReq) * 100);

    return {
      pursuit: {
        id: row.id as string,
        user_id: row.user_id as string,
        position_id: row.position_id as string,
        priority: row.priority as number,
        started_at: row.started_at as string,
        notes: (row.notes as string | null) ?? null,
        created_at: row.created_at as string,
      },
      position: pos,
      total_required: totalReq,
      verified_required: verified,
      pending_required: pending,
      rejected_required: rejected,
      expired_required: expired,
      completion_percent: pct,
    };
  });

  return { data: out, error: null };
}

export async function addPursuit(input: unknown): Promise<{ error: string | null }> {
  const userId = await getAuthUserId();
  if (!userId) return { error: 'Not authenticated' };

  const parsed = addPursuitSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const supabase = await createClient();

  // Idempotent insert — UNIQUE(user_id, position_id) protects us.
  const { error } = await supabase.from('user_position_pursuits').insert({
    user_id: userId,
    position_id: parsed.data.position_id,
    priority: parsed.data.priority ?? 0,
    notes: parsed.data.notes || null,
  });

  // Duplicate is OK — the position is already being pursued.
  if (error && !error.message.toLowerCase().includes('duplicate')) {
    return { error: error.message };
  }

  revalidatePath('/dashboard/qualifications');
  return { error: null };
}

export async function removePursuit(positionId: string): Promise<{ error: string | null }> {
  const userId = await getAuthUserId();
  if (!userId) return { error: 'Not authenticated' };
  if (!/^[0-9a-f-]{36}$/i.test(positionId)) return { error: 'Invalid position id' };

  const supabase = await createClient();
  const { error } = await supabase
    .from('user_position_pursuits')
    .delete()
    .eq('user_id', userId)
    .eq('position_id', positionId);

  if (error) return { error: error.message };
  revalidatePath('/dashboard/qualifications');
  return { error: null };
}

// ── Requirements + slot view ──────────────────────────────

export async function getPositionRequirements(positionId: string): Promise<{
  slots: RequirementSlotView[];
  error: string | null;
}> {
  const userId = await getAuthUserId();
  if (!userId) return { slots: [], error: 'Not authenticated' };
  if (!/^[0-9a-f-]{36}$/i.test(positionId)) return { slots: [], error: 'Invalid position id' };

  const supabase = await createClient();

  const { data: reqs, error: reqErr } = await supabase
    .from('position_requirements')
    .select('*')
    .eq('position_id', positionId)
    .order('sort_order', { ascending: true });

  if (reqErr) return { slots: [], error: reqErr.message };
  if (!reqs || reqs.length === 0) return { slots: [], error: null };

  const requirementIds = reqs.map((r) => r.id as string);
  const { data: fulfillments } = await supabase
    .from('user_requirement_fulfillments')
    .select('*, documents(file_name, title)')
    .eq('user_id', userId)
    .in('requirement_id', requirementIds);

  const fByReq = new Map<
    string,
    { fulfillment: UserRequirementFulfillment; document_name: string | null }
  >();
  for (const f of fulfillments ?? []) {
    const doc = (f as Record<string, unknown>).documents as
      | { file_name: string | null; title: string | null }
      | null;
    const { documents: _doc, ...rest } = f as Record<string, unknown>;
    void _doc;
    fByReq.set(f.requirement_id as string, {
      fulfillment: rest as unknown as UserRequirementFulfillment,
      document_name: (doc?.title as string | null) ?? (doc?.file_name as string | null) ?? null,
    });
  }

  const slots: RequirementSlotView[] = reqs.map((r) => {
    const entry = fByReq.get(r.id as string);
    return {
      requirement: r as unknown as PositionRequirement,
      fulfillment: entry?.fulfillment ?? null,
      document_name: entry?.document_name ?? null,
    };
  });

  return { slots, error: null };
}

// ── Browse positions (for AddPositionModal) ───────────────

export async function searchPositions(query: string, limit = 30): Promise<{
  data: Array<{
    id: string;
    title: string;
    rtlt_code: string | null;
    nims_type: NimsType | null;
    discipline: string | null;
    resource_category: string | null;
  }>;
  error: string | null;
}> {
  const userId = await getAuthUserId();
  if (!userId) return { data: [], error: 'Not authenticated' };

  const supabase = await createClient();
  let q = supabase
    .from('positions')
    .select('id, title, rtlt_code, nims_type, discipline, resource_category')
    .order('title', { ascending: true })
    .limit(limit);

  const needle = (query ?? '').trim();
  if (needle.length > 0) {
    // Escape %, _, \ for ilike.
    const safe = needle.replace(/\\/g, '\\\\').replace(/%/g, '\\%').replace(/_/g, '\\_');
    q = q.or(`title.ilike.%${safe}%,rtlt_code.ilike.%${safe}%,discipline.ilike.%${safe}%`);
  }

  const { data, error } = await q;
  if (error) return { data: [], error: error.message };
  return {
    data: (data ?? []).map((r) => ({
      id: r.id as string,
      title: r.title as string,
      rtlt_code: (r.rtlt_code as string | null) ?? null,
      nims_type: (r.nims_type as NimsType | null) ?? null,
      discipline: (r.discipline as string | null) ?? null,
      resource_category: (r.resource_category as string | null) ?? null,
    })),
    error: null,
  };
}

// ── Fulfillment — responder side ──────────────────────────

/**
 * Attach a document to a requirement slot. Creates or updates the fulfillment
 * row, sets status=pending, and — critically — cross-fulfills the same
 * requirement code across every OTHER position the user is pursuing.
 */
export async function attachDocumentToRequirement(
  input: unknown
): Promise<{ error: string | null; cross_fulfilled: number }> {
  const userId = await getAuthUserId();
  if (!userId) return { error: 'Not authenticated', cross_fulfilled: 0 };

  const parsed = attachDocumentSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0].message, cross_fulfilled: 0 };

  const supabase = await createClient();

  // Confirm the document belongs to this user.
  const { data: doc, error: docErr } = await supabase
    .from('documents')
    .select('id, user_id')
    .eq('id', parsed.data.document_id)
    .single();
  if (docErr || !doc) return { error: 'Document not found', cross_fulfilled: 0 };
  if (doc.user_id !== userId) return { error: 'Document does not belong to you', cross_fulfilled: 0 };

  // Look up the originating requirement to reuse its code across positions.
  const { data: req, error: reqErr } = await supabase
    .from('position_requirements')
    .select('id, code, requirement_type')
    .eq('id', parsed.data.requirement_id)
    .single();
  if (reqErr || !req) return { error: 'Requirement not found', cross_fulfilled: 0 };

  // Gather target requirement ids — the primary requirement plus any sibling
  // requirements with the same (requirement_type, code) on the user's other
  // pursued positions. Only requirements with a non-null code are reusable.
  let targetRequirementIds: string[] = [parsed.data.requirement_id];

  if (req.code) {
    const { data: pursuits } = await supabase
      .from('user_position_pursuits')
      .select('position_id')
      .eq('user_id', userId);
    const pursuedPositionIds = (pursuits ?? []).map((p) => p.position_id as string);
    if (pursuedPositionIds.length > 0) {
      const { data: siblings } = await supabase
        .from('position_requirements')
        .select('id')
        .eq('code', req.code)
        .eq('requirement_type', req.requirement_type)
        .in('position_id', pursuedPositionIds);
      const ids = (siblings ?? []).map((s) => s.id as string);
      targetRequirementIds = Array.from(new Set([parsed.data.requirement_id, ...ids]));
    }
  }

  // Upsert a pending fulfillment for each target requirement. We NEVER overwrite
  // a verified fulfillment — swapping an active cert requires detaching first.
  let successCount = 0;
  for (const reqId of targetRequirementIds) {
    const { data: existing } = await supabase
      .from('user_requirement_fulfillments')
      .select('id, status')
      .eq('user_id', userId)
      .eq('requirement_id', reqId)
      .maybeSingle();

    if (existing && (existing.status === 'verified' || existing.status === 'expired')) {
      // Preserve: user must explicitly detach before replacing.
      if (reqId === parsed.data.requirement_id) {
        return {
          error: 'This slot is already verified — detach the current document before replacing.',
          cross_fulfilled: 0,
        };
      }
      continue;
    }

    if (existing) {
      const { error: upErr } = await supabase
        .from('user_requirement_fulfillments')
        .update({
          document_id: parsed.data.document_id,
          status: 'pending',
          rejection_reason: null,
          notes: parsed.data.notes || null,
          document_date: parsed.data.document_date || null,
          expires_at: null,
          verified_by: null,
          verified_at: null,
        })
        .eq('id', existing.id);
      if (!upErr) successCount++;
    } else {
      const { error: insErr } = await supabase.from('user_requirement_fulfillments').insert({
        user_id: userId,
        requirement_id: reqId,
        document_id: parsed.data.document_id,
        status: 'pending',
        notes: parsed.data.notes || null,
        document_date: parsed.data.document_date || null,
      });
      if (!insErr) successCount++;
    }
  }

  revalidatePath('/dashboard/qualifications');
  return { error: null, cross_fulfilled: Math.max(0, successCount - 1) };
}

export async function detachDocument(
  input: unknown
): Promise<{ error: string | null }> {
  const userId = await getAuthUserId();
  if (!userId) return { error: 'Not authenticated' };

  const parsed = detachDocumentSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const supabase = await createClient();

  // Users can only reset their own pending/unverified fulfillments.
  const { error } = await supabase
    .from('user_requirement_fulfillments')
    .update({
      document_id: null,
      status: 'unfulfilled',
      notes: null,
      rejection_reason: null,
      document_date: null,
      expires_at: null,
      verified_by: null,
      verified_at: null,
    })
    .eq('id', parsed.data.fulfillment_id)
    .eq('user_id', userId)
    .in('status', ['pending', 'rejected']);

  if (error) return { error: error.message };
  revalidatePath('/dashboard/qualifications');
  return { error: null };
}

// ── Fulfillment — staff side ──────────────────────────────

export async function verifyFulfillment(
  input: unknown
): Promise<{ error: string | null }> {
  const role = await getAuthUserRole();
  if (!isStaffRole(role)) return { error: 'Not authorized' };

  const parsed = verifyFulfillmentSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const userId = await getAuthUserId();
  const supabase = await createClient();

  const expiresAt = parsed.data.expires_at && parsed.data.expires_at.length > 0
    ? parsed.data.expires_at
    : null;

  const { error } = await supabase
    .from('user_requirement_fulfillments')
    .update({
      status: 'verified',
      verified_by: userId,
      verified_at: new Date().toISOString(),
      expires_at: expiresAt,
      rejection_reason: null,
      notes: parsed.data.notes || null,
    })
    .eq('id', parsed.data.fulfillment_id);

  if (error) return { error: error.message };
  revalidatePath('/dashboard/admin/verifications');
  revalidatePath('/dashboard/qualifications');
  return { error: null };
}

export async function rejectFulfillment(
  input: unknown
): Promise<{ error: string | null }> {
  const role = await getAuthUserRole();
  if (!isStaffRole(role)) return { error: 'Not authorized' };

  const parsed = rejectFulfillmentSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const userId = await getAuthUserId();
  const supabase = await createClient();

  const { error } = await supabase
    .from('user_requirement_fulfillments')
    .update({
      status: 'rejected',
      verified_by: userId,
      verified_at: new Date().toISOString(),
      rejection_reason: parsed.data.reason,
    })
    .eq('id', parsed.data.fulfillment_id);

  if (error) return { error: error.message };
  revalidatePath('/dashboard/admin/verifications');
  revalidatePath('/dashboard/qualifications');
  return { error: null };
}

export async function getVerificationQueue(input: unknown = {}): Promise<{
  data: VerificationQueueEntry[];
  total: number;
  error: string | null;
}> {
  const role = await getAuthUserRole();
  if (!isStaffRole(role)) return { data: [], total: 0, error: 'Not authorized' };

  const parsed = verificationQueueFilterSchema.safeParse(input);
  const f = parsed.success ? parsed.data : { status: 'pending' as const, page: 1, per_page: 25 };

  const supabase = await createClient();

  let query = supabase
    .from('user_requirement_fulfillments')
    .select(
      `id, user_id, requirement_id, document_id, status, verified_by, verified_at,
       rejection_reason, notes, document_date, expires_at, created_at, updated_at,
       users:users!user_id(id, first_name, last_name, email),
       position_requirements:position_requirements!requirement_id(
         id, position_id, requirement_type, code, title, description,
         document_category, is_required, sort_order, group_label, rtlt_source, created_at,
         positions:positions!position_id(id, title, rtlt_code)
       ),
       documents:documents!document_id(file_name, title)`,
      { count: 'exact' }
    )
    .eq('status', f.status)
    .order('created_at', { ascending: true });

  if (f.requirement_type) {
    query = query.eq('position_requirements.requirement_type', f.requirement_type);
  }

  const from = ((f.page ?? 1) - 1) * (f.per_page ?? 25);
  const to = from + (f.per_page ?? 25) - 1;
  query = query.range(from, to);

  const { data, count, error } = await query;
  if (error) return { data: [], total: 0, error: error.message };

  const mapped: VerificationQueueEntry[] = (data ?? [])
    .map((row: Record<string, unknown>) => {
      const req = row.position_requirements as
        | (Record<string, unknown> & { positions: Record<string, unknown> | null })
        | null;
      const pos = (req?.positions as Record<string, unknown> | null) ?? null;
      const user = row.users as {
        id: string;
        first_name: string;
        last_name: string;
        email: string;
      } | null;
      const doc = row.documents as { file_name: string | null; title: string | null } | null;

      if (!req || !user || !pos) return null;

      const { positions: _positions, ...requirement } = req;
      void _positions;

      return {
        fulfillment: {
          id: row.id as string,
          user_id: row.user_id as string,
          requirement_id: row.requirement_id as string,
          document_id: (row.document_id as string | null) ?? null,
          status: row.status as FulfillmentStatus,
          verified_by: (row.verified_by as string | null) ?? null,
          verified_at: (row.verified_at as string | null) ?? null,
          rejection_reason: (row.rejection_reason as string | null) ?? null,
          notes: (row.notes as string | null) ?? null,
          document_date: (row.document_date as string | null) ?? null,
          expires_at: (row.expires_at as string | null) ?? null,
          created_at: row.created_at as string,
          updated_at: row.updated_at as string,
        },
        requirement: requirement as unknown as PositionRequirement,
        user,
        position: {
          id: pos.id as string,
          title: pos.title as string,
          rtlt_code: (pos.rtlt_code as string | null) ?? null,
        },
        document_name: (doc?.title as string | null) ?? (doc?.file_name as string | null) ?? null,
      } satisfies VerificationQueueEntry;
    })
    .filter((r): r is VerificationQueueEntry => r !== null);

  return { data: mapped, total: count ?? 0, error: null };
}

export async function getFulfillmentById(id: string): Promise<{
  entry: VerificationQueueEntry | null;
  error: string | null;
}> {
  const role = await getAuthUserRole();
  if (!isStaffRole(role)) return { entry: null, error: 'Not authorized' };
  if (!/^[0-9a-f-]{36}$/i.test(id)) return { entry: null, error: 'Invalid id' };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('user_requirement_fulfillments')
    .select(
      `id, user_id, requirement_id, document_id, status, verified_by, verified_at,
       rejection_reason, notes, document_date, expires_at, created_at, updated_at,
       users:users!user_id(id, first_name, last_name, email),
       position_requirements:position_requirements!requirement_id(
         id, position_id, requirement_type, code, title, description,
         document_category, is_required, sort_order, group_label, rtlt_source, created_at,
         positions:positions!position_id(id, title, rtlt_code)
       ),
       documents:documents!document_id(file_name, title)`
    )
    .eq('id', id)
    .single();

  if (error || !data) return { entry: null, error: error?.message ?? 'Not found' };

  const row = data as Record<string, unknown>;
  const req = row.position_requirements as
    | (Record<string, unknown> & { positions: Record<string, unknown> | null })
    | null;
  const pos = (req?.positions as Record<string, unknown> | null) ?? null;
  const user = row.users as { id: string; first_name: string; last_name: string; email: string } | null;
  const doc = row.documents as { file_name: string | null; title: string | null } | null;

  if (!req || !user || !pos) return { entry: null, error: 'Incomplete relations' };

  const { positions: _positions, ...requirement } = req;
  void _positions;

  return {
    entry: {
      fulfillment: {
        id: row.id as string,
        user_id: row.user_id as string,
        requirement_id: row.requirement_id as string,
        document_id: (row.document_id as string | null) ?? null,
        status: row.status as FulfillmentStatus,
        verified_by: (row.verified_by as string | null) ?? null,
        verified_at: (row.verified_at as string | null) ?? null,
        rejection_reason: (row.rejection_reason as string | null) ?? null,
        notes: (row.notes as string | null) ?? null,
        document_date: (row.document_date as string | null) ?? null,
        expires_at: (row.expires_at as string | null) ?? null,
        created_at: row.created_at as string,
        updated_at: row.updated_at as string,
      },
      requirement: requirement as unknown as PositionRequirement,
      user,
      position: {
        id: pos.id as string,
        title: pos.title as string,
        rtlt_code: (pos.rtlt_code as string | null) ?? null,
      },
      document_name: (doc?.title as string | null) ?? (doc?.file_name as string | null) ?? null,
    },
    error: null,
  };
}

