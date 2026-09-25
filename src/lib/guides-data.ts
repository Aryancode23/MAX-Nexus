import { createClient } from "@/lib/supabase/server";

export async function getPublishedGuides() {
  const supabase = createClient();
  const { data } = await supabase
    .from("guides")
    .select("*")
    .eq("status", "published")
    .order("published_at", { ascending: false });
  return data ?? [];
}

export async function getPublishedGuideBySlug(slug: string) {
  const supabase = createClient();
  const { data } = await supabase.from("guides").select("*").eq("slug", slug).eq("status", "published").maybeSingle();
  return data;
}

export async function getAllGuidesForAdmin() {
  const supabase = createClient();
  const { data, error } = await supabase.from("guides").select("*").order("created_at", { ascending: false });
  return { data: data ?? [], error };
}

export async function getGuideByIdForAdmin(id: string) {
  const supabase = createClient();
  const { data, error } = await supabase.from("guides").select("*").eq("id", id).maybeSingle();
  return { data, error };
}
