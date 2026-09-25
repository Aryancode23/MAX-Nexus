import type { ToolMeta } from "@/lib/tools-registry";
import { ToolCard } from "./ToolCard";

export function ToolGrid({ tools }: { tools: ToolMeta[] }) {
  if (tools.length === 0) {
    return (
      <div className="rounded-card border border-dashed border-border p-10 text-center text-muted">
        No tools here yet.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {tools.map((tool) => (
        <ToolCard key={tool.slug} tool={tool} />
      ))}
    </div>
  );
}
