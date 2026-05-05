// GSR-DOC-208: POST /api/billing/portal
// Creates a Stripe Billing Portal session for the authenticated user so they
// can manage their subscription, update payment method, view invoices, etc.
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { createPortalSession } from '@/lib/stripe/portal';
import { env } from '@/lib/env';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const RequestSchema = z.object({
  returnUrl: z.string().url().optional(),
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

  let body: z.infer<typeof RequestSchema> = {};
  try {
    const raw = await request.json().catch(() => ({}));
    body = RequestSchema.parse(raw);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Invalid request body';
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data: dbUser, error: dbErr } = await admin
    .from('users')
    .select('stripe_customer_id')
    .eq('id', user.id)
    .single();

  if (dbErr || !dbUser?.stripe_customer_id) {
    return NextResponse.json(
      { error: 'No Stripe customer on file. Start a membership or purchase coins first.' },
      { status: 400 },
    );
  }

  try {
    const session = await createPortalSession({
      customerId: dbUser.stripe_customer_id as string,
      returnUrl: body.returnUrl,
    });
    return NextResponse.json({ url: session.url });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Could not open billing portal';
    console.error('[billing/portal] failed', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
