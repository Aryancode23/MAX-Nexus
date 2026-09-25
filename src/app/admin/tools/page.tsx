import Link from "next/link";
import { Plus, Pencil } from "lucide-react";
import { getAllToolsForAdmin } from "@/lib/tools-data";
import { Button } from "@/components/Button";
import { Badge } from "@/components/Badge";
import { setToolStatus, deleteTool } from "./actions";
import { ConfirmSubmitButton } from "./ConfirmSubmitButton";

export const dynamic = "force-dynamic";


export default async function AdminToolsPage() {
  const { data: tools, error } = await getAllToolsForAdmin();

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-text">Tools</h1>
          <p className="mt-1 text-sm text-muted">{tools.length} total</p>
        </div>
        <Link href="/admin/tools/new">
          <Button size="sm"><Plus size={14} /> Add tool</Button>
        </Link>
      </div>

      {error && (
        <p className="mt-4 text-sm text-danger">
          Couldn't load tools ({error.message}). Make sure schema.sql and seed.sql have been run in Supabase.
        </p>
      )}

      <div className="mt-6 overflow-x-auto rounded-card border border-border bg-surface">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border text-xs uppercase text-muted">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Flags</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {tools.map((tool: any) => (
              <tr key={tool.id}>
                <td className="px-4 py-3">
                  <p className="font-medium text-text">{tool.name}</p>
                  <p className="text-xs text-muted">/tools/{tool.slug}</p>
                </td>
                <td className="px-4 py-3 text-muted">{tool.categories?.name ?? "—"}</td>
                <td className="px-4 py-3">
                  <Badge tone={tool.status === "active" ? "success" : tool.status === "disabled" ? "danger" : "warning"}>
                    {tool.status}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {tool.is_popular && <Badge>Popular</Badge>}
                    {tool.is_new && <Badge>New</Badge>}
                    {tool.is_paid && <Badge tone="warning">Pro</Badge>}
                    {tool.is_offline && <Badge tone="accent">Offline</Badge>}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <Link href={`/admin/tools/${tool.id}/edit`}>
                      <Button size="sm" variant="secondary"><Pencil size={12} /> Edit</Button>
                    </Link>

                    {tool.status === "active" ? (
                      <form action={setToolStatus.bind(null, tool.id, "disabled")}>
                        <Button size="sm" variant="secondary" type="submit">Disable</Button>
                      </form>
                    ) : (
                      <form action={setToolStatus.bind(null, tool.id, "active")}>
                        <Button size="sm" variant="secondary" type="submit">Enable</Button>
                      </form>
                    )}

                    <form action={deleteTool.bind(null, tool.id)}>
                      <ConfirmSubmitButton confirmMessage={`Delete "${tool.name}"? This cannot be undone.`}>
                        Delete
                      </ConfirmSubmitButton>
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
