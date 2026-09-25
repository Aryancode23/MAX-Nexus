"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import * as Icons from "lucide-react";
import { searchTools } from "@/lib/tools-registry";
import type { ToolMeta } from "@/lib/tools-registry";

interface PackResult { slug: string; name: string; description: string; }

export function CommandPalette({ tools, packs = [] }: { tools: ToolMeta[]; packs?: PackResult[] }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const router = useRouter();

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const toolResults = searchTools(tools, query).slice(0, 6);
  const packResults = query.trim()
    ? packs.filter((p) => p.name.toLowerCase().includes(query.toLowerCase()) || p.description.toLowerCase().includes(query.toLowerCase())).slice(0, 3)
    : [];
  const totalResults = toolResults.length + packResults.length;

  function go(href: string) {
    setOpen(false);
    setQuery("");
    router.push(href);
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="focus-ring flex h-10 w-full max-w-sm items-center gap-2 rounded-control border border-border bg-surface-2 px-3 text-sm text-muted transition-colors hover:bg-surface"
      >
        <Icons.Search size={16} />
        <span className="flex-1 text-left">Search tools…</span>
        <kbd className="rounded border border-border bg-surface px-1.5 py-0.5 text-[10px]">Ctrl K</kbd>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 p-4 pt-[12vh]"
          onClick={() => setOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Search tools and document packs"
            className="w-full max-w-lg rounded-card border border-border bg-surface shadow-elevated"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2 border-b border-border px-4 py-3">
              <Icons.Search size={18} className="text-muted" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Try: resize signature to 20 KB…"
                className="focus-ring w-full bg-transparent text-sm outline-none placeholder:text-muted"
              />
            </div>
            <div className="max-h-80 overflow-y-auto p-2">
              {query && totalResults === 0 && (
                <p className="p-4 text-center text-sm text-muted">No matches for "{query}".</p>
              )}
              {toolResults.map((tool) => (
                <button
                  key={tool.slug}
                  onClick={() => go(`/tools/${tool.slug}`)}
                  className="focus-ring flex w-full items-center justify-between rounded-control px-3 py-2 text-left text-sm hover:bg-surface-2"
                >
                  <span>{tool.name}</span>
                  <span className="text-xs text-muted">Tool</span>
                </button>
              ))}
              {packResults.map((pack) => (
                <button
                  key={pack.slug}
                  onClick={() => go(`/tools/document-pack-builder?template=${pack.slug}`)}
                  className="focus-ring flex w-full items-center justify-between rounded-control px-3 py-2 text-left text-sm hover:bg-surface-2"
                >
                  <span>{pack.name}</span>
                  <span className="text-xs text-muted">Document Pack</span>
                </button>
              ))}
              {!query && (
                <p className="p-4 text-center text-sm text-muted">
                  Start typing a task, like "passport photo" or "job application documents".
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
