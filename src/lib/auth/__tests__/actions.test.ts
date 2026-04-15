import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createMockSupabaseClient, type MockSupabaseClient } from '@/test/utils/supabase-mock';
import { buildFormData, mockAuthUser } from '@/test/utils/auth-helpers';

let mockSessionClient: MockSupabaseClient;
let mockAdminClient: MockSupabaseClient;
const redirectCalls: string[] = [];

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(async () => mockSessionClient.client),
}));

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: vi.fn(() => mockAdminClient.client),
}));

vi.mock('next/navigation', () => ({
  redirect: vi.fn((url: string) => {
    redirectCalls.push(url);
    throw new Error(`NEXT_REDIRECT:${url}`);
  }),
}));

async function catchRedirect<T>(fn: () => Promise<T>): Promise<{ result: T | undefined; redirectedTo: string | undefined }> {
  try {
    const result = await fn();
    return { result, redirectedTo: undefined };
  } catch (e) {
    const msg = (e as Error).message;
    if (msg.startsWith('NEXT_REDIRECT:')) {
      return { result: undefined, redirectedTo: msg.slice('NEXT_REDIRECT:'.length) };
    }
    throw e;
  }
}

beforeEach(() => {
  mockSessionClient = createMockSupabaseClient();
  mockAdminClient = createMockSupabaseClient();
  redirectCalls.length = 0;
});

describe('signUp — registration action', () => {
  it('should reject registration with invalid email format', async () => {
    const { signUp } = await import('@/app/(auth)/register/actions');
    const res = await signUp(buildFormData({
      email: 'not-an-email',
      password: 'correct-horse-battery',
      confirm_password: 'correct-horse-battery',
      first_name: 'Jane',
      last_name: 'Doe',
    }));
    expect(res).toEqual({ error: expect.stringMatching(/email/i) });
    expect(mockSessionClient.auth.signUp).not.toHaveBeenCalled();
  });

  it('should reject registration with password shorter than 12 characters', async () => {
    const { signUp } = await import('@/app/(auth)/register/actions');
    const res = await signUp(buildFormData({
      email: 'test@greysky.dev',
      password: 'short',
      confirm_password: 'short',
      first_name: 'Jane',
      last_name: 'Doe',
    }));
    expect(res).toEqual({ error: expect.stringMatching(/12 characters/) });
  });

  it('should reject mismatched passwords', async () => {
    const { signUp } = await import('@/app/(auth)/register/actions');
    const res = await signUp(buildFormData({
      email: 'test@greysky.dev',
      password: 'correct-horse-battery',
      confirm_password: 'different-password-12',
      first_name: 'Jane',
      last_name: 'Doe',
    }));
    expect(res).toEqual({ error: expect.stringMatching(/do not match/i) });
  });

  it('should call supabase.auth.signUp with valid credentials', async () => {
    mockSessionClient.auth.signUp.mockResolvedValueOnce({
      data: { user: mockAuthUser, session: null },
      error: null,
    } as any);

    const { signUp } = await import('@/app/(auth)/register/actions');
    await signUp(buildFormData({
      email: 'new@greysky.dev',
      password: 'correct-horse-battery',
      confirm_password: 'correct-horse-battery',
      first_name: 'Jane',
      last_name: 'Doe',
    }));

    expect(mockSessionClient.auth.signUp).toHaveBeenCalledWith({
      email: 'new@greysky.dev',
      password: 'correct-horse-battery',
      options: { data: { first_name: 'Jane', last_name: 'Doe' } },
    });
  });

  it('should return generic error message on signup failure', async () => {
    mockSessionClient.auth.signUp.mockResolvedValueOnce({
      data: { user: null, session: null },
      error: { message: 'User already registered' },
    } as any);

    const { signUp } = await import('@/app/(auth)/register/actions');
    const res = await signUp(buildFormData({
      email: 'existing@greysky.dev',
      password: 'correct-horse-battery',
      confirm_password: 'correct-horse-battery',
      first_name: 'Jane',
      last_name: 'Doe',
    }));

    // Generic error — does not leak "already registered" detail
    expect(res).toEqual({ error: 'Unable to create account. Please try again.' });
  });

  it('should respond identically when email is already in use (no user enumeration)', async () => {
    // Supabase returns an empty identities array when the email exists.
    mockSessionClient.auth.signUp.mockResolvedValueOnce({
      data: { user: { ...mockAuthUser, identities: [] }, session: null },
      error: null,
    } as any);

    const { signUp } = await import('@/app/(auth)/register/actions');
    const res = await signUp(buildFormData({
      email: 'existing@greysky.dev',
      password: 'correct-horse-battery',
      confirm_password: 'correct-horse-battery',
      first_name: 'Jane',
      last_name: 'Doe',
    }));

    expect(res).toEqual({ success: true, confirmEmail: true });
  });
});

describe('signIn — login action', () => {
  it('should call supabase.auth.signInWithPassword with credentials', async () => {
    const { signIn } = await import('@/app/(auth)/login/actions');
    await catchRedirect(() =>
      signIn(buildFormData({
        email: 'test@greysky.dev',
        password: 'correct-horse-battery',
      })),
    );

    expect(mockSessionClient.auth.signInWithPassword).toHaveBeenCalledWith({
      email: 'test@greysky.dev',
      password: 'correct-horse-battery',
    });
  });

  it('should return generic error on invalid credentials (no user enumeration)', async () => {
    mockSessionClient.auth.signInWithPassword.mockResolvedValueOnce({
      data: { user: null, session: null },
      error: { message: 'Invalid login credentials — user not found' },
    } as any);

    const { signIn } = await import('@/app/(auth)/login/actions');
    const res = await signIn(buildFormData({
      email: 'ghost@greysky.dev',
      password: 'whatever-password',
    }));

    // Error message is generic — does not differentiate "user not found" vs "wrong password"
    expect(res).toEqual({ error: 'Invalid email or password' });
  });

  it('should redirect to /dashboard on successful login', async () => {
    const { signIn } = await import('@/app/(auth)/login/actions');
    const { redirectedTo } = await catchRedirect(() =>
      signIn(buildFormData({
        email: 'test@greysky.dev',
        password: 'correct-horse-battery',
      })),
    );
    expect(redirectedTo).toBe('/dashboard');
  });

  it('should honor a safe relative redirectTo path', async () => {
    const { signIn } = await import('@/app/(auth)/login/actions');
    const { redirectedTo } = await catchRedirect(() =>
      signIn(
        buildFormData({
          email: 'test@greysky.dev',
          password: 'correct-horse-battery',
        }),
        '/dashboard/records',
      ),
    );
    expect(redirectedTo).toBe('/dashboard/records');
  });

  it('should reject protocol-relative redirect URLs (open-redirect prevention)', async () => {
    const { signIn } = await import('@/app/(auth)/login/actions');
    const { redirectedTo } = await catchRedirect(() =>
      signIn(
        buildFormData({
          email: 'test@greysky.dev',
          password: 'correct-horse-battery',
        }),
        '//evil.example.com/phishing',
      ),
    );
    expect(redirectedTo).toBe('/dashboard');
  });

  it('should reject absolute redirect URLs (open-redirect prevention)', async () => {
    const { signIn } = await import('@/app/(auth)/login/actions');
    const { redirectedTo } = await catchRedirect(() =>
      signIn(
        buildFormData({
          email: 'test@greysky.dev',
          password: 'correct-horse-battery',
        }),
        'https://evil.example.com/phishing',
      ),
    );
    expect(redirectedTo).toBe('/dashboard');
  });

  it('should return mfaRequired when AAL level requires upgrade', async () => {
    mockSessionClient.auth.mfa.getAuthenticatorAssuranceLevel.mockResolvedValueOnce({
      data: { currentLevel: 'aal1', nextLevel: 'aal2' },
      error: null,
    });

    const { signIn } = await import('@/app/(auth)/login/actions');
    const res = await signIn(buildFormData({
      email: 'test@greysky.dev',
      password: 'correct-horse-battery',
    }));

    expect(res).toEqual({ mfaRequired: true, redirectTo: '/dashboard' });
  });
});

describe('resetPassword — password reset request action', () => {
  it('should call supabase.auth.resetPasswordForEmail', async () => {
    const { resetPassword } = await import('@/app/(auth)/reset-password/actions');
    await resetPassword(buildFormData({ email: 'test@greysky.dev' }));
    expect(mockSessionClient.auth.resetPasswordForEmail).toHaveBeenCalledWith(
      'test@greysky.dev',
      expect.objectContaining({ redirectTo: expect.stringContaining('/reset-password') }),
    );
  });

  it('should return success even if email does not exist (no user enumeration)', async () => {
    // Even if Supabase silently fails (unknown email), action returns success.
    const { resetPassword } = await import('@/app/(auth)/reset-password/actions');
    const res = await resetPassword(buildFormData({ email: 'unknown@greysky.dev' }));
    expect(res).toEqual({ success: true });
  });

  it('should reject malformed email', async () => {
    const { resetPassword } = await import('@/app/(auth)/reset-password/actions');
    const res = await resetPassword(buildFormData({ email: 'not-an-email' }));
    expect(res).toEqual({ error: expect.stringMatching(/email/i) });
    expect(mockSessionClient.auth.resetPasswordForEmail).not.toHaveBeenCalled();
  });
});

describe('signOut — logout action', () => {
  it('should call supabase.auth.signOut and redirect to /', async () => {
    const { signOut } = await import('@/lib/auth/actions');
    const { redirectedTo } = await catchRedirect(() => signOut());
    expect(mockSessionClient.auth.signOut).toHaveBeenCalled();
    expect(redirectedTo).toBe('/');
  });
});
