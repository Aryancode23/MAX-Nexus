"use client";
import { useState } from "react";
import { Download } from "lucide-react";
import { FileDropZone } from "./FileDropZone";
import { Button } from "@/components/Button";

export function PdfWatermarkTool() {
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState("CONFIDENTIAL");
  const [opacity, setOpacity] = useState(0.25);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "processing" | "error">("idle");

  async function apply() {
    if (!file) return;
    setStatus("processing");
    try {
      const { PDFDocument, rgb, degrees, StandardFonts } = await import("pdf-lib");
      const doc = await PDFDocument.load(await file.arrayBuffer());
      const font = await doc.embedFont(StandardFonts.HelveticaBold);
      for (const page of doc.getPages()) {
        const { width, height } = page.getSize();
        page.drawText(text, {
          x: width / 2 - font.widthOfTextAtSize(text, 48) / 2,
          y: height / 2,
          size: 48,
          font,
          color: rgb(0.5, 0.5, 0.5),
          opacity,
          rotate: degrees(45),
        });
      }
      const bytes = await doc.save();
      const blob = new Blob([bytes.buffer as ArrayBuffer], { type: "application/pdf" });
      setResultUrl(URL.createObjectURL(blob));
      setStatus("idle");
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="space-y-6">
      {!file && <FileDropZone accept="application/pdf" onFiles={(f) => { setFile(f[0]); setResultUrl(null); }} label="Click to upload or drag and drop a PDF" />}
      {file && (
        <div className="space-y-4">
          <p className="text-sm text-muted">{file.name}</p>
          <label className="block text-sm">Watermark text<input value={text} onChange={(e) => setText(e.target.value)} className="focus-ring mt-1 w-full rounded-control border border-border bg-surface px-3 py-2 text-sm" /></label>
          <label className="block text-sm">Opacity ({Math.round(opacity * 100)}%)<input type="range" min={0.05} max={0.6} step={0.05} value={opacity} onChange={(e) => setOpacity(Number(e.target.value))} className="mt-1 w-full" /></label>
          {status === "error" && <p className="text-sm text-danger">Something went wrong while adding the watermark.</p>}
          <div className="flex flex-wrap gap-3">
            <Button onClick={apply} disabled={status === "processing"}>{status === "processing" ? "Applying…" : "Add watermark"}</Button>
            <Button variant="secondary" onClick={() => { setFile(null); setResultUrl(null); }}>Choose another</Button>
          </div>
          {resultUrl && <a href={resultUrl} download="watermarked.pdf"><Button variant="secondary"><Download size={16} /> Download PDF</Button></a>}
        </div>
      )}
    </div>
  );
}
