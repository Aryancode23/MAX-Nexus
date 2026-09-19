"use client";

import { useEffect, useState } from "react";
import { Star, History, X } from "lucide-react";
import { getFavorites, getRecent, clearRecent, STORAGE_EVENT } from "@/lib/localFavorites";
import type { ToolMeta } from "@/lib/tools-registry";
import { ToolGrid } from "./ToolGrid";

export function MyToolsSection({ tools }: { tools: ToolMeta[] }) {
  const [mounted, setMounted] = useState(false);
  const [favSlugs, setFavSlugs] = useState<string[]>([]);
  const [recentSlugs, setRecentSlugs] = useState<string[]>([]);

  useEffect(() => {
    setMounted(true);
    const load = () => {
      setFavSlugs(getFavorites());
      setRecentSlugs(getRecent());
    };
    load();
    window.addEventListener(STORAGE_EVENT, load);
    return () => window.removeEventListener(STORAGE_EVENT, load);
  }, []);

  if (!mounted || (favSlugs.length === 0 && recentSlugs.length === 0)) return null;

  const bySlug = (slug: string) => tools.find((t) => t.slug === slug);
  const favoriteTools = favSlugs.map(bySlug).filter(Boolean) as ToolMeta[];
  const recentTools = recentSlugs.map(bySlug).filter(Boolean) as ToolMeta[];

  return (
    <section className="mx-auto max-w-7xl px-4 pb-4 sm:px-6">
      {favoriteTools.length > 0 && (
        <div className="mb-10">
          <h2 className="flex items-center gap-2 text-xl font-semibold text-text">
            <Star size={18} className="text-warning" fill="currentColor" /> My Favorites
          </h2>
          <div className="mt-4">
            <ToolGrid tools={favoriteTools} />
          </div>
        </div>
      )}

      {recentTools.length > 0 && (
        <div className="mb-10">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-xl font-semibold text-text">
              <History size={18} className="text-muted" /> Continue Where You Left Off
            </h2>
            <button
              onClick={() => { clearRecent(); setRecentSlugs([]); }}
              className="focus-ring flex items-center gap-1 text-xs text-muted hover:text-text"
            >
              <X size={12} /> Clear history
            </button>
          </div>
          <div className="mt-4">
            <ToolGrid tools={recentTools} />
          </div>
        </div>
      )}
    </section>
  );
}
