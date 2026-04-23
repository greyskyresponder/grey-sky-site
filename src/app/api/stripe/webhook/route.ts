// GSR-DOC-207: Stripe webhook handler — verifies signatures, processes events idempotently.
//
// Error-handling contract:
//   1. Signature failure → 400 (Stripe retries is fine, we haven't touched state).
//   2. Duplicate event → 200 duplicate:true (no re-processing).
//   3. Event-record insert fails → 500 (we have nothing persisted; let Stripe retry).
//   4. Any post-recording op fails → 200 with the event marked processing_status='error'
//      and processing_error populated. We DO NOT let Stripe retry the raw event, because
//      doing so would re-run the successful ops and risk double-credits. Operators
//      reconcile from the stripe_events row using the idx_stripe_events_needs_reconcile
//      index.
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

type AdminClient = ReturnType<typeof createAdminClient>;

interface OpError {
  operation: string;
  event_id: string;
  event_type: string;
  user_id: string | null;
  context: Record<string, unknown>;
  message: string;
  code?: string;
}

interface OpContext {
  event_id: string;
  event_type: string;
  user_id: string | null;
  extra?: Record<string, unknown>;
}

export async function POST(request: NextRequest) {
  const signature = request.headers.get('stripe-signature');
  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 });
  }

  const body = await request.text();
  const stripe = getStripe();

  if (!env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Stripe webhook secret not configured' }, { status: 503 });
  }

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

  // Record the event BEFORE running handlers. This way a post-processing failure
  // still leaves a row we can reconcile, and the idempotency check above prevents
  // Stripe retries from re-running handlers.
  const { error: insertError } = await admin.from('stripe_events').insert({
    stripe_event_id: event.id,
    type: event.type,
    payload: event as unknown as Record<string, unknown>,
    processing_status: 'processing',
  });

  if (insertError) {
    console.error('[stripe webhook] failed to persist event — allowing Stripe retry', {
      event_id: event.id,
      event_type: event.type,
      error: serializeError(insertError),
    });
    return NextResponse.json({ error: 'Failed to record event' }, { status: 500 });
  }

  const errors: OpError[] = [];

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(admin, event, errors);
        break;
      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(admin, event, errors);
        break;
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(admin, event, errors);
        break;
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(admin, event, errors);
        break;
      default:
        // Unhandled event types are still ack'd — we just don't act on them.
        break;
    }
  } catch (err) {
    // Unexpected exception escaping a handler — record it against the event.
    errors.push({
      operation: 'handler_exception',
      event_id: event.id,
      event_type: event.type,
      user_id: null,
      context: {},
      message: errorMessage(err),
    });
    console.error('[stripe webhook] handler threw', {
      event_id: event.id,
      event_type: event.type,
      error: serializeError(err),
    });
  }

  await finalizeEventStatus(admin, event.id, errors);

  return NextResponse.json({
    received: true,
    ...(errors.length > 0 ? { partial_error: true } : {}),
  });
}

// ── Per-operation helper ──────────────────────────────────

/**
 * Runs a Supabase operation, translating both `{error}` results and thrown
 * exceptions into structured entries on the errors array. Returns true if the
 * operation succeeded, false otherwise — callers may use this to decide whether
 * to short-circuit dependent work (though by default we continue so independent
 * ops still run).
 */
async function runOp(
  operation: string,
  ctx: OpContext,
  op: () => PromiseLike<unknown>,
  errors: OpError[],
): Promise<boolean> {
  try {
    const result = await op();
    const resultError =
      result && typeof result === 'object' && 'error' in result
        ? (result as { error: unknown }).error
        : null;
    if (resultError) {
      const entry: OpError = {
        operation,
        event_id: ctx.event_id,
        event_type: ctx.event_type,
        user_id: ctx.user_id,
        context: ctx.extra ?? {},
        message: errorMessage(resultError),
        code: extractErrorCode(resultError),
      };
      console.error('[stripe webhook] operation failed', entry);
      errors.push(entry);
      return false;
    }
    return true;
  } catch (err) {
    const entry: OpError = {
      operation,
      event_id: ctx.event_id,
      event_type: ctx.event_type,
      user_id: ctx.user_id,
      context: ctx.extra ?? {},
      message: errorMessage(err),
    };
    console.error('[stripe webhook] operation threw', entry);
    errors.push(entry);
    return false;
  }
}

async function finalizeEventStatus(admin: AdminClient, eventId: string, errors: OpError[]) {
  const status = errors.length > 0 ? 'error' : 'completed';
  const { error: updateError } = (await admin
    .from('stripe_events')
    .update({
      processing_status: status,
      processing_error: errors.length > 0 ? { operations: errors } : null,
    })
    .eq('stripe_event_id', eventId)) as { error: unknown };

  if (updateError) {
    // If we can't even record the final status, log loudly — the row still
    // exists with processing_status='processing' which is itself a reconcile signal.
    console.error('[stripe webhook] failed to finalize event status', {
      event_id: eventId,
      target_status: status,
      error: serializeError(updateError),
    });
  }
}

function errorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (err && typeof err === 'object' && 'message' in err) {
    const m = (err as { message: unknown }).message;
    if (typeof m === 'string') return m;
  }
  return String(err);
}

function extractErrorCode(err: unknown): string | undefined {
  if (err && typeof err === 'object' && 'code' in err) {
    const code = (err as { code: unknown }).code;
    if (typeof code === 'string') return code;
  }
  return undefined;
}

function serializeError(err: unknown): Record<string, unknown> {
  if (err instanceof Error) {
    return { name: err.name, message: err.message, stack: err.stack };
  }
  if (err && typeof err === 'object') return err as Record<string, unknown>;
  return { message: String(err) };
}

// ── Handlers ──────────────────────────────────────────────

async function handleCheckoutCompleted(
  admin: AdminClient,
  event: Stripe.Event,
  errors: OpError[],
) {
  const session = event.data.object as Stripe.Checkout.Session;
  const metadata = session.metadata ?? {};
  const userId = metadata.userId ?? session.client_reference_id ?? null;
  if (!userId) {
    console.warn('[stripe webhook] checkout.session.completed missing userId', session.id);
    return;
  }

  const ctx: OpContext = {
    event_id: event.id,
    event_type: event.type,
    user_id: userId,
    extra: { session_id: session.id },
  };

  if (metadata.type === 'membership') {
    const subscriptionId =
      typeof session.subscription === 'string' ? session.subscription : session.subscription?.id ?? null;
    const startedAt = new Date();
    const expiresAt = new Date(startedAt);
    expiresAt.setFullYear(expiresAt.getFullYear() + 1);

    await runOp(
      'update_membership_active',
      ctx,
      () =>
        admin
          .from('users')
          .update({
            stripe_subscription_id: subscriptionId,
            stripe_subscription_status: 'active',
            membership_status: 'active',
            membership_started_at: startedAt.toISOString(),
            membership_expires_at: expiresAt.toISOString(),
            membership_coins_granted_at: startedAt.toISOString(),
          })
          .eq('id', userId),
      errors,
    );

    await runOp(
      'unfreeze_coin_account',
      ctx,
      () => admin.from('coin_accounts').update({ frozen: false }).eq('user_id', userId),
      errors,
    );

    await runOp(
      'credit_membership_coins',
      ctx,
      () =>
        admin.rpc('credit_coins', {
          p_user_id: userId,
          p_amount: MEMBERSHIP_GRANT_COINS,
          p_type: 'membership_grant',
          p_product_code: null,
          p_reference_id: null,
          p_reference_type: null,
          p_description: 'Annual membership — 1,000 Sky Coins',
        }),
      errors,
    );
    return;
  }

  if (metadata.type === 'coin_purchase') {
    const coins = parseInt(metadata.coins ?? '0', 10);
    const packageCode = metadata.packageCode ?? null;
    if (!coins || coins <= 0) {
      console.warn('[stripe webhook] coin_purchase missing coins', session.id);
      return;
    }

    await runOp(
      'credit_purchased_coins',
      { ...ctx, extra: { ...ctx.extra, coins, packageCode } },
      () =>
        admin.rpc('credit_coins', {
          p_user_id: userId,
          p_amount: coins,
          p_type: 'purchase',
          p_product_code: packageCode,
          p_reference_id: null,
          p_reference_type: null,
          p_description: `Sky Coins purchase — ${coins.toLocaleString()} coins`,
        }),
      errors,
    );
  }
}

async function handleInvoicePaymentSucceeded(
  admin: AdminClient,
  event: Stripe.Event,
  errors: OpError[],
) {
  const invoice = event.data.object as Stripe.Invoice;
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

  const { data: user, error: userErr } = await admin
    .from('users')
    .select('id, membership_coins_granted_at')
    .eq('stripe_customer_id', customerId)
    .single();

  if (userErr) {
    errors.push({
      operation: 'lookup_user_by_customer',
      event_id: event.id,
      event_type: event.type,
      user_id: null,
      context: { customer_id: customerId },
      message: errorMessage(userErr),
      code: extractErrorCode(userErr),
    });
    console.error('[stripe webhook] user lookup failed', { customer_id: customerId, error: serializeError(userErr) });
    return;
  }

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

  const userId = user.id as string;
  const ctx: OpContext = {
    event_id: event.id,
    event_type: event.type,
    user_id: userId,
    extra: { customer_id: customerId },
  };

  await runOp(
    'update_membership_renewal',
    ctx,
    () =>
      admin
        .from('users')
        .update({
          membership_status: 'active',
          membership_expires_at: expiresAt.toISOString(),
          membership_coins_granted_at: new Date(now).toISOString(),
        })
        .eq('id', userId),
    errors,
  );

  await runOp(
    'unfreeze_coin_account',
    ctx,
    () => admin.from('coin_accounts').update({ frozen: false }).eq('user_id', userId),
    errors,
  );

  await runOp(
    'credit_renewal_coins',
    ctx,
    () =>
      admin.rpc('credit_coins', {
        p_user_id: userId,
        p_amount: MEMBERSHIP_GRANT_COINS,
        p_type: 'membership_grant',
        p_product_code: null,
        p_reference_id: null,
        p_reference_type: null,
        p_description: 'Annual membership renewal — 1,000 Sky Coins',
      }),
    errors,
  );
}

async function handleSubscriptionUpdated(
  admin: AdminClient,
  event: Stripe.Event,
  errors: OpError[],
) {
  const subscription = event.data.object as Stripe.Subscription;
  const customerId =
    typeof subscription.customer === 'string' ? subscription.customer : subscription.customer.id;

  const { data: user, error: userErr } = await admin
    .from('users')
    .select('id')
    .eq('stripe_customer_id', customerId)
    .single();

  if (userErr) {
    errors.push({
      operation: 'lookup_user_by_customer',
      event_id: event.id,
      event_type: event.type,
      user_id: null,
      context: { customer_id: customerId },
      message: errorMessage(userErr),
      code: extractErrorCode(userErr),
    });
    console.error('[stripe webhook] user lookup failed', { customer_id: customerId, error: serializeError(userErr) });
    return;
  }

  if (!user) return;

  const stripeStatus = subscription.status;
  const membershipStatus = mapStripeStatusToMembership(stripeStatus);
  const userId = user.id as string;
  const ctx: OpContext = {
    event_id: event.id,
    event_type: event.type,
    user_id: userId,
    extra: { stripe_status: stripeStatus },
  };

  await runOp(
    'update_subscription_status',
    ctx,
    () =>
      admin
        .from('users')
        .update({
          stripe_subscription_id: subscription.id,
          stripe_subscription_status: stripeStatus,
          membership_status: membershipStatus,
        })
        .eq('id', userId),
    errors,
  );

  const frozen = membershipStatus !== 'active';
  await runOp(
    frozen ? 'freeze_coin_account' : 'unfreeze_coin_account',
    ctx,
    () => admin.from('coin_accounts').update({ frozen }).eq('user_id', userId),
    errors,
  );
}

async function handleSubscriptionDeleted(
  admin: AdminClient,
  event: Stripe.Event,
  errors: OpError[],
) {
  const subscription = event.data.object as Stripe.Subscription;
  const customerId =
    typeof subscription.customer === 'string' ? subscription.customer : subscription.customer.id;

  const { data: user, error: userErr } = await admin
    .from('users')
    .select('id')
    .eq('stripe_customer_id', customerId)
    .single();

  if (userErr) {
    errors.push({
      operation: 'lookup_user_by_customer',
      event_id: event.id,
      event_type: event.type,
      user_id: null,
      context: { customer_id: customerId },
      message: errorMessage(userErr),
      code: extractErrorCode(userErr),
    });
    console.error('[stripe webhook] user lookup failed', { customer_id: customerId, error: serializeError(userErr) });
    return;
  }

  if (!user) return;

  // Stripe v22+: period-end lives on the items, not on the subscription root.
  const periodEnd =
    (subscription as unknown as { current_period_end?: number }).current_period_end ??
    subscription.items?.data?.[0]?.current_period_end ??
    Math.floor(Date.now() / 1000);

  const userId = user.id as string;
  const ctx: OpContext = {
    event_id: event.id,
    event_type: event.type,
    user_id: userId,
    extra: { customer_id: customerId },
  };

  await runOp(
    'expire_membership',
    ctx,
    () =>
      admin
        .from('users')
        .update({
          stripe_subscription_status: 'canceled',
          membership_status: 'expired',
          membership_expires_at: new Date(periodEnd * 1000).toISOString(),
        })
        .eq('id', userId),
    errors,
  );

  await runOp(
    'freeze_coin_account',
    ctx,
    () => admin.from('coin_accounts').update({ frozen: true }).eq('user_id', userId),
    errors,
  );
}
