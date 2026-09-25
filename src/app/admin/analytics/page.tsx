import { BarChart3, AlertTriangle } from "lucide-react";
import { getToolUsageStats } from "@/lib/analytics";
import { getAllToolsForAdmin } from "@/lib/tools-data";

export const dynamic = "force-dynamic";

export default async function AdminAnalyticsPage() {
  const [{ data: stats, error }, { data: tools }] = await Promise.all([
    getToolUsageStats(),
    getAllToolsForAdmin(),
  ]);

  const nameBySlug = new Map(tools.map((t: any) => [t.slug, t.name]));
  const viewsBySlug = new Map(stats.map((s: any) => [s.tool_slug, s.view_count]));
  const totalViews = stats.reduce((sum: number, s: any) => sum + s.view_count, 0);
  const maxViews = Math.max(1, ...stats.map((s: any) => s.view_count));

  const activeTools = tools.filter((t: any) => t.status === "active");
  const leastOpened = [...activeTools]
    .map((t: any) => ({ slug: t.slug, name: t.name, views: viewsBySlug.get(t.slug) ?? 0 }))
    .sort((a, b) => a.views - b.views)
    .slice(0, 10);

  return (
    <div>
      <h1 className="text-xl font-bold text-text">Analytics</h1>
      <p className="mt-1 text-sm text-muted">
        Real tool-open counts, recorded each time a tool page loads. No per-visitor data is stored — just a
        running total per tool.
      </p>

      {error && (
        <p className="mt-4 text-sm text-danger">
          Couldn't load analytics ({error.message}). Make sure phase7-schema.sql has been run in Supabase.
        </p>
      )}

      <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="rounded-card border border-border bg-surface p-4">
          <p className="text-2xl font-bold text-text">{totalViews}</p>
          <p className="text-xs text-muted">Total tool opens</p>
        </div>
        <div className="rounded-card border border-border bg-surface p-4">
          <p className="text-2xl font-bold text-text">{stats.length}</p>
          <p className="text-xs text-muted">Tools with at least one open</p>
        </div>
      </div>

      {stats.length === 0 && !error && (
        <div className="mt-8 flex flex-col items-center gap-2 rounded-card border border-dashed border-border p-10 text-center text-muted">
          <BarChart3 size={24} />
          <p>No tool opens recorded yet.</p>
        </div>
      )}

      {stats.length > 0 && (
        <div className="mt-8 space-y-2">
          <p className="text-sm font-semibold text-text">Most opened tools</p>
          {stats.map((s: any) => (
            <div key={s.tool_slug} className="rounded-control border border-border bg-surface p-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-text">{nameBySlug.get(s.tool_slug) ?? s.tool_slug}</span>
                <span className="font-semibold text-text">{s.view_count}</span>
              </div>
              <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-surface-2">
                <div className="h-full bg-primary" style={{ width: `${(s.view_count / maxViews) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTools.length > 0 && (
        <div className="mt-10">
          <div className="flex items-center gap-2">
            <AlertTriangle size={16} className="text-warning" />
            <p className="text-sm font-semibold text-text">Least opened active tools</p>
          </div>
          <p className="mt-1 text-xs text-muted">
            Candidates to consolidate, de-emphasize, or disable — a starting point for keeping the site from
            getting cluttered with tools nobody's actually using. Zero opens doesn't necessarily mean "remove it"
            (a new tool needs time to be discovered), but a tool sitting at zero for a long stretch is worth a
            second look.
          </p>
          <div className="mt-3 overflow-hidden rounded-card border border-border bg-surface">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border text-xs uppercase text-muted">
                <tr><th className="px-4 py-2">Tool</th><th className="px-4 py-2">Opens</th></tr>
              </thead>
              <tbody className="divide-y divide-border">
                {leastOpened.map((t) => (
                  <tr key={t.slug}>
                    <td className="px-4 py-2 text-text">{t.name}</td>
                    <td className="px-4 py-2 text-muted">{t.views}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
