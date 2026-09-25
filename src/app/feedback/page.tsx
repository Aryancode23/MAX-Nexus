"use client";
import { useFormState, useFormStatus } from "react-dom";
import { MessageSquarePlus, Check } from "lucide-react";
import { Button } from "@/components/Button";
import { submitFeedback } from "@/lib/feedback-data";

export default function FeedbackPage() {
  const [state, formAction] = useFormState(submitFeedback, {});

  return (
    <div className="mx-auto max-w-lg px-4 py-16 sm:px-6">
      <div className="flex flex-col items-center gap-2 text-center">
        <span className="flex h-10 w-10 items-center justify-center rounded-control bg-primary/10 text-primary"><MessageSquarePlus size={20} /></span>
        <h1 className="text-2xl font-bold text-text">Suggest a tool or report a problem</h1>
        <p className="text-sm text-muted">Tell us what you needed and couldn't find, or what didn't work — this goes straight to the team.</p>
      </div>

      {state?.success ? (
        <div className="mt-8 flex flex-col items-center gap-2 rounded-card border border-success/30 bg-success/10 p-6 text-center">
          <Check size={24} className="text-success" />
          <p className="text-sm font-medium text-success">Thanks — we got it.</p>
        </div>
      ) : (
        <form action={formAction} className="mt-8 space-y-4">
          <input type="hidden" name="page_url" value={typeof window !== "undefined" ? window.location.href : ""} />
          <label className="block text-sm">Type
            <select name="type" className="focus-ring mt-1 w-full rounded-control border border-border bg-surface px-3 py-2 text-sm">
              <option value="suggestion">Suggest a tool</option>
              <option value="bug">Report a problem</option>
              <option value="other">Something else</option>
            </select>
          </label>
          <label className="block text-sm">Message
            <textarea name="message" required rows={5} className="focus-ring mt-1 w-full rounded-control border border-border bg-surface px-3 py-2 text-sm" />
          </label>
          <label className="block text-sm">Email (optional, if you want a reply)
            <input name="email" type="email" className="focus-ring mt-1 w-full rounded-control border border-border bg-surface px-3 py-2 text-sm" />
          </label>
          {state?.error && <p className="text-sm text-danger">{state.error}</p>}
          <SubmitButton />
        </form>
      )}
    </div>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return <Button type="submit" className="w-full" disabled={pending}>{pending ? "Sending…" : "Send"}</Button>;
}
