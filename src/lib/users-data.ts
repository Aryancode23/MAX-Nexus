import { createClient } from "@/lib/supabase/server";

export async function getAllUsersForAdmin() {
  const supabase = createClient();
  const { data, error } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
  return { data: data ?? [], error };
}
