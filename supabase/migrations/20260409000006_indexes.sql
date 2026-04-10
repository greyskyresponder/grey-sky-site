-- Grey Sky Responder Society — Migration 6: Indexes
-- DOC-002 Section 7. All indexes grouped by entity group.

-- ── Group A: Users & Organizations ──────────────────────

CREATE INDEX idx_users_membership_status ON users(membership_status);
CREATE INDEX idx_users_status ON users(status);

CREATE INDEX idx_organizations_type ON organizations(type);
CREATE INDEX idx_organizations_state ON organizations(state);

CREATE INDEX idx_user_organizations_user_id ON user_organizations(user_id);
CREATE INDEX idx_user_organizations_org_id ON user_organizations(org_id);
CREATE UNIQUE INDEX idx_user_organizations_unique ON user_organizations(user_id, org_id);

CREATE INDEX idx_organization_sponsorships_org_id ON organization_sponsorships(org_id);
CREATE INDEX idx_organization_sponsorships_user_id ON organization_sponsorships(user_id)
  WHERE user_id IS NOT NULL;
CREATE INDEX idx_organization_sponsorships_engagement_id ON organization_sponsorships(engagement_id)
  WHERE engagement_id IS NOT NULL;

-- ── Group B: Incidents & Deployments ────────────────────

CREATE INDEX idx_incidents_type ON incidents(type);
CREATE INDEX idx_incidents_status ON incidents(status);
CREATE INDEX idx_incidents_fema_disaster_number ON incidents(fema_disaster_number)
  WHERE fema_disaster_number IS NOT NULL;

CREATE INDEX idx_positions_discipline ON positions(discipline);
CREATE INDEX idx_positions_rtlt_code ON positions(rtlt_code)
  WHERE rtlt_code IS NOT NULL;

CREATE INDEX idx_deployment_records_user_id ON deployment_records(user_id);
CREATE INDEX idx_deployment_records_incident_id ON deployment_records(incident_id);
CREATE INDEX idx_deployment_records_user_tier ON deployment_records(user_id, verification_tier);
CREATE INDEX idx_deployment_records_status ON deployment_records(status);

CREATE INDEX idx_validation_requests_deployment_id ON validation_requests(deployment_record_id);
CREATE INDEX idx_validation_requests_requestor_id ON validation_requests(requestor_id);
CREATE INDEX idx_validation_requests_status ON validation_requests(status)
  WHERE status = 'pending';

CREATE INDEX idx_evaluation_requests_deployment_id ON evaluation_requests(deployment_record_id);
CREATE INDEX idx_evaluation_requests_requestor_id ON evaluation_requests(requestor_id);
CREATE INDEX idx_evaluation_requests_status ON evaluation_requests(status)
  WHERE status = 'pending';

-- ── Group C: Economy ────────────────────────────────────

CREATE INDEX idx_sky_points_ledger_user_id ON sky_points_ledger(user_id);
CREATE INDEX idx_sky_points_ledger_user_created ON sky_points_ledger(user_id, created_at);

-- ── Group D: Documents & Certifications ─────────────────

CREATE INDEX idx_documents_user_id ON documents(user_id);
CREATE INDEX idx_documents_org_id ON documents(org_id)
  WHERE org_id IS NOT NULL;
CREATE INDEX idx_documents_category ON documents(category);
CREATE INDEX idx_documents_linked ON documents(linked_record_type, linked_record_id)
  WHERE linked_record_id IS NOT NULL;

CREATE INDEX idx_user_certifications_user_id ON user_certifications(user_id);
CREATE INDEX idx_user_certifications_pathway_id ON user_certifications(pathway_id);
CREATE INDEX idx_user_certifications_status ON user_certifications(status);
CREATE INDEX idx_user_certifications_engagement_id ON user_certifications(engagement_id)
  WHERE engagement_id IS NOT NULL;

-- ── Group E: Team Credentialing ─────────────────────────

CREATE INDEX idx_tc_engagements_org_id ON tc_engagements(organization_id);
CREATE INDEX idx_tc_engagements_contracting ON tc_engagements(contracting_agency_id);
CREATE INDEX idx_tc_engagements_org_contracting_discipline ON tc_engagements(organization_id, contracting_agency_id, discipline);
CREATE INDEX idx_tc_engagements_status ON tc_engagements(engagement_status);
CREATE INDEX idx_tc_engagements_team_type ON tc_engagements(team_type_id)
  WHERE team_type_id IS NOT NULL;

CREATE INDEX idx_tc_self_assessments_engagement_id ON tc_self_assessments(engagement_id);

CREATE INDEX idx_tc_sa_sections_self_assessment_id ON tc_sa_sections(self_assessment_id);
CREATE UNIQUE INDEX idx_tc_sa_sections_unique ON tc_sa_sections(self_assessment_id, section_number);

CREATE INDEX idx_tc_site_assessments_engagement_id ON tc_site_assessments(engagement_id);
CREATE INDEX idx_tc_site_assessments_lead ON tc_site_assessments(lead_assessor_id)
  WHERE lead_assessor_id IS NOT NULL;

CREATE INDEX idx_tc_reports_engagement_id ON tc_reports(engagement_id);
CREATE INDEX idx_tc_reports_type ON tc_reports(report_type);

CREATE INDEX idx_tc_report_sections_report_id ON tc_report_sections(report_id);
CREATE UNIQUE INDEX idx_tc_report_sections_unique ON tc_report_sections(report_id, section_number);

CREATE INDEX idx_tc_team_members_engagement_id ON tc_team_members(engagement_id);
CREATE INDEX idx_tc_team_members_user_id ON tc_team_members(user_id);
CREATE UNIQUE INDEX idx_tc_team_members_unique ON tc_team_members(engagement_id, user_id);

-- ── Group F: Community & Taxonomy ───────────────────────

CREATE INDEX idx_affinities_category ON affinities(category);
CREATE UNIQUE INDEX idx_affinities_category_value ON affinities(category, value);

CREATE INDEX idx_user_affinities_affinity_id ON user_affinities(affinity_id);

CREATE INDEX idx_rtlt_team_types_discipline ON rtlt_team_types(discipline);

-- ── Group G: Audit ──────────────────────────────────────

CREATE INDEX idx_audit_log_entity ON audit_log(entity_type, entity_id);
CREATE INDEX idx_audit_log_actor_created ON audit_log(actor_id, created_at);
CREATE INDEX idx_audit_log_action ON audit_log(action);
