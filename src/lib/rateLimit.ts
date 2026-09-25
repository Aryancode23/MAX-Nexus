"use server";
import { headers } from "next/headers";
import { createAdminClient } from "./supabase/admin";

interface RateLimitResult { allowed: boolean; retryAfterMinutes?: number; }

/**
 * Generic sliding-lockout rate limiter, same shape as the admin login
 * lockout (Phase 6) but reusable across any public write surface via the
 * "action" namespace. Reads/writes only through the service-role client —
 * the rate_limits table has zero public RLS policies, so nothing about a
 * visitor's attempt count is ever readable or resettable by them.
 */
export async function checkAndRecordRateLimit(
  key: string,
  action: string,
  maxAttempts = 5,
  windowMinutes = 60
): Promise<RateLimitResult> {
  const admin = createAdminClient();
  const { data } = await admin.from("rate_limits").select("*").eq("key", key).eq("action", action).maybeSingle();

  if (data?.locked_until && new Date(data.locked_until) > new Date()) {
    const mins = Math.ceil((new Date(data.locked_until).getTime() - Date.now()) / 60000);
    return { allowed: false, retryAfterMinutes: mins };
  }

  const nextCount = (data?.attempt_count ?? 0) + 1;
  await admin.from("rate_limits").upsert({
    key,
    action,
    attempt_count: nextCount,
    locked_until: nextCount >= maxAttempts ? new Date(Date.now() + windowMinutes * 60000).toISOString() : null,
    last_attempt: new Date().toISOString(),
  });

  return { allowed: nextCount <= maxAttempts };
}

export async function resetRateLimit(key: string, action: string) {
  const admin = createAdminClient();
  await admin.from("rate_limits").delete().eq("key", key).eq("action", action);
}

/** Best-effort client IP from standard proxy headers — Vercel sets x-forwarded-for. */
export async function getClientIp(): Promise<string> {
  const h = headers();
  return h.get("x-forwarded-for")?.split(",")[0].trim() ?? h.get("x-real-ip") ?? "unknown";
}
