-- GSR-DOC-900: Security Hardening
-- Audit log hash chain (tamper evidence) + anomaly detection index.

-- ── Audit log hash chain ────────────────────────────────

ALTER TABLE audit_log ADD COLUMN IF NOT EXISTS previous_hash TEXT;
ALTER TABLE audit_log ADD COLUMN IF NOT EXISTS entry_hash TEXT;

CREATE OR REPLACE FUNCTION compute_audit_hash()
RETURNS TRIGGER AS $$
DECLARE
  v_previous_hash TEXT;
BEGIN
  SELECT entry_hash INTO v_previous_hash
  FROM audit_log
  ORDER BY created_at DESC, id DESC
  LIMIT 1;

  IF v_previous_hash IS NULL THEN
    v_previous_hash := 'GENESIS';
  END IF;

  NEW.previous_hash := v_previous_hash;
  NEW.entry_hash := encode(
    sha256(
      convert_to(
        v_previous_hash || '|' ||
        COALESCE(NEW.actor_id::text, 'system') || '|' ||
        NEW.action || '|' ||
        COALESCE(NEW.entity_type, '') || '|' ||
        COALESCE(NEW.entity_id::text, '') || '|' ||
        NEW.created_at::text,
        'UTF8'
      )
    ),
    'hex'
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS audit_log_hash_chain ON audit_log;
CREATE TRIGGER audit_log_hash_chain
  BEFORE INSERT ON audit_log
  FOR EACH ROW
  EXECUTE FUNCTION compute_audit_hash();

-- ── Anomaly detection index ─────────────────────────────

CREATE INDEX IF NOT EXISTS idx_audit_log_security
  ON audit_log(action)
  WHERE action = 'security_anomaly';
