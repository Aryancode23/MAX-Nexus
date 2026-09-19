"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function parseToolForm(formData: FormData) {
  return {
    name: String(formData.get("name") || "").trim(),
    slug: String(formData.get("slug") || "").trim().toLowerCase().replace(/[^a-z0-9-]+/g, "-"),
    description: String(formData.get("description") || "").trim(),
    category_id: String(formData.get("category_id") || "") || null,
    icon: String(formData.get("icon") || "Wrench").trim(),
    keywords: String(formData.get("keywords") || "")
      .split(",")
      .map((k) => k.trim().toLowerCase())
      .filter(Boolean),
    status: String(formData.get("status") || "active"),
    is_popular: formData.get("is_popular") === "on",
    is_new: formData.get("is_new") === "on",
    is_offline: formData.get("is_offline") === "on",
    is_paid: formData.get("is_paid") === "on",
    seo_title: String(formData.get("seo_title") || "").trim(),
    seo_description: String(formData.get("seo_description") || "").trim(),
    sort_order: Number(formData.get("sort_order") || 0),
  };
}

export async function createTool(formData: FormData): Promise<{ error?: string }> {
  const values = parseToolForm(formData);
  if (!values.name || !values.slug) return { error: "Name and slug are required." };

  const supabase = createClient();
  // RLS ("Admins and editors can manage tools" in schema.sql) rejects this
  // write outright if the signed-in user isn't admin/editor — this isn't
  // just a UI check, the database itself enforces it.
  const { error } = await supabase.from("tools").insert(values);

  if (error) {
    return { error: error.message.includes("duplicate") ? "A tool with that slug already exists." : "Could not create the tool." };
  }

  revalidatePath("/admin/tools");
  revalidatePath("/tools");
  revalidatePath("/");
  redirect("/admin/tools");
}

export async function updateTool(id: string, formData: FormData): Promise<{ error?: string }> {
  const values = parseToolForm(formData);
  if (!values.name || !values.slug) return { error: "Name and slug are required." };

  const supabase = createClient();
  const { error } = await supabase.from("tools").update(values).eq("id", id);

  if (error) return { error: "Could not update the tool." };

  revalidatePath("/admin/tools");
  revalidatePath("/tools");
  revalidatePath("/");
  revalidatePath(`/tools/${values.slug}`);
  redirect("/admin/tools");
}

export async function setToolStatus(id: string, status: "active" | "disabled" | "coming_soon") {
  const supabase = createClient();
  await supabase.from("tools").update({ status }).eq("id", id);
  revalidatePath("/admin/tools");
  revalidatePath("/tools");
  revalidatePath("/");
}

export async function deleteTool(id: string) {
  const supabase = createClient();
  await supabase.from("tools").delete().eq("id", id);
  revalidatePath("/admin/tools");
  revalidatePath("/tools");
  revalidatePath("/");
}
