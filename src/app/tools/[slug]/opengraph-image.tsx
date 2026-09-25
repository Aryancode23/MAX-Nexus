import { ImageResponse } from "next/og";
import { getPublicToolBySlug } from "@/lib/tools-data";
import { SITE_NAME } from "@/lib/site";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({ params }: { params: { slug: string } }) {
  const tool = await getPublicToolBySlug(params.slug);
  const title = tool?.name ?? SITE_NAME;
  const description = tool?.shortDescription ?? "";

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
        <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 28, color: "#818cf8" }}>
          <div style={{ display: "flex", width: 40, height: 40, borderRadius: 10, background: "#4f46e5", alignItems: "center", justifyContent: "center" }}>✦</div>
          {SITE_NAME}
        </div>
        <div style={{ display: "flex", marginTop: 40, fontSize: 56, fontWeight: 700, lineHeight: 1.15 }}>{title}</div>
        {description && (
          <div style={{ display: "flex", marginTop: 20, fontSize: 26, color: "#a5a5b5", maxWidth: 900 }}>{description}</div>
        )}
      </div>
    ),
    { ...size }
  );
}
