export type IncidentType = 'disaster' | 'exercise' | 'planned_event' | 'training' | 'steady_state';
export type IncidentStatus = 'active' | 'closed';

export interface Incident {
  id: string;
  name: string;
  description: string | null;
  type: IncidentType;
  declaration_number: string | null;
  fema_disaster_number: string | null;
  start_date: Date | null;
  end_date: Date | null;
  state: string | null;
  county: string | null;
  status: IncidentStatus;
  created_at: Date;
}

export type NimsType = 'type1' | 'type2' | 'type3' | 'type4' | 'type5';

export interface Position {
  id: string;
  title: string;
  nims_type: NimsType | null;
  complexity_level: string | null;
  resource_category: string | null;
  rtlt_code: string | null;
  discipline: string | null;
  description: string | null;
  requirements_json: Record<string, unknown> | null;
}

export type VerificationTier = 'self_certified' | 'validated_360' | 'evaluated_ics225';
export type DeploymentRecordStatus = 'draft' | 'submitted' | 'verified';

export interface DeploymentRecord {
  id: string;
  user_id: string;
  incident_id: string | null;
  position_id: string | null;
  org_id: string | null;
  start_date: Date | null;
  end_date: Date | null;
  hours: number | null;
  verification_tier: VerificationTier;
  supervisor_name: string | null;
  supervisor_email: string | null;
  notes: string | null;
  status: DeploymentRecordStatus;
  created_at: Date;
  updated_at: Date;
}

export type ValidationRequestStatus = 'pending' | 'confirmed' | 'denied' | 'expired';

export interface ValidationRequest {
  id: string;
  deployment_record_id: string;
  requestor_id: string;
  validator_email: string;
  validator_name: string | null;
  validator_user_id: string | null;
  status: ValidationRequestStatus;
  response_text: string | null;
  attestation_text: string | null;
  attestation_accepted: boolean | null;
  responded_at: Date | null;
  token: string;
  expires_at: Date;
  created_at: Date;
}

export type EvaluationRequestStatus = 'pending' | 'completed' | 'denied' | 'expired';

export interface EvaluationRequest {
  id: string;
  deployment_record_id: string;
  requestor_id: string;
  evaluator_email: string;
  evaluator_name: string | null;
  evaluator_user_id: string | null;
  status: EvaluationRequestStatus;
  rating_leadership: number | null;
  rating_tactical: number | null;
  rating_communication: number | null;
  rating_planning: number | null;
  rating_technical: number | null;
  overall_rating: number | null;
  commentary: string | null;
  attestation_text: string | null;
  attestation_accepted: boolean | null;
  responded_at: Date | null;
  token: string;
  expires_at: Date;
  created_at: Date;
}
