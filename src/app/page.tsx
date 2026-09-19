import Link from "next/link";
import * as Icons from "lucide-react";
import { Button } from "@/components/Button";
import { ToolGrid } from "@/components/ToolGrid";
import { getCategories, getPublicTools } from "@/lib/tools-data";
import { MyToolsSection } from "@/components/MyToolsSection";

export default async function HomePage() {
  const [categories, tools] = await Promise.all([getCategories(), getPublicTools()]);
  const popularTools = tools.filter((t) => t.popular && t.status !== "disabled");

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
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
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

      <MyToolsSection tools={tools.filter((t) => t.status !== "disabled")} />

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

      {/* Popular tools */}
      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-text">Popular tools</h2>
          <Link href="/tools" className="text-sm font-medium text-primary hover:underline">
            View all
          </Link>
        </div>
        <div className="mt-4">
          <ToolGrid tools={popularTools} />
        </div>
      </section>
    </div>
  );
}
