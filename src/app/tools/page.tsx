import { ToolGrid } from "@/components/ToolGrid";
import { getCategories, getPublicTools } from "@/lib/tools-data";

export const metadata = { title: "All Tools" };

export default async function ToolsPage({
  searchParams,
}: {
  searchParams: { category?: string };
}) {
  const [categories, tools] = await Promise.all([getCategories(), getPublicTools()]);
  const liveTools = tools.filter((t) => t.status !== "disabled");
  const activeCategory = searchParams.category;
  const filtered = activeCategory ? liveTools.filter((t) => t.category === activeCategory) : liveTools;

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <h1 className="text-2xl font-bold text-text">All Tools</h1>
      <p className="mt-1 text-muted">{filtered.length} tools available</p>

      <div className="mt-6 flex flex-wrap gap-2">
        <a
          href="/tools"
          className={`rounded-full border border-border px-3 py-1.5 text-sm ${
            !activeCategory ? "bg-primary text-primary-foreground" : "bg-surface text-muted hover:text-text"
          }`}
        >
          All
        </a>
        {categories.map((c) => (
          <a
            key={c.slug}
            href={`/tools?category=${c.slug}`}
            className={`rounded-full border border-border px-3 py-1.5 text-sm ${
              activeCategory === c.slug ? "bg-primary text-primary-foreground" : "bg-surface text-muted hover:text-text"
            }`}
          >
            {c.name}
          </a>
        ))}
      </div>

      <div className="mt-8">
        <ToolGrid tools={filtered} />
      </div>
    </div>
  );
}
