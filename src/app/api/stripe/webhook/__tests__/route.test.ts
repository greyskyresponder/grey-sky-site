import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createMockSupabaseClient, type MockSupabaseClient } from '@/test/utils/supabase-mock';
import {
  createCheckoutEvent,
  createCoinPurchaseCheckoutEvent,
  createRenewalInvoiceEvent,
  createSubscriptionUpdateEvent,
  createPaymentFailedEvent,
  createChargeRefundedEvent,
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

describe('POST /api/stripe/webhook — post-processing error handling', () => {
  it('records processing_status=completed and no error on happy path', async () => {
    setNoDuplicateEvent();
    const { POST } = await import('@/app/api/stripe/webhook/route');
    const request = buildWebhookRequest(createCheckoutEvent());
    const response = await POST(request as unknown as import('next/server').NextRequest);

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ received: true });

    const stripeEventsBuilder = mockAdmin.getFromBuilder('stripe_events');
    // Event recorded first with processing_status='processing'.
    expect(stripeEventsBuilder.insert).toHaveBeenCalledWith(
      expect.objectContaining({ processing_status: 'processing' }),
    );
    // Then finalized to 'completed' with null processing_error.
    expect(stripeEventsBuilder.update).toHaveBeenCalledWith(
      expect.objectContaining({ processing_status: 'completed', processing_error: null }),
    );
  });

  it('marks event with processing_status=error when credit_coins RPC fails', async () => {
    setNoDuplicateEvent();
    mockAdmin.setRpcResolution('credit_coins', {
      data: null,
      error: { message: 'permission denied for function credit_coins', code: '42501' },
    });
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const { POST } = await import('@/app/api/stripe/webhook/route');
    const request = buildWebhookRequest(createCheckoutEvent());
    const response = await POST(request as unknown as import('next/server').NextRequest);

    // Still 200 — we handle retry ourselves via processing_status.
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ received: true, partial_error: true });

    const stripeEventsBuilder = mockAdmin.getFromBuilder('stripe_events');
    expect(stripeEventsBuilder.update).toHaveBeenCalledWith(
      expect.objectContaining({
        processing_status: 'error',
        processing_error: expect.objectContaining({
          operations: expect.arrayContaining([
            expect.objectContaining({
              operation: 'credit_membership_coins',
              message: 'permission denied for function credit_coins',
              code: '42501',
              user_id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
              event_type: 'checkout.session.completed',
            }),
          ]),
        }),
      }),
    );

    // Structured log includes full context for manual reconciliation.
    expect(errorSpy).toHaveBeenCalledWith(
      '[stripe webhook] operation failed',
      expect.objectContaining({
        operation: 'credit_membership_coins',
        event_id: expect.any(String),
        user_id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        message: 'permission denied for function credit_coins',
      }),
    );

    errorSpy.mockRestore();
  });

  it('marks event with processing_status=error when membership update fails', async () => {
    setNoDuplicateEvent();
    mockAdmin.setFromResolution('users', {
      data: null,
      error: { message: 'row-level security violation', code: '42501' },
    });
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const { POST } = await import('@/app/api/stripe/webhook/route');
    const request = buildWebhookRequest(createCheckoutEvent());
    const response = await POST(request as unknown as import('next/server').NextRequest);

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ received: true, partial_error: true });

    const stripeEventsBuilder = mockAdmin.getFromBuilder('stripe_events');
    const finalizeCall = stripeEventsBuilder.update.mock.calls.find(
      (call) => (call[0] as Record<string, unknown>)?.processing_status !== undefined,
    );
    expect(finalizeCall).toBeDefined();
    const payload = finalizeCall![0] as {
      processing_status: string;
      processing_error: { operations: Array<{ operation: string; message: string }> };
    };
    expect(payload.processing_status).toBe('error');
    const ops = payload.processing_error.operations.map((o) => o.operation);
    expect(ops).toContain('update_membership_active');

    errorSpy.mockRestore();
  });

  it('logs each failure when multiple post-processing operations fail', async () => {
    setNoDuplicateEvent();
    // users update succeeds (default). coin_accounts update and credit_coins RPC both fail.
    mockAdmin.setFromResolution('coin_accounts', {
      data: null,
      error: { message: 'coin_accounts write failed', code: 'LOCK' },
    });
    mockAdmin.setRpcResolution('credit_coins', {
      data: null,
      error: { message: 'rpc failed', code: 'RPC_ERR' },
    });
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const { POST } = await import('@/app/api/stripe/webhook/route');
    const request = buildWebhookRequest(createCheckoutEvent());
    const response = await POST(request as unknown as import('next/server').NextRequest);

    expect(response.status).toBe(200);

    const stripeEventsBuilder = mockAdmin.getFromBuilder('stripe_events');
    const finalizeCall = stripeEventsBuilder.update.mock.calls.find(
      (call) => (call[0] as Record<string, unknown>)?.processing_status !== undefined,
    );
    const payload = finalizeCall![0] as {
      processing_status: string;
      processing_error: { operations: Array<{ operation: string; code?: string }> };
    };
    expect(payload.processing_status).toBe('error');

    const opNames = payload.processing_error.operations.map((o) => o.operation);
    // Both failed ops present; the one that succeeded is absent.
    expect(opNames).toContain('unfreeze_coin_account');
    expect(opNames).toContain('credit_membership_coins');
    expect(opNames).not.toContain('update_membership_active');
    expect(payload.processing_error.operations.length).toBe(2);

    errorSpy.mockRestore();
  });
});

// ── GSR-DOC-208 ────────────────────────────────────────────────────────────

describe('POST /api/stripe/webhook — invoice.payment_failed (DOC-208)', () => {
  beforeEach(() => {
    setNoDuplicateEvent();
  });

  it('opens a 14-day grace window on first failure and sets spending_blocked', async () => {
    // user lookup by stripe_customer_id → grace fields are null (first failure)
    mockAdmin.getFromBuilder('users').single.mockResolvedValue({
      data: {
        id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        grace_period_started_at: null,
        grace_period_ends_at: null,
      },
      error: null,
    });

    const { POST } = await import('@/app/api/stripe/webhook/route');
    const request = buildWebhookRequest(createPaymentFailedEvent());
    const response = await POST(request as unknown as import('next/server').NextRequest);

    expect(response.status).toBe(200);
    const usersBuilder = mockAdmin.getFromBuilder('users');
    expect(usersBuilder.update).toHaveBeenCalled();
    const updateArg = usersBuilder.update.mock.calls[0][0] as Record<string, unknown>;
    expect(updateArg.spending_blocked).toBe(true);
    expect(typeof updateArg.grace_period_started_at).toBe('string');
    expect(typeof updateArg.grace_period_ends_at).toBe('string');

    // ~14 days between start and end (allow 1s of clock drift)
    const start = new Date(updateArg.grace_period_started_at as string).getTime();
    const end = new Date(updateArg.grace_period_ends_at as string).getTime();
    const fourteenDaysMs = 14 * 24 * 60 * 60 * 1000;
    expect(end - start).toBeGreaterThanOrEqual(fourteenDaysMs - 1000);
    expect(end - start).toBeLessThanOrEqual(fourteenDaysMs + 1000);
  });

  it('does not reopen grace timestamps on subsequent failures within an open window', async () => {
    const futureEnd = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    const earlyStart = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    mockAdmin.getFromBuilder('users').single.mockResolvedValue({
      data: {
        id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        grace_period_started_at: earlyStart,
        grace_period_ends_at: futureEnd,
      },
      error: null,
    });

    const { POST } = await import('@/app/api/stripe/webhook/route');
    const request = buildWebhookRequest(createPaymentFailedEvent());
    const response = await POST(request as unknown as import('next/server').NextRequest);

    expect(response.status).toBe(200);
    const updateArg = mockAdmin.getFromBuilder('users').update.mock.calls[0][0] as Record<
      string,
      unknown
    >;
    expect(updateArg.spending_blocked).toBe(true);
    // Timestamps NOT touched on subsequent failures.
    expect(updateArg).not.toHaveProperty('grace_period_started_at');
    expect(updateArg).not.toHaveProperty('grace_period_ends_at');
  });

  it('skips entirely when the invoice has no customer', async () => {
    const { POST } = await import('@/app/api/stripe/webhook/route');
    const request = buildWebhookRequest(
      createPaymentFailedEvent({ customer: null }),
    );
    const response = await POST(request as unknown as import('next/server').NextRequest);

    expect(response.status).toBe(200);
    // No user lookup, no updates.
    expect(mockAdmin.getFromBuilder('users').single).not.toHaveBeenCalled();
    expect(mockAdmin.getFromBuilder('users').update).not.toHaveBeenCalled();
  });

  it('skips one-time-payment invoices (no subscription on the invoice)', async () => {
    const { POST } = await import('@/app/api/stripe/webhook/route');
    const request = buildWebhookRequest(
      createPaymentFailedEvent({
        subscription: null,
        lines: { data: [{}] },
      }),
    );
    const response = await POST(request as unknown as import('next/server').NextRequest);

    expect(response.status).toBe(200);
    expect(mockAdmin.getFromBuilder('users').update).not.toHaveBeenCalled();
  });
});

describe('POST /api/stripe/webhook — charge.refunded (DOC-208)', () => {
  beforeEach(() => {
    setNoDuplicateEvent();
  });

  it('reverses the coin grant via reverse_coin_grant() and stamps refunded_at', async () => {
    const purchaseId = '11111111-2222-3333-4444-555555555555';
    const ledgerId = '99999999-8888-7777-6666-555555555555';
    const reversalId = 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee';

    mockAdmin.getFromBuilder('stripe_coin_pack_purchases').maybeSingle.mockResolvedValue({
      data: {
        id: purchaseId,
        user_id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        ledger_entry_id: ledgerId,
        refunded_at: null,
      },
      error: null,
    });
    // Mock the rpc(reverse_coin_grant) success.
    mockAdmin.rpc.mockImplementationOnce(() =>
      Promise.resolve({ data: reversalId, error: null }),
    );

    const { POST } = await import('@/app/api/stripe/webhook/route');
    const request = buildWebhookRequest(createChargeRefundedEvent());
    const response = await POST(request as unknown as import('next/server').NextRequest);

    expect(response.status).toBe(200);

    // RPC called with event id as idempotency key.
    expect(mockAdmin.rpc).toHaveBeenCalledWith('reverse_coin_grant', expect.objectContaining({
      p_original_ledger_entry_id: ledgerId,
      p_reason: 'Stripe charge refund',
    }));
    const rpcCallArgs = mockAdmin.rpc.mock.calls[0] as unknown as [
      string,
      Record<string, unknown>?,
    ];
    const rpcArgs = (rpcCallArgs[1] ?? {}) as Record<string, unknown>;
    expect(typeof rpcArgs.p_idempotency_key).toBe('string');
    expect((rpcArgs.p_idempotency_key as string).startsWith('evt_')).toBe(true);

    // refunded_at + refund_ledger_entry_id stamped on the purchase row.
    const purchaseBuilder = mockAdmin.getFromBuilder('stripe_coin_pack_purchases');
    expect(purchaseBuilder.update).toHaveBeenCalled();
    const updateArg = purchaseBuilder.update.mock.calls[0][0] as Record<string, unknown>;
    expect(typeof updateArg.refunded_at).toBe('string');
    expect(updateArg.refund_ledger_entry_id).toBe(reversalId);
  });

  it('skips when no matching coin pack purchase is found (e.g. membership refund)', async () => {
    mockAdmin.getFromBuilder('stripe_coin_pack_purchases').maybeSingle.mockResolvedValue({
      data: null,
      error: null,
    });

    const { POST } = await import('@/app/api/stripe/webhook/route');
    const request = buildWebhookRequest(createChargeRefundedEvent());
    const response = await POST(request as unknown as import('next/server').NextRequest);

    expect(response.status).toBe(200);
    expect(mockAdmin.rpc).not.toHaveBeenCalled();
    expect(
      mockAdmin.getFromBuilder('stripe_coin_pack_purchases').update,
    ).not.toHaveBeenCalled();
  });

  it('is idempotent: skips when refunded_at is already set', async () => {
    mockAdmin.getFromBuilder('stripe_coin_pack_purchases').maybeSingle.mockResolvedValue({
      data: {
        id: '11111111-2222-3333-4444-555555555555',
        user_id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        ledger_entry_id: '99999999-8888-7777-6666-555555555555',
        refunded_at: '2026-05-04T19:00:00.000Z',
      },
      error: null,
    });

    const { POST } = await import('@/app/api/stripe/webhook/route');
    const request = buildWebhookRequest(createChargeRefundedEvent());
    const response = await POST(request as unknown as import('next/server').NextRequest);

    expect(response.status).toBe(200);
    expect(mockAdmin.rpc).not.toHaveBeenCalled();
    expect(
      mockAdmin.getFromBuilder('stripe_coin_pack_purchases').update,
    ).not.toHaveBeenCalled();
  });

  it('skips when the charge has no payment_intent', async () => {
    const { POST } = await import('@/app/api/stripe/webhook/route');
    const request = buildWebhookRequest(
      createChargeRefundedEvent({ payment_intent: null }),
    );
    const response = await POST(request as unknown as import('next/server').NextRequest);

    expect(response.status).toBe(200);
    expect(
      mockAdmin.getFromBuilder('stripe_coin_pack_purchases').maybeSingle,
    ).not.toHaveBeenCalled();
    expect(mockAdmin.rpc).not.toHaveBeenCalled();
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
