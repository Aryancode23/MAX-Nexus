"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import { FileDropZone } from "./FileDropZone";
import { Button } from "@/components/Button";

export function ImageCompressorTool() {
  const [original, setOriginal] = useState<{ file: File; url: string } | null>(null);
  const [targetKb, setTargetKb] = useState(200);
  const [result, setResult] = useState<{ url: string; sizeKb: number } | null>(null);
  const [status, setStatus] = useState<"idle" | "processing" | "error">("idle");

  function loadFile(files: File[]) {
    const file = files[0];
    if (!file) return;
    setOriginal({ file, url: URL.createObjectURL(file) });
    setResult(null);
  }

  async function compress() {
    if (!original) return;
    setStatus("processing");
    try {
      const imageCompression = (await import("browser-image-compression")).default;
      const compressed = await imageCompression(original.file, {
        maxSizeMB: targetKb / 1024,
        maxWidthOrHeight: 4096,
        useWebWorker: true,
      });
      setResult({ url: URL.createObjectURL(compressed), sizeKb: Math.round(compressed.size / 1024) });
      setStatus("idle");
    } catch {
      setStatus("error");
    }
  }

  const originalKb = original ? Math.round(original.file.size / 1024) : 0;

  return (
    <div className="space-y-6">
      {!original && (
        <FileDropZone accept="image/*" onFiles={loadFile} label="Click to upload or drag and drop an image" />
      )}

      {original && (
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-card border border-border bg-surface-2 p-4">
            <img src={original.url} alt="Preview" className="mx-auto max-h-72 rounded-control object-contain" />
            <p className="mt-2 text-center text-sm text-muted">Original: {originalKb} KB</p>
          </div>

          <div className="space-y-4">
            <label className="block text-sm">
              Target size (max KB)
              <input
                type="number"
                value={targetKb}
                onChange={(e) => setTargetKb(Number(e.target.value))}
                className="focus-ring mt-1 w-full rounded-control border border-border bg-surface px-3 py-2 text-sm"
              />
            </label>

            {status === "error" && (
              <p className="text-sm text-danger">Something went wrong while compressing this image. Try another file.</p>
            )}

            <div className="flex gap-3">
              <Button onClick={compress} disabled={status === "processing"}>
                {status === "processing" ? "Compressing…" : "Compress"}
              </Button>
              <Button variant="secondary" onClick={() => { setOriginal(null); setResult(null); }}>
                Choose another
              </Button>
            </div>

            {result && (
              <div className="rounded-control border border-border bg-surface-2 p-3">
                <p className="text-sm text-muted">
                  Result: {result.sizeKb} KB
                  {originalKb > 0 && ` (${Math.round((1 - result.sizeKb / originalKb) * 100)}% smaller)`}
                </p>
                <a href={result.url} download={`compressed-${original.file.name}`}>
                  <Button variant="secondary" className="mt-2 w-full">
                    <Download size={16} /> Download compressed image
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
