import Link from "next/link";
import { Clock, User } from "lucide-react";
import { getPublishedGuides } from "@/lib/guides-data";

export const metadata = { title: "Guides" };
export const dynamic = "force-dynamic";

export default async function GuidesPage() {
  const guides = await getPublishedGuides();

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <h1 className="text-2xl font-bold text-text">MAX Guides</h1>
      <p className="mt-1 text-muted">Step-by-step help for getting things done with MAX Nexus.</p>

      {guides.length === 0 ? (
        <div className="mt-8 rounded-card border border-dashed border-border p-10 text-center text-muted">
          No guides published yet — check back soon.
        </div>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {guides.map((g) => (
            <Link
              key={g.id}
              href={`/guides/${g.slug}`}
              className="focus-ring rounded-card border border-border bg-surface p-5 shadow-soft transition-shadow hover:shadow-elevated"
            >
              {g.category && <p className="text-xs font-medium uppercase tracking-wide text-primary">{g.category}</p>}
              <h2 className="mt-1 font-semibold text-text">{g.title}</h2>
              <div className="mt-3 flex items-center gap-3 text-xs text-muted">
                <span className="flex items-center gap-1"><User size={12} /> {g.author}</span>
                <span className="flex items-center gap-1"><Clock size={12} /> {g.reading_time} min read</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
