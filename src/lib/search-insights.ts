"use server";
import { createAdminClient } from "./supabase/admin";

/** Best-effort — logging a miss must never affect the search UI itself. */
export async function recordFailedSearch(query: string) {
  const trimmed = query.trim();
  if (trimmed.length < 3) return;
  try {
    const admin = createAdminClient();
    await admin.from("failed_searches").insert({ query: trimmed });
  } catch {
    // Swallowed intentionally.
  }
}

export async function getFailedSearches(limit = 300) {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin.from("failed_searches").select("*").order("created_at", { ascending: false }).limit(limit);
    return { data: data ?? [], error };
  } catch (e: any) {
    return { data: [], error: { message: e?.message ?? "Unavailable" } };
  }
}
