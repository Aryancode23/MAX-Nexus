import { createClient } from "@/lib/supabase/server";

export async function getAllMedia() {
  const supabase = createClient();
  const { data, error } = await supabase.from("media").select("*").order("created_at", { ascending: false });
  return { data: data ?? [], error };
}
