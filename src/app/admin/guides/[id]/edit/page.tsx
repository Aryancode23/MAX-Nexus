import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getGuideByIdForAdmin } from "@/lib/guides-data";
import { GuideForm } from "../../GuideForm";
import { updateGuide } from "../../actions";

export const dynamic = "force-dynamic";

export default async function EditGuidePage({ params }: { params: { id: string } }) {
  const { data: guide } = await getGuideByIdForAdmin(params.id);
  if (!guide) notFound();

  return (
    <div>
      <Link href="/admin/guides" className="flex items-center gap-1 text-sm text-muted hover:text-text"><ArrowLeft size={14} /> Back to guides</Link>
      <h1 className="mt-3 text-xl font-bold text-text">Edit guide</h1>
      <div className="mt-6">
        <GuideForm
          action={async (_prevState, formData) => updateGuide(params.id, formData)}
          submitLabel="Save changes"
          initialValues={{
            title: guide.title, slug: guide.slug, content: guide.content, category: guide.category,
            author: guide.author, reading_time: guide.reading_time, keywords: guide.keywords,
            related_tool_slugs: guide.related_tool_slugs, seo_title: guide.seo_title,
            seo_description: guide.seo_description, status: guide.status, featured: guide.featured,
          }}
        />
      </div>
    </div>
  );
}
