"use client";

import { useFormState, useFormStatus } from "react-dom";
import { Button } from "@/components/Button";

interface CategoryFormValues {
  name?: string;
  slug?: string;
  description?: string;
  icon?: string;
  sort_order?: number;
  enabled?: boolean;
}

export function CategoryForm({
  action,
  initialValues,
  submitLabel,
}: {
  action: (state: { error?: string }, formData: FormData) => Promise<{ error?: string }>;
  initialValues?: CategoryFormValues;
  submitLabel: string;
}) {
  const [state, formAction] = useFormState(action, {});

  return (
    <form action={formAction} className="max-w-lg space-y-4">
      {state?.error && (
        <p className="rounded-control border border-danger/30 bg-danger/10 p-3 text-sm text-danger">{state.error}</p>
      )}

      <Field label="Name" name="name" defaultValue={initialValues?.name} required />
      <Field label="Slug" name="slug" defaultValue={initialValues?.slug} required hint="Used in the URL: /tools?category=your-slug" />
      <TextArea label="Description" name="description" defaultValue={initialValues?.description} rows={2} />
      <Field label="Icon (lucide-react name)" name="icon" defaultValue={initialValues?.icon || "Wrench"} hint="e.g. ImageIcon, FileText, Wrench" />
      <Field label="Sort order" name="sort_order" type="number" defaultValue={String(initialValues?.sort_order ?? 0)} />

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="enabled" defaultChecked={initialValues?.enabled ?? true} />
        Visible on the site
      </label>

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

function TextArea({
  label, name, defaultValue, rows,
}: { label: string; name: string; defaultValue?: string; rows: number }) {
  return (
    <label className="block text-sm">
      {label}
      <textarea
        name={name}
        rows={rows}
        defaultValue={defaultValue}
        className="focus-ring mt-1 w-full rounded-control border border-border bg-surface px-3 py-2 text-sm"
      />
    </label>
  );
}
