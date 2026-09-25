"use client";
import { useState } from "react";
import { Download, X } from "lucide-react";
import { FileDropZone } from "./FileDropZone";
import { Button } from "@/components/Button";

interface QueueItem { file: File; status: "pending" | "done" | "error"; }

export function BulkImageProcessorTool() {
  const [items, setItems] = useState<QueueItem[]>([]);
  const [maxDimension, setMaxDimension] = useState(1600);
  const [quality, setQuality] = useState(0.8);
  const [processing, setProcessing] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [progress, setProgress] = useState("");

  function addFiles(files: File[]) {
    setItems((prev) => [...prev, ...files.map((file) => ({ file, status: "pending" as const }))]);
    setResultUrl(null);
  }
  function removeItem(i: number) { setItems((prev) => prev.filter((_, idx) => idx !== i)); }

  async function processAll() {
    if (items.length === 0) return;
    setProcessing(true);
    setResultUrl(null);
    try {
      const JSZip = (await import("jszip")).default;
      const zip = new JSZip();
      let successCount = 0;

      for (let i = 0; i < items.length; i++) {
        setProgress(`Processing ${i + 1} of ${items.length}…`);
        try {
          const blob = await resizeImage(items[i].file, maxDimension, quality);
          const name = items[i].file.name.replace(/\.[^.]+$/, "") + ".jpg";
          zip.file(name, blob);
          successCount++;
          setItems((prev) => prev.map((it, idx) => (idx === i ? { ...it, status: "done" } : it)));
        } catch {
          setItems((prev) => prev.map((it, idx) => (idx === i ? { ...it, status: "error" } : it)));
        }
      }

      if (successCount > 0) {
        const blob = await zip.generateAsync({ type: "blob" });
        setResultUrl(URL.createObjectURL(blob));
      }
    } finally {
      setProcessing(false);
      setProgress("");
    }
  }

  function resizeImage(file: File, maxDim: number, q: number): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          const scale = maxDim / Math.max(width, height);
          width = Math.round(width * scale);
          height = Math.round(height * scale);
        }
        const canvas = document.createElement("canvas");
        canvas.width = width; canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("no context"));
        ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("failed"))), "image/jpeg", q);
      };
      img.onerror = () => reject(new Error("load failed"));
      img.src = URL.createObjectURL(file);
    });
  }

  const doneCount = items.filter((i) => i.status === "done").length;
  const errorCount = items.filter((i) => i.status === "error").length;

  return (
    <div className="space-y-6">
      <FileDropZone accept="image/*" multiple onFiles={addFiles} label="Click to upload or drag and drop multiple images" hint="Add as many as you need" />

      {items.length > 0 && (
        <>
          <div className="grid grid-cols-2 gap-4 max-w-md">
            <label className="text-sm">Max dimension (px)
              <input type="number" value={maxDimension} onChange={(e) => setMaxDimension(Number(e.target.value))} className="focus-ring mt-1 w-full rounded-control border border-border bg-surface px-3 py-2 text-sm" />
            </label>
            <label className="text-sm">Quality ({Math.round(quality * 100)}%)
              <input type="range" min={0.3} max={1} step={0.05} value={quality} onChange={(e) => setQuality(Number(e.target.value))} className="mt-2 w-full" />
            </label>
          </div>

          <ul className="max-h-60 divide-y divide-border overflow-y-auto rounded-card border border-border bg-surface">
            {items.map((it, i) => (
              <li key={i} className="flex items-center justify-between px-3 py-2 text-sm">
                <span className="truncate">{it.file.name}</span>
                <div className="flex items-center gap-2">
                  {it.status === "done" && <span className="text-xs text-success">Done</span>}
                  {it.status === "error" && <span className="text-xs text-danger">Failed</span>}
                  <button onClick={() => removeItem(i)} className="text-muted hover:text-danger"><X size={14} /></button>
                </div>
              </li>
            ))}
          </ul>

          {progress && <p className="text-sm text-muted">{progress}</p>}
          {(doneCount > 0 || errorCount > 0) && !processing && (
            <p className="text-sm text-muted">{doneCount} processed successfully{errorCount > 0 && `, ${errorCount} failed`}</p>
          )}

          <div className="flex flex-wrap gap-3">
            <Button onClick={processAll} disabled={processing}>{processing ? "Processing…" : `Process ${items.length} images`}</Button>
            {resultUrl && <a href={resultUrl} download="processed-images.zip"><Button variant="secondary"><Download size={16} /> Download ZIP</Button></a>}
          </div>
        </>
      )}
    </div>
  );
}
