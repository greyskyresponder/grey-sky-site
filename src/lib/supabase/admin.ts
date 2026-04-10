import { createClient } from "@supabase/supabase-js";

// Service role client — NEVER expose to browser.
// Only use in server-side code (API routes, server actions).
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}
