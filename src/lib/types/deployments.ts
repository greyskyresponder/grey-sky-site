// Group B: Incidents & Deployments

import type {
  IncidentType,
  IncidentStatus,
  NimsType,
  VerificationTier,
  DeploymentRecordStatus,
  ValidationRequestStatus,
  EvaluationRequestStatus,
} from './enums';

/** incidents — 11 columns */
export interface Incident {
  id: string;
  name: string;
  description: string | null;
  type: IncidentType;
  declaration_number: string | null;
  fema_disaster_number: string | null;
  start_date: string | null;
  end_date: string | null;
  state: string | null;
  county: string | null;
  status: IncidentStatus;
  created_at: string;
}

/** positions — 9 columns */
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

/** deployment_records — 14 columns */
export interface DeploymentRecord {
  id: string;
  user_id: string;
  incident_id: string | null;
  position_id: string | null;
  org_id: string | null;
  start_date: string | null;
  end_date: string | null;
  hours: number | null;
  verification_tier: VerificationTier;
  supervisor_name: string | null;
  supervisor_email: string | null;
  notes: string | null;
  status: DeploymentRecordStatus;
  created_at: string;
  updated_at: string;
}

/** validation_requests — 13 columns */
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
  responded_at: string | null;
  token: string;
  expires_at: string;
  created_at: string;
}

/** evaluation_requests — 18 columns */
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
  responded_at: string | null;
  token: string;
  expires_at: string;
  created_at: string;
}
