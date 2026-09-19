"use client";

import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { isFavorite, toggleFavorite, STORAGE_EVENT } from "@/lib/localFavorites";

export function FavoriteButton({ slug, className }: { slug: string; className?: string }) {
  const [fav, setFav] = useState(false);

  useEffect(() => {
    setFav(isFavorite(slug));
    const onChange = () => setFav(isFavorite(slug));
    window.addEventListener(STORAGE_EVENT, onChange);
    return () => window.removeEventListener(STORAGE_EVENT, onChange);
  }, [slug]);

  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleFavorite(slug);
      }}
      aria-label={fav ? "Remove from favorites" : "Add to favorites"}
      aria-pressed={fav}
      className={`focus-ring rounded-full p-1.5 transition-colors ${fav ? "text-warning" : "text-muted hover:text-text"} ${className ?? ""}`}
    >
      <Star size={16} fill={fav ? "currentColor" : "none"} />
    </button>
  );
}
