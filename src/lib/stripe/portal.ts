// GSR-DOC-208: Stripe Billing Portal helper.
import type Stripe from 'stripe';
import { getStripe } from './client';
import { env } from '@/lib/env';

export interface CreatePortalSessionInput {
  customerId: string;
  returnUrl?: string;
}

export async function createPortalSession(
  input: CreatePortalSessionInput,
): Promise<Stripe.BillingPortal.Session> {
  const stripe = getStripe();
  return stripe.billingPortal.sessions.create({
    customer: input.customerId,
    return_url:
      input.returnUrl ?? `${env.NEXT_PUBLIC_APP_URL}/dashboard/billing`,
  });
}
