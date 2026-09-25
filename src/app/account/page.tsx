import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUserFavorites, getUserRecent } from "@/lib/user-library";
import { getPublicTools } from "@/lib/tools-data";
import { ToolGrid } from "@/components/ToolGrid";
import { LogOutButton } from "./LogOutButton";
import { Star, History, User } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/account/login");

  const [favSlugs, recentSlugs, tools] = await Promise.all([getUserFavorites(), getUserRecent(), getPublicTools()]);
  const liveTools = tools.filter((t) => t.status !== "disabled");
  const favoriteTools = favSlugs.map((s) => liveTools.find((t) => t.slug === s)).filter(Boolean) as typeof liveTools;
  const recentTools = recentSlugs.map((s) => liveTools.find((t) => t.slug === s)).filter(Boolean) as typeof liveTools;

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-control bg-primary/10 text-primary"><User size={18} /></span>
          <div>
            <p className="font-semibold text-text">{user.email}</p>
            <p className="text-xs text-muted">Your account</p>
          </div>
        </div>
        <LogOutButton />
      </div>

      <div className="mt-10">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-text"><Star size={16} className="text-warning" fill="currentColor" /> Favorites</h2>
        <div className="mt-4">
          {favoriteTools.length > 0 ? <ToolGrid tools={favoriteTools} /> : <p className="text-sm text-muted">Star a tool to find it here quickly.</p>}
        </div>
      </div>

      <div className="mt-10">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-text"><History size={16} className="text-muted" /> Recently Used</h2>
        <div className="mt-4">
          {recentTools.length > 0 ? <ToolGrid tools={recentTools} /> : <p className="text-sm text-muted">Tools you open will show up here.</p>}
        </div>
      </div>
    </div>
  );
}
