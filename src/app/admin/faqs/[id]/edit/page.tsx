import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getFaqByIdForAdmin } from "@/lib/faqs-data";
import { FaqForm } from "../../FaqForm";
import { updateFaq } from "../../actions";

export const dynamic = "force-dynamic";

export default async function EditFaqPage({ params }: { params: { id: string } }) {
  const { data: faq } = await getFaqByIdForAdmin(params.id);
  if (!faq) notFound();
  return (
    <div>
      <Link href="/admin/faqs" className="flex items-center gap-1 text-sm text-muted hover:text-text"><ArrowLeft size={14} /> Back to FAQs</Link>
      <h1 className="mt-3 text-xl font-bold text-text">Edit FAQ</h1>
      <div className="mt-6">
        <FaqForm
          action={async (_s, fd) => updateFaq(params.id, fd)}
          submitLabel="Save changes"
          initialValues={{ question: faq.question, answer: faq.answer, category: faq.category, related_tool_slugs: faq.related_tool_slugs, sort_order: faq.sort_order, status: faq.status }}
        />
      </div>
    </div>
  );
}
