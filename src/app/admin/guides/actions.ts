"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { logActivity } from "@/lib/activityLog";

function parseGuideForm(formData: FormData) {
  const status = String(formData.get("status") || "draft");
  return {
    title: String(formData.get("title") || "").trim(),
    slug: String(formData.get("slug") || "").trim().toLowerCase().replace(/[^a-z0-9-]+/g, "-"),
    content: String(formData.get("content") || ""),
    category: String(formData.get("category") || "").trim() || null,
    author: String(formData.get("author") || "MAX Nexus Team").trim(),
    reading_time: Number(formData.get("reading_time") || 3),
    keywords: String(formData.get("keywords") || "").split(",").map((k) => k.trim()).filter(Boolean),
    related_tool_slugs: String(formData.get("related_tool_slugs") || "").split(",").map((k) => k.trim()).filter(Boolean),
    seo_title: String(formData.get("seo_title") || "").trim(),
    seo_description: String(formData.get("seo_description") || "").trim(),
    status,
    featured: formData.get("featured") === "on",
  };
}

export async function createGuide(formData: FormData): Promise<{ error?: string }> {
  const values = parseGuideForm(formData);
  if (!values.title || !values.slug) return { error: "Title and slug are required." };

  const supabase = createClient();
  const payload = { ...values, published_at: values.status === "published" ? new Date().toISOString() : null };
  const { error } = await supabase.from("guides").insert(payload);

  if (error) return { error: error.message.includes("duplicate") ? "A guide with that slug already exists." : "Could not create the guide." };

  await logActivity("Added guide", "guide", values.title);
  revalidatePath("/admin/guides");
  revalidatePath("/guides");
  redirect("/admin/guides");
}

export async function updateGuide(id: string, formData: FormData): Promise<{ error?: string }> {
  const values = parseGuideForm(formData);
  if (!values.title || !values.slug) return { error: "Title and slug are required." };

  const supabase = createClient();
  const { data: existing } = await supabase.from("guides").select("published_at").eq("id", id).maybeSingle();
  const payload = {
    ...values,
    published_at: values.status === "published" ? (existing?.published_at ?? new Date().toISOString()) : existing?.published_at,
  };
  const { error } = await supabase.from("guides").update(payload).eq("id", id);

  if (error) return { error: "Could not update the guide." };

  await logActivity("Edited guide", "guide", values.title);
  revalidatePath("/admin/guides");
  revalidatePath("/guides");
  revalidatePath(`/guides/${values.slug}`);
  redirect("/admin/guides");
}

export async function deleteGuide(id: string) {
  const supabase = createClient();
  const { data } = await supabase.from("guides").select("title").eq("id", id).maybeSingle();
  await supabase.from("guides").delete().eq("id", id);
  await logActivity("Deleted guide", "guide", data?.title);
  revalidatePath("/admin/guides");
  revalidatePath("/guides");
}
