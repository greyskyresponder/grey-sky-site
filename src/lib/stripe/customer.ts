// GSR-DOC-208: Stripe customer helpers.
// Looks up an existing stripe_customer_id on the users table; creates one
// (and persists it) when missing.
import type Stripe from 'stripe';
import { getStripe } from './client';
import { createAdminClient } from '@/lib/supabase/admin';

export interface FindOrCreateCustomerInput {
  userId: string;
  email: string;
  name?: string | null;
}

/**
 * Returns the Stripe Customer id for a user, creating one if absent.
 * Idempotent: safe to call multiple times.
 */
export async function findOrCreateCustomer(
  input: FindOrCreateCustomerInput,
): Promise<string> {
  const supabase = createAdminClient();

  const { data: user, error } = await supabase
    .from('users')
    .select('stripe_customer_id, email, first_name, last_name')
    .eq('id', input.userId)
    .single();

  if (error) {
    throw new Error(`[stripe.customer] failed to load user ${input.userId}: ${error.message}`);
  }

  if (user?.stripe_customer_id) {
    return user.stripe_customer_id;
  }

  const stripe = getStripe();
  const composedName =
    [user?.first_name, user?.last_name].filter(Boolean).join(' ').trim();
  const fullName = input.name ?? (composedName === '' ? undefined : composedName);

  const customer = await stripe.customers.create({
    email: input.email,
    name: fullName,
    metadata: {
      gsr_user_id: input.userId,
    },
  });

  const { error: updateError } = await supabase
    .from('users')
    .update({ stripe_customer_id: customer.id })
    .eq('id', input.userId);

  if (updateError) {
    // We created a customer in Stripe but couldn't persist the id locally.
    // The webhook on subsequent customer events will reconcile, but log loudly.
    console.error(
      `[stripe.customer] created customer ${customer.id} but failed to persist for user ${input.userId}:`,
      updateError,
    );
  }

  return customer.id;
}

/**
 * Looks up a Stripe Customer object directly. Returns null when missing
 * or deleted (Stripe returns DeletedCustomer for those).
 */
export async function getCustomer(
  customerId: string,
): Promise<Stripe.Customer | null> {
  const stripe = getStripe();
  const customer = await stripe.customers.retrieve(customerId);
  if (customer.deleted) return null;
  return customer;
}
