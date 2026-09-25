"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { logActivity } from "@/lib/activityLog";

function parseForm(formData: FormData) {
  const publishAt = String(formData.get("publish_at") || "");
  return {
    title: String(formData.get("title") || "").trim(),
    body: String(formData.get("body") || "").trim(),
    type: String(formData.get("type") || "notice"),
    link_tool_slug: String(formData.get("link_tool_slug") || "").trim() || null,
    priority: Number(formData.get("priority") || 0),
    status: String(formData.get("status") || "draft"),
    publish_at: publishAt ? new Date(publishAt).toISOString() : null,
  };
}

export async function createAnnouncement(formData: FormData): Promise<{ error?: string }> {
  const values = parseForm(formData);
  if (!values.title) return { error: "Title is required." };
  const supabase = createClient();
  const { error } = await supabase.from("announcements").insert(values);
  if (error) return { error: "Could not create the announcement." };
  await logActivity("Added announcement", "announcement", values.title);
  revalidatePath("/admin/announcements");
  revalidatePath("/");
  redirect("/admin/announcements");
}

export async function updateAnnouncement(id: string, formData: FormData): Promise<{ error?: string }> {
  const values = parseForm(formData);
  if (!values.title) return { error: "Title is required." };
  const supabase = createClient();
  const { error } = await supabase.from("announcements").update(values).eq("id", id);
  if (error) return { error: "Could not update the announcement." };
  await logActivity("Edited announcement", "announcement", values.title);
  revalidatePath("/admin/announcements");
  revalidatePath("/");
  redirect("/admin/announcements");
}

export async function deleteAnnouncement(id: string) {
  const supabase = createClient();
  const { data } = await supabase.from("announcements").select("title").eq("id", id).maybeSingle();
  await supabase.from("announcements").delete().eq("id", id);
  await logActivity("Deleted announcement", "announcement", data?.title);
  revalidatePath("/admin/announcements");
  revalidatePath("/");
}
