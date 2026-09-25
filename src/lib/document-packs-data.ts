import { createClient } from "@/lib/supabase/server";

export async function getPublishedDocumentPacks() {
  const supabase = createClient();
  const { data } = await supabase.from("document_pack_templates").select("*").eq("status", "published").order("sort_order");
  return data ?? [];
}

export async function getPublishedDocumentPackBySlug(slug: string) {
  const supabase = createClient();
  const { data } = await supabase.from("document_pack_templates").select("*").eq("slug", slug).eq("status", "published").maybeSingle();
  return data;
}

export async function getAllDocumentPacksForAdmin() {
  const supabase = createClient();
  const { data, error } = await supabase.from("document_pack_templates").select("*").order("sort_order");
  return { data: data ?? [], error };
}

export async function getDocumentPackByIdForAdmin(id: string) {
  const supabase = createClient();
  const { data, error } = await supabase.from("document_pack_templates").select("*").eq("id", id).maybeSingle();
  return { data, error };
}
