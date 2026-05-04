// GSR-DOC-207: Zod schemas for position requirements + fulfillments.
//
// TODO: test — addPursuitSchema rejects non-UUID position_id
// TODO: test — fulfillmentUploadSchema requires either document_id or file
// TODO: test — verifyFulfillmentSchema allows ISO date or empty string for expires_at
// TODO: test — rejectFulfillmentSchema requires non-empty reason

import { z } from 'zod';

export const requirementTypes = [
  'course',
  'certification',
  'fitness',
  'ptb',
  'experience',
  'other',
] as const;

export const fulfillmentStatuses = [
  'unfulfilled',
  'pending',
  'verified',
  'rejected',
  'expired',
] as const;

// ── User actions ──────────────────────────────────────────

export const addPursuitSchema = z.object({
  position_id: z.string().uuid({ message: 'Valid position is required' }),
  priority: z.number().int().min(0).max(100).optional(),
  notes: z.string().max(500).optional().or(z.literal('')),
});

export const removePursuitSchema = z.object({
  position_id: z.string().uuid(),
});

export const attachDocumentSchema = z.object({
  requirement_id: z.string().uuid(),
  document_id: z.string().uuid(),
  document_date: z.string().optional().or(z.literal('')),
  notes: z.string().max(1000).optional().or(z.literal('')),
});

export const detachDocumentSchema = z.object({
  fulfillment_id: z.string().uuid(),
});

// ── Staff actions ─────────────────────────────────────────

export const verifyFulfillmentSchema = z.object({
  fulfillment_id: z.string().uuid(),
  expires_at: z.string().optional().or(z.literal('')),
  notes: z.string().max(1000).optional().or(z.literal('')),
});

export const rejectFulfillmentSchema = z.object({
  fulfillment_id: z.string().uuid(),
  reason: z
    .string()
    .min(1, { message: 'Rejection reason is required' })
    .max(1000),
});

// ── Filters ───────────────────────────────────────────────

export const requirementFilterSchema = z.object({
  position_id: z.string().uuid().optional(),
  requirement_type: z.enum(requirementTypes).optional(),
  group_label: z.string().optional(),
});

export const nimsTypes = ['type1', 'type2', 'type3', 'type4', 'type5'] as const;

export const positionSearchSchema = z.object({
  query: z.string().max(120).optional().default(''),
  discipline: z.string().max(120).optional().or(z.literal('')),
  resource_category: z.string().max(120).optional().or(z.literal('')),
  nims_type: z.enum(nimsTypes).optional(),
  limit: z.number().int().min(1).max(100).optional().default(40),
});

export type PositionSearchInput = z.infer<typeof positionSearchSchema>;

export const verificationQueueFilterSchema = z.object({
  status: z.enum(fulfillmentStatuses).default('pending'),
  requirement_type: z.enum(requirementTypes).optional(),
  search: z.string().optional(),
  page: z.number().int().positive().default(1),
  per_page: z.number().int().min(10).max(100).default(25),
});

export type AddPursuitInput = z.infer<typeof addPursuitSchema>;
export type AttachDocumentInput = z.infer<typeof attachDocumentSchema>;
export type VerifyFulfillmentInput = z.infer<typeof verifyFulfillmentSchema>;
export type RejectFulfillmentInput = z.infer<typeof rejectFulfillmentSchema>;
export type VerificationQueueFilter = z.infer<typeof verificationQueueFilterSchema>;
