import { createClient } from "@/lib/supabase/server";

export async function getPublishedPresets() {
  const supabase = createClient();
  const { data } = await supabase.from("fix_my_file_presets").select("*").eq("status", "published").order("sort_order");
  return data ?? [];
}

export async function getAllPresetsForAdmin() {
  const supabase = createClient();
  const { data, error } = await supabase.from("fix_my_file_presets").select("*").order("sort_order");
  return { data: data ?? [], error };
}

export async function getPresetByIdForAdmin(id: string) {
  const supabase = createClient();
  const { data, error } = await supabase.from("fix_my_file_presets").select("*").eq("id", id).maybeSingle();
  return { data, error };
}
