import Link from "next/link";
import { Sparkles, Wrench, Info } from "lucide-react";
import { getLiveAnnouncements } from "@/lib/announcements-data";

const ICONS = { new: Sparkles, fix: Wrench, notice: Info };

export async function WhatsNewSection() {
  const items = await getLiveAnnouncements(5);
  if (items.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6">
      <h2 className="text-xl font-semibold text-text">What's New</h2>
      <div className="mt-4 space-y-3">
        {items.map((a) => {
          const Icon = ICONS[a.type as keyof typeof ICONS] ?? Info;
          const content = (
            <div className="flex items-start gap-3 rounded-card border border-border bg-surface p-4">
              <Icon size={18} className="mt-0.5 shrink-0 text-primary" />
              <div>
                <p className="text-sm font-medium text-text">{a.title}</p>
                {a.body && <p className="mt-0.5 text-xs text-muted">{a.body}</p>}
              </div>
            </div>
          );
          return a.link_tool_slug ? (
            <Link key={a.id} href={`/tools/${a.link_tool_slug}`} className="focus-ring block rounded-card hover:opacity-90">{content}</Link>
          ) : (
            <div key={a.id}>{content}</div>
          );
        })}
      </div>
    </section>
  );
}
