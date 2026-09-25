"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { logActivity } from "@/lib/activityLog";

function parseFaqForm(formData: FormData) {
  return {
    question: String(formData.get("question") || "").trim(),
    answer: String(formData.get("answer") || "").trim(),
    category: String(formData.get("category") || "General").trim(),
    related_tool_slugs: String(formData.get("related_tool_slugs") || "").split(",").map((k) => k.trim()).filter(Boolean),
    sort_order: Number(formData.get("sort_order") || 0),
    status: String(formData.get("status") || "published"),
  };
}

export async function createFaq(formData: FormData): Promise<{ error?: string }> {
  const values = parseFaqForm(formData);
  if (!values.question || !values.answer) return { error: "Question and answer are required." };

  const supabase = createClient();
  const { error } = await supabase.from("faqs").insert(values);
  if (error) return { error: "Could not create the FAQ." };

  await logActivity("Added FAQ", "faq", values.question);
  revalidatePath("/admin/faqs");
  revalidatePath("/faq");
  redirect("/admin/faqs");
}

export async function updateFaq(id: string, formData: FormData): Promise<{ error?: string }> {
  const values = parseFaqForm(formData);
  if (!values.question || !values.answer) return { error: "Question and answer are required." };

  const supabase = createClient();
  const { error } = await supabase.from("faqs").update(values).eq("id", id);
  if (error) return { error: "Could not update the FAQ." };

  await logActivity("Edited FAQ", "faq", values.question);
  revalidatePath("/admin/faqs");
  revalidatePath("/faq");
  redirect("/admin/faqs");
}

export async function deleteFaq(id: string) {
  const supabase = createClient();
  const { data } = await supabase.from("faqs").select("question").eq("id", id).maybeSingle();
  await supabase.from("faqs").delete().eq("id", id);
  await logActivity("Deleted FAQ", "faq", data?.question);
  revalidatePath("/admin/faqs");
  revalidatePath("/faq");
}
