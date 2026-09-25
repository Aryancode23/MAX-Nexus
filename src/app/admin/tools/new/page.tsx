import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getAllCategoriesForAdmin } from "@/lib/tools-data";
import { ToolForm } from "../ToolForm";
import { createTool } from "../actions";

export const dynamic = "force-dynamic";


export default async function NewToolPage() {
  const categories = await getAllCategoriesForAdmin();

  return (
    <div>
      <Link href="/admin/tools" className="flex items-center gap-1 text-sm text-muted hover:text-text">
        <ArrowLeft size={14} /> Back to tools
      </Link>
      <h1 className="mt-3 text-xl font-bold text-text">Add tool</h1>

      <div className="mt-6">
        <ToolForm
          action={async (_prevState, formData) => createTool(formData)}
          categories={categories}
          submitLabel="Create tool"
        />
      </div>
    </div>
  );
}
