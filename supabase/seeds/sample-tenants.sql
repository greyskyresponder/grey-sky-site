INSERT INTO tenants (id, name, slug, type, region, contact_email, contact_phone)
VALUES
  ('11111111-1111-4111-8111-111111111111', 'Florida DEM SRT-CAP', 'fl-dem', 'jurisdiction', 'FEMA Region 4', 'srtcap@floridadem.org', '+1-850-555-0100')
ON CONFLICT (id) DO NOTHING;

INSERT INTO tenants (id, name, slug, type, region, contact_email, contact_phone)
VALUES
  ('22222222-2222-4222-8222-222222222222', 'Grey Sky Internal Programs', 'grey-sky-internal', 'responder_hub', 'National', 'ops@greyskyresponder.com', '+1-850-555-0200')
ON CONFLICT (id) DO NOTHING;

INSERT INTO requirement_packs (id, discipline, version, title, notes)
VALUES
  ('33333333-3333-4333-8333-333333333333', 'USAR', '1.0', 'FL US&R Requirement Pack', 'Base RTLT pack for Florida US&R teams')
ON CONFLICT (id) DO NOTHING;

INSERT INTO requirements (id, discipline, code, title, description, requirement_type, currency_interval_days)
VALUES
  ('44444444-4444-4444-8444-444444444444', 'USAR', 'USAR-TRN-001', 'US&R Ops Course', 'FEMA US&R Operations course completion', 'training', 1460)
ON CONFLICT (id) DO NOTHING;

INSERT INTO programs (id, tenant_id, discipline, name, description, requirement_pack_id)
VALUES
  ('55555555-5555-4555-8555-555555555555', '11111111-1111-4111-8111-111111111111', 'USAR', 'FL US&R Task Force Program', 'Statewide US&R capability assessments', '33333333-3333-4333-8333-333333333333')
ON CONFLICT (id) DO NOTHING;

INSERT INTO teams (id, tenant_id, program_id, name, location_city, location_state, status, next_review_at)
VALUES
  ('66666666-6666-4666-8666-666666666666', '11111111-1111-4111-8111-111111111111', '55555555-5555-4555-8555-555555555555', 'FL-TF3', 'Miami', 'FL', 'scheduled', '2026-09-01T00:00:00Z')
ON CONFLICT (id) DO NOTHING;

INSERT INTO responders (id, tenant_id, primary_program_id, first_name, last_name, email, phone, primary_discipline, status)
VALUES
  ('77777777-7777-4777-8777-777777777777', '22222222-2222-4222-8222-222222222222', '55555555-5555-4555-8555-555555555555', 'Alex', 'Mercer', 'alex.mercer@greyskyresponder.com', '+1-850-555-0300', 'USAR', 'onboarding')
ON CONFLICT (id) DO NOTHING;

INSERT INTO responder_requirements (id, responder_id, requirement_id, status)
VALUES
  ('88888888-8888-4888-8888-888888888888', '77777777-7777-4777-8777-777777777777', '44444444-4444-4444-8444-444444444444', 'pending')
ON CONFLICT (id) DO NOTHING;
