"use client";
import { useFormState, useFormStatus } from "react-dom";
import Link from "next/link";
import { UserPlus, Mail } from "lucide-react";
import { Button } from "@/components/Button";
import { signUpAction } from "../actions";
import { getFavorites, getRecent } from "@/lib/localFavorites";

export default function AccountSignupPage() {
  const [state, formAction] = useFormState(signUpAction, {});

  if (state?.success) {
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-sm flex-col items-center justify-center px-4 text-center">
        <Mail size={28} className="text-primary" />
        <h1 className="mt-3 text-lg font-semibold text-text">Check your email</h1>
        <p className="mt-1 text-sm text-muted">We sent a confirmation link — click it, then come back and log in.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-sm flex-col justify-center px-4">
      <div className="rounded-card border border-border bg-surface p-8 shadow-soft">
        <div className="mb-6 flex flex-col items-center gap-2 text-center">
          <span className="flex h-10 w-10 items-center justify-center rounded-control bg-primary/10 text-primary"><UserPlus size={18} /></span>
          <h1 className="text-lg font-semibold text-text">Create an account</h1>
          <p className="text-sm text-muted">Optional — every tool still works without one.</p>
        </div>

        <form
          action={(formData) => {
            formData.set("favorite_slugs", JSON.stringify(getFavorites()));
            formData.set("recent_slugs", JSON.stringify(getRecent()));
            formAction(formData);
          }}
          className="space-y-4"
        >
          <label className="block text-sm">Email
            <input type="email" name="email" required autoComplete="username" className="focus-ring mt-1 w-full rounded-control border border-border bg-surface-2 px-3 py-2 text-sm" />
          </label>
          <label className="block text-sm">Password
            <input type="password" name="password" required minLength={6} autoComplete="new-password" className="focus-ring mt-1 w-full rounded-control border border-border bg-surface-2 px-3 py-2 text-sm" />
          </label>
          {state?.error && <p className="text-sm text-danger">{state.error}</p>}
          <SubmitButton />
        </form>
      </div>
      <p className="mt-4 text-center text-sm text-muted">
        Already have an account? <Link href="/account/login" className="text-primary hover:underline">Log in</Link>
      </p>
    </div>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return <Button type="submit" className="w-full" disabled={pending}>{pending ? "Creating account…" : "Sign up"}</Button>;
}
