// GSR-DOC-207: Position Requirements — RTLT-driven slots + staff verification.

import type { DocumentCategory, NimsType } from './enums';

export type RequirementType =
  | 'course'
  | 'certification'
  | 'fitness'
  | 'ptb'
  | 'experience'
  | 'other';

export type FulfillmentStatus =
  | 'unfulfilled'
  | 'pending'
  | 'verified'
  | 'rejected'
  | 'expired';

/** One row per requirement per position — seeded from FEMA RTLT. */
export interface PositionRequirement {
  id: string;
  position_id: string;
  requirement_type: RequirementType;
  code: string | null;
  title: string;
  description: string | null;
  document_category: DocumentCategory | null;
  is_required: boolean;
  sort_order: number;
  group_label: string | null;
  rtlt_source: string | null;
  created_at: string;
}

/** Links a user's uploaded document to a specific requirement slot. */
export interface UserRequirementFulfillment {
  id: string;
  user_id: string;
  requirement_id: string;
  document_id: string | null;
  status: FulfillmentStatus;
  verified_by: string | null;
  verified_at: string | null;
  rejection_reason: string | null;
  notes: string | null;
  document_date: string | null;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
}

/** Positions a user is actively pursuing — drives their checklist view. */
export interface UserPositionPursuit {
  id: string;
  user_id: string;
  position_id: string;
  priority: number;
  started_at: string;
  notes: string | null;
  created_at: string;
}

// ── View models ───────────────────────────────────────────

/** A requirement slot joined with the user's current fulfillment state. */
export interface RequirementSlotView {
  requirement: PositionRequirement;
  fulfillment: UserRequirementFulfillment | null;
  document_name: string | null;
}

/** A pursued position joined with summary progress. */
export interface PursuitSummary {
  pursuit: UserPositionPursuit;
  position: {
    id: string;
    title: string;
    rtlt_code: string | null;
    nims_type: NimsType | null;
    discipline: string | null;
    resource_category: string | null;
  };
  total_required: number;
  verified_required: number;
  pending_required: number;
  rejected_required: number;
  expired_required: number;
  completion_percent: number;
}

/** Staff verification queue row. */
export interface VerificationQueueEntry {
  fulfillment: UserRequirementFulfillment;
  requirement: PositionRequirement;
  user: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  };
  position: {
    id: string;
    title: string;
    rtlt_code: string | null;
  };
  document_name: string | null;
}
