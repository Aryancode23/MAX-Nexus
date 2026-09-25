"use client";
import { useFormState, useFormStatus } from "react-dom";
import { Button } from "@/components/Button";

interface Values {
  title?: string; body?: string; type?: string; link_tool_slug?: string;
  priority?: number; status?: string; publish_at?: string;
}

export function AnnouncementForm({
  action, initialValues, submitLabel,
}: {
  action: (state: { error?: string }, formData: FormData) => Promise<{ error?: string }>;
  initialValues?: Values; submitLabel: string;
}) {
  const [state, formAction] = useFormState(action, {});
  return (
    <form action={formAction} className="max-w-xl space-y-4">
      {state?.error && <p className="rounded-control border border-danger/30 bg-danger/10 p-3 text-sm text-danger">{state.error}</p>}
      <label className="block text-sm">Title
        <input name="title" required defaultValue={initialValues?.title} className="focus-ring mt-1 w-full rounded-control border border-border bg-surface px-3 py-2 text-sm" />
      </label>
      <label className="block text-sm">Body
        <textarea name="body" rows={3} defaultValue={initialValues?.body} className="focus-ring mt-1 w-full rounded-control border border-border bg-surface px-3 py-2 text-sm" />
      </label>
      <div className="grid grid-cols-2 gap-4">
        <label className="block text-sm">Type
          <select name="type" defaultValue={initialValues?.type || "notice"} className="focus-ring mt-1 w-full rounded-control border border-border bg-surface px-3 py-2 text-sm">
            <option value="new">New</option><option value="fix">Fix</option><option value="notice">Notice</option>
          </select>
        </label>
        <label className="block text-sm">Priority
          <input name="priority" type="number" defaultValue={String(initialValues?.priority ?? 0)} className="focus-ring mt-1 w-full rounded-control border border-border bg-surface px-3 py-2 text-sm" />
        </label>
      </div>
      <label className="block text-sm">Link to tool slug (optional)
        <input name="link_tool_slug" defaultValue={initialValues?.link_tool_slug} className="focus-ring mt-1 w-full rounded-control border border-border bg-surface px-3 py-2 text-sm" />
      </label>
      <div className="grid grid-cols-2 gap-4">
        <label className="block text-sm">Status
          <select name="status" defaultValue={initialValues?.status || "draft"} className="focus-ring mt-1 w-full rounded-control border border-border bg-surface px-3 py-2 text-sm">
            <option value="draft">Draft</option><option value="published">Published</option><option value="scheduled">Scheduled</option>
          </select>
        </label>
        <label className="block text-sm">Publish at (optional)
          <input name="publish_at" type="datetime-local" defaultValue={initialValues?.publish_at} className="focus-ring mt-1 w-full rounded-control border border-border bg-surface px-3 py-2 text-sm" />
        </label>
      </div>
      <SubmitButton label={submitLabel} />
    </form>
  );
}

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return <Button type="submit" disabled={pending}>{pending ? "Saving…" : label}</Button>;
}
