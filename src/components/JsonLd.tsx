export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      // Structured data must be raw JSON in the page source for search
      // engines to read it — this is the one sanctioned use of
      // dangerouslySetInnerHTML here, and it only ever receives JSON we
      // constructed ourselves server-side, never raw user input.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
