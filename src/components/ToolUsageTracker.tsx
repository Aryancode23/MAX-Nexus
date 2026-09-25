"use client";

import { useEffect } from "react";
import { recordToolView } from "@/lib/analytics";

export function ToolUsageTracker({ slug }: { slug: string }) {
  useEffect(() => {
    recordToolView(slug);
  }, [slug]);

  return null;
}
