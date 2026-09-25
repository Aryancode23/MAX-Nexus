import Link from "next/link";
import * as Icons from "lucide-react";
import { Button } from "@/components/Button";
import { getCategories, getPublicTools } from "@/lib/tools-data";
import { getPublishedDocumentPacks } from "@/lib/document-packs-data";
import { MyToolsSection } from "@/components/MyToolsSection";
import { WhatsNewSection } from "@/components/WhatsNewSection";
import { TaskSearchBox } from "@/components/TaskSearchBox";

// Homepage shows categories to browse into, plus each visitor's own
// Favorites/Recent (MyToolsSection) — it does not list tools directly.
// Every tool lives on /tools inside its category; picking a category
// there is how a tool becomes visible. Don't add a tool grid or a
// direct tool link back here — see /areas/max-nexus.md.
export default async function HomePage() {
  const [categories, tools, packs] = await Promise.all([getCategories(), getPublicTools(), getPublishedDocumentPacks()]);
  const liveTools = tools.filter((t) => t.status !== "disabled");
  const packResults = packs.map((p: any) => ({ slug: p.slug, name: p.name, description: p.description || "" }));

  return (
    <div>
      {/* Hero */}
      <section className="mx-auto max-w-4xl px-4 pb-16 pt-20 text-center sm:px-6">
        <h1 className="text-4xl font-bold tracking-tight text-text sm:text-5xl">
          Everything you need for everyday digital work.
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-lg text-muted">
          Free online tools for photos, PDFs, documents, signatures and everyday productivity — all in one place.
        </p>

        <TaskSearchBox tools={liveTools} packs={packResults} />

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Link href="/tools">
            <Button size="lg">Explore Tools</Button>
          </Link>
          <Link href="/tools">
            <Button size="lg" variant="secondary">Find a Tool</Button>
          </Link>
        </div>

        <div className="mx-auto mt-6 flex max-w-md flex-wrap justify-center gap-3 text-xs text-muted">
          <span className="inline-flex items-center gap-1"><Icons.Check size={14} className="text-success" /> Free tools</span>
          <span className="inline-flex items-center gap-1"><Icons.Check size={14} className="text-success" /> No unnecessary sign-up</span>
          <span className="inline-flex items-center gap-1"><Icons.Check size={14} className="text-success" /> Mobile friendly</span>
        </div>
      </section>

      <MyToolsSection tools={liveTools} />

      {/* Categories */}
      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6">
        <h2 className="text-xl font-semibold text-text">What do you need today?</h2>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {categories.map((c) => {
            const Icon = (Icons as any)[c.icon] ?? Icons.Wrench;
            return (
              <Link
                key={c.slug}
                href={`/tools?category=${c.slug}`}
                className="focus-ring flex flex-col items-center gap-2 rounded-card border border-border bg-surface p-5 text-center shadow-soft transition-shadow hover:shadow-elevated"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-control bg-primary/10 text-primary">
                  <Icon size={20} />
                </span>
                <span className="text-sm font-medium text-text">{c.name}</span>
              </Link>
            );
          })}
        </div>
      </section>

      <WhatsNewSection />
    </div>
  );
}
