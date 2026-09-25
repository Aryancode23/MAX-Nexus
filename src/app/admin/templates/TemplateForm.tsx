"use client";
import { useFormState, useFormStatus } from "react-dom";
import { Button } from "@/components/Button";

interface Values {
  name?: string; slug?: string; description?: string; category?: string;
  preview_image_url?: string; target_tool_slug?: string; status?: string; sort_order?: number;
}

export function TemplateForm({
  action, initialValues, submitLabel,
}: {
  action: (state: { error?: string }, formData: FormData) => Promise<{ error?: string }>;
  initialValues?: Values; submitLabel: string;
}) {
  const [state, formAction] = useFormState(action, {});
  return (
    <form action={formAction} className="max-w-xl space-y-4">
      {state?.error && <p className="rounded-control border border-danger/30 bg-danger/10 p-3 text-sm text-danger">{state.error}</p>}
      <div className="grid grid-cols-2 gap-4">
        <label className="block text-sm">Name
          <input name="name" required defaultValue={initialValues?.name} className="focus-ring mt-1 w-full rounded-control border border-border bg-surface px-3 py-2 text-sm" />
        </label>
        <label className="block text-sm">Slug
          <input name="slug" required defaultValue={initialValues?.slug} className="focus-ring mt-1 w-full rounded-control border border-border bg-surface px-3 py-2 text-sm" />
        </label>
      </div>
      <label className="block text-sm">Description
        <textarea name="description" rows={2} defaultValue={initialValues?.description} className="focus-ring mt-1 w-full rounded-control border border-border bg-surface px-3 py-2 text-sm" />
      </label>
      <div className="grid grid-cols-2 gap-4">
        <label className="block text-sm">Category
          <input name="category" defaultValue={initialValues?.category || "General"} className="focus-ring mt-1 w-full rounded-control border border-border bg-surface px-3 py-2 text-sm" />
        </label>
        <label className="block text-sm">Target tool slug (optional)
          <input name="target_tool_slug" defaultValue={initialValues?.target_tool_slug} placeholder="e.g. resume-builder" className="focus-ring mt-1 w-full rounded-control border border-border bg-surface px-3 py-2 text-sm" />
        </label>
      </div>
      <label className="block text-sm">Preview image URL
        <input name="preview_image_url" defaultValue={initialValues?.preview_image_url} placeholder="Upload via Media Library, paste the URL here" className="focus-ring mt-1 w-full rounded-control border border-border bg-surface px-3 py-2 text-sm" />
      </label>
      <div className="grid grid-cols-2 gap-4">
        <label className="block text-sm">Status
          <select name="status" defaultValue={initialValues?.status || "draft"} className="focus-ring mt-1 w-full rounded-control border border-border bg-surface px-3 py-2 text-sm">
            <option value="draft">Draft</option><option value="published">Published</option>
          </select>
        </label>
        <label className="block text-sm">Sort order
          <input name="sort_order" type="number" defaultValue={String(initialValues?.sort_order ?? 0)} className="focus-ring mt-1 w-full rounded-control border border-border bg-surface px-3 py-2 text-sm" />
        </label>
      </div>
      <SubmitButton label={submitLabel} />
      <p className="text-xs text-muted">
        This catalogs the template with a preview and a link to its tool — it doesn't change what that tool
        actually renders. See the README for what Template Library does and doesn't do.
      </p>
    </form>
  );
}

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return <Button type="submit" disabled={pending}>{pending ? "Saving…" : label}</Button>;
}
