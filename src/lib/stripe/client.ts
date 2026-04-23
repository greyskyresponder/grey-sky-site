// GSR-DOC-207: Stripe server client (singleton)
import Stripe from 'stripe';
import { env } from '@/lib/env';

let stripeInstance: Stripe | null = null;

export function getStripe(): Stripe {
  if (!stripeInstance) {
    if (!env.STRIPE_SECRET_KEY) {
      throw new Error('[stripe] STRIPE_SECRET_KEY is not configured');
    }
    stripeInstance = new Stripe(env.STRIPE_SECRET_KEY, {
      apiVersion: '2026-03-25.dahlia',
      typescript: true,
    });
  }
  return stripeInstance;
}
