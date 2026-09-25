import { ToolGrid } from "@/components/ToolGrid";
import { getCategories, getPublicTools } from "@/lib/tools-data";

export const metadata = { title: "All Tools" };
export const dynamic = "force-dynamic";

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
            href={`/tools?category=${c.slug}#cat-${c.slug}`}
            className={`rounded-full border border-border px-3 py-1.5 text-sm ${
              activeCategory === c.slug ? "bg-primary text-primary-foreground" : "bg-surface text-muted hover:text-text"
            }`}
          >
            {c.name}
          </a>
        ))}
      </div>

      {activeCategory ? (
        // A specific category was picked — show just that grid, unchanged behavior.
        <div className="mt-8">
          <ToolGrid tools={filtered} />
        </div>
      ) : (
        // Default "All" view — every tool stays grouped under its own category,
        // in the order categories are configured, instead of one mixed grid.
        // This is what actually keeps things easy to locate as the tool count
        // grows: a photo tool never appears mixed in next to a PDF tool.
        <div className="mt-10 space-y-10">
          {categories.map((c) => {
            const toolsInCategory = liveTools.filter((t) => t.category === c.slug);
            if (toolsInCategory.length === 0) return null;
            return (
              <section key={c.slug} id={`cat-${c.slug}`} className="scroll-mt-20">
                <div className="flex items-baseline justify-between">
                  <h2 className="text-lg font-semibold text-text">{c.name}</h2>
                  <span className="text-xs text-muted">{toolsInCategory.length} tools</span>
                </div>
                {c.description && <p className="mt-0.5 text-sm text-muted">{c.description}</p>}
                <div className="mt-4">
                  <ToolGrid tools={toolsInCategory} />
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
