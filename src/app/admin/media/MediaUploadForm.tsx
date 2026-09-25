"use client";

import { useRef } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { UploadCloud } from "lucide-react";
import { Button } from "@/components/Button";
import { uploadMedia } from "./actions";

export function MediaUploadForm() {
  const [state, formAction] = useFormState(uploadMedia, {});
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form
      ref={formRef}
      action={async (formData) => {
        await formAction(formData);
        formRef.current?.reset();
      }}
      className="flex flex-wrap items-center gap-3 rounded-card border border-dashed border-border bg-surface-2 p-4"
    >
      <input type="file" name="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" required className="text-sm" />
      <SubmitButton />
      {state?.error && <p className="w-full text-sm text-danger">{state.error}</p>}
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return <Button type="submit" size="sm" disabled={pending}><UploadCloud size={14} /> {pending ? "Uploading…" : "Upload"}</Button>;
}
