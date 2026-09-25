import Link from "next/link";
import { Plus, Pencil } from "lucide-react";
import { getAllAnnouncementsForAdmin } from "@/lib/announcements-data";
import { Button } from "@/components/Button";
import { Badge } from "@/components/Badge";
import { deleteAnnouncement } from "./actions";
import { ConfirmSubmitButton } from "./ConfirmSubmitButton";

export const dynamic = "force-dynamic";

export default async function AdminAnnouncementsPage() {
  const { data: items, error } = await getAllAnnouncementsForAdmin();
  return (
    <div>
      <div className="flex items-center justify-between">
        <div><h1 className="text-xl font-bold text-text">Announcements</h1><p className="mt-1 text-sm text-muted">{items.length} total</p></div>
        <Link href="/admin/announcements/new"><Button size="sm"><Plus size={14} /> Add announcement</Button></Link>
      </div>
      {error && <p className="mt-4 text-sm text-danger">Couldn't load announcements ({error.message}). Make sure phase6-schema.sql has been run.</p>}
      <div className="mt-6 overflow-x-auto rounded-card border border-border bg-surface">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border text-xs uppercase text-muted">
            <tr><th className="px-4 py-3">Title</th><th className="px-4 py-3">Type</th><th className="px-4 py-3">Status</th><th className="px-4 py-3 text-right">Actions</th></tr>
          </thead>
          <tbody className="divide-y divide-border">
            {items.map((a: any) => (
              <tr key={a.id}>
                <td className="px-4 py-3 font-medium text-text">{a.title}</td>
                <td className="px-4 py-3 text-muted">{a.type}</td>
                <td className="px-4 py-3"><Badge tone={a.status === "published" ? "success" : "default"}>{a.status}</Badge></td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <Link href={`/admin/announcements/${a.id}/edit`}><Button size="sm" variant="secondary"><Pencil size={12} /> Edit</Button></Link>
                    <form action={deleteAnnouncement.bind(null, a.id)}><ConfirmSubmitButton confirmMessage="Delete this announcement?">Delete</ConfirmSubmitButton></form>
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
