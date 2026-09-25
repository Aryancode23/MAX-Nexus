"use client";
import { useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { Button } from "@/components/Button";

interface Values {
  name?: string; slug?: string; file_type?: string; width_px?: number; height_px?: number;
  formats?: string[]; max_size_kb?: number; max_pages?: number; page_size?: string;
  orientation?: string; notes?: string; status?: string; sort_order?: number;
}

export function PresetForm({
  action, initialValues, submitLabel,
}: {
  action: (state: { error?: string }, formData: FormData) => Promise<{ error?: string }>;
  initialValues?: Values; submitLabel: string;
}) {
  const [state, formAction] = useFormState(action, {});
  const [fileType, setFileType] = useState(initialValues?.file_type || "photo");

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

      <label className="block text-sm">File type
        <select name="file_type" value={fileType} onChange={(e) => setFileType(e.target.value)} className="focus-ring mt-1 w-full rounded-control border border-border bg-surface px-3 py-2 text-sm">
          <option value="photo">Photo</option>
          <option value="pdf">PDF</option>
        </select>
      </label>

      {fileType === "photo" ? (
        <div className="grid grid-cols-2 gap-4">
          <label className="block text-sm">Width (px)
            <input name="width_px" type="number" defaultValue={initialValues?.width_px} className="focus-ring mt-1 w-full rounded-control border border-border bg-surface px-3 py-2 text-sm" />
          </label>
          <label className="block text-sm">Height (px)
            <input name="height_px" type="number" defaultValue={initialValues?.height_px} className="focus-ring mt-1 w-full rounded-control border border-border bg-surface px-3 py-2 text-sm" />
          </label>
          <label className="block text-sm col-span-2">Allowed formats (comma separated)
            <input name="formats" defaultValue={initialValues?.formats?.join(", ") || "jpeg, jpg"} className="focus-ring mt-1 w-full rounded-control border border-border bg-surface px-3 py-2 text-sm" />
          </label>
          <label className="block text-sm col-span-2">Max size (KB)
            <input name="max_size_kb" type="number" defaultValue={initialValues?.max_size_kb} className="focus-ring mt-1 w-full rounded-control border border-border bg-surface px-3 py-2 text-sm" />
          </label>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          <label className="block text-sm">Max size (KB)
            <input name="max_size_kb" type="number" defaultValue={initialValues?.max_size_kb} className="focus-ring mt-1 w-full rounded-control border border-border bg-surface px-3 py-2 text-sm" />
          </label>
          <label className="block text-sm">Max pages
            <input name="max_pages" type="number" defaultValue={initialValues?.max_pages} className="focus-ring mt-1 w-full rounded-control border border-border bg-surface px-3 py-2 text-sm" />
          </label>
          <label className="block text-sm">Page size
            <select name="page_size" defaultValue={initialValues?.page_size || ""} className="focus-ring mt-1 w-full rounded-control border border-border bg-surface px-3 py-2 text-sm">
              <option value="">Any</option><option value="A4">A4</option><option value="A5">A5</option><option value="Letter">Letter</option>
            </select>
          </label>
          <label className="block text-sm">Orientation
            <select name="orientation" defaultValue={initialValues?.orientation || ""} className="focus-ring mt-1 w-full rounded-control border border-border bg-surface px-3 py-2 text-sm">
              <option value="">Any</option><option value="portrait">Portrait</option><option value="landscape">Landscape</option>
            </select>
          </label>
        </div>
      )}

      <label className="block text-sm">Notes
        <textarea name="notes" rows={2} defaultValue={initialValues?.notes} className="focus-ring mt-1 w-full rounded-control border border-border bg-surface px-3 py-2 text-sm" />
      </label>

      <div className="grid grid-cols-2 gap-4">
        <label className="block text-sm">Status
          <select name="status" defaultValue={initialValues?.status || "published"} className="focus-ring mt-1 w-full rounded-control border border-border bg-surface px-3 py-2 text-sm">
            <option value="published">Published</option><option value="draft">Draft</option>
          </select>
        </label>
        <label className="block text-sm">Sort order
          <input name="sort_order" type="number" defaultValue={String(initialValues?.sort_order ?? 0)} className="focus-ring mt-1 w-full rounded-control border border-border bg-surface px-3 py-2 text-sm" />
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
