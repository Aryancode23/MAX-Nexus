import Link from "next/link";
import { Plus, Pencil } from "lucide-react";
import { getAllTemplatesForAdmin } from "@/lib/templates-data";
import { Button } from "@/components/Button";
import { Badge } from "@/components/Badge";
import { deleteTemplate } from "./actions";
import { ConfirmSubmitButton } from "./ConfirmSubmitButton";

export const dynamic = "force-dynamic";

export default async function AdminTemplatesPage() {
  const { data: templates, error } = await getAllTemplatesForAdmin();
  return (
    <div>
      <div className="flex items-center justify-between">
        <div><h1 className="text-xl font-bold text-text">Templates</h1><p className="mt-1 text-sm text-muted">{templates.length} total</p></div>
        <Link href="/admin/templates/new"><Button size="sm"><Plus size={14} /> Add template</Button></Link>
      </div>
      {error && <p className="mt-4 text-sm text-danger">Couldn't load templates ({error.message}). Make sure phase9-schema.sql has been run.</p>}
      <div className="mt-6 overflow-x-auto rounded-card border border-border bg-surface">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border text-xs uppercase text-muted">
            <tr><th className="px-4 py-3">Name</th><th className="px-4 py-3">Category</th><th className="px-4 py-3">Status</th><th className="px-4 py-3 text-right">Actions</th></tr>
          </thead>
          <tbody className="divide-y divide-border">
            {templates.map((t: any) => (
              <tr key={t.id}>
                <td className="px-4 py-3"><p className="font-medium text-text">{t.name}</p><p className="text-xs text-muted">/templates/{t.slug}</p></td>
                <td className="px-4 py-3 text-muted">{t.category}</td>
                <td className="px-4 py-3"><Badge tone={t.status === "published" ? "success" : "default"}>{t.status}</Badge></td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <Link href={`/admin/templates/${t.id}/edit`}><Button size="sm" variant="secondary"><Pencil size={12} /> Edit</Button></Link>
                    <form action={deleteTemplate.bind(null, t.id)}><ConfirmSubmitButton confirmMessage={`Delete "${t.name}"?`}>Delete</ConfirmSubmitButton></form>
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
