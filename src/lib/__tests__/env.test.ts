import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// Snapshot the baseline test env so each case can mutate and restore freely.
const ORIGINAL_ENV: Record<string, string | undefined> = { ...process.env };

function resetEnv() {
  for (const key of Object.keys(process.env)) {
    if (!(key in ORIGINAL_ENV)) delete process.env[key];
  }
  for (const [key, value] of Object.entries(ORIGINAL_ENV)) {
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
}

describe('lib/env — validation', () => {
  beforeEach(() => {
    resetEnv();
    vi.resetModules();
  });

  afterEach(() => {
    resetEnv();
  });

  it('exports validated values when all required vars are present', async () => {
    const { env } = await import('@/lib/env');
    expect(env.NEXT_PUBLIC_SUPABASE_URL).toBe('https://test-project.supabase.co');
    expect(env.SUPABASE_SERVICE_ROLE_KEY).toMatch(/fake-service-role-key/);
    expect(env.STRIPE_SECRET_KEY).toBe('test_stripe_secret_key_placeholder');
    expect(env.STRIPE_WEBHOOK_SECRET).toBe('test_webhook_secret_placeholder');
    expect(env.STRIPE_MEMBERSHIP_PRICE_ID).toBe('price_test_placeholder');
    expect(env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY).toBe('pk_test_placeholder');
  });

  it('loads without throwing when an optional server var is absent (logs warning instead)', async () => {
    delete process.env.STRIPE_SECRET_KEY;
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const { env } = await import('@/lib/env');
    expect(env.STRIPE_SECRET_KEY).toBeUndefined();
    warn.mockRestore();
  });

  it('throws an error naming the missing var when a single public var is absent', async () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    await expect(import('@/lib/env')).rejects.toThrow(/NEXT_PUBLIC_SUPABASE_URL/);
  });

  it('loads gracefully with defaults when multiple optional server vars are absent', async () => {
    delete process.env.STRIPE_SECRET_KEY;
    delete process.env.STRIPE_WEBHOOK_SECRET;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;

    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const { env } = await import('@/lib/env');
    expect(env.STRIPE_SECRET_KEY).toBeUndefined();
    expect(env.STRIPE_WEBHOOK_SECRET).toBeUndefined();
    expect(env.SUPABASE_SERVICE_ROLE_KEY).toBeUndefined();
    warn.mockRestore();
  });

  it('rejects NEXT_PUBLIC_SUPABASE_URL that is not a valid URL', async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'not-a-url';
    await expect(import('@/lib/env')).rejects.toThrow(/NEXT_PUBLIC_SUPABASE_URL/);
  });

  it('applies defaults for optional vars with defaults', async () => {
    delete process.env.NEXT_PUBLIC_APP_URL;
    const { env } = await import('@/lib/env');
    expect(env.NEXT_PUBLIC_APP_URL).toBe('http://localhost:3000');
    expect(env.EMAIL_MODE).toBe('console');
    expect(env.STORAGE_MODE).toBe('supabase');
  });

  it("accepts 'disabled' as a valid EMAIL_MODE value", async () => {
    process.env.EMAIL_MODE = 'disabled';
    const { env } = await import('@/lib/env');
    expect(env.EMAIL_MODE).toBe('disabled');
  });
});
