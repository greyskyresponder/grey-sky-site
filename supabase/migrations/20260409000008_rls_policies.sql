-- Grey Sky Responder Society — Migration 8: Row Level Security
-- DOC-002 Section 9. Enable RLS on all 24 tables. Helper functions + policies.

-- ── Enable RLS on all 24 tables ─────────────────────────

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_sponsorships ENABLE ROW LEVEL SECURITY;
ALTER TABLE incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE deployment_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE validation_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE evaluation_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE sky_points_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE certification_pathways ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE tc_engagements ENABLE ROW LEVEL SECURITY;
ALTER TABLE tc_self_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE tc_sa_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE tc_site_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE tc_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE tc_report_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE tc_team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE affinities ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_affinities ENABLE ROW LEVEL SECURITY;
ALTER TABLE rtlt_team_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- ── Helper Functions (public schema) ────────────────────
-- NOTE: Custom helpers MUST live in public, not auth.
-- Supabase reserves the auth schema; only auth.uid() / auth.jwt() are allowed.

CREATE OR REPLACE FUNCTION public.user_role()
RETURNS TEXT AS $$
  SELECT COALESCE(
    (auth.jwt() -> 'app_metadata' ->> 'role'),
    'member'
  );
$$ LANGUAGE sql STABLE;

CREATE OR REPLACE FUNCTION public.is_platform_admin()
RETURNS BOOLEAN AS $$
  SELECT public.user_role() = 'admin';
$$ LANGUAGE sql STABLE;

CREATE OR REPLACE FUNCTION public.is_org_admin(target_org_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_organizations
    WHERE user_id = auth.uid()
      AND org_id = target_org_id
      AND role IN ('admin', 'assessor')
  );
$$ LANGUAGE sql STABLE;

-- ── users ───────────────────────────────────────────────

CREATE POLICY users_select_own ON users
  FOR SELECT USING (id = auth.uid());

CREATE POLICY users_select_admin ON users
  FOR SELECT USING (public.is_platform_admin());

CREATE POLICY users_update_own ON users
  FOR UPDATE USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

CREATE POLICY users_update_admin ON users
  FOR UPDATE USING (public.is_platform_admin());

CREATE POLICY users_insert_auth ON users
  FOR INSERT WITH CHECK (id = auth.uid());

-- ── organizations ───────────────────────────────────────

CREATE POLICY organizations_select_all ON organizations
  FOR SELECT USING (true);

CREATE POLICY organizations_insert_admin ON organizations
  FOR INSERT WITH CHECK (public.is_platform_admin());

CREATE POLICY organizations_update_admin ON organizations
  FOR UPDATE USING (public.is_platform_admin());

-- ── user_organizations ──────────────────────────────────

CREATE POLICY user_orgs_select_own ON user_organizations
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY user_orgs_select_org_admin ON user_organizations
  FOR SELECT USING (public.is_org_admin(org_id));

CREATE POLICY user_orgs_select_platform_admin ON user_organizations
  FOR SELECT USING (public.is_platform_admin());

CREATE POLICY user_orgs_insert_admin ON user_organizations
  FOR INSERT WITH CHECK (public.is_platform_admin() OR public.is_org_admin(org_id));

CREATE POLICY user_orgs_update_admin ON user_organizations
  FOR UPDATE USING (public.is_platform_admin() OR public.is_org_admin(org_id));

CREATE POLICY user_orgs_delete_admin ON user_organizations
  FOR DELETE USING (public.is_platform_admin() OR public.is_org_admin(org_id));

-- ── organization_sponsorships ───────────────────────────

CREATE POLICY org_sponsorships_select_own ON organization_sponsorships
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY org_sponsorships_select_org_admin ON organization_sponsorships
  FOR SELECT USING (public.is_org_admin(org_id));

CREATE POLICY org_sponsorships_select_platform_admin ON organization_sponsorships
  FOR SELECT USING (public.is_platform_admin());

CREATE POLICY org_sponsorships_manage_admin ON organization_sponsorships
  FOR ALL USING (public.is_platform_admin());

-- ── incidents ───────────────────────────────────────────

CREATE POLICY incidents_select_all ON incidents
  FOR SELECT USING (true);

CREATE POLICY incidents_insert_authenticated ON incidents
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY incidents_update_admin ON incidents
  FOR UPDATE USING (public.is_platform_admin());

-- ── positions ───────────────────────────────────────────

CREATE POLICY positions_select_all ON positions
  FOR SELECT USING (true);

CREATE POLICY positions_manage_admin ON positions
  FOR ALL USING (public.is_platform_admin());

-- ── deployment_records ──────────────────────────────────

CREATE POLICY deployment_records_select_own ON deployment_records
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY deployment_records_select_admin ON deployment_records
  FOR SELECT USING (public.is_platform_admin());

CREATE POLICY deployment_records_insert_own ON deployment_records
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY deployment_records_update_own ON deployment_records
  FOR UPDATE USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY deployment_records_delete_own ON deployment_records
  FOR DELETE USING (user_id = auth.uid() AND status = 'draft');

-- ── validation_requests ─────────────────────────────────

CREATE POLICY validation_select_own ON validation_requests
  FOR SELECT USING (requestor_id = auth.uid());

CREATE POLICY validation_select_admin ON validation_requests
  FOR SELECT USING (public.is_platform_admin());

CREATE POLICY validation_insert_own ON validation_requests
  FOR INSERT WITH CHECK (requestor_id = auth.uid());

-- Public access for token-based validation response (no auth required)
CREATE POLICY validation_select_by_token ON validation_requests
  FOR SELECT USING (true);

CREATE POLICY validation_update_by_token ON validation_requests
  FOR UPDATE USING (true)
  WITH CHECK (status = 'pending');

-- ── evaluation_requests ─────────────────────────────────

CREATE POLICY evaluation_select_own ON evaluation_requests
  FOR SELECT USING (requestor_id = auth.uid());

CREATE POLICY evaluation_select_admin ON evaluation_requests
  FOR SELECT USING (public.is_platform_admin());

CREATE POLICY evaluation_insert_own ON evaluation_requests
  FOR INSERT WITH CHECK (requestor_id = auth.uid());

-- Public access for token-based evaluation response (no auth required)
CREATE POLICY evaluation_select_by_token ON evaluation_requests
  FOR SELECT USING (true);

CREATE POLICY evaluation_update_by_token ON evaluation_requests
  FOR UPDATE USING (true)
  WITH CHECK (status = 'pending');

-- ── sky_points_ledger ───────────────────────────────────

CREATE POLICY sky_points_select_own ON sky_points_ledger
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY sky_points_select_admin ON sky_points_ledger
  FOR SELECT USING (public.is_platform_admin());

CREATE POLICY sky_points_insert_system ON sky_points_ledger
  FOR INSERT WITH CHECK (public.is_platform_admin() OR public.user_role() = 'staff');

-- ── documents ───────────────────────────────────────────

CREATE POLICY documents_select_own ON documents
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY documents_select_org_admin ON documents
  FOR SELECT USING (org_id IS NOT NULL AND public.is_org_admin(org_id));

CREATE POLICY documents_select_admin ON documents
  FOR SELECT USING (public.is_platform_admin());

CREATE POLICY documents_insert_own ON documents
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY documents_update_own ON documents
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY documents_delete_own ON documents
  FOR DELETE USING (user_id = auth.uid());

-- ── certification_pathways ──────────────────────────────

CREATE POLICY pathways_select_all ON certification_pathways
  FOR SELECT USING (true);

CREATE POLICY pathways_manage_admin ON certification_pathways
  FOR ALL USING (public.is_platform_admin());

-- ── user_certifications ─────────────────────────────────

CREATE POLICY user_certs_select_own ON user_certifications
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY user_certs_select_admin ON user_certifications
  FOR SELECT USING (public.is_platform_admin());

CREATE POLICY user_certs_insert_system ON user_certifications
  FOR INSERT WITH CHECK (public.is_platform_admin() OR public.user_role() = 'staff');

CREATE POLICY user_certs_update_system ON user_certifications
  FOR UPDATE USING (public.is_platform_admin() OR public.user_role() = 'staff');

-- ── tc_engagements ──────────────────────────────────────

CREATE POLICY tc_engagements_select_org_admin ON tc_engagements
  FOR SELECT USING (
    public.is_org_admin(organization_id)
    OR public.is_org_admin(contracting_agency_id)
  );

CREATE POLICY tc_engagements_select_admin ON tc_engagements
  FOR SELECT USING (public.is_platform_admin());

CREATE POLICY tc_engagements_select_team_member ON tc_engagements
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM tc_team_members
      WHERE tc_team_members.engagement_id = tc_engagements.id
        AND tc_team_members.user_id = auth.uid()
    )
  );

CREATE POLICY tc_engagements_manage_admin ON tc_engagements
  FOR ALL USING (public.is_platform_admin());

-- ── tc_self_assessments ─────────────────────────────────

CREATE POLICY tc_sa_select_via_engagement ON tc_self_assessments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM tc_engagements e
      WHERE e.id = tc_self_assessments.engagement_id
        AND (public.is_org_admin(e.organization_id) OR public.is_org_admin(e.contracting_agency_id))
    )
  );

CREATE POLICY tc_sa_select_admin ON tc_self_assessments
  FOR SELECT USING (public.is_platform_admin());

CREATE POLICY tc_sa_manage_admin ON tc_self_assessments
  FOR ALL USING (public.is_platform_admin());

-- ── tc_sa_sections ──────────────────────────────────────

CREATE POLICY tc_sa_sections_select_via_sa ON tc_sa_sections
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM tc_self_assessments sa
      JOIN tc_engagements e ON e.id = sa.engagement_id
      WHERE sa.id = tc_sa_sections.self_assessment_id
        AND (public.is_org_admin(e.organization_id) OR public.is_org_admin(e.contracting_agency_id))
    )
  );

CREATE POLICY tc_sa_sections_select_admin ON tc_sa_sections
  FOR SELECT USING (public.is_platform_admin());

CREATE POLICY tc_sa_sections_manage_admin ON tc_sa_sections
  FOR ALL USING (public.is_platform_admin());

-- ── tc_site_assessments ─────────────────────────────────

CREATE POLICY tc_site_select_via_engagement ON tc_site_assessments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM tc_engagements e
      WHERE e.id = tc_site_assessments.engagement_id
        AND (public.is_org_admin(e.organization_id) OR public.is_org_admin(e.contracting_agency_id))
    )
  );

CREATE POLICY tc_site_select_assessor ON tc_site_assessments
  FOR SELECT USING (
    lead_assessor_id = auth.uid()
    OR auth.uid() = ANY(assessor_ids)
  );

CREATE POLICY tc_site_select_admin ON tc_site_assessments
  FOR SELECT USING (public.is_platform_admin());

CREATE POLICY tc_site_manage_admin ON tc_site_assessments
  FOR ALL USING (public.is_platform_admin());

-- ── tc_reports ──────────────────────────────────────────

CREATE POLICY tc_reports_select_via_engagement ON tc_reports
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM tc_engagements e
      WHERE e.id = tc_reports.engagement_id
        AND (public.is_org_admin(e.organization_id) OR public.is_org_admin(e.contracting_agency_id))
    )
  );

CREATE POLICY tc_reports_select_admin ON tc_reports
  FOR SELECT USING (public.is_platform_admin());

CREATE POLICY tc_reports_manage_admin ON tc_reports
  FOR ALL USING (public.is_platform_admin());

-- ── tc_report_sections ──────────────────────────────────

CREATE POLICY tc_report_sections_select_via_report ON tc_report_sections
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM tc_reports r
      JOIN tc_engagements e ON e.id = r.engagement_id
      WHERE r.id = tc_report_sections.report_id
        AND (public.is_org_admin(e.organization_id) OR public.is_org_admin(e.contracting_agency_id))
    )
  );

CREATE POLICY tc_report_sections_select_admin ON tc_report_sections
  FOR SELECT USING (public.is_platform_admin());

CREATE POLICY tc_report_sections_manage_admin ON tc_report_sections
  FOR ALL USING (public.is_platform_admin());

-- ── tc_team_members ─────────────────────────────────────

CREATE POLICY tc_team_members_select_own ON tc_team_members
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY tc_team_members_select_via_engagement ON tc_team_members
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM tc_engagements e
      WHERE e.id = tc_team_members.engagement_id
        AND (public.is_org_admin(e.organization_id) OR public.is_org_admin(e.contracting_agency_id))
    )
  );

CREATE POLICY tc_team_members_select_admin ON tc_team_members
  FOR SELECT USING (public.is_platform_admin());

CREATE POLICY tc_team_members_manage_admin ON tc_team_members
  FOR ALL USING (public.is_platform_admin());

-- ── affinities ──────────────────────────────────────────

CREATE POLICY affinities_select_all ON affinities
  FOR SELECT USING (true);

CREATE POLICY affinities_manage_admin ON affinities
  FOR ALL USING (public.is_platform_admin());

-- ── user_affinities ─────────────────────────────────────

CREATE POLICY user_affinities_select_own ON user_affinities
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY user_affinities_select_admin ON user_affinities
  FOR SELECT USING (public.is_platform_admin());

CREATE POLICY user_affinities_insert_own ON user_affinities
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY user_affinities_delete_own ON user_affinities
  FOR DELETE USING (user_id = auth.uid());

-- ── rtlt_team_types ─────────────────────────────────────

CREATE POLICY rtlt_team_types_select_all ON rtlt_team_types
  FOR SELECT USING (true);

CREATE POLICY rtlt_team_types_manage_admin ON rtlt_team_types
  FOR ALL USING (public.is_platform_admin());

-- ── audit_log ───────────────────────────────────────────

CREATE POLICY audit_log_select_admin ON audit_log
  FOR SELECT USING (public.is_platform_admin());

CREATE POLICY audit_log_insert_system ON audit_log
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL OR public.is_platform_admin());
