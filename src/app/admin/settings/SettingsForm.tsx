"use client";
import { useFormState, useFormStatus } from "react-dom";
import { Button } from "@/components/Button";
import type { SiteSettings } from "@/lib/settings-data";
import { updateSettings } from "./actions";

export function SettingsForm({ initial }: { initial: SiteSettings }) {
  const [state, formAction] = useFormState(updateSettings, {});

  return (
    <form action={formAction} className="max-w-xl space-y-4">
      {state?.success && <p className="rounded-control border border-success/30 bg-success/10 p-3 text-sm text-success">Saved.</p>}
      {state?.error && <p className="rounded-control border border-danger/30 bg-danger/10 p-3 text-sm text-danger">{state.error}</p>}

      <Field label="Site name" name="site_name" defaultValue={initial.site_name} />
      <Field label="Contact phone" name="contact_phone" defaultValue={initial.contact_phone} />
      <Field label="Developer support phone" name="developer_support_phone" defaultValue={initial.developer_support_phone} />
      <Field label="Instagram URL" name="instagram_url" defaultValue={initial.instagram_url} />
      <Field label="Default SEO title" name="default_seo_title" defaultValue={initial.default_seo_title} />
      <TextArea label="Default SEO description" name="default_seo_description" defaultValue={initial.default_seo_description} />

      <SubmitButton />
    </form>
  );
}

function Field({ label, name, defaultValue }: { label: string; name: string; defaultValue: string }) {
  return (
    <label className="block text-sm">
      {label}
      <input name={name} defaultValue={defaultValue} className="focus-ring mt-1 w-full rounded-control border border-border bg-surface px-3 py-2 text-sm" />
    </label>
  );
}
function TextArea({ label, name, defaultValue }: { label: string; name: string; defaultValue: string }) {
  return (
    <label className="block text-sm">
      {label}
      <textarea name={name} rows={2} defaultValue={defaultValue} className="focus-ring mt-1 w-full rounded-control border border-border bg-surface px-3 py-2 text-sm" />
    </label>
  );
}
function SubmitButton() {
  const { pending } = useFormStatus();
  return <Button type="submit" disabled={pending}>{pending ? "Saving…" : "Save settings"}</Button>;
}
