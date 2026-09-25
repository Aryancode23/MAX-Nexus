import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getTemplateByIdForAdmin } from "@/lib/templates-data";
import { TemplateForm } from "../../TemplateForm";
import { updateTemplate } from "../../actions";

export const dynamic = "force-dynamic";

export default async function EditTemplatePage({ params }: { params: { id: string } }) {
  const { data: t } = await getTemplateByIdForAdmin(params.id);
  if (!t) notFound();
  return (
    <div>
      <Link href="/admin/templates" className="flex items-center gap-1 text-sm text-muted hover:text-text"><ArrowLeft size={14} /> Back</Link>
      <h1 className="mt-3 text-xl font-bold text-text">Edit template</h1>
      <div className="mt-6">
        <TemplateForm
          action={async (_s, fd) => updateTemplate(params.id, fd)}
          submitLabel="Save changes"
          initialValues={{ name: t.name, slug: t.slug, description: t.description, category: t.category, preview_image_url: t.preview_image_url, target_tool_slug: t.target_tool_slug, status: t.status, sort_order: t.sort_order }}
        />
      </div>
    </div>
  );
}
