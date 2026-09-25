"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { logActivity } from "@/lib/activityLog";

const MAX_ATTEMPTS = 5;
const LOCKOUT_MINUTES = 15;

interface LoginState {
  error?: string;
  mfaRequired?: boolean;
  email?: string;
  password?: string;
}

export async function signIn(_prevState: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");
  const code = String(formData.get("code") || "").trim();

  if (!email || !password) return { error: "Enter your email and password." };

  const admin = createAdminClient();

  // Rate-limit check happens BEFORE calling Supabase Auth at all, against a
  // table with zero public RLS policies — an attacker can't read or reset
  // this themselves, only this server-side code (service role) can.
  const { data: attempt } = await admin.from("login_attempts").select("*").eq("email", email).maybeSingle();

  if (attempt?.locked_until && new Date(attempt.locked_until) > new Date()) {
    const minutesLeft = Math.ceil((new Date(attempt.locked_until).getTime() - Date.now()) / 60000);
    return { error: `Too many failed attempts. Try again in ${minutesLeft} minute${minutesLeft === 1 ? "" : "s"}.` };
  }

  const supabase = createClient();
  const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });

  async function recordFailure() {
    const nextCount = (attempt?.attempt_count ?? 0) + 1;
    await admin.from("login_attempts").upsert({
      email,
      attempt_count: nextCount,
      locked_until: nextCount >= MAX_ATTEMPTS ? new Date(Date.now() + LOCKOUT_MINUTES * 60000).toISOString() : null,
      last_attempt: new Date().toISOString(),
    });
  }

  if (signInError) {
    await recordFailure();
    return { error: "Invalid email or password." };
  }

  // Confirm this account actually has admin-level access before granting a
  // session that middleware.ts will otherwise treat as authenticated.
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user!.id).maybeSingle();
  const isAdmin = profile?.role && ["admin", "super_admin", "editor", "support"].includes(profile.role);

  if (!isAdmin) {
    await supabase.auth.signOut();
    await recordFailure();
    return { error: "This account doesn't have admin access." };
  }

  // Step-up to TOTP if this account has a verified authenticator enrolled.
  const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();

  if (aal && aal.nextLevel === "aal2" && aal.currentLevel !== "aal2") {
    const { data: factorsData } = await supabase.auth.mfa.listFactors();
    const totpFactor = factorsData?.totp?.find((f) => f.status === "verified");

    if (!totpFactor) {
      // Shouldn't happen (nextLevel implies a verified factor exists), but
      // fail safe rather than letting anyone through.
      await supabase.auth.signOut();
      return { error: "This account requires two-factor verification, but no verified authenticator was found. Contact another admin." };
    }

    if (!code) {
      // First pass: password confirmed, now ask for the 6-digit code.
      // The session is valid at aal1 only — not enough for /admin yet,
      // middleware.ts will still block it until the code below succeeds.
      return { mfaRequired: true, email, password };
    }

    const { error: verifyError } = await supabase.auth.mfa.challengeAndVerify({ factorId: totpFactor.id, code });

    if (verifyError) {
      await recordFailure();
      return { mfaRequired: true, email, password, error: "Incorrect code. Check your authenticator app and try again." };
    }
  }

  await admin.from("login_attempts").delete().eq("email", email);
  await logActivity("Signed in", "session", email);
  redirect("/admin");
}

export async function signOutAction() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  await supabase.auth.signOut();
  if (user?.email) await logActivity("Signed out", "session", user.email);
  redirect("/admin/login");
}
