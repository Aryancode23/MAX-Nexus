"use client";

import { useEffect, useState } from "react";
import { Star, History, X } from "lucide-react";
import { getFavorites, getRecent, clearRecent, STORAGE_EVENT } from "@/lib/localFavorites";
import { getUserFavorites, getUserRecent, clearUserRecent } from "@/lib/user-library";
import { useAuth } from "./AuthProvider";
import type { ToolMeta } from "@/lib/tools-registry";
import { ToolGrid } from "./ToolGrid";

export function MyToolsSection({ tools }: { tools: ToolMeta[] }) {
  const { user, loading: authLoading } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [favSlugs, setFavSlugs] = useState<string[]>([]);
  const [recentSlugs, setRecentSlugs] = useState<string[]>([]);

  useEffect(() => {
    if (authLoading) return;
    setMounted(true);

    async function load() {
      if (user) {
        const [f, r] = await Promise.all([getUserFavorites(), getUserRecent()]);
        setFavSlugs(f);
        setRecentSlugs(r);
      } else {
        setFavSlugs(getFavorites());
        setRecentSlugs(getRecent());
      }
    }
    load();

    if (!user) {
      window.addEventListener(STORAGE_EVENT, load);
      return () => window.removeEventListener(STORAGE_EVENT, load);
    }
  }, [user, authLoading]);

  if (!mounted || (favSlugs.length === 0 && recentSlugs.length === 0)) return null;

  const bySlug = (slug: string) => tools.find((t) => t.slug === slug);
  const favoriteTools = favSlugs.map(bySlug).filter(Boolean) as ToolMeta[];
  const recentTools = recentSlugs.map(bySlug).filter(Boolean) as ToolMeta[];

  async function handleClearRecent() {
    if (user) await clearUserRecent();
    else clearRecent();
    setRecentSlugs([]);
  }

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
            <button onClick={handleClearRecent} className="focus-ring flex items-center gap-1 text-xs text-muted hover:text-text">
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
