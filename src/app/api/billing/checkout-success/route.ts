// GSR-DOC-208: GET /api/billing/checkout-success?session_id=cs_test_...
// Stripe Checkout success_url redirect target. Verifies the session belongs
// to the authenticated user, then redirects to the appropriate post-purchase
// dashboard page.
//
// IMPORTANT: This route does NOT credit coins or activate memberships. The
// webhook (checkout.session.completed) is the single source of truth for
// state mutation. This handler exists purely for UX redirection and to
// short-circuit the "thanks!" page when the webhook has already fired.
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { retrieveCheckoutSession } from '@/lib/stripe/checkout';
import { env } from '@/lib/env';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const QuerySchema = z.object({
  session_id: z.string().min(1),
});

export async function GET(request: Request) {
  if (!env.STRIPE_SECRET_KEY) {
    return NextResponse.redirect(
      `${env.NEXT_PUBLIC_APP_URL}/dashboard?error=stripe_not_configured`,
    );
  }

  const url = new URL(request.url);
  const parsed = QuerySchema.safeParse({
    session_id: url.searchParams.get('session_id'),
  });
  if (!parsed.success) {
    return NextResponse.redirect(
      `${env.NEXT_PUBLIC_APP_URL}/dashboard?error=missing_session_id`,
    );
  }

  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  const user = authData.user;
  if (!user) {
    // Send unauthenticated visitors to login; they can come back via the link
    // in their email receipt.
    return NextResponse.redirect(
      `${env.NEXT_PUBLIC_APP_URL}/login?next=/dashboard/billing`,
    );
  }

  try {
    const session = await retrieveCheckoutSession(parsed.data.session_id);
    const sessionUserId = session.metadata?.gsr_user_id;
    const sessionPurchaseType = session.metadata?.gsr_purchase_type;

    // Defense-in-depth: don't reveal another user's session details.
    if (sessionUserId && sessionUserId !== user.id) {
      return NextResponse.redirect(
        `${env.NEXT_PUBLIC_APP_URL}/dashboard?error=session_user_mismatch`,
      );
    }

    if (sessionPurchaseType === 'membership') {
      return NextResponse.redirect(
        `${env.NEXT_PUBLIC_APP_URL}/dashboard/membership?status=success`,
      );
    }
    if (sessionPurchaseType === 'coin_pack') {
      return NextResponse.redirect(
        `${env.NEXT_PUBLIC_APP_URL}/dashboard/coins?purchase=success`,
      );
    }

    return NextResponse.redirect(
      `${env.NEXT_PUBLIC_APP_URL}/dashboard/billing?status=success`,
    );
  } catch (err) {
    console.error('[billing/checkout-success] failed', err);
    return NextResponse.redirect(
      `${env.NEXT_PUBLIC_APP_URL}/dashboard?error=session_lookup_failed`,
    );
  }
}
