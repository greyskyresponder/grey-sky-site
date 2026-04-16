-- GSR-DOC-400/401/402/403: Public token views with joined deployment summary.
-- Anon users hit these from /validate/[token] and /evaluate/[token] — RLS blocks
-- direct access to deployment_records/users/incidents/positions, so SECURITY DEFINER
-- functions return only the sanitized fields the external responder needs.

CREATE OR REPLACE FUNCTION get_validation_token_view(p_token UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result JSON;
BEGIN
  SELECT json_build_object(
    'request', json_build_object(
      'id', vr.id,
      'status', vr.status,
      'validator_email', vr.validator_email,
      'validator_name', vr.validator_name,
      'expires_at', vr.expires_at,
      'responded_at', vr.responded_at
    ),
    'deployment', json_build_object(
      'id', dr.id,
      'start_date', dr.start_date,
      'end_date', dr.end_date,
      'position_title', p.title,
      'agency', o.name
    ),
    'member', json_build_object(
      'first_name', u.first_name,
      'last_name', u.last_name
    ),
    'incident', CASE WHEN i.id IS NULL THEN NULL ELSE json_build_object(
      'id', i.id,
      'name', i.name,
      'type', i.type,
      'state', i.state
    ) END
  ) INTO v_result
  FROM validation_requests vr
  JOIN deployment_records dr ON dr.id = vr.deployment_record_id
  JOIN users u ON u.id = vr.requestor_id
  LEFT JOIN positions p ON p.id = dr.position_id
  LEFT JOIN organizations o ON o.id = dr.org_id
  LEFT JOIN incidents i ON i.id = dr.incident_id
  WHERE vr.token = p_token
    AND vr.status = 'pending'
    AND vr.expires_at > now();

  RETURN v_result;
END;
$$;

CREATE OR REPLACE FUNCTION get_evaluation_token_view(p_token UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result JSON;
BEGIN
  SELECT json_build_object(
    'request', json_build_object(
      'id', er.id,
      'status', er.status,
      'evaluator_email', er.evaluator_email,
      'evaluator_name', er.evaluator_name,
      'expires_at', er.expires_at,
      'responded_at', er.responded_at
    ),
    'deployment', json_build_object(
      'id', dr.id,
      'start_date', dr.start_date,
      'end_date', dr.end_date,
      'position_title', p.title,
      'agency', o.name
    ),
    'member', json_build_object(
      'first_name', u.first_name,
      'last_name', u.last_name
    ),
    'incident', CASE WHEN i.id IS NULL THEN NULL ELSE json_build_object(
      'id', i.id,
      'name', i.name,
      'type', i.type,
      'state', i.state
    ) END
  ) INTO v_result
  FROM evaluation_requests er
  JOIN deployment_records dr ON dr.id = er.deployment_record_id
  JOIN users u ON u.id = er.requestor_id
  LEFT JOIN positions p ON p.id = dr.position_id
  LEFT JOIN organizations o ON o.id = dr.org_id
  LEFT JOIN incidents i ON i.id = dr.incident_id
  WHERE er.token = p_token
    AND er.status = 'pending'
    AND er.expires_at > now();

  RETURN v_result;
END;
$$;

GRANT EXECUTE ON FUNCTION get_validation_token_view(UUID) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_evaluation_token_view(UUID) TO anon, authenticated;
