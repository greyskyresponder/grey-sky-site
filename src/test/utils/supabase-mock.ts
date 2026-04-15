/**
 * Mock factory for Supabase client tests.
 *
 * Usage:
 *   const mock = createMockSupabaseClient();
 *   mock.setFromResolution('users', { data: [user], error: null });
 *   mock.setRpcResolution('spend_coins', { data: true, error: null });
 */
import { vi } from 'vitest';

type Resolution = { data: unknown; error: unknown };

export interface MockQueryBuilder {
  _resolution: Resolution;
  select: ReturnType<typeof vi.fn>;
  insert: ReturnType<typeof vi.fn>;
  update: ReturnType<typeof vi.fn>;
  delete: ReturnType<typeof vi.fn>;
  eq: ReturnType<typeof vi.fn>;
  neq: ReturnType<typeof vi.fn>;
  gt: ReturnType<typeof vi.fn>;
  lt: ReturnType<typeof vi.fn>;
  gte: ReturnType<typeof vi.fn>;
  lte: ReturnType<typeof vi.fn>;
  in: ReturnType<typeof vi.fn>;
  is: ReturnType<typeof vi.fn>;
  or: ReturnType<typeof vi.fn>;
  order: ReturnType<typeof vi.fn>;
  limit: ReturnType<typeof vi.fn>;
  range: ReturnType<typeof vi.fn>;
  single: ReturnType<typeof vi.fn>;
  maybeSingle: ReturnType<typeof vi.fn>;
  then: (onFulfilled?: (v: Resolution) => unknown, onRejected?: (e: unknown) => unknown) => Promise<unknown>;
}

function createQueryBuilder(): MockQueryBuilder {
  const builder = { _resolution: { data: null, error: null } } as MockQueryBuilder;
  const chainMethods = [
    'select', 'insert', 'update', 'delete',
    'eq', 'neq', 'gt', 'lt', 'gte', 'lte', 'in', 'is', 'or',
    'order', 'limit', 'range',
  ] as const;
  chainMethods.forEach((m) => {
    (builder as unknown as Record<string, ReturnType<typeof vi.fn>>)[m] = vi.fn(() => builder);
  });
  builder.single = vi.fn(() => Promise.resolve(builder._resolution));
  builder.maybeSingle = vi.fn(() => Promise.resolve(builder._resolution));
  builder.then = (onFulfilled, onRejected) =>
    Promise.resolve(builder._resolution).then(onFulfilled, onRejected);
  return builder;
}

export function createMockSupabaseClient() {
  const fromBuilders = new Map<string, MockQueryBuilder>();
  const rpcResolutions = new Map<string, Resolution>();

  const getFromBuilder = (table: string): MockQueryBuilder => {
    if (!fromBuilders.has(table)) fromBuilders.set(table, createQueryBuilder());
    return fromBuilders.get(table)!;
  };

  const rpc = vi.fn((fn: string) => {
    const res = rpcResolutions.get(fn) ?? { data: null, error: null };
    return Promise.resolve(res);
  });

  const from = vi.fn((table: string) => getFromBuilder(table));

  const auth = {
    signUp: vi.fn(async () => ({
      data: { user: null, session: null },
      error: null,
    })),
    signInWithPassword: vi.fn(async () => ({
      data: { user: null, session: null },
      error: null,
    })),
    signOut: vi.fn(async () => ({ error: null })),
    resetPasswordForEmail: vi.fn(async () => ({ data: {}, error: null })),
    updateUser: vi.fn(async () => ({ data: {}, error: null })),
    getUser: vi.fn(async () => ({ data: { user: null }, error: null })),
    getSession: vi.fn(async () => ({ data: { session: null }, error: null })),
    mfa: {
      getAuthenticatorAssuranceLevel: vi.fn(async () => ({
        data: { currentLevel: 'aal1', nextLevel: 'aal1' },
        error: null,
      })),
      enroll: vi.fn(),
      challenge: vi.fn(),
      verify: vi.fn(),
    },
  };

  const client = { from, rpc, auth };

  return {
    client,
    from,
    rpc,
    auth,
    /** Set the { data, error } resolution returned for any chain terminating on this table. */
    setFromResolution(table: string, resolution: Resolution) {
      getFromBuilder(table)._resolution = resolution;
    },
    getFromBuilder,
    /** Set the { data, error } resolution returned for an RPC call. */
    setRpcResolution(fn: string, resolution: Resolution) {
      rpcResolutions.set(fn, resolution);
    },
  };
}

export type MockSupabaseClient = ReturnType<typeof createMockSupabaseClient>;
