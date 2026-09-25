import { createClient } from "@/lib/supabase/server";
import type { ToolMeta, CategoryMeta } from "@/lib/tools-registry";

function mapToolRow(row: any): ToolMeta {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    shortDescription: row.description ?? "",
    category: row.categories?.slug ?? "utility",
    icon: row.icon ?? "Wrench",
    keywords: row.keywords ?? [],
    status: row.status,
    popular: row.is_popular,
    isNew: row.is_new,
    offline: row.is_offline,
    isPaid: row.is_paid,
    seoTitle: row.seo_title || row.name,
    seoDescription: row.seo_description || row.description || "",
  };
}

function mapCategoryRow(row: any): CategoryMeta {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    icon: row.icon ?? "Wrench",
    description: row.description ?? "",
  };
}

/** Categories visible on the public site. */
export async function getCategories(): Promise<CategoryMeta[]> {
  const supabase = createClient();
  const { data } = await supabase.from("categories").select("*").eq("enabled", true).order("sort_order");
  return (data ?? []).map(mapCategoryRow);
}

/** Tools visible on the public site (RLS already excludes 'disabled'). */
export async function getPublicTools(): Promise<ToolMeta[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from("tools")
    .select("*, categories(slug)")
    .order("sort_order");
  return (data ?? []).map(mapToolRow);
}

export async function getPublicToolBySlug(slug: string): Promise<ToolMeta | null> {
  const supabase = createClient();
  const { data } = await supabase
    .from("tools")
    .select("*, categories(slug)")
    .eq("slug", slug)
    .in("status", ["active", "coming_soon"])
    .maybeSingle();
  return data ? mapToolRow(data) : null;
}

/** Admin: every tool regardless of status, for the management table. */
export async function getAllToolsForAdmin() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("tools")
    .select("*, categories(slug, name)")
    .order("sort_order");
  return { data: data ?? [], error };
}

export async function getToolByIdForAdmin(id: string) {
  const supabase = createClient();
  const { data, error } = await supabase.from("tools").select("*").eq("id", id).maybeSingle();
  return { data, error };
}

export async function getAllCategoriesForAdmin() {
  const supabase = createClient();
  const { data } = await supabase.from("categories").select("*").order("sort_order");
  return data ?? [];
}

export async function getCategoryByIdForAdmin(id: string) {
  const supabase = createClient();
  const { data, error } = await supabase.from("categories").select("*").eq("id", id).maybeSingle();
  return { data, error };
}
