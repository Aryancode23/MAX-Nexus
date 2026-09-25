import Link from "next/link";
import { Wand2, FolderKanban, ArrowRight } from "lucide-react";

export function FlagshipSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <Link
          href="/tools/fix-my-file"
          className="focus-ring group relative overflow-hidden rounded-card border border-border bg-gradient-to-br from-primary/10 to-primary/5 p-6 shadow-soft transition-shadow hover:shadow-elevated"
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-control bg-primary text-primary-foreground">
            <Wand2 size={22} />
          </span>
          <h3 className="mt-4 text-lg font-bold text-text">Fix My File</h3>
          <p className="mt-1 text-sm text-muted">
            Not sure which tool you need? Tell it what your photo or PDF needs to be — it figures out and
            applies the fix automatically.
          </p>
          <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary">
            Try it <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
          </span>
        </Link>

        <Link
          href="/tools/document-pack-builder"
          className="focus-ring group relative overflow-hidden rounded-card border border-border bg-gradient-to-br from-accent/10 to-accent/5 p-6 shadow-soft transition-shadow hover:shadow-elevated"
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-control bg-accent text-white">
            <FolderKanban size={22} />
          </span>
          <h3 className="mt-4 text-lg font-bold text-text">Document Pack Builder</h3>
          <p className="mt-1 text-sm text-muted">
            Preparing documents for a job, admission, loan or passport? Get the checklist, process every file,
            and download one organized pack.
          </p>
          <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-accent">
            Get started <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
          </span>
        </Link>
      </div>
    </section>
  );
}
