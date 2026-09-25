import { createClient } from "@/lib/supabase/server";
import { SecurityManager } from "./SecurityManager";

export const dynamic = "force-dynamic";

export default async function AdminSecurityPage() {
  const supabase = createClient();
  const { data } = await supabase.auth.mfa.listFactors();
  const factors = data?.totp ?? [];

  return (
    <div>
      <h1 className="text-xl font-bold text-text">Security</h1>
      <p className="mt-1 text-sm text-muted">Two-factor authentication for your own admin account.</p>

      <div className="mt-6">
        <SecurityManager initialFactors={factors} />
      </div>
    </div>
  );
}
