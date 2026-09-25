"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { logActivity } from "@/lib/activityLog";

const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/webp", "image/svg+xml"];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

export async function uploadMedia(_prevState: { error?: string }, formData: FormData): Promise<{ error?: string }> {
  const file = formData.get("file") as File | null;
  if (!file || file.size === 0) return { error: "Choose a file first." };

  if (!ALLOWED_TYPES.includes(file.type)) {
    return { error: "Only PNG, JPEG, WebP or SVG files are allowed." };
  }
  if (file.size > MAX_SIZE) {
    return { error: "File is too large — the limit is 5 MB." };
  }

  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Sanitize the filename and make it unique — never trust the client-supplied name as-is.
  const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_").slice(-100);
  const path = `${Date.now()}-${safeName}`;

  const bytes = await file.arrayBuffer();
  // Storage RLS ("Admins and editors can upload media files" in
  // phase6-schema.sql) rejects this upload unless the signed-in user's
  // role is admin/super_admin/editor — enforced by the database, not just
  // this check.
  const { error: uploadError } = await supabase.storage.from("media").upload(path, bytes, { contentType: file.type });

  if (uploadError) {
    return { error: uploadError.message.includes("row-level security") ? "You don't have permission to upload files." : "Upload failed. Make sure the 'media' storage bucket exists (see README)." };
  }

  const { data: urlData } = supabase.storage.from("media").getPublicUrl(path);

  await supabase.from("media").insert({
    file_name: file.name,
    storage_path: path,
    public_url: urlData.publicUrl,
    file_type: file.type,
    file_size: file.size,
    uploaded_by_email: user?.email,
  });

  await logActivity("Uploaded media", "media", file.name);
  revalidatePath("/admin/media");
  return {};
}

export async function deleteMedia(id: string, storagePath: string) {
  const supabase = createClient();
  await supabase.storage.from("media").remove([storagePath]);
  const { data } = await supabase.from("media").select("file_name").eq("id", id).maybeSingle();
  await supabase.from("media").delete().eq("id", id);
  await logActivity("Deleted media", "media", data?.file_name);
  revalidatePath("/admin/media");
}
