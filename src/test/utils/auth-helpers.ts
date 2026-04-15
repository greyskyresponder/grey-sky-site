/**
 * Auth fixtures for testing server actions.
 */

export const mockAuthUser = {
  id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  email: 'test@greysky.dev',
  identities: [{ id: 'identity-1', user_id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' }],
};

export const mockProfile = {
  id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  email: 'test@greysky.dev',
  first_name: 'Test',
  last_name: 'Responder',
  role: 'member',
  membership_status: 'active',
  status: 'active',
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
};

/** Build a FormData with the provided fields. */
export function buildFormData(fields: Record<string, string>): FormData {
  const fd = new FormData();
  for (const [k, v] of Object.entries(fields)) fd.append(k, v);
  return fd;
}
