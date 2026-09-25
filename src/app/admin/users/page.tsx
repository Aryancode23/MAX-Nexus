import { getAllUsersForAdmin } from "@/lib/users-data";
import { createAdminClient } from "@/lib/supabase/admin";
import { Badge } from "@/components/Badge";
import { RoleForm } from "./RoleForm";
import { BanButton } from "./BanButton";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const { data: profiles, error } = await getAllUsersForAdmin();

  let bannedIds = new Set<string>();
  try {
    const admin = createAdminClient();
    const { data } = await admin.auth.admin.listUsers({ perPage: 200 });
    bannedIds = new Set(
      (data?.users ?? [])
        .filter((u) => u.banned_until && new Date(u.banned_until) > new Date())
        .map((u) => u.id)
    );
  } catch {
    // Ban status is a nice-to-have; the role table above still renders without it.
  }

  return (
    <div>
      <h1 className="text-xl font-bold text-text">Users</h1>
      <p className="mt-1 text-sm text-muted">{profiles.length} registered account{profiles.length === 1 ? "" : "s"}</p>

      {error && <p className="mt-4 text-sm text-danger">Couldn't load users ({error.message}).</p>}

      <div className="mt-6 overflow-x-auto rounded-card border border-border bg-surface">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border text-xs uppercase text-muted">
            <tr>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Plan</th>
              <th className="px-4 py-3">Joined</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {profiles.map((p: any) => (
              <tr key={p.id}>
                <td className="px-4 py-3 text-text">{p.email}</td>
                <td className="px-4 py-3"><RoleForm userId={p.id} currentRole={p.role} /></td>
                <td className="px-4 py-3 text-muted">{p.plan}</td>
                <td className="px-4 py-3 text-muted">{new Date(p.created_at).toLocaleDateString()}</td>
                <td className="px-4 py-3">
                  {bannedIds.has(p.id) ? <Badge tone="danger">Banned</Badge> : <Badge tone="success">Active</Badge>}
                </td>
                <td className="px-4 py-3 text-right">
                  <BanButton userId={p.id} banned={bannedIds.has(p.id)} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-4 text-xs text-muted">
        You can't change your own role or ban your own account from this page — ask another admin if that's needed.
      </p>
    </div>
  );
}
