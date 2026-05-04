// GSR-DOC-208: Stripe Checkout session helpers (membership + coin packs).
import type Stripe from 'stripe';
import { getStripe } from './client';
import { env } from '@/lib/env';

export type CoinPackSku = 'coins_100' | 'coins_500' | 'coins_1000' | 'coins_2500';

export const COIN_PACK_AMOUNTS: Record<CoinPackSku, number> = {
  coins_100: 100,
  coins_500: 500,
  coins_1000: 1000,
  coins_2500: 2500,
};

/**
 * Resolves the configured Stripe Price ID for a given coin pack SKU.
 * Throws when the corresponding env var is not set so the caller surfaces
 * a 503 instead of a misleading 200.
 */
export function resolveCoinPackPriceId(sku: CoinPackSku): string {
  const priceId = (() => {
    switch (sku) {
      case 'coins_100':  return env.STRIPE_PRICE_COINS_100;
      case 'coins_500':  return env.STRIPE_PRICE_COINS_500;
      case 'coins_1000': return env.STRIPE_PRICE_COINS_1000;
      case 'coins_2500': return env.STRIPE_PRICE_COINS_2500;
    }
  })();
  if (!priceId) {
    throw new Error(`[stripe.checkout] no Stripe Price ID configured for ${sku}`);
  }
  return priceId;
}

export interface CreateMembershipCheckoutInput {
  customerId: string;
  userId: string;
  successUrl?: string;
  cancelUrl?: string;
}

export async function createMembershipCheckoutSession(
  input: CreateMembershipCheckoutInput,
): Promise<Stripe.Checkout.Session> {
  if (!env.STRIPE_MEMBERSHIP_PRICE_ID) {
    throw new Error('[stripe.checkout] STRIPE_MEMBERSHIP_PRICE_ID not configured');
  }
  const stripe = getStripe();

  return stripe.checkout.sessions.create({
    mode: 'subscription',
    customer: input.customerId,
    line_items: [
      {
        price: env.STRIPE_MEMBERSHIP_PRICE_ID,
        quantity: 1,
      },
    ],
    automatic_tax: { enabled: true },
    success_url:
      input.successUrl ??
      `${env.NEXT_PUBLIC_APP_URL}/api/billing/checkout-success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url:
      input.cancelUrl ?? `${env.NEXT_PUBLIC_APP_URL}/membership?canceled=1`,
    metadata: {
      gsr_user_id: input.userId,
      gsr_purchase_type: 'membership',
    },
    subscription_data: {
      metadata: {
        gsr_user_id: input.userId,
      },
    },
  });
}

export interface CreateCoinPackCheckoutInput {
  customerId: string;
  userId: string;
  sku: CoinPackSku;
  successUrl?: string;
  cancelUrl?: string;
}

export async function createCoinPackCheckoutSession(
  input: CreateCoinPackCheckoutInput,
): Promise<Stripe.Checkout.Session> {
  const stripe = getStripe();
  const priceId = resolveCoinPackPriceId(input.sku);

  return stripe.checkout.sessions.create({
    mode: 'payment',
    customer: input.customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    automatic_tax: { enabled: true },
    payment_intent_data: {
      metadata: {
        gsr_user_id: input.userId,
        gsr_purchase_type: 'coin_pack',
        gsr_pack_sku: input.sku,
        gsr_coins_amount: String(COIN_PACK_AMOUNTS[input.sku]),
      },
    },
    success_url:
      input.successUrl ??
      `${env.NEXT_PUBLIC_APP_URL}/api/billing/checkout-success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url:
      input.cancelUrl ?? `${env.NEXT_PUBLIC_APP_URL}/dashboard/coins/purchase?canceled=1`,
    metadata: {
      gsr_user_id: input.userId,
      gsr_purchase_type: 'coin_pack',
      gsr_pack_sku: input.sku,
      gsr_coins_amount: String(COIN_PACK_AMOUNTS[input.sku]),
    },
  });
}

export async function retrieveCheckoutSession(
  sessionId: string,
): Promise<Stripe.Checkout.Session> {
  const stripe = getStripe();
  return stripe.checkout.sessions.retrieve(sessionId, {
    expand: ['payment_intent', 'subscription'],
  });
}
