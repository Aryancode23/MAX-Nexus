"use client";

import { useEffect } from "react";
import { addRecent } from "@/lib/localFavorites";
import { addUserRecent } from "@/lib/user-library";
import { useAuth } from "./AuthProvider";

export function RecentlyUsedTracker({ slug }: { slug: string }) {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading) return;
    if (user) addUserRecent(slug);
    else addRecent(slug);
  }, [slug, user, loading]);

  return null;
}
