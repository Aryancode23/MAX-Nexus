"use client";

import { useState } from "react";
import { Download, AlertTriangle } from "lucide-react";
import { FileDropZone } from "./FileDropZone";
import { Button } from "@/components/Button";

const LEVELS = [
  { label: "Light", scale: 2.0, quality: 0.85 },
  { label: "Medium", scale: 1.4, quality: 0.65 },
  { label: "Strong", scale: 1.0, quality: 0.45 },
];

export function PdfCompressorTool() {
  const [file, setFile] = useState<File | null>(null);
  const [level, setLevel] = useState(LEVELS[1]);
  const [result, setResult] = useState<{ url: string; sizeKb: number } | null>(null);
  const [status, setStatus] = useState<"idle" | "processing" | "error">("idle");
  const [progress, setProgress] = useState<string | null>(null);

  function loadFile(files: File[]) {
    const f = files[0];
    if (!f) return;
    setFile(f);
    setResult(null);
  }

  async function compress() {
    if (!file) return;
    setStatus("processing");
    setProgress("Loading PDF…");
    try {
      const pdfjsLib = await import("pdfjs-dist");
      pdfjsLib.GlobalWorkerOptions.workerSrc =
        "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

      const { jsPDF } = await import("jspdf");

      const bytes = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: bytes }).promise;
      let doc: any = null;

      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        setProgress(`Processing page ${pageNum} of ${pdf.numPages}…`);
        const page = await pdf.getPage(pageNum);
        const viewport = page.getViewport({ scale: level.scale });

        const canvas = document.createElement("canvas");
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("no context");
        await page.render({ canvasContext: ctx, viewport }).promise;

        const dataUrl = canvas.toDataURL("image/jpeg", level.quality);
        const widthPt = viewport.width / level.scale;
        const heightPt = viewport.height / level.scale;

        if (!doc) {
          doc = new jsPDF({
            unit: "pt",
            format: [widthPt, heightPt],
            orientation: widthPt > heightPt ? "landscape" : "portrait",
          });
        } else {
          doc.addPage([widthPt, heightPt], widthPt > heightPt ? "landscape" : "portrait");
        }
        doc.addImage(dataUrl, "JPEG", 0, 0, widthPt, heightPt);
      }

      setProgress("Preparing download…");
      const blob = doc.output("blob");
      setResult({ url: URL.createObjectURL(blob), sizeKb: Math.round(blob.size / 1024) });
      setStatus("idle");
      setProgress(null);
    } catch {
      setStatus("error");
      setProgress(null);
    }
  }

  const originalKb = file ? Math.round(file.size / 1024) : 0;

  return (
    <div className="space-y-6">
      <div className="flex gap-2 rounded-control border border-warning/30 bg-warning/10 p-3 text-sm text-warning">
        <AlertTriangle size={16} className="mt-0.5 shrink-0" />
        <p>
          This compressor works by converting each page to a compressed image. It shrinks file size well, but text
          in the output will no longer be selectable or searchable — best for PDFs you mainly need to share or print.
        </p>
      </div>

      {!file && (
        <FileDropZone accept="application/pdf" onFiles={loadFile} label="Click to upload or drag and drop a PDF" />
      )}

      {file && (
        <div className="space-y-4">
          <p className="text-sm text-muted">{file.name} — {originalKb} KB</p>

          <div>
            <p className="text-sm">Compression level</p>
            <div className="mt-1 flex gap-2">
              {LEVELS.map((l) => (
                <button
                  key={l.label}
                  onClick={() => setLevel(l)}
                  className={`rounded-full border border-border px-3 py-1.5 text-sm ${
                    level.label === l.label ? "bg-primary text-primary-foreground" : "bg-surface text-muted"
                  }`}
                >
                  {l.label}
                </button>
              ))}
            </div>
          </div>

          {status === "error" && (
            <p className="text-sm text-danger">Something went wrong while compressing this PDF. Try another file.</p>
          )}
          {progress && <p className="text-sm text-muted">{progress}</p>}

          <div className="flex flex-wrap gap-3">
            <Button onClick={compress} disabled={status === "processing"}>
              {status === "processing" ? "Compressing…" : "Compress PDF"}
            </Button>
            <Button variant="secondary" onClick={() => { setFile(null); setResult(null); }}>
              Choose another
            </Button>
          </div>

          {result && (
            <div className="rounded-control border border-border bg-surface-2 p-3">
              <p className="text-sm text-muted">
                Result: {result.sizeKb} KB
                {originalKb > 0 && ` (${Math.round((1 - result.sizeKb / originalKb) * 100)}% smaller)`}
              </p>
              <a href={result.url} download={`compressed-${file.name}`}>
                <Button variant="secondary" className="mt-2 w-full">
                  <Download size={16} /> Download compressed PDF
                </Button>
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
