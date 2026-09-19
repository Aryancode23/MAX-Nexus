"use client";

import Link from "next/link";
import * as Icons from "lucide-react";
import { motion } from "framer-motion";
import type { ToolMeta } from "@/lib/tools-registry";
import { Badge } from "./Badge";
import { FavoriteButton } from "./FavoriteButton";

export function ToolCard({ tool }: { tool: ToolMeta }) {
  const Icon = (Icons as any)[tool.icon] ?? Icons.Wrench;
  const disabled = tool.status === "coming_soon";

  const content = (
    <motion.div
      whileHover={disabled ? undefined : { y: -3 }}
      transition={{ duration: 0.15 }}
      className="group h-full rounded-card border border-border bg-surface p-5 shadow-soft transition-shadow hover:shadow-elevated"
    >
      <div className="flex items-start justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-control bg-primary/10 text-primary">
          <Icon size={20} />
        </div>
        <div className="flex items-center gap-1">
          {tool.isNew && <Badge tone="accent">New</Badge>}
          {tool.popular && <Badge tone="success">Popular</Badge>}
          {tool.isPaid && <Badge tone="warning">Pro</Badge>}
          <FavoriteButton slug={tool.slug} />
        </div>
      </div>
      <h3 className="mt-4 font-semibold text-text">{tool.name}</h3>
      <p className="mt-1 text-sm text-muted line-clamp-2">{tool.shortDescription}</p>
      <div className="mt-4 flex items-center justify-between text-xs">
        {tool.offline ? (
          <span className="inline-flex items-center gap-1 text-muted">
            <Icons.Lock size={12} /> Processed in your browser
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-muted">
            <Icons.Cloud size={12} /> Server processed
          </span>
        )}
        {disabled && <span className="font-medium text-warning">Coming soon</span>}
      </div>
    </motion.div>
  );

  if (disabled) {
    return <div className="cursor-not-allowed opacity-70">{content}</div>;
  }

  return (
    <Link href={`/tools/${tool.slug}`} className="focus-ring block h-full rounded-card">
      {content}
    </Link>
  );
}
