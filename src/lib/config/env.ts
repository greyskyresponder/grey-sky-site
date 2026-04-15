import { z } from 'zod';

const envSchema = z.object({
  // ── Supabase ───────────────────────────────────────────────
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  SUPABASE_DB_URL: z.string().min(1),

  // ── Application ────────────────────────────────────────────
  NEXT_PUBLIC_APP_URL: z.string().url().default('http://localhost:3000'),
  NEXT_PUBLIC_APP_NAME: z.string().default('Grey Sky Responder Society'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  // ── Stripe ─────────────────────────────────────────────────
  STRIPE_SECRET_KEY: z.string().startsWith('sk_'),
  STRIPE_WEBHOOK_SECRET: z.string().startsWith('whsec_'),
  STRIPE_MEMBERSHIP_PRICE_ID: z.string().startsWith('price_'),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().startsWith('pk_'),

  // ── Email ──────────────────────────────────────────────────
  EMAIL_MODE: z.enum(['console', 'sendgrid']).default('console'),
  SENDGRID_API_KEY: z.string().optional(),
  SENDGRID_FROM_EMAIL: z.string().email().default('noreply@greysky.dev'),

  // ── Storage ────────────────────────────────────────────────
  STORAGE_MODE: z.enum(['supabase', 'azure']).default('supabase'),
  AZURE_STORAGE_CONNECTION_STRING: z.string().optional(),
  AZURE_STORAGE_CONTAINER: z.string().default('documents'),
});

export type Env = z.infer<typeof envSchema>;

function loadEnv(): Env {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    const missing = result.error.issues
      .map((i) => `  ${i.path.join('.')}: ${i.message}`)
      .join('\n');
    throw new Error(`Environment validation failed:\n${missing}`);
  }
  return result.data;
}

// Singleton — validated once at startup
export const env = loadEnv();
