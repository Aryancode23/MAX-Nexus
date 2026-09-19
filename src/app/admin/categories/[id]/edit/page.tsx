import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getCategoryByIdForAdmin } from "@/lib/tools-data";
import { CategoryForm } from "../../CategoryForm";
import { updateCategory } from "../../actions";

export const dynamic = "force-dynamic";


export default async function EditCategoryPage({ params }: { params: { id: string } }) {
  const { data: category } = await getCategoryByIdForAdmin(params.id);
  if (!category) notFound();

  return (
    <div>
      <Link href="/admin/categories" className="flex items-center gap-1 text-sm text-muted hover:text-text">
        <ArrowLeft size={14} /> Back to categories
      </Link>
      <h1 className="mt-3 text-xl font-bold text-text">Edit category</h1>

      <div className="mt-6">
        <CategoryForm
          action={async (_prevState, formData) => updateCategory(params.id, formData)}
          submitLabel="Save changes"
          initialValues={{
            name: category.name,
            slug: category.slug,
            description: category.description,
            icon: category.icon,
            sort_order: category.sort_order,
            enabled: category.enabled,
          }}
        />
      </div>
    </div>
  );
}
