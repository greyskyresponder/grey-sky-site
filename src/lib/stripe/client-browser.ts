// GSR-DOC-207: Stripe browser client (singleton promise)
import { loadStripe, type Stripe } from '@stripe/stripe-js';
import { env } from '@/lib/env';

let stripePromise: Promise<Stripe | null> | null = null;

export function getStripeBrowser(): Promise<Stripe | null> {
  if (!stripePromise) {
    stripePromise = loadStripe(env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);
  }
  return stripePromise;
}
