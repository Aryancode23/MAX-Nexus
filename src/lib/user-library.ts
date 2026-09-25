"use server";
import { createClient } from "@/lib/supabase/server";

// DB-backed Favorites/Recently Used — used only for logged-in visitors.
// Anonymous visitors keep using localStorage (src/lib/localFavorites.ts)
// exactly as before; nobody is required to create an account.

export async function getUserFavorites(): Promise<string[]> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  const { data } = await supabase.from("user_favorites").select("tool_slug").eq("user_id", user.id);
  return (data ?? []).map((r) => r.tool_slug);
}

export async function toggleUserFavorite(slug: string): Promise<{ favorited: boolean } | null> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: existing } = await supabase.from("user_favorites").select("tool_slug").eq("user_id", user.id).eq("tool_slug", slug).maybeSingle();

  if (existing) {
    await supabase.from("user_favorites").delete().eq("user_id", user.id).eq("tool_slug", slug);
    return { favorited: false };
  }
  await supabase.from("user_favorites").insert({ user_id: user.id, tool_slug: slug });
  return { favorited: true };
}

export async function getUserRecent(): Promise<string[]> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  const { data } = await supabase.from("user_recent").select("tool_slug").eq("user_id", user.id).order("viewed_at", { ascending: false }).limit(8);
  return (data ?? []).map((r) => r.tool_slug);
}

export async function addUserRecent(slug: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  await supabase.from("user_recent").upsert({ user_id: user.id, tool_slug: slug, viewed_at: new Date().toISOString() });
}

export async function clearUserRecent() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  await supabase.from("user_recent").delete().eq("user_id", user.id);
}

/** One-time push of localStorage favorites/recent into the account right after login/signup. */
export async function migrateLocalLibrary(favoriteSlugs: string[], recentSlugs: string[]) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  if (favoriteSlugs.length > 0) {
    await supabase.from("user_favorites").upsert(favoriteSlugs.map((tool_slug) => ({ user_id: user.id, tool_slug })));
  }
  if (recentSlugs.length > 0) {
    await supabase.from("user_recent").upsert(recentSlugs.map((tool_slug) => ({ user_id: user.id, tool_slug })));
  }
}
