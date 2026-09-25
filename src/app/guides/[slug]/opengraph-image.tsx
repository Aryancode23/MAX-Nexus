import { ImageResponse } from "next/og";
import { getPublishedGuideBySlug } from "@/lib/guides-data";
import { SITE_NAME } from "@/lib/site";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({ params }: { params: { slug: string } }) {
  const guide = await getPublishedGuideBySlug(params.slug);
  const title = guide?.title ?? SITE_NAME;
  const category = guide?.category ?? "Guide";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background: "linear-gradient(135deg, #0a0a0e 0%, #1a1a2e 100%)",
          color: "#fff",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 24, color: "#818cf8", textTransform: "uppercase", letterSpacing: 2 }}>
          {category}
        </div>
        <div style={{ display: "flex", marginTop: 24, fontSize: 56, fontWeight: 700, lineHeight: 1.15, maxWidth: 1000 }}>{title}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 40, fontSize: 24, color: "#a5a5b5" }}>
          <div style={{ display: "flex", width: 32, height: 32, borderRadius: 8, background: "#4f46e5", alignItems: "center", justifyContent: "center", fontSize: 18 }}>✦</div>
          {SITE_NAME} Guides
        </div>
      </div>
    ),
    { ...size }
  );
}
