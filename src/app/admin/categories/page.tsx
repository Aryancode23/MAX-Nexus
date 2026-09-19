import Link from "next/link";
import { Plus, Pencil } from "lucide-react";
import { getAllCategoriesForAdmin } from "@/lib/tools-data";
import { Button } from "@/components/Button";
import { Badge } from "@/components/Badge";
import { toggleCategoryEnabled, deleteCategory } from "./actions";
import { ConfirmSubmitButton } from "./ConfirmSubmitButton";

export const dynamic = "force-dynamic";


export default async function AdminCategoriesPage() {
  const categories = await getAllCategoriesForAdmin();

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-text">Categories</h1>
          <p className="mt-1 text-sm text-muted">{categories.length} total</p>
        </div>
        <Link href="/admin/categories/new">
          <Button size="sm"><Plus size={14} /> Add category</Button>
        </Link>
      </div>

      <div className="mt-6 overflow-x-auto rounded-card border border-border bg-surface">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border text-xs uppercase text-muted">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Slug</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Order</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {categories.map((cat: any) => (
              <tr key={cat.id}>
                <td className="px-4 py-3 font-medium text-text">{cat.name}</td>
                <td className="px-4 py-3 text-muted">{cat.slug}</td>
                <td className="px-4 py-3">
                  <Badge tone={cat.enabled ? "success" : "danger"}>{cat.enabled ? "Visible" : "Hidden"}</Badge>
                </td>
                <td className="px-4 py-3 text-muted">{cat.sort_order}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <Link href={`/admin/categories/${cat.id}/edit`}>
                      <Button size="sm" variant="secondary"><Pencil size={12} /> Edit</Button>
                    </Link>
                    <form action={toggleCategoryEnabled.bind(null, cat.id, !cat.enabled)}>
                      <Button size="sm" variant="secondary" type="submit">{cat.enabled ? "Hide" : "Show"}</Button>
                    </form>
                    <form action={deleteCategory.bind(null, cat.id)}>
                      <ConfirmSubmitButton confirmMessage={`Delete "${cat.name}"? Tools in this category will become uncategorized.`}>
                        Delete
                      </ConfirmSubmitButton>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
