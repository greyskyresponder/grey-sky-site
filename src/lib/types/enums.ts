// Grey Sky Responder Society — TypeScript Enum Types
// Matches PostgreSQL enums from Migration 2 (DOC-002 Section 3)
// 30 enum types grouped by entity

// ── Group A: Users & Organizations ──────────────────────

/** A1: users.membership_status */
export type MembershipStatus = 'active' | 'expired' | 'none';

/** A2: users.membership_paid_by */
export type MembershipPaidBy = 'self' | 'organization';

/** A3: users.status */
export type UserStatus = 'active' | 'suspended' | 'deactivated';

/** A4: organizations.type */
export type OrganizationType =
  | 'state_agency'
  | 'county_agency'
  | 'city_agency'
  | 'fire_department'
  | 'sheriff'
  | 'private'
  | 'federal'
  | 'tribal';

/** A5: organizations.jurisdiction_level */
export type JurisdictionLevel = 'federal' | 'state' | 'county' | 'city' | 'district';

/** A6: organizations.status */
export type OrganizationStatus = 'active' | 'inactive';

/** A7: user_organizations.role */
export type UserOrgRole = 'member' | 'team_lead' | 'admin' | 'assessor';

// ── Group B: Incidents & Deployments ────────────────────

/** B1: incidents.incident_type (expanded in DOC-204) */
export type IncidentType =
  | 'natural_disaster'
  | 'technological'
  | 'human_caused'
  | 'biological'
  | 'planned_event'
  | 'exercise'
  | 'training'
  | 'steady_state'
  | 'disaster'; // legacy value from DOC-002

/** B2: incidents.status (expanded in DOC-204) */
export type IncidentStatus = 'active' | 'closed' | 'historical' | 'merged' | 'draft';

/** B2b: incidents.incident_scale (DOC-204) */
export type IncidentScale = 'local' | 'regional' | 'state' | 'multi_state' | 'national' | 'international';

/** B2c: incidents.source (DOC-204) */
export type IncidentSource = 'member_submitted' | 'staff_created' | 'atlas_enriched' | 'fema_imported' | 'seed_data';

/** B2d: incidents.verification_status (DOC-204) */
export type IncidentVerification = 'unverified' | 'staff_verified' | 'fema_matched' | 'authoritative';

/** B3: positions.nims_type */
export type NimsType = 'type1' | 'type2' | 'type3' | 'type4' | 'type5';

/** B4: deployment_records.verification_tier */
export type VerificationTier = 'self_certified' | 'validated_360' | 'evaluated_ics225';

/** B5: deployment_records.status */
export type DeploymentRecordStatus = 'draft' | 'submitted' | 'verified';

/** B8: deployment_records.operational_setting (ICS 222 Block 8) */
export type OperationalSetting = 'eoc' | 'icp' | 'fob' | 'boo' | 'field_staging' | 'jfo' | 'other';

/** B9: deployment_records.compensation_status (ICS 222 Block 13) */
export type CompensationStatus = 'paid' | 'volunteer' | 'mutual_aid' | 'other';

/** B6: validation_requests.status */
export type ValidationRequestStatus = 'pending' | 'confirmed' | 'denied' | 'expired';

/** B7: evaluation_requests.status */
export type EvaluationRequestStatus = 'pending' | 'completed' | 'denied' | 'expired';

// ── Group C: Economy & Documents ────────────────────────

/** C1: coin_transactions.type (DOC-205) */
export type CoinTransactionType =
  | 'membership_grant'
  | 'purchase'
  | 'spend'
  | 'earn_validation'
  | 'earn_evaluation'
  | 'earn_qrb_review'
  | 'refund'
  | 'admin_adjustment'
  | 'pending_transfer'
  | 'freeze'
  | 'unfreeze';

/** @deprecated Use CoinTransactionType — kept for migration compatibility */
export type SkyPointsTransactionType = CoinTransactionType;

/** C2: documents.category (expanded in DOC-206) */
export type DocumentCategory =
  | 'certification'
  | 'training'
  | 'deployment'
  | 'identification'
  | 'medical'
  | 'assessment'
  | 'correspondence'
  | 'membership'
  | 'avatar'
  | 'other'
  // Legacy values from DOC-002
  | 'certificate'
  | 'license'
  | 'training_record'
  | 'assessment_report'
  | 'field_report'
  | 'self_assessment'
  | 'photo_id';

/** C2b: documents.verification_status (DOC-206) */
export type DocumentVerificationStatus = 'uploaded' | 'reviewed' | 'verified' | 'rejected';

/** C2c: documents.status (DOC-206) */
export type DocumentStatus = 'active' | 'archived' | 'deleted';

/** C3: documents.upload_status */
export type UploadStatus = 'pending' | 'processed' | 'failed';

/** C4: certification_pathways.status */
export type CertificationPathwayStatus = 'active' | 'draft' | 'retired';

/** C5: user_certifications.status */
export type UserCertificationStatus =
  | 'in_progress'
  | 'pending_review'
  | 'certified'
  | 'expired'
  | 'revoked';

// ── Group D: Team Credentialing (tc_) ───────────────────

/** D1: tc_engagements.engagement_status */
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

/** D2: tc_engagements.discipline */
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

/** D3: tc_self_assessments.status */
export type SelfAssessmentStatus = 'pending' | 'sent' | 'received' | 'under_review' | 'reviewed';

/** D4: tc_sa_sections.meets_standard, tc_report_sections.meets_standard */
export type MeetsStandard = 'yes' | 'no' | 'na' | 'not_evident';

/** D5: tc_site_assessments.status */
export type SiteAssessmentStatus = 'scheduled' | 'in_progress' | 'complete' | 'cancelled';

/** D6: tc_reports.report_type */
export type ReportType = 'field_report' | 'final_report';

/** D7: tc_reports.credentialing_outcome */
export type CredentialingOutcome = 'credentialed' | 'not_credentialed' | 'conditional';

/** D8: tc_reports.typing_level */
export type TypingLevel = 'type1' | 'type2' | 'type3' | 'type4';

/** D9: tc_team_members.certification_status */
export type TeamMemberCertificationStatus = 'pending' | 'certified' | 'not_certified';

// ── Group E: Community & Audit ──────────────────────────

/** E1: affinities.category */
export type AffinityCategory = 'hazard_type' | 'functional_specialty' | 'sector_experience' | 'srt_discipline';

/** E2: audit_log.actor_type */
export type ActorType = 'user' | 'system' | 'admin';
