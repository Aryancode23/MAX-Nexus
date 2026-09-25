import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { TemplateForm } from "../TemplateForm";
import { createTemplate } from "../actions";

export const dynamic = "force-dynamic";

export default function NewTemplatePage() {
  return (
    <div>
      <Link href="/admin/templates" className="flex items-center gap-1 text-sm text-muted hover:text-text"><ArrowLeft size={14} /> Back</Link>
      <h1 className="mt-3 text-xl font-bold text-text">Add template</h1>
      <div className="mt-6"><TemplateForm action={async (_s, fd) => createTemplate(fd)} submitLabel="Create template" /></div>
    </div>
  );
}
