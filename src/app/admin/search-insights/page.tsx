import { Search } from "lucide-react";
import { getFailedSearches } from "@/lib/search-insights";

export const dynamic = "force-dynamic";

export default async function SearchInsightsPage() {
  const { data, error } = await getFailedSearches();

  const counts = new Map<string, number>();
  for (const row of data) {
    const key = row.query.toLowerCase();
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  const grouped = Array.from(counts.entries())
    .map(([query, count]) => ({ query, count }))
    .sort((a, b) => b.count - a.count);

  return (
    <div>
      <h1 className="text-xl font-bold text-text">Search Insights</h1>
      <p className="mt-1 text-sm text-muted">
        What people typed into "What are you trying to do?" that matched nothing — a direct list of what to
        build next, ranked by how often it comes up.
      </p>

      {error && <p className="mt-4 text-sm text-danger">Couldn't load search insights ({error.message}). Make sure phase11-schema.sql has been run.</p>}

      {grouped.length === 0 && !error && (
        <div className="mt-8 flex flex-col items-center gap-2 rounded-card border border-dashed border-border p-10 text-center text-muted">
          <Search size={24} />
          <p>No unmatched searches yet.</p>
        </div>
      )}

      {grouped.length > 0 && (
        <div className="mt-6 overflow-hidden rounded-card border border-border bg-surface">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border text-xs uppercase text-muted">
              <tr><th className="px-4 py-3">Query</th><th className="px-4 py-3">Times searched</th></tr>
            </thead>
            <tbody className="divide-y divide-border">
              {grouped.map((g) => (
                <tr key={g.query}>
                  <td className="px-4 py-3 text-text">{g.query}</td>
                  <td className="px-4 py-3 text-muted">{g.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
