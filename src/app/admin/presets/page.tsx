import Link from "next/link";
import { Plus, Pencil } from "lucide-react";
import { getAllPresetsForAdmin } from "@/lib/presets-data";
import { Button } from "@/components/Button";
import { Badge } from "@/components/Badge";
import { deletePreset } from "./actions";
import { ConfirmSubmitButton } from "./ConfirmSubmitButton";

export const dynamic = "force-dynamic";

export default async function AdminPresetsPage() {
  const { data: presets, error } = await getAllPresetsForAdmin();
  return (
    <div>
      <div className="flex items-center justify-between">
        <div><h1 className="text-xl font-bold text-text">Fix My File Presets</h1><p className="mt-1 text-sm text-muted">{presets.length} total</p></div>
        <Link href="/admin/presets/new"><Button size="sm"><Plus size={14} /> Add preset</Button></Link>
      </div>
      {error && <p className="mt-4 text-sm text-danger">Couldn't load presets ({error.message}). Make sure phase10-schema.sql has been run.</p>}
      <div className="mt-6 overflow-x-auto rounded-card border border-border bg-surface">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border text-xs uppercase text-muted">
            <tr><th className="px-4 py-3">Name</th><th className="px-4 py-3">Type</th><th className="px-4 py-3">Status</th><th className="px-4 py-3 text-right">Actions</th></tr>
          </thead>
          <tbody className="divide-y divide-border">
            {presets.map((p: any) => (
              <tr key={p.id}>
                <td className="px-4 py-3 font-medium text-text">{p.name}</td>
                <td className="px-4 py-3 text-muted capitalize">{p.file_type}</td>
                <td className="px-4 py-3"><Badge tone={p.status === "published" ? "success" : "default"}>{p.status}</Badge></td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <Link href={`/admin/presets/${p.id}/edit`}><Button size="sm" variant="secondary"><Pencil size={12} /> Edit</Button></Link>
                    <form action={deletePreset.bind(null, p.id)}><ConfirmSubmitButton confirmMessage={`Delete "${p.name}"?`}>Delete</ConfirmSubmitButton></form>
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
