"use client";

import { useState } from "react";
import { Download, RefreshCw } from "lucide-react";
import { FileDropZone } from "./FileDropZone";
import { Button } from "@/components/Button";

const PRESETS = [
  { label: "20 KB", kb: 20 },
  { label: "50 KB", kb: 50 },
  { label: "100 KB", kb: 100 },
];

export function SignatureResizerTool() {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [width, setWidth] = useState(300);
  const [height, setHeight] = useState(100);
  const [targetKb, setTargetKb] = useState(20);
  const [result, setResult] = useState<{ url: string; sizeKb: number } | null>(null);
  const [status, setStatus] = useState<"idle" | "processing" | "error">("idle");

  function loadFile(files: File[]) {
    const file = files[0];
    if (!file) return;
    const img = new Image();
    img.onload = () => {
      setImage(img);
      setResult(null);
    };
    img.onerror = () => setStatus("error");
    img.src = URL.createObjectURL(file);
  }

  async function process() {
    if (!image) return;
    setStatus("processing");
    try {
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("no context");
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(image, 0, 0, width, height);

      // Binary-search JPEG quality to hit the target file size.
      let low = 0.05;
      let high = 0.95;
      let best: Blob | null = null;

      for (let i = 0; i < 8; i++) {
        const mid = (low + high) / 2;
        const blob: Blob = await new Promise((resolve) =>
          canvas.toBlob((b) => resolve(b as Blob), "image/jpeg", mid)
        );
        const sizeKb = blob.size / 1024;
        if (sizeKb > targetKb) {
          high = mid;
        } else {
          best = blob;
          low = mid;
        }
      }

      if (!best) {
        best = await new Promise((resolve) =>
          canvas.toBlob((b) => resolve(b as Blob), "image/jpeg", 0.05)
        );
      }

      if (!best) throw new Error("compression failed");

      setResult({ url: URL.createObjectURL(best), sizeKb: Math.round(best.size / 1024) });
      setStatus("idle");
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="space-y-6">
      {!image && (
        <FileDropZone
          accept="image/*"
          onFiles={loadFile}
          allowCamera
          label="Click to upload or drag and drop your signature"
          hint="Works best with a clear scan or photo on a light background"
        />
      )}

      {image && (
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-card border border-border bg-white p-4">
            <img src={image.src} alt="Signature preview" className="mx-auto max-h-40 object-contain" />
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <label className="text-sm">
                Width (px)
                <input
                  type="number"
                  value={width}
                  onChange={(e) => setWidth(Number(e.target.value))}
                  className="focus-ring mt-1 w-full rounded-control border border-border bg-surface px-3 py-2 text-sm"
                />
              </label>
              <label className="text-sm">
                Height (px)
                <input
                  type="number"
                  value={height}
                  onChange={(e) => setHeight(Number(e.target.value))}
                  className="focus-ring mt-1 w-full rounded-control border border-border bg-surface px-3 py-2 text-sm"
                />
              </label>
            </div>

            <div>
              <p className="text-sm">Target file size</p>
              <div className="mt-1 flex flex-wrap gap-2">
                {PRESETS.map((p) => (
                  <button
                    key={p.kb}
                    onClick={() => setTargetKb(p.kb)}
                    className={`rounded-full border border-border px-3 py-1.5 text-sm ${
                      targetKb === p.kb ? "bg-primary text-primary-foreground" : "bg-surface text-muted"
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
                <input
                  type="number"
                  value={targetKb}
                  onChange={(e) => setTargetKb(Number(e.target.value))}
                  className="focus-ring w-24 rounded-control border border-border bg-surface px-3 py-1.5 text-sm"
                />
              </div>
            </div>

            {status === "error" && (
              <p className="text-sm text-danger">Something went wrong while processing this signature. Try another file.</p>
            )}

            <div className="flex gap-3">
              <Button onClick={process} disabled={status === "processing"}>
                <RefreshCw size={16} className={status === "processing" ? "animate-spin" : ""} />
                Resize signature
              </Button>
              <Button variant="secondary" onClick={() => { setImage(null); setResult(null); }}>
                Choose another
              </Button>
            </div>

            {result && (
              <div className="rounded-control border border-border bg-surface-2 p-3">
                <p className="text-sm text-muted">Result size: ~{result.sizeKb} KB</p>
                <a href={result.url} download="signature.jpg">
                  <Button variant="secondary" className="mt-2 w-full">
                    <Download size={16} /> Download signature
                  </Button>
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
