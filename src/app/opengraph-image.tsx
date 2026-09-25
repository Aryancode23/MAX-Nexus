import { ImageResponse } from "next/og";
import { SITE_NAME } from "@/lib/site";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0a0a0e 0%, #1a1a2e 100%)",
          color: "#fff",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 20,
            fontSize: 64,
            fontWeight: 700,
          }}
        >
          <div
            style={{
              display: "flex",
              width: 80,
              height: 80,
              borderRadius: 20,
              background: "#4f46e5",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 44,
            }}
          >
            ✦
          </div>
          {SITE_NAME}
        </div>
        <div style={{ display: "flex", marginTop: 24, fontSize: 28, color: "#a5a5b5" }}>
          Everyday digital work, made simple
        </div>
      </div>
    ),
    { ...size }
  );
}
