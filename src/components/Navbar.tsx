"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X, Sparkles } from "lucide-react";
import { CommandPalette } from "./CommandPalette";
import { ThemeToggle } from "./ThemeToggle";
import { AccountLink } from "./AccountLink";
import type { CategoryMeta, ToolMeta } from "@/lib/tools-registry";

interface PackResult { slug: string; name: string; description: string; }

export function Navbar({ categories, tools, siteName, packs = [] }: { categories: CategoryMeta[]; tools: ToolMeta[]; siteName: string; packs?: PackResult[] }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-bg/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-bold text-text">
          <span className="flex h-8 w-8 items-center justify-center rounded-control bg-primary text-primary-foreground">
            <Sparkles size={16} />
          </span>
          {siteName}
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {categories.map((c) => (
            <Link
              key={c.slug}
              href={`/tools?category=${c.slug}`}
              className="focus-ring rounded-control px-3 py-2 text-sm text-muted transition-colors hover:bg-surface-2 hover:text-text"
            >
              {c.name}
            </Link>
          ))}
        </nav>

        <div className="ml-auto hidden md:block">
          <CommandPalette tools={tools} packs={packs} />
        </div>

        <div className="hidden items-center gap-2 md:flex">
          <AccountLink />
          <ThemeToggle />
        </div>

        <button
          className="focus-ring ml-auto rounded-control p-2 md:hidden"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t border-border bg-bg p-4 md:hidden">
          <CommandPalette tools={tools} packs={packs} />
          <nav className="mt-4 flex flex-col gap-1">
            {categories.map((c) => (
              <Link
                key={c.slug}
                href={`/tools?category=${c.slug}`}
                onClick={() => setMobileOpen(false)}
                className="rounded-control px-3 py-2 text-sm text-muted hover:bg-surface-2 hover:text-text"
              >
                {c.name}
              </Link>
            ))}
          </nav>
          <div className="mt-4 flex items-center gap-2">
            <AccountLink />
            <ThemeToggle />
          </div>
        </div>
      )}
    </header>
  );
}
