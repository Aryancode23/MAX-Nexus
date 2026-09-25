import { createClient } from "@/lib/supabase/server";

export async function getLiveAnnouncements(limit = 5) {
  const supabase = createClient();
  const { data } = await supabase
    .from("announcements")
    .select("*")
    .eq("status", "published")
    .or(`publish_at.is.null,publish_at.lte.${new Date().toISOString()}`)
    .order("priority", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(limit);
  return data ?? [];
}

export async function getAllAnnouncementsForAdmin() {
  const supabase = createClient();
  const { data, error } = await supabase.from("announcements").select("*").order("created_at", { ascending: false });
  return { data: data ?? [], error };
}

export async function getAnnouncementByIdForAdmin(id: string) {
  const supabase = createClient();
  const { data, error } = await supabase.from("announcements").select("*").eq("id", id).maybeSingle();
  return { data, error };
}
