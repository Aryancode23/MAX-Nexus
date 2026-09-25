import { getAllFeedbackForAdmin } from "@/lib/feedback-data";
import { Badge } from "@/components/Badge";
import { Button } from "@/components/Button";
import { updateFeedbackStatus, deleteFeedback } from "./actions";
import { Trash2, MessageSquare } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminFeedbackPage() {
  const { data: items, error } = await getAllFeedbackForAdmin();

  return (
    <div>
      <h1 className="text-xl font-bold text-text">Feedback</h1>
      <p className="mt-1 text-sm text-muted">{items.length} submission{items.length === 1 ? "" : "s"} from the public feedback form.</p>

      {error && <p className="mt-4 text-sm text-danger">Couldn't load feedback ({error.message}). Make sure phase11-schema.sql has been run.</p>}

      {items.length === 0 && !error && (
        <div className="mt-8 flex flex-col items-center gap-2 rounded-card border border-dashed border-border p-10 text-center text-muted">
          <MessageSquare size={24} />
          <p>No feedback submitted yet.</p>
        </div>
      )}

      <div className="mt-6 space-y-3">
        {items.map((f: any) => (
          <div key={f.id} className="rounded-card border border-border bg-surface p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <Badge tone={f.type === "bug" ? "danger" : f.type === "suggestion" ? "accent" : "default"}>{f.type}</Badge>
                  <Badge tone={f.status === "new" ? "warning" : f.status === "reviewed" ? "accent" : "success"}>{f.status}</Badge>
                  <span className="text-xs text-muted">{new Date(f.created_at).toLocaleString()}</span>
                </div>
                <p className="mt-2 text-sm text-text">{f.message}</p>
                {f.email && <p className="mt-1 text-xs text-muted">From: {f.email}</p>}
                {f.page_url && <p className="text-xs text-muted">Page: {f.page_url}</p>}
              </div>
              <form action={deleteFeedback.bind(null, f.id)}>
                <button type="submit" onClick={(e) => { if (!confirm("Delete this feedback?")) e.preventDefault(); }} className="text-muted hover:text-danger"><Trash2 size={14} /></button>
              </form>
            </div>
            <div className="mt-3 flex gap-2">
              {(["new", "reviewed", "resolved"] as const).map((s) => (
                <form key={s} action={updateFeedbackStatus.bind(null, f.id, s)}>
                  <Button type="submit" size="sm" variant={f.status === s ? "primary" : "secondary"}>{s}</Button>
                </form>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
