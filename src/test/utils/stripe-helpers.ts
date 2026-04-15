/**
 * Stripe event factories for webhook handler tests.
 *
 * Matches the webhook handler's expectations:
 *   - Membership checkout: metadata.type === 'membership', metadata.userId
 *   - Coin purchase: metadata.type === 'coin_purchase', metadata.coins, metadata.packageCode
 */

export interface MockStripeEvent<T = Record<string, unknown>> {
  id: string;
  type: string;
  data: { object: T };
  created: number;
  livemode: boolean;
  api_version: string;
}

let eventCounter = 0;

export function createStripeEvent<T extends Record<string, unknown>>(
  type: string,
  object: T,
  id?: string,
): MockStripeEvent<T> {
  eventCounter += 1;
  return {
    id: id ?? `evt_test_${eventCounter}_${Date.now()}`,
    type,
    data: { object },
    created: Math.floor(Date.now() / 1000),
    livemode: false,
    api_version: '2024-12-18.acacia',
  };
}

export function createCheckoutEvent(overrides: Record<string, unknown> = {}) {
  return createStripeEvent('checkout.session.completed', {
    id: 'cs_test_session_id',
    mode: 'subscription',
    customer: 'cus_test_customer',
    subscription: 'sub_test_subscription',
    client_reference_id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    metadata: {
      userId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
      type: 'membership',
    },
    ...overrides,
  });
}

export function createCoinPurchaseCheckoutEvent(overrides: Record<string, unknown> = {}) {
  return createStripeEvent('checkout.session.completed', {
    id: 'cs_test_coin_purchase',
    mode: 'payment',
    customer: 'cus_test_customer',
    client_reference_id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    metadata: {
      userId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
      type: 'coin_purchase',
      coins: '500',
      packageCode: 'pkg_500',
    },
    ...overrides,
  });
}

export function createRenewalInvoiceEvent(overrides: Record<string, unknown> = {}) {
  return createStripeEvent('invoice.payment_succeeded', {
    id: 'in_test_invoice',
    customer: 'cus_test_customer',
    subscription: 'sub_test_subscription',
    billing_reason: 'subscription_cycle',
    lines: { data: [{ subscription: 'sub_test_subscription' }] },
    ...overrides,
  });
}

export function createSubscriptionUpdateEvent(
  status: string,
  overrides: Record<string, unknown> = {},
) {
  return createStripeEvent('customer.subscription.updated', {
    id: 'sub_test_subscription',
    customer: 'cus_test_customer',
    status,
    items: { data: [{ current_period_end: Math.floor(Date.now() / 1000) + 86400 }] },
    ...overrides,
  });
}

/** Build a mock NextRequest-compatible Request for POST /api/stripe/webhook. */
export function buildWebhookRequest(
  event: MockStripeEvent | null,
  options: { signature?: string | null } = {},
): Request {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (options.signature !== null) {
    headers['stripe-signature'] = options.signature ?? 't=1700000000,v1=fake_signature_for_testing';
  }
  return new Request('http://localhost:3000/api/stripe/webhook', {
    method: 'POST',
    headers,
    body: event ? JSON.stringify(event) : '',
  });
}
