"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

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
  // RLS ("Admins can manage categories" in schema.sql) rejects this write
  // outright unless the signed-in user's role is admin/super_admin.
  const { error } = await supabase.from("categories").insert(values);

  if (error) {
    return { error: error.message.includes("duplicate") ? "A category with that slug already exists." : "Could not create the category." };
  }

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

  revalidatePath("/admin/categories");
  revalidatePath("/tools");
  revalidatePath("/");
  redirect("/admin/categories");
}

export async function toggleCategoryEnabled(id: string, enabled: boolean) {
  const supabase = createClient();
  await supabase.from("categories").update({ enabled }).eq("id", id);
  revalidatePath("/admin/categories");
  revalidatePath("/tools");
  revalidatePath("/");
}

export async function deleteCategory(id: string) {
  const supabase = createClient();
  // Tools referencing this category have category_id set to null on delete
  // (see schema.sql's "on delete set null") rather than being removed.
  await supabase.from("categories").delete().eq("id", id);
  revalidatePath("/admin/categories");
  revalidatePath("/tools");
  revalidatePath("/");
}
