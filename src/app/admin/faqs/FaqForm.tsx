"use client";
import { useFormState, useFormStatus } from "react-dom";
import { Button } from "@/components/Button";

interface FaqFormValues {
  question?: string; answer?: string; category?: string;
  related_tool_slugs?: string[]; sort_order?: number; status?: string;
}

export function FaqForm({
  action, initialValues, submitLabel,
}: {
  action: (state: { error?: string }, formData: FormData) => Promise<{ error?: string }>;
  initialValues?: FaqFormValues; submitLabel: string;
}) {
  const [state, formAction] = useFormState(action, {});
  return (
    <form action={formAction} className="max-w-xl space-y-4">
      {state?.error && <p className="rounded-control border border-danger/30 bg-danger/10 p-3 text-sm text-danger">{state.error}</p>}
      <label className="block text-sm">Question
        <input name="question" required defaultValue={initialValues?.question} className="focus-ring mt-1 w-full rounded-control border border-border bg-surface px-3 py-2 text-sm" />
      </label>
      <label className="block text-sm">Answer
        <textarea name="answer" required rows={4} defaultValue={initialValues?.answer} className="focus-ring mt-1 w-full rounded-control border border-border bg-surface px-3 py-2 text-sm" />
      </label>
      <div className="grid grid-cols-2 gap-4">
        <label className="block text-sm">Category
          <input name="category" defaultValue={initialValues?.category || "General"} className="focus-ring mt-1 w-full rounded-control border border-border bg-surface px-3 py-2 text-sm" />
        </label>
        <label className="block text-sm">Sort order
          <input name="sort_order" type="number" defaultValue={String(initialValues?.sort_order ?? 0)} className="focus-ring mt-1 w-full rounded-control border border-border bg-surface px-3 py-2 text-sm" />
        </label>
      </div>
      <label className="block text-sm">Related tool slugs (comma separated)
        <input name="related_tool_slugs" defaultValue={initialValues?.related_tool_slugs?.join(", ")} className="focus-ring mt-1 w-full rounded-control border border-border bg-surface px-3 py-2 text-sm" />
      </label>
      <label className="block text-sm">Status
        <select name="status" defaultValue={initialValues?.status || "published"} className="focus-ring mt-1 w-full rounded-control border border-border bg-surface px-3 py-2 text-sm">
          <option value="published">Published</option>
          <option value="draft">Draft</option>
        </select>
      </label>
      <SubmitButton label={submitLabel} />
    </form>
  );
}

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return <Button type="submit" disabled={pending}>{pending ? "Saving…" : label}</Button>;
}
