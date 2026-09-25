import { notFound } from "next/navigation";
import Link from "next/link";
import { Clock, User, ArrowLeft } from "lucide-react";
import { getPublishedGuideBySlug } from "@/lib/guides-data";
import { JsonLd } from "@/components/JsonLd";
import { SITE_URL, SITE_NAME } from "@/lib/site";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const guide = await getPublishedGuideBySlug(params.slug);
  if (!guide) return {};
  return { title: guide.seo_title || guide.title, description: guide.seo_description };
}

/**
 * Renders guide content line-by-line into safe JSX (no dangerouslySetInnerHTML,
 * no arbitrary HTML execution) — supports a small, deliberately limited set of
 * conventions: "## " headings, "- " bullet lists, and blank-line paragraphs.
 */
function GuideContent({ content }: { content: string }) {
  const lines = content.split("\n");
  const blocks: React.ReactNode[] = [];
  let listBuffer: string[] = [];

  function flushList() {
    if (listBuffer.length > 0) {
      blocks.push(
        <ul key={blocks.length} className="my-3 list-disc space-y-1 pl-5 text-sm text-text">
          {listBuffer.map((item, i) => <li key={i}>{item}</li>)}
        </ul>
      );
      listBuffer = [];
    }
  }

  lines.forEach((line, i) => {
    const trimmed = line.trim();
    if (trimmed.startsWith("## ")) {
      flushList();
      blocks.push(<h2 key={i} className="mt-6 text-lg font-semibold text-text">{trimmed.slice(3)}</h2>);
    } else if (trimmed.startsWith("- ")) {
      listBuffer.push(trimmed.slice(2));
    } else if (trimmed === "") {
      flushList();
    } else {
      flushList();
      blocks.push(<p key={i} className="mt-3 text-sm leading-relaxed text-text">{trimmed}</p>);
    }
  });
  flushList();

  return <div>{blocks}</div>;
}

export default async function GuidePage({ params }: { params: { slug: string } }) {
  const guide = await getPublishedGuideBySlug(params.slug);
  if (!guide) notFound();

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: guide.title,
          description: guide.seo_description || undefined,
          author: { "@type": "Organization", name: guide.author || SITE_NAME },
          publisher: { "@type": "Organization", name: SITE_NAME },
          datePublished: guide.published_at || undefined,
          dateModified: guide.updated_at || guide.published_at || undefined,
          mainEntityOfPage: `${SITE_URL}/guides/${guide.slug}`,
        }}
      />
      <Link href="/guides" className="flex items-center gap-1 text-sm text-muted hover:text-text">
        <ArrowLeft size={14} /> All guides
      </Link>

      {guide.category && <p className="mt-4 text-xs font-medium uppercase tracking-wide text-primary">{guide.category}</p>}
      <h1 className="mt-1 text-2xl font-bold text-text">{guide.title}</h1>
      <div className="mt-2 flex items-center gap-3 text-xs text-muted">
        <span className="flex items-center gap-1"><User size={12} /> {guide.author}</span>
        <span className="flex items-center gap-1"><Clock size={12} /> {guide.reading_time} min read</span>
      </div>

      <div className="mt-6">
        <GuideContent content={guide.content} />
      </div>

      {guide.related_tool_slugs?.length > 0 && (
        <div className="mt-10 rounded-card border border-border bg-surface p-5">
          <p className="text-sm font-semibold text-text">Need to do this now?</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {guide.related_tool_slugs.map((slug: string) => (
              <Link key={slug} href={`/tools/${slug}`} className="rounded-full border border-border bg-surface-2 px-3 py-1.5 text-xs text-text hover:bg-primary hover:text-primary-foreground">
                Open tool →
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
