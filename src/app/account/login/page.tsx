"use client";
import { useFormState, useFormStatus } from "react-dom";
import Link from "next/link";
import { LogIn } from "lucide-react";
import { Button } from "@/components/Button";
import { logInAction } from "../actions";
import { getFavorites, getRecent } from "@/lib/localFavorites";

export default function AccountLoginPage() {
  const [state, formAction] = useFormState(logInAction, {});

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-sm flex-col justify-center px-4">
      <div className="rounded-card border border-border bg-surface p-8 shadow-soft">
        <div className="mb-6 flex flex-col items-center gap-2 text-center">
          <span className="flex h-10 w-10 items-center justify-center rounded-control bg-primary/10 text-primary"><LogIn size={18} /></span>
          <h1 className="text-lg font-semibold text-text">Log in</h1>
          <p className="text-sm text-muted">Your Favorites and Recent tools, on every device.</p>
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
            <input type="password" name="password" required autoComplete="current-password" className="focus-ring mt-1 w-full rounded-control border border-border bg-surface-2 px-3 py-2 text-sm" />
          </label>
          {state?.error && <p className="text-sm text-danger">{state.error}</p>}
          <SubmitButton />
        </form>
      </div>
      <p className="mt-4 text-center text-sm text-muted">
        No account? <Link href="/account/signup" className="text-primary hover:underline">Sign up</Link>
      </p>
    </div>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return <Button type="submit" className="w-full" disabled={pending}>{pending ? "Logging in…" : "Log in"}</Button>;
}
