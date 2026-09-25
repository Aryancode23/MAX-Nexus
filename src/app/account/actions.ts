"use server";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { migrateLocalLibrary } from "@/lib/user-library";
import { checkAndRecordRateLimit, resetRateLimit, getClientIp } from "@/lib/rateLimit";

interface AuthState { error?: string; success?: boolean; }

export async function signUpAction(_prevState: AuthState, formData: FormData): Promise<AuthState> {
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");
  const favoriteSlugs = JSON.parse(String(formData.get("favorite_slugs") || "[]"));
  const recentSlugs = JSON.parse(String(formData.get("recent_slugs") || "[]"));

  if (!email || password.length < 6) return { error: "Enter a valid email and a password of at least 6 characters." };

  // Rate-limited by IP rather than email — this is signup, so there's no
  // existing account to key on, and limiting by IP still stops mass
  // account creation from one source.
  const ip = await getClientIp();
  const rate = await checkAndRecordRateLimit(ip, "signup", 5, 60);
  if (!rate.allowed) return { error: `Too many signup attempts from here. Try again in ${rate.retryAfterMinutes} minute${rate.retryAfterMinutes === 1 ? "" : "s"}.` };

  const supabase = createClient();
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) return { error: error.message.includes("already registered") ? "That email is already registered — try logging in instead." : "Could not create your account." };

  // If email confirmation is off, signUp already returns a session — migrate now.
  if (data.session) {
    await migrateLocalLibrary(favoriteSlugs, recentSlugs);
    redirect("/account");
  }

  return { success: true }; // "check your email to confirm" state
}

export async function logInAction(_prevState: AuthState, formData: FormData): Promise<AuthState> {
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");
  const favoriteSlugs = JSON.parse(String(formData.get("favorite_slugs") || "[]"));
  const recentSlugs = JSON.parse(String(formData.get("recent_slugs") || "[]"));

  if (!email || !password) return { error: "Enter your email and password." };

  const rate = await checkAndRecordRateLimit(email, "account_login", 5, 15);
  if (!rate.allowed) return { error: `Too many failed attempts. Try again in ${rate.retryAfterMinutes} minute${rate.retryAfterMinutes === 1 ? "" : "s"}.` };

  const supabase = createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: "Invalid email or password." };

  await resetRateLimit(email, "account_login");
  await migrateLocalLibrary(favoriteSlugs, recentSlugs);
  redirect("/account");
}

export async function logOutAction() {
  const supabase = createClient();
  await supabase.auth.signOut();
  redirect("/");
}
