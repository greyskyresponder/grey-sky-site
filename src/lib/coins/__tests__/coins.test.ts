import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createMockSupabaseClient, type MockSupabaseClient } from '@/test/utils/supabase-mock';
import {
  mockCoinAccountRow,
  mockFrozenAccountRow,
  mockLowBalanceAccountRow,
  mockProductRow,
  mockExpensiveProductRow,
} from '@/test/utils/coin-helpers';

let mockSupabase: MockSupabaseClient;

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(async () => mockSupabase.client),
}));

beforeEach(() => {
  mockSupabase = createMockSupabaseClient();
  vi.resetModules();
});

const USER_ID = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';

describe('getBalance', () => {
  it('should return balance for authenticated user', async () => {
    mockSupabase.setFromResolution('coin_accounts', {
      data: mockCoinAccountRow,
      error: null,
    });

    const { getBalance } = await import('@/lib/coins/actions');
    const balance = await getBalance(USER_ID);

    expect(balance).toEqual({
      balance: 1000,
      lifetimeEarned: 1000,
      lifetimeSpent: 0,
      frozen: false,
    });
  });

  it('should return default values when account does not exist', async () => {
    mockSupabase.setFromResolution('coin_accounts', {
      data: null,
      error: { message: 'No rows' },
    });

    const { getBalance } = await import('@/lib/coins/actions');
    const balance = await getBalance(USER_ID);

    expect(balance).toEqual({
      balance: 0,
      lifetimeEarned: 0,
      lifetimeSpent: 0,
      frozen: false,
    });
  });
});

describe('spendCoins', () => {
  it('should succeed when balance is sufficient', async () => {
    mockSupabase.setFromResolution('coin_products', {
      data: mockProductRow,
      error: null,
    });
    // spend_coins RPC returns true; then getBalance looks up account again.
    mockSupabase.setRpcResolution('spend_coins', { data: true, error: null });
    mockSupabase.setFromResolution('coin_accounts', {
      data: { ...mockCoinAccountRow, balance: 900 },
      error: null,
    });

    const { spendCoins } = await import('@/lib/coins/actions');
    const res = await spendCoins(USER_ID, 'validation_request');

    expect(res.success).toBe(true);
    expect(res.newBalance).toBe(900);
    expect(mockSupabase.rpc).toHaveBeenCalledWith(
      'spend_coins',
      expect.objectContaining({
        p_user_id: USER_ID,
        p_amount: 100,
        p_product_code: 'validation_request',
      }),
    );
  });

  it('should fail with shortfall message when balance is insufficient', async () => {
    mockSupabase.setFromResolution('coin_products', {
      data: mockExpensiveProductRow, // cost 5000
      error: null,
    });
    // spend_coins returns false (insufficient)
    mockSupabase.setRpcResolution('spend_coins', { data: false, error: null });
    mockSupabase.setFromResolution('coin_accounts', {
      data: mockLowBalanceAccountRow, // balance 50
      error: null,
    });

    const { spendCoins } = await import('@/lib/coins/actions');
    const res = await spendCoins(USER_ID, 'certification_standard');

    expect(res.success).toBe(false);
    // shortfall = 5000 - 50 = 4,950
    expect(res.error).toContain('4,950');
    expect(res.error).toMatch(/more Sky Coins/);
  });

  it('should fail with frozen-account message when account is frozen', async () => {
    mockSupabase.setFromResolution('coin_products', {
      data: mockProductRow,
      error: null,
    });
    mockSupabase.setRpcResolution('spend_coins', { data: false, error: null });
    mockSupabase.setFromResolution('coin_accounts', {
      data: mockFrozenAccountRow,
      error: null,
    });

    const { spendCoins } = await import('@/lib/coins/actions');
    const res = await spendCoins(USER_ID, 'validation_request');

    expect(res.success).toBe(false);
    expect(res.error).toMatch(/membership is inactive/i);
  });

  it('should look up product price at transaction time (not caller-supplied)', async () => {
    mockSupabase.setFromResolution('coin_products', {
      data: mockProductRow,
      error: null,
    });
    mockSupabase.setRpcResolution('spend_coins', { data: true, error: null });
    mockSupabase.setFromResolution('coin_accounts', {
      data: mockCoinAccountRow,
      error: null,
    });

    const { spendCoins } = await import('@/lib/coins/actions');
    await spendCoins(USER_ID, 'validation_request');

    // The product lookup table must be queried before the spend RPC fires.
    expect(mockSupabase.from).toHaveBeenCalledWith('coin_products');
    expect(mockSupabase.rpc).toHaveBeenCalledWith(
      'spend_coins',
      expect.objectContaining({ p_amount: 100 }),
    );
  });

  it('should return Product not found error when product is missing or inactive', async () => {
    mockSupabase.setFromResolution('coin_products', {
      data: null,
      error: { message: 'No rows' },
    });

    const { spendCoins } = await import('@/lib/coins/actions');
    const res = await spendCoins(USER_ID, 'nonexistent_product');

    expect(res.success).toBe(false);
    expect(res.error).toMatch(/not found|inactive/i);
    expect(mockSupabase.rpc).not.toHaveBeenCalled();
  });

  it('should short-circuit without RPC when product cost is 0', async () => {
    mockSupabase.setFromResolution('coin_products', {
      data: { ...mockProductRow, cost_coins: 0 },
      error: null,
    });

    const { spendCoins } = await import('@/lib/coins/actions');
    const res = await spendCoins(USER_ID, 'free_product');

    expect(res.success).toBe(true);
    expect(mockSupabase.rpc).not.toHaveBeenCalled();
  });
});

describe('creditCoins', () => {
  it('should call credit_coins RPC with correct arguments', async () => {
    mockSupabase.setRpcResolution('credit_coins', { data: true, error: null });

    const { creditCoins } = await import('@/lib/coins/actions');
    const res = await creditCoins(
      USER_ID,
      1000,
      'membership_grant',
      undefined,
      undefined,
      'Annual membership',
    );

    expect(res).toEqual({ success: true });
    expect(mockSupabase.rpc).toHaveBeenCalledWith(
      'credit_coins',
      expect.objectContaining({
        p_user_id: USER_ID,
        p_amount: 1000,
        p_type: 'membership_grant',
        p_description: 'Annual membership',
      }),
    );
  });

  it('should return failure when RPC errors', async () => {
    mockSupabase.setRpcResolution('credit_coins', {
      data: null,
      error: { message: 'Account not found' },
    });

    const { creditCoins } = await import('@/lib/coins/actions');
    const res = await creditCoins(USER_ID, 100, 'admin_adjustment');

    expect(res).toEqual({ success: false });
  });
});

describe('getProducts', () => {
  it('should return active products mapped to camelCase', async () => {
    mockSupabase.setFromResolution('coin_products', {
      data: [mockProductRow, mockExpensiveProductRow],
      error: null,
    });

    const { getProducts } = await import('@/lib/coins/actions');
    const products = await getProducts();

    expect(products).toHaveLength(2);
    expect(products[0]).toMatchObject({
      code: 'validation_request',
      costCoins: 100,
      isActive: true,
    });
    expect(products[1].costCoins).toBe(5000);
  });

  it('should filter products by category when supplied', async () => {
    mockSupabase.setFromResolution('coin_products', {
      data: [mockExpensiveProductRow],
      error: null,
    });

    const { getProducts } = await import('@/lib/coins/actions');
    const products = await getProducts('certification');

    const builder = mockSupabase.getFromBuilder('coin_products');
    // category filter should have been applied
    const eqCalls = builder.eq.mock.calls.map((c) => c[0]);
    expect(eqCalls).toContain('category');
    expect(products).toHaveLength(1);
    expect(products[0].category).toBe('certification');
  });

  it('should return empty array when query errors', async () => {
    mockSupabase.setFromResolution('coin_products', {
      data: null,
      error: { message: 'fail' },
    });

    const { getProducts } = await import('@/lib/coins/actions');
    const products = await getProducts();

    expect(products).toEqual([]);
  });
});
