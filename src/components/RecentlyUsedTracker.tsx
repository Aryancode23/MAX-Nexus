"use client";

import { useEffect } from "react";
import { addRecent } from "@/lib/localFavorites";

export function RecentlyUsedTracker({ slug }: { slug: string }) {
  useEffect(() => {
    addRecent(slug);
  }, [slug]);

  return null;
}
