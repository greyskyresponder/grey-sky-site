import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createMockSupabaseClient, type MockSupabaseClient } from '@/test/utils/supabase-mock';
import {
  createCheckoutEvent,
  createCoinPurchaseCheckoutEvent,
  createRenewalInvoiceEvent,
  createSubscriptionUpdateEvent,
  buildWebhookRequest,
  createStripeEvent,
} from '@/test/utils/stripe-helpers';
import { mapStripeStatusToMembership } from '@/lib/stripe/membership';

let mockAdmin: MockSupabaseClient;
let constructEventImpl: (body: string, sig: string, secret: string) => unknown;

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: vi.fn(() => mockAdmin.client),
}));

vi.mock('@/lib/stripe/client', () => ({
  getStripe: vi.fn(() => ({
    webhooks: {
      constructEvent: (body: string, sig: string, secret: string) =>
        constructEventImpl(body, sig, secret),
    },
  })),
}));

beforeEach(() => {
  mockAdmin = createMockSupabaseClient();
  // Default: signature verification succeeds by parsing the body JSON.
  constructEventImpl = (body: string) => JSON.parse(body);
});

// Every valid webhook run looks up stripe_events first — default to "no duplicate".
function setNoDuplicateEvent() {
  mockAdmin.getFromBuilder('stripe_events').maybeSingle.mockResolvedValue({
    data: null,
    error: null,
  });
}

describe('POST /api/stripe/webhook — signature verification', () => {
  it('should return 400 when stripe-signature header is missing', async () => {
    const { POST } = await import('@/app/api/stripe/webhook/route');
    const request = buildWebhookRequest(createCheckoutEvent(), { signature: null });
    const response = await POST(request as unknown as import('next/server').NextRequest);
    expect(response.status).toBe(400);
  });

  it('should return 400 when signature verification throws', async () => {
    constructEventImpl = () => {
      throw new Error('Invalid signature');
    };
    const { POST } = await import('@/app/api/stripe/webhook/route');
    const request = buildWebhookRequest(createCheckoutEvent());
    const response = await POST(request as unknown as import('next/server').NextRequest);
    expect(response.status).toBe(400);
  });
});

describe('POST /api/stripe/webhook — idempotency', () => {
  it('should short-circuit with duplicate:true when stripe_events row exists', async () => {
    mockAdmin.getFromBuilder('stripe_events').maybeSingle.mockResolvedValue({
      data: { id: 'already-stored' },
      error: null,
    });

    const { POST } = await import('@/app/api/stripe/webhook/route');
    const request = buildWebhookRequest(createCheckoutEvent());
    const response = await POST(request as unknown as import('next/server').NextRequest);

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body).toEqual({ received: true, duplicate: true });
    // No credit_coins, no user update when deduped.
    expect(mockAdmin.rpc).not.toHaveBeenCalled();
  });
});

describe('POST /api/stripe/webhook — checkout.session.completed (membership)', () => {
  it('should activate membership and grant 1000 Sky Coins', async () => {
    setNoDuplicateEvent();
    const { POST } = await import('@/app/api/stripe/webhook/route');
    const request = buildWebhookRequest(createCheckoutEvent());

    const response = await POST(request as unknown as import('next/server').NextRequest);
    expect(response.status).toBe(200);

    // users table updated with active membership
    const usersBuilder = mockAdmin.getFromBuilder('users');
    expect(usersBuilder.update).toHaveBeenCalledWith(
      expect.objectContaining({
        membership_status: 'active',
        stripe_subscription_status: 'active',
      }),
    );

    // coin_accounts unfrozen
    const coinAccountsBuilder = mockAdmin.getFromBuilder('coin_accounts');
    expect(coinAccountsBuilder.update).toHaveBeenCalledWith({ frozen: false });

    // credit_coins called with 1000 coins
    expect(mockAdmin.rpc).toHaveBeenCalledWith(
      'credit_coins',
      expect.objectContaining({
        p_amount: 1000,
        p_type: 'membership_grant',
      }),
    );
  });

  it('should grant purchased coins on coin_purchase checkout', async () => {
    setNoDuplicateEvent();
    const { POST } = await import('@/app/api/stripe/webhook/route');
    const request = buildWebhookRequest(createCoinPurchaseCheckoutEvent());

    await POST(request as unknown as import('next/server').NextRequest);

    expect(mockAdmin.rpc).toHaveBeenCalledWith(
      'credit_coins',
      expect.objectContaining({
        p_amount: 500,
        p_type: 'purchase',
        p_product_code: 'pkg_500',
      }),
    );
  });

  it('should warn and skip when userId metadata is missing', async () => {
    setNoDuplicateEvent();
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const event = createCheckoutEvent({
      client_reference_id: null,
      metadata: { type: 'membership' },
    });
    const { POST } = await import('@/app/api/stripe/webhook/route');
    const response = await POST(
      buildWebhookRequest(event) as unknown as import('next/server').NextRequest,
    );

    expect(response.status).toBe(200);
    expect(warnSpy).toHaveBeenCalled();
    expect(mockAdmin.rpc).not.toHaveBeenCalled();
    warnSpy.mockRestore();
  });
});

describe('POST /api/stripe/webhook — invoice.payment_succeeded (renewal)', () => {
  it('should grant coins when last grant was >11 months ago', async () => {
    setNoDuplicateEvent();
    const oldGrantDate = new Date();
    oldGrantDate.setFullYear(oldGrantDate.getFullYear() - 1);

    // Users lookup by stripe_customer_id
    mockAdmin.getFromBuilder('users').single.mockResolvedValue({
      data: {
        id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        membership_coins_granted_at: oldGrantDate.toISOString(),
      },
      error: null,
    });

    const { POST } = await import('@/app/api/stripe/webhook/route');
    const request = buildWebhookRequest(createRenewalInvoiceEvent());
    await POST(request as unknown as import('next/server').NextRequest);

    expect(mockAdmin.rpc).toHaveBeenCalledWith(
      'credit_coins',
      expect.objectContaining({
        p_amount: 1000,
        p_type: 'membership_grant',
      }),
    );
  });

  it('should NOT grant coins when last grant was within 11 months', async () => {
    setNoDuplicateEvent();
    // Recent grant — last week.
    const recentGrantDate = new Date();
    recentGrantDate.setDate(recentGrantDate.getDate() - 7);

    mockAdmin.getFromBuilder('users').single.mockResolvedValue({
      data: {
        id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        membership_coins_granted_at: recentGrantDate.toISOString(),
      },
      error: null,
    });

    const { POST } = await import('@/app/api/stripe/webhook/route');
    const request = buildWebhookRequest(createRenewalInvoiceEvent());
    await POST(request as unknown as import('next/server').NextRequest);

    expect(mockAdmin.rpc).not.toHaveBeenCalled();
  });

  it('should skip when no user matches the Stripe customer id', async () => {
    setNoDuplicateEvent();
    mockAdmin.getFromBuilder('users').single.mockResolvedValue({ data: null, error: null });

    const { POST } = await import('@/app/api/stripe/webhook/route');
    const request = buildWebhookRequest(createRenewalInvoiceEvent());
    const response = await POST(request as unknown as import('next/server').NextRequest);

    expect(response.status).toBe(200);
    expect(mockAdmin.rpc).not.toHaveBeenCalled();
  });
});

describe('POST /api/stripe/webhook — customer.subscription.updated', () => {
  it('should map active status to active membership and unfreeze coin account', async () => {
    setNoDuplicateEvent();
    mockAdmin.getFromBuilder('users').single.mockResolvedValue({
      data: { id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' },
      error: null,
    });

    const { POST } = await import('@/app/api/stripe/webhook/route');
    const request = buildWebhookRequest(createSubscriptionUpdateEvent('active'));
    await POST(request as unknown as import('next/server').NextRequest);

    const usersBuilder = mockAdmin.getFromBuilder('users');
    expect(usersBuilder.update).toHaveBeenCalledWith(
      expect.objectContaining({ membership_status: 'active' }),
    );
    expect(mockAdmin.getFromBuilder('coin_accounts').update).toHaveBeenCalledWith({ frozen: false });
  });

  it('should freeze coin account when status becomes past_due (non-active)', async () => {
    setNoDuplicateEvent();
    mockAdmin.getFromBuilder('users').single.mockResolvedValue({
      data: { id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' },
      error: null,
    });

    const { POST } = await import('@/app/api/stripe/webhook/route');
    const request = buildWebhookRequest(createSubscriptionUpdateEvent('past_due'));
    await POST(request as unknown as import('next/server').NextRequest);

    expect(mockAdmin.getFromBuilder('coin_accounts').update).toHaveBeenCalledWith({ frozen: true });
  });

  it('should freeze coin account when status becomes canceled', async () => {
    setNoDuplicateEvent();
    mockAdmin.getFromBuilder('users').single.mockResolvedValue({
      data: { id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' },
      error: null,
    });

    const { POST } = await import('@/app/api/stripe/webhook/route');
    const request = buildWebhookRequest(createSubscriptionUpdateEvent('canceled'));
    await POST(request as unknown as import('next/server').NextRequest);

    expect(mockAdmin.getFromBuilder('coin_accounts').update).toHaveBeenCalledWith({ frozen: true });
  });
});

describe('POST /api/stripe/webhook — unhandled event types', () => {
  it('should return 200 and record the event even if type is unrecognized', async () => {
    setNoDuplicateEvent();
    const event = createStripeEvent('charge.refunded', { id: 'ch_test' });

    const { POST } = await import('@/app/api/stripe/webhook/route');
    const response = await POST(
      buildWebhookRequest(event) as unknown as import('next/server').NextRequest,
    );

    expect(response.status).toBe(200);
    // Event still recorded in stripe_events so it can't be replayed.
    expect(mockAdmin.getFromBuilder('stripe_events').insert).toHaveBeenCalled();
  });
});

describe('mapStripeStatusToMembership — status mapping', () => {
  it('should map active and trialing to active', () => {
    expect(mapStripeStatusToMembership('active')).toBe('active');
    expect(mapStripeStatusToMembership('trialing')).toBe('active');
  });

  it('should map past_due, unpaid, canceled to expired', () => {
    expect(mapStripeStatusToMembership('past_due')).toBe('expired');
    expect(mapStripeStatusToMembership('unpaid')).toBe('expired');
    expect(mapStripeStatusToMembership('canceled')).toBe('expired');
  });

  it('should map unknown status to none', () => {
    expect(mapStripeStatusToMembership('mystery-status')).toBe('none');
  });
});
