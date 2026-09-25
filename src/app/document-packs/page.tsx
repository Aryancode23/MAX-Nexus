import Link from "next/link";
import { FolderKanban } from "lucide-react";
import { getPublishedDocumentPacks } from "@/lib/document-packs-data";

export const metadata = { title: "Document Packs" };
export const dynamic = "force-dynamic";

export default async function DocumentPacksIndexPage() {
  const packs = await getPublishedDocumentPacks();

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <h1 className="text-2xl font-bold text-text">Document Packs</h1>
      <p className="mt-1 text-muted">
        Pick what you're preparing documents for — get the checklist, process every file, and download one
        organized pack.
      </p>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {packs.map((p: any) => (
          <Link
            key={p.id}
            href={`/document-packs/${p.slug}`}
            className="focus-ring rounded-card border border-border bg-surface p-5 shadow-soft transition-shadow hover:shadow-elevated"
          >
            <FolderKanban size={20} className="text-primary" />
            <p className="mt-2 font-semibold text-text">{p.name}</p>
            <p className="mt-1 text-xs text-muted line-clamp-2">{p.description}</p>
            <p className="mt-2 text-xs text-primary">{(p.required_documents ?? []).length} required documents</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
