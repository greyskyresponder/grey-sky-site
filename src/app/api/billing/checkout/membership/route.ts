// GSR-DOC-208: POST /api/billing/checkout/membership
// Creates a Stripe Checkout Session for the annual membership subscription.
// Auth: requires a logged-in user; the session is created against that user only.
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { findOrCreateCustomer } from '@/lib/stripe/customer';
import { createMembershipCheckoutSession } from '@/lib/stripe/checkout';
import { env } from '@/lib/env';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const RequestSchema = z.object({
  successUrl: z.string().url().optional(),
  cancelUrl: z.string().url().optional(),
});

export async function POST(request: Request) {
  if (!env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: 'Stripe not configured' }, { status: 503 });
  }
  if (!env.STRIPE_MEMBERSHIP_PRICE_ID) {
    return NextResponse.json(
      { error: 'Membership price not configured' },
      { status: 503 },
    );
  }

  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  const user = authData.user;
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }
  if (!user.email) {
    return NextResponse.json({ error: 'Account email missing' }, { status: 400 });
  }

  let body: z.infer<typeof RequestSchema> = {};
  try {
    const raw = await request.json().catch(() => ({}));
    body = RequestSchema.parse(raw);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Invalid request body';
    return NextResponse.json({ error: message }, { status: 400 });
  }

  try {
    const customerId = await findOrCreateCustomer({
      userId: user.id,
      email: user.email,
    });

    const session = await createMembershipCheckoutSession({
      customerId,
      userId: user.id,
      successUrl: body.successUrl,
      cancelUrl: body.cancelUrl,
    });

    if (!session.url) {
      return NextResponse.json(
        { error: 'Stripe did not return a checkout URL' },
        { status: 502 },
      );
    }

    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Checkout failed';
    console.error('[billing/checkout/membership] failed', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
