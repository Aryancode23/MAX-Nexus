import { getPublishedFaqs } from "@/lib/faqs-data";
import { FaqAccordion } from "@/components/FaqAccordion";
import { JsonLd } from "@/components/JsonLd";

export const metadata = { title: "FAQs" };
export const dynamic = "force-dynamic";

export default async function FaqPage() {
  const faqs = await getPublishedFaqs();

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      {faqs.length > 0 && (
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: faqs.map((f: any) => ({
              "@type": "Question",
              name: f.question,
              acceptedAnswer: { "@type": "Answer", text: f.answer },
            })),
          }}
        />
      )}
      <h1 className="text-2xl font-bold text-text">Frequently Asked Questions</h1>
      {faqs.length === 0 ? (
        <p className="mt-8 text-muted">No FAQs published yet.</p>
      ) : (
        <div className="mt-8">
          <FaqAccordion faqs={faqs} />
        </div>
      )}
    </div>
  );
}
