import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { FaqForm } from "../FaqForm";
import { createFaq } from "../actions";

export const dynamic = "force-dynamic";

export default function NewFaqPage() {
  return (
    <div>
      <Link href="/admin/faqs" className="flex items-center gap-1 text-sm text-muted hover:text-text"><ArrowLeft size={14} /> Back to FAQs</Link>
      <h1 className="mt-3 text-xl font-bold text-text">Add FAQ</h1>
      <div className="mt-6"><FaqForm action={async (_s, fd) => createFaq(fd)} submitLabel="Create FAQ" /></div>
    </div>
  );
}
