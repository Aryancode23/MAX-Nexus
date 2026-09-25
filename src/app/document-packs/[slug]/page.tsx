import { notFound } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, Circle, ArrowRight } from "lucide-react";
import { getPublishedDocumentPackBySlug } from "@/lib/document-packs-data";
import { JsonLd } from "@/components/JsonLd";
import { SITE_URL } from "@/lib/site";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const pack = await getPublishedDocumentPackBySlug(params.slug);
  if (!pack) return {};
  return { title: pack.seo_title || pack.name, description: pack.seo_description || pack.description };
}

export default async function DocumentPackDetailPage({ params }: { params: { slug: string } }) {
  const pack = await getPublishedDocumentPackBySlug(params.slug);
  if (!pack) notFound();

  const required: string[] = pack.required_documents ?? [];
  const optional: string[] = pack.optional_documents ?? [];

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "HowTo",
          name: pack.name,
          description: pack.description,
          step: required.map((doc) => ({ "@type": "HowToStep", text: `Prepare: ${doc}` })),
          url: `${SITE_URL}/document-packs/${pack.slug}`,
        }}
      />

      <Link href="/document-packs" className="text-sm text-muted hover:text-text">← All document packs</Link>

      <h1 className="mt-3 text-2xl font-bold text-text">{pack.name}</h1>
      <p className="mt-1 text-muted">{pack.description}</p>

      {pack.disclaimer && (
        <p className="mt-4 rounded-control border border-warning/30 bg-warning/10 p-3 text-xs text-warning">{pack.disclaimer}</p>
      )}

      <div className="mt-6">
        <p className="text-sm font-semibold text-text">Required documents</p>
        <ul className="mt-2 space-y-1.5">
          {required.map((doc) => (
            <li key={doc} className="flex items-center gap-2 text-sm text-text"><CheckCircle2 size={14} className="text-primary" /> {doc}</li>
          ))}
        </ul>
      </div>

      {optional.length > 0 && (
        <div className="mt-6">
          <p className="text-sm font-semibold text-text">Optional documents</p>
          <ul className="mt-2 space-y-1.5">
            {optional.map((doc) => (
              <li key={doc} className="flex items-center gap-2 text-sm text-muted"><Circle size={14} /> {doc}</li>
            ))}
          </ul>
        </div>
      )}

      {(pack.recommended_formats || pack.recommended_max_size) && (
        <p className="mt-6 text-xs text-muted">
          {pack.recommended_formats && <>Recommended format: {pack.recommended_formats}. </>}
          {pack.recommended_max_size && <>Recommended size: {pack.recommended_max_size}.</>}
        </p>
      )}

      <Link href={`/tools/document-pack-builder?template=${pack.slug}`} className="mt-8 inline-block">
        <span className="focus-ring inline-flex items-center gap-2 rounded-control bg-primary px-5 py-3 text-sm font-medium text-primary-foreground hover:opacity-90">
          Start this Document Pack <ArrowRight size={16} />
        </span>
      </Link>
    </div>
  );
}
