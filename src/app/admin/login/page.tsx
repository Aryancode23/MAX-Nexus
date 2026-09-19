"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/Button";


export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });

    if (signInError) {
      // Never reveal whether the email exists or leak raw provider errors.
      setError("Invalid email or password.");
      setLoading(false);
      return;
    }

    // Middleware re-checks the role server-side before actually granting
    // access to anything under /admin — this redirect is just navigation.
    router.push("/admin");
    router.refresh();
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-sm flex-col justify-center px-4">
      <div className="rounded-card border border-border bg-surface p-8 shadow-soft">
        <div className="mb-6 flex flex-col items-center gap-2 text-center">
          <span className="flex h-10 w-10 items-center justify-center rounded-control bg-primary/10 text-primary">
            <Lock size={18} />
          </span>
          <h1 className="text-lg font-semibold text-text">Admin sign in</h1>
          <p className="text-sm text-muted">MAX Nexus administration</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block text-sm">
            Email
            <input
              type="email"
              required
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="focus-ring mt-1 w-full rounded-control border border-border bg-surface-2 px-3 py-2 text-sm"
            />
          </label>
          <label className="block text-sm">
            Password
            <input
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="focus-ring mt-1 w-full rounded-control border border-border bg-surface-2 px-3 py-2 text-sm"
            />
          </label>

          {error && <p className="text-sm text-danger">{error}</p>}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Signing in…" : "Sign in"}
          </Button>
        </form>
      </div>

      <p className="mt-4 text-center text-xs text-muted">
        Accounts are created and promoted to admin from the Supabase dashboard, not from this page.
      </p>
    </div>
  );
}
