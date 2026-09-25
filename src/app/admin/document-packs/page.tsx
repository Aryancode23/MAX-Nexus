import Link from "next/link";
import { Plus, Pencil } from "lucide-react";
import { getAllDocumentPacksForAdmin } from "@/lib/document-packs-data";
import { Button } from "@/components/Button";
import { Badge } from "@/components/Badge";
import { deleteDocumentPack } from "./actions";
import { ConfirmSubmitButton } from "./ConfirmSubmitButton";

export const dynamic = "force-dynamic";

export default async function AdminDocumentPacksPage() {
  const { data: packs, error } = await getAllDocumentPacksForAdmin();
  return (
    <div>
      <div className="flex items-center justify-between">
        <div><h1 className="text-xl font-bold text-text">Document Pack Templates</h1><p className="mt-1 text-sm text-muted">{packs.length} total</p></div>
        <Link href="/admin/document-packs/new"><Button size="sm"><Plus size={14} /> Add template</Button></Link>
      </div>
      {error && <p className="mt-4 text-sm text-danger">Couldn't load templates ({error.message}). Make sure phase10-schema.sql has been run.</p>}
      <div className="mt-6 overflow-x-auto rounded-card border border-border bg-surface">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border text-xs uppercase text-muted">
            <tr><th className="px-4 py-3">Name</th><th className="px-4 py-3">Required docs</th><th className="px-4 py-3">Status</th><th className="px-4 py-3 text-right">Actions</th></tr>
          </thead>
          <tbody className="divide-y divide-border">
            {packs.map((p: any) => (
              <tr key={p.id}>
                <td className="px-4 py-3"><p className="font-medium text-text">{p.name}</p><p className="text-xs text-muted">{p.slug}</p></td>
                <td className="px-4 py-3 text-muted">{(p.required_documents ?? []).length}</td>
                <td className="px-4 py-3"><Badge tone={p.status === "published" ? "success" : "default"}>{p.status}</Badge></td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <Link href={`/admin/document-packs/${p.id}/edit`}><Button size="sm" variant="secondary"><Pencil size={12} /> Edit</Button></Link>
                    <form action={deleteDocumentPack.bind(null, p.id)}><ConfirmSubmitButton confirmMessage={`Delete "${p.name}"?`}>Delete</ConfirmSubmitButton></form>
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
