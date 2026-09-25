"use server";
import { createClient } from "@/lib/supabase/server";
import { checkAndRecordRateLimit, getClientIp } from "./rateLimit";

interface FeedbackState { error?: string; success?: boolean; }

export async function submitFeedback(_prevState: FeedbackState, formData: FormData): Promise<FeedbackState> {
  const type = String(formData.get("type") || "suggestion");
  const message = String(formData.get("message") || "").trim();
  const email = String(formData.get("email") || "").trim() || null;
  const pageUrl = String(formData.get("page_url") || "").trim() || null;

  if (!message) return { error: "Please write a message." };

  const ip = await getClientIp();
  const rate = await checkAndRecordRateLimit(ip, "feedback", 5, 60);
  if (!rate.allowed) return { error: `Too many submissions from here. Try again in ${rate.retryAfterMinutes} minute${rate.retryAfterMinutes === 1 ? "" : "s"}.` };

  const supabase = createClient();
  // RLS ("Anyone can submit feedback" in phase11-schema.sql) allows this
  // insert from anyone, logged in or not — but the same policy set means
  // nobody but an admin can read it back.
  const { error } = await supabase.from("feedback").insert({ type, message, email, page_url: pageUrl });
  if (error) return { error: "Could not submit feedback. Please try again." };
  return { success: true };
}

export async function getAllFeedbackForAdmin() {
  const supabase = createClient();
  const { data, error } = await supabase.from("feedback").select("*").order("created_at", { ascending: false });
  return { data: data ?? [], error };
}
