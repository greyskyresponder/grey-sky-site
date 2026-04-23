import { createClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";

// Service role client — NEVER expose to browser.
// Only use in server-side code (API routes, server actions).
export function createAdminClient() {
  if (!env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('[supabase] SUPABASE_SERVICE_ROLE_KEY is not configured');
  }
  return createClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY
  );
}
