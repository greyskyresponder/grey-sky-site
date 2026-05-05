// GSR-DOC-208: POST /api/billing/checkout/coin-pack
// Creates a Stripe Checkout Session for a one-time coin pack purchase.
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { findOrCreateCustomer } from '@/lib/stripe/customer';
import { createCoinPackCheckoutSession } from '@/lib/stripe/checkout';
import type { CoinPackSku } from '@/lib/types/stripe';
import { env } from '@/lib/env';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const RequestSchema = z.object({
  sku: z.enum(['coins_100', 'coins_500', 'coins_1000', 'coins_2500']),
  successUrl: z.string().url().optional(),
  cancelUrl: z.string().url().optional(),
});

export async function POST(request: Request) {
  if (!env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: 'Stripe not configured' }, { status: 503 });
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

  let parsed: z.infer<typeof RequestSchema>;
  try {
    const raw = await request.json().catch(() => ({}));
    parsed = RequestSchema.parse(raw);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Invalid request body';
    return NextResponse.json({ error: message }, { status: 400 });
  }

  try {
    const customerId = await findOrCreateCustomer({
      userId: user.id,
      email: user.email,
    });

    const session = await createCoinPackCheckoutSession({
      customerId,
      userId: user.id,
      sku: parsed.sku as CoinPackSku,
      successUrl: parsed.successUrl,
      cancelUrl: parsed.cancelUrl,
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
    // resolveCoinPackPriceId throws when price env is missing — surface as 503
    const status = message.includes('no Stripe Price ID configured') ? 503 : 500;
    console.error('[billing/checkout/coin-pack] failed', err);
    return NextResponse.json({ error: message }, { status });
  }
}
