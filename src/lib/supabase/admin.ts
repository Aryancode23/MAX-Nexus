import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Privileged server-only client using the service_role key, which bypasses
 * Row Level Security entirely. This must NEVER be imported into a "use
 * client" file or exposed to the browser — only Server Actions and Route
 * Handlers should ever call this.
 *
 * It exists specifically for the handful of operations that must work
 * correctly even against a database an attacker could otherwise query
 * directly: login rate-limit tracking (a table with zero public policies)
 * and the immutable activity log (writable only from here, so a client-side
 * bug or RLS misconfiguration can never let someone forge or erase an
 * audit entry).
 *
 * Requires SUPABASE_SERVICE_ROLE_KEY to be set (server-only env var — do
 * NOT prefix it with NEXT_PUBLIC_, or it would be bundled into client code).
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY is not set. Add it to your environment variables (server-side only, never NEXT_PUBLIC_) — see the Supabase dashboard under Project Settings -> API -> service_role."
    );
  }

  return createSupabaseClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
