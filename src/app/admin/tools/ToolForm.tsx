"use client";

import { useFormState, useFormStatus } from "react-dom";
import { Button } from "@/components/Button";

interface CategoryOption { id: string; name: string; }
interface ToolFormValues {
  name?: string;
  slug?: string;
  description?: string;
  category_id?: string;
  icon?: string;
  keywords?: string[];
  status?: string;
  is_popular?: boolean;
  is_new?: boolean;
  is_offline?: boolean;
  is_paid?: boolean;
  seo_title?: string;
  seo_description?: string;
  sort_order?: number;
}

export function ToolForm({
  action,
  categories,
  initialValues,
  submitLabel,
}: {
  action: (state: { error?: string }, formData: FormData) => Promise<{ error?: string }>;
  categories: CategoryOption[];
  initialValues?: ToolFormValues;
  submitLabel: string;
}) {
  const [state, formAction] = useFormState(action, {});

  return (
    <form action={formAction} className="max-w-2xl space-y-4">
      {state?.error && (
        <p className="rounded-control border border-danger/30 bg-danger/10 p-3 text-sm text-danger">{state.error}</p>
      )}

      <div className="grid grid-cols-2 gap-4">
        <Field label="Name" name="name" defaultValue={initialValues?.name} required />
        <Field label="Slug" name="slug" defaultValue={initialValues?.slug} required hint="Used in the URL: /tools/your-slug" />
      </div>

      <TextArea label="Description" name="description" defaultValue={initialValues?.description} rows={2} />

      <div className="grid grid-cols-2 gap-4">
        <label className="block text-sm">
          Category
          <select
            name="category_id"
            defaultValue={initialValues?.category_id}
            className="focus-ring mt-1 w-full rounded-control border border-border bg-surface px-3 py-2 text-sm"
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </label>

        <Field
          label="Icon (lucide-react name)"
          name="icon"
          defaultValue={initialValues?.icon || "Wrench"}
          hint="e.g. Crop, FileText, QrCode"
        />
      </div>

      <Field
        label="Keywords (comma separated)"
        name="keywords"
        defaultValue={initialValues?.keywords?.join(", ")}
      />

      <div className="grid grid-cols-2 gap-4">
        <label className="block text-sm">
          Status
          <select
            name="status"
            defaultValue={initialValues?.status || "active"}
            className="focus-ring mt-1 w-full rounded-control border border-border bg-surface px-3 py-2 text-sm"
          >
            <option value="active">Active</option>
            <option value="coming_soon">Coming soon</option>
            <option value="disabled">Disabled</option>
          </select>
        </label>
        <Field label="Sort order" name="sort_order" type="number" defaultValue={String(initialValues?.sort_order ?? 0)} />
      </div>

      <div className="flex flex-wrap gap-4 text-sm">
        <Checkbox label="Popular" name="is_popular" defaultChecked={initialValues?.is_popular} />
        <Checkbox label="New" name="is_new" defaultChecked={initialValues?.is_new} />
        <Checkbox label="Processed in browser (offline)" name="is_offline" defaultChecked={initialValues?.is_offline} />
        <Checkbox label="Pro / paid" name="is_paid" defaultChecked={initialValues?.is_paid} />
      </div>

      <Field label="SEO title" name="seo_title" defaultValue={initialValues?.seo_title} />
      <TextArea label="SEO description" name="seo_description" defaultValue={initialValues?.seo_description} rows={2} />

      <SubmitButton label={submitLabel} />

      <p className="text-xs text-muted">
        Note: a tool's actual working functionality is written in code (in <code>src/components/tools/</code>) and
        registered in <code>src/app/tools/[slug]/page.tsx</code>. Adding a tool here makes it appear on the site with
        this metadata; until its component is registered, it will show "Coming soon" to visitors regardless of the
        status set here.
      </p>
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

function Checkbox({ label, name, defaultChecked }: { label: string; name: string; defaultChecked?: boolean }) {
  return (
    <label className="flex items-center gap-2">
      <input type="checkbox" name={name} defaultChecked={defaultChecked} />
      {label}
    </label>
  );
}
