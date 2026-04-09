export type TenantType = 'jurisdiction' | 'organization' | 'responder_hub';
export type TeamStatus = 'pending' | 'scheduled' | 'assessed' | 'credentialed' | 'action_required';
export type ResponderStatus = 'onboarding' | 'in_review' | 'credentialed' | 'action_required' | 'inactive';
export type RequirementType = 'training' | 'certification' | 'experience' | 'equipment' | 'document';
export type RequirementStatus = 'pending' | 'submitted' | 'verified' | 'expired';
export type EvidenceStatus = 'received' | 'in_review' | 'accepted' | 'rejected';
export type AssessmentStage = 'intake' | 'scheduled' | 'site_visit' | 'reporting' | 'closed';
export type FindingSeverity = 'critical' | 'major' | 'minor' | 'info';

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  type: TenantType;
  region?: string;
  contact_email?: string;
  contact_phone?: string;
  created_at: string;
  updated_at: string;
}

export interface RequirementPack {
  id: string;
  discipline: string;
  version: string;
  title: string;
  notes?: string;
  requirements: unknown[];
  created_at: string;
}

export interface Requirement {
  id: string;
  discipline: string;
  code: string;
  title: string;
  description?: string;
  requirement_type: RequirementType;
  currency_interval_days?: number;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface Program {
  id: string;
  tenant_id: string;
  discipline: string;
  name: string;
  description?: string;
  requirement_pack_id?: string;
  created_at: string;
  updated_at: string;
}

export interface Team {
  id: string;
  tenant_id: string;
  program_id?: string;
  name: string;
  location_city?: string;
  location_state?: string;
  status: TeamStatus;
  next_review_at?: string;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface Responder {
  id: string;
  tenant_id: string;
  primary_program_id?: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  primary_discipline?: string;
  status: ResponderStatus;
  created_at: string;
  updated_at: string;
}

export interface Evidence {
  id: string;
  tenant_id: string;
  responder_id?: string;
  team_id?: string;
  file_path: string;
  source?: string;
  status: EvidenceStatus;
  notes?: string;
  uploaded_at: string;
  verified_at?: string;
  verified_by?: string;
}

export interface ResponderRequirement {
  id: string;
  responder_id: string;
  requirement_id: string;
  status: RequirementStatus;
  due_at?: string;
  completed_at?: string;
  evidence_id?: string;
  reviewer_id?: string;
  reviewer_notes?: string;
  updated_at: string;
}

export interface Assessment {
  id: string;
  tenant_id: string;
  team_id: string;
  program_id?: string;
  assessor_id?: string;
  stage: AssessmentStage;
  scheduled_at?: string;
  completed_at?: string;
  overall_rating?: string;
  summary?: string;
  action_items: unknown[];
  created_at: string;
}

export interface AssessmentFinding {
  id: string;
  assessment_id: string;
  requirement_id?: string;
  severity: FindingSeverity;
  finding: string;
  recommendation?: string;
  resolved: boolean;
  resolved_at?: string;
}
