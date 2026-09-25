import { createAdminClient } from "./supabase/admin";
import { createClient } from "./supabase/server";

/**
 * Records an admin action in the immutable activity log. Always writes via
 * the service-role client (see supabase/admin.ts) so this can never be
 * called successfully from anywhere except trusted server code, and a
 * bug elsewhere can't let a non-admin forge a log entry.
 *
 * Best-effort: a logging failure should never block the actual admin
 * action from completing, so errors here are swallowed (not thrown).
 */
export async function logActivity(action: string, entityType: string, entityName?: string) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user?.email) return;

    const admin = createAdminClient();
    await admin.from("activity_log").insert({
      admin_email: user.email,
      action,
      entity_type: entityType,
      entity_name: entityName ?? null,
    });
  } catch {
    // Logging must never break the admin action it's attached to.
  }
}

export async function getRecentActivity(limit = 50) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("activity_log")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  return { data: data ?? [], error };
}
