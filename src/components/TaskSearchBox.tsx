"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { searchTools } from "@/lib/tools-registry";
import type { ToolMeta } from "@/lib/tools-registry";
import { recordFailedSearch } from "@/lib/search-insights";

interface PackResult { slug: string; name: string; description: string; }

const PLACEHOLDER_EXAMPLES = [
  "resize signature to 20 KB",
  "reduce a PDF below 1 MB",
  "prepare documents for a job application",
  "make a passport photo",
  "merge multiple PDFs",
  "convert images to PDF",
];

export function TaskSearchBox({ tools, packs }: { tools: ToolMeta[]; packs: PackResult[] }) {
  const [query, setQuery] = useState("");
  const placeholder = useMemo(() => `Try: ${PLACEHOLDER_EXAMPLES[Math.floor(Math.random() * PLACEHOLDER_EXAMPLES.length)]}…`, []);

  const toolResults = searchTools(tools, query).slice(0, 5);
  const packResults = query.trim()
    ? packs.filter((p) => p.name.toLowerCase().includes(query.toLowerCase()) || p.description.toLowerCase().includes(query.toLowerCase())).slice(0, 3)
    : [];
  const totalResults = toolResults.length + packResults.length;

  useEffect(() => {
    if (!query.trim() || totalResults > 0) return;
    const t = setTimeout(() => recordFailedSearch(query), 800);
    return () => clearTimeout(t);
  }, [query, totalResults]);

  return (
    <div className="mx-auto mt-8 max-w-xl">
      <label className="sr-only" htmlFor="task-search">What are you trying to do?</label>
      <div className="relative">
        <Search size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
        <input
          id="task-search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="focus-ring w-full rounded-control border border-border bg-surface py-3 pl-11 pr-4 text-sm shadow-soft"
        />
      </div>

      {query.trim() && (
        <div className="mt-2 rounded-card border border-border bg-surface p-2 text-left shadow-elevated">
          {totalResults === 0 && <p className="p-3 text-sm text-muted">No matches for "{query}" — try browsing all tools instead.</p>}

          {totalResults > 1 && <p className="px-3 pb-1 pt-2 text-xs text-muted">Did you mean:</p>}

          {toolResults.map((t) => (
            <Link key={t.slug} href={`/tools/${t.slug}`} className="focus-ring flex items-center justify-between rounded-control px-3 py-2 text-sm hover:bg-surface-2">
              <span className="text-text">{t.name}</span>
              <span className="text-xs text-muted">Tool</span>
            </Link>
          ))}
          {packResults.map((p) => (
            <Link key={p.slug} href={`/tools/document-pack-builder?template=${p.slug}`} className="focus-ring flex items-center justify-between rounded-control px-3 py-2 text-sm hover:bg-surface-2">
              <span className="text-text">{p.name}</span>
              <span className="text-xs text-muted">Document Pack</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
