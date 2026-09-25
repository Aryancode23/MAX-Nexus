"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { logActivity } from "@/lib/activityLog";

const KEYS = ["site_name", "contact_phone", "developer_support_phone", "instagram_url", "default_seo_title", "default_seo_description"];

interface SettingsState { error?: string; success?: boolean; }

export async function updateSettings(_prevState: SettingsState, formData: FormData): Promise<SettingsState> {
  const supabase = createClient();

  const rows = KEYS.map((key) => ({ key, value: String(formData.get(key) || "").trim() }));

  // RLS ("Admins can manage settings" in phase9-schema.sql) rejects this
  // write unless the signed-in user's role is admin/super_admin.
  const { error } = await supabase.from("settings").upsert(rows);
  if (error) return { error: "Could not save settings." };

  await logActivity("Updated site settings", "settings");
  revalidatePath("/", "layout");
  return { success: true };
}
