-- GSR-DOC-901: Security Patch
-- Part A: Drop password_hash from public.users (Supabase Auth owns passwords)
-- Part B: Tighten validation/evaluation RLS + token-verification SECURITY DEFINER fns
-- Part C: Dashboard stats function (replaces service_role admin client usage)

-- ─────────────────────────────────────────────────────────────
-- Part A: password_hash removal
-- ─────────────────────────────────────────────────────────────

-- Rewrite auth sync trigger first so the column drop can't race an INSERT.
CREATE OR REPLACE FUNCTION handle_new_auth_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, email, first_name, last_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

ALTER TABLE public.users DROP COLUMN IF EXISTS password_hash;

-- ─────────────────────────────────────────────────────────────
-- Part B: Validation/evaluation RLS tightening
-- ─────────────────────────────────────────────────────────────

-- Drop the overly permissive token policies. Existing _own and _admin
-- policies (from 20260409000008_rls_policies.sql) remain in place.
DROP POLICY IF EXISTS validation_select_by_token ON validation_requests;
DROP POLICY IF EXISTS validation_update_by_token ON validation_requests;
DROP POLICY IF EXISTS evaluation_select_by_token ON evaluation_requests;
DROP POLICY IF EXISTS evaluation_update_by_token ON evaluation_requests;

-- Token-based public access goes through SECURITY DEFINER functions only.
REVOKE ALL ON validation_requests FROM anon;
REVOKE ALL ON evaluation_requests FROM anon;

-- ── Validation: token read ──
CREATE OR REPLACE FUNCTION get_validation_by_token(p_token UUID)
RETURNS SETOF validation_requests
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT * FROM validation_requests
  WHERE token = p_token
    AND status = 'pending'
    AND expires_at > now();
$$;

-- ── Validation: token submit ──
CREATE OR REPLACE FUNCTION submit_validation_response(
  p_token UUID,
  p_status TEXT,
  p_response_text TEXT DEFAULT NULL,
  p_attestation_accepted BOOLEAN DEFAULT FALSE
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_request validation_requests;
BEGIN
  IF p_status NOT IN ('confirmed', 'denied') THEN
    RETURN FALSE;
  END IF;

  SELECT * INTO v_request
  FROM validation_requests
  WHERE token = p_token
    AND status = 'pending'
    AND expires_at > now()
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;

  UPDATE validation_requests SET
    status = p_status::validation_request_status_enum,
    response_text = p_response_text,
    attestation_accepted = p_attestation_accepted,
    responded_at = now()
  WHERE id = v_request.id;

  RETURN TRUE;
END;
$$;

-- ── Evaluation: token read ──
CREATE OR REPLACE FUNCTION get_evaluation_by_token(p_token UUID)
RETURNS SETOF evaluation_requests
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT * FROM evaluation_requests
  WHERE token = p_token
    AND status = 'pending'
    AND expires_at > now();
$$;

-- ── Evaluation: token submit ──
CREATE OR REPLACE FUNCTION submit_evaluation_response(
  p_token UUID,
  p_status TEXT,
  p_rating_leadership INTEGER DEFAULT NULL,
  p_rating_tactical INTEGER DEFAULT NULL,
  p_rating_communication INTEGER DEFAULT NULL,
  p_rating_planning INTEGER DEFAULT NULL,
  p_rating_technical INTEGER DEFAULT NULL,
  p_overall_rating NUMERIC DEFAULT NULL,
  p_commentary TEXT DEFAULT NULL,
  p_attestation_accepted BOOLEAN DEFAULT FALSE
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_request evaluation_requests;
BEGIN
  IF p_status NOT IN ('completed', 'denied') THEN
    RETURN FALSE;
  END IF;

  IF p_status = 'completed' THEN
    IF p_rating_leadership IS NULL OR p_rating_leadership < 1 OR p_rating_leadership > 5
      OR p_rating_tactical IS NULL OR p_rating_tactical < 1 OR p_rating_tactical > 5
      OR p_rating_communication IS NULL OR p_rating_communication < 1 OR p_rating_communication > 5
      OR p_rating_planning IS NULL OR p_rating_planning < 1 OR p_rating_planning > 5
      OR p_rating_technical IS NULL OR p_rating_technical < 1 OR p_rating_technical > 5
    THEN
      RETURN FALSE;
    END IF;
  END IF;

  SELECT * INTO v_request
  FROM evaluation_requests
  WHERE token = p_token
    AND status = 'pending'
    AND expires_at > now()
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;

  UPDATE evaluation_requests SET
    status = p_status::evaluation_request_status_enum,
    rating_leadership = p_rating_leadership,
    rating_tactical = p_rating_tactical,
    rating_communication = p_rating_communication,
    rating_planning = p_rating_planning,
    rating_technical = p_rating_technical,
    overall_rating = p_overall_rating,
    commentary = p_commentary,
    attestation_accepted = p_attestation_accepted,
    responded_at = now()
  WHERE id = v_request.id;

  RETURN TRUE;
END;
$$;

GRANT EXECUTE ON FUNCTION get_validation_by_token(UUID) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION submit_validation_response(UUID, TEXT, TEXT, BOOLEAN) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_evaluation_by_token(UUID) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION submit_evaluation_response(UUID, TEXT, INTEGER, INTEGER, INTEGER, INTEGER, INTEGER, NUMERIC, TEXT, BOOLEAN) TO anon, authenticated;

-- ─────────────────────────────────────────────────────────────
-- Part C: Dashboard stats function (scoped SECURITY DEFINER)
-- ─────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION get_dashboard_stats(p_user_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result JSON;
BEGIN
  IF p_user_id != auth.uid() THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  SELECT json_build_object(
    'deployment_count', (SELECT count(*) FROM deployment_records WHERE user_id = p_user_id),
    'incident_count', (SELECT count(DISTINCT incident_id) FROM deployment_records WHERE user_id = p_user_id),
    'document_count', (SELECT count(*) FROM documents WHERE user_id = p_user_id),
    'pending_validations', (SELECT count(*) FROM validation_requests WHERE requestor_id = p_user_id AND status = 'pending'),
    'pending_evaluations', (SELECT count(*) FROM evaluation_requests WHERE requestor_id = p_user_id AND status = 'pending'),
    'profile_completeness', (SELECT profile_completeness FROM users WHERE id = p_user_id),
    'membership_status', (SELECT membership_status FROM users WHERE id = p_user_id),
    'membership_expires_at', (SELECT membership_expires_at FROM users WHERE id = p_user_id)
  ) INTO v_result;

  RETURN v_result;
END;
$$;

GRANT EXECUTE ON FUNCTION get_dashboard_stats(UUID) TO authenticated;
