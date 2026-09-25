import Link from "next/link";
import { Plus, Pencil } from "lucide-react";
import { getAllGuidesForAdmin } from "@/lib/guides-data";
import { Button } from "@/components/Button";
import { Badge } from "@/components/Badge";
import { deleteGuide } from "./actions";
import { ConfirmSubmitButton } from "./ConfirmSubmitButton";

export const dynamic = "force-dynamic";

export default async function AdminGuidesPage() {
  const { data: guides, error } = await getAllGuidesForAdmin();

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-text">Guides</h1>
          <p className="mt-1 text-sm text-muted">{guides.length} total</p>
        </div>
        <Link href="/admin/guides/new"><Button size="sm"><Plus size={14} /> Add guide</Button></Link>
      </div>

      {error && <p className="mt-4 text-sm text-danger">Couldn't load guides ({error.message}). Make sure phase6-schema.sql has been run in Supabase.</p>}

      <div className="mt-6 overflow-x-auto rounded-card border border-border bg-surface">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border text-xs uppercase text-muted">
            <tr>
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {guides.map((g: any) => (
              <tr key={g.id}>
                <td className="px-4 py-3">
                  <p className="font-medium text-text">{g.title}{g.featured && <Badge tone="accent" className="ml-2">Featured</Badge>}</p>
                  <p className="text-xs text-muted">/guides/{g.slug}</p>
                </td>
                <td className="px-4 py-3 text-muted">{g.category ?? "—"}</td>
                <td className="px-4 py-3"><Badge tone={g.status === "published" ? "success" : "default"}>{g.status}</Badge></td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <Link href={`/admin/guides/${g.id}/edit`}><Button size="sm" variant="secondary"><Pencil size={12} /> Edit</Button></Link>
                    <form action={deleteGuide.bind(null, g.id)}>
                      <ConfirmSubmitButton confirmMessage={`Delete "${g.title}"?`}>Delete</ConfirmSubmitButton>
                    </form>
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
