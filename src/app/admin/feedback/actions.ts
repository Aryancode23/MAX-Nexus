"use server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { logActivity } from "@/lib/activityLog";

export async function updateFeedbackStatus(id: string, status: "new" | "reviewed" | "resolved") {
  const supabase = createClient();
  await supabase.from("feedback").update({ status }).eq("id", id);
  await logActivity(`Marked feedback as ${status}`, "feedback");
  revalidatePath("/admin/feedback");
}

export async function deleteFeedback(id: string) {
  const supabase = createClient();
  await supabase.from("feedback").delete().eq("id", id);
  await logActivity("Deleted feedback", "feedback");
  revalidatePath("/admin/feedback");
}
