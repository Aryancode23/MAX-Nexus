"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { logActivity } from "@/lib/activityLog";

function parseForm(formData: FormData) {
  return {
    name: String(formData.get("name") || "").trim(),
    slug: String(formData.get("slug") || "").trim().toLowerCase().replace(/[^a-z0-9-]+/g, "-"),
    description: String(formData.get("description") || "").trim(),
    category: String(formData.get("category") || "General").trim(),
    preview_image_url: String(formData.get("preview_image_url") || "").trim() || null,
    target_tool_slug: String(formData.get("target_tool_slug") || "").trim() || null,
    status: String(formData.get("status") || "draft"),
    sort_order: Number(formData.get("sort_order") || 0),
  };
}

export async function createTemplate(formData: FormData): Promise<{ error?: string }> {
  const values = parseForm(formData);
  if (!values.name || !values.slug) return { error: "Name and slug are required." };
  const supabase = createClient();
  const { error } = await supabase.from("templates").insert(values);
  if (error) return { error: error.message.includes("duplicate") ? "A template with that slug already exists." : "Could not create the template." };
  await logActivity("Added template", "template", values.name);
  revalidatePath("/admin/templates");
  revalidatePath("/templates");
  redirect("/admin/templates");
}

export async function updateTemplate(id: string, formData: FormData): Promise<{ error?: string }> {
  const values = parseForm(formData);
  if (!values.name || !values.slug) return { error: "Name and slug are required." };
  const supabase = createClient();
  const { error } = await supabase.from("templates").update(values).eq("id", id);
  if (error) return { error: "Could not update the template." };
  await logActivity("Edited template", "template", values.name);
  revalidatePath("/admin/templates");
  revalidatePath("/templates");
  redirect("/admin/templates");
}

export async function deleteTemplate(id: string) {
  const supabase = createClient();
  const { data } = await supabase.from("templates").select("name").eq("id", id).maybeSingle();
  await supabase.from("templates").delete().eq("id", id);
  await logActivity("Deleted template", "template", data?.name);
  revalidatePath("/admin/templates");
  revalidatePath("/templates");
}
