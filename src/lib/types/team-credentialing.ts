// Group E: Team Credentialing (tc_)

import type {
  EngagementStatus,
  SrtDiscipline,
  SelfAssessmentStatus,
  MeetsStandard,
  SiteAssessmentStatus,
  ReportType,
  CredentialingOutcome,
  TypingLevel,
  TeamMemberCertificationStatus,
} from './enums';

/** tc_engagements — 12 columns */
export interface TcEngagement {
  id: string;
  organization_id: string;
  contracting_agency_id: string;
  team_type_id: string | null;
  discipline: SrtDiscipline;
  team_name: string | null;
  team_size: number | null;
  engagement_status: EngagementStatus;
  quoted_price: number | null;
  contract_reference: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

/** tc_self_assessments — 9 columns */
export interface TcSelfAssessment {
  id: string;
  engagement_id: string;
  sent_at: string | null;
  due_date: string | null;
  received_at: string | null;
  reviewed_by: string | null;
  review_notes: string | null;
  status: SelfAssessmentStatus;
  created_at: string;
  updated_at: string;
}

/** tc_sa_sections — 8 columns */
export interface TcSaSection {
  id: string;
  self_assessment_id: string;
  section_number: number;
  section_title: string;
  self_score: number | null;
  meets_standard: MeetsStandard | null;
  narrative: string | null;
  form_data: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

/** tc_site_assessments — 11 columns */
export interface TcSiteAssessment {
  id: string;
  engagement_id: string;
  scheduled_date: string | null;
  location_address: string | null;
  location_city: string | null;
  location_state: string | null;
  lead_assessor_id: string | null;
  assessor_ids: string[];
  status: SiteAssessmentStatus;
  observations: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

/** tc_reports — 24 columns */
export interface TcReport {
  id: string;
  engagement_id: string;
  report_type: ReportType;
  document_id: string | null;
  credentialing_outcome: CredentialingOutcome | null;
  typing_level: TypingLevel | null;
  assessment_date: string | null;
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
  delivered_at: string | null;
  created_at: string;
}

/** tc_report_sections — 8 columns */
export interface TcReportSection {
  id: string;
  report_id: string;
  section_number: number;
  section_title: string;
  meets_standard: MeetsStandard | null;
  score: number | null;
  assessor_observations: string | null;
  assessor_recommendations: string | null;
  created_at: string;
  updated_at: string;
}

/** tc_team_members — 6 columns */
export interface TcTeamMember {
  id: string;
  engagement_id: string;
  user_id: string;
  role_on_team: string | null;
  certification_status: TeamMemberCertificationStatus;
  certification_id: string | null;
  created_at: string;
}
