// GSR-DOC-207: Stripe server actions — checkout sessions and customer portal.
'use server';

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getStripe } from '@/lib/stripe/client';
import { PURCHASE_PACKAGES } from '@/lib/coins/products';
import type { StripeCheckoutResult } from '@/lib/types/stripe';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

/**
 * Returns existing stripe_customer_id, or creates a new Stripe customer
 * and persists the id back to public.users.
 */
async function getOrCreateStripeCustomer(
  userId: string,
  email: string,
): Promise<string> {
  const admin = createAdminClient();

  const { data: user } = await admin
    .from('users')
    .select('stripe_customer_id')
    .eq('id', userId)
    .single();

  if (user?.stripe_customer_id) {
    return user.stripe_customer_id as string;
  }

  const stripe = getStripe();
  const customer = await stripe.customers.create({
    email,
    metadata: { userId },
  });

  await admin
    .from('users')
    .update({ stripe_customer_id: customer.id })
    .eq('id', userId);

  return customer.id;
}

/** Validates that the caller is authenticated and matches userId. Returns email or null. */
async function authorizeUser(userId: string): Promise<{ email: string } | null> {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user || data.user.id !== userId) return null;
  return { email: data.user.email ?? '' };
}

/**
 * Creates a Stripe Checkout session for an annual membership subscription.
 */
export async function createMembershipCheckout(
  userId: string,
): Promise<StripeCheckoutResult> {
  const auth = await authorizeUser(userId);
  if (!auth) return { error: 'Not authorized.' };
  if (!auth.email) return { error: 'Account email missing.' };

  try {
    const customerId = await getOrCreateStripeCustomer(userId, auth.email);
    const stripe = getStripe();

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: customerId,
      client_reference_id: userId,
      line_items: [
        {
          price: process.env.STRIPE_MEMBERSHIP_PRICE_ID!,
          quantity: 1,
        },
      ],
      success_url: `${APP_URL}/dashboard?membership=success`,
      cancel_url: `${APP_URL}/dashboard/membership`,
      metadata: { userId, type: 'membership' },
      subscription_data: {
        metadata: { userId, type: 'membership' },
      },
    });

    if (!session.url) return { error: 'Stripe did not return a checkout URL.' };
    return { url: session.url };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Stripe checkout failed.';
    return { error: message };
  }
}

/**
 * Creates a Stripe Checkout session for a one-time Sky Coins purchase.
 */
export async function createCoinPurchaseCheckout(
  userId: string,
  packageCode: string,
): Promise<StripeCheckoutResult> {
  const pkg = PURCHASE_PACKAGES.find((p) => p.code === packageCode);
  if (!pkg) return { error: 'Unknown coin package.' };

  const auth = await authorizeUser(userId);
  if (!auth) return { error: 'Not authorized.' };
  if (!auth.email) return { error: 'Account email missing.' };

  try {
    const customerId = await getOrCreateStripeCustomer(userId, auth.email);
    const stripe = getStripe();

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      customer: customerId,
      client_reference_id: userId,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: 'usd',
            unit_amount: pkg.priceUsd * 100,
            product_data: {
              name: `${pkg.coins.toLocaleString()} Sky Coins`,
              description: 'Sky Coins purchase — credited on payment confirmation.',
            },
          },
        },
      ],
      success_url: `${APP_URL}/dashboard/coins?purchase=success`,
      cancel_url: `${APP_URL}/dashboard/coins/purchase`,
      metadata: {
        userId,
        type: 'coin_purchase',
        packageCode: pkg.code,
        coins: String(pkg.coins),
      },
    });

    if (!session.url) return { error: 'Stripe did not return a checkout URL.' };
    return { url: session.url };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Stripe checkout failed.';
    return { error: message };
  }
}

/**
 * Creates a Stripe Billing Portal session so the user can manage their subscription.
 */
export async function createCustomerPortalSession(
  userId: string,
): Promise<StripeCheckoutResult> {
  const auth = await authorizeUser(userId);
  if (!auth) return { error: 'Not authorized.' };

  const admin = createAdminClient();
  const { data: user } = await admin
    .from('users')
    .select('stripe_customer_id')
    .eq('id', userId)
    .single();

  if (!user?.stripe_customer_id) {
    return { error: 'No Stripe customer on file. Start a membership first.' };
  }

  try {
    const stripe = getStripe();
    const session = await stripe.billingPortal.sessions.create({
      customer: user.stripe_customer_id as string,
      return_url: `${APP_URL}/dashboard`,
    });
    return { url: session.url };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Could not open billing portal.';
    return { error: message };
  }
}
