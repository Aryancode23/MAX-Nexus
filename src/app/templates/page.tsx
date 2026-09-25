import Link from "next/link";
import { Layers } from "lucide-react";
import { getPublishedTemplates } from "@/lib/templates-data";

export const metadata = { title: "Templates" };
export const dynamic = "force-dynamic";

export default async function TemplatesPage() {
  const templates = await getPublishedTemplates();

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <h1 className="text-2xl font-bold text-text">MAX Templates</h1>
      <p className="mt-1 text-muted">Ready-made starting points for resumes, certificates, ID cards and more.</p>

      {templates.length === 0 ? (
        <div className="mt-8 flex flex-col items-center gap-2 rounded-card border border-dashed border-border p-10 text-center text-muted">
          <Layers size={24} />
          <p>No templates published yet — check back soon.</p>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {templates.map((t: any) => (
            <div key={t.id} className="overflow-hidden rounded-card border border-border bg-surface shadow-soft">
              <div className="flex h-32 items-center justify-center bg-surface-2">
                {t.preview_image_url ? (
                  <img src={t.preview_image_url} alt={t.name} className="h-full w-full object-cover" />
                ) : (
                  <Layers size={24} className="text-muted" />
                )}
              </div>
              <div className="p-3">
                <p className="text-xs font-medium uppercase text-primary">{t.category}</p>
                <p className="mt-0.5 text-sm font-semibold text-text">{t.name}</p>
                {t.description && <p className="mt-1 text-xs text-muted line-clamp-2">{t.description}</p>}
                {t.target_tool_slug && (
                  <Link href={`/tools/${t.target_tool_slug}`} className="mt-2 inline-block text-xs font-medium text-primary hover:underline">
                    Use this template →
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
