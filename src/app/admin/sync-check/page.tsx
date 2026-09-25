import { CheckCircle2, AlertTriangle, XCircle } from "lucide-react";
import { getAllToolsForAdmin } from "@/lib/tools-data";
import { REGISTERED_TOOL_SLUGS } from "@/lib/registered-tools";
import { Badge } from "@/components/Badge";

export const dynamic = "force-dynamic";

export default async function SyncCheckPage() {
  const { data: tools, error } = await getAllToolsForAdmin();

  const dbSlugs = new Set(tools.map((t: any) => t.slug));
  const codeSlugs = new Set(REGISTERED_TOOL_SLUGS);

  // In the database (so visitors see a real tool card) but no component
  // registered in code — this is exactly what showed "Coming soon" for
  // Employee ID Card Studio when the deployed code was out of sync with
  // the database.
  const missingInCode = tools.filter((t: any) => t.status !== "disabled" && !codeSlugs.has(t.slug));

  // A real, working component exists in code, but no database row — the
  // tool is built but invisible; nobody can find or open it.
  const missingInDb = REGISTERED_TOOL_SLUGS.filter((slug) => !dbSlugs.has(slug));

  const allSynced = missingInCode.length === 0 && missingInDb.length === 0;

  return (
    <div>
      <h1 className="text-xl font-bold text-text">Database ⇄ Code Sync Check</h1>
      <p className="mt-1 text-sm text-muted">
        Compares every tool row in the database against every component actually registered in the deployed
        code. A mismatch here is exactly what makes a tool show "Coming soon" despite having a real, working
        page — usually because a code deploy and a database seed happened out of step with each other.
      </p>

      {error && <p className="mt-4 text-sm text-danger">Couldn't load tools ({error.message}).</p>}

      {allSynced && !error && (
        <div className="mt-6 flex items-center gap-2 rounded-card border border-success/30 bg-success/10 p-4">
          <CheckCircle2 size={20} className="text-success" />
          <p className="text-sm font-medium text-success">Everything's in sync — {tools.length} database rows, {REGISTERED_TOOL_SLUGS.length} registered components, no mismatches.</p>
        </div>
      )}

      {missingInCode.length > 0 && (
        <div className="mt-6">
          <div className="flex items-center gap-2">
            <XCircle size={18} className="text-danger" />
            <p className="text-sm font-semibold text-text">In the database, but no component in code ({missingInCode.length})</p>
          </div>
          <p className="mt-1 text-xs text-muted">These show "Coming soon" to visitors right now. Fix: deploy the code that registers them, or check the deployment actually includes the latest registry file.</p>
          <div className="mt-2 space-y-1">
            {missingInCode.map((t: any) => (
              <div key={t.slug} className="flex items-center justify-between rounded-control border border-border bg-surface px-3 py-2 text-sm">
                <span className="text-text">{t.name}</span>
                <Badge tone="danger">{t.slug}</Badge>
              </div>
            ))}
          </div>
        </div>
      )}

      {missingInDb.length > 0 && (
        <div className="mt-6">
          <div className="flex items-center gap-2">
            <AlertTriangle size={18} className="text-warning" />
            <p className="text-sm font-semibold text-text">Working in code, but no database row ({missingInDb.length})</p>
          </div>
          <p className="mt-1 text-xs text-muted">These tools are built and would work, but nobody can find them — there's no row for them to appear as. Fix: re-run seed.sql, or add the tool manually in Admin → Tools.</p>
          <div className="mt-2 space-y-1">
            {missingInDb.map((slug) => (
              <div key={slug} className="flex items-center justify-between rounded-control border border-border bg-surface px-3 py-2 text-sm">
                <Badge tone="warning">{slug}</Badge>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
