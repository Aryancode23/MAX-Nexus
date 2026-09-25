"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { logActivity } from "@/lib/activityLog";

const ROLES = ["user", "support", "editor", "admin", "super_admin"];

export async function updateUserRole(targetId: string, role: string): Promise<{ error?: string }> {
  if (!ROLES.includes(role)) return { error: "Invalid role." };

  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user?.id === targetId) return { error: "You can't change your own role from this page — ask another admin." };

  // RLS ("Admins can update any profile" in phase9-schema.sql) rejects
  // this write unless the signed-in user's own role is admin/super_admin.
  const { data: target } = await supabase.from("profiles").select("email").eq("id", targetId).maybeSingle();
  const { error } = await supabase.from("profiles").update({ role }).eq("id", targetId);
  if (error) return { error: "Could not update this user's role." };

  await logActivity(`Changed role to ${role}`, "user", target?.email);
  revalidatePath("/admin/users");
  return {};
}

export async function toggleUserBan(targetId: string, ban: boolean): Promise<void> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user?.id === targetId) return; // Self-ban guard — silently refuse; the page already warns this isn't allowed.

  const admin = createAdminClient();
  const { data: target } = await supabase.from("profiles").select("email").eq("id", targetId).maybeSingle();

  // Banning is a Supabase Auth-level action (blocks sign-in entirely), so it
  // requires the service-role client — this isn't something RLS on our own
  // tables can express, since it's about auth.users, not our data.
  await admin.auth.admin.updateUserById(targetId, { ban_duration: ban ? "876000h" : "none" });

  await logActivity(ban ? "Banned user" : "Unbanned user", "user", target?.email);
  revalidatePath("/admin/users");
}
