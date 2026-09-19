import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";


export default async function AdminDashboardPage() {
  const supabase = createClient();

  const [
    { count: userCount },
    { count: activeToolCount },
    { count: comingSoonCount },
    { count: disabledCount },
    { count: categoryCount },
  ] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("tools").select("*", { count: "exact", head: true }).eq("status", "active"),
    supabase.from("tools").select("*", { count: "exact", head: true }).eq("status", "coming_soon"),
    supabase.from("tools").select("*", { count: "exact", head: true }).eq("status", "disabled"),
    supabase.from("categories").select("*", { count: "exact", head: true }),
  ]);

  return (
    <div>
      <h1 className="text-xl font-bold text-text">Dashboard</h1>
      <p className="mt-1 text-sm text-muted">
        Tools and categories are now managed live from this dashboard — no code changes or redeploys needed to add,
        edit, or disable a tool.
      </p>

      <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label="Active tools" value={activeToolCount ?? 0} />
        <StatCard label="Coming soon" value={comingSoonCount ?? 0} />
        <StatCard label="Disabled" value={disabledCount ?? 0} />
        <StatCard label="Categories" value={categoryCount ?? 0} />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label="Registered users" value={userCount ?? 0} />
      </div>

      <div className="mt-8 rounded-card border border-dashed border-border bg-surface p-6 text-sm text-muted">
        Tool usage, search analytics and activity logs will appear here once those tracking events are implemented —
        no placeholder numbers are shown in the meantime.
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-card border border-border bg-surface p-4">
      <p className="text-2xl font-bold text-text">{value}</p>
      <p className="text-xs text-muted">{label}</p>
    </div>
  );
}
