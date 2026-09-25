"use server";

import { createClient } from "@/lib/supabase/server";
import { logActivity } from "@/lib/activityLog";

interface EnrollState { error?: string; factorId?: string; qrCode?: string; secret?: string; }
interface VerifyState { error?: string; success?: boolean; factorId?: string; qrCode?: string; secret?: string; }

export async function enrollFactor(_prevState: EnrollState, _formData: FormData): Promise<EnrollState> {
  const supabase = createClient();
  const { data, error } = await supabase.auth.mfa.enroll({ factorType: "totp" });
  if (error) return { error: error.message };
  return { factorId: data.id, qrCode: data.totp.qr_code, secret: data.totp.secret };
}

export async function verifyEnrollment(_prevState: VerifyState, formData: FormData): Promise<VerifyState> {
  const factorId = String(formData.get("factorId") || "");
  const code = String(formData.get("code") || "").trim();
  const qrCode = String(formData.get("qrCode") || "");
  const secret = String(formData.get("secret") || "");

  const supabase = createClient();
  const { error } = await supabase.auth.mfa.challengeAndVerify({ factorId, code });

  if (error) {
    return { error: "Incorrect code — check your authenticator app and try again.", factorId, qrCode, secret };
  }

  await logActivity("Enabled two-factor authentication", "session");
  return { success: true };
}

export async function unenrollFactor(factorId: string) {
  const supabase = createClient();
  await supabase.auth.mfa.unenroll({ factorId });
  await logActivity("Disabled two-factor authentication", "session");
}
