"use client";

import { useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { ShieldCheck, ShieldOff, Copy } from "lucide-react";
import { Button } from "@/components/Button";
import { enrollFactor, verifyEnrollment, unenrollFactor } from "./actions";

interface Factor { id: string; status: string; factor_type: string; }

export function SecurityManager({ initialFactors }: { initialFactors: Factor[] }) {
  const verifiedFactor = initialFactors.find((f) => f.status === "verified");
  const [enrolling, setEnrolling] = useState(false);
  const [enrollState, enrollAction] = useFormState(enrollFactor, {});
  const [verifyState, verifyAction] = useFormState(verifyEnrollment, {});

  if (verifyState.success) {
    return (
      <div className="rounded-card border border-success/30 bg-success/10 p-4 text-sm text-success">
        Two-factor authentication is now enabled. Refresh this page to see it reflected below.
      </div>
    );
  }

  if (verifiedFactor && !enrolling) {
    return (
      <div className="max-w-lg space-y-4">
        <div className="flex items-center gap-2 rounded-card border border-success/30 bg-success/10 p-4 text-sm text-success">
          <ShieldCheck size={18} /> Two-factor authentication is enabled on this account.
        </div>
        <form action={unenrollFactor.bind(null, verifiedFactor.id)}>
          <Button
            type="submit"
            variant="danger"
            onClick={(e) => { if (!confirm("Disable two-factor authentication? You'll only need your password to sign in.")) e.preventDefault(); }}
          >
            <ShieldOff size={16} /> Disable two-factor authentication
          </Button>
        </form>
      </div>
    );
  }

  const active = verifyState.factorId ? verifyState : enrollState;

  if (!active.factorId) {
    return (
      <div className="max-w-lg space-y-3">
        <p className="text-sm text-muted">
          Add an extra step to admin sign-in using any authenticator app (Google Authenticator, Authy, 1Password,
          etc.) — after entering your password, you'll also need a 6-digit code from your phone.
        </p>
        <form action={enrollAction}>
          <SubmitButton label="Set up two-factor authentication" />
        </form>
        {enrollState.error && <p className="text-sm text-danger">{enrollState.error}</p>}
      </div>
    );
  }

  return (
    <div className="max-w-lg space-y-5">
      <div>
        <p className="text-sm font-medium text-text">1. Scan this with your authenticator app</p>
        <div className="mt-2 inline-block rounded-card border border-border bg-white p-4">
          <img src={active.qrCode} alt="TOTP QR code" className="h-40 w-40" />
        </div>
        <div className="mt-2 flex items-center gap-2 text-xs text-muted">
          <span>Can't scan? Enter this key manually:</span>
          <code className="rounded bg-surface-2 px-1.5 py-0.5">{active.secret}</code>
          <button onClick={() => navigator.clipboard.writeText(active.secret || "")} className="text-muted hover:text-text"><Copy size={12} /></button>
        </div>
      </div>

      <form action={verifyAction} className="space-y-3">
        <input type="hidden" name="factorId" value={active.factorId} />
        <input type="hidden" name="qrCode" value={active.qrCode} />
        <input type="hidden" name="secret" value={active.secret} />
        <label className="block text-sm">
          2. Enter the 6-digit code it shows
          <input
            name="code" required autoFocus inputMode="numeric" maxLength={6}
            className="focus-ring mt-1 w-full max-w-[160px] rounded-control border border-border bg-surface px-3 py-2 text-center text-lg tracking-[0.3em]"
          />
        </label>
        {verifyState.error && <p className="text-sm text-danger">{verifyState.error}</p>}
        <SubmitButton label="Activate" />
      </form>
    </div>
  );
}

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return <Button type="submit" disabled={pending}>{pending ? "Please wait…" : label}</Button>;
}
