"use client";

import { useFormState, useFormStatus } from "react-dom";
import { Button } from "@/components/Button";

interface GuideFormValues {
  title?: string;
  slug?: string;
  content?: string;
  category?: string;
  author?: string;
  reading_time?: number;
  keywords?: string[];
  related_tool_slugs?: string[];
  seo_title?: string;
  seo_description?: string;
  status?: string;
  featured?: boolean;
}

export function GuideForm({
  action,
  initialValues,
  submitLabel,
}: {
  action: (state: { error?: string }, formData: FormData) => Promise<{ error?: string }>;
  initialValues?: GuideFormValues;
  submitLabel: string;
}) {
  const [state, formAction] = useFormState(action, {});

  return (
    <form action={formAction} className="max-w-2xl space-y-4">
      {state?.error && (
        <p className="rounded-control border border-danger/30 bg-danger/10 p-3 text-sm text-danger">{state.error}</p>
      )}

      <div className="grid grid-cols-2 gap-4">
        <Field label="Title" name="title" defaultValue={initialValues?.title} required />
        <Field label="Slug" name="slug" defaultValue={initialValues?.slug} required hint="/guides/your-slug" />
      </div>

      <label className="block text-sm">
        Content
        <textarea
          name="content"
          rows={14}
          defaultValue={initialValues?.content}
          className="focus-ring mt-1 w-full rounded-control border border-border bg-surface px-3 py-2 font-mono text-xs"
          placeholder={"Write in plain text. Use:\n## Heading\n- bullet point\n\nblank lines start a new paragraph"}
        />
      </label>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Category" name="category" defaultValue={initialValues?.category} />
        <Field label="Author" name="author" defaultValue={initialValues?.author || "MAX Nexus Team"} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Reading time (minutes)" name="reading_time" type="number" defaultValue={String(initialValues?.reading_time ?? 3)} />
        <label className="block text-sm">
          Status
          <select name="status" defaultValue={initialValues?.status || "draft"} className="focus-ring mt-1 w-full rounded-control border border-border bg-surface px-3 py-2 text-sm">
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </label>
      </div>

      <Field label="Keywords (comma separated)" name="keywords" defaultValue={initialValues?.keywords?.join(", ")} />
      <Field label="Related tool slugs (comma separated)" name="related_tool_slugs" defaultValue={initialValues?.related_tool_slugs?.join(", ")} hint="e.g. resume-builder, letter-generator" />

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="featured" defaultChecked={initialValues?.featured} />
        Featured
      </label>

      <Field label="SEO title" name="seo_title" defaultValue={initialValues?.seo_title} />
      <TextArea label="SEO description" name="seo_description" defaultValue={initialValues?.seo_description} rows={2} />

      <SubmitButton label={submitLabel} />
    </form>
  );
}

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return <Button type="submit" disabled={pending}>{pending ? "Saving…" : label}</Button>;
}

function Field({
  label, name, defaultValue, required, type = "text", hint,
}: { label: string; name: string; defaultValue?: string; required?: boolean; type?: string; hint?: string }) {
  return (
    <label className="block text-sm">
      {label}
      <input
        name={name}
        type={type}
        required={required}
        defaultValue={defaultValue}
        className="focus-ring mt-1 w-full rounded-control border border-border bg-surface px-3 py-2 text-sm"
      />
      {hint && <span className="mt-1 block text-xs text-muted">{hint}</span>}
    </label>
  );
}

function TextArea({ label, name, defaultValue, rows }: { label: string; name: string; defaultValue?: string; rows: number }) {
  return (
    <label className="block text-sm">
      {label}
      <textarea name={name} rows={rows} defaultValue={defaultValue} className="focus-ring mt-1 w-full rounded-control border border-border bg-surface px-3 py-2 text-sm" />
    </label>
  );
}
