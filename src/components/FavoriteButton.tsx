"use client";

import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { isFavorite, toggleFavorite, STORAGE_EVENT } from "@/lib/localFavorites";
import { toggleUserFavorite, getUserFavorites } from "@/lib/user-library";
import { useAuth } from "./AuthProvider";

export function FavoriteButton({ slug, className }: { slug: string; className?: string }) {
  const { user } = useAuth();
  const [fav, setFav] = useState(false);

  useEffect(() => {
    if (user) {
      getUserFavorites().then((slugs) => setFav(slugs.includes(slug)));
      return;
    }
    setFav(isFavorite(slug));
    const onChange = () => setFav(isFavorite(slug));
    window.addEventListener(STORAGE_EVENT, onChange);
    return () => window.removeEventListener(STORAGE_EVENT, onChange);
  }, [slug, user]);

  return (
    <button
      onClick={async (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (user) {
          const result = await toggleUserFavorite(slug);
          if (result) setFav(result.favorited);
        } else {
          toggleFavorite(slug);
        }
      }}
      aria-label={fav ? "Remove from favorites" : "Add to favorites"}
      aria-pressed={fav}
      className={`focus-ring rounded-full p-1.5 transition-colors ${fav ? "text-warning" : "text-muted hover:text-text"} ${className ?? ""}`}
    >
      <Star size={16} fill={fav ? "currentColor" : "none"} />
    </button>
  );
}
