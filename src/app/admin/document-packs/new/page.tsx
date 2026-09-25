import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { DocumentPackForm } from "../DocumentPackForm";
import { createDocumentPack } from "../actions";

export const dynamic = "force-dynamic";

export default function NewDocumentPackPage() {
  return (
    <div>
      <Link href="/admin/document-packs" className="flex items-center gap-1 text-sm text-muted hover:text-text"><ArrowLeft size={14} /> Back</Link>
      <h1 className="mt-3 text-xl font-bold text-text">Add document pack template</h1>
      <div className="mt-6"><DocumentPackForm action={async (_s, fd) => createDocumentPack(fd)} submitLabel="Create template" /></div>
    </div>
  );
}
