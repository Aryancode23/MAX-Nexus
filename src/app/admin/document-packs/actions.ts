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
    required_documents: String(formData.get("required_documents") || "").split("\n").map((s) => s.trim()).filter(Boolean),
    optional_documents: String(formData.get("optional_documents") || "").split("\n").map((s) => s.trim()).filter(Boolean),
    recommended_formats: String(formData.get("recommended_formats") || "").trim(),
    recommended_max_size: String(formData.get("recommended_max_size") || "").trim(),
    processing_notes: String(formData.get("processing_notes") || "").trim(),
    related_tool_slugs: String(formData.get("related_tool_slugs") || "").split(",").map((s) => s.trim()).filter(Boolean),
    disclaimer: String(formData.get("disclaimer") || "").trim() ||
      "These are commonly required documents, not verified official requirements. Requirements may vary by organization, state, application type, or authority.",
    seo_title: String(formData.get("seo_title") || "").trim(),
    seo_description: String(formData.get("seo_description") || "").trim(),
    status: String(formData.get("status") || "draft"),
    sort_order: Number(formData.get("sort_order") || 0),
  };
}

export async function createDocumentPack(formData: FormData): Promise<{ error?: string }> {
  const values = parseForm(formData);
  if (!values.name || !values.slug) return { error: "Name and slug are required." };
  const supabase = createClient();
  const { error } = await supabase.from("document_pack_templates").insert(values);
  if (error) return { error: error.message.includes("duplicate") ? "A template with that slug already exists." : "Could not create the template." };
  await logActivity("Added document pack template", "document_pack", values.name);
  revalidatePath("/admin/document-packs");
  revalidatePath("/tools/document-pack-builder");
  redirect("/admin/document-packs");
}

export async function updateDocumentPack(id: string, formData: FormData): Promise<{ error?: string }> {
  const values = parseForm(formData);
  if (!values.name || !values.slug) return { error: "Name and slug are required." };
  const supabase = createClient();
  const { error } = await supabase.from("document_pack_templates").update(values).eq("id", id);
  if (error) return { error: "Could not update the template." };
  await logActivity("Edited document pack template", "document_pack", values.name);
  revalidatePath("/admin/document-packs");
  revalidatePath("/tools/document-pack-builder");
  redirect("/admin/document-packs");
}

export async function deleteDocumentPack(id: string) {
  const supabase = createClient();
  const { data } = await supabase.from("document_pack_templates").select("name").eq("id", id).maybeSingle();
  await supabase.from("document_pack_templates").delete().eq("id", id);
  await logActivity("Deleted document pack template", "document_pack", data?.name);
  revalidatePath("/admin/document-packs");
  revalidatePath("/tools/document-pack-builder");
}
