import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { CategoryForm } from "../CategoryForm";
import { createCategory } from "../actions";

export const dynamic = "force-dynamic";

export default function NewCategoryPage() {
  return (
    <div>
      <Link href="/admin/categories" className="flex items-center gap-1 text-sm text-muted hover:text-text">
        <ArrowLeft size={14} /> Back to categories
      </Link>
      <h1 className="mt-3 text-xl font-bold text-text">Add category</h1>

      <div className="mt-6">
        <CategoryForm
          action={async (_prevState, formData) => createCategory(formData)}
          submitLabel="Create category"
        />
      </div>
    </div>
  );
}
