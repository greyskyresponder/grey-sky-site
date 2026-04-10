// ---------- User & Auth ----------
export const USER_ROLES = ["member", "staff", "admin"] as const;
export type UserRole = (typeof USER_ROLES)[number];
export const USER_ROLE_LABELS: Record<UserRole, string> = {
  member: "Member",
  staff: "Staff",
  admin: "Administrator",
};

export const MEMBERSHIP_STATUSES = ["active", "expired", "none"] as const;
export type MembershipStatus = (typeof MEMBERSHIP_STATUSES)[number];
export const MEMBERSHIP_STATUS_LABELS: Record<MembershipStatus, string> = {
  active: "Active",
  expired: "Expired",
  none: "None",
};

export const USER_STATUSES = ["active", "suspended", "deactivated"] as const;

// ---------- Organizations ----------
export const ORGANIZATION_TYPES = [
  "state_agency",
  "county_agency",
  "city_agency",
  "fire_department",
  "sheriff",
  "private",
  "federal",
  "tribal",
] as const;
export type OrganizationType = (typeof ORGANIZATION_TYPES)[number];
export const ORGANIZATION_TYPE_LABELS: Record<OrganizationType, string> = {
  state_agency: "State Agency",
  county_agency: "County Agency",
  city_agency: "City Agency",
  fire_department: "Fire Department",
  sheriff: "Sheriff's Office",
  private: "Private Organization",
  federal: "Federal Agency",
  tribal: "Tribal Nation",
};

export const JURISDICTION_LEVELS = [
  "federal",
  "state",
  "county",
  "city",
  "district",
] as const;
export type JurisdictionLevel = (typeof JURISDICTION_LEVELS)[number];
export const JURISDICTION_LEVEL_LABELS: Record<JurisdictionLevel, string> = {
  federal: "Federal",
  state: "State",
  county: "County",
  city: "City / Municipality",
  district: "District",
};

// ---------- Deployments ----------
export const VERIFICATION_TIERS = [
  "self_certified",
  "validated_360",
  "evaluated_ics225",
] as const;
export type VerificationTier = (typeof VERIFICATION_TIERS)[number];
export const VERIFICATION_TIER_LABELS: Record<VerificationTier, string> = {
  self_certified: "Self-Certified",
  validated_360: "360 Validated",
  evaluated_ics225: "ICS-225 Evaluated",
};

export const INCIDENT_TYPES = [
  "disaster",
  "exercise",
  "planned_event",
  "training",
  "steady_state",
] as const;
export type IncidentType = (typeof INCIDENT_TYPES)[number];
export const INCIDENT_TYPE_LABELS: Record<IncidentType, string> = {
  disaster: "Disaster",
  exercise: "Exercise",
  planned_event: "Planned Event",
  training: "Training",
  steady_state: "Steady State",
};

export const NIMS_TYPES = [
  "type1",
  "type2",
  "type3",
  "type4",
  "type5",
] as const;
export type NimsType = (typeof NIMS_TYPES)[number];
export const NIMS_TYPE_LABELS: Record<NimsType, string> = {
  type1: "Type 1",
  type2: "Type 2",
  type3: "Type 3",
  type4: "Type 4",
  type5: "Type 5",
};

// ---------- Documents ----------
export const DOCUMENT_CATEGORIES = [
  "certificate",
  "license",
  "training_record",
  "assessment_report",
  "field_report",
  "self_assessment",
  "photo_id",
  "other",
] as const;
export type DocumentCategory = (typeof DOCUMENT_CATEGORIES)[number];
export const DOCUMENT_CATEGORY_LABELS: Record<DocumentCategory, string> = {
  certificate: "Certificate",
  license: "License",
  training_record: "Training Record",
  assessment_report: "Assessment Report",
  field_report: "Field Report",
  self_assessment: "Self-Assessment",
  photo_id: "Photo ID",
  other: "Other",
};

// ---------- SRT-CAP Engagements ----------
export const ENGAGEMENT_STATUSES = [
  "quoted",
  "contracted",
  "self_assessment_sent",
  "self_assessment_received",
  "assessment_scheduled",
  "assessment_complete",
  "field_report_delivered",
  "final_report_delivered",
  "closed",
] as const;
export type EngagementStatus = (typeof ENGAGEMENT_STATUSES)[number];
export const ENGAGEMENT_STATUS_LABELS: Record<EngagementStatus, string> = {
  quoted: "Quoted",
  contracted: "Contracted",
  self_assessment_sent: "Self-Assessment Sent",
  self_assessment_received: "Self-Assessment Received",
  assessment_scheduled: "Assessment Scheduled",
  assessment_complete: "Assessment Complete",
  field_report_delivered: "Field Report Delivered",
  final_report_delivered: "Final Report Delivered",
  closed: "Closed",
};

// ---------- Economy ----------
export const SKY_POINTS_TRANSACTION_TYPES = [
  "membership_credit",
  "purchase",
  "spend",
  "refund",
  "admin_adjustment",
  "sponsor_credit",
] as const;

// ---------- Community ----------
export const AFFINITY_CATEGORIES = [
  "hazard_type",
  "functional_specialty",
  "sector_experience",
  "srt_discipline",
] as const;
export type AffinityCategory = (typeof AFFINITY_CATEGORIES)[number];
export const AFFINITY_CATEGORY_LABELS: Record<AffinityCategory, string> = {
  hazard_type: "Hazard Type",
  functional_specialty: "Functional Specialty",
  sector_experience: "Sector Experience",
  srt_discipline: "SRT Discipline",
};

// ---------- Self-Assessment Sections (SRT-CAP) ----------
export const SA_SECTION_TITLES = [
  "1. Team Organization & Structure",
  "2. Operational Deployment History",
  "3. After Action Reports & Improvement Plans",
  "4. Standard Operating Procedures",
  "5. Staffing & Personnel",
  "6. Equipment & Cache Management",
  "7. Operational Capabilities",
  "8. Training Program",
  "9. Exercise Program",
  "10. Mutual Aid & Interoperability",
  "11. Administration & Finance",
] as const;
