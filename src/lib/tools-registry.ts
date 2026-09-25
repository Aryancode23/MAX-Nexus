export type ToolStatus = "active" | "disabled" | "coming_soon";

export interface ToolMeta {
  id?: string; // present when loaded from the database
  slug: string;
  name: string;
  shortDescription: string;
  category: string; // category slug
  icon: string; // lucide-react icon name
  keywords: string[];
  status: ToolStatus;
  popular?: boolean;
  isNew?: boolean;
  offline: boolean;
  isPaid?: boolean;
  seoTitle: string;
  seoDescription: string;
}

export interface CategoryMeta {
  id?: string;
  slug: string;
  name: string;
  icon: string;
  description: string;
}

/**
 * Client-side search over an already-fetched tool list (used by the Ctrl+K
 * command palette). Tools themselves now live in the database — see
 * src/lib/tools-data.ts for how they're fetched.
 */
export function searchTools(tools: ToolMeta[], query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return tools.filter(
    (t) =>
      t.name.toLowerCase().includes(q) ||
      t.shortDescription.toLowerCase().includes(q) ||
      t.keywords.some((k) => k.includes(q))
  );
}
