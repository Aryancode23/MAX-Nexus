"use server";

import { createAdminClient } from "./supabase/admin";

/**
 * Best-effort — a failure here must never break the tool page it's
 * attached to. Uses the service-role client because tool_usage_counts has
 * no public RLS policies at all (see phase7-schema.sql).
 */
export async function recordToolView(slug: string) {
  try {
    const admin = createAdminClient();
    await admin.rpc("increment_tool_usage", { p_slug: slug });
  } catch {
    // Swallowed intentionally.
  }
}

export async function getToolUsageStats() {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("tool_usage_counts")
      .select("*")
      .order("view_count", { ascending: false });
    return { data: data ?? [], error };
  } catch (e: any) {
    return { data: [], error: { message: e?.message ?? "Analytics unavailable" } };
  }
}
