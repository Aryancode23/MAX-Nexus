"use server";
import { createClient } from "@/lib/supabase/server";

export interface SlotProgress { id: string; label: string; required: boolean; fileName: string; }

export async function saveDocumentPackProgress(templateSlug: string, slotData: SlotProgress[]) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  await supabase.from("document_pack_progress").upsert({
    user_id: user.id,
    template_slug: templateSlug,
    slot_data: slotData,
    updated_at: new Date().toISOString(),
  });
}

export async function getDocumentPackProgress(templateSlug: string): Promise<SlotProgress[] | null> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase.from("document_pack_progress").select("slot_data").eq("user_id", user.id).eq("template_slug", templateSlug).maybeSingle();
  return data?.slot_data ?? null;
}

export async function clearDocumentPackProgress(templateSlug: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  await supabase.from("document_pack_progress").delete().eq("user_id", user.id).eq("template_slug", templateSlug);
}
