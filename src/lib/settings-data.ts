import { createClient } from "@/lib/supabase/server";

export interface SiteSettings {
  site_name: string;
  contact_phone: string;
  developer_support_phone: string;
  instagram_url: string;
  default_seo_title: string;
  default_seo_description: string;
}

const DEFAULTS: SiteSettings = {
  site_name: "MAX Nexus",
  contact_phone: "+91 7979758649",
  developer_support_phone: "+91 7052164122",
  instagram_url: "https://www.instagram.com/shabashji/",
  default_seo_title: "MAX Nexus — Everyday Digital Work, Made Simple",
  default_seo_description:
    "Free online tools for photos, PDFs, documents, signatures, forms and everyday productivity — all in one place.",
};

/** Falls back to hardcoded defaults if the table doesn't exist yet (phase9-schema.sql not run) or the query fails. */
export async function getSettings(): Promise<SiteSettings> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase.from("settings").select("key, value");
    if (error || !data) return DEFAULTS;
    const map = Object.fromEntries(data.map((r) => [r.key, r.value]));
    return { ...DEFAULTS, ...map };
  } catch {
    return DEFAULTS;
  }
}
