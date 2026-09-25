"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { logActivity } from "@/lib/activityLog";

function parseForm(formData: FormData) {
  return {
    name: String(formData.get("name") || "").trim(),
    slug: String(formData.get("slug") || "").trim().toLowerCase().replace(/[^a-z0-9-]+/g, "-"),
    file_type: String(formData.get("file_type") || "photo"),
    width_px: formData.get("width_px") ? Number(formData.get("width_px")) : null,
    height_px: formData.get("height_px") ? Number(formData.get("height_px")) : null,
    formats: String(formData.get("formats") || "").split(",").map((s) => s.trim().toLowerCase()).filter(Boolean),
    max_size_kb: formData.get("max_size_kb") ? Number(formData.get("max_size_kb")) : null,
    max_pages: formData.get("max_pages") ? Number(formData.get("max_pages")) : null,
    page_size: String(formData.get("page_size") || "") || null,
    orientation: String(formData.get("orientation") || "") || null,
    notes: String(formData.get("notes") || "").trim(),
    status: String(formData.get("status") || "published"),
    sort_order: Number(formData.get("sort_order") || 0),
  };
}

export async function createPreset(formData: FormData): Promise<{ error?: string }> {
  const values = parseForm(formData);
  if (!values.name || !values.slug) return { error: "Name and slug are required." };
  const supabase = createClient();
  const { error } = await supabase.from("fix_my_file_presets").insert(values);
  if (error) return { error: error.message.includes("duplicate") ? "A preset with that slug already exists." : "Could not create the preset." };
  await logActivity("Added preset", "preset", values.name);
  revalidatePath("/admin/presets");
  redirect("/admin/presets");
}

export async function updatePreset(id: string, formData: FormData): Promise<{ error?: string }> {
  const values = parseForm(formData);
  if (!values.name || !values.slug) return { error: "Name and slug are required." };
  const supabase = createClient();
  const { error } = await supabase.from("fix_my_file_presets").update(values).eq("id", id);
  if (error) return { error: "Could not update the preset." };
  await logActivity("Edited preset", "preset", values.name);
  revalidatePath("/admin/presets");
  redirect("/admin/presets");
}

export async function deletePreset(id: string) {
  const supabase = createClient();
  const { data } = await supabase.from("fix_my_file_presets").select("name").eq("id", id).maybeSingle();
  await supabase.from("fix_my_file_presets").delete().eq("id", id);
  await logActivity("Deleted preset", "preset", data?.name);
  revalidatePath("/admin/presets");
}
