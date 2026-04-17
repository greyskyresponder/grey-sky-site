// GSR-DOC-207: Stripe webhook handler — verifies signatures, processes events idempotently.
import { NextRequest, NextResponse } from 'next/server';
import type Stripe from 'stripe';
import { getStripe } from '@/lib/stripe/client';
import { createAdminClient } from '@/lib/supabase/admin';
import { mapStripeStatusToMembership } from '@/lib/stripe/membership';
import { env } from '@/lib/env';

export const runtime = 'nodejs';
// Stripe needs the raw body — never cache.
export const dynamic = 'force-dynamic';

const MEMBERSHIP_GRANT_COINS = 1000;
// Eleven months in ms — guards against double-grant on same renewal cycle.
const ELEVEN_MONTHS_MS = 11 * 30 * 24 * 60 * 60 * 1000;

export async function POST(request: NextRequest) {
  const signature = request.headers.get('stripe-signature');
  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 });
  }

  const body = await request.text();
  const stripe = getStripe();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      env.STRIPE_WEBHOOK_SECRET,
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Invalid signature';
    return NextResponse.json({ error: `Webhook signature verification failed: ${message}` }, { status: 400 });
  }

  const admin = createAdminClient();

  // Idempotency — skip if we've processed this event already.
  const { data: existing } = await admin
    .from('stripe_events')
    .select('id')
    .eq('stripe_event_id', event.id)
    .maybeSingle();

  if (existing) {
    return NextResponse.json({ received: true, duplicate: true });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;
      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;
      default:
        // Unhandled event types are still ack'd — we just don't act on them.
        break;
    }
  } catch (err) {
    // Log but do NOT return error — Stripe will retry, and we want partial-progress
    // events recorded so we don't double-process. Rethrow only if catastrophic.
    console.error('[stripe webhook] handler error', event.type, event.id, err);
    return NextResponse.json({ error: 'Handler failed' }, { status: 500 });
  }

  await admin.from('stripe_events').insert({
    stripe_event_id: event.id,
    type: event.type,
    payload: event as unknown as Record<string, unknown>,
  });

  return NextResponse.json({ received: true });
}

// ── Handlers ──────────────────────────────────────────────

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const admin = createAdminClient();
  const metadata = session.metadata ?? {};
  const userId = metadata.userId ?? session.client_reference_id ?? null;
  if (!userId) {
    console.warn('[stripe webhook] checkout.session.completed missing userId', session.id);
    return;
  }

  if (metadata.type === 'membership') {
    const subscriptionId =
      typeof session.subscription === 'string' ? session.subscription : session.subscription?.id ?? null;
    const startedAt = new Date();
    const expiresAt = new Date(startedAt);
    expiresAt.setFullYear(expiresAt.getFullYear() + 1);

    await admin
      .from('users')
      .update({
        stripe_subscription_id: subscriptionId,
        stripe_subscription_status: 'active',
        membership_status: 'active',
        membership_started_at: startedAt.toISOString(),
        membership_expires_at: expiresAt.toISOString(),
        membership_coins_granted_at: startedAt.toISOString(),
      })
      .eq('id', userId);

    // Unfreeze coin account if it was frozen.
    await admin.from('coin_accounts').update({ frozen: false }).eq('user_id', userId);

    // Grant the membership coin allotment.
    await admin.rpc('credit_coins', {
      p_user_id: userId,
      p_amount: MEMBERSHIP_GRANT_COINS,
      p_type: 'membership_grant',
      p_product_code: null,
      p_reference_id: null,
      p_reference_type: null,
      p_description: 'Annual membership — 1,000 Sky Coins',
    });
    return;
  }

  if (metadata.type === 'coin_purchase') {
    const coins = parseInt(metadata.coins ?? '0', 10);
    const packageCode = metadata.packageCode ?? null;
    if (!coins || coins <= 0) {
      console.warn('[stripe webhook] coin_purchase missing coins', session.id);
      return;
    }

    await admin.rpc('credit_coins', {
      p_user_id: userId,
      p_amount: coins,
      p_type: 'purchase',
      p_product_code: packageCode,
      p_reference_id: null,
      p_reference_type: null,
      p_description: `Sky Coins purchase — ${coins.toLocaleString()} coins`,
    });
  }
}

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  // Renewal coin grant — fires on every successful subscription invoice.
  // We skip the first invoice (already credited via checkout.session.completed).
  // The 11-month guard prevents double-grants on the same cycle.
  const customerId =
    typeof invoice.customer === 'string' ? invoice.customer : invoice.customer?.id ?? null;
  if (!customerId) return;

  // Only process subscription invoices (not one-off coin purchases).
  // Stripe v22+: subscription field lives on the line items.
  const lineSubscription = invoice.lines?.data?.find((line) =>
    typeof (line as { subscription?: unknown }).subscription === 'string',
  );
  const isSubscriptionInvoice = Boolean(
    lineSubscription || (invoice as unknown as { subscription?: string }).subscription,
  );
  if (!isSubscriptionInvoice) return;

  const admin = createAdminClient();
  const { data: user } = await admin
    .from('users')
    .select('id, membership_coins_granted_at')
    .eq('stripe_customer_id', customerId)
    .single();

  if (!user) return;

  const lastGrant = user.membership_coins_granted_at
    ? new Date(user.membership_coins_granted_at as string).getTime()
    : 0;
  const now = Date.now();
  const elapsed = now - lastGrant;

  // First invoice: handled by checkout.session.completed, so skip if grant just happened.
  if (elapsed < ELEVEN_MONTHS_MS) return;

  const expiresAt = new Date();
  expiresAt.setFullYear(expiresAt.getFullYear() + 1);

  await admin
    .from('users')
    .update({
      membership_status: 'active',
      membership_expires_at: expiresAt.toISOString(),
      membership_coins_granted_at: new Date(now).toISOString(),
    })
    .eq('id', user.id);

  await admin.from('coin_accounts').update({ frozen: false }).eq('user_id', user.id);

  await admin.rpc('credit_coins', {
    p_user_id: user.id,
    p_amount: MEMBERSHIP_GRANT_COINS,
    p_type: 'membership_grant',
    p_product_code: null,
    p_reference_id: null,
    p_reference_type: null,
    p_description: 'Annual membership renewal — 1,000 Sky Coins',
  });
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const customerId =
    typeof subscription.customer === 'string' ? subscription.customer : subscription.customer.id;

  const admin = createAdminClient();
  const { data: user } = await admin
    .from('users')
    .select('id')
    .eq('stripe_customer_id', customerId)
    .single();
  if (!user) return;

  const stripeStatus = subscription.status;
  const membershipStatus = mapStripeStatusToMembership(stripeStatus);

  await admin
    .from('users')
    .update({
      stripe_subscription_id: subscription.id,
      stripe_subscription_status: stripeStatus,
      membership_status: membershipStatus,
    })
    .eq('id', user.id);

  if (membershipStatus !== 'active') {
    await admin.from('coin_accounts').update({ frozen: true }).eq('user_id', user.id);
  } else {
    await admin.from('coin_accounts').update({ frozen: false }).eq('user_id', user.id);
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const customerId =
    typeof subscription.customer === 'string' ? subscription.customer : subscription.customer.id;

  const admin = createAdminClient();
  const { data: user } = await admin
    .from('users')
    .select('id')
    .eq('stripe_customer_id', customerId)
    .single();
  if (!user) return;

  // Stripe v22+: period-end lives on the items, not on the subscription root.
  const periodEnd =
    (subscription as unknown as { current_period_end?: number }).current_period_end ??
    subscription.items?.data?.[0]?.current_period_end ??
    Math.floor(Date.now() / 1000);

  await admin
    .from('users')
    .update({
      stripe_subscription_status: 'canceled',
      membership_status: 'expired',
      membership_expires_at: new Date(periodEnd * 1000).toISOString(),
    })
    .eq('id', user.id);

  await admin.from('coin_accounts').update({ frozen: true }).eq('user_id', user.id);
}
