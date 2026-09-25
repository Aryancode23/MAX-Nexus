import { notFound } from "next/navigation";
import Link from "next/link";
import { Clock } from "lucide-react";
import { getPublicToolBySlug } from "@/lib/tools-data";
import { JsonLd } from "@/components/JsonLd";
import { SITE_URL } from "@/lib/site";
import { RecentlyUsedTracker } from "@/components/RecentlyUsedTracker";
import { FavoriteButton } from "@/components/FavoriteButton";
import { ToolUsageTracker } from "@/components/ToolUsageTracker";
import { TOOL_COMPONENTS } from "@/lib/registered-tools";

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const tool = await getPublicToolBySlug(params.slug);
  if (!tool) return {};
  return { title: tool.seoTitle, description: tool.seoDescription };
}

export default async function ToolPage({ params }: { params: { slug: string } }) {
  const tool = await getPublicToolBySlug(params.slug);
  if (!tool) notFound();

  const Component = TOOL_COMPONENTS[tool.slug];

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          name: tool.name,
          description: tool.shortDescription,
          url: `${SITE_URL}/tools/${tool.slug}`,
          applicationCategory: "UtilitiesApplication",
          operatingSystem: "Any (runs in a web browser)",
          offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
        }}
      />
      <RecentlyUsedTracker slug={tool.slug} />
      <ToolUsageTracker slug={tool.slug} />
      <nav className="mb-4 text-sm text-muted">
        <Link href="/tools" className="hover:text-text">Tools</Link> / {tool.name}
      </nav>

      <h1 className="flex items-center gap-2 text-2xl font-bold text-text">
        {tool.name}
        <FavoriteButton slug={tool.slug} />
      </h1>
      <p className="mt-1 text-muted">{tool.shortDescription}</p>

      <div className="mt-8">
        {tool.status === "coming_soon" || !Component ? (
          <div className="flex flex-col items-center gap-3 rounded-card border border-dashed border-border bg-surface p-12 text-center">
            <Clock size={28} className="text-muted" />
            <p className="font-medium text-text">This tool is coming soon.</p>
            <p className="text-sm text-muted">We're still building it — check back shortly.</p>
          </div>
        ) : (
          <Component />
        )}
      </div>
    </div>
  );
}
