"use client";
import { useState } from "react";
import { Check } from "lucide-react";
import { updateUserRole } from "./actions";

const ROLES = ["user", "support", "editor", "admin", "super_admin"];

export function RoleForm({ userId, currentRole }: { userId: string; currentRole: string }) {
  const [role, setRole] = useState(currentRole);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function save() {
    setSaving(true);
    setError(null);
    const result = await updateUserRole(userId, role);
    setSaving(false);
    if (result?.error) setError(result.error);
    else { setSaved(true); setTimeout(() => setSaved(false), 1500); }
  }

  return (
    <div className="flex items-center gap-2">
      <select
        value={role}
        onChange={(e) => setRole(e.target.value)}
        className="focus-ring rounded-control border border-border bg-surface px-2 py-1 text-xs"
      >
        {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
      </select>
      {role !== currentRole && (
        <button onClick={save} disabled={saving} className="text-xs text-primary hover:underline">
          {saving ? "Saving…" : "Save"}
        </button>
      )}
      {saved && <Check size={14} className="text-success" />}
      {error && <span className="text-xs text-danger">{error}</span>}
    </div>
  );
}
