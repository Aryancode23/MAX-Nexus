import Link from "next/link";
import { Plus, Pencil } from "lucide-react";
import { getAllFaqsForAdmin } from "@/lib/faqs-data";
import { Button } from "@/components/Button";
import { Badge } from "@/components/Badge";
import { deleteFaq } from "./actions";
import { ConfirmSubmitButton } from "./ConfirmSubmitButton";

export const dynamic = "force-dynamic";

export default async function AdminFaqsPage() {
  const { data: faqs, error } = await getAllFaqsForAdmin();
  return (
    <div>
      <div className="flex items-center justify-between">
        <div><h1 className="text-xl font-bold text-text">FAQs</h1><p className="mt-1 text-sm text-muted">{faqs.length} total</p></div>
        <Link href="/admin/faqs/new"><Button size="sm"><Plus size={14} /> Add FAQ</Button></Link>
      </div>
      {error && <p className="mt-4 text-sm text-danger">Couldn't load FAQs ({error.message}). Make sure phase6-schema.sql has been run.</p>}
      <div className="mt-6 overflow-x-auto rounded-card border border-border bg-surface">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border text-xs uppercase text-muted">
            <tr><th className="px-4 py-3">Question</th><th className="px-4 py-3">Category</th><th className="px-4 py-3">Status</th><th className="px-4 py-3 text-right">Actions</th></tr>
          </thead>
          <tbody className="divide-y divide-border">
            {faqs.map((f: any) => (
              <tr key={f.id}>
                <td className="px-4 py-3 font-medium text-text">{f.question}</td>
                <td className="px-4 py-3 text-muted">{f.category}</td>
                <td className="px-4 py-3"><Badge tone={f.status === "published" ? "success" : "default"}>{f.status}</Badge></td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <Link href={`/admin/faqs/${f.id}/edit`}><Button size="sm" variant="secondary"><Pencil size={12} /> Edit</Button></Link>
                    <form action={deleteFaq.bind(null, f.id)}><ConfirmSubmitButton confirmMessage={`Delete this FAQ?`}>Delete</ConfirmSubmitButton></form>
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
