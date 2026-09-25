import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Pinged by Vercel Cron (see vercel.json) every 3 days. Supabase's free
 * tier auto-pauses a project after 7 days with zero API activity — this
 * keeps a real query happening regularly so that never triggers, without
 * needing to upgrade to Pro or remember to check in manually.
 */
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const admin = createAdminClient();
    const { count, error } = await admin.from("tools").select("*", { count: "exact", head: true });
    if (error) throw error;
    return NextResponse.json({ ok: true, toolCount: count, pingedAt: new Date().toISOString() });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message ?? "Unknown error" }, { status: 500 });
  }
}
