"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { logActivity } from "@/lib/activityLog";

function parseCategoryForm(formData: FormData) {
  return {
    name: String(formData.get("name") || "").trim(),
    slug: String(formData.get("slug") || "").trim().toLowerCase().replace(/[^a-z0-9-]+/g, "-"),
    description: String(formData.get("description") || "").trim(),
    icon: String(formData.get("icon") || "Wrench").trim(),
    sort_order: Number(formData.get("sort_order") || 0),
    enabled: formData.get("enabled") === "on",
  };
}

export async function createCategory(formData: FormData): Promise<{ error?: string }> {
  const values = parseCategoryForm(formData);
  if (!values.name || !values.slug) return { error: "Name and slug are required." };

  const supabase = createClient();
  const { error } = await supabase.from("categories").insert(values);

  if (error) {
    return { error: error.message.includes("duplicate") ? "A category with that slug already exists." : "Could not create the category." };
  }

  await logActivity("Added category", "category", values.name);
  revalidatePath("/admin/categories");
  revalidatePath("/tools");
  revalidatePath("/");
  redirect("/admin/categories");
}

export async function updateCategory(id: string, formData: FormData): Promise<{ error?: string }> {
  const values = parseCategoryForm(formData);
  if (!values.name || !values.slug) return { error: "Name and slug are required." };

  const supabase = createClient();
  const { error } = await supabase.from("categories").update(values).eq("id", id);

  if (error) return { error: "Could not update the category." };

  await logActivity("Edited category", "category", values.name);
  revalidatePath("/admin/categories");
  revalidatePath("/tools");
  revalidatePath("/");
  redirect("/admin/categories");
}

export async function toggleCategoryEnabled(id: string, enabled: boolean) {
  const supabase = createClient();
  const { data } = await supabase.from("categories").select("name").eq("id", id).maybeSingle();
  await supabase.from("categories").update({ enabled }).eq("id", id);
  await logActivity(enabled ? "Showed category" : "Hid category", "category", data?.name);
  revalidatePath("/admin/categories");
  revalidatePath("/tools");
  revalidatePath("/");
}

export async function deleteCategory(id: string) {
  const supabase = createClient();
  const { data } = await supabase.from("categories").select("name").eq("id", id).maybeSingle();
  await supabase.from("categories").delete().eq("id", id);
  await logActivity("Deleted category", "category", data?.name);
  revalidatePath("/admin/categories");
  revalidatePath("/tools");
  revalidatePath("/");
}
