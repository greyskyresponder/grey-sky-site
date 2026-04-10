-- Grey Sky Responder Society — Migration 7: Triggers
-- DOC-002 Section 8. Five trigger groups.

-- ── 7a: Append-only sky_points_ledger ───────────────────

CREATE OR REPLACE FUNCTION prevent_sky_points_mutation()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'sky_points_ledger is append-only. UPDATE and DELETE are prohibited.';
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_sky_points_no_update
  BEFORE UPDATE ON sky_points_ledger
  FOR EACH ROW EXECUTE FUNCTION prevent_sky_points_mutation();

CREATE TRIGGER trg_sky_points_no_delete
  BEFORE DELETE ON sky_points_ledger
  FOR EACH ROW EXECUTE FUNCTION prevent_sky_points_mutation();

-- ── 7b: Append-only audit_log ───────────────────────────

CREATE OR REPLACE FUNCTION prevent_audit_log_mutation()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'audit_log is append-only. UPDATE and DELETE are prohibited.';
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_audit_log_no_update
  BEFORE UPDATE ON audit_log
  FOR EACH ROW EXECUTE FUNCTION prevent_audit_log_mutation();

CREATE TRIGGER trg_audit_log_no_delete
  BEFORE DELETE ON audit_log
  FOR EACH ROW EXECUTE FUNCTION prevent_audit_log_mutation();

-- ── 7c: Auth sync — create public.users on signup ───────

CREATE OR REPLACE FUNCTION handle_new_auth_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, email, password_hash, first_name, last_name)
  VALUES (
    NEW.id,
    NEW.email,
    '', -- password managed by Supabase Auth, not stored in public.users
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_auth_user();

-- ── 7d: updated_at auto-trigger ─────────────────────────

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_organizations_updated_at
  BEFORE UPDATE ON organizations
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_user_organizations_updated_at
  BEFORE UPDATE ON user_organizations
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_organization_sponsorships_updated_at
  BEFORE UPDATE ON organization_sponsorships
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_deployment_records_updated_at
  BEFORE UPDATE ON deployment_records
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_tc_engagements_updated_at
  BEFORE UPDATE ON tc_engagements
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_tc_self_assessments_updated_at
  BEFORE UPDATE ON tc_self_assessments
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_tc_sa_sections_updated_at
  BEFORE UPDATE ON tc_sa_sections
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_tc_site_assessments_updated_at
  BEFORE UPDATE ON tc_site_assessments
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_tc_report_sections_updated_at
  BEFORE UPDATE ON tc_report_sections
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ── 7e: Balance verification on sky_points_ledger INSERT ─

CREATE OR REPLACE FUNCTION verify_sky_points_balance()
RETURNS TRIGGER AS $$
DECLARE
  last_balance INTEGER;
BEGIN
  SELECT balance_after INTO last_balance
  FROM sky_points_ledger
  WHERE user_id = NEW.user_id
  ORDER BY created_at DESC
  LIMIT 1;

  -- First transaction for this user
  IF last_balance IS NULL THEN
    IF NEW.balance_after != NEW.amount THEN
      RAISE EXCEPTION 'First transaction balance_after (%) must equal amount (%)', NEW.balance_after, NEW.amount;
    END IF;
  ELSE
    IF NEW.balance_after != last_balance + NEW.amount THEN
      RAISE EXCEPTION 'balance_after (%) must equal previous balance (%) + amount (%)',
        NEW.balance_after, last_balance, NEW.amount;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_sky_points_verify_balance
  BEFORE INSERT ON sky_points_ledger
  FOR EACH ROW EXECUTE FUNCTION verify_sky_points_balance();
