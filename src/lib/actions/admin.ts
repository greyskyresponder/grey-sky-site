'use server';

// Admin server actions — mutations triggered from the /admin panel.
// Every action asserts the caller is role='platform_admin', writes an audit
// row, and uses the service-role client for the actual mutation.
//
// TODO: test — every action rejects non-platform_admin callers
// TODO: test — updateUserRole: writes audit row with old/new role, rejects invalid role
// TODO: test — updateMembership: writes audit row, enforces status enum
// TODO: test — setValidationStatus: rejects invalid transitions, refunds coins on reject where applicable
// TODO: test — every action clamps string inputs to schema limits (zod)

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { getUser } from '@/lib/auth/getUser';
import { createAdminClient } from '@/lib/supabase/admin';

type Role = 'member' | 'org_admin' | 'assessor' | 'platform_admin';
type MembershipStatus = 'active' | 'expired' | 'none';
type ValidationStatus = 'pending' | 'confirmed' | 'denied' | 'expired';

type AdminActionResult =
  | { success: true }
  | { error: string };

async function assertAdmin(): Promise<{ ok: true; adminId: string } | { ok: false; error: string }> {
  const session = await getUser();
  if (!session) return { ok: false, error: 'Not authenticated.' };
  const role = (session.profile as unknown as { role?: string }).role;
  if (role !== 'platform_admin') {
    return { ok: false, error: 'Forbidden.' };
  }
  return { ok: true, adminId: session.user.id };
}

async function writeAudit(
  adminId: string,
  action: string,
  entityType: string,
  entityId: string | null,
  details: Record<string, unknown>,
): Promise<void> {
  try {
    const supabase = createAdminClient();
    await supabase.from('audit_log').insert({
      actor_id: adminId,
      actor_type: 'admin',
      action,
      entity_type: entityType,
      entity_id: entityId,
      details_json: details,
    });
  } catch (err) {
    // Audit writes must never block the mutation they describe.
    console.error('[admin.audit] insert failed', err);
  }
}

// ── Users ─────────────────────────────────────────────────

const updateRoleSchema = z.object({
  userId: z.string().uuid('Invalid user id'),
  role: z.enum(['member', 'org_admin', 'assessor', 'platform_admin']),
  reason: z.string().min(5, 'Reason must be at least 5 characters').max(500),
});

export async function updateUserRole(input: {
  userId: string;
  role: Role;
  reason: string;
}): Promise<AdminActionResult> {
  const parsed = updateRoleSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const auth = await assertAdmin();
  if (!auth.ok) return { error: auth.error };

  const supabase = createAdminClient();

  const { data: current } = await supabase
    .from('users')
    .select('role')
    .eq('id', parsed.data.userId)
    .maybeSingle();

  if (!current) return { error: 'User not found.' };

  if (
    (current as { role?: Role | null }).role === parsed.data.role
  ) {
    return { error: 'User already has that role.' };
  }

  // Guardrail: do not let an admin demote themselves in a single action.
  if (parsed.data.userId === auth.adminId && parsed.data.role !== 'platform_admin') {
    return { error: 'You cannot remove your own platform admin role here.' };
  }

  const { error: updateError } = await supabase
    .from('users')
    .update({ role: parsed.data.role })
    .eq('id', parsed.data.userId);

  if (updateError) {
    console.error('[admin.updateUserRole]', updateError);
    return { error: 'Unable to update role.' };
  }

  await writeAudit(auth.adminId, 'admin.user.role_change', 'user', parsed.data.userId, {
    old_role: (current as { role?: Role | null }).role ?? null,
    new_role: parsed.data.role,
    reason: parsed.data.reason,
  });

  revalidatePath(`/admin/users/${parsed.data.userId}`);
  revalidatePath('/admin/users');
  return { success: true };
}

const updateMembershipSchema = z.object({
  userId: z.string().uuid('Invalid user id'),
  membershipStatus: z.enum(['active', 'expired', 'none']),
  membershipExpiresAt: z
    .string()
    .datetime({ offset: true })
    .nullable()
    .optional(),
  reason: z.string().min(5, 'Reason must be at least 5 characters').max(500),
});

export async function updateMembership(input: {
  userId: string;
  membershipStatus: MembershipStatus;
  membershipExpiresAt?: string | null;
  reason: string;
}): Promise<AdminActionResult> {
  const parsed = updateMembershipSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const auth = await assertAdmin();
  if (!auth.ok) return { error: auth.error };

  const supabase = createAdminClient();

  const { data: current } = await supabase
    .from('users')
    .select('membership_status, membership_expires_at')
    .eq('id', parsed.data.userId)
    .maybeSingle();

  if (!current) return { error: 'User not found.' };

  const update: Record<string, unknown> = {
    membership_status: parsed.data.membershipStatus,
  };
  if (parsed.data.membershipExpiresAt !== undefined) {
    update.membership_expires_at = parsed.data.membershipExpiresAt;
  }

  const { error: updateError } = await supabase
    .from('users')
    .update(update)
    .eq('id', parsed.data.userId);

  if (updateError) {
    console.error('[admin.updateMembership]', updateError);
    return { error: 'Unable to update membership.' };
  }

  await writeAudit(
    auth.adminId,
    'admin.user.membership_change',
    'user',
    parsed.data.userId,
    {
      old: current,
      new: update,
      reason: parsed.data.reason,
    },
  );

  revalidatePath(`/admin/users/${parsed.data.userId}`);
  revalidatePath('/admin/memberships');
  return { success: true };
}

const updateStatusSchema = z.object({
  userId: z.string().uuid('Invalid user id'),
  status: z.enum(['active', 'suspended', 'deactivated']),
  reason: z.string().min(5, 'Reason must be at least 5 characters').max(500),
});

export async function updateUserStatus(input: {
  userId: string;
  status: 'active' | 'suspended' | 'deactivated';
  reason: string;
}): Promise<AdminActionResult> {
  const parsed = updateStatusSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const auth = await assertAdmin();
  if (!auth.ok) return { error: auth.error };

  if (parsed.data.userId === auth.adminId && parsed.data.status !== 'active') {
    return { error: 'You cannot suspend or deactivate your own account.' };
  }

  const supabase = createAdminClient();
  const { data: current } = await supabase
    .from('users')
    .select('status')
    .eq('id', parsed.data.userId)
    .maybeSingle();
  if (!current) return { error: 'User not found.' };

  const { error: updateError } = await supabase
    .from('users')
    .update({ status: parsed.data.status })
    .eq('id', parsed.data.userId);

  if (updateError) {
    console.error('[admin.updateUserStatus]', updateError);
    return { error: 'Unable to update status.' };
  }

  await writeAudit(auth.adminId, 'admin.user.status_change', 'user', parsed.data.userId, {
    old_status: (current as { status?: string }).status ?? null,
    new_status: parsed.data.status,
    reason: parsed.data.reason,
  });

  revalidatePath(`/admin/users/${parsed.data.userId}`);
  return { success: true };
}

// ── Validations ───────────────────────────────────────────

const setValidationStatusSchema = z.object({
  validationId: z.string().uuid('Invalid validation id'),
  status: z.enum(['confirmed', 'denied', 'expired']),
  reason: z.string().min(5).max(500),
});

export async function setValidationStatus(input: {
  validationId: string;
  status: Extract<ValidationStatus, 'confirmed' | 'denied' | 'expired'>;
  reason: string;
}): Promise<AdminActionResult> {
  const parsed = setValidationStatusSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const auth = await assertAdmin();
  if (!auth.ok) return { error: auth.error };

  const supabase = createAdminClient();

  const { data: current } = await supabase
    .from('validation_requests')
    .select('id, status')
    .eq('id', parsed.data.validationId)
    .maybeSingle();

  if (!current) return { error: 'Validation request not found.' };
  if ((current as { status?: string }).status !== 'pending') {
    return { error: 'Only pending validations can be updated from here.' };
  }

  const { error: updateError } = await supabase
    .from('validation_requests')
    .update({
      status: parsed.data.status,
      responded_at: new Date().toISOString(),
    })
    .eq('id', parsed.data.validationId);

  if (updateError) {
    console.error('[admin.setValidationStatus]', updateError);
    return { error: 'Unable to update validation status.' };
  }

  await writeAudit(
    auth.adminId,
    'admin.validation.status_change',
    'validation_request',
    parsed.data.validationId,
    {
      old_status: (current as { status?: string }).status ?? null,
      new_status: parsed.data.status,
      reason: parsed.data.reason,
    },
  );

  revalidatePath('/admin/validations');
  revalidatePath(`/admin/validations/${parsed.data.validationId}`);
  return { success: true };
}
