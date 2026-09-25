import { createClient } from "@/lib/supabase/server";

export async function getPublishedFaqs() {
  const supabase = createClient();
  const { data } = await supabase.from("faqs").select("*").eq("status", "published").order("sort_order");
  return data ?? [];
}

export async function getAllFaqsForAdmin() {
  const supabase = createClient();
  const { data, error } = await supabase.from("faqs").select("*").order("sort_order");
  return { data: data ?? [], error };
}

export async function getFaqByIdForAdmin(id: string) {
  const supabase = createClient();
  const { data, error } = await supabase.from("faqs").select("*").eq("id", id).maybeSingle();
  return { data, error };
}
