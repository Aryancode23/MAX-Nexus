"use client";
import { useFormState, useFormStatus } from "react-dom";
import { Button } from "@/components/Button";

interface Values {
  name?: string; slug?: string; description?: string; required_documents?: string[]; optional_documents?: string[];
  recommended_formats?: string; recommended_max_size?: string; processing_notes?: string;
  related_tool_slugs?: string[]; disclaimer?: string; seo_title?: string; seo_description?: string;
  status?: string; sort_order?: number;
}

export function DocumentPackForm({
  action, initialValues, submitLabel,
}: {
  action: (state: { error?: string }, formData: FormData) => Promise<{ error?: string }>;
  initialValues?: Values; submitLabel: string;
}) {
  const [state, formAction] = useFormState(action, {});
  return (
    <form action={formAction} className="max-w-2xl space-y-4">
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

      <label className="block text-sm">Required documents (one per line)
        <textarea name="required_documents" rows={5} defaultValue={initialValues?.required_documents?.join("\n")} className="focus-ring mt-1 w-full rounded-control border border-border bg-surface px-3 py-2 text-sm" />
      </label>
      <label className="block text-sm">Optional documents (one per line)
        <textarea name="optional_documents" rows={3} defaultValue={initialValues?.optional_documents?.join("\n")} className="focus-ring mt-1 w-full rounded-control border border-border bg-surface px-3 py-2 text-sm" />
      </label>

      <div className="grid grid-cols-2 gap-4">
        <label className="block text-sm">Recommended formats
          <input name="recommended_formats" defaultValue={initialValues?.recommended_formats} placeholder="e.g. PDF or JPG" className="focus-ring mt-1 w-full rounded-control border border-border bg-surface px-3 py-2 text-sm" />
        </label>
        <label className="block text-sm">Recommended max size
          <input name="recommended_max_size" defaultValue={initialValues?.recommended_max_size} placeholder="e.g. under 2 MB per file" className="focus-ring mt-1 w-full rounded-control border border-border bg-surface px-3 py-2 text-sm" />
        </label>
      </div>

      <label className="block text-sm">Processing notes
        <textarea name="processing_notes" rows={2} defaultValue={initialValues?.processing_notes} className="focus-ring mt-1 w-full rounded-control border border-border bg-surface px-3 py-2 text-sm" />
      </label>
      <label className="block text-sm">Related tool slugs (comma separated)
        <input name="related_tool_slugs" defaultValue={initialValues?.related_tool_slugs?.join(", ")} className="focus-ring mt-1 w-full rounded-control border border-border bg-surface px-3 py-2 text-sm" />
      </label>
      <label className="block text-sm">Disclaimer
        <textarea name="disclaimer" rows={2} defaultValue={initialValues?.disclaimer} className="focus-ring mt-1 w-full rounded-control border border-border bg-surface px-3 py-2 text-sm" />
      </label>

      <div className="grid grid-cols-2 gap-4">
        <Field label="SEO title" name="seo_title" defaultValue={initialValues?.seo_title} />
        <Field label="Sort order" name="sort_order" type="number" defaultValue={String(initialValues?.sort_order ?? 0)} />
      </div>
      <label className="block text-sm">SEO description
        <textarea name="seo_description" rows={2} defaultValue={initialValues?.seo_description} className="focus-ring mt-1 w-full rounded-control border border-border bg-surface px-3 py-2 text-sm" />
      </label>

      <label className="block text-sm">Status
        <select name="status" defaultValue={initialValues?.status || "draft"} className="focus-ring mt-1 w-full max-w-xs rounded-control border border-border bg-surface px-3 py-2 text-sm">
          <option value="draft">Draft</option><option value="published">Published</option>
        </select>
      </label>

      <SubmitButton label={submitLabel} />
    </form>
  );
}

function Field({ label, name, defaultValue, type = "text" }: { label: string; name: string; defaultValue?: string; type?: string }) {
  return (
    <label className="block text-sm">
      {label}
      <input name={name} type={type} defaultValue={defaultValue} className="focus-ring mt-1 w-full rounded-control border border-border bg-surface px-3 py-2 text-sm" />
    </label>
  );
}
function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return <Button type="submit" disabled={pending}>{pending ? "Saving…" : label}</Button>;
}
