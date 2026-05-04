// Centralized environment variable validation.
// Fails fast at module load with a clear error listing every missing/invalid var.
import { z } from 'zod';

// ── Schemas ───────────────────────────────────────────────────────
// Public vars are inlined into client bundles by Next.js, so they must be
// referenced statically (never via dynamic keys) to survive tree-shaking.
const publicSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().min(1),
  NEXT_PUBLIC_APP_URL: z.string().url().default('http://localhost:3000'),
  NEXT_PUBLIC_APP_NAME: z.string().default('Grey Sky Responder Society'),
});

const serverSchema = z.object({
  // Needed for admin queries but basic user-scoped reads work without it
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),
  // Only needed for local migrations / CLI — not required at build or runtime on Azure SWA
  SUPABASE_DB_URL: z.string().optional(),
  // Stripe keys are only required for billing operations, not for basic dashboard rendering
  STRIPE_SECRET_KEY: z.string().min(1).optional(),
  STRIPE_WEBHOOK_SECRET: z.string().min(1).optional(),
  STRIPE_MEMBERSHIP_PRICE_ID: z.string().min(1).optional(),
  // GSR-DOC-208: coin pack price IDs (one Stripe Price per SKU). All optional;
  // billing routes that consume them validate presence at request time.
  STRIPE_PRICE_COINS_100: z.string().min(1).optional(),
  STRIPE_PRICE_COINS_500: z.string().min(1).optional(),
  STRIPE_PRICE_COINS_1000: z.string().min(1).optional(),
  STRIPE_PRICE_COINS_2500: z.string().min(1).optional(),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  EMAIL_MODE: z.enum(['console', 'sendgrid', 'disabled']).default('console'),
  SENDGRID_API_KEY: z.string().optional(),
  SENDGRID_FROM_EMAIL: z.string().email().default('noreply@greysky.dev'),
  STORAGE_MODE: z.enum(['supabase', 'azure']).default('supabase'),
  AZURE_STORAGE_CONNECTION_STRING: z.string().optional(),
  AZURE_STORAGE_CONTAINER: z.string().default('documents'),
});

export type PublicEnv = z.infer<typeof publicSchema>;
export type ServerEnv = z.infer<typeof serverSchema>;
export type Env = PublicEnv & ServerEnv;

// ── Parsing helpers ───────────────────────────────────────────────
function formatIssues(error: z.ZodError, label: string): string {
  const bullets = error.issues
    .map((issue) => {
      const name = issue.path.join('.') || '(root)';
      return `  - ${name}: ${issue.message}`;
    })
    .join('\n');
  return `[env] Invalid ${label} environment variables:\n${bullets}`;
}

function parseOrThrow<T>(schema: z.ZodType<T>, source: unknown, label: string): T {
  const result = schema.safeParse(source);
  if (result.success) return result.data;
  throw new Error(formatIssues(result.error, label));
}

// Soft parse: logs a warning and returns the parser's best-effort output so a
// runtime with partial env (e.g. Azure SWA) still boots instead of crashing.
function parseSoft<T>(schema: z.ZodType<T>, source: unknown, label: string): T {
  const result = schema.safeParse(source);
  if (result.success) return result.data;
  console.warn(formatIssues(result.error, label));
  const fallback = schema.safeParse({});
  return fallback.success ? fallback.data : ({} as T);
}

// Static references so Next.js inlines public values into the client bundle.
const publicSource = {
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
};

const isServer = typeof window === 'undefined';

const publicEnv: PublicEnv = parseOrThrow(publicSchema, publicSource, 'public');
const serverEnv: ServerEnv | null = isServer
  ? parseSoft(serverSchema, process.env, 'server')
  : null;

const SERVER_ONLY_KEYS = new Set(Object.keys(serverSchema.shape));

// Combined accessor. Server vars throw on the client so a misplaced import
// surfaces loudly instead of silently returning undefined.
const combined: Record<string, unknown> = {
  ...publicEnv,
  ...(serverEnv ?? {}),
};

export const env = new Proxy(combined as Env, {
  get(target, prop) {
    if (typeof prop !== 'string') return undefined;
    if (!isServer && SERVER_ONLY_KEYS.has(prop)) {
      throw new Error(
        `[env] "${prop}" is a server-only variable and cannot be read in the browser.`,
      );
    }
    return target[prop as keyof Env];
  },
});
