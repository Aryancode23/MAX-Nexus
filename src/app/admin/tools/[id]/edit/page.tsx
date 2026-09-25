import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getAllCategoriesForAdmin, getToolByIdForAdmin } from "@/lib/tools-data";
import { ToolForm } from "../../ToolForm";
import { updateTool } from "../../actions";

export const dynamic = "force-dynamic";


export default async function EditToolPage({ params }: { params: { id: string } }) {
  const [categories, { data: tool }] = await Promise.all([
    getAllCategoriesForAdmin(),
    getToolByIdForAdmin(params.id),
  ]);

  if (!tool) notFound();

  return (
    <div>
      <Link href="/admin/tools" className="flex items-center gap-1 text-sm text-muted hover:text-text">
        <ArrowLeft size={14} /> Back to tools
      </Link>
      <h1 className="mt-3 text-xl font-bold text-text">Edit tool</h1>

      <div className="mt-6">
        <ToolForm
          action={async (_prevState, formData) => updateTool(params.id, formData)}
          categories={categories}
          submitLabel="Save changes"
          initialValues={{
            name: tool.name,
            slug: tool.slug,
            description: tool.description,
            category_id: tool.category_id,
            icon: tool.icon,
            keywords: tool.keywords,
            status: tool.status,
            is_popular: tool.is_popular,
            is_new: tool.is_new,
            is_offline: tool.is_offline,
            is_paid: tool.is_paid,
            seo_title: tool.seo_title,
            seo_description: tool.seo_description,
            sort_order: tool.sort_order,
          }}
        />
      </div>
    </div>
  );
}
