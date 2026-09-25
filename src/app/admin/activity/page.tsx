import { History } from "lucide-react";
import { getRecentActivity } from "@/lib/activityLog";

export const dynamic = "force-dynamic";

export default async function ActivityLogPage() {
  const { data: entries, error } = await getRecentActivity(100);

  return (
    <div>
      <h1 className="text-xl font-bold text-text">Activity Log</h1>
      <p className="mt-1 text-sm text-muted">
        An immutable record of admin actions — who did what, and when. Entries here cannot be edited or deleted
        through the app.
      </p>

      {error && <p className="mt-4 text-sm text-danger">Couldn't load the activity log ({error.message}).</p>}

      {!error && entries.length === 0 && (
        <div className="mt-8 flex flex-col items-center gap-2 rounded-card border border-dashed border-border p-10 text-center text-muted">
          <History size={24} />
          <p>No activity recorded yet.</p>
        </div>
      )}

      {entries.length > 0 && (
        <div className="mt-6 overflow-x-auto rounded-card border border-border bg-surface">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border text-xs uppercase text-muted">
              <tr>
                <th className="px-4 py-3">When</th>
                <th className="px-4 py-3">Admin</th>
                <th className="px-4 py-3">Action</th>
                <th className="px-4 py-3">Item</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {entries.map((e: any) => (
                <tr key={e.id}>
                  <td className="px-4 py-3 text-muted">{new Date(e.created_at).toLocaleString()}</td>
                  <td className="px-4 py-3 text-text">{e.admin_email}</td>
                  <td className="px-4 py-3 text-text">{e.action}</td>
                  <td className="px-4 py-3 text-muted">{e.entity_name ?? "—"} <span className="text-xs">({e.entity_type})</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
