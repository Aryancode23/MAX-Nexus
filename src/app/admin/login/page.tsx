"use client";

import { useFormState, useFormStatus } from "react-dom";
import { Lock, ShieldCheck } from "lucide-react";
import { Button } from "@/components/Button";
import { signIn } from "./actions";

export default function AdminLoginPage() {
  const [state, formAction] = useFormState(signIn, {});
  const mfaStep = !!state?.mfaRequired;

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-sm flex-col justify-center px-4">
      <div className="rounded-card border border-border bg-surface p-8 shadow-soft">
        <div className="mb-6 flex flex-col items-center gap-2 text-center">
          <span className="flex h-10 w-10 items-center justify-center rounded-control bg-primary/10 text-primary">
            {mfaStep ? <ShieldCheck size={18} /> : <Lock size={18} />}
          </span>
          <h1 className="text-lg font-semibold text-text">{mfaStep ? "Verify it's you" : "Admin sign in"}</h1>
          <p className="text-sm text-muted">{mfaStep ? "Enter the 6-digit code from your authenticator app" : "MAX Nexus administration"}</p>
        </div>

        <form action={formAction} className="space-y-4">
          {!mfaStep ? (
            <>
              <label className="block text-sm">
                Email
                <input type="email" name="email" required autoComplete="username" defaultValue={state?.email}
                  className="focus-ring mt-1 w-full rounded-control border border-border bg-surface-2 px-3 py-2 text-sm" />
              </label>
              <label className="block text-sm">
                Password
                <input type="password" name="password" required autoComplete="current-password" defaultValue={state?.password}
                  className="focus-ring mt-1 w-full rounded-control border border-border bg-surface-2 px-3 py-2 text-sm" />
              </label>
            </>
          ) : (
            <>
              {/* Carried over silently so the same action can complete the sign-in */}
              <input type="hidden" name="email" defaultValue={state.email} />
              <input type="hidden" name="password" defaultValue={state.password} />
              <label className="block text-sm">
                6-digit code
                <input type="text" name="code" required autoFocus inputMode="numeric" pattern="[0-9]*" maxLength={6}
                  autoComplete="one-time-code"
                  className="focus-ring mt-1 w-full rounded-control border border-border bg-surface-2 px-3 py-2 text-center text-lg tracking-[0.3em]" />
              </label>
            </>
          )}

          {state?.error && <p className="text-sm text-danger">{state.error}</p>}

          <SubmitButton label={mfaStep ? "Verify" : "Sign in"} />
        </form>
      </div>

      <p className="mt-4 text-center text-xs text-muted">
        Accounts are created and promoted to admin from the Supabase dashboard, not from this page. After 5 failed
        attempts, sign-in is locked for 15 minutes.
      </p>
    </div>
  );
}

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return <Button type="submit" className="w-full" disabled={pending}>{pending ? "Please wait…" : label}</Button>;
}
