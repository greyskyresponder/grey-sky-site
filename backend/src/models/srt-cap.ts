export type SrtDiscipline =
  | 'usar'
  | 'swfrt'
  | 'hazmat'
  | 'swat'
  | 'bomb_squad'
  | 'waterborne_sar'
  | 'land_sar'
  | 'suas'
  | 'rotary_wing_sar'
  | 'animal_rescue_sar'
  | 'imt'
  | 'eoc_management'
  | 'public_safety_dive';

export type EngagementStatus =
  | 'quoted'
  | 'contracted'
  | 'self_assessment_sent'
  | 'self_assessment_received'
  | 'assessment_scheduled'
  | 'assessment_complete'
  | 'field_report_delivered'
  | 'final_report_delivered'
  | 'closed';

export interface SrtCapEngagement {
  id: string;
  organization_id: string;
  state_agency_id: string;
  discipline: SrtDiscipline;
  team_name: string | null;
  team_size: number | null;
  engagement_status: EngagementStatus;
  quoted_price: number | null;
  contract_reference: string | null;
  notes: string | null;
  created_at: Date;
  updated_at: Date;
}

export type SelfAssessmentStatus =
  | 'pending'
  | 'sent'
  | 'received'
  | 'under_review'
  | 'reviewed';

export interface SrtCapSelfAssessment {
  id: string;
  engagement_id: string;
  sent_at: Date | null;
  due_date: Date | null;
  received_at: Date | null;
  reviewed_by: string | null;
  review_notes: string | null;
  status: SelfAssessmentStatus;
  created_at: Date;
}

export type MeetsStandard = 'yes' | 'no' | 'na' | 'not_evident';

export interface SrtCapSaSection {
  id: string;
  self_assessment_id: string;
  section_number: number;
  section_title: string;
  self_score: number | null;
  meets_standard: MeetsStandard | null;
  narrative: string | null;
  form_data: Record<string, unknown> | null;
  created_at: Date;
  updated_at: Date;
}

export type SiteAssessmentStatus = 'scheduled' | 'in_progress' | 'complete' | 'cancelled';

export interface SrtCapSiteAssessment {
  id: string;
  engagement_id: string;
  scheduled_date: Date | null;
  location_address: string | null;
  location_city: string | null;
  location_state: string | null;
  lead_assessor_id: string | null;
  assessor_ids: string[];
  status: SiteAssessmentStatus;
  observations: Record<string, unknown> | null;
  created_at: Date;
  updated_at: Date;
}

export type ReportType = 'field_report' | 'final_report';
export type CredentialingOutcome = 'credentialed' | 'not_credentialed' | 'conditional';
export type TypingLevel = 'type1' | 'type2' | 'type3' | 'type4';

export interface SrtCapReport {
  id: string;
  engagement_id: string;
  report_type: ReportType;
  document_id: string | null;
  credentialing_outcome: CredentialingOutcome | null;
  typing_level: TypingLevel | null;
  assessment_date: Date | null;
  assessed_team_name: string | null;
  assessed_typing_level: string | null;
  rtlt_version: string | null;
  assessment_type: string | null;
  capital_cache_confirmed: boolean | null;
  deployment_capability_validated: boolean | null;
  training_verified: boolean | null;
  ics_nims_compliant: boolean | null;
  training_platform: string | null;
  final_readiness_type3_rating: number | null;
  final_readiness_type2_rating: number | null;
  final_readiness_type1_rating: number | null;
  lead_assessor_id: string | null;
  lead_assessor_name: string | null;
  team_leader_name: string | null;
  sert_chief_name: string | null;
  delivered_at: Date | null;
  created_at: Date;
}

export interface SrtCapReportSection {
  id: string;
  report_id: string;
  section_number: number;
  section_title: string;
  meets_standard: MeetsStandard | null;
  score: number | null;
  assessor_observations: string | null;
  assessor_recommendations: string | null;
  created_at: Date;
  updated_at: Date;
}

export type TeamMemberCertificationStatus = 'pending' | 'certified' | 'not_certified';

export interface SrtCapTeamMember {
  id: string;
  engagement_id: string;
  user_id: string;
  role_on_team: string | null;
  certification_status: TeamMemberCertificationStatus;
  certification_id: string | null;
  created_at: Date;
}
