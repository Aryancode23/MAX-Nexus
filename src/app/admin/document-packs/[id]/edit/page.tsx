import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getDocumentPackByIdForAdmin } from "@/lib/document-packs-data";
import { DocumentPackForm } from "../../DocumentPackForm";
import { updateDocumentPack } from "../../actions";

export const dynamic = "force-dynamic";

export default async function EditDocumentPackPage({ params }: { params: { id: string } }) {
  const { data: p } = await getDocumentPackByIdForAdmin(params.id);
  if (!p) notFound();
  return (
    <div>
      <Link href="/admin/document-packs" className="flex items-center gap-1 text-sm text-muted hover:text-text"><ArrowLeft size={14} /> Back</Link>
      <h1 className="mt-3 text-xl font-bold text-text">Edit document pack template</h1>
      <div className="mt-6">
        <DocumentPackForm
          action={async (_s, fd) => updateDocumentPack(params.id, fd)}
          submitLabel="Save changes"
          initialValues={{
            name: p.name, slug: p.slug, description: p.description,
            required_documents: p.required_documents, optional_documents: p.optional_documents,
            recommended_formats: p.recommended_formats, recommended_max_size: p.recommended_max_size,
            processing_notes: p.processing_notes, related_tool_slugs: p.related_tool_slugs,
            disclaimer: p.disclaimer, seo_title: p.seo_title, seo_description: p.seo_description,
            status: p.status, sort_order: p.sort_order,
          }}
        />
      </div>
    </div>
  );
}
