import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { GuideForm } from "../GuideForm";
import { createGuide } from "../actions";

export const dynamic = "force-dynamic";

export default function NewGuidePage() {
  return (
    <div>
      <Link href="/admin/guides" className="flex items-center gap-1 text-sm text-muted hover:text-text"><ArrowLeft size={14} /> Back to guides</Link>
      <h1 className="mt-3 text-xl font-bold text-text">Add guide</h1>
      <div className="mt-6">
        <GuideForm action={async (_prevState, formData) => createGuide(formData)} submitLabel="Create guide" />
      </div>
    </div>
  );
}
