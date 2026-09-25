import { createClient } from "@/lib/supabase/server";

export async function getPublishedTemplates() {
  const supabase = createClient();
  const { data } = await supabase.from("templates").select("*").eq("status", "published").order("sort_order");
  return data ?? [];
}

export async function getAllTemplatesForAdmin() {
  const supabase = createClient();
  const { data, error } = await supabase.from("templates").select("*").order("sort_order");
  return { data: data ?? [], error };
}

export async function getTemplateByIdForAdmin(id: string) {
  const supabase = createClient();
  const { data, error } = await supabase.from("templates").select("*").eq("id", id).maybeSingle();
  return { data, error };
}
